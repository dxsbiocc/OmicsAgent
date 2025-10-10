from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Category(Base):
    """Generic category model for all content types"""

    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    slug = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    image_url = Column(
        String(500), nullable=True
    )  # Image URL for category representation
    is_active = Column(Boolean, default=True, nullable=False)

    # Content type this category is associated with
    content_type = Column(
        String(50), nullable=True, index=True
    )  # e.g., 'blog', 'visual', 'tool'

    # Hierarchical structure
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    level = Column(
        Integer, default=0, nullable=False
    )  # 0 = root, 1 = first level, etc.
    sort_order = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    parent = relationship("Category", remote_side=[id], back_populates="children")
    children = relationship("Category", back_populates="parent")
    blog_posts = relationship("BlogPost", back_populates="category")
    visual_tools = relationship("VisualTool", back_populates="category")

    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}', content_type='{self.content_type}')>"
