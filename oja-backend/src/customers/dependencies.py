"""
Dependencies for customer (storefront membership) endpoints.
"""

from typing import Optional, Union
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.customer_session import get_current_customer_session
from src.core.dependencies import get_db

DEVICE_ID_HEADER = "X-Device-Id"
DEVICE_ID_COOKIE = "device_id"


def get_device_id(request: Request) -> Optional[str]:
    """
    Resolve the guest device id from the X-Device-Id header or device_id cookie.

    Clients generate a UUID per device/browser and send it with every request
    so a logged-out visitor's cart stays on that device.
    """
    value = request.headers.get(DEVICE_ID_HEADER) or request.cookies.get(DEVICE_ID_COOKIE)
    if not value:
        return None
    try:
        return str(UUID(value))
    except ValueError:
        return None


async def get_current_customer(
    db: AsyncSession = Depends(get_db),
    request: Request = None,
) -> dict:
    """Dependency that requires a valid customer session."""
    if request is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await get_current_customer_session(db, request)
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return session


async def get_customer_or_none(
    db: AsyncSession = Depends(get_db),
    request: Request = None,
) -> Optional[dict]:
    """Dependency that returns the customer session if present, else None."""
    if request is None:
        return None
    return await get_current_customer_session(db, request)