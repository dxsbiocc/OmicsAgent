from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional
from datetime import datetime

from app.db.base import get_db
from app.models.user import User
from app.models.comment import Comment, UserCommentLike
from app.core.security import get_current_active_user, get_current_user_optional
from app.api.deps import get_pagination_params
from app.core.logging import get_logger

router = APIRouter(prefix="/comments", tags=["comments"])


# Import schemas from dedicated files
from app.schemas.comments import (
    CommentCreate,
    CommentUpdate,
    CommentResponse,
    CommentLikeResponse,
)


@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new comment"""
    logger = get_logger("comments")
    logger.info(
        f"创建评论: target={comment_data.target_type}:{comment_data.target_id}",
        extra={"user_id": current_user.id},
    )

    # Check if parent comment exists and belongs to same target
    if comment_data.parent_id:
        parent_comment = await db.get(Comment, comment_data.parent_id)
        if (
            not parent_comment
            or parent_comment.target_type != comment_data.target_type
            or parent_comment.target_id != comment_data.target_id
        ):
            logger.warning(f"无效的父评论: {comment_data.parent_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid parent comment"
            )

    # Create comment
    comment = Comment(
        author_id=current_user.id,
        content=comment_data.content,
        parent_id=comment_data.parent_id,
        target_type=comment_data.target_type,
        target_id=comment_data.target_id,
        status="pending",  # Comments need approval
    )

    db.add(comment)
    await db.commit()
    await db.refresh(comment)

    logger.info(f"评论创建成功: {comment.id}")
    from app.services.comment import CommentService

    return await CommentService.get_comment_response(comment.id, db, current_user.id)


@router.get("/", response_model=List[CommentResponse])
async def get_comments(
    target_type: str = Query(..., description="Target type"),
    target_id: int = Query(..., description="Target ID"),
    status: str = Query("approved", description="Filter by status"),
    include_replies: bool = Query(True, description="Include replies"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Get comments for a specific target"""
    logger = get_logger("comments")
    logger.info(f"获取评论: target={target_type}:{target_id}, status={status}")

    query = select(Comment).where(
        Comment.target_type == target_type,
        Comment.target_id == target_id,
        Comment.status == status,
    )

    if include_replies:
        # Only top-level comments (no parent)
        query = query.where(Comment.parent_id.is_(None))

    query = query.order_by(Comment.created_at.desc())

    result = await db.execute(query)
    comments = result.scalars().all()

    # Convert to response format
    comment_responses = []
    for comment in comments:
        from app.services.comment import CommentService

        comment_response = await CommentService.get_comment_response(
            comment.id, db, current_user.id if current_user else None
        )
        comment_responses.append(comment_response)

    logger.info(f"返回 {len(comment_responses)} 条评论")
    return comment_responses


@router.get("/{comment_id}", response_model=CommentResponse)
async def get_comment(
    comment_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific comment"""
    logger = get_logger("comments")
    logger.info(f"获取评论: {comment_id}")

    comment = await db.get(Comment, comment_id)
    if not comment:
        logger.warning(f"评论不存在: {comment_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
        )

    from app.services.comment import CommentService

    return await CommentService.get_comment_response(
        comment.id, db, current_user.id if current_user else None
    )


@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment_data: CommentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a comment (author or admin only)"""
    logger = get_logger("comments")
    logger.info(f"更新评论: {comment_id}", extra={"user_id": current_user.id})

    comment = await db.get(Comment, comment_id)
    if not comment:
        logger.warning(f"评论不存在: {comment_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
        )

    # Check if user is author or admin
    if comment.author_id != current_user.id and not current_user.is_admin:
        logger.warning(f"用户无权限更新评论: {comment_id}, user_id={current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )

    # Update comment data
    update_data = comment_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(comment, field, value)

    await db.commit()
    await db.refresh(comment)

    logger.info(f"评论更新成功: {comment_id}")
    from app.services.comment import CommentService

    return await CommentService.get_comment_response(comment.id, db, current_user.id)


@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a comment (author or admin only)"""
    logger = get_logger("comments")
    logger.info(f"删除评论: {comment_id}", extra={"user_id": current_user.id})

    comment = await db.get(Comment, comment_id)
    if not comment:
        logger.warning(f"评论不存在: {comment_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
        )

    # Check if user is author or admin
    if comment.author_id != current_user.id and not current_user.is_admin:
        logger.warning(f"用户无权限删除评论: {comment_id}, user_id={current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )

    # Update author statistics before deletion
    if comment.author:
        comment.author.update_statistics(db)

    await db.delete(comment)
    await db.commit()

    logger.info(f"评论删除成功: {comment_id}")
    return {"message": "Comment deleted successfully"}


# Comment like endpoints
@router.post("/{comment_id}/like")
async def like_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Like a comment"""
    logger = get_logger("comments")
    logger.info(f"点赞评论: {comment_id}", extra={"user_id": current_user.id})

    # Check if comment exists
    comment = await db.get(Comment, comment_id)
    if not comment:
        logger.warning(f"评论不存在: {comment_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
        )

    # Check if already liked
    existing_like = await db.execute(
        select(UserCommentLike).where(
            UserCommentLike.user_id == current_user.id,
            UserCommentLike.comment_id == comment_id,
        )
    )
    if existing_like.scalar_one_or_none():
        logger.warning(f"评论已点赞: {comment_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Comment already liked"
        )

    # Create like
    like = UserCommentLike(user_id=current_user.id, comment_id=comment_id)
    db.add(like)

    # Update comment like count
    comment.update_like_count(db)

    # Note: Statistics are now computed properties, no need to update

    await db.commit()

    logger.info(f"评论点赞成功: {comment_id}, 点赞数: {comment.like_count}")
    return CommentLikeResponse(
        message="Comment liked successfully", like_count=comment.like_count
    )


@router.delete("/{comment_id}/like")
async def unlike_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Unlike a comment"""
    logger = get_logger("comments")
    logger.info(f"取消点赞评论: {comment_id}", extra={"user_id": current_user.id})

    # Check if like exists
    existing_like = await db.execute(
        select(UserCommentLike).where(
            UserCommentLike.user_id == current_user.id,
            UserCommentLike.comment_id == comment_id,
        )
    )
    like = existing_like.scalar_one_or_none()
    if not like:
        logger.warning(f"点赞不存在: {comment_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Like not found"
        )

    # Remove like
    await db.delete(like)

    # Update comment like count
    comment = await db.get(Comment, comment_id)
    if comment:
        comment.update_like_count(db)

        # Update author's statistics
        if comment.author:
            comment.author.update_statistics(db)

    await db.commit()

    logger.info(f"评论取消点赞成功: {comment_id}")
    return CommentLikeResponse(
        message="Comment unliked successfully",
        like_count=comment.like_count if comment else 0,
    )


# Helper functions moved to app/services/comment.py
