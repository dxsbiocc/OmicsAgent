from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import Dict, Any, Optional, List

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.visual import VisualTool
from app.schemas.visual import (
    VisualToolInfo,
    VisualRunResponse,
    VisualToolResponse,
    VisualToolCreate,
    VisualToolUpdate,
    VisualToolCommentCreate,
    VisualToolCommentResponse,
    VisualToolStatsResponse,
)
from app.services.visual import VisualService, VisualToolDBService

router = APIRouter(prefix="/visual", tags=["visual"])


# 工具信息API（文件系统 - 最高效）
@router.get("/tools", response_model=List[VisualToolInfo])
async def list_visual_tools():
    """获取所有绘图工具（从文件系统）"""
    return VisualService.list_tools()


@router.get("/tools/{tool}", response_model=VisualToolInfo)
async def get_tool_info(tool: str):
    """获取特定绘图工具信息（从文件系统）"""
    info = VisualService.get_tool_info(tool)
    if not info:
        raise HTTPException(status_code=404, detail="Tool not found")
    return info


# 工具执行API
@router.post("/run/{tool}", response_model=VisualRunResponse)
async def run_visual_tool(tool: str, params: Dict[str, Any]):
    """执行绘图工具"""
    result = await VisualService.run_tool(tool, params or {})
    if not result.success:
        raise HTTPException(status_code=400, detail=result.message or "Run failed")

    # 增加使用次数统计
    db = next(get_db())
    try:
        VisualToolDBService.increment_usage_count(db, tool)
    except Exception:
        pass  # 忽略统计错误，不影响主要功能

    return result


# 数据库工具管理API（带用户交互功能）
@router.get("/db/tools", response_model=List[VisualToolResponse])
async def get_tools_from_db(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category_id: Optional[int] = Query(None),
    featured: Optional[bool] = Query(None),
    current_user: Optional[User] = Depends(get_current_active_user),
):
    """从数据库获取工具列表（带用户交互状态）"""
    user_id = current_user.id if current_user else None
    return VisualToolDBService.get_tools(
        db=db,
        skip=skip,
        limit=limit,
        category_id=category_id,
        featured=featured,
        user_id=user_id,
    )


