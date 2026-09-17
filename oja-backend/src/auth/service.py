"""
Authentication core service layer.
Handles credential verification during login and password recovery.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import RowMapping, text
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.core.codes import generate_code, hash_code, verify_code
from src.core.email import send_password_reset_email
from src.core.security import hash_password, verify_password

GET_USER_FOR_LOGIN_QUERY = text("""
SELECT id, password_hash, deleted_at
FROM users
WHERE email = :email
LIMIT 1
""")

GET_USER_BY_EMAIL_QUERY = text("""
SELECT id, deleted_at
FROM users
WHERE email = :email
LIMIT 1
""")

INSERT_RESET_TOKEN_QUERY = text("""
INSERT INTO password_reset_tokens (user_id, code_hash, expires_at, created_at)
VALUES (:user_id, :code_hash, :expires_at, NOW())
RETURNING id
""")

DELETE_PREVIOUS_RESET_TOKENS_QUERY = text("""
DELETE FROM password_reset_tokens
WHERE user_id = :user_id AND consumed_at IS NULL
""")

GET_LATEST_RESET_TOKEN_QUERY = text("""
SELECT rt.id, rt.code_hash, rt.expires_at, rt.consumed_at
FROM password_reset_tokens rt
INNER JOIN users u ON u.id = rt.user_id
WHERE u.email = :email AND rt.consumed_at IS NULL
ORDER BY rt.created_at DESC
LIMIT 1
""")

CONSUME_RESET_TOKEN_QUERY = text("""
UPDATE password_reset_tokens
SET consumed_at = NOW()
WHERE id = :id AND consumed_at IS NULL
RETURNING id
""")

UPDATE_USER_PASSWORD_QUERY = text("""
UPDATE users
SET password_hash = :password_hash, updated_at = NOW()
WHERE id = :user_id
""")

RESET_CODE_EXPIRY = timedelta(minutes=30)


async def login_service(db: AsyncSession, email: str, password: str) -> RowMapping:
    """
    Authenticate user credentials and return minimal user data for session creation.

    Args:
        db: Database session
        email: User email
        password: Plaintext password

    Returns:
        RowMapping with user id and other minimal fields needed for token creation

    Raises:
        ValueError: On invalid credentials or deleted account
    """
    result = await db.execute(GET_USER_FOR_LOGIN_QUERY, {"email": email})

    user = result.mappings().first()

    if not user or not verify_password(password, user["password_hash"]):
        raise ValueError("Invalid credentials")

    if user["deleted_at"]:
        raise ValueError("User is deleted")

    return user


async def request_password_reset_service(
    db: AsyncSession, email: str
) -> dict:
    """
    Issue a password reset code for a dashboard user, if the account exists.

    The response is intentionally generic to avoid account enumeration.
    """
    result = await db.execute(GET_USER_BY_EMAIL_QUERY, {"email": email})
    user = result.mappings().first()

    if user and not user["deleted_at"]:
        code = generate_code()
        await db.execute(
            DELETE_PREVIOUS_RESET_TOKENS_QUERY, {"user_id": str(user["id"])}
        )
        await db.execute(
            INSERT_RESET_TOKEN_QUERY,
            {
                "user_id": str(user["id"]),
                "code_hash": hash_code(code),
                "expires_at": datetime.now(timezone.utc) + RESET_CODE_EXPIRY,
            },
        )
        await db.commit()
        send_password_reset_email(email, code)

    return {"message": "If that email exists, a reset code has been sent"}


async def reset_password_service(
    db: AsyncSession, email: str, code: str, new_password: str
) -> None:
    """
    Validate a reset code and set a new password for the user.

    Raises:
        ValueError: If the code is missing, invalid or expired
    """
    result = await db.execute(
        GET_LATEST_RESET_TOKEN_QUERY, {"email": email}
    )
    row = result.mappings().first()
    if not row or not verify_code(code, row["code_hash"]):
        raise ValueError("Invalid or expired code")
    if row["expires_at"] < datetime.now(timezone.utc):
        raise ValueError("Code expired")

    consumed = await db.execute(CONSUME_RESET_TOKEN_QUERY, {"id": row["id"]})
    if not consumed.mappings().first():
        raise ValueError("Code already used")

    user_result = await db.execute(GET_USER_BY_EMAIL_QUERY, {"email": email})
    user = user_result.mappings().first()
    if not user or user["deleted_at"]:
        raise ValueError("Invalid or expired code")

    await db.execute(
        UPDATE_USER_PASSWORD_QUERY,
        {
            "user_id": str(user["id"]),
            "password_hash": hash_password(new_password),
        },
    )
    await db.commit()
