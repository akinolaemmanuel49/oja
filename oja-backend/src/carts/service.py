"""
Cart service (server-side carts).

Carts are stored per storefront. A signed-in customer has exactly one cart per
storefront; a guest visitor gets one cart keyed by their device id. Stock is
validated server-side on add/update against the live products / product_variants
rows using row locks.
"""

import logging
from typing import Any, Dict, List, Optional

from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from src.carts.schemas import CartItemAdd, CartItemOut, CartOut

logger = logging.getLogger("oja.cart")

GET_CART_BY_CUSTOMER_QUERY = text("""
    SELECT id, status FROM carts
    WHERE storefront_id = :storefront_id AND customer_id = :customer_id
    LIMIT 1
""")

GET_CART_BY_DEVICE_QUERY = text("""
    SELECT id, status FROM carts
    WHERE storefront_id = :storefront_id AND device_id = :device_id
    LIMIT 1
""")

INSERT_CART_QUERY = text("""
    INSERT INTO carts (storefront_id, customer_id, device_id, status, created_at, updated_at)
    VALUES (:storefront_id, :customer_id, :device_id, 'active', NOW(), NOW())
    RETURNING id, status
""")

GET_CART_ITEMS_QUERY = text("""
    SELECT
        ci.id,
        ci.product_id,
        ci.variant_id,
        p.name            AS product_name,
        p.main_image_url,
        ci.unit_price,
        ci.quantity,
        COALESCE(pv.attributes, '{}'::jsonb) AS variant_attributes,
        CASE
            WHEN ci.variant_id IS NOT NULL THEN pv.stock_quantity
            ELSE p.stock_quantity
        END AS stock_available
    FROM cart_items ci
    INNER JOIN products p ON p.id = ci.product_id
    LEFT JOIN product_variants pv ON pv.id = ci.variant_id
    WHERE ci.cart_id = :cart_id
    ORDER BY ci.created_at ASC
""")

GET_VISIBLE_STOREFRONT_PRODUCT_QUERY = text("""
    SELECT
        p.id,
        p.type,
        p.name,
        p.base_price,
        p.stock_quantity,
        p.main_image_url
    FROM storefront_products sp
    INNER JOIN products p ON p.id = sp.product_id
    WHERE sp.storefront_id = :storefront_id AND sp.product_id = :product_id
      AND sp.is_visible = TRUE
    LIMIT 1
    FOR UPDATE OF p
""")

GET_VARIANT_FOR_UPDATE_QUERY = text("""
    SELECT id, price, stock_quantity, attributes
    FROM product_variants
    WHERE id = :variant_id AND product_id = :product_id
    LIMIT 1
    FOR UPDATE
""")

GET_CART_ITEM_QUERY = text("""
    SELECT id, cart_id, product_id, variant_id, quantity, unit_price
    FROM cart_items
    WHERE cart_id = :cart_id AND product_id = :product_id
      AND variant_id IS NOT DISTINCT FROM :variant_id
    LIMIT 1
""")

INSERT_CART_ITEM_QUERY = text("""
    INSERT INTO cart_items (
        cart_id, product_id, variant_id, quantity, unit_price, created_at, updated_at
    )
    VALUES (:cart_id, :product_id, :variant_id, :quantity, :unit_price, NOW(), NOW())
    RETURNING id, product_id, variant_id, quantity, unit_price
""")

UPDATE_CART_ITEM_QUERY = text("""
    UPDATE cart_items
    SET quantity = :quantity, unit_price = :unit_price, updated_at = NOW()
    WHERE id = :item_id AND cart_id = :cart_id
    RETURNING id, product_id, variant_id, quantity, unit_price
""")

UPDATE_CART_ITEM_QUANTITY_QUERY = text("""
    UPDATE cart_items
    SET quantity = :quantity, updated_at = NOW()
    WHERE id = :item_id AND cart_id = :cart_id
    RETURNING id
""")

DELETE_CART_ITEM_QUERY = text("""
    DELETE FROM cart_items WHERE id = :item_id AND cart_id = :cart_id
    RETURNING id
""")

