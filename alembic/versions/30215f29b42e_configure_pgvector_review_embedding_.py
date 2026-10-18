"""configure pgvector review embedding storage

Revision ID: 30215f29b42e
Revises: 38a4660c1182
Create Date: 2026-10-17 20:57:11.356053

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector


# revision identifiers, used by Alembic.
revision: str = "30215f29b42e"
down_revision: Union[str, Sequence[str], None] = "38a4660c1182"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "CREATE EXTENSION IF NOT EXISTS vector"
    )

    op.create_table(
        "review_embeddings",

        sa.Column(
            "id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "review_id",
            sa.Integer(),
            nullable=False
        ),

        sa.Column(
            "embedding",
            Vector(1536),
            nullable=False
        ),

        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False
        ),

        sa.ForeignKeyConstraint(
            ["review_id"],
            ["reviews.id"],
            ondelete="CASCADE"
        ),

        sa.PrimaryKeyConstraint(
            "id"
        )
    )

    op.create_index(
        op.f(
            "ix_review_embeddings_review_id"
        ),
        "review_embeddings",
        ["review_id"],
        unique=True
    )


def downgrade() -> None:
    op.drop_index(
        op.f(
            "ix_review_embeddings_review_id"
        ),
        table_name="review_embeddings"
    )

    op.drop_table(
        "review_embeddings"
    )