"""enforce one business per owner

Revision ID: b4c2f1a9d7e3
Revises: 37a5a23d4c02
Create Date: 2026-03-20 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "b4c2f1a9d7e3"
down_revision: Union[str, None] = "37a5a23d4c02"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_unique_constraint("uq_businesses_owner_id", "businesses", ["owner_id"])


def downgrade() -> None:
    op.drop_constraint("uq_businesses_owner_id", "businesses", type_="unique")
