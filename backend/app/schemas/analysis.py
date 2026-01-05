from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# 工具信息模型（文件系统）
class AnalysisToolInfo(BaseModel):
    tool: str = Field(..., description="工具名称，如 'db_geo'")
    name: str = Field(..., description="显示名称")
    display_name: str = Field(..., description="显示名称（别名）")
    description: str = Field(..., description="工具描述")
    category: str = Field(..., description="工具分类")
    tool_name: str = Field(..., description="工具名称（不包含分类）")
    params_schema: Dict[str, Any] = Field(default_factory=dict, description="参数模式")
    defaults: Dict[str, Any] = Field(default_factory=dict, description="默认参数")
    sample_data_filename: Optional[str] = Field(None, description="样本数据文件名")
    sample_image_url: Optional[str] = Field(None, description="样本图片URL")
    docs_markdown: Optional[str] = Field(None, description="文档Markdown")


# 工具分组模型
class AnalysisToolGroup(BaseModel):
    category: str = Field(..., description="分类名称")
    display_name: str = Field(..., description="分类显示名称")
    tools: List[AnalysisToolInfo] = Field(
        default_factory=list, description="该分类下的工具"
    )
    tool_count: int = Field(..., description="工具数量")


# 工具列表响应模型
class AnalysisToolsResponse(BaseModel):
    tools: List[AnalysisToolInfo] = Field(default_factory=list, description="所有工具")
    groups: List[AnalysisToolGroup] = Field(
        default_factory=list, description="按分类分组的工具"
    )
    total_tools: int = Field(..., description="总工具数")
    total_categories: int = Field(..., description="总分类数")
    category_stats: Dict[str, int] = Field(default_factory=dict, description="分类统计")


# 工具执行响应模型
class AnalysisRunResponse(BaseModel):
    success: bool = Field(..., description="是否成功")
    data: Optional[Any] = Field(None, description="结果数据")
    message: str = Field(..., description="响应消息")
    tool: str = Field(..., description="工具名称")
    image_url: Optional[str] = Field(None, description="图片URL")
    ggplot2: Optional[Dict[str, Any]] = Field(None, description="ggplot2配置")
    used_params: Dict[str, Any] = Field(default_factory=dict, description="使用的参数")
    analysis_type: Optional[str] = Field(None, description="分析类型")


# 样本数据响应模型
class AnalysisSampleDataResponse(BaseModel):
    success: bool = Field(..., description="是否成功")
    data: List[Dict[str, Any]] = Field(default_factory=list, description="样本数据")
    message: Optional[str] = Field(None, description="响应消息")


# 文档响应模型
class AnalysisDocsResponse(BaseModel):
    success: bool = Field(..., description="是否成功")
    markdown: str = Field(..., description="文档Markdown内容")
    message: Optional[str] = Field(None, description="响应消息")