DELETE_CART_ITEMS_QUERY = text("DELETE FROM cart_items WHERE cart_id = :cart_id")

DELETE_CART_QUERY = text("DELETE FROM carts WHERE id = :cart_id")


async def get_cart_id(
    db: AsyncSession,
    storefront_id: str,
    customer_id: Optional[str],
    device_id: Optional[str],
) -> Optional[str]:
    """Resolve an existing cart for a customer or guest device, else None."""
    if customer_id:
        result = await db.execute(
            GET_CART_BY_CUSTOMER_QUERY,
            {"storefront_id": storefront_id, "customer_id": customer_id},
        )
    elif device_id:
        result = await db.execute(
            GET_CART_BY_DEVICE_QUERY,
            {"storefront_id": storefront_id, "device_id": device_id},
        )
    else:
        return None

    row = result.mappings().first()
    return str(row["id"]) if row else None


async def get_or_create_cart_id(
    db: AsyncSession,
    storefront_id: str,
    customer_id: Optional[str],
    device_id: Optional[str],
) -> str:
    """Get an existing cart or create a new one for the identity."""
    existing = await get_cart_id(db, storefront_id, customer_id, device_id)
    if existing:
        return existing

    result = await db.execute(
        INSERT_CART_QUERY,
        {
            "storefront_id": storefront_id,
            "customer_id": customer_id,
            "device_id": device_id,
        },
    )
    await db.commit()
    row = result.mappings().first()
    return str(row["id"])


async def get_cart_service(
    db: AsyncSession,
    storefront_id: str,
    customer_id: Optional[str],
    device_id: Optional[str],
) -> CartOut:
    """Return the current cart (empty if the identity has no cart yet)."""
    cart_id = await get_cart_id(db, storefront_id, customer_id, device_id)

    if not cart_id:
        return CartOut(storefront_id=storefront_id)

    items = await _fetch_items(db, cart_id)
    subtotal = round(sum(item.subtotal for item in items), 2)

    return CartOut(
        cart_id=cart_id,
        storefront_id=storefront_id,
        status="active",
        items=items,
        count=len(items),
        subtotal=subtotal,
    )


async def _fetch_items(db: AsyncSession, cart_id: str) -> List[CartItemOut]:
    result = await db.execute(GET_CART_ITEMS_QUERY, {"cart_id": cart_id})
    items: List[CartItemOut] = []
    for row in result.mappings():
        variant_label = None
        if row["variant_attributes"] and isinstance(row["variant_attributes"], dict):
            attrs = row["variant_attributes"]
            variant_label = ", ".join(
                f"{str(k).capitalize()}: {v}" for k, v in attrs.items()
            )
        quantity = row["quantity"] or 0
        unit_price = float(row["unit_price"] or 0)
        items.append(
            CartItemOut(
                id=row["id"],
                product_id=row["product_id"],
                variant_id=row["variant_id"],
                product_name=row["product_name"],
                variant_label=variant_label,
                main_image_url=row["main_image_url"],
                unit_price=unit_price,
                quantity=quantity,
                subtotal=round(unit_price * quantity, 2),
                stock_available=row["stock_available"] or 0,
            )
        )
    return items


async def _resolve_price_and_stock(
    db: AsyncSession,
    storefront_id: str,
    product_id: str,
    variant_id: Optional[str],
) -> Dict[str, Any]:
    """
    Validate the product is visible in the storefront and lock its stock row.

    Returns price, available stock and product metadata.

    Raises:
        ValueError: If the product is not available or selection is invalid
    """
    product_result = await db.execute(
        GET_VISIBLE_STOREFRONT_PRODUCT_QUERY,
        {"storefront_id": storefront_id, "product_id": product_id},
    )
    product_row = product_result.mappings().first()
    if not product_row:
        raise ValueError("Product is not available in this storefront")

    price = None
    stock = None

    if product_row["type"] == "simple":
        price = float(product_row["base_price"] or 0)
        stock = int(product_row["stock_quantity"] or 0)
    else:
        if not variant_id:
            raise ValueError("Please choose a product variant")
        variant_result = await db.execute(
            GET_VARIANT_FOR_UPDATE_QUERY,
            {"variant_id": variant_id, "product_id": product_id},
        )
        variant_row = variant_result.mappings().first()
        if not variant_row:
            raise ValueError("Product variant not found")
        price = float(variant_row["price"] or product_row["base_price"] or 0)
        stock = int(variant_row["stock_quantity"] or 0)

    if price <= 0:
        raise ValueError("This product cannot be ordered (no price set)")

    return {
        "name": product_row["name"],
        "main_image_url": product_row["main_image_url"],
        "price": price,
        "stock": stock,
    }


