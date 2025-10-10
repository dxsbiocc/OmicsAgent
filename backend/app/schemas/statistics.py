from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class UserRankingItem(BaseModel):
    """User ranking item schema"""

    user_id: int
    username: str
    total_posts: int
    total_likes_received: int
    total_views_received: int
    total_comments_received: int
    total_comment_likes_received: int
    rank: int

    class Config:
        from_attributes = True


class PostRankingItem(BaseModel):
    """Post ranking item schema"""

    post_id: int
    title: str
    author_username: str
    view_count: int
    like_count: int
    favorite_count: int
    comment_count: int
    rank: int

    class Config:
        from_attributes = True


class StatisticsOverview(BaseModel):
    """Statistics overview schema"""

    total_users: int
    total_posts: int
    total_comments: int
    total_likes: int
    total_favorites: int
    total_views: int
    active_users_count: int
    published_posts_count: int
    approved_comments_count: int


class UserStatsResponse(BaseModel):
    """User statistics response schema"""

    user_id: int
    username: str
    total_posts: int
    total_likes_received: int
    total_views_received: int
    total_comments_received: int
    total_comment_likes_received: int
    total_likes_given: int = 0
    total_favorites_given: int = 0
    total_posts_published: int = 0

    class Config:
        from_attributes = True


class PostStatsResponse(BaseModel):
    """Post statistics response schema"""

    post_id: int
    title: str
    view_count: int
    like_count: int
    favorite_count: int
    comment_count: int

    class Config:
        from_attributes = True


class RankingRequest(BaseModel):
    """Ranking request schema"""

    metric: str = Field(
        ..., description="Ranking metric (posts, likes, views, comments)"
    )
    limit: int = Field(10, ge=1, le=100, description="Number of results to return")
    period: Optional[str] = Field(None, description="Time period filter")


class StatisticsUpdateRequest(BaseModel):
    """Statistics update request schema"""

    user_id: Optional[int] = Field(None, description="User ID to update")
    post_id: Optional[int] = Field(None, description="Post ID to update")
    force_update: bool = Field(False, description="Force update all statistics")
