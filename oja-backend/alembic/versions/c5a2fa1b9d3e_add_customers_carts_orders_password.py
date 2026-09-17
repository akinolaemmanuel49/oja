"""add customers, carts, orders, password reset tables

Revision ID: c5a2fa1b9d3e
Revises: 8158ab056750
Create Date: 2026-09-16 12:00:00.000000
"""

from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c5a2fa1b9d3e"
down_revision: Union[str, Sequence[str], None] = "8158ab056750"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # ---------------------------------------------------------------------------
    # 1. Platform customers (optional cross-store identity/order history)
    # ---------------------------------------------------------------------------
    op.execute("""
        CREATE TABLE platform_customers (
            id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email      TEXT NOT NULL UNIQUE,
            first_name TEXT,
            last_name  TEXT,
            phone      TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    """)

    # ---------------------------------------------------------------------------
    # 2. Customers (per-storefront accounts, keyed by (storefront_id, email))
    # ---------------------------------------------------------------------------
    op.execute("""
        CREATE TABLE customers (
            id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            storefront_id UUID NOT NULL REFERENCES storefronts(id) ON DELETE CASCADE,
            platform_id   UUID REFERENCES platform_customers(id)
                ON DELETE SET NULL,
            email         TEXT NOT NULL,
            first_name    TEXT,
            last_name     TEXT,
            phone         TEXT,
            is_active     BOOLEAN DEFAULT TRUE,
            created_at    TIMESTAMPTZ DEFAULT NOW(),
            updated_at    TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE (storefront_id, email)
        );
    """)
    op.execute(
        "CREATE INDEX idx_customers_platform_id ON customers(platform_id);"
    )

    # ---------------------------------------------------------------------------
    # 3. One-time email codes (customer login / verification, dashboard recovery)
    #    Codes are hashed at rest and short-lived.
    # ---------------------------------------------------------------------------
    op.execute("""
        CREATE TABLE customer_email_codes (
            id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email         TEXT NOT NULL,
            storefront_id UUID REFERENCES storefronts(id) ON DELETE CASCADE,
            code_hash     TEXT NOT NULL,
            purpose       TEXT NOT NULL CHECK (purpose IN ('login', 'verify')),
            expires_at    TIMESTAMPTZ NOT NULL,
            consumed_at   TIMESTAMPTZ,
            created_at    TIMESTAMPTZ DEFAULT NOW()
        );
    """)
    op.execute(
        "CREATE INDEX idx_customer_email_codes_lookup "
        "ON customer_email_codes(email, storefront_id, purpose);"
    )

    # ---------------------------------------------------------------------------
    # 4. Customer sessions (storefront auth; remember-me extends to 30 days)
    # ---------------------------------------------------------------------------
    op.execute("""
        CREATE TABLE customer_sessions (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            token_hash  TEXT NOT NULL UNIQUE,
            ip_address  TEXT,
            user_agent  TEXT,
            remember_me BOOLEAN DEFAULT FALSE,
            expires_at  TIMESTAMPTZ NOT NULL,
            created_at  TIMESTAMPTZ DEFAULT NOW(),
            updated_at  TIMESTAMPTZ DEFAULT NOW()
        );
    """)
    op.execute(
        "CREATE INDEX idx_customer_sessions_customer_id ON customer_sessions(customer_id);"
    )

    # ---------------------------------------------------------------------------
    # 5. Password reset tokens (dashboard/staff users only)
    # ---------------------------------------------------------------------------
    op.execute("""
        CREATE TABLE password_reset_tokens (
            id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            code_hash  TEXT NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            consumed_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    """)
    op.execute(
        "CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);"
    )

    # ---------------------------------------------------------------------------
    # 6. Carts (one per logged-in customer OR per guest device per storefront)
    # ---------------------------------------------------------------------------
    op.execute("""
        CREATE TABLE carts (
            id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            storefront_id UUID NOT NULL REFERENCES storefronts(id) ON DELETE CASCADE,
            customer_id   UUID REFERENCES customers(id) ON DELETE CASCADE,
            device_id     UUID,                        -- guest device cart
            status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'checkout', 'abandoned')),
            created_at    TIMESTAMPTZ DEFAULT NOW(),
            updated_at    TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE (storefront_id, customer_id),
            UNIQUE (storefront_id, device_id)
        );
    """)
    op.execute(
        "CREATE INDEX idx_carts_storefront_id_status ON carts(storefront_id, status);"
    )

    # ---------------------------------------------------------------------------
    # 7. Cart items (unit price is snapshotted at add time)
    # ---------------------------------------------------------------------------
    op.execute("""
        CREATE TABLE cart_items (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            cart_id     UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
            product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            variant_id  UUID REFERENCES product_variants(id) ON DELETE CASCADE,
            quantity    INTEGER NOT NULL CHECK (quantity > 0),
            unit_price  NUMERIC(12,2) NOT NULL,
            created_at  TIMESTAMPTZ DEFAULT NOW(),
            updated_at  TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE (cart_id, product_id, variant_id)
        );
    """)
    # Allow only one row per simple (variant-less) product in a cart
    op.execute("""
        CREATE UNIQUE INDEX uq_cart_items_simple_product
        ON cart_items(cart_id, product_id)
        WHERE variant_id IS NULL;
    """)
    op.execute(
        "CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);"
    )

    # ---------------------------------------------------------------------------
    # 8. Orders + order items (raw-SQL pattern like the rest of the app;
    #    RLS intentionally NOT enabled - access is enforced explicitly in
    #    service-layer SQL via storefront_id / customer_id params)
    # ---------------------------------------------------------------------------
    op.execute("""
        CREATE TABLE orders (
            id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
            storefront_id     UUID NOT NULL REFERENCES storefronts(id) ON DELETE RESTRICT,
            customer_id       UUID REFERENCES customers(id) ON DELETE SET NULL,
            order_number      TEXT NOT NULL UNIQUE,
            status            TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'paid', 'processing', 'completed',
                                  'cancelled', 'failed')),
            subtotal          NUMERIC(12,2) NOT NULL DEFAULT 0,
            shipping_fee      NUMERIC(12,2) NOT NULL DEFAULT 0,
            total             NUMERIC(12,2) NOT NULL DEFAULT 0,
            currency          TEXT NOT NULL DEFAULT 'NGN',
            payment_gateway   TEXT,
            payment_reference TEXT,
            customer_email    TEXT,
            customer_name     TEXT,
            shipping_address  JSONB,
            created_at        TIMESTAMPTZ DEFAULT NOW(),
            updated_at        TIMESTAMPTZ DEFAULT NOW()
        );
    """)
    op.execute(
        "CREATE INDEX idx_orders_storefront_id ON orders(storefront_id);"
    )
    op.execute(
        "CREATE INDEX idx_orders_customer_id ON orders(customer_id);"
    )
    op.execute(
        "CREATE INDEX idx_orders_payment_reference ON orders(payment_reference);"
    )

    op.execute("""
        CREATE TABLE order_items (
            id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id    UUID NOT NULL,
            variant_id    UUID,
            product_name  TEXT NOT NULL,
            variant_label TEXT,
            unit_price    NUMERIC(12,2) NOT NULL,
            quantity      INTEGER NOT NULL,
            subtotal      NUMERIC(12,2) NOT NULL
        );
    """)
    op.execute(
        "CREATE INDEX idx_order_items_order_id ON order_items(order_id);"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP TABLE IF EXISTS order_items CASCADE;")
    op.execute("DROP TABLE IF EXISTS orders CASCADE;")
    op.execute("DROP TABLE IF EXISTS cart_items CASCADE;")
    op.execute("DROP TABLE IF EXISTS carts CASCADE;")
    op.execute("DROP TABLE IF EXISTS password_reset_tokens CASCADE;")
    op.execute("DROP TABLE IF EXISTS customer_sessions CASCADE;")
    op.execute("DROP TABLE IF EXISTS customer_email_codes CASCADE;")
    op.execute("DROP TABLE IF EXISTS customers CASCADE;")
    op.execute("DROP TABLE IF EXISTS platform_customers CASCADE;")