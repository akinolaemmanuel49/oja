"""
Pydantic schemas for storefront customer (membership) auth.
"""

from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class CustomerSendCode(BaseModel):
    """Request a one-time sign-in code for a storefront."""

    storefront_id: UUID
    email: EmailStr


class CustomerVerifyCode(BaseModel):
    """Exchange a one-time code for a customer session."""

    storefront_id: UUID
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)
    remember_me: bool = False
    create_platform_account: bool = False


class CustomerOut(BaseModel):
    """Storefront-scoped customer profile."""

    id: UUID
    storefront_id: UUID
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class PlatformCustomerOut(BaseModel):
    """Optional platform-wide identity aggregating orders across stores."""

    id: UUID
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class CustomerVerifyOut(BaseModel):
    """Result of a successful email-code sign-in."""

    message: str = "Signed in"
    customer: CustomerOut
    platform_customer: Optional[PlatformCustomerOut] = None
    cart_merged: bool = False


class CustomerMe(BaseModel):
    """Authenticated customer detail (me endpoint)."""

    customer: CustomerOut
    platform_customer: Optional[PlatformCustomerOut] = None