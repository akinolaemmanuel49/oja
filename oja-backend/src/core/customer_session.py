"""
Customer session management (storefront/membership auth).

Sessions are stored in the `customer_sessions` table with a SHA-256 hash
of the token; the raw token goes only in the httpOnly cookie. Sessions last
30 days when the customer asks to be remembered, otherwise the platform-
default session lifetime.
"""

import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import uuid4

from fastapi import Request, Response
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings

CUSTOMER_SESSION_COOKIE = "customer_session_id"
REMEMBER_ME_LIFETIME = timedelta(days=30)
DEFAULT_SESSION_LIFETIME = timedelta(days=settings.APP_SESSION_LIFETIME)

INSERT_CUSTOMER_SESSION_QUERY = text("""
INSERT INTO customer_sessions (
    customer_id, token_hash, ip_address, user_agent, remember_me,
    expires_at, created_at, updated_at
)
VALUES (:customer_id, :token_hash, :ip, :ua, :remember_me, :expires_at, NOW(), NOW())
RETURNING id
""")

GET_CUSTOMER_SESSION_QUERY = text("""
SELECT
    cs.customer_id,
    cs.remember_me,
    cs.expires_at,
    c.storefront_id,
    c.email,
    c.first_name,
    c.last_name,
    c.platform_id,
    c.is_active
FROM customer_sessions cs
INNER JOIN customers c ON c.id = cs.customer_id
WHERE cs.token_hash = :token_hash
LIMIT 1
""")

DELETE_CUSTOMER_SESSION_QUERY = text(
    "DELETE FROM customer_sessions WHERE token_hash = :token_hash"
)


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _session_lifetime(remember_me: bool) -> timedelta:
    return REMEMBER_ME_LIFETIME if remember_me else DEFAULT_SESSION_LIFETIME


async def create_customer_session(
    db: AsyncSession,
    customer_id: str,
    request: Request,
    response: Response,
    remember_me: bool = False,
) -> str:
    """Create a new customer session, set the cookie and return the raw token."""
    token = str(uuid4())
    expires_at = datetime.now(timezone.utc) + _session_lifetime(remember_me)

    await db.execute(
        INSERT_CUSTOMER_SESSION_QUERY,
        {
            "customer_id": customer_id,
            "token_hash": _hash_token(token),
            "ip": request.client.host if request.client is not None else None,
            "ua": request.headers.get("user-agent"),
            "remember_me": remember_me,
            "expires_at": expires_at,
        },
    )
    await db.commit()

    response.set_cookie(
        key=CUSTOMER_SESSION_COOKIE,
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=int(_session_lifetime(remember_me).total_seconds()),
        path="/",
    )
    return token


async def get_current_customer_session(
    db: AsyncSession, request: Request
) -> Optional[dict]:
    """Validate the customer session cookie and return customer data, or None."""
    token = request.cookies.get(CUSTOMER_SESSION_COOKIE)
    if not token:
        return None

    result = await db.execute(
        GET_CUSTOMER_SESSION_QUERY,
        {"token_hash": _hash_token(token)},
    )
    row = result.mappings().first()
    if not row:
        return None

    if row["expires_at"] < datetime.now(timezone.utc):
        await db.execute(DELETE_CUSTOMER_SESSION_QUERY, {"token_hash": _hash_token(token)})
        await db.commit()
        return None

    if not row["is_active"]:
        return None

    return {
        "customer_id": str(row["customer_id"]),
        "storefront_id": str(row["storefront_id"]),
        "email": row["email"],
        "first_name": row["first_name"],
        "last_name": row["last_name"],
        "platform_id": str(row["platform_id"]) if row["platform_id"] else None,
        "remember_me": row["remember_me"],
        "expires_at": row["expires_at"],
    }


async def destroy_customer_session(
    db: AsyncSession, request: Request, response: Response
) -> None:
    """Logout – delete the customer session row and clear the cookie."""
    token = request.cookies.get(CUSTOMER_SESSION_COOKIE)
    if token:
        await db.execute(
            DELETE_CUSTOMER_SESSION_QUERY, {"token_hash": _hash_token(token)}
        )
        await db.commit()

    response.delete_cookie(CUSTOMER_SESSION_COOKIE)