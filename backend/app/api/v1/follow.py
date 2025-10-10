from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db.base import get_db
from app.models.user import User
from app.core.security import get_current_active_user
from app.api.deps import get_pagination_params
from app.core.logging import get_logger
from app.services.follow import FollowService
from app.utils.query_helpers import get_user_with_relationships

router = APIRouter(prefix="/follow", tags=["follow"])

# Import schemas
from app.schemas.follow import (
    FollowRequest,
    FollowResponse,
    UserFollowInfo,
    FollowListResponse,
    FollowStatsResponse,
)


@router.post("/{user_id}", response_model=FollowResponse)
async def follow_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Follow a user"""
    logger = get_logger("follow")
    logger.info(f"User {current_user.id} attempting to follow user {user_id}")

    # Check if target user exists
    target_user = await get_user_with_relationships(db, user_id)
    if not target_user:
        logger.warning(f"Target user not found: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Follow the user
    success = await FollowService.follow_user(current_user.id, user_id, db)

    if not success:
        if current_user.id == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot follow yourself"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already following this user",
            )

    logger.info(f"User {current_user.id} successfully followed user {user_id}")
    return FollowResponse(message="Successfully followed user", is_following=True)


@router.delete("/{user_id}", response_model=FollowResponse)
async def unfollow_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Unfollow a user"""
    logger = get_logger("follow")
    logger.info(f"User {current_user.id} attempting to unfollow user {user_id}")

    # Check if target user exists
    target_user = await get_user_with_relationships(db, user_id)
    if not target_user:
        logger.warning(f"Target user not found: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Unfollow the user
    success = await FollowService.unfollow_user(current_user.id, user_id, db)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Not following this user"
        )

    logger.info(f"User {current_user.id} successfully unfollowed user {user_id}")
    return FollowResponse(message="Successfully unfollowed user", is_following=False)


@router.get("/{user_id}/status", response_model=FollowResponse)
async def get_follow_status(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Check if current user is following another user"""
    logger = get_logger("follow")
    logger.info(f"Checking follow status: {current_user.id} -> {user_id}")

    is_following = await FollowService.is_following(current_user.id, user_id, db)

    return FollowResponse(message="Follow status retrieved", is_following=is_following)


@router.get("/{user_id}/followers", response_model=FollowListResponse)
async def get_user_followers(
    user_id: int,
    pagination: dict = Depends(get_pagination_params),
    db: AsyncSession = Depends(get_db),
):
    """Get followers of a user"""
    logger = get_logger("follow")
    logger.info(f"Getting followers for user {user_id}")

    # Check if user exists
    user = await get_user_with_relationships(db, user_id)
    if not user:
        logger.warning(f"User not found: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Get followers
    followers = await FollowService.get_followers(
        user_id, db, pagination["limit"], pagination["skip"]
    )

    # Get total count
    total = await FollowService.get_follower_count(user_id, db)

    # Convert to response format
    follower_info = [
        UserFollowInfo(
            id=follower.id,
            username=follower.username,
            full_name=follower.full_name,
            avatar_url=follower.avatar_url,
            bio=follower.bio,
            created_at=follower.created_at,
        )
        for follower in followers
    ]

    logger.info(f"Returned {len(follower_info)} followers for user {user_id}")
    return FollowListResponse(
        users=follower_info,
        total=total,
        limit=pagination["limit"],
        offset=pagination["skip"],
    )


@router.get("/{user_id}/following", response_model=FollowListResponse)
async def get_user_following(
    user_id: int,
    pagination: dict = Depends(get_pagination_params),
    db: AsyncSession = Depends(get_db),
):
    """Get users that a user is following"""
    logger = get_logger("follow")
    logger.info(f"Getting following for user {user_id}")

    # Check if user exists
    user = await get_user_with_relationships(db, user_id)
    if not user:
        logger.warning(f"User not found: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Get following
    following = await FollowService.get_following(
        user_id, db, pagination["limit"], pagination["skip"]
    )

    # Get total count
    total = await FollowService.get_following_count(user_id, db)

    # Convert to response format
    following_info = [
        UserFollowInfo(
            id=user.id,
            username=user.username,
            full_name=user.full_name,
            avatar_url=user.avatar_url,
            bio=user.bio,
            created_at=user.created_at,
        )
        for user in following
    ]

    logger.info(f"Returned {len(following_info)} following for user {user_id}")
    return FollowListResponse(
        users=following_info,
        total=total,
        limit=pagination["limit"],
        offset=pagination["skip"],
    )


@router.get("/{user_id}/stats", response_model=FollowStatsResponse)
async def get_follow_stats(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get follow statistics for a user"""
    logger = get_logger("follow")
    logger.info(f"Getting follow stats for user {user_id}")

    # Check if user exists
    user = await get_user_with_relationships(db, user_id)
    if not user:
        logger.warning(f"User not found: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Get follow statistics
    stats = await FollowService.get_follow_stats(user_id, db)

    logger.info(f"Follow stats for user {user_id}: {stats}")
    return FollowStatsResponse(**stats)
