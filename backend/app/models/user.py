from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    Table,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


# Association table for user follows
user_follows = Table(
    "user_follows",
    Base.metadata,
    Column("follower_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("following_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column(
        "created_at", DateTime(timezone=True), server_default=func.now(), nullable=False
    ),
)


class User(Base):
    """User model for blog authors"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    is_email_verified = Column(Boolean, default=False, nullable=False)

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
    blog_posts = relationship("BlogPost", back_populates="author")
    images = relationship("ImageLibrary", back_populates="user")
    visual_tools = relationship("VisualTool", back_populates="author")
    tool_likes = relationship("UserToolLike", back_populates="user")
    tool_favorites = relationship("UserToolFavorite", back_populates="user")
    tool_comments = relationship("VisualToolComment", back_populates="user")
    comment_likes = relationship("VisualToolCommentLike", back_populates="user")

    # Follow relationships
    following = relationship(
        "User",
        secondary=user_follows,
        primaryjoin=(user_follows.c.follower_id == id),
        secondaryjoin=(user_follows.c.following_id == id),
        back_populates="followers",
    )
    followers = relationship(
        "User",
        secondary=user_follows,
        primaryjoin=(user_follows.c.following_id == id),
        secondaryjoin=(user_follows.c.follower_id == id),
        back_populates="following",
    )

    # Email verification relationship
    email_verifications = relationship("EmailVerification", back_populates="user")
    
    # Conversation relationship
    conversations = relationship("Conversation", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"
