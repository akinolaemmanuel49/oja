"""
Pydantic schemas for the server-side shopping cart.
"""

from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class CartItemAdd(BaseModel):
    """Add an item to the cart."""

    product_id: UUID
    variant_id: Optional[UUID] = None
    quantity: int = Field(1, ge=0)

    @property
    def effective_quantity(self) -> int:
        return max(self.quantity, 1)


class CartItemUpdate(BaseModel):
    """Set a cart item's quantity."""

    quantity: int = Field(0, ge=0)


class CartItemOut(BaseModel):
    id: UUID
    product_id: UUID
    variant_id: Optional[UUID] = None
    product_name: str
    variant_label: Optional[str] = None
    main_image_url: Optional[str] = None
    unit_price: float
    quantity: int
    subtotal: float
    stock_available: int


class CartOut(BaseModel):
    cart_id: Optional[UUID] = None
    storefront_id: UUID
    status: str = "active"
    items: List[CartItemOut] = []
    count: int = 0
    subtotal: float = 0.0
    currency: str = "NGN"