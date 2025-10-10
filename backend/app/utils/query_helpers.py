"""
Query helper utilities for avoiding lazy loading issues
"""

from typing import Type, List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.orm.decl_api import DeclarativeBase


class QueryHelper:
    """Helper class for building queries with proper relationship loading"""

    @staticmethod
    async def get_with_relationships(
        db: AsyncSession,
        model: Type[DeclarativeBase],
        id: int,
        relationships: Optional[List[str]] = None,
    ) -> Optional[Any]:
        """
        Get a single record by ID with preloaded relationships

        Args:
            db: Database session
            model: SQLAlchemy model class
            id: Record ID
            relationships: List of relationship names to preload

        Returns:
            Model instance or None
        """
        if not relationships:
            relationships = []

        query = select(model).where(model.id == id)

        # Add relationship loading options
        for rel in relationships:
            if hasattr(model, rel):
                query = query.options(selectinload(getattr(model, rel)))

        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all_with_relationships(
        db: AsyncSession,
        model: Type[DeclarativeBase],
        relationships: Optional[List[str]] = None,
        skip: int = 0,
        limit: int = 100,
        **filters,
    ) -> List[Any]:
        """
        Get multiple records with preloaded relationships

        Args:
            db: Database session
            model: SQLAlchemy model class
            relationships: List of relationship names to preload
            skip: Number of records to skip
            limit: Maximum number of records to return
            **filters: Additional filter conditions

        Returns:
            List of model instances
        """
        if not relationships:
            relationships = []

        query = select(model)

        # Add relationship loading options
        for rel in relationships:
            if hasattr(model, rel):
                query = query.options(selectinload(getattr(model, rel)))

        # Apply filters
        for field, value in filters.items():
            if hasattr(model, field) and value is not None:
                query = query.where(getattr(model, field) == value)

        # Apply pagination
        query = query.offset(skip).limit(limit)

        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    def get_blog_post_relationships() -> List[str]:
        """Get standard relationships for BlogPost model"""
        return ["author", "tags", "category"]

    @staticmethod
    def get_user_relationships() -> List[str]:
        """Get standard relationships for User model"""
        return ["blog_posts", "followers", "following"]

    @staticmethod
    def get_category_relationships() -> List[str]:
        """Get standard relationships for Category model"""
        return ["parent", "children", "posts"]

    @staticmethod
    def get_comment_relationships() -> List[str]:
        """Get standard relationships for Comment model"""
        return ["author", "parent", "replies"]


# Convenience functions for common models
async def get_blog_post_with_relationships(
    db: AsyncSession, post_id: int
) -> Optional[Any]:
    """Get blog post with all standard relationships"""
    from app.models.blog import BlogPost

    return await QueryHelper.get_with_relationships(
        db, BlogPost, post_id, QueryHelper.get_blog_post_relationships()
    )


async def get_user_with_relationships(db: AsyncSession, user_id: int) -> Optional[Any]:
    """Get user with all standard relationships"""
    from app.models.user import User

    return await QueryHelper.get_with_relationships(
        db, User, user_id, QueryHelper.get_user_relationships()
    )


async def get_category_with_relationships(
    db: AsyncSession, category_id: int
) -> Optional[Any]:
    """Get category with all standard relationships"""
    from app.models.category import Category

    return await QueryHelper.get_with_relationships(
        db, Category, category_id, QueryHelper.get_category_relationships()
    )


async def get_comment_with_relationships(
    db: AsyncSession, comment_id: int
) -> Optional[Any]:
    """Get comment with all standard relationships"""
    from app.models.comment import Comment

    return await QueryHelper.get_with_relationships(
        db, Comment, comment_id, QueryHelper.get_comment_relationships()
    )
