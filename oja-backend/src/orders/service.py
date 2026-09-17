"""
Orders / checkout service (Paystack powered purchase flow).

Flow:
  1. checkout_service      - validates the cart + stock, snapshots an order,
                             empties the cart, and initializes Paystack payment.
  2. verify_order_service  - confirms the payment (webhook/callback), marks the
                             order paid and decrements stock exactly once.

In development (no PAYSTACK_SECRET_KEY) the payment is auto-verified so the
whole flow can be exercised locally without a gateway account.
"""

import logging
import secrets
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.email import send_order_confirmation_email
from src.carts.service import get_cart_id
from src.storefronts.service import storefront_exists_service

logger = logging.getLogger("oja.orders")

GET_STOREFRONT_TENANT_QUERY = text("""
    SELECT id, name, tenant_id FROM storefronts
    WHERE id = :storefront_id AND status = 'active' AND deleted_at IS NULL
    LIMIT 1
""")

GET_CART_ITEMS_FOR_ORDER_QUERY = text("""
    SELECT
        ci.id,
        ci.product_id,
        ci.variant_id,
        p.name            AS product_name,
        COALESCE(ci.unit_price::float, 0) AS unit_price,
        ci.quantity,
        CASE
            WHEN ci.variant_id IS NOT NULL THEN pv.stock_quantity
            ELSE p.stock_quantity
        END AS stock_available,
        (
            SELECT string_agg(k || ': ' || v, ', ')
            FROM jsonb_each_text(COALESCE(pv.attributes, '{}'::jsonb)) AS kv(k, v)
        ) AS variant_label
    FROM cart_items ci
    INNER JOIN products p ON p.id = ci.product_id
    LEFT JOIN product_variants pv ON pv.id = ci.variant_id
    WHERE ci.cart_id = :cart_id
    ORDER BY ci.created_at ASC
    FOR UPDATE OF ci
""")

INSERT_ORDER_QUERY = text("""
    INSERT INTO orders (
        tenant_id, storefront_id, customer_id, order_number, status,
        subtotal, shipping_fee, total, currency, payment_gateway,
        payment_reference, customer_email, customer_name, created_at, updated_at
    )
    VALUES (
        :tenant_id, :storefront_id, :customer_id, :order_number, :status,
        :subtotal, :shipping_fee, :total, :currency, :payment_gateway,
        :payment_reference, :customer_email, :customer_name, NOW(), NOW()
    )
    RETURNING id, order_number, status, subtotal, shipping_fee, total, currency,
              customer_email, created_at
""")

INSERT_ORDER_ITEM_QUERY = text("""
    INSERT INTO order_items (
        order_id, product_id, variant_id, product_name, variant_label,
        unit_price, quantity, subtotal
    )
    VALUES (
        :order_id, :product_id, :variant_id, :product_name, :variant_label,
        :unit_price, :quantity, :subtotal
    )
    RETURNING id, product_id, variant_id, product_name, variant_label,
              unit_price, quantity, subtotal
""")

DELETE_CART_ITEMS_QUERY = text("DELETE FROM cart_items WHERE cart_id = :cart_id")
DELETE_CART_QUERY = text("DELETE FROM carts WHERE id = :cart_id")

GET_STOREFRONT_NAME_QUERY = text("""
    SELECT name FROM storefronts WHERE id = :storefront_id LIMIT 1
""")

MARK_ORDER_PAID_QUERY = text("""
    UPDATE orders
    SET status = 'paid', updated_at = NOW()
    WHERE payment_reference = :reference AND status = 'pending'
    RETURNING id, order_number, customer_email, currency, total, storefront_id
""")

GET_ORDER_BY_REFERENCE_QUERY = text("""
    SELECT o.id, o.order_number, o.status, o.customer_email, o.currency, o.total,
           o.storefront_id, sf.name AS storefront_name
    FROM orders o
    LEFT JOIN storefronts sf ON sf.id = o.storefront_id
    WHERE o.payment_reference = :reference
    LIMIT 1
""")

MARK_ORDER_FAILED_QUERY = text("""
    UPDATE orders SET status = 'failed', updated_at = NOW()
    WHERE id = :order_id AND status = 'pending'
""")

MARK_ORDER_FAILED_BY_REFERENCE_QUERY = text("""
    UPDATE orders SET status = 'failed', updated_at = NOW()
    WHERE payment_reference = :reference AND status = 'pending'
""")

