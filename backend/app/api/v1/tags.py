"""
Tags API endpoints
Provides blog tag management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db.base import get_db
from app.core.security import get_current_admin_user
from app.core.logging import get_logger
from app.schemas.auth import UserResponse
from app.schemas.tag import TagCreate, TagUpdate, TagResponse
from app.services.tag import TagService

router = APIRouter(prefix="/tags", tags=["tags"])
logger = get_logger("tags_api")


@router.post("/", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag_data: TagCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_admin_user),
):
    """Create a new blog tag (admin only)"""
    try:
        tag = await TagService.create_tag(tag_data, db)
        logger.info(f"Tag created by admin {current_user.username}: {tag.name}")
        return tag

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create tag: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create tag",
        )


@router.get("/", response_model=List[TagResponse])
async def get_tags(
    skip: int = Query(0, ge=0, description="Number of tags to skip"),
    limit: int = Query(100, ge=1, le=100, description="Number of tags to return"),
    search: Optional[str] = Query(
        None, description="Search tags by name or description"
    ),
    db: AsyncSession = Depends(get_db),
):
    """Get all blog tags"""
    try:
        tags = await TagService.get_all_tags(db, skip, limit, search)
        return tags

    except Exception as e:
        logger.error(f"Failed to get tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get tags",
        )


@router.get("/popular", response_model=List[dict])
async def get_popular_tags(
    limit: int = Query(10, ge=1, le=50, description="Number of popular tags to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get most popular tags by post count"""
    try:
        tags = await TagService.get_popular_tags(db, limit)
        return tags

    except Exception as e:
        logger.error(f"Failed to get popular tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get popular tags",
        )


@router.get("/search", response_model=List[TagResponse])
async def search_tags(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=50, description="Number of results to return"),
    db: AsyncSession = Depends(get_db),
):
    """Search tags by name or description"""
    try:
        tags = await TagService.search_tags(q, db, limit)
        return tags

    except Exception as e:
        logger.error(f"Failed to search tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search tags",
        )


@router.get("/{tag_id}", response_model=TagResponse)
async def get_tag(tag_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific tag by ID"""
    try:
        tag = await TagService.get_tag_by_id(tag_id, db)
        if not tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found"
            )
        return tag

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get tag {tag_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get tag",
        )


@router.get("/slug/{slug}", response_model=TagResponse)
async def get_tag_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    """Get a specific tag by slug"""
    try:
        tag = await TagService.get_tag_by_slug(slug, db)
        if not tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found"
            )
        return tag

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get tag by slug {slug}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get tag",
        )


@router.get("/{tag_id}/posts", response_model=dict)
async def get_tag_posts(
    tag_id: int,
    skip: int = Query(0, ge=0, description="Number of posts to skip"),
    limit: int = Query(20, ge=1, le=50, description="Number of posts to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get posts associated with a specific tag"""
    try:
        result = await TagService.get_tag_with_posts(tag_id, db, skip, limit)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found"
            )
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get tag posts {tag_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get tag posts",
        )


@router.put("/{tag_id}", response_model=TagResponse)
async def update_tag(
    tag_id: int,
    tag_data: TagUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_admin_user),
):
    """Update a blog tag (admin only)"""
    try:
        tag = await TagService.update_tag(tag_id, tag_data, db)
        if not tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found"
            )

        logger.info(f"Tag updated by admin {current_user.username}: {tag.name}")
        return tag

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update tag {tag_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update tag",
        )


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_admin_user),
):
    """Delete a blog tag (admin only)"""
    try:
        success = await TagService.delete_tag(tag_id, db)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found"
            )

        logger.info(f"Tag deleted by admin {current_user.username}: ID {tag_id}")

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete tag {tag_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete tag",
        )
