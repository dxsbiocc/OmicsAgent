from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any, List

from app.schemas.analysis import (
    AnalysisToolInfo,
    AnalysisToolsResponse,
    AnalysisToolGroup,
    AnalysisRunResponse,
)
from app.services.analysis import AnalysisService
from app.api.deps import get_current_active_user
from app.models.user import User


router = APIRouter(prefix="/analysis", tags=["analysis"])


# 工具信息API（文件系统 - 最高效）
@router.get("/tools", response_model=AnalysisToolsResponse)
async def list_analysis_tools():
    """获取所有分析工具（从文件系统，包含分组信息）"""
    return AnalysisService.get_tools_with_grouping(False)


@router.get("/tools/grouped", response_model=List[AnalysisToolGroup])
async def list_analysis_tools_grouped():
    """获取按分类分组的分析工具"""
    groups_data = AnalysisService.get_tools_grouped()
    return [AnalysisToolGroup(**group) for group in groups_data]


@router.get("/tools/category/{category}", response_model=List[AnalysisToolInfo])
async def get_tools_by_category(category: str):
    """根据分类获取分析工具"""
    tools = AnalysisService.get_tools_by_category(category)
    if not tools:
        raise HTTPException(
            status_code=404, detail=f"No tools found for category: {category}"
        )
    return tools


@router.get("/tools/search", response_model=List[AnalysisToolInfo])
async def search_analysis_tools(q: str = Query(..., description="搜索关键词")):
    """搜索分析工具"""
    if not q.strip():
        return []
    tools = AnalysisService.search_tools(q)
    return tools


@router.get("/tools/categories", response_model=List[str])
async def get_tool_categories():
    """获取所有工具分类"""
    return AnalysisService.get_tool_categories()


@router.get("/tools/{tool}", response_model=AnalysisToolInfo)
async def get_tool_info(tool: str):
    """获取特定分析工具信息（从文件系统）

    工具名称格式：category_tool (如: db_geo)
    使用下划线分隔分类和工具名
    """
    info = AnalysisService.get_tool_info(tool)
    if not info:
        raise HTTPException(status_code=404, detail=f"Tool '{tool}' not found")
    return info


@router.get("/tools/{tool}/sample-data")
async def get_tool_sample_data(tool: str):
    """获取工具的示例数据"""
    tool_info = AnalysisService.get_tool_info(tool)
    if not tool_info:
        raise HTTPException(status_code=404, detail=f"Tool '{tool}' not found")

    if not tool_info.sample_data_filename:
        raise HTTPException(
            status_code=404, detail="No sample data available for this tool"
        )

    # 读取示例数据文件
    try:
        data = AnalysisService.get_sample_data(tool_info.sample_data_filename)

        return {
            "success": True,
            "data": data,
            "message": f"Sample data loaded successfully ({len(data)} rows)",
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to load sample data: {str(e)}"
        )


@router.get("/tools/{tool}/document")
async def get_tool_document(tool: str):
    """获取工具的文档"""
    tool_info = AnalysisService.get_tool_info(tool)
    if not tool_info:
        raise HTTPException(status_code=404, detail=f"Tool '{tool}' not found")

    if not tool_info.docs_markdown:
        raise HTTPException(
            status_code=404, detail="No documentation available for this tool"
        )

    return {
        "success": True,
        "markdown": tool_info.docs_markdown,
        "message": "Documentation loaded successfully",
    }


@router.get("/tools/{tool}/meta")
async def get_tool_meta(tool: str):
    """获取工具的meta.json配置"""
    tool_info = AnalysisService.get_tool_info(tool)
    if not tool_info:
        raise HTTPException(status_code=404, detail=f"Tool '{tool}' not found")

    # 读取meta.json文件
    try:
        from pathlib import Path
        import json

        # 从tool中提取category和tool_name
        if "_" in tool:
            category, tool_name = tool.split("_", 1)
        else:
            category = tool
            tool_name = tool

        meta_file = Path(f"scripts/analysis/{category}/{tool_name}/meta.json")
        if not meta_file.exists():
            raise HTTPException(status_code=404, detail="Meta file not found")

        with open(meta_file, "r", encoding="utf-8") as f:
            meta_data = json.load(f)

        return {
            "success": True,
            "meta": meta_data,
            "message": "Meta data loaded successfully",
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to load meta data: {str(e)}"
        )


# 工具执行API
@router.post("/run/{tool}", response_model=AnalysisRunResponse)
async def run_analysis_tool(
    tool: str, params: Dict[str, Any], user: User = Depends(get_current_active_user)
):
    try:
        result = await AnalysisService.run_analysis(tool, params, user_id=user.id)
        return AnalysisRunResponse(
            success=True,
            data=result.get("data", []),
            message="Analysis tool executed successfully",
            tool=tool,
            used_params=params,
            image_url=result.get("image_url", None),
            ggplot2=result.get("ggplot2", None),
            analysis_type="analysis",
        )
    except Exception as e:
        # 确保错误响应包含所有必需字段
        return AnalysisRunResponse(
            success=False,
            message=f"Analysis tool execution failed: {str(e)}",
            tool=tool,
            used_params=params,
            analysis_type="analysis",
        )
