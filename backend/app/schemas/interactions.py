from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class PostLikeResponse(BaseModel):
    """Post like response schema"""

    message: str
    like_count: int


class PostFavoriteResponse(BaseModel):
    """Post favorite response schema"""

    message: str
    favorite_count: int


class UserInteractionStats(BaseModel):
    """User interaction statistics schema"""

    user_id: int
    username: str
    total_likes_given: int
    total_favorites_given: int
    total_posts_published: int

    class Config:
        from_attributes = True


class PostInteractionStats(BaseModel):
    """Post interaction statistics schema"""

    post_id: int
    title: str
    view_count: int
    like_count: int
    favorite_count: int
    comment_count: int

    class Config:
        from_attributes = True
