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


# 工具信息模型（文件系统）
class VisualToolInfo(BaseModel):
    tool: str = Field(..., description="工具名称，如 'line/basic'")
    name: str = Field(..., description="显示名称")
    description: str = Field(..., description="工具描述")
    category: str = Field(..., description="工具分类")
    tool_name: str = Field(..., description="工具名称（不包含分类）")
    params_schema: Dict[str, Any] = Field(default_factory=dict, description="参数模式")
    defaults: Dict[str, Any] = Field(default_factory=dict, description="默认参数")
    sample_data_filename: Optional[str] = Field(None, description="样本数据文件名")
    sample_image_url: Optional[str] = Field(None, description="样本图片URL")
    docs_markdown: Optional[str] = Field(None, description="文档Markdown")
    has_python: bool = Field(default=False, description="是否存在 Python 脚本")
    has_r: bool = Field(default=False, description="是否存在 R 脚本")
    has_js: bool = Field(default=True, description="是否存在 JS 版本")
    ggplot2: Optional[Dict[str, Any]] = Field(None, description="ggplot2 配置")
    heatmap: Optional[Dict[str, Any]] = Field(None, description="heatmap 配置")


# 工具分组模型
class VisualToolGroup(BaseModel):
    category: str = Field(..., description="分类名称")
    display_name: str = Field(..., description="分类显示名称")
    tools: List[VisualToolInfo] = Field(
        default_factory=list, description="该分类下的工具"
    )
    tool_count: int = Field(..., description="工具数量")


# 工具列表响应模型
class VisualToolsResponse(BaseModel):
    tools: List[VisualToolInfo] = Field(default_factory=list, description="所有工具")
    groups: List[VisualToolGroup] = Field(
        default_factory=list, description="按分类分组的工具"
    )
    total_tools: int = Field(..., description="总工具数")
    total_categories: int = Field(..., description="总分类数")
    category_stats: Dict[str, int] = Field(default_factory=dict, description="分类统计")


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


# 绘图执行响应模型
class VisualRunResponse(BaseModel):
    """Response returned after running a visual tool."""

    success: bool
    message: Optional[str] = None
    output_files: List[str] = []  # 包含 PNG 和 PDF URL，第一个是 PNG，第二个是 PDF
    warnings: List[str] = []
    tool: Optional[str] = None
    used_params: Dict[str, Any] = Field(default_factory=dict)
    error_details: Optional[Dict[str, Any]] = Field(None, description="Detailed error information for recovery")
    data_info: Optional[Dict[str, Any]] = Field(None, description="Data format information")
    
    @property
    def image_url(self) -> Optional[str]:
        """Get PNG image URL"""
        return self.output_files[0] if len(self.output_files) > 0 else None
    
    @property
    def pdf_url(self) -> Optional[str]:
        """Get PDF URL"""
        return self.output_files[1] if len(self.output_files) > 1 else None
    
    @property
    def data_url(self) -> Optional[str]:
        """Get data URL if available"""
        return self.output_files[2] if len(self.output_files) > 2 else None


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
