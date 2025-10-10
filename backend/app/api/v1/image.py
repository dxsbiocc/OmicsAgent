"""
Image API
用户图片管理接口
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
import math

from app.db.base import get_db
from app.models.user import User
from app.schemas.image import (
    ImageResponse,
    ImageUploadResponse,
    ImageListResponse,
    ImageUpdate,
)
from app.core.security import get_current_active_user
from app.core.logging import get_logger
from app.services.image import ImageService

router = APIRouter(prefix="/image", tags=["image"])
logger = get_logger("image_api")


@router.post("/upload", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload image to user image storage"""
    logger.info(f"用户上传图片: {file.filename}", extra={"user_id": current_user.id})

    try:
        image_record = await ImageService.upload_image(
            file=file,
            user_id=current_user.id,
            db=db,
            description=description,
            tags=tags,
        )

        return ImageUploadResponse(
            success=True,
            message="图片上传成功",
            image=image_record,
            file_url=image_record.file_url,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"图片上传失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"图片上传失败: {str(e)}",
        )


@router.get("/", response_model=ImageListResponse)
async def get_user_images(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    tags: Optional[str] = Query(None, description="标签过滤"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user image list"""
    logger.info(f"获取用户图片列表", extra={"user_id": current_user.id})

    try:
        images, total = await ImageService.get_user_images(
            user_id=current_user.id,
            db=db,
            page=page,
            page_size=page_size,
            search=search,
            tags=tags,
        )

        total_pages = math.ceil(total / page_size) if total > 0 else 1

        return ImageListResponse(
            images=images,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    except Exception as e:
        logger.error(f"获取图片列表失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取图片列表失败: {str(e)}",
        )


@router.get("/{image_id}", response_model=ImageResponse)
async def get_image(
    image_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get single image information"""
    logger.info(f"获取图片信息: {image_id}", extra={"user_id": current_user.id})

    image = await ImageService.get_image_by_id(image_id, current_user.id, db)
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="图片不存在")

    return image


@router.put("/{image_id}", response_model=ImageResponse)
async def update_image(
    image_id: int,
    update_data: ImageUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update image information"""
    logger.info(f"更新图片信息: {image_id}", extra={"user_id": current_user.id})

    image = await ImageService.update_image(image_id, current_user.id, update_data, db)
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="图片不存在")

    return image


@router.delete("/{image_id}")
async def delete_image(
    image_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """删除图片"""
    logger.info(f"删除图片: {image_id}", extra={"user_id": current_user.id})

    success = await ImageService.delete_image(image_id, current_user.id, db)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="图片不存在")

    return {"message": "图片删除成功"}


@router.get("/{image_id}/url")
async def get_image_url(
    image_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """获取图片访问URL"""
    logger.info(f"获取图片URL: {image_id}", extra={"user_id": current_user.id})

    image = await ImageService.get_image_by_id(image_id, current_user.id, db)
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="图片不存在")

    return {"url": image.file_url}
