"""add image_url to services

Revision ID: 9d1f7c3b2a11
Revises: b4c2f1a9d7e3
Create Date: 2026-04-03 14:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9d1f7c3b2a11"
down_revision: Union[str, None] = "b4c2f1a9d7e3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("services", sa.Column("image_url", sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column("services", "image_url")
