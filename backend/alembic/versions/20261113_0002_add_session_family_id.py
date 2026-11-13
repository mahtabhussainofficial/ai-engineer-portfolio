"""Add family_id to admin_sessions for session-family rotation and race resolution.

Revision ID: 0002_add_session_family_id
Revises: 0001_initial_schema
Create Date: 2026-11-13 12:00:00.000000+00:00
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002_add_session_family_id"
down_revision: str | Sequence[str] | None = "0001_initial_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("admin_sessions") as batch_op:
        batch_op.add_column(sa.Column("family_id", sa.Uuid(), nullable=True))

    # Backfill any existing sessions so family_id equals session id
    op.execute("UPDATE admin_sessions SET family_id = id WHERE family_id IS NULL")

    with op.batch_alter_table("admin_sessions") as batch_op:
        batch_op.alter_column("family_id", nullable=False)
        batch_op.create_index(
            op.f("ix_admin_sessions_family_id"),
            ["family_id"],
            unique=False,
        )
        batch_op.create_index(
            "ix_admin_sessions_family_revoked",
            ["family_id", "revoked_at"],
            unique=False,
        )


def downgrade() -> None:
    with op.batch_alter_table("admin_sessions") as batch_op:
        batch_op.drop_index("ix_admin_sessions_family_revoked")
        batch_op.drop_index(op.f("ix_admin_sessions_family_id"))
        batch_op.drop_column("family_id")
