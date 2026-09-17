"""
Pydantic schemas for orders / checkout.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class CheckoutGuest(BaseModel):
    """Guest checkout details (used when no customer session is present)."""

    email: EmailStr
    name: Optional[str] = None


class OrderItemOut(BaseModel):
    id: UUID
    product_id: UUID
    variant_id: Optional[UUID] = None
    product_name: str
    variant_label: Optional[str] = None
    unit_price: float
    quantity: int
    subtotal: float


class OrderOut(BaseModel):
    id: UUID
    order_number: str
    status: str
    subtotal: float
    shipping_fee: float
    total: float
    currency: str
    created_at: datetime
    items: List[OrderItemOut] = []


class CheckoutResult(BaseModel):
    order_id: UUID
    order_number: str
    status: str
    total: float
    currency: str
    authorization_url: Optional[str] = None
    reference: Optional[str] = None


class PaymentVerifyBody(BaseModel):
    reference: str = Field(..., min_length=3)


class PaymentVerifyOut(BaseModel):
    order_id: UUID
    order_number: str
    status: str
    message: str