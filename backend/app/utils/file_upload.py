import os
import uuid
import shutil
from pathlib import Path
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException, status
from PIL import Image
import aiofiles
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("file_upload")

# 配置上传目录
UPLOAD_DIR = Path("uploads")
AVATAR_DIR = UPLOAD_DIR / "avatars"
STATIC_DIR = Path("static")
AVATAR_STATIC_DIR = STATIC_DIR / "avatars"

# 确保目录存在
UPLOAD_DIR.mkdir(exist_ok=True)
AVATAR_DIR.mkdir(exist_ok=True)
STATIC_DIR.mkdir(exist_ok=True)
AVATAR_STATIC_DIR.mkdir(exist_ok=True)

# 允许的图片格式
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

# 头像尺寸限制
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5MB
AVATAR_DIMENSIONS = (200, 200)  # 目标尺寸


async def validate_image_file(file: UploadFile) -> Tuple[bool, str]:
    """验证上传的图片文件"""
    # 检查文件类型
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        return (
            False,
            f"不支持的文件类型: {file.content_type}。支持的格式: {', '.join(ALLOWED_IMAGE_TYPES)}",
        )

    # 检查文件扩展名
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        return (
            False,
            f"不支持的文件扩展名: {file_extension}。支持的格式: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # 检查文件大小
    file_size = 0
    file.file.seek(0, 2)  # 移动到文件末尾
    file_size = file.file.tell()
    file.file.seek(0)  # 重置到文件开头

    if file_size > MAX_AVATAR_SIZE:
        return (
            False,
            f"文件过大: {file_size / 1024 / 1024:.2f}MB。最大允许: {MAX_AVATAR_SIZE / 1024 / 1024}MB",
        )

    return True, ""


async def process_avatar_image(file: UploadFile) -> str:
    """处理头像图片：调整尺寸、优化质量"""
    try:
        # 生成唯一文件名
        file_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix.lower()
        filename = f"{file_id}{file_extension}"
        file_path = AVATAR_DIR / filename

        # 保存原始文件
        async with aiofiles.open(file_path, "wb") as f:
            content = await file.read()
            await f.write(content)

        # 使用PIL处理图片
        with Image.open(file_path) as img:
            # 转换为RGB（如果是RGBA）
            if img.mode in ("RGBA", "LA", "P"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "P":
                    img = img.convert("RGBA")
                background.paste(
                    img, mask=img.split()[-1] if img.mode == "RGBA" else None
                )
                img = background
            elif img.mode != "RGB":
                img = img.convert("RGB")

            # 调整尺寸，保持宽高比
            img.thumbnail(AVATAR_DIMENSIONS, Image.Resampling.LANCZOS)

            # 创建正方形图片（居中裁剪）
            width, height = img.size
            if width != height:
                size = min(width, height)
                left = (width - size) // 2
                top = (height - size) // 2
                right = left + size
                bottom = top + size
                img = img.crop((left, top, right, bottom))

            # 调整到目标尺寸
            img = img.resize(AVATAR_DIMENSIONS, Image.Resampling.LANCZOS)

            # 保存处理后的图片
            img.save(file_path, "JPEG", quality=85, optimize=True)

        # 复制到静态文件目录
        static_file_path = AVATAR_STATIC_DIR / filename
        shutil.copy2(file_path, static_file_path)

        logger.info(f"头像处理完成: {filename}")
        return filename

    except Exception as e:
        logger.error(f"头像处理失败: {e}")
        # 清理可能创建的文件
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"头像处理失败: {str(e)}",
        )


async def save_avatar_file(file: UploadFile) -> str:
    """保存头像文件并返回文件名"""
    # 验证文件
    is_valid, error_message = await validate_image_file(file)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=error_message
        )

    # 处理图片
    filename = await process_avatar_image(file)

    return filename


def get_avatar_url(filename: str) -> str:
    """获取头像的访问URL"""
    return f"/static/avatars/{filename}"


def delete_avatar_file(filename: str) -> bool:
    """删除头像文件"""
    try:
        # 删除上传目录中的文件
        upload_file_path = AVATAR_DIR / filename
        if upload_file_path.exists():
            upload_file_path.unlink()

        # 删除静态目录中的文件
        static_file_path = AVATAR_STATIC_DIR / filename
        if static_file_path.exists():
            static_file_path.unlink()

        logger.info(f"头像文件删除成功: {filename}")
        return True

    except Exception as e:
        logger.error(f"头像文件删除失败: {e}")
        return False


def get_preset_avatars() -> list:
    """获取预设头像列表"""
    preset_avatars = []

    # 检查前端预设头像目录
    frontend_avatar_dir = Path("../frontend/public/images/avatar")
    if frontend_avatar_dir.exists():
        for i in range(1, 51):  # 1-50
            filename = f"peeps-avatar-alpha-{i}.png"
            file_path = frontend_avatar_dir / filename
            if file_path.exists():
                preset_avatars.append(
                    {
                        "filename": filename,
                        "url": f"/images/avatar/{filename}",
                        "display_name": f"头像 {i}",
                    }
                )

    return preset_avatars
