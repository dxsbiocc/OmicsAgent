"""
Categories API endpoints
Provides hierarchical blog category management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db.base import get_db
from app.core.security import get_current_admin_user
from app.core.logging import get_logger
from app.schemas.auth import UserResponse
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryTreeItem,
    CategoryMoveRequest,
    CategoryStats,
)
from app.services.category import CategoryService

router = APIRouter(prefix="/categories", tags=["categories"])
logger = get_logger("categories_api")


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_admin_user),
):
    """Create a new blog category (admin only)"""
    try:
        category = await CategoryService.create_category(category_data, db)
        logger.info(
            f"Category created by admin {current_user.username}: {category.name}"
        )
        return category

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create category: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create category",
        )


@router.get("/", response_model=List[CategoryResponse])
async def get_categories(
    skip: int = Query(0, ge=0, description="Number of categories to skip"),
    limit: int = Query(100, ge=1, le=100, description="Number of categories to return"),
    search: Optional[str] = Query(
        None, description="Search categories by name or description"
    ),
    parent_id: Optional[int] = Query(None, description="Filter by parent category ID"),
    level: Optional[int] = Query(None, description="Filter by category level"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: AsyncSession = Depends(get_db),
):
    """Get all blog categories with optional filters"""
    try:
        categories = await CategoryService.get_all_categories(
            db, skip, limit, search, parent_id, level, is_active
        )
        return categories

    except Exception as e:
        logger.error(f"Failed to get categories: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get categories",
        )


@router.get("/tree", response_model=List[CategoryTreeItem])
async def get_category_tree(
    root_only: bool = Query(True, description="Return only root categories"),
    db: AsyncSession = Depends(get_db),
):
    """Get category tree structure"""
    try:
        tree = await CategoryService.get_category_tree(db, root_only)
        return tree

    except Exception as e:
        logger.error(f"Failed to get category tree: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get category tree",
        )


@router.get("/stats", response_model=List[CategoryStats])
async def get_category_stats(
    category_id: Optional[int] = Query(
        None, description="Get stats for specific category"
    ),
    db: AsyncSession = Depends(get_db),
):
    """Get category statistics"""
    try:
        stats = await CategoryService.get_category_stats(db, category_id)
        return stats

    except Exception as e:
        logger.error(f"Failed to get category stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get category stats",
        )


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific category by ID"""
    try:
        category = await CategoryService.get_category_by_id(category_id, db)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
            )
        return category

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get category {category_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get category",
        )


@router.get("/slug/{slug}", response_model=CategoryResponse)
async def get_category_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    """Get a specific category by slug"""
    try:
        category = await CategoryService.get_category_by_slug(slug, db)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
            )
        return category

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get category by slug {slug}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get category",
        )


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_admin_user),
):
    """Update a blog category (admin only)"""
    try:
        category = await CategoryService.update_category(category_id, category_data, db)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
            )

        logger.info(
            f"Category updated by admin {current_user.username}: {category.name}"
        )
        return category

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update category {category_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update category",
        )


@router.put("/{category_id}/move", response_model=CategoryResponse)
async def move_category(
    category_id: int,
    move_data: CategoryMoveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_admin_user),
):
    """Move category to new parent (admin only)"""
    try:
        category = await CategoryService.move_category(category_id, move_data, db)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
            )

        logger.info(f"Category moved by admin {current_user.username}: {category.name}")
        return category

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to move category {category_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to move category",
        )


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_admin_user),
):
    """Delete a blog category (admin only)"""
    try:
        success = await CategoryService.delete_category(category_id, db)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
            )

        logger.info(
            f"Category deleted by admin {current_user.username}: ID {category_id}"
        )

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete category {category_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete category",
        )
