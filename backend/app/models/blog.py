from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
from app.models.comment import Comment


class BlogPost(Base):
    """Blog post model"""

    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    content = Column(Text, nullable=False)
    excerpt = Column(Text, nullable=True)
    background_image_url = Column(
        String(500), nullable=True
    )  # Background image URL for blog post
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    status = Column(
        String(20), default="draft", nullable=False
    )  # draft, published, archived
    featured = Column(Boolean, default=False, nullable=False)
    comments_enabled = Column(
        Boolean, default=True, nullable=False
    )  # Allow comments by default
    view_count = Column(Integer, default=0, nullable=False)
    like_count = Column(Integer, default=0, nullable=False)
    favorite_count = Column(Integer, default=0, nullable=False)
    comment_count = Column(Integer, default=0, nullable=False)

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
    published_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    author = relationship("User", back_populates="blog_posts")
    category = relationship("Category", back_populates="blog_posts")
    tags = relationship("Tag", secondary="blog_post_tags", back_populates="blog_posts")

    # Count update methods moved to BlogService for better separation of concerns

    def __repr__(self):
        return f"<BlogPost(id={self.id}, title='{self.title}', status='{self.status}')>"


class BlogPostTag(Base):
    """Association table for blog posts and tags"""

    __tablename__ = "blog_post_tags"

    post_id = Column(Integer, ForeignKey("blog_posts.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True)


class UserPostLike(Base):
    """User post likes association table"""

    __tablename__ = "user_post_likes"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    post_id = Column(Integer, ForeignKey("blog_posts.id"), primary_key=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user = relationship("User", backref="liked_posts")
    post = relationship("BlogPost", backref="liked_by_users")


class UserPostFavorite(Base):
    """User post favorites association table"""

    __tablename__ = "user_post_favorites"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    post_id = Column(Integer, ForeignKey("blog_posts.id"), primary_key=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user = relationship("User", backref="favorited_posts")
    post = relationship("BlogPost", backref="favorited_by_users")