DECREMENT_PRODUCT_STOCK_QUERY = text("""
    UPDATE products
    SET stock_quantity = stock_quantity - :quantity, updated_at = NOW()
    WHERE id = :product_id AND stock_quantity >= :quantity
    RETURNING id
""")

DECREMENT_VARIANT_STOCK_QUERY = text("""
    UPDATE product_variants
    SET stock_quantity = stock_quantity - :quantity, updated_at = NOW()
    WHERE id = :variant_id AND stock_quantity >= :quantity
    RETURNING id
""")

LIST_ORDERS_QUERY = text("""
    SELECT id, order_number, status, subtotal, shipping_fee, total, currency,
           created_at
    FROM orders
    WHERE storefront_id = :storefront_id AND customer_id = :customer_id
    ORDER BY created_at DESC
""")

LIST_PLATFORM_ORDERS_QUERY = text("""
    SELECT o.id, o.order_number, o.status, o.subtotal, o.shipping_fee, o.total,
           o.currency, o.created_at, sf.slug AS storefront_slug,
           sf.name AS storefront_name
    FROM orders o
    INNER JOIN customers c ON c.id = o.customer_id
    INNER JOIN storefronts sf ON sf.id = o.storefront_id
    WHERE c.platform_id = :platform_id
    ORDER BY o.created_at DESC
""")

GET_ORDER_ITEMS_QUERY = text("""
    SELECT id, product_id, variant_id, product_name, variant_label,
           unit_price, quantity, subtotal
    FROM order_items
    WHERE order_id = :order_id
    ORDER BY id ASC
""")


def _generate_order_number() -> str:
    suffix = secrets.token_hex(3).upper()
    return datetime.now(timezone.utc).strftime("OJ-%y%m%d-") + suffix


def _kobo(amount: float) -> int:
    """Paystack takes NGN amounts in kobo (1/100 of a naira)."""
    return int(round(amount * 100))


def _paystack_configured() -> bool:
    return bool(
        settings.PAYSTACK_SECRET_KEY
        and settings.PAYSTACK_SECRET_KEY not in ("", "N/A")
    )


async def _initialize_paystack(
    email: str, amount_kobo: int, reference: str, callback_url: str
) -> Dict[str, str]:
    if not _paystack_configured():
        return {
            "authorization_url": "",
            "reference": reference,
            "dev_mock": "true",
        }

    response = httpx.post(
        f"{settings.PAYSTACK_API_URL}/transaction/initialize",
        headers={
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "email": email,
            "amount": amount_kobo,
            "reference": reference,
            "callback_url": callback_url,
            "currency": "NGN",
        },
        timeout=20.0,
    )
    response.raise_for_status()
    payload = response.json()
    if not payload.get("status"):
        raise RuntimeError(f"Paystack initialization failed: {payload.get('message')}")

    data = payload.get("data", {})
    return {
        "authorization_url": data.get("authorization_url", ""),
        "reference": data.get("reference", reference),
    }


async def _verify_paystack(reference: str) -> bool:
    if not _paystack_configured():
        return True  # development fallback

    response = httpx.get(
        f"{settings.PAYSTACK_API_URL}/transaction/verify/{reference}",
        headers={
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        },
        timeout=20.0,
    )
    response.raise_for_status()
    payload = response.json()
    return bool(payload.get("status") and (payload.get("data") or {}).get("status") == "success")


