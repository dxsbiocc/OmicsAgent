from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.blog import BlogPost, UserPostLike, UserPostFavorite


class InteractionService:
    """Utilities for post likes and favorites related to users"""

    @staticmethod
    async def has_user_liked_post(user_id: int, post_id: int, db: AsyncSession) -> bool:
        stmt = select(UserPostLike).where(
            UserPostLike.user_id == user_id, UserPostLike.post_id == post_id
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none() is not None

    @staticmethod
    async def has_user_favorited_post(
        user_id: int, post_id: int, db: AsyncSession
    ) -> bool:
        stmt = select(UserPostFavorite).where(
            UserPostFavorite.user_id == user_id, UserPostFavorite.post_id == post_id
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none() is not None

    @staticmethod
    async def get_total_likes_given(user_id: int, db: AsyncSession) -> int:
        stmt = select(func.count(UserPostLike.user_id)).where(
            UserPostLike.user_id == user_id
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_total_favorites_given(user_id: int, db: AsyncSession) -> int:
        stmt = select(func.count(UserPostFavorite.user_id)).where(
            UserPostFavorite.user_id == user_id
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_total_posts_published(user_id: int, db: AsyncSession) -> int:
        stmt = select(func.count(BlogPost.id)).where(
            BlogPost.author_id == user_id, BlogPost.status == "published"
        )
        result = await db.execute(stmt)
        return result.scalar() or 0
