"""Remove category_id from visual_tools table

Revision ID: remove_category_id_visual_tools
Revises: f2a3b4c5d6e7
Create Date: 2025-10-10 14:35:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "remove_category_id_visual_tools"
down_revision: Union[str, Sequence[str], None] = "f2a3b4c5d6e7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Remove category_id column from visual_tools table."""
    # 删除外键约束
    op.drop_constraint(
        "visual_tools_category_id_fkey", "visual_tools", type_="foreignkey"
    )

    # 删除 category_id 列
    op.drop_column("visual_tools", "category_id")


def downgrade() -> None:
    """Downgrade schema - Add back category_id column to visual_tools table."""
    # 添加 category_id 列
    op.add_column("visual_tools", sa.Column("category_id", sa.Integer(), nullable=True))

    # 添加外键约束
    op.create_foreign_key(
        "visual_tools_category_id_fkey",
        "visual_tools",
        "categories",
        ["category_id"],
        ["id"],
    )
