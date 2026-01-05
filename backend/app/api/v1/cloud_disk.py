"""
Cloud Disk API
云盘文件管理接口
"""

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Query,
    File,
    UploadFile,
    Form,
)
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from pathlib import Path

from app.api.deps import get_db
from app.models.user import User
from app.core.security import get_current_active_user
from app.core.logging import get_logger
from app.services.cloud_disk import (
    list_contents,
    create_folder,
    upload_file,
    delete_item,
    rename_item,
    get_file_url,
    is_protected_folder,
)

router = APIRouter(prefix="/cloud-disk", tags=["cloud-disk"])
logger = get_logger("cloud_disk_api")


@router.get("/roots")
async def get_root_directories(
    current_user: User = Depends(get_current_active_user),
):
    """获取用户的根目录列表"""
    return {
        "roots": [
            {
                "id": "uploads",
                "name": "上传文件",
                "type": "folder",
                "path": "",
                "protected": True,
            },
            {
                "id": "visual",
                "name": "可视化",
                "type": "folder",
                "path": "",
                "protected": True,
            },
            {
                "id": "analysis",
                "name": "分析结果",
                "type": "folder",
                "path": "",
                "protected": True,
            },
        ]
    }


@router.get("/contents")
async def get_contents(
    root: str = Query(..., description="根目录名称 (uploads/visual/analysis)"),
    path: Optional[str] = Query("", description="相对路径"),
    current_user: User = Depends(get_current_active_user),
):
    """获取目录内容"""
    try:
        folders, files = await list_contents(root, current_user.id, path)
        
        # 为文件添加 URL
        for file in files:
            file["url"] = get_file_url(root, current_user.id, file["path"])
        
        return {
            "root": root,
            "path": path,
            "folders": folders,
            "files": files,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取目录内容失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取目录内容失败: {str(e)}",
        )


@router.post("/folders")
async def create_new_folder(
    root: str = Form(..., description="根目录名称"),
    name: str = Form(..., description="文件夹名称"),
    path: Optional[str] = Form("", description="父目录相对路径"),
    current_user: User = Depends(get_current_active_user),
):
    """创建新文件夹"""
    try:
        folder = await create_folder(root, current_user.id, name, path)
        return {
            "success": True,
            "message": "文件夹创建成功",
            "folder": folder,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"创建文件夹失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建文件夹失败: {str(e)}",
        )


@router.post("/upload")
async def upload_file_to_disk(
    root: str = Form(..., description="根目录名称"),
    file: UploadFile = File(...),
    path: Optional[str] = Form("", description="目标目录相对路径"),
    current_user: User = Depends(get_current_active_user),
):
    """上传文件"""
    try:
        file_info = await upload_file(root, current_user.id, file, path)
        file_info["url"] = get_file_url(root, current_user.id, file_info["path"])
        
        return {
            "success": True,
            "message": "文件上传成功",
            "file": file_info,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"上传文件失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"上传文件失败: {str(e)}",
        )


@router.delete("/items")
async def delete_file_or_folder(
    root: str = Query(..., description="根目录名称"),
    path: str = Query(..., description="文件或文件夹相对路径"),
    current_user: User = Depends(get_current_active_user),
):
    """删除文件或文件夹"""
    try:
        # 检查是否为受保护的顶层目录
        path_obj = Path(path)
        if path_obj == Path("") or path_obj.name in ["uploads", "visual", "analysis"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="不能删除顶层目录",
            )
        
        success = await delete_item(root, current_user.id, path)
        return {
            "success": success,
            "message": "删除成功",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除失败: {str(e)}",
        )


@router.patch("/items/rename")
async def rename_file_or_folder(
    root: str = Form(..., description="根目录名称"),
    path: str = Form(..., description="文件或文件夹相对路径"),
    new_name: str = Form(..., description="新名称"),
    current_user: User = Depends(get_current_active_user),
):
    """重命名文件或文件夹"""
    try:
        item = await rename_item(root, current_user.id, path, new_name)
        
        # 如果是文件，添加 URL
        if item["type"] == "file":
            item["url"] = get_file_url(root, current_user.id, item["path"])
        
        return {
            "success": True,
            "message": "重命名成功",
            "item": item,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"重命名失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"重命名失败: {str(e)}",
        )

