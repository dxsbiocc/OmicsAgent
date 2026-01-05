"""
Cloud Disk Service
云盘服务：管理用户文件存储
"""

import os
import shutil
import mimetypes
from pathlib import Path
from typing import List, Optional, Tuple
from datetime import datetime
from fastapi import HTTPException, status, UploadFile
from aiofile import AIOFile
from app.core.logging import get_logger

logger = get_logger("cloud_disk")

# 基础目录配置
BASE_UPLOAD_DIR = Path("uploads")
BASE_STATIC_DIR = Path("static")

# 固定顶层目录映射
ROOT_DIRS = {
    "uploads": BASE_UPLOAD_DIR,
    "visual": BASE_STATIC_DIR / "visual",
    "analysis": BASE_STATIC_DIR / "analysis",
}


def get_user_dir(root_dir: str, user_id: int) -> Path:
    """获取用户目录路径"""
    if root_dir not in ROOT_DIRS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"无效的根目录: {root_dir}",
        )
    base_dir = ROOT_DIRS[root_dir]
    user_dir = base_dir / str(user_id)
    user_dir.mkdir(parents=True, exist_ok=True)
    return user_dir


def get_full_path(root_dir: str, user_id: int, relative_path: str = "") -> Path:
    """获取完整路径"""
    user_dir = get_user_dir(root_dir, user_id)
    if not relative_path:
        return user_dir

    # 防止路径遍历攻击
    full_path = (user_dir / relative_path).resolve()
    if not str(full_path).startswith(str(user_dir.resolve())):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="路径访问被拒绝",
        )
    return full_path


def is_protected_folder(folder_name: str) -> bool:
    """检查是否为受保护的文件夹（固定顶层目录）"""
    return folder_name in ROOT_DIRS.keys()


async def list_contents(
    root_dir: str, user_id: int, relative_path: str = ""
) -> Tuple[List[dict], List[dict]]:
    """列出目录内容"""
    try:
        target_path = get_full_path(root_dir, user_id, relative_path)

        if not target_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="目录不存在",
            )

        if not target_path.is_dir():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="路径不是目录",
            )

        folders = []
        files = []

        # 获取用户目录的绝对路径作为基准
        user_dir_absolute = get_user_dir(root_dir, user_id).resolve()

        for item in target_path.iterdir():
            stat = item.stat()
            # 使用 resolve() 确保路径是绝对路径
            item_absolute = item.resolve()

            # 计算相对路径
            try:
                relative_path = str(item_absolute.relative_to(user_dir_absolute))
            except ValueError:
                # 如果路径不在用户目录下，跳过（安全措施）
                logger.warning(f"跳过不在用户目录下的路径: {item_absolute}")
                continue

            item_info = {
                "id": str(item_absolute),
                "name": item.name,
                "type": "folder" if item.is_dir() else "file",
                "path": relative_path,
                "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            }

            if item.is_dir():
                folders.append(item_info)
            else:
                item_info["size"] = stat.st_size
                # 尝试获取 MIME 类型
                mime_type, _ = mimetypes.guess_type(str(item))
                item_info["mime_type"] = mime_type or "application/octet-stream"
                files.append(item_info)

        # 排序：文件夹在前，按名称排序
        folders.sort(key=lambda x: x["name"])
        files.sort(key=lambda x: x["name"])

        return folders, files

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"列出目录内容失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"列出目录内容失败: {str(e)}",
        )


async def create_folder(
    root_dir: str, user_id: int, folder_name: str, relative_path: str = ""
) -> dict:
    """创建文件夹"""
    try:
        parent_path = get_full_path(root_dir, user_id, relative_path)
        new_folder_path = parent_path / folder_name

        # 检查文件夹名是否合法
        if not folder_name or "/" in folder_name or "\\" in folder_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="文件夹名称不合法",
            )

        # 检查是否已存在
        if new_folder_path.exists():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="文件夹已存在",
            )

        # 创建文件夹
        new_folder_path.mkdir(parents=True, exist_ok=True)

        stat = new_folder_path.stat()
        return {
            "id": str(new_folder_path.absolute()),
            "name": folder_name,
            "type": "folder",
            "path": str(new_folder_path.relative_to(get_user_dir(root_dir, user_id))),
            "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"创建文件夹失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建文件夹失败: {str(e)}",
        )


