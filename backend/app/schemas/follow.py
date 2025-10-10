from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class FollowRequest(BaseModel):
    """Request to follow/unfollow a user"""

    following_id: int


class FollowResponse(BaseModel):
    """Response for follow operations"""

    message: str
    is_following: bool


class UserFollowInfo(BaseModel):
    """Basic user info for follow lists"""

    id: int
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime


class FollowListResponse(BaseModel):
    """Response for follow lists"""

    users: List[UserFollowInfo]
    total: int
    limit: int
    offset: int


class FollowStatsResponse(BaseModel):
    """Response for follow statistics"""

    follower_count: int
    following_count: int
