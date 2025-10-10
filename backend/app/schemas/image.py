from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ImageBase(BaseModel):
    """图片基础schema"""

    original_filename: str = Field(..., description="原始文件名")
    description: Optional[str] = Field(None, description="图片描述")
    tags: Optional[str] = Field(None, description="标签(逗号分隔)")


class ImageCreate(ImageBase):
    """创建图片记录schema"""

    pass


class ImageUpdate(BaseModel):
    """更新图片记录schema"""

    description: Optional[str] = Field(None, description="图片描述")
    tags: Optional[str] = Field(None, description="标签(逗号分隔)")
    is_active: Optional[bool] = Field(None, description="是否激活")


class ImageResponse(ImageBase):
    """图片响应schema"""

    id: int
    filename: str
    file_path: str
    file_url: str
    file_size: int
    mime_type: str
    width: Optional[int] = None
    height: Optional[int] = None
    is_active: bool
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ImageUploadResponse(BaseModel):
    """图片上传响应schema"""

    success: bool
    message: str
    image: Optional[ImageResponse] = None
    file_url: Optional[str] = None


class ImageListResponse(BaseModel):
    """图片列表响应schema"""

    images: List[ImageResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