@router.get("/db/tools/{tool_id}", response_model=VisualToolResponse)
async def get_tool_by_id(
    tool_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user),
):
    """根据ID获取工具详情（带用户交互状态）"""
    user_id = current_user.id if current_user else None
    tool = VisualToolDBService.get_tool_by_id(db, tool_id, user_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool


@router.post("/db/tools", response_model=VisualToolResponse)
async def create_tool(
    tool_data: VisualToolCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """创建新工具"""
    # 检查工具名称是否已存在
    existing_tool = VisualToolDBService.get_tool_by_tool_name(db, tool_data.tool)
    if existing_tool:
        raise HTTPException(
            status_code=400, detail="Tool with this name already exists"
        )

    tool = VisualToolDBService.create_tool(db, tool_data, current_user.id)
    return VisualToolResponse.model_validate(tool)


@router.put("/db/tools/{tool_id}", response_model=VisualToolResponse)
async def update_tool(
    tool_id: int,
    tool_data: VisualToolUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """更新工具"""
    # 先获取工具并检查权限
    tool = db.execute(
        select(VisualTool).where(VisualTool.id == tool_id)
    ).scalar_one_or_none()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    # 检查权限（只有作者或管理员可以更新）
    if tool.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # 执行更新
    updated_tool = VisualToolDBService.update_tool(db, tool_id, tool_data)
    if not updated_tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    return VisualToolResponse.model_validate(updated_tool)


@router.delete("/db/tools/{tool_id}")
async def delete_tool(
    tool_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """删除工具"""
    tool = db.execute(
        select(VisualTool).where(VisualTool.id == tool_id)
    ).scalar_one_or_none()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    # 检查权限（只有作者或管理员可以删除）
    if tool.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    success = VisualToolDBService.delete_tool(db, tool_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tool not found")

    return {"message": "Tool deleted successfully"}


# 用户交互API
@router.post("/db/tools/{tool_id}/like")
async def like_tool(
    tool_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """点赞工具"""
    success = VisualToolDBService.like_tool(db, tool_id, current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail="Already liked or tool not found")
    return {"message": "Tool liked successfully"}


@router.delete("/db/tools/{tool_id}/like")
async def unlike_tool(
    tool_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """取消点赞工具"""
    success = VisualToolDBService.unlike_tool(db, tool_id, current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail="Not liked or tool not found")
    return {"message": "Tool unliked successfully"}


@router.post("/db/tools/{tool_id}/favorite")
async def favorite_tool(
    tool_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """收藏工具"""
    success = VisualToolDBService.favorite_tool(db, tool_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=400, detail="Already favorited or tool not found"
        )
    return {"message": "Tool favorited successfully"}


@router.delete("/db/tools/{tool_id}/favorite")
async def unfavorite_tool(
    tool_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """取消收藏工具"""
    success = VisualToolDBService.unfavorite_tool(db, tool_id, current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail="Not favorited or tool not found")
    return {"message": "Tool unfavorited successfully"}


# 评论API
@router.get(
    "/db/tools/{tool_id}/comments", response_model=List[VisualToolCommentResponse]
)
async def get_tool_comments(
    tool_id: int,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: Optional[User] = Depends(get_current_active_user),
):
    """获取工具评论"""
    user_id = current_user.id if current_user else None
    return VisualToolDBService.get_tool_comments(db, tool_id, skip, limit, user_id)


@router.post("/db/tools/{tool_id}/comments", response_model=VisualToolCommentResponse)
async def create_tool_comment(
    tool_id: int,
    comment_data: VisualToolCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """创建工具评论"""
    # 检查工具是否存在
    tool = VisualToolDBService.get_tool_by_id(db, tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    comment = VisualToolDBService.create_tool_comment(
        db, tool_id, comment_data, current_user.id
    )

    return VisualToolCommentResponse(
        id=comment.id,
        tool_id=comment.tool_id,
        user_id=comment.user_id,
        content=comment.content,
        status=comment.status,
        like_count=comment.like_count,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        author_name=comment.user.full_name if comment.user else None,
        author_avatar=comment.user.avatar_url if comment.user else None,
        parent_id=comment.parent_id,
        replies=[],
        is_liked=False,
    )


# 评论点赞API
@router.post("/db/comments/{comment_id}/like")
async def like_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """点赞评论"""
    success = VisualToolDBService.like_comment(db, comment_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=400, detail="Already liked or comment not found"
        )
    return {"message": "Comment liked successfully"}


@router.delete("/db/comments/{comment_id}/like")
async def unlike_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """取消点赞评论"""
    success = VisualToolDBService.unlike_comment(db, comment_id, current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail="Not liked or comment not found")
    return {"message": "Comment unliked successfully"}


# 统计API
@router.get("/stats", response_model=VisualToolStatsResponse)
async def get_visual_stats(db: Session = Depends(get_db)):
    """获取绘图工具统计信息"""
    from app.models.category import Category
    from app.models.tag import Tag

    # 获取总数
    total_tools = db.execute(select(func.count(VisualTool.id))).scalar() or 0
    total_categories = db.execute(select(func.count(Category.id))).scalar() or 0
    total_tags = db.execute(select(func.count(Tag.id))).scalar() or 0
    total_usage_count = (
        db.execute(select(func.sum(VisualTool.usage_count))).scalar() or 0
    )

    # 获取热门工具（按使用次数排序）
    popular_tools_query = (
        select(VisualTool).order_by(VisualTool.usage_count.desc()).limit(10)
    )
    popular_tools = db.execute(popular_tools_query).scalars().all()

    # 获取最新工具
    recent_tools_query = (
        select(VisualTool).order_by(VisualTool.created_at.desc()).limit(10)
    )
    recent_tools = db.execute(recent_tools_query).scalars().all()

    # 转换为响应格式
    popular_tools_response = []
    for tool in popular_tools:
        # 从文件系统获取配置信息
        tool_info = VisualService.get_tool_info(tool.tool)

        popular_tools_response.append(
            VisualToolResponse(
                id=tool.id,
                tool=tool.tool,
                name=tool.name,
                description=tool.description,
                category_id=tool.category_id,
                author_id=tool.author_id,
                status=tool.status,
                featured=tool.featured,
                view_count=tool.view_count,
                like_count=tool.like_count,
                favorite_count=tool.favorite_count,
                comment_count=tool.comment_count,
                usage_count=tool.usage_count,
                created_at=tool.created_at,
                updated_at=tool.updated_at,
                author_name=tool.author.full_name if tool.author else None,
                category_name=tool.category.name if tool.category else None,
                tags=[tag.name for tag in tool.tags],
                is_liked=False,
                is_favorited=False,
                # 从文件系统动态获取的配置信息
                params_schema=tool_info.params_schema if tool_info else {},
                defaults=tool_info.defaults if tool_info else {},
                sample_data_filename=(
                    tool_info.sample_data_filename if tool_info else None
                ),
                sample_image_url=tool_info.sample_image_url if tool_info else None,
                docs_markdown=tool_info.docs_markdown if tool_info else None,
            )
        )

    recent_tools_response = []
    for tool in recent_tools:
        # 从文件系统获取配置信息
        tool_info = VisualService.get_tool_info(tool.tool)

        recent_tools_response.append(
            VisualToolResponse(
                id=tool.id,
                tool=tool.tool,
                name=tool.name,
                description=tool.description,
                category_id=tool.category_id,
                author_id=tool.author_id,
                status=tool.status,
                featured=tool.featured,
                view_count=tool.view_count,
                like_count=tool.like_count,
                favorite_count=tool.favorite_count,
                comment_count=tool.comment_count,
                usage_count=tool.usage_count,
                created_at=tool.created_at,
                updated_at=tool.updated_at,
                author_name=tool.author.full_name if tool.author else None,
                category_name=tool.category.name if tool.category else None,
                tags=[tag.name for tag in tool.tags],
                is_liked=False,
                is_favorited=False,
                # 从文件系统动态获取的配置信息
                params_schema=tool_info.params_schema if tool_info else {},
                defaults=tool_info.defaults if tool_info else {},
                sample_data_filename=(
                    tool_info.sample_data_filename if tool_info else None
                ),
                sample_image_url=tool_info.sample_image_url if tool_info else None,
                docs_markdown=tool_info.docs_markdown if tool_info else None,
            )
        )

    return VisualToolStatsResponse(
        total_tools=total_tools,
        total_categories=total_categories,
        total_tags=total_tags,
        total_usage_count=total_usage_count,
        popular_tools=popular_tools_response,
        recent_tools=recent_tools_response,
    )


# 同步文件系统工具到数据库
@router.post("/sync-tools")
async def sync_tools_to_db(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)
):
    """将文件系统工具同步到数据库"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    tools_from_filesystem = VisualService.list_tools()
    synced_count = 0

    for tool_info in tools_from_filesystem:
        # 检查工具是否已存在
        existing_tool = VisualToolDBService.get_tool_by_tool_name(db, tool_info.tool)
        if existing_tool:
            continue  # 跳过已存在的工具

        # 创建新工具
        tool_data = VisualToolCreate(
            tool=tool_info.tool,
            name=tool_info.name,
            description=tool_info.description,
        )

        VisualToolDBService.create_tool(db, tool_data, current_user.id)
        synced_count += 1

    return {"message": f"Synced {synced_count} tools to database"}
