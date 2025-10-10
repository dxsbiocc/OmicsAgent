from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# 基础模型
class VisualToolBase(BaseModel):
    tool: str = Field(..., description="工具名称")
    name: str = Field(..., description="显示名称")
    description: Optional[str] = Field(None, description="工具描述")
    category_id: Optional[int] = Field(None, description="分类ID")


class VisualToolCreate(VisualToolBase):
    pass


class VisualToolUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    status: Optional[str] = None
    featured: Optional[bool] = None


class VisualToolResponse(VisualToolBase):
    id: int
    author_id: Optional[int] = None
    status: str
    featured: bool
    view_count: int
    like_count: int
    favorite_count: int
    comment_count: int
    usage_count: int
    created_at: datetime
    updated_at: datetime

    # 关联信息
    author_name: Optional[str] = None
    category_name: Optional[str] = None
    tags: List[str] = []

    # 用户交互状态
    is_liked: bool = False
    is_favorited: bool = False

    # 配置信息（从文件系统动态获取）
    params_schema: Optional[Dict[str, Any]] = None
    defaults: Optional[Dict[str, Any]] = None
    sample_data_filename: Optional[str] = None
    sample_image_url: Optional[str] = None
    docs_markdown: Optional[str] = None

    class Config:
        from_attributes = True


# 点赞/收藏模型
class UserToolLikeCreate(BaseModel):
    tool_id: int = Field(..., description="工具ID")


class UserToolFavoriteCreate(BaseModel):
    tool_id: int = Field(..., description="工具ID")


class UserToolLikeResponse(BaseModel):
    id: int
    user_id: int
    tool_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserToolFavoriteResponse(BaseModel):
    id: int
    user_id: int
    tool_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# 评论模型
class VisualToolCommentCreate(BaseModel):
    content: str = Field(..., description="评论内容", max_length=1000)
    parent_id: Optional[int] = Field(None, description="父评论ID")


class VisualToolCommentUpdate(BaseModel):
    content: Optional[str] = Field(None, description="评论内容", max_length=1000)
    status: Optional[str] = None


class VisualToolCommentResponse(BaseModel):
    id: int
    tool_id: int
    user_id: int
    content: str
    status: str
    like_count: int
    created_at: datetime
    updated_at: datetime

    # 关联信息
    author_name: Optional[str] = None
    author_avatar: Optional[str] = None
    parent_id: Optional[int] = None
    replies: List["VisualToolCommentResponse"] = []

    # 用户交互状态
    is_liked: bool = False

    class Config:
        from_attributes = True


# 评论点赞模型
class VisualToolCommentLikeCreate(BaseModel):
    comment_id: int = Field(..., description="评论ID")


class VisualToolCommentLikeResponse(BaseModel):
    id: int
    comment_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# 统计模型
class VisualToolStatsResponse(BaseModel):
    total_tools: int
    total_categories: int
    total_tags: int
    total_usage_count: int
    popular_tools: List[VisualToolResponse] = []
    recent_tools: List[VisualToolResponse] = []


# 工具信息模型（用于API响应）
class VisualToolInfo(BaseModel):
    """Metadata describing a visual tool for frontend display."""

    tool: str
    name: str
    description: str
    params_schema: Dict[str, Any] = Field(
        default_factory=dict, description="JSON schema-like param description"
    )
    defaults: Dict[str, Any] = Field(default_factory=dict)
    sample_data_filename: Optional[str] = None
    sample_image_url: Optional[str] = None
    docs_markdown: Optional[str] = None


# 绘图执行响应模型
class VisualRunResponse(BaseModel):
    """Response returned after running a visual tool."""

    success: bool
    message: Optional[str] = None
    image_url: Optional[str] = None
    output_files: List[str] = []
    warnings: List[str] = []
    tool: Optional[str] = None
    used_params: Dict[str, Any] = Field(default_factory=dict)


class VisualTaskResponse(BaseModel):
    """Response for async task submission."""

    task_id: str
    status: str
    message: str


class VisualTaskStatus(BaseModel):
    """Task status response."""

    task_id: str
    status: str
    progress: Optional[int] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


# 更新前向引用
VisualToolCommentResponse.model_rebuild()
