"""add business profile identity fields

Revision ID: c8f4d1e2b9aa
Revises: 9d1f7c3b2a11
Create Date: 2026-04-04 10:30:00.000000

"""
from typing import Sequence, Union
import re

from alembic import op
import sqlalchemy as sa


revision: str = "c8f4d1e2b9aa"
down_revision: Union[str, None] = "9d1f7c3b2a11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return slug or "business"


def upgrade() -> None:
    op.add_column("businesses", sa.Column("slug", sa.String(length=90), nullable=True))
    op.add_column("businesses", sa.Column("cover_image_url", sa.String(length=500), nullable=True))
    op.add_column("businesses", sa.Column("logo_image_url", sa.String(length=500), nullable=True))
    op.add_column("businesses", sa.Column("whatsapp_phone", sa.String(length=30), nullable=True))
    op.add_column("businesses", sa.Column("public_bio", sa.String(length=280), nullable=True))

    connection = op.get_bind()
    rows = connection.execute(sa.text("SELECT id, name FROM businesses ORDER BY created_at, id")).mappings().all()

    used: set[str] = set()
    for row in rows:
        base = _slugify(row["name"] or "business")
        candidate = base
        suffix = 1

        while candidate in used:
            candidate = f"{base}-{suffix}"
            suffix += 1

        connection.execute(
            sa.text("UPDATE businesses SET slug = :slug WHERE id = :id"),
            {"slug": candidate, "id": row["id"]},
        )
        used.add(candidate)

    op.alter_column("businesses", "slug", nullable=False)
    op.create_index("ix_businesses_slug", "businesses", ["slug"], unique=False)
    op.create_index("uq_businesses_slug_lower", "businesses", [sa.text("lower(slug)")], unique=True)


def downgrade() -> None:
    op.drop_index("uq_businesses_slug_lower", table_name="businesses")
    op.drop_index("ix_businesses_slug", table_name="businesses")
    op.drop_column("businesses", "public_bio")
    op.drop_column("businesses", "whatsapp_phone")
    op.drop_column("businesses", "logo_image_url")
    op.drop_column("businesses", "cover_image_url")
    op.drop_column("businesses", "slug")
