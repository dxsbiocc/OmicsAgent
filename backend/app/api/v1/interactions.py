from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional

from app.db.base import get_db
from app.models.user import User
from app.models.blog import BlogPost, UserPostLike, UserPostFavorite
from app.core.security import get_current_active_user, get_current_user_optional
from app.schemas.interactions import (
    PostLikeResponse,
    PostFavoriteResponse,
    UserInteractionStats,
    PostInteractionStats,
)
from app.schemas.auth import UserStatsResponse
from app.services.statistics import StatisticsService
from app.services.blog import BlogService
from app.utils.query_helpers import (
    get_blog_post_with_relationships,
    get_user_with_relationships,
)

router = APIRouter(prefix="/interactions", tags=["interactions"])


@router.post("/posts/{post_id}/like")
async def like_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Like a blog post"""
    # Check if post exists
    post = await get_blog_post_with_relationships(db, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )

    # Check if already liked
    existing_like = await db.execute(
        select(UserPostLike).where(
            UserPostLike.user_id == current_user.id,
            UserPostLike.post_id == post_id,
        )
    )
    if existing_like.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Post already liked"
        )

    # Create like
    like = UserPostLike(user_id=current_user.id, post_id=post_id)
    db.add(like)

    # Update post like count
    like_count = await BlogService.update_like_count(post_id, db)

    return PostLikeResponse(message="Post liked successfully", like_count=like_count)


@router.delete("/posts/{post_id}/like")
async def unlike_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Unlike a blog post"""
    # Check if like exists
    existing_like = await db.execute(
        select(UserPostLike).where(
            UserPostLike.user_id == current_user.id,
            UserPostLike.post_id == post_id,
        )
    )
    like = existing_like.scalar_one_or_none()
    if not like:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Like not found"
        )

    # Remove like
    await db.delete(like)

    # Update post like count
    like_count = await BlogService.update_like_count(post_id, db)

    return PostLikeResponse(
        message="Post unliked successfully",
        like_count=like_count,
    )


@router.post("/posts/{post_id}/favorite")
async def favorite_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Add post to favorites"""
    # Check if post exists
    post = await get_blog_post_with_relationships(db, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )

    # Check if already favorited
    existing_favorite = await db.execute(
        select(UserPostFavorite).where(
            UserPostFavorite.user_id == current_user.id,
            UserPostFavorite.post_id == post_id,
        )
    )
    if existing_favorite.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Post already favorited"
        )

    # Create favorite
    favorite = UserPostFavorite(user_id=current_user.id, post_id=post_id)
    db.add(favorite)

    # Update post favorite count
    favorite_count = await BlogService.update_favorite_count(post_id, db)

    return PostFavoriteResponse(
        message="Post favorited successfully",
        favorite_count=favorite_count,
    )


@router.delete("/posts/{post_id}/favorite")
async def unfavorite_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove post from favorites"""
    # Check if favorite exists
    existing_favorite = await db.execute(
        select(UserPostFavorite).where(
            UserPostFavorite.user_id == current_user.id,
            UserPostFavorite.post_id == post_id,
        )
    )
    favorite = existing_favorite.scalar_one_or_none()
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Favorite not found"
        )

    # Remove favorite
    await db.delete(favorite)

    # Update post favorite count
    favorite_count = await BlogService.update_favorite_count(post_id, db)

    return PostFavoriteResponse(
        message="Post unfavorited successfully",
        favorite_count=favorite_count,
    )


@router.get("/users/{user_id}/stats", response_model=UserStatsResponse)
async def get_user_stats(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user statistics - computed in real-time"""
    user = await get_user_with_relationships(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Get computed statistics via service
    stats = await StatisticsService.get_user_statistics(user.id, db)

    # Get additional stats (these methods need to be implemented)
    total_likes_given = 0  # TODO: Implement get_total_likes_given
    total_favorites_given = 0  # TODO: Implement get_total_favorites_given
    total_posts_published = stats["total_posts"]

    return UserStatsResponse(
        user_id=user.id,
        username=user.username,
        total_posts=stats["total_posts"],
        total_likes_received=stats["total_likes_received"],
        total_views_received=stats["total_views_received"],
        total_comments_received=stats["total_comments_received"],
        total_comment_likes_received=stats["total_comment_likes_received"],
        total_likes_given=total_likes_given,
        total_favorites_given=total_favorites_given,
        total_posts_published=total_posts_published,
    )


@router.get("/users/{user_id}/liked-posts")
async def get_user_liked_posts(
    user_id: int,
    skip: int = 0,
    limit: int = 10,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Get posts liked by a user"""
    user = await get_user_with_relationships(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Get liked posts
    stmt = (
        select(BlogPost)
        .join(UserPostLike, BlogPost.id == UserPostLike.post_id)
        .where(UserPostLike.user_id == user_id)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    posts = result.scalars().all()

    return posts


@router.get("/users/{user_id}/favorited-posts")
async def get_user_favorited_posts(
    user_id: int,
    skip: int = 0,
    limit: int = 10,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Get posts favorited by a user"""
    user = await get_user_with_relationships(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Get favorited posts
    stmt = (
        select(BlogPost)
        .join(UserPostFavorite, BlogPost.id == UserPostFavorite.post_id)
        .where(UserPostFavorite.user_id == user_id)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    posts = result.scalars().all()

    return posts
