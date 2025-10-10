from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional, Dict
from app.models.user import User
from app.models.blog import (
    BlogPost,
    UserPostLike,
    UserPostFavorite,
)
from app.models.comment import Comment, UserCommentLike
from app.utils.query_helpers import (
    get_user_with_relationships,
    get_blog_post_with_relationships,
)


class StatisticsService:
    """Service for managing user and post statistics"""

    @staticmethod
    async def get_total_posts(user_id: int, db: AsyncSession) -> int:
        stmt = select(func.count(BlogPost.id)).where(BlogPost.author_id == user_id)
        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_total_likes_received(user_id: int, db: AsyncSession) -> int:
        stmt = (
            select(func.count(UserPostLike.post_id))
            .join(BlogPost, UserPostLike.post_id == BlogPost.id)
            .where(BlogPost.author_id == user_id)
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_total_views_received(user_id: int, db: AsyncSession) -> int:
        stmt = select(func.sum(BlogPost.view_count)).where(
            BlogPost.author_id == user_id
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_total_comments_received(user_id: int, db: AsyncSession) -> int:
        stmt = select(func.count(Comment.id)).where(
            Comment.target_type == "blog_post",
            Comment.status == "approved",
            Comment.target_id.in_(
                select(BlogPost.id).where(BlogPost.author_id == user_id)
            ),
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_total_comment_likes_received(user_id: int, db: AsyncSession) -> int:
        stmt = select(func.count(UserCommentLike.user_id)).where(
            UserCommentLike.comment_id.in_(
                select(Comment.id).where(Comment.author_id == user_id)
            )
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_follower_count(user_id: int, db: AsyncSession) -> int:
        """Get total number of followers for a user"""
        from app.services.follow import FollowService

        return await FollowService.get_follower_count(user_id, db)

    @staticmethod
    async def get_following_count(user_id: int, db: AsyncSession) -> int:
        """Get total number of users this user follows"""
        from app.services.follow import FollowService

        return await FollowService.get_following_count(user_id, db)

    @staticmethod
    async def get_user_statistics(
        user_id: int, db: AsyncSession
    ) -> Optional[Dict[str, int]]:
        """Get computed statistics for a specific user"""
        user = await get_user_with_relationships(db, user_id)
        if not user:
            return None
        return {
            "total_posts": await StatisticsService.get_total_posts(user_id, db),
            "total_likes_received": await StatisticsService.get_total_likes_received(
                user_id, db
            ),
            "total_views_received": await StatisticsService.get_total_views_received(
                user_id, db
            ),
            "total_comments_received": await StatisticsService.get_total_comments_received(
                user_id, db
            ),
            "total_comment_likes_received": await StatisticsService.get_total_comment_likes_received(
                user_id, db
            ),
            "follower_count": await StatisticsService.get_follower_count(user_id, db),
            "following_count": await StatisticsService.get_following_count(user_id, db),
        }

    @staticmethod
    async def update_post_statistics(
        post_id: int, db: AsyncSession
    ) -> Optional[BlogPost]:
        """Update statistics for a specific post"""
        post = await get_blog_post_with_relationships(db, post_id)
        if not post:
            return None

        # Update like count
        like_stmt = select(func.count(UserPostLike.user_id)).where(
            UserPostLike.post_id == post.id
        )
        post.like_count = (await db.execute(like_stmt)).scalar() or 0

        # Update favorite count
        favorite_stmt = select(func.count(UserPostFavorite.user_id)).where(
            UserPostFavorite.post_id == post.id
        )
        post.favorite_count = (await db.execute(favorite_stmt)).scalar() or 0

        # Update comment count (approved)
        comment_stmt = select(func.count(Comment.id)).where(
            Comment.target_type == "blog_post",
            Comment.target_id == post.id,
            Comment.status == "approved",
        )
        post.comment_count = (await db.execute(comment_stmt)).scalar() or 0

        await db.commit()
        return post

    @staticmethod
    async def update_all_user_statistics(db: AsyncSession) -> int:
        """Update statistics for all users"""
        # Get all users
        users_stmt = select(User)
        result = await db.execute(users_stmt)
        users = result.scalars().all()

        updated_count = 0
        for user in users:
            await StatisticsService.update_user_statistics(user.id, db)
            updated_count += 1

        return updated_count

    @staticmethod
    async def update_all_post_statistics(db: AsyncSession) -> int:
        """Update statistics for all posts"""
        # Get all posts
        posts_stmt = select(BlogPost)
        result = await db.execute(posts_stmt)
        posts = result.scalars().all()

        updated_count = 0
        for post in posts:
            await StatisticsService.update_post_statistics(post.id, db)
            updated_count += 1

        return updated_count

    @staticmethod
    async def get_user_ranking(
        db: AsyncSession, metric: str = "total_likes_received", limit: int = 10
    ) -> List[User]:
        """Get user ranking by specified metric - computed in real-time"""
        valid_metrics = [
            "total_posts",
            "total_likes_received",
            "total_views_received",
            "total_comments_received",
            "total_comment_likes_received",
        ]

        if metric not in valid_metrics:
            raise ValueError(f"Invalid metric. Must be one of: {valid_metrics}")

        # Get all active users first
        stmt = select(User).where(User.is_active == True)
        result = await db.execute(stmt)
        users = result.scalars().all()

        # Compute statistics for each user and sort
        user_stats = []
        for user in users:
            stats = await StatisticsService.get_user_statistics(user.id, db)
            user_stats.append((user, stats.get(metric, 0)))

        # Sort by metric value and return top users
        user_stats.sort(key=lambda x: x[1], reverse=True)
        return [user for user, _ in user_stats[:limit]]

    @staticmethod
    async def get_post_ranking(
        db: AsyncSession, metric: str = "like_count", limit: int = 10
    ) -> List[BlogPost]:
        """Get post ranking by specified metric"""
        valid_metrics = ["view_count", "like_count", "favorite_count", "comment_count"]

        if metric not in valid_metrics:
            raise ValueError(f"Invalid metric. Must be one of: {valid_metrics}")

        # Get ranking
        order_column = getattr(BlogPost, metric)
        stmt = (
            select(BlogPost)
            .where(BlogPost.status == "published")
            .order_by(order_column.desc())
            .limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def get_user_interaction_stats(user_id: int, db: AsyncSession) -> dict:
        """Get detailed interaction statistics for a user"""
        user = await get_user_with_relationships(db, user_id)
        if not user:
            return {}

        # Get likes given
        likes_given_stmt = select(func.count(UserPostLike.user_id)).where(
            UserPostLike.user_id == user_id
        )
        likes_given = (await db.execute(likes_given_stmt)).scalar() or 0

        # Get favorites given
        favorites_given_stmt = select(func.count(UserPostFavorite.user_id)).where(
            UserPostFavorite.user_id == user_id
        )
        favorites_given = (await db.execute(favorites_given_stmt)).scalar() or 0

        # Get posts published
        posts_published_stmt = select(func.count(BlogPost.id)).where(
            BlogPost.author_id == user_id, BlogPost.status == "published"
        )
        posts_published = (await db.execute(posts_published_stmt)).scalar() or 0

        # Get most liked post
        most_liked_stmt = (
            select(BlogPost)
            .where(BlogPost.author_id == user_id)
            .order_by(BlogPost.like_count.desc())
            .limit(1)
        )
        most_liked_result = await db.execute(most_liked_stmt)
        most_liked_post = most_liked_result.scalar_one_or_none()

        return {
            "user_id": user_id,
            "likes_given": likes_given,
            "favorites_given": favorites_given,
            "posts_published": posts_published,
            "most_liked_post": (
                {
                    "id": most_liked_post.id,
                    "title": most_liked_post.title,
                    "like_count": most_liked_post.like_count,
                }
                if most_liked_post
                else None
            ),
        }
