"""
Category Service
Handles hierarchical blog category management
"""

from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from app.db.base import AsyncSessionLocal
from app.core.logging import get_logger
from app.models.category import Category
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryTreeItem,
    CategoryMoveRequest,
    CategoryStats,
)
from typing import List, Optional


class CategoryService:
    """Blog category management service"""

    @staticmethod
    async def validate_category_exists(
        category_id: int, db: AsyncSessionLocal
    ) -> Category:
        """Validate that a category exists and is active"""
        from fastapi import HTTPException, status

        result = await db.execute(select(Category).where(Category.id == category_id))
        category = result.scalar_one_or_none()

        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with ID {category_id} does not exist",
            )

        if not category.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with ID {category_id} is not active",
            )

        return category

    @staticmethod
    async def validate_categories_exist(
        category_ids: List[int], db: AsyncSessionLocal
    ) -> List[Category]:
        """Validate that multiple categories exist and are active"""
        from fastapi import HTTPException, status

        if not category_ids:
            return []

        result = await db.execute(select(Category).where(Category.id.in_(category_ids)))
        categories = result.scalars().all()

        found_category_ids = {cat.id for cat in categories}
        missing_category_ids = set(category_ids) - found_category_ids

        if missing_category_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Categories with IDs {list(missing_category_ids)} do not exist",
            )

        inactive_categories = [cat for cat in categories if not cat.is_active]
        if inactive_categories:
            inactive_category_ids = [cat.id for cat in inactive_categories]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Categories with IDs {inactive_category_ids} are not active",
            )

        return categories

    @staticmethod
    async def get_or_create_category_by_name(
        category_name: str, db: AsyncSessionLocal
    ) -> Category:
        """Get existing category by name or create a new one"""
        import re
        from pypinyin import lazy_pinyin
        from fastapi import HTTPException, status

        # Check if category exists by name
        result = await db.execute(
            select(Category).where(Category.name == category_name)
        )
        category = result.scalar_one_or_none()

        if not category:
            # Create new category
            # Generate slug from category name
            category_pinyin = " ".join(lazy_pinyin(category_name))
            category_slug = re.sub(
                r"[^a-zA-Z0-9\u4e00-\u9fa5]+", "-", category_pinyin.lower()
            )
            category_slug = re.sub(r"-+", "-", category_slug).strip("-")

            # Ensure category slug is unique
            counter = 1
            original_slug = category_slug
            while True:
                existing_category_slug = await db.execute(
                    select(Category).where(Category.slug == category_slug)
                )
                if not existing_category_slug.scalar_one_or_none():
                    break
                category_slug = f"{original_slug}-{counter}"
                counter += 1

            category = Category(
                name=category_name,
                slug=category_slug,
                description=f"用户创建的分类: {category_name}",
                content_type="blog",
                is_active=True,
            )
            db.add(category)
            await db.flush()  # Get the category ID

            logger = get_logger("category")
            logger.info(f"创建新分类: {category.name} (ID: {category.id})")

        return category

    @staticmethod
    async def create_category(
        category_data: CategoryCreate, db: AsyncSessionLocal
    ) -> CategoryResponse:
        """Create a new category"""
        logger = get_logger("category")

        try:
            # Check if category with same name or slug already exists
            existing_category = await db.execute(
                select(Category).where(
                    (Category.name == category_data.name)
                    | (Category.slug == category_data.slug)
                )
            )
            if existing_category.scalar_one_or_none():
                raise ValueError(
                    f"Category with name '{category_data.name}' or slug '{category_data.slug}' already exists"
                )

            # Validate parent category if specified
            parent_category = None
            if category_data.parent_id:
                parent_result = await db.execute(
                    select(Category).where(Category.id == category_data.parent_id)
                )
                parent_category = parent_result.scalar_one_or_none()
                if not parent_category:
                    raise ValueError(
                        f"Parent category with ID {category_data.parent_id} not found"
                    )

            # Calculate level and path
            level = 0
            path = category_data.name
            if parent_category:
                level = parent_category.level + 1
                path = f"{parent_category.path}/{category_data.name}"

            # Create new category
            category = Category(
                name=category_data.name,
                slug=category_data.slug,
                description=category_data.description,
                color=category_data.color,
                icon=category_data.icon,
                parent_id=category_data.parent_id,
                level=level,
                path=path,
                sort_order=category_data.sort_order,
                is_active=category_data.is_active,
            )

            db.add(category)
            await db.commit()
            await db.refresh(category)

            # Load relationships
            await db.refresh(category, ["parent"])

            logger.info(f"Category created: {category.name} (ID: {category.id})")
            return CategoryResponse.from_orm(category)

        except Exception as e:
            logger.error(f"Failed to create category: {e}")
            await db.rollback()
            raise

    @staticmethod
    async def get_category_by_id(
        category_id: int, db: AsyncSessionLocal
    ) -> Optional[CategoryResponse]:
        """Get category by ID"""
        try:
            result = await db.execute(
                select(Category)
                .options(selectinload(Category.parent), selectinload(Category.children))
                .where(Category.id == category_id)
            )
            category = result.scalar_one_or_none()

            if category:
                return CategoryResponse.from_orm(category)
            return None

        except Exception as e:
            logger = get_logger("category")
            logger.error(f"Failed to get category by ID {category_id}: {e}")
            return None

    @staticmethod
    async def get_category_by_slug(
        slug: str, db: AsyncSessionLocal
    ) -> Optional[CategoryResponse]:
        """Get category by slug"""
        try:
            result = await db.execute(
                select(Category)
                .options(selectinload(Category.parent), selectinload(Category.children))
                .where(Category.slug == slug)
            )
            category = result.scalar_one_or_none()

            if category:
                return CategoryResponse.from_orm(category)
            return None

        except Exception as e:
            logger = get_logger("category")
            logger.error(f"Failed to get category by slug {slug}: {e}")
            return None

    @staticmethod
    async def get_all_categories(
        db: AsyncSessionLocal,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        parent_id: Optional[int] = None,
        level: Optional[int] = None,
        is_active: Optional[bool] = None,
    ) -> List[CategoryResponse]:
        """Get all categories with optional filters"""
        try:
            query = select(Category).options(
                selectinload(Category.parent), selectinload(Category.children)
            )

            # Apply filters
            if search:
                query = query.where(
                    Category.name.ilike(f"%{search}%")
                    | Category.description.ilike(f"%{search}%")
                )

            if parent_id is not None:
                query = query.where(Category.parent_id == parent_id)

            if level is not None:
                query = query.where(Category.level == level)

            if is_active is not None:
                query = query.where(Category.is_active == is_active)

            query = (
                query.offset(skip)
                .limit(limit)
                .order_by(Category.level, Category.sort_order, Category.name)
            )

            result = await db.execute(query)
            categories = result.scalars().all()

            return [CategoryResponse.from_orm(cat) for cat in categories]

        except Exception as e:
            logger = get_logger("category")
            logger.error(f"Failed to get categories: {e}")
            return []

    @staticmethod
    async def get_category_tree(
        db: AsyncSessionLocal, root_only: bool = True
    ) -> List[CategoryTreeItem]:
        """Get category tree structure"""
        try:
            # Get all categories
            query = (
                select(Category)
                .options(selectinload(Category.parent), selectinload(Category.children))
                .where(Category.is_active == True)
            )

            if root_only:
                query = query.where(Category.parent_id.is_(None))

            query = query.order_by(Category.level, Category.sort_order, Category.name)

            result = await db.execute(query)
            categories = result.scalars().all()

            # Build tree structure
            category_map = {
                cat.id: CategoryTreeItem.from_orm(cat) for cat in categories
            }
            root_categories = []

            for category in categories:
                category_item = category_map[category.id]
                if category.parent_id is None:
                    root_categories.append(category_item)
                else:
                    if category.parent_id in category_map:
                        category_map[category.parent_id].children.append(category_item)

            return root_categories

        except Exception as e:
            logger = get_logger("category")
            logger.error(f"Failed to get category tree: {e}")
            return []

    @staticmethod
    async def update_category(
        category_id: int, category_data: CategoryUpdate, db: AsyncSessionLocal
    ) -> Optional[CategoryResponse]:
        """Update a category"""
        logger = get_logger("category")

        try:
            # Get existing category
            result = await db.execute(
                select(Category).where(Category.id == category_id)
            )
            category = result.scalar_one_or_none()

            if not category:
                return None

            # Check for name/slug conflicts if updating
            if category_data.name or category_data.slug:
                existing_category = await db.execute(
                    select(Category).where(
                        and_(
                            Category.id != category_id,
                            (Category.name == category_data.name)
                            | (Category.slug == category_data.slug),
                        )
                    )
                )
                if existing_category.scalar_one_or_none():
                    raise ValueError(
                        f"Category with name '{category_data.name}' or slug '{category_data.slug}' already exists"
                    )

            # Validate parent category if changing
            if category_data.parent_id is not None:
                if category_data.parent_id == category_id:
                    raise ValueError("Category cannot be its own parent")

                if category_data.parent_id:
                    parent_result = await db.execute(
                        select(Category).where(Category.id == category_data.parent_id)
                    )
                    parent_category = parent_result.scalar_one_or_none()
                    if not parent_category:
                        raise ValueError(
                            f"Parent category with ID {category_data.parent_id} not found"
                        )

            # Update fields
            update_data = category_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(category, field, value)

            # Recalculate level and path if parent changed
            if "parent_id" in update_data:
                if category.parent_id:
                    parent_result = await db.execute(
                        select(Category).where(Category.id == category.parent_id)
                    )
                    parent = parent_result.scalar_one()
                    category.level = parent.level + 1
                    category.path = f"{parent.path}/{category.name}"
                else:
                    category.level = 0
                    category.path = category.name

                # Update all descendants' levels and paths
                await CategoryService._update_descendants_paths(category, db)

            await db.commit()
            await db.refresh(category, ["parent", "children"])

            logger.info(f"Category updated: {category.name} (ID: {category.id})")
            return CategoryResponse.from_orm(category)

        except Exception as e:
            logger.error(f"Failed to update category {category_id}: {e}")
            await db.rollback()
            raise

    @staticmethod
    async def _update_descendants_paths(category: Category, db: AsyncSessionLocal):
        """Update paths for all descendant categories"""
        for child in category.children:
            child.level = category.level + 1
            child.path = f"{category.path}/{child.name}"
            await CategoryService._update_descendants_paths(child, db)

    @staticmethod
    async def move_category(
        category_id: int, move_data: CategoryMoveRequest, db: AsyncSessionLocal
    ) -> Optional[CategoryResponse]:
        """Move category to new parent"""
        logger = get_logger("category")

        try:
            # Get category
            result = await db.execute(
                select(Category).where(Category.id == category_id)
            )
            category = result.scalar_one_or_none()

            if not category:
                return None

            # Validate new parent
            if move_data.new_parent_id:
                parent_result = await db.execute(
                    select(Category).where(Category.id == move_data.new_parent_id)
                )
                parent = parent_result.scalar_one_or_none()
                if not parent:
                    raise ValueError(
                        f"Parent category with ID {move_data.new_parent_id} not found"
                    )

                # Check for circular reference
                if move_data.new_parent_id == category_id:
                    raise ValueError("Category cannot be its own parent")

                # Check if new parent is a descendant
                descendants = category.get_descendants()
                if any(desc.id == move_data.new_parent_id for desc in descendants):
                    raise ValueError("Cannot move category to its own descendant")

            # Update parent and sort order
            category.parent_id = move_data.new_parent_id
            if move_data.new_sort_order is not None:
                category.sort_order = move_data.new_sort_order

            # Recalculate level and path
            if category.parent_id:
                parent_result = await db.execute(
                    select(Category).where(Category.id == category.parent_id)
                )
                parent = parent_result.scalar_one()
                category.level = parent.level + 1
                category.path = f"{parent.path}/{category.name}"
            else:
                category.level = 0
                category.path = category.name

            # Update all descendants
            await CategoryService._update_descendants_paths(category, db)

            await db.commit()
            await db.refresh(category, ["parent", "children"])

            logger.info(f"Category moved: {category.name} (ID: {category.id})")
            return CategoryResponse.from_orm(category)

        except Exception as e:
            logger.error(f"Failed to move category {category_id}: {e}")
            await db.rollback()
            raise

    @staticmethod
    async def delete_category(category_id: int, db: AsyncSessionLocal) -> bool:
        """Delete a category"""
        logger = get_logger("category")

        try:
            # Get category with children and posts
            result = await db.execute(
                select(Category)
                .options(selectinload(Category.children))
                .where(Category.id == category_id)
            )
            category = result.scalar_one_or_none()

            if not category:
                return False

            # Check if category has children
            if category.children:
                raise ValueError(
                    f"Cannot delete category '{category.name}' - it has child categories"
                )

            # Check if category has posts
            from app.models.blog import BlogPost

            posts_result = await db.execute(
                select(func.count(BlogPost.id)).where(
                    BlogPost.category_id == category_id
                )
            )
            post_count = posts_result.scalar()

            if post_count > 0:
                raise ValueError(
                    f"Cannot delete category '{category.name}' - it has {post_count} posts"
                )

            # Delete category
            await db.execute(
                select(Category).where(Category.id == category_id).delete()
            )
            await db.commit()

            logger.info(f"Category deleted: {category.name} (ID: {category.id})")
            return True

        except Exception as e:
            logger.error(f"Failed to delete category {category_id}: {e}")
            await db.rollback()
            raise

    @staticmethod
    async def get_category_stats(
        db: AsyncSessionLocal, category_id: Optional[int] = None
    ) -> List[CategoryStats]:
        """Get category statistics"""
        try:
            from app.models.blog import BlogPost

            query = select(
                Category.id,
                Category.name,
                Category.slug,
                Category.level,
                Category.path,
                Category.is_active,
                func.count(BlogPost.id).label("post_count"),
                func.count(Category.children.id).label("children_count"),
            ).outerjoin(BlogPost, Category.id == BlogPost.category_id)

            if category_id:
                query = query.where(Category.id == category_id)

            query = query.group_by(
                Category.id,
                Category.name,
                Category.slug,
                Category.level,
                Category.path,
                Category.is_active,
            ).order_by(Category.level, Category.sort_order, Category.name)

            result = await db.execute(query)

            return [
                CategoryStats(
                    id=row.id,
                    name=row.name,
                    slug=row.slug,
                    level=row.level,
                    path=row.path or row.name,
                    post_count=row.post_count,
                    children_count=row.children_count,
                    is_active=row.is_active,
                )
                for row in result
            ]

        except Exception as e:
            logger = get_logger("category")
            logger.error(f"Failed to get category stats: {e}")
            return []
