"""remove_visual_tool_config_columns

Revision ID: f2a3b4c5d6e7
Revises: f1a2b3c4d5e6
Create Date: 2025-10-09 21:56:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "f2a3b4c5d6e7"
down_revision: Union[str, Sequence[str], None] = "f1a2b3c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Remove configuration columns from visual_tools table
    # These columns are now dynamically retrieved from file system
    op.drop_column("visual_tools", "params_schema")
    op.drop_column("visual_tools", "defaults")
    op.drop_column("visual_tools", "sample_data_filename")
    op.drop_column("visual_tools", "sample_image_url")
    op.drop_column("visual_tools", "docs_markdown")


def downgrade() -> None:
    """Downgrade schema."""
    # Add back configuration columns to visual_tools table
    op.add_column("visual_tools", sa.Column("params_schema", sa.JSON(), nullable=True))
    op.add_column("visual_tools", sa.Column("defaults", sa.JSON(), nullable=True))
    op.add_column(
        "visual_tools",
        sa.Column("sample_data_filename", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "visual_tools",
        sa.Column("sample_image_url", sa.String(length=500), nullable=True),
    )
    op.add_column("visual_tools", sa.Column("docs_markdown", sa.Text(), nullable=True))