async def checkout_service(
    db: AsyncSession,
    storefront_id: str,
    customer_id: Optional[str],
    device_id: Optional[str],
    guest_email: Optional[str] = None,
    guest_name: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Convert the current cart into a pending order and start payment.

    Raises:
        ValueError: For unknown storefront, empty cart, invalid stock or price
        RuntimeError: For payment init / DB failures
    """
    storefront_result = await db.execute(
        GET_STOREFRONT_TENANT_QUERY, {"storefront_id": storefront_id}
    )
    storefront = storefront_result.mappings().first()
    if not storefront:
        raise ValueError("Storefront not found")

    cart_id = await get_cart_id(db, storefront_id, customer_id, device_id)
    if not cart_id:
        raise ValueError("Your cart is empty")

    items_result = await db.execute(
        GET_CART_ITEMS_FOR_ORDER_QUERY, {"cart_id": cart_id}
    )
    item_rows = list(items_result.mappings())
    if not item_rows:
        raise ValueError("Your cart is empty")

    order_number = _generate_order_number()

    subtotal = 0.0
    order_item_rows: List[Dict[str, Any]] = []
    for row in item_rows:
        unit_price = float(row["unit_price"] or 0)
        if unit_price <= 0:
            raise ValueError("Cart contains an orderable item without a price")
        available = int(row["stock_available"] or 0)
        if available < 1 or row["quantity"] > available:
            raise ValueError(
                f"Insufficient stock for {row['product_name']}"
            )
        line_total = round(unit_price * row["quantity"], 2)
        subtotal += line_total
        order_item_rows.append(
            {
                "product_id": row["product_id"],
                "variant_id": row["variant_id"],
                "product_name": row["product_name"],
                "variant_label": row["variant_label"],
                "unit_price": unit_price,
                "quantity": row["quantity"],
                "subtotal": line_total,
            }
        )

    subtotal = round(subtotal, 2)
    shipping_fee = 0.0
    total = round(subtotal + shipping_fee, 2)

    email = guest_email or ""
    name = guest_name
    if customer_id:
        customer_result = await db.execute(
            text(
                """
                SELECT email, first_name, last_name FROM customers
                WHERE id = :customer_id LIMIT 1
                """
            ),
            {"customer_id": customer_id},
        )
        customer_row = customer_result.mappings().first()
        if customer_row:
            email = customer_row["email"]
            name = " ".join(
                n for n in (customer_row["first_name"], customer_row["last_name"]) if n
            ) or None

    callback_url = (
        f"{settings.FRONTEND_STOREFRONT_URL}/payment-callback"
        f"?storefront_id={storefront_id}"
    )

    # Get the payment reference BEFORE creating the order (idempotency key).
    try:
        payment = await _initialize_paystack(email, _kobo(total), order_number, callback_url)
    except httpx.HTTPError as exc:
        await db.rollback()
        raise RuntimeError(f"Payment could not be initialized: {exc}") from exc

    try:
        order_result = await db.execute(
            INSERT_ORDER_QUERY,
            {
                "tenant_id": storefront["tenant_id"],
                "storefront_id": storefront_id,
                "customer_id": customer_id,
                "order_number": order_number,
                "status": "pending",
                "subtotal": subtotal,
                "shipping_fee": shipping_fee,
                "total": total,
                "currency": "NGN",
                "payment_gateway": "paystack" if _paystack_configured() else "mock",
                "payment_reference": payment.get("reference") or order_number,
                "customer_email": email,
                "customer_name": name,
            },
        )
        order_row = order_result.mappings().first()
        if not order_row:
            raise RuntimeError("Failed to create order")

        for item in order_item_rows:
            await db.execute(
                INSERT_ORDER_ITEM_QUERY,
                {"order_id": order_row["id"], **item},
            )

        await db.execute(DELETE_CART_ITEMS_QUERY, {"cart_id": cart_id})
        await db.execute(DELETE_CART_QUERY, {"cart_id": cart_id})
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    # In development (or when payment auto-verifies), finalize immediately.
    if payment.get("dev_mock") == "true":
        verified = await verify_order_service(db, payment.get("reference") or order_number)
        return {
            "order_id": verified["order_id"],
            "order_number": verified["order_number"],
            "status": verified["status"],
            "total": total,
            "currency": "NGN",
            "authorization_url": None,
            "reference": payment.get("reference") or order_number,
        }

    return {
        "order_id": order_row["id"],
        "order_number": order_row["order_number"],
        "status": "pending",
        "total": total,
        "currency": "NGN",
        "authorization_url": payment.get("authorization_url"),
        "reference": payment.get("reference") or order_number,
    }


async def _decrement_stock_for_order(
    db: AsyncSession, order_id: str
) -> None:
    items_result = await db.execute(GET_ORDER_ITEMS_QUERY, {"order_id": order_id})
    for row in items_result.mappings():
        if row["variant_id"]:
            result = await db.execute(
                DECREMENT_VARIANT_STOCK_QUERY,
                {"variant_id": row["variant_id"], "quantity": row["quantity"]},
            )
        else:
            result = await db.execute(
                DECREMENT_PRODUCT_STOCK_QUERY,
                {"product_id": row["product_id"], "quantity": row["quantity"]},
            )
        if result.mappings().first() is None:
            raise RuntimeError(
                f"Stock changed after checkout for {row['product_name']}"
            )


async def verify_order_service(
    db: AsyncSession, reference: str
) -> Dict[str, Any]:
    """
    Confirm payment for an order and finalize it (paid + stock decrement).

    The paid transition is guarded by `WHERE status = 'pending'` so stock is
    decremented exactly once even if this is called concurrently.
    """
    try:
        paid = await _verify_paystack(reference)
    except httpx.HTTPError as exc:
        raise RuntimeError(f"Payment verification failed: {exc}") from exc

    if not paid:
        await db.execute(MARK_ORDER_FAILED_BY_REFERENCE_QUERY, {"reference": reference})
        await db.commit()

        order_result = await db.execute(
            GET_ORDER_BY_REFERENCE_QUERY, {"reference": reference}
        )
        row = order_result.mappings().first()
        if row:
            return {
                "order_id": row["id"],
                "order_number": row["order_number"],
                "status": "failed",
                "message": "Payment was not successful",
            }
        raise ValueError("Order not found")

    claimed = await db.execute(MARK_ORDER_PAID_QUERY, {"reference": reference})
    order_row = claimed.mappings().first()
    if order_row:
        try:
            await _decrement_stock_for_order(db, str(order_row["id"]))
        except RuntimeError as exc:
            logger.error("Stock decrement failed for order %s: %s", order_row["order_number"], exc)
            await db.execute(
                text(
                    """
                    UPDATE orders SET status = 'failed', updated_at = NOW()
                    WHERE id = :order_id AND status = 'paid'
                    """
                ),
                {"order_id": order_row["id"]},
            )
            await db.commit()
            return {
                "order_id": order_row["id"],
                "order_number": order_row["order_number"],
                "status": "failed",
                "message": "Stock could not be reserved",
            }

        await db.commit()
        try:
            storefront_name = None
            if order_row["storefront_id"]:
                name_result = await db.execute(
                    GET_STOREFRONT_NAME_QUERY,
                    {"storefront_id": order_row["storefront_id"]},
                )
                name_row = name_result.mappings().first()
                if name_row:
                    storefront_name = name_row["name"]
            send_order_confirmation_email(
                order_row["customer_email"],
                store_name=storefront_name or "Oja",
                order_number=order_row["order_number"],
                total=f"{order_row['currency']} {order_row['total']}",
            )
        except RuntimeError:
            pass  # email failure should not break the confirmation

        return {
            "order_id": order_row["id"],
            "order_number": order_row["order_number"],
            "status": "paid",
            "message": "Payment confirmed",
        }

    # Already finalized (idempotent replay).
    order_result = await db.execute(
        GET_ORDER_BY_REFERENCE_QUERY, {"reference": reference}
    )
    row = order_result.mappings().first()
    if not row:
        raise ValueError("Order not found")
    return {
        "order_id": row["id"],
        "order_number": row["order_number"],
        "status": row["status"],
        "message": "Order already finalized",
    }


async def list_customer_orders_service(
    db: AsyncSession, storefront_id: str, customer_id: str
) -> List[Dict[str, Any]]:
    """Order history for a customer within one storefront."""
    result = await db.execute(
        LIST_ORDERS_QUERY,
        {"storefront_id": storefront_id, "customer_id": customer_id},
    )
    orders = []
    for row in result.mappings():
        order = dict(row)
        items_result = await db.execute(
            GET_ORDER_ITEMS_QUERY, {"order_id": row["id"]}
        )
        order["items"] = [dict(i) for i in items_result.mappings()]
        orders.append(order)
    return orders


async def list_platform_orders_service(
    db: AsyncSession, platform_id: str
) -> List[Dict[str, Any]]:
    """Order history aggregated across all storefronts for a platform account."""
    result = await db.execute(
        LIST_PLATFORM_ORDERS_QUERY, {"platform_id": platform_id}
    )
    orders = []
    for row in result.mappings():
        order = dict(row)
        items_result = await db.execute(
            GET_ORDER_ITEMS_QUERY, {"order_id": row["id"]}
        )
        order["items"] = [dict(i) for i in items_result.mappings()]
        orders.append(order)
    return orders