async def add_item_service(
    db: AsyncSession,
    storefront_id: str,
    cart_id: str,
    data: CartItemAdd,
) -> CartItemOut:
    """Add an item to a cart with server-side stock validation."""
    info = await _resolve_price_and_stock(
        db, storefront_id, str(data.product_id),
        str(data.variant_id) if data.variant_id else None,
    )
    quantity = data.effective_quantity
    if info["stock"] < 1:
        raise ValueError("This product is out of stock")
    if quantity > info["stock"]:
        quantity = info["stock"]

    existing = await db.execute(
        GET_CART_ITEM_QUERY,
        {
            "cart_id": cart_id,
            "product_id": str(data.product_id),
            "variant_id": str(data.variant_id) if data.variant_id else None,
        },
    )
    existing_row = existing.mappings().first()

    if existing_row:
        new_quantity = min(existing_row["quantity"] + quantity, info["stock"])
        await db.execute(
            UPDATE_CART_ITEM_QUERY,
            {
                "item_id": existing_row["id"],
                "cart_id": cart_id,
                "quantity": new_quantity,
                "unit_price": info["price"],
            },
        )
        await db.commit()
        return CartItemOut(
            id=existing_row["id"],
            product_id=existing_row["product_id"],
            variant_id=existing_row["variant_id"],
            product_name=info["name"],
            main_image_url=info["main_image_url"],
            unit_price=info["price"],
            quantity=new_quantity,
            subtotal=round(info["price"] * new_quantity, 2),
            stock_available=info["stock"],
        )

    result = await db.execute(
        INSERT_CART_ITEM_QUERY,
        {
            "cart_id": cart_id,
            "product_id": str(data.product_id),
            "variant_id": str(data.variant_id) if data.variant_id else None,
            "quantity": quantity,
            "unit_price": info["price"],
        },
    )
    await db.commit()
    row = result.mappings().first()

    return CartItemOut(
        id=row["id"],
        product_id=row["product_id"],
        variant_id=row["variant_id"],
        product_name=info["name"],
        main_image_url=info["main_image_url"],
        unit_price=info["price"],
        quantity=row["quantity"],
        subtotal=round(info["price"] * row["quantity"], 2),
        stock_available=info["stock"],
    )


async def update_item_quantity_service(
    db: AsyncSession,
    storefront_id: str,
    cart_id: str,
    item_id: str,
    quantity: int,
) -> Optional[CartItemOut]:
    """Update an item's quantity, capped at the live stock."""
    if quantity < 1:
        raise ValueError("Quantity must be at least 1")

    current_result = await db.execute(
        GET_CART_ITEMS_QUERY, {"cart_id": cart_id}  # narrow below
    )
    current_row = None
    for row in current_result.mappings():
        if str(row["id"]) == item_id:
            current_row = row
            break

    if not current_row:
        return None

    stock = int(current_row["stock_available"] or 0)
    capped = min(quantity, stock) if stock > 0 else 0
    if capped < 1:
        raise ValueError("This product is out of stock")

    await db.execute(
        UPDATE_CART_ITEM_QUANTITY_QUERY,
        {"item_id": item_id, "cart_id": cart_id, "quantity": capped},
    )
    await db.commit()

    return CartItemOut(
        id=current_row["id"],
        product_id=current_row["product_id"],
        variant_id=current_row["variant_id"],
        product_name=current_row["product_name"],
        main_image_url=current_row["main_image_url"],
        unit_price=float(current_row["unit_price"] or 0),
        quantity=capped,
        subtotal=round(float(current_row["unit_price"] or 0) * capped, 2),
        stock_available=stock,
    )


