"""
One-time numeric code helpers (email sign-in, password recovery).

Codes are generated with `secrets` and hashed at rest using bcrypt so a
database leak does not expose working codes.
"""

import secrets

import bcrypt

CODE_LENGTH = 6
CODE_EXPIRY_MINUTES = 10


def generate_code() -> str:
    """Generate a random 6-digit numeric code (e.g. "481203")."""
    return f"{secrets.randbelow(10 ** CODE_LENGTH):0{CODE_LENGTH}d}"


def hash_code(code: str) -> str:
    """Hash a plaintext code for storage."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(code.encode("utf-8"), salt).decode("utf-8")


def verify_code(plain_code: str, hashed_code: str) -> bool:
    """Constant-time comparison of a plaintext code against its hash."""
    try:
        return bcrypt.checkpw(
            plain_code.encode("utf-8"), hashed_code.encode("utf-8")
        )
    except ValueError:
        return False