async def upload_file(
    root_dir: str,
    user_id: int,
    file: UploadFile,
    relative_path: str = "",
) -> dict:
    """上传文件"""
    try:
        target_dir = get_full_path(root_dir, user_id, relative_path)

        if not target_dir.exists():
            target_dir.mkdir(parents=True, exist_ok=True)

        # 生成唯一文件名（避免覆盖）
        file_path = target_dir / file.filename
        counter = 1
        while file_path.exists():
            name_parts = file.filename.rsplit(".", 1)
            if len(name_parts) == 2:
                new_name = f"{name_parts[0]}_{counter}.{name_parts[1]}"
            else:
                new_name = f"{file.filename}_{counter}"
            file_path = target_dir / new_name
            counter += 1

        # 保存文件
        async with AIOFile(file_path, "wb") as f:
            content = await file.read()
            await f.write(content)

        stat = file_path.stat()
        mime_type, _ = mimetypes.guess_type(str(file_path))

        return {
            "id": str(file_path.absolute()),
            "name": file_path.name,
            "type": "file",
            "path": str(file_path.relative_to(get_user_dir(root_dir, user_id))),
            "size": stat.st_size,
            "mime_type": mime_type or "application/octet-stream",
            "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"上传文件失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"上传文件失败: {str(e)}",
        )


async def delete_item(root_dir: str, user_id: int, relative_path: str) -> bool:
    """删除文件或文件夹"""
    try:
        item_path = get_full_path(root_dir, user_id, relative_path)

        if not item_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="文件或文件夹不存在",
            )

        # 检查是否为受保护的顶层目录
        if item_path == get_user_dir(root_dir, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="不能删除顶层目录",
            )

        # 删除文件或文件夹
        if item_path.is_dir():
            shutil.rmtree(item_path)
        else:
            item_path.unlink()

        logger.info(f"删除成功: {relative_path}")
        return True

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除失败: {str(e)}",
        )


async def rename_item(
    root_dir: str, user_id: int, relative_path: str, new_name: str
) -> dict:
    """重命名文件或文件夹"""
    try:
        item_path = get_full_path(root_dir, user_id, relative_path)

        if not item_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="文件或文件夹不存在",
            )

        # 检查是否为受保护的顶层目录
        if item_path == get_user_dir(root_dir, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="不能重命名顶层目录",
            )

        # 检查新名称是否合法
        if not new_name or "/" in new_name or "\\" in new_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="名称不合法",
            )

        new_path = item_path.parent / new_name

        # 检查新名称是否已存在
        if new_path.exists():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="名称已存在",
            )

        # 重命名
        item_path.rename(new_path)

        stat = new_path.stat()
        result = {
            "id": str(new_path.absolute()),
            "name": new_name,
            "type": "folder" if new_path.is_dir() else "file",
            "path": str(new_path.relative_to(get_user_dir(root_dir, user_id))),
            "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
        }

        if new_path.is_file():
            result["size"] = stat.st_size
            mime_type, _ = mimetypes.guess_type(str(new_path))
            result["mime_type"] = mime_type or "application/octet-stream"

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"重命名失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"重命名失败: {str(e)}",
        )


def get_file_url(root_dir: str, user_id: int, relative_path: str) -> str:
    """获取文件访问 URL"""
    if root_dir == "uploads":
        return f"/uploads/{user_id}/{relative_path}"
    elif root_dir == "visual":
        return f"/static/visual/{user_id}/{relative_path}"
    elif root_dir == "analysis":
        return f"/static/analysis/{user_id}/{relative_path}"
    else:
        return f"/static/{root_dir}/{user_id}/{relative_path}"
