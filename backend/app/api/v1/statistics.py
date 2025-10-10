from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db.base import get_db
from app.models.user import User
from app.models.blog import BlogPost
from app.core.security import (
    get_current_admin_user,
    get_current_user_optional,
)
from app.services.statistics import StatisticsService
from app.schemas.statistics import (
    UserRankingItem,
    PostRankingItem,
    StatisticsOverview,
    UserStatsResponse,
    PostStatsResponse,
    RankingRequest,
    StatisticsUpdateRequest,
)

router = APIRouter(prefix="/statistics", tags=["statistics"])


@router.get("/users/ranking", response_model=List[UserRankingItem])
async def get_user_ranking(
    metric: str = Query("total_likes_received", description="Ranking metric"),
    limit: int = Query(10, ge=1, le=100, description="Number of users to return"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Get user ranking by specified metric"""
    try:
        users = await StatisticsService.get_user_ranking(db, metric, limit)
        return [
            UserRankingItem(
                rank=i + 1,
                user_id=user.id,
                username=user.username,
                total_posts=user.total_posts,
                total_likes_received=user.total_likes_received,
                total_views_received=user.total_views_received,
                total_comments_received=user.total_comments_received,
                total_comment_likes_received=user.total_comment_likes_received,
            )
            for i, user in enumerate(users)
        ]
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/posts/ranking", response_model=List[PostRankingItem])
async def get_post_ranking(
    metric: str = Query("like_count", description="Ranking metric"),
    limit: int = Query(10, ge=1, le=100, description="Number of posts to return"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Get post ranking by specified metric"""
    try:
        posts = await StatisticsService.get_post_ranking(db, metric, limit)
        return [
            PostRankingItem(
                rank=i + 1,
                post_id=post.id,
                title=post.title,
                author_username=post.author.username if post.author else "Unknown",
                view_count=post.view_count,
                like_count=post.like_count,
                favorite_count=post.favorite_count,
                comment_count=post.comment_count,
            )
            for i, post in enumerate(posts)
        ]
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/users/{user_id}/interactions")
async def get_user_interaction_stats(
    user_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Get detailed interaction statistics for a user"""
    stats = await StatisticsService.get_user_interaction_stats(user_id, db)
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return stats


@router.post("/users/{user_id}/update")
async def update_user_statistics(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update statistics for a specific user (admin only)"""
    user = await StatisticsService.update_user_statistics(user_id, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return {"message": f"Statistics updated for user {user.username}"}


@router.post("/posts/{post_id}/update")
async def update_post_statistics(
    post_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update statistics for a specific post (admin only)"""
    post = await StatisticsService.update_post_statistics(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )
    return {"message": f"Statistics updated for post '{post.title}'"}


@router.post("/users/update-all")
async def update_all_user_statistics(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update statistics for all users (admin only)"""
    updated_count = await StatisticsService.update_all_user_statistics(db)
    return {"message": f"Updated statistics for {updated_count} users"}


@router.post("/posts/update-all")
async def update_all_post_statistics(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update statistics for all posts (admin only)"""
    updated_count = await StatisticsService.update_all_post_statistics(db)
    return {"message": f"Updated statistics for {updated_count} posts"}


@router.get("/overview")
async def get_statistics_overview(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Get overall statistics overview"""
    from sqlalchemy import select, func

    # Total users
    total_users_stmt = select(func.count(User.id))
    total_users = (await db.execute(total_users_stmt)).scalar() or 0

    # Active users
    active_users_stmt = select(func.count(User.id)).where(User.is_active == True)
    active_users = (await db.execute(active_users_stmt)).scalar() or 0

    # Total posts
    total_posts_stmt = select(func.count(BlogPost.id))
    total_posts = (await db.execute(total_posts_stmt)).scalar() or 0

    # Published posts
    published_posts_stmt = select(func.count(BlogPost.id)).where(
        BlogPost.status == "published"
    )
    published_posts = (await db.execute(published_posts_stmt)).scalar() or 0

    # Total likes
    from app.models.blog import UserPostLike

    total_likes_stmt = select(func.count(UserPostLike.user_id))
    total_likes = (await db.execute(total_likes_stmt)).scalar() or 0

    # Total favorites
    from app.models.blog import UserPostFavorite

    total_favorites_stmt = select(func.count(UserPostFavorite.user_id))
    total_favorites = (await db.execute(total_favorites_stmt)).scalar() or 0

    # Total views
    total_views_stmt = select(func.sum(BlogPost.view_count))
    total_views = (await db.execute(total_views_stmt)).scalar() or 0

    return {
        "users": {
            "total": total_users,
            "active": active_users,
        },
        "posts": {
            "total": total_posts,
            "published": published_posts,
        },
        "interactions": {
            "total_likes": total_likes,
            "total_favorites": total_favorites,
            "total_views": total_views,
        },
    }
