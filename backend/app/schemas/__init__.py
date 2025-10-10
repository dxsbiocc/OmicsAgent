# Schemas package
from .auth import *
from .blog import *
from .comments import *
from .follow import *
from .interactions import *
from .statistics import *

__all__ = [
    # Auth schemas
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserStatsResponse",
    "UserLogin",
    "Token",
    "TokenData",
    "PasswordChange",
    "PasswordReset",
    "PasswordResetConfirm",
    # Blog schemas
    "BlogPostCreate",
    "BlogPostUpdate",
    "BlogPostResponse",
    "TagCreate",
    "TagUpdate",
    "TagResponse",
    # Comment schemas
    "CommentCreate",
    "CommentUpdate",
    "CommentResponse",
    "CommentLikeResponse",
    # Follow schemas
    "FollowRequest",
    "FollowResponse",
    "UserFollowInfo",
    "FollowListResponse",
    "FollowStatsResponse",
    # Interaction schemas
    "PostLikeResponse",
    "PostFavoriteResponse",
    "UserInteractionStats",
    "PostInteractionStats",
    # Statistics schemas
    "UserRankingItem",
    "PostRankingItem",
    "StatisticsOverview",
    "UserStatsResponse",
    "PostStatsResponse",
    "RankingRequest",
    "StatisticsUpdateRequest",
]