async def remove_item_service(
    db: AsyncSession, cart_id: str, item_id: str
) -> bool:
    """Remove an item from a cart."""
    result = await db.execute(
        DELETE_CART_ITEM_QUERY, {"item_id": item_id, "cart_id": cart_id}
    )
    await db.commit()
    return result.mappings().first() is not None


async def clear_cart_service(db: AsyncSession, cart_id: str) -> None:
    """Empty a cart."""
    await db.execute(DELETE_CART_ITEMS_QUERY, {"cart_id": cart_id})
    await db.execute(DELETE_CART_QUERY, {"cart_id": cart_id})
    await db.commit()


async def merge_guest_cart_into_customer(
    db: AsyncSession,
    storefront_id: str,
    customer_id: str,
    device_id: str,
) -> bool:
    """
    Merge a guest device cart into the customer's cart after sign-in.

    Returns True if any guest items were merged/moved.
    """
    guest_cart_id = await get_cart_id(db, storefront_id, None, device_id)
    if not guest_cart_id:
        return False

    customer_cart_id = await get_cart_id(db, storefront_id, customer_id, None)

    guest_items = await _fetch_items(db, guest_cart_id)
    if not guest_items:
        await db.execute(DELETE_CART_QUERY, {"cart_id": guest_cart_id})
        await db.commit()
        return False

    merge_target = customer_cart_id or await get_or_create_cart_id(
        db, storefront_id, customer_id, None
    )

    for item in guest_items:
        try:
            await _append_with_stock_cap(
                db,
                target_cart_id=merge_target,
                storefront_id=storefront_id,
                item=item,
            )
        except Exception as exc:  # keep the cart merge resilient
            logger.warning("Failed to merge cart item: %s", exc)

    await db.execute(DELETE_CART_ITEMS_QUERY, {"cart_id": guest_cart_id})
    await db.execute(DELETE_CART_QUERY, {"cart_id": guest_cart_id})
    await db.commit()
    return True


async def _append_with_stock_cap(
    db: AsyncSession,
    target_cart_id: str,
    storefront_id: str,
    item: CartItemOut,
) -> None:
    """Add a guest item into the target cart, capped at current stock."""
    info = await _resolve_price_and_stock(
        db,
        storefront_id,
        str(item.product_id),
        str(item.variant_id) if item.variant_id else None,
    )

    existing = await db.execute(
        GET_CART_ITEM_QUERY,
        {
            "cart_id": target_cart_id,
            "product_id": str(item.product_id),
            "variant_id": str(item.variant_id) if item.variant_id else None,
        },
    )
    existing_row = existing.mappings().first()

    quantity = min(item.quantity, info["stock"]) if info["stock"] > 0 else 0
    if quantity < 1:
        return

    if existing_row:
        new_quantity = min(existing_row["quantity"] + quantity, info["stock"])
        await db.execute(
            UPDATE_CART_ITEM_QUERY,
            {
                "item_id": existing_row["id"],
                "cart_id": target_cart_id,
                "quantity": new_quantity,
                "unit_price": info["price"],
            },
        )
    else:
        try:
            await db.execute(
                INSERT_CART_ITEM_QUERY,
                {
                    "cart_id": target_cart_id,
                    "product_id": str(item.product_id),
                    "variant_id": str(item.variant_id) if item.variant_id else None,
                    "quantity": quantity,
                    "unit_price": info["price"],
                },
            )
        except IntegrityError:
            # Rare race: a parallel request inserted the same line; fold in.
            await db.rollback()
            duplicate = await db.execute(
                GET_CART_ITEM_QUERY,
                {
                    "cart_id": target_cart_id,
                    "product_id": str(item.product_id),
                    "variant_id": str(item.variant_id) if item.variant_id else None,
                },
            )
            dup_row = duplicate.mappings().first()
            if dup_row:
                await db.execute(
                    UPDATE_CART_ITEM_QUERY,
                    {
                        "item_id": dup_row["id"],
                        "cart_id": target_cart_id,
                        "quantity": min(dup_row["quantity"] + quantity, info["stock"]),
                        "unit_price": info["price"],
                    },
                )