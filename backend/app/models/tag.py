from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Tag(Base):
    """Generic tag model for all content types"""

    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    color = Column(String(7), nullable=True)  # Hex color code
    image_url = Column(String(500), nullable=True)  # Image URL for tag representation
    is_active = Column(Boolean, default=True, nullable=False)

    # Content type this tag is associated with
    content_type = Column(
        String(50), nullable=True, index=True
    )  # e.g., 'blog', 'visual', 'tool'

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
    blog_posts = relationship(
        "BlogPost", secondary="blog_post_tags", back_populates="tags"
    )
    visual_tools = relationship(
        "VisualTool", secondary="visual_tool_tags", back_populates="tags"
    )

    def __repr__(self):
        return f"<Tag(id={self.id}, name='{self.name}', content_type='{self.content_type}')>"
