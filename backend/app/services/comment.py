from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.comment import Comment, UserCommentLike


class CommentService:
    """Service for comment operations"""

    @staticmethod
    async def update_like_count(comment_id: int, db: AsyncSession) -> int:
        """Update like count for a comment"""
        stmt = select(func.count(UserCommentLike.user_id)).where(
            UserCommentLike.comment_id == comment_id
        )
        result = await db.execute(stmt)
        like_count = result.scalar() or 0

        # Update the comment's like_count
        comment_stmt = select(Comment).where(Comment.id == comment_id)
        comment_result = await db.execute(comment_stmt)
        comment = comment_result.scalar_one_or_none()

        if comment:
            comment.like_count = like_count
            await db.commit()

        return like_count

    @staticmethod
    async def has_user_liked_comment(
        user_id: int, comment_id: int, db: AsyncSession
    ) -> bool:
        """Check if user has liked a comment"""
        stmt = select(UserCommentLike).where(
            UserCommentLike.user_id == user_id, UserCommentLike.comment_id == comment_id
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none() is not None
