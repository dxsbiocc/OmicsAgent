from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class BlogPostCreate(BaseModel):
    """Blog post creation schema"""

    title: str = Field(..., min_length=1, max_length=255, description="Post title")
    slug: Optional[str] = Field(
        None,
        max_length=255,
        description="Post slug (auto-generated if not provided)",
    )
    content: str = Field(..., min_length=1, description="Post content")
    excerpt: Optional[str] = Field(None, description="Post excerpt")
    background_image_url: Optional[str] = Field(
        None, description="Background image URL for blog post"
    )
    category_id: Optional[int] = Field(None, description="Category ID")
    category_name: Optional[str] = Field(
        None, description="Category name (create if not exists)"
    )
    status: str = Field("draft", description="Post status (draft, published, archived)")
    featured: bool = Field(False, description="Whether post is featured")
    comments_enabled: bool = Field(True, description="Whether comments are enabled")
    tag_ids: Optional[List[int]] = Field(None, description="Tag IDs")
    tag_names: Optional[List[str]] = Field(
        None, description="Tag names (create if not exists)"
    )


class BlogPostUpdate(BaseModel):
    """Blog post update schema (admin only)"""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    excerpt: Optional[str] = None
    background_image_url: Optional[str] = None
    category_id: Optional[int] = None
    status: Optional[str] = Field(
        None, description="Post status (draft, published, archived)"
    )
    featured: Optional[bool] = None
    comments_enabled: Optional[bool] = None
    tag_ids: Optional[List[int]] = None


class BlogPostResponse(BaseModel):
    """Blog post response schema"""

    id: int
    title: str
    slug: str
    content: str
    excerpt: Optional[str]
    background_image_url: Optional[str] = None
    author_id: Optional[int]
    author_username: Optional[str] = None
    author_avatar_url: Optional[str] = None
    category_id: Optional[int]
    category_name: Optional[str] = None
    status: str
    featured: bool
    comments_enabled: bool
    view_count: int
    like_count: int
    favorite_count: int
    comment_count: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]
    tags: List[dict] = []
    is_liked: bool = False
    is_favorited: bool = False

    class Config:
        from_attributes = True
