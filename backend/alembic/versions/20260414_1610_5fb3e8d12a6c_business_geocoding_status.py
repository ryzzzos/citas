"""add geocoding status fields to businesses

Revision ID: 5fb3e8d12a6c
Revises: c8f4d1e2b9aa
Create Date: 2026-04-14 16:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "5fb3e8d12a6c"
down_revision: Union[str, None] = "c8f4d1e2b9aa"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "businesses",
        sa.Column("geocoding_status", sa.String(length=24), nullable=False, server_default="pending"),
    )
    op.add_column("businesses", sa.Column("geocoding_error", sa.Text(), nullable=True))
    op.add_column("businesses", sa.Column("geocoded_at", sa.DateTime(timezone=True), nullable=True))

    op.create_index(
        "ix_businesses_geocoding_status",
        "businesses",
        ["geocoding_status"],
        unique=False,
    )

    connection = op.get_bind()
    connection.execute(
        sa.text(
            """
            UPDATE businesses
            SET geocoding_status = 'success',
                geocoding_error = NULL,
                geocoded_at = created_at
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
            """
        )
    )
    connection.execute(
        sa.text(
            """
            UPDATE businesses
            SET geocoding_status = 'pending',
                geocoding_error = NULL,
                geocoded_at = NULL
            WHERE latitude IS NULL OR longitude IS NULL
            """
        )
    )

    op.alter_column("businesses", "geocoding_status", server_default=None)


def downgrade() -> None:
    op.drop_index("ix_businesses_geocoding_status", table_name="businesses")
    op.drop_column("businesses", "geocoded_at")
    op.drop_column("businesses", "geocoding_error")
    op.drop_column("businesses", "geocoding_status")
