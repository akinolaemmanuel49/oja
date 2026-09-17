"""
Customer (storefront membership) authentication service.
Implements passwordless email-code sign-in with a session cookie.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from uuid import UUID

from sqlalchemy import RowMapping, text
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.codes import CODE_EXPIRY_MINUTES, generate_code, hash_code, verify_code
from src.core.email import send_login_code_email

CODE_EXPIRY = timedelta(minutes=CODE_EXPIRY_MINUTES)

GET_ACTIVE_STOREFRONT_QUERY = text("""
    SELECT id, name, tenant_id
    FROM storefronts
    WHERE id = :storefront_id AND status = 'active' AND deleted_at IS NULL
    LIMIT 1
""")

DELETE_PREVIOUS_CODES_QUERY = text("""
    DELETE FROM customer_email_codes
    WHERE email = :email AND storefront_id = :storefront_id
      AND purpose = 'login' AND consumed_at IS NULL
""")

INSERT_EMAIL_CODE_QUERY = text("""
    INSERT INTO customer_email_codes (
        email, storefront_id, code_hash, purpose, expires_at, created_at
    )
    VALUES (:email, :storefront_id, :code_hash, 'login', :expires_at, NOW())
    RETURNING id
""")

GET_LATEST_CODE_QUERY = text("""
    SELECT id, code_hash, expires_at, consumed_at
    FROM customer_email_codes
    WHERE email = :email AND storefront_id = :storefront_id AND purpose = 'login'
    ORDER BY created_at DESC
    LIMIT 1
""")

CONSUME_CODE_QUERY = text("""
    UPDATE customer_email_codes
    SET consumed_at = NOW()
    WHERE id = :id AND consumed_at IS NULL
    RETURNING id
""")

GET_CUSTOMER_QUERY = text("""
    SELECT id, storefront_id, email, first_name, last_name, phone, platform_id
    FROM customers
    WHERE storefront_id = :storefront_id AND email = :email
    LIMIT 1
""")

INSERT_CUSTOMER_QUERY = text("""
    INSERT INTO customers (storefront_id, email, created_at, updated_at)
    VALUES (:storefront_id, :email, NOW(), NOW())
    RETURNING id, storefront_id, email, first_name, last_name, phone, platform_id
""")

GET_PLATFORM_CUSTOMER_QUERY = text("""
    SELECT id, email, first_name, last_name, phone
    FROM platform_customers
    WHERE email = :email
    LIMIT 1
""")

INSERT_PLATFORM_CUSTOMER_QUERY = text("""
    INSERT INTO platform_customers (email, created_at, updated_at)
    VALUES (:email, NOW(), NOW())
    RETURNING id, email, first_name, last_name, phone
""")

LINK_PLATFORM_CUSTOMER_QUERY = text("""
    UPDATE customers
    SET platform_id = :platform_id, updated_at = NOW()
    WHERE id = :customer_id
    RETURNING id, storefront_id, email, first_name, last_name, phone, platform_id
