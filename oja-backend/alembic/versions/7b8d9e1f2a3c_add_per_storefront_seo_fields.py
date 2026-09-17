"""add per-storefront SEO fields

Revision ID: 7b8d9e1f2a3c
Revises: c5a2fa1b9d3e
Create Date: 2026-09-17 12:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "7b8d9e1f2a3c"
down_revision: Union[str, Sequence[str], None] = "c5a2fa1b9d3e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add SEO metadata columns to storefronts."""
    op.add_column("storefronts", sa.Column("meta_title", sa.Text(), nullable=True))
    op.add_column("storefronts", sa.Column("meta_description", sa.Text(), nullable=True))
    op.add_column("storefronts", sa.Column("og_image", sa.Text(), nullable=True))
    op.add_column("storefronts", sa.Column("favicon", sa.Text(), nullable=True))


def downgrade() -> None:
    """Drop SEO metadata columns from storefronts."""
    op.drop_column("storefronts", "favicon")
    op.drop_column("storefronts", "og_image")
    op.drop_column("storefronts", "meta_description")
    op.drop_column("storefronts", "meta_title")