from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class CommentCreate(BaseModel):
    """Comment creation schema"""

    content: str = Field(..., min_length=1, description="Comment content")
    parent_id: Optional[int] = Field(None, description="Parent comment ID for replies")
    target_type: str = Field(
        ..., description="Target type (e.g., 'blog_post', 'message_board')"
    )
    target_id: int = Field(..., description="Target ID")


class CommentUpdate(BaseModel):
    """Comment update schema (admin only)"""

    content: Optional[str] = Field(None, min_length=1)
    status: Optional[str] = Field(
        None, description="Comment status (pending/approved/rejected)"
    )


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


class CommentLikeResponse(BaseModel):
    """Comment like response schema"""

    message: str
    like_count: int
