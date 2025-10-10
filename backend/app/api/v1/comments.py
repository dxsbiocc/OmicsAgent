from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime

from app.db.base import get_db
from app.models.user import User
from app.models.comment import Comment, UserCommentLike
from app.core.security import get_current_active_user, get_current_user_optional
from app.utils.query_helpers import get_comment_with_relationships
from app.services.comment import CommentService

router = APIRouter(prefix="/comments", tags=["comments"])


# Comment schemas
from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    """Comment creation schema"""

    content: str = Field(..., min_length=1, description="Comment content")
    parent_id: Optional[int] = Field(None, description="Parent comment ID for replies")
    target_type: str = Field(
        ..., description="Target type (e.g., 'blog_post', 'message_board')"
    )
    target_id: int = Field(..., description="Target ID")


class CommentResponse(BaseModel):
    """Comment response schema"""

    id: int
    author_id: int
    author_username: Optional[str] = None
    content: str
    status: str
    like_count: int
    parent_id: Optional[int]
    target_type: str
    target_id: int
    created_at: datetime
    updated_at: datetime
    replies: List["CommentResponse"] = []
    is_liked: bool = False

    class Config:
        from_attributes = True


class CommentUpdate(BaseModel):
    """Comment update schema (admin only)"""

    content: Optional[str] = Field(None, min_length=1)
    status: Optional[str] = Field(
        None, description="Comment status (pending/approved/rejected)"
    )


@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new comment"""
    # Check if comments are enabled for the target (if it's a blog post)
    if comment_data.target_type == "blog_post":
        from app.utils.query_helpers import get_blog_post_with_relationships

        post = await get_blog_post_with_relationships(db, comment_data.target_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found"
            )
        if not post.comments_enabled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Comments are disabled for this post",
            )

    # Check if parent comment exists and belongs to same target
    if comment_data.parent_id:
        parent_comment = await get_comment_with_relationships(
            db, comment_data.parent_id
        )
        if (
            not parent_comment
            or parent_comment.target_type != comment_data.target_type
            or parent_comment.target_id != comment_data.target_id
        ):
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

    return await get_comment_response(comment.id, db, current_user.id)


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
        comment_response = await get_comment_response(
            comment.id, db, current_user.id if current_user else None
        )
        comment_responses.append(comment_response)

    return comment_responses


@router.get("/{comment_id}", response_model=CommentResponse)
async def get_comment(
    comment_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific comment"""
    comment = await get_comment_with_relationships(db, comment_id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
        )

    return await get_comment_response(
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
    comment = await get_comment_with_relationships(db, comment_id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
        )

    # Check if user is author or admin
    if comment.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )

    # Update comment data
    update_data = comment_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(comment, field, value)

    await db.commit()
    await db.refresh(comment)

    return await get_comment_response(comment.id, db, current_user.id)


@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a comment (author or admin only)"""
    comment = await get_comment_with_relationships(db, comment_id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
        )

    # Check if user is author or admin
    if comment.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )

    # Update author statistics before deletion
    if comment.author:
        comment.author.update_statistics(db)

    await db.delete(comment)
    await db.commit()

    return {"message": "Comment deleted successfully"}


# Comment like endpoints
@router.post("/{comment_id}/like")
async def like_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Like a comment"""
    # Check if comment exists
    comment = await get_comment_with_relationships(db, comment_id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
        )

    # Check if already liked
    existing_like_result = await db.execute(
        select(UserCommentLike).where(
            UserCommentLike.user_id == current_user.id,
            UserCommentLike.comment_id == comment_id,
        )
    )
    if existing_like_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Comment already liked"
        )

    # Create like
    like = UserCommentLike(user_id=current_user.id, comment_id=comment_id)
    db.add(like)

    # Update comment like count
    like_count = await CommentService.update_like_count(comment_id, db)

    return {"message": "Comment liked successfully", "like_count": like_count}


@router.delete("/{comment_id}/like")
async def unlike_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Unlike a comment"""
    # Check if like exists
    existing_like_result = await db.execute(
        select(UserCommentLike).where(
            UserCommentLike.user_id == current_user.id,
            UserCommentLike.comment_id == comment_id,
        )
    )
    like = existing_like_result.scalar_one_or_none()
    if not like:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Like not found"
        )

    # Remove like
    await db.delete(like)

    # Update comment like count
    like_count = await CommentService.update_like_count(comment_id, db)

    return {
        "message": "Comment unliked successfully",
        "like_count": like_count,
    }


# Helper functions
async def get_comment_response(
    comment_id: int, db: AsyncSession, current_user_id: Optional[int] = None
) -> CommentResponse:
    """Get formatted comment response"""
    comment = await get_comment_with_relationships(db, comment_id)
    if not comment:
        return None

    # Get author username
    author_username = None
    if comment.author:
        author_username = comment.author.username

    # Get replies
    replies = []
    if hasattr(comment, "replies"):
        for reply in comment.replies:
            reply_response = await get_comment_response(reply.id, db, current_user_id)
            replies.append(reply_response)

    # Check if current user liked this comment
    is_liked = False
    if current_user_id:
        is_liked = await CommentService.has_user_liked_comment(
            current_user_id, comment.id, db
        )

    return CommentResponse(
        id=comment.id,
        author_id=comment.author_id,
        author_username=author_username,
        content=comment.content,
        status=comment.status,
        like_count=comment.like_count,
        parent_id=comment.parent_id,
        target_type=comment.target_type,
        target_id=comment.target_id,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        replies=replies,
        is_liked=is_liked,
    )
