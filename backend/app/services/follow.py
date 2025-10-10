from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from app.models.user import User, user_follows
from app.core.logging import get_logger


class FollowService:
    """Service for user follow operations"""

    @staticmethod
    async def follow_user(
        follower_id: int, following_id: int, db: AsyncSession
    ) -> bool:
        """Follow a user"""
        logger = get_logger("follow")

        # Check if already following
        if await FollowService.is_following(follower_id, following_id, db):
            logger.warning(f"User {follower_id} already follows user {following_id}")
            return False

        # Check if trying to follow self
        if follower_id == following_id:
            logger.warning(f"User {follower_id} cannot follow themselves")
            return False

        # Add follow relationship
        stmt = user_follows.insert().values(
            follower_id=follower_id, following_id=following_id
        )
        await db.execute(stmt)
        await db.commit()

        logger.info(f"User {follower_id} now follows user {following_id}")
        return True

    @staticmethod
    async def unfollow_user(
        follower_id: int, following_id: int, db: AsyncSession
    ) -> bool:
        """Unfollow a user"""
        logger = get_logger("follow")

        # Check if currently following
        if not await FollowService.is_following(follower_id, following_id, db):
            logger.warning(f"User {follower_id} is not following user {following_id}")
            return False

        # Remove follow relationship
        stmt = delete(user_follows).where(
            user_follows.c.follower_id == follower_id,
            user_follows.c.following_id == following_id,
        )
        await db.execute(stmt)
        await db.commit()

        logger.info(f"User {follower_id} unfollowed user {following_id}")
        return True

    @staticmethod
    async def is_following(
        follower_id: int, following_id: int, db: AsyncSession
    ) -> bool:
        """Check if user is following another user"""
        stmt = select(user_follows).where(
            user_follows.c.follower_id == follower_id,
            user_follows.c.following_id == following_id,
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none() is not None

    @staticmethod
    async def get_followers(
        user_id: int, db: AsyncSession, limit: int = 50, offset: int = 0
    ) -> List[User]:
        """Get users who follow this user"""
        stmt = (
            select(User)
            .join(user_follows, User.id == user_follows.c.follower_id)
            .where(user_follows.c.following_id == user_id)
            .offset(offset)
            .limit(limit)
        )

        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_following(
        user_id: int, db: AsyncSession, limit: int = 50, offset: int = 0
    ) -> List[User]:
        """Get users that this user follows"""
        stmt = (
            select(User)
            .join(user_follows, User.id == user_follows.c.following_id)
            .where(user_follows.c.follower_id == user_id)
            .offset(offset)
            .limit(limit)
        )

        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_follower_count(user_id: int, db: AsyncSession) -> int:
        """Get total number of followers for a user"""
        stmt = select(func.count(user_follows.c.follower_id)).where(
            user_follows.c.following_id == user_id
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_following_count(user_id: int, db: AsyncSession) -> int:
        """Get total number of users this user follows"""
        stmt = select(func.count(user_follows.c.following_id)).where(
            user_follows.c.follower_id == user_id
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_follow_stats(user_id: int, db: AsyncSession) -> dict:
        """Get follow statistics for a user"""
        follower_count = await FollowService.get_follower_count(user_id, db)
        following_count = await FollowService.get_following_count(user_id, db)

        return {"follower_count": follower_count, "following_count": following_count}
