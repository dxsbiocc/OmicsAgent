from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CategoryBase(BaseModel):
    """Base category schema"""

    name: str = Field(..., min_length=1, max_length=100, description="Category name")
    slug: str = Field(..., min_length=1, max_length=100, description="Category slug")
    description: Optional[str] = Field(None, description="Category description")
    image_url: Optional[str] = Field(
        None, description="Image URL for category representation"
    )
    content_type: Optional[str] = Field(
        None, description="Content type this category is associated with"
    )
    is_active: bool = Field(True, description="Whether category is active")
    parent_id: Optional[int] = Field(None, description="Parent category ID")
    level: int = Field(0, description="Category level (0 = root)")
    sort_order: int = Field(0, description="Sort order within the same level")


class CategoryCreate(CategoryBase):
    """Category creation schema"""

    pass


class CategoryUpdate(BaseModel):
    """Category update schema"""

    name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Category name"
    )
    slug: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Category slug"
    )
    description: Optional[str] = Field(None, description="Category description")
    image_url: Optional[str] = Field(
        None, description="Image URL for category representation"
    )
    is_active: Optional[bool] = Field(None, description="Whether category is active")
    parent_id: Optional[int] = Field(None, description="Parent category ID")
    sort_order: Optional[int] = Field(
        None, description="Sort order within the same level"
    )


class CategoryResponse(CategoryBase):
    """Category response schema"""

    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CategoryTreeItem(CategoryResponse):
    """Category tree item schema"""

    children: List["CategoryTreeItem"] = Field(default_factory=list)

    class Config:
        from_attributes = True


class CategoryListResponse(BaseModel):
    """Category list response schema"""

    items: List[CategoryResponse]
    total: int
    page: int
    size: int
    pages: int


class CategoryMoveRequest(BaseModel):
    """Category move request schema"""

    new_parent_id: Optional[int] = Field(
        None, description="New parent category ID (null for root)"
    )
    new_sort_order: Optional[int] = Field(
        None, description="New sort order within the same level"
    )


class CategoryStats(BaseModel):
    """Category statistics schema"""

    id: int
    name: str
    slug: str
    level: int
    path: str
    post_count: int
    children_count: int
    is_active: bool


# Update forward references
CategoryTreeItem.model_rebuild()
