"""
Image Service
处理用户图片的管理和文件操作
"""

import os
import uuid
import shutil
from pathlib import Path
from typing import Optional, Tuple, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from fastapi import UploadFile, HTTPException, status
from PIL import Image
from aiofile import AIOFile

from app.models.image_library import ImageLibrary
from app.models.user import User
from app.schemas.image import ImageCreate, ImageUpdate
from app.core.logging import get_logger

logger = get_logger("image")

# 配置上传目录
UPLOAD_DIR = Path("uploads")
STATIC_DIR = Path("static")

# 确保目录存在
UPLOAD_DIR.mkdir(exist_ok=True)
STATIC_DIR.mkdir(exist_ok=True)


def get_user_upload_dir(user_id: int) -> Path:
    """获取用户上传目录"""
    user_dir = UPLOAD_DIR / str(user_id)
    user_dir.mkdir(exist_ok=True)
    return user_dir


def get_user_images_dir(user_id: int) -> Path:
    """获取用户图片目录"""
    images_dir = get_user_upload_dir(user_id) / "上传"
    images_dir.mkdir(exist_ok=True)
    return images_dir


def get_user_static_dir(user_id: int) -> Path:
    """获取用户静态文件目录（已弃用，用户文件统一存储在uploads目录）"""
    # 不再使用static目录存储用户文件，统一使用uploads目录
    return get_user_upload_dir(user_id)


# 允许的图片格式
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

# 图片尺寸限制
MAX_IMAGE_SIZE = 20 * 1024 * 1024  # 20MB
MAX_DIMENSIONS = (4000, 4000)  # 最大尺寸


class ImageService:
    """图片服务"""

    @staticmethod
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

        if file_size > MAX_IMAGE_SIZE:
            return (
                False,
                f"文件过大: {file_size / 1024 / 1024:.2f}MB。最大允许: {MAX_IMAGE_SIZE / 1024 / 1024}MB",
            )

        return True, ""

    @staticmethod
    async def process_image_file(
        file: UploadFile, user_id: int
    ) -> Tuple[str, str, int, int, int]:
        """处理图片文件：保存、调整尺寸、获取信息"""
        try:
            # 获取用户图片目录
            images_dir = get_user_images_dir(user_id)

            # 生成唯一文件名：用户ID_时间戳_UUID.扩展名
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_id = str(uuid.uuid4())[:8]
            file_extension = Path(file.filename).suffix.lower()
            filename = f"{user_id}_{timestamp}_{file_id}{file_extension}"

            file_path = images_dir / filename

            # 保存原始文件
            async with AIOFile(file_path, "wb") as f:
                content = await file.read()
                await f.write(content)

            # 获取文件大小
            file_size = len(content)

            # 使用PIL处理图片
            width, height = None, None
            with Image.open(file_path) as img:
                # 获取原始尺寸
                width, height = img.size

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

                # 如果图片过大，调整尺寸
                if width > MAX_DIMENSIONS[0] or height > MAX_DIMENSIONS[1]:
                    img.thumbnail(MAX_DIMENSIONS, Image.Resampling.LANCZOS)
                    width, height = img.size

                # 保存处理后的图片
                img.save(file_path, "JPEG", quality=90, optimize=True)

            logger.info(f"图片处理完成: {filename}, 尺寸: {width}x{height}")
            return filename, str(file_path), file_size, width, height

        except Exception as e:
            logger.error(f"图片处理失败: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"图片处理失败: {str(e)}",
            )

    @staticmethod
    def get_image_url(user_id: int, filename: str) -> str:
        """获取图片的访问URL"""
        return f"/uploads/{user_id}/上传/{filename}"

    @staticmethod
    async def upload_image(
        file: UploadFile,
        user_id: int,
        db: AsyncSession,
        description: Optional[str] = None,
        tags: Optional[str] = None,
    ) -> ImageLibrary:
        """上传图片到用户图片存储"""
        # 验证文件
        is_valid, error_message = await ImageService.validate_image_file(file)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=error_message
            )

        # 处理图片
        filename, file_path, file_size, width, height = (
            await ImageService.process_image_file(file, user_id)
        )

        # 获取文件URL
        file_url = ImageService.get_image_url(user_id, filename)

        # 创建图片记录
        image_record = ImageLibrary(
            filename=filename,
            original_filename=file.filename,
            file_path=file_path,
            file_url=file_url,
            file_size=file_size,
            mime_type=file.content_type,
            width=width,
            height=height,
            description=description,
            tags=tags,
            user_id=user_id,
        )

        db.add(image_record)
        await db.commit()
        await db.refresh(image_record)

        logger.info(f"图片上传成功: {filename}, 用户: {user_id}")
        return image_record

    @staticmethod
    async def get_user_images(
        user_id: int,
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        tags: Optional[str] = None,
    ) -> Tuple[List[ImageLibrary], int]:
        """获取用户的图片列表"""
        query = select(ImageLibrary).where(
            and_(ImageLibrary.user_id == user_id, ImageLibrary.is_active == True)
        )

        # 搜索过滤
        if search:
            query = query.where(
                ImageLibrary.original_filename.contains(search)
                | ImageLibrary.description.contains(search)
            )

        # 标签过滤
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",")]
            for tag in tag_list:
                query = query.where(ImageLibrary.tags.contains(tag))

        # 排序
        query = query.order_by(ImageLibrary.created_at.desc())

        # 分页
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await db.execute(query)
        images = result.scalars().all()

        # 获取总数
        count_query = select(func.count(ImageLibrary.id)).where(
            and_(ImageLibrary.user_id == user_id, ImageLibrary.is_active == True)
        )
        if search:
            count_query = count_query.where(
                ImageLibrary.original_filename.contains(search)
                | ImageLibrary.description.contains(search)
            )
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",")]
            for tag in tag_list:
                count_query = count_query.where(ImageLibrary.tags.contains(tag))

        count_result = await db.execute(count_query)
        total = count_result.scalar()

        return images, total

    @staticmethod
    async def get_image_by_id(
        image_id: int, user_id: int, db: AsyncSession
    ) -> Optional[ImageLibrary]:
        """根据ID获取图片"""
        query = select(ImageLibrary).where(
            and_(
                ImageLibrary.id == image_id,
                ImageLibrary.user_id == user_id,
                ImageLibrary.is_active == True,
            )
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def update_image(
        image_id: int, user_id: int, update_data: ImageUpdate, db: AsyncSession
    ) -> Optional[ImageLibrary]:
        """更新图片信息"""
        image = await ImageService.get_image_by_id(image_id, user_id, db)
        if not image:
            return None

        # 更新字段
        if update_data.description is not None:
            image.description = update_data.description
        if update_data.tags is not None:
            image.tags = update_data.tags
        if update_data.is_active is not None:
            image.is_active = update_data.is_active

        await db.commit()
        await db.refresh(image)
        return image

    @staticmethod
    async def delete_image(image_id: int, user_id: int, db: AsyncSession) -> bool:
        """删除图片（软删除）"""
        image = await ImageService.get_image_by_id(image_id, user_id, db)
        if not image:
            return False

        # 软删除
        image.is_active = False
        await db.commit()

        # 删除物理文件
        try:
            file_path = Path(image.file_path)
            if file_path.exists():
                file_path.unlink()

            logger.info(f"图片删除成功: {image.filename}")
        except Exception as e:
            logger.error(f"删除图片文件失败: {e}")

        return True