""")


async def _storefront_row(
    db: AsyncSession, storefront_id: str
) -> Optional[RowMapping]:
    result = await db.execute(
        GET_ACTIVE_STOREFRONT_QUERY, {"storefront_id": storefront_id}
    )
    return result.mappings().first()


async def send_login_code_service(
    db: AsyncSession, storefront_id: str, email: str
) -> Dict[str, Any]:
    """
    Generate and deliver a one-time sign-in code for an email on a storefront.

    Args:
        db: Database session
        storefront_id: Storefront UUID
        email: Customer email

    Returns:
        Dict with message and expiry window

    Raises:
        ValueError: If the storefront is unknown/inactive
    """
    storefront = await _storefront_row(db, storefront_id)
    if not storefront:
        raise ValueError("Storefront not found")

    code = generate_code()
    code_hash = hash_code(code)

    await db.execute(
        DELETE_PREVIOUS_CODES_QUERY,
        {"email": email, "storefront_id": storefront_id},
    )
    await db.execute(
        INSERT_EMAIL_CODE_QUERY,
        {
            "email": email,
            "storefront_id": storefront_id,
            "code_hash": code_hash,
            "expires_at": datetime.now(timezone.utc) + CODE_EXPIRY,
        },
    )
    await db.commit()

    try:
        send_login_code_email(email, code, storefront["name"])
    except RuntimeError:
        # Email delivery failure should not be fatal for the code generation;
        # the development fallback simply logs the code.
        await db.rollback()

    return {"message": "Code sent", "expires_in": CODE_EXPIRY_MINUTES}


async def verify_login_code_service(
    db: AsyncSession,
    storefront_id: str,
    email: str,
    code: str,
    remember_me: bool,
    create_platform_account: bool,
) -> Dict[str, Any]:
    """
    Validate an email code and materialize a customer session.

    Returns customer data plus any platform identity that was created/linked.

    Raises:
        ValueError: For unknown storefront, or invalid/expired/used code
    """
    storefront = await _storefront_row(db, storefront_id)
    if not storefront:
        raise ValueError("Storefront not found")

    result = await db.execute(
        GET_LATEST_CODE_QUERY,
        {"email": email, "storefront_id": storefront_id},
    )
    row = result.mappings().first()
    if not row or not verify_code(code, row["code_hash"]):
        raise ValueError("Invalid or expired code")

    if row["consumed_at"] is not None:
        raise ValueError("Code already used")

    if row["expires_at"] < datetime.now(timezone.utc):
        raise ValueError("Code expired")

    consumed = await db.execute(CONSUME_CODE_QUERY, {"id": row["id"]})
    if not consumed.mappings().first():
        raise ValueError("Code already used")

    # Fetch or create the storefront-scoped customer
    customer_result = await db.execute(
        GET_CUSTOMER_QUERY, {"storefront_id": storefront_id, "email": email}
    )
    customer_row = customer_result.mappings().first()
    if customer_row:
        customer = dict(customer_row)
    else:
        insert_result = await db.execute(
            INSERT_CUSTOMER_QUERY,
            {"storefront_id": storefront_id, "email": email},
        )
        customer = dict(insert_result.mappings().first())

    # Optional platform-wide identity (aggregates orders across stores)
    platform = None
    platform_result = await db.execute(GET_PLATFORM_CUSTOMER_QUERY, {"email": email})
    platform_row = platform_result.mappings().first()

    if not platform_row and create_platform_account:
        insert_platform = await db.execute(
            INSERT_PLATFORM_CUSTOMER_QUERY, {"email": email}
        )
        platform_row = insert_platform.mappings().first()

    if platform_row:
        linked = await db.execute(
            LINK_PLATFORM_CUSTOMER_QUERY,
            {
                "platform_id": platform_row["id"],
                "customer_id": customer["id"],
            },
        )
        customer = dict(linked.mappings().first())
        platform = {k: platform_row[k] for k in ("id", "email", "first_name", "last_name", "phone")}

    await db.commit()

    return {
        "customer": customer,
        "platform_customer": platform,
        "storefront_name": storefront["name"],
    }


async def get_customer_profile_service(
    db: AsyncSession, customer_id: str
) -> Optional[Dict[str, Any]]:
    """Fetch a customer's storefront scoped profile and optional platform identity."""
    customer_result = await db.execute(
        text(
            """
            SELECT id, storefront_id, email, first_name, last_name, phone
            FROM customers
            WHERE id = :customer_id
            LIMIT 1
            """
        ),
        {"customer_id": customer_id},
    )
    customer_row = customer_result.mappings().first()
    if not customer_row:
        return None

    customer = dict(customer_row)
    platform = None
    if customer_row["id"]:
        platform_result = await db.execute(
            text(
                """
                SELECT pc.id, pc.email, pc.first_name, pc.last_name, pc.phone
                FROM customers c
                INNER JOIN platform_customers pc ON pc.id = c.platform_id
                WHERE c.id = :customer_id
                LIMIT 1
                """
            ),
            {"customer_id": customer_id},
        )
        platform_row = platform_result.mappings().first()
        if platform_row:
            platform = dict(platform_row)

    return {"customer": customer, "platform_customer": platform}