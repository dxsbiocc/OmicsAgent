from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TagBase(BaseModel):
    """Base tag schema"""

    name: str = Field(..., min_length=1, max_length=50, description="Tag name")
    slug: str = Field(..., min_length=1, max_length=50, description="Tag slug")
    description: Optional[str] = Field(None, description="Tag description")
    color: Optional[str] = Field(None, description="Tag color (hex code)")
    image_url: Optional[str] = Field(
        None, description="Image URL for tag representation"
    )
    content_type: Optional[str] = Field(
        None, description="Content type this tag is associated with"
    )
    is_active: bool = Field(True, description="Whether tag is active")


class TagCreate(TagBase):
    """Tag creation schema"""

    pass


class TagUpdate(BaseModel):
    """Tag update schema"""

    name: Optional[str] = Field(
        None, min_length=1, max_length=50, description="Tag name"
    )
    slug: Optional[str] = Field(
        None, min_length=1, max_length=50, description="Tag slug"
    )
    description: Optional[str] = Field(None, description="Tag description")
    color: Optional[str] = Field(None, description="Tag color (hex code)")
    image_url: Optional[str] = Field(
        None, description="Image URL for tag representation"
    )
    is_active: Optional[bool] = Field(None, description="Whether tag is active")


class TagResponse(TagBase):
    """Tag response schema"""

    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TagListResponse(BaseModel):
    """Tag list response schema"""

    items: list[TagResponse]
    total: int
    page: int
    size: int
    pages: int
