"""seed order management permissions and order note column

Revision ID: 9c0d1e2f3a4b
Revises: 7b8d9e1f2a3c
Create Date: 2026-09-17 12:05:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9c0d1e2f3a4b"
down_revision: Union[str, Sequence[str], None] = "7b8d9e1f2a3c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add order note column and seed order management permissions."""
    op.add_column("orders", sa.Column("note", sa.Text(), nullable=True))

    op.execute("""
        INSERT INTO permissions (code, name, resource, action, description)
        VALUES
            ('orders:read', 'View Orders', 'orders', 'read', 'View orders across your storefronts'),
            ('orders:update', 'Update Orders', 'orders', 'update', 'Update order status and notes'),
            ('orders:*', 'Order Administration', 'orders', '*', 'Full order management')
        ON CONFLICT (code) DO NOTHING;
        """)


def downgrade() -> None:
    """Remove order permissions and note column."""
    op.execute("""
        DELETE FROM permissions
        WHERE code IN ('orders:read', 'orders:update', 'orders:*');
        """)
    op.drop_column("orders", "note")