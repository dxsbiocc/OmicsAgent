"""add_visual_tool_interaction_tables

Revision ID: f1a2b3c4d5e6
Revises: eadcbae9d9e0
Create Date: 2025-10-09 21:55:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "f1a2b3c4d5e6"
down_revision: Union[str, Sequence[str], None] = "eadcbae9d9e0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create visual_tools table
    op.create_table(
        "visual_tools",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tool", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category_id", sa.Integer(), nullable=True),
        sa.Column("author_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("featured", sa.Boolean(), nullable=False),
        sa.Column("view_count", sa.Integer(), nullable=False),
        sa.Column("like_count", sa.Integer(), nullable=False),
        sa.Column("favorite_count", sa.Integer(), nullable=False),
        sa.Column("comment_count", sa.Integer(), nullable=False),
        sa.Column("usage_count", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["author_id"],
            ["users.id"],
        ),
        sa.ForeignKeyConstraint(
            ["category_id"],
            ["categories.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_visual_tools_id"), "visual_tools", ["id"], unique=False)
    op.create_index(
        op.f("ix_visual_tools_name"), "visual_tools", ["name"], unique=False
    )
    op.create_index(op.f("ix_visual_tools_tool"), "visual_tools", ["tool"], unique=True)

    # Create visual_tool_tags table
    op.create_table(
        "visual_tool_tags",
        sa.Column("tool_id", sa.Integer(), nullable=False),
        sa.Column("tag_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["tag_id"],
            ["tags.id"],
        ),
        sa.ForeignKeyConstraint(
            ["tool_id"],
            ["visual_tools.id"],
        ),
        sa.PrimaryKeyConstraint("tool_id", "tag_id"),
    )

    # Create user_tool_likes table
    op.create_table(
        "user_tool_likes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("tool_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["tool_id"],
            ["visual_tools.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "tool_id", name="unique_user_tool_like"),
    )
    op.create_index(
        op.f("ix_user_tool_likes_id"), "user_tool_likes", ["id"], unique=False
    )

    # Create user_tool_favorites table
    op.create_table(
        "user_tool_favorites",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("tool_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["tool_id"],
            ["visual_tools.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "tool_id", name="unique_user_tool_favorite"),
    )
    op.create_index(
        op.f("ix_user_tool_favorites_id"), "user_tool_favorites", ["id"], unique=False
    )

    # Create visual_tool_comments table
    op.create_table(
        "visual_tool_comments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tool_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("parent_id", sa.Integer(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("like_count", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["parent_id"],
            ["visual_tool_comments.id"],
        ),
        sa.ForeignKeyConstraint(
            ["tool_id"],
            ["visual_tools.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_visual_tool_comments_id"), "visual_tool_comments", ["id"], unique=False
    )

    # Create visual_tool_comment_likes table
    op.create_table(
        "visual_tool_comment_likes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("comment_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["comment_id"],
            ["visual_tool_comments.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("comment_id", "user_id", name="unique_comment_user_like"),
    )
    op.create_index(
        op.f("ix_visual_tool_comment_likes_id"),
        "visual_tool_comment_likes",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop tables in reverse order
    op.drop_index(
        op.f("ix_visual_tool_comment_likes_id"), table_name="visual_tool_comment_likes"
    )
    op.drop_table("visual_tool_comment_likes")
    op.drop_index(op.f("ix_visual_tool_comments_id"), table_name="visual_tool_comments")
    op.drop_table("visual_tool_comments")
    op.drop_index(op.f("ix_user_tool_favorites_id"), table_name="user_tool_favorites")
    op.drop_table("user_tool_favorites")
    op.drop_index(op.f("ix_user_tool_likes_id"), table_name="user_tool_likes")
    op.drop_table("user_tool_likes")
    op.drop_table("visual_tool_tags")
    op.drop_index(op.f("ix_visual_tools_tool"), table_name="visual_tools")
    op.drop_index(op.f("ix_visual_tools_name"), table_name="visual_tools")
    op.drop_index(op.f("ix_visual_tools_id"), table_name="visual_tools")
    op.drop_table("visual_tools")
