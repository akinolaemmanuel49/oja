"""
Order / checkout routes (public storefront API + customer history).
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db, require_permission
from src.customers.dependencies import get_customer_or_none, get_device_id
from src.orders.schemas import (
    CheckoutGuest,
    CheckoutResult,
    OrderItemOut,
    OrderOut,
    OrderStatusUpdate,
    PaymentVerifyBody,
    PaymentVerifyOut,
    StorefrontOrderOut,
)
from src.orders.service import (
    checkout_service,
    get_storefront_order_detail_service,
    list_customer_orders_service,
    list_platform_orders_service,
    list_storefront_orders_service,
    update_order_status_service,
    verify_order_service,
)
from src.storefronts.service import storefront_exists_service

order_router = APIRouter(prefix="/orders", tags=["Orders"])


def _build_order_out(row: dict) -> OrderOut:
    items = [OrderItemOut(**item) for item in row.get("items", [])]
    return OrderOut(
        id=row["id"],
        order_number=row["order_number"],
        status=row["status"],
        subtotal=float(row["subtotal"] or 0),
        shipping_fee=float(row["shipping_fee"] or 0),
        total=float(row["total"] or 0),
        currency=row["currency"],
        created_at=row["created_at"],
        items=items,
    )


@order_router.post("/checkout", response_model=CheckoutResult)
async def checkout(
    storefront_id: str,
    guest: Optional[CheckoutGuest] = None,
    request: Request = None,
    db: AsyncSession = Depends(get_db),
    customer=Depends(get_customer_or_none),
):
    if not await storefront_exists_service(db, storefront_id):
        raise HTTPException(status_code=404, detail="Storefront not found")

    customer_id = customer["customer_id"] if customer else None
    device_id = None if customer else get_device_id(request)

    if not customer_id and not device_id:
        raise HTTPException(
            status_code=400,
            detail="Sign in or include your device to continue",
        )

    if not customer_id and (not guest or not guest.email):
        raise HTTPException(
            status_code=400, detail="An email is required for guest checkout"
        )

    try:
        result = await checkout_service(
            db,
            storefront_id,
            customer_id,
            device_id,
            str(guest.email) if guest else None,
            guest.name if guest else None,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    return CheckoutResult(**result)


@order_router.post("/verify", response_model=PaymentVerifyOut)
async def verify_order(
    data: PaymentVerifyBody,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await verify_order_service(db, data.reference)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    return PaymentVerifyOut(**result)


@order_router.get("", response_model=List[OrderOut])
async def list_orders(
    storefront_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    customer=Depends(get_customer_or_none),
):
    if not customer:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if customer["storefront_id"] != storefront_id:
        raise HTTPException(
            status_code=403, detail="Access denied for this storefront"
        )

    rows = await list_customer_orders_service(
        db, storefront_id, customer["customer_id"]
    )
    return [_build_order_out(row) for row in rows]


@order_router.get("/all", response_model=List[OrderOut])
async def list_all_orders(
    request: Request,
    db: AsyncSession = Depends(get_db),
    customer=Depends(get_customer_or_none),
):
    """Platform-wide order history across storefronts (needs a platform account)."""
    if not customer:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not customer.get("platform_id"):
        raise HTTPException(
            status_code=403, detail="A platform account is required"
        )

    rows = await list_platform_orders_service(db, customer["platform_id"])
    return [_build_order_out(row) for row in rows]


@order_router.get("/manage", response_model=List[StorefrontOrderOut])
async def list_storefront_orders(
    storefront_id: str,
    status: Optional[str] = Query(None, pattern="^(pending|paid|processing|completed|cancelled|failed)$"),
    current_user: dict = Depends(require_permission("orders:read")),
    db: AsyncSession = Depends(get_db),
):
    """Order list for storefront staff within one tenant storefront."""
    tenant_id = current_user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(403, "No tenant associated with user")
    if not await storefront_exists_service(db, storefront_id):
        raise HTTPException(status_code=404, detail="Storefront not found")

    rows = await list_storefront_orders_service(
        db, tenant_id, storefront_id, status
    )
    return rows


@order_router.get("/manage/{order_id}", response_model=StorefrontOrderOut)
async def get_storefront_order(
    order_id: str,
    current_user: dict = Depends(require_permission("orders:read")),
    db: AsyncSession = Depends(get_db),
):
    """Order detail (with line items) for storefront staff."""
    tenant_id = current_user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(403, "No tenant associated with user")

    try:
        return await get_storefront_order_detail_service(db, tenant_id, order_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@order_router.patch("/manage/{order_id}", response_model=StorefrontOrderOut)
async def update_storefront_order(
    order_id: str,
    data: OrderStatusUpdate,
    current_user: dict = Depends(require_permission("orders:update")),
    db: AsyncSession = Depends(get_db),
):
    """Update an order's status (and optional note) as storefront staff."""
    tenant_id = current_user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(403, "No tenant associated with user")

    try:
        return await update_order_status_service(
            db, tenant_id, order_id, data.status, data.note
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e