from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Comment(Base):
    """Generic comment model with polymorphic target.

    A comment belongs to:
      - an author (user)
      - an optional parent comment (for nesting)
      - a target identified by (target_type, target_id)

    target_type examples: 'blog_post', 'message_board', 'drawing', etc.
    target_id: primary key id of the target entity
    """

    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)

    # author
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    author = relationship("User", backref="comments")

    # nesting
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True, index=True)
    parent = relationship("Comment", remote_side=[id], backref="replies")

    # content
    content = Column(Text, nullable=False)
    status = Column(
        String(20), default="pending", nullable=False
    )  # pending/approved/rejected
    like_count = Column(Integer, default=0, nullable=False)

    # polymorphic target
    target_type = Column(String(50), nullable=False, index=True)
    target_id = Column(Integer, nullable=False, index=True)

    # timestamps
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def update_like_count(self, db_session):
        """Update like count for this comment"""
        from sqlalchemy import select, func

        stmt = select(func.count(UserCommentLike.user_id)).where(
            UserCommentLike.comment_id == self.id
        )
        self.like_count = db_session.execute(stmt).scalar() or 0

    def has_liked_comment(self, user_id, db_session):
        """Check if this user has liked this comment"""
        from sqlalchemy import select

        stmt = select(UserCommentLike).where(
            UserCommentLike.user_id == user_id, UserCommentLike.comment_id == self.id
        )
        result = db_session.execute(stmt)
        return result.scalar_one_or_none() is not None

    def __repr__(self):
        return f"<Comment(id={self.id}, target={self.target_type}:{self.target_id}, author_id={self.author_id})>"


class UserCommentLike(Base):
    """User comment likes association table"""

    __tablename__ = "user_comment_likes"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    comment_id = Column(Integer, ForeignKey("comments.id"), primary_key=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user = relationship("User", backref="liked_comments")
    comment = relationship("Comment", backref="liked_by_users")
