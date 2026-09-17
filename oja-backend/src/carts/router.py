"""
Cart routes (public storefront API).
"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.carts.schemas import CartItemAdd, CartItemUpdate, CartOut
from src.carts.service import (
    add_item_service,
    clear_cart_service,
    get_cart_service,
    get_or_create_cart_id,
    remove_item_service,
    update_item_quantity_service,
)
from src.core.dependencies import get_db
from src.customers.dependencies import get_customer_or_none, get_device_id
from src.storefronts.service import storefront_exists_service

cart_router = APIRouter(prefix="/carts", tags=["Carts"])


def _identity(customer, device_id):
    """Return the strongest identity used to scope a cart."""
    if customer:
        return customer["customer_id"], None
    return None, device_id


async def _require_storefront(db: AsyncSession, storefront_id: str) -> None:
    if not await storefront_exists_service(db, storefront_id):
        raise HTTPException(status_code=404, detail="Storefront not found")


@cart_router.post("")
async def create_cart(
    payload: Dict[str, Any],
    request: Request,
    db: AsyncSession = Depends(get_db),
    customer=Depends(get_customer_or_none),
):
    storefront_id = payload.get("storefront_id")
    if not storefront_id:
        raise HTTPException(status_code=400, detail="storefront_id is required")
    await _require_storefront(db, storefront_id)

    device_id = get_device_id(request)
    customer_id = None
    if customer:
        customer_id = customer["customer_id"]
    if not customer_id and not device_id:
        raise HTTPException(
            status_code=400, detail="A customer session or device id is required"
        )

    cart_id = await get_or_create_cart_id(db, storefront_id, customer_id, device_id)
    return {"cart_id": cart_id}


@cart_router.get("", response_model=CartOut)
async def get_cart(
    storefront_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    customer=Depends(get_customer_or_none),
):
    await _require_storefront(db, storefront_id)
    customer_id, device_id = _identity(customer, get_device_id(request))
    return await get_cart_service(db, storefront_id, customer_id, device_id)


@cart_router.post("/items", response_model=CartOut)
async def add_item(
    storefront_id: str,
    data: CartItemAdd,
    request: Request,
    db: AsyncSession = Depends(get_db),
    customer=Depends(get_customer_or_none),
):
    await _require_storefront(db, storefront_id)
    customer_id, device_id = _identity(customer, get_device_id(request))
    if not customer_id and not device_id:
        raise HTTPException(
            status_code=400, detail="A customer session or device id is required"
        )

    cart_id = await get_or_create_cart_id(db, storefront_id, customer_id, device_id)
    try:
        await add_item_service(db, storefront_id, cart_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    return await get_cart_service(db, storefront_id, customer_id, device_id)


@cart_router.patch("/items/{item_id}", response_model=CartOut)
async def update_item(
    item_id: str,
    storefront_id: str,
    data: CartItemUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    customer=Depends(get_customer_or_none),
):
    await _require_storefront(db, storefront_id)
    customer_id, device_id = _identity(customer, get_device_id(request))
    cart_id = await get_cart_id_for_request(db, storefront_id, customer_id, device_id)

    try:
        updated = await update_item_quantity_service(
            db, storefront_id, cart_id, item_id, data.quantity
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    if updated is None:
        raise HTTPException(status_code=404, detail="Cart item not found")

    return await get_cart_service(db, storefront_id, customer_id, device_id)


@cart_router.delete("/items/{item_id}", response_model=CartOut)
async def delete_item(
    item_id: str,
    storefront_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    customer=Depends(get_customer_or_none),
):
    await _require_storefront(db, storefront_id)
    customer_id, device_id = _identity(customer, get_device_id(request))
    cart_id = await get_cart_id_for_request(db, storefront_id, customer_id, device_id)

    removed = await remove_item_service(db, cart_id, item_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Cart item not found")

    return await get_cart_service(db, storefront_id, customer_id, device_id)


@cart_router.delete("", response_model=CartOut)
async def clear_cart(
    storefront_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    customer=Depends(get_customer_or_none),
):
    await _require_storefront(db, storefront_id)
    customer_id, device_id = _identity(customer, get_device_id(request))
    cart_id = await get_cart_id_for_request(db, storefront_id, customer_id, device_id)
    if cart_id:
        await clear_cart_service(db, cart_id)
    return CartOut(storefront_id=storefront_id)


async def get_cart_id_for_request(
    db: AsyncSession,
    storefront_id: str,
    customer_id,
    device_id,
) -> str:
    from src.carts.service import get_cart_id

    cart_id = await get_cart_id(db, storefront_id, customer_id, device_id)
    if not cart_id:
        raise HTTPException(status_code=404, detail="Cart not found")
    return cart_id