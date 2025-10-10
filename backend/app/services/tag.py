"""
Tag Service
Handles blog tag management and operations
"""

from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from app.db.base import AsyncSessionLocal
from app.core.logging import get_logger
from app.models.tag import Tag
from app.models.blog import BlogPost, BlogPostTag
from app.schemas.tag import TagCreate, TagUpdate, TagResponse
from typing import List, Optional


class TagService:
    """Blog tag management service"""

    @staticmethod
    async def validate_tag_exists(tag_id: int, db: AsyncSessionLocal) -> Tag:
        """Validate that a tag exists and is active"""
        from fastapi import HTTPException, status

        result = await db.execute(select(Tag).where(Tag.id == tag_id))
        tag = result.scalar_one_or_none()

        if not tag:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tag with ID {tag_id} does not exist",
            )

        if not getattr(tag, "is_active", True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tag with ID {tag_id} is not active",
            )

        return tag

    @staticmethod
    async def validate_tags_exist(
        tag_ids: List[int], db: AsyncSessionLocal
    ) -> List[Tag]:
        """Validate that multiple tags exist and are active"""
        from fastapi import HTTPException, status

        if not tag_ids:
            return []

        result = await db.execute(select(Tag).where(Tag.id.in_(tag_ids)))
        tags = result.scalars().all()

        found_tag_ids = {tag.id for tag in tags}
        missing_tag_ids = set(tag_ids) - found_tag_ids

        if missing_tag_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tags with IDs {list(missing_tag_ids)} do not exist",
            )

        inactive_tags = [tag for tag in tags if not getattr(tag, "is_active", True)]
        if inactive_tags:
            inactive_tag_ids = [tag.id for tag in inactive_tags]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tags with IDs {inactive_tag_ids} are not active",
            )

        return tags

    @staticmethod
    async def get_or_create_tags_by_names(
        tag_names: List[str], db: AsyncSessionLocal
    ) -> List[Tag]:
        """Get existing tags by names or create new ones"""
        import re
        from pypinyin import lazy_pinyin
        from fastapi import HTTPException, status

        if not tag_names:
            return []

        tags = []
        logger = get_logger("tag")

        for tag_name in tag_names:
            # Check if tag exists
            result = await db.execute(select(Tag).where(Tag.name == tag_name))
            tag = result.scalar_one_or_none()

            if not tag:
                # Create new tag
                # Generate slug from tag name
                tag_pinyin = " ".join(lazy_pinyin(tag_name))
                tag_slug = re.sub(
                    r"[^a-zA-Z0-9\u4e00-\u9fa5]+", "-", tag_pinyin.lower()
                )
                tag_slug = re.sub(r"-+", "-", tag_slug).strip("-")

                # Ensure tag slug is unique
                counter = 1
                original_slug = tag_slug
                while True:
                    existing_tag_slug = await db.execute(
                        select(Tag).where(Tag.slug == tag_slug)
                    )
                    if not existing_tag_slug.scalar_one_or_none():
                        break
                    tag_slug = f"{original_slug}-{counter}"
                    counter += 1

                tag = Tag(
                    name=tag_name,
                    slug=tag_slug,
                    description=f"用户创建的标签: {tag_name}",
                    content_type="blog",
                    is_active=True,
                )
                db.add(tag)
                await db.flush()  # Get the tag ID
                logger.info(f"创建新标签: {tag.name} (ID: {tag.id})")

            tags.append(tag)

        return tags

    @staticmethod
    async def create_tag(tag_data: TagCreate, db: AsyncSessionLocal) -> TagResponse:
        """Create a new blog tag"""
        logger = get_logger("tag")

        try:
            # Check if tag with same name or slug already exists
            existing_tag = await db.execute(
                select(Tag).where(
                    (Tag.name == tag_data.name) | (Tag.slug == tag_data.slug)
                )
            )
            if existing_tag.scalar_one_or_none():
                raise ValueError(
                    f"Tag with name '{tag_data.name}' or slug '{tag_data.slug}' already exists"
                )

            # Create new tag
            tag = Tag(
                name=tag_data.name,
                slug=tag_data.slug,
                description=tag_data.description,
                color=tag_data.color,
                image_url=tag_data.image_url,
                content_type=tag_data.content_type or "blog",
            )

            db.add(tag)
            await db.commit()
            await db.refresh(tag)

            logger.info(f"Tag created: {tag.name} (ID: {tag.id})")
            return TagResponse.from_orm(tag)

        except Exception as e:
            logger.error(f"Failed to create tag: {e}")
            await db.rollback()
            raise

    @staticmethod
    async def get_tag_by_id(
        tag_id: int, db: AsyncSessionLocal
    ) -> Optional[TagResponse]:
        """Get tag by ID"""
        try:
            result = await db.execute(select(Tag).where(Tag.id == tag_id))
            tag = result.scalar_one_or_none()

            if tag:
                return TagResponse.from_orm(tag)
            return None

        except Exception as e:
            logger = get_logger("tag")
            logger.error(f"Failed to get tag by ID {tag_id}: {e}")
            return None

    @staticmethod
    async def get_tag_by_slug(
        slug: str, db: AsyncSessionLocal
    ) -> Optional[TagResponse]:
        """Get tag by slug"""
        try:
            result = await db.execute(select(Tag).where(Tag.slug == slug))
            tag = result.scalar_one_or_none()

            if tag:
                return TagResponse.from_orm(tag)
            return None

        except Exception as e:
            logger = get_logger("tag")
            logger.error(f"Failed to get tag by slug {slug}: {e}")
            return None

    @staticmethod
    async def get_all_tags(
        db: AsyncSessionLocal,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
    ) -> List[TagResponse]:
        """Get all tags with optional search"""
        try:
            query = select(Tag)

            if search:
                query = query.where(
                    Tag.name.ilike(f"%{search}%") | Tag.description.ilike(f"%{search}%")
                )

            query = query.offset(skip).limit(limit).order_by(Tag.name)

            result = await db.execute(query)
            tags = result.scalars().all()

            return [TagResponse.from_orm(tag) for tag in tags]

        except Exception as e:
            logger = get_logger("tag")
            logger.error(f"Failed to get tags: {e}")
            return []

    @staticmethod
    async def update_tag(
        tag_id: int, tag_data: TagUpdate, db: AsyncSessionLocal
    ) -> Optional[TagResponse]:
        """Update a tag"""
        logger = get_logger("tag")

        try:
            # Get existing tag
            result = await db.execute(select(Tag).where(Tag.id == tag_id))
            tag = result.scalar_one_or_none()

            if not tag:
                return None

            # Check for name/slug conflicts if updating
            if tag_data.name or tag_data.slug:
                existing_tag = await db.execute(
                    select(Tag).where(
                        and_(
                            Tag.id != tag_id,
                            (Tag.name == tag_data.name) | (Tag.slug == tag_data.slug),
                        )
                    )
                )
                if existing_tag.scalar_one_or_none():
                    raise ValueError(
                        f"Tag with name '{tag_data.name}' or slug '{tag_data.slug}' already exists"
                    )

            # Update fields
            update_data = tag_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(tag, field, value)

            await db.commit()
            await db.refresh(tag)

            logger.info(f"Tag updated: {tag.name} (ID: {tag.id})")
            return TagResponse.from_orm(tag)

        except Exception as e:
            logger.error(f"Failed to update tag {tag_id}: {e}")
            await db.rollback()
            raise

    @staticmethod
    async def delete_tag(tag_id: int, db: AsyncSessionLocal) -> bool:
        """Delete a tag"""
        logger = get_logger("tag")

        try:
            # Get tag with post count
            result = await db.execute(select(Tag).where(Tag.id == tag_id))
            tag = result.scalar_one_or_none()

            if not tag:
                return False

            # Check if tag is used by any posts
            post_count = await db.execute(
                select(func.count(BlogPostTag.tag_id)).where(
                    BlogPostTag.tag_id == tag_id
                )
            )
            count = post_count.scalar()

            if count > 0:
                raise ValueError(
                    f"Cannot delete tag '{tag.name}' - it is used by {count} posts"
                )

            # Delete tag
            await db.execute(select(Tag).where(Tag.id == tag_id).delete())
            await db.commit()

            logger.info(f"Tag deleted: {tag.name} (ID: {tag.id})")
            return True

        except Exception as e:
            logger.error(f"Failed to delete tag {tag_id}: {e}")
            await db.rollback()
            raise

    @staticmethod
    async def get_tag_with_posts(
        tag_id: int, db: AsyncSessionLocal, skip: int = 0, limit: int = 20
    ) -> Optional[dict]:
        """Get tag with associated posts"""
        try:
            # Get tag
            result = await db.execute(select(Tag).where(Tag.id == tag_id))
            tag = result.scalar_one_or_none()

            if not tag:
                return None

            # Get posts with this tag
            posts_result = await db.execute(
                select(BlogPost)
                .join(BlogPostTag, BlogPost.id == BlogPostTag.post_id)
                .where(BlogPostTag.tag_id == tag_id)
                .offset(skip)
                .limit(limit)
                .order_by(BlogPost.published_at.desc())
            )
            posts = posts_result.scalars().all()

            return {
                "tag": TagResponse.from_orm(tag),
                "posts": [
                    {
                        "id": post.id,
                        "title": post.title,
                        "slug": post.slug,
                        "excerpt": post.excerpt,
                        "status": post.status,
                        "created_at": post.created_at,
                        "view_count": post.view_count,
                        "like_count": post.like_count,
                    }
                    for post in posts
                ],
                "total_posts": len(posts),
            }

        except Exception as e:
            logger = get_logger("tag")
            logger.error(f"Failed to get tag with posts {tag_id}: {e}")
            return None

    @staticmethod
    async def get_popular_tags(db: AsyncSessionLocal, limit: int = 10) -> List[dict]:
        """Get most popular tags by post count"""
        try:
            result = await db.execute(
                select(
                    Tag.id,
                    Tag.name,
                    Tag.slug,
                    Tag.color,
                    func.count(BlogPostTag.post_id).label("post_count"),
                )
                .join(BlogPostTag, Tag.id == BlogPostTag.tag_id)
                .group_by(Tag.id, Tag.name, Tag.slug, Tag.color)
                .order_by(func.count(BlogPostTag.post_id).desc())
                .limit(limit)
            )

            return [
                {
                    "id": row.id,
                    "name": row.name,
                    "slug": row.slug,
                    "color": row.color,
                    "post_count": row.post_count,
                }
                for row in result
            ]

        except Exception as e:
            logger = get_logger("tag")
            logger.error(f"Failed to get popular tags: {e}")
            return []

    @staticmethod
    async def search_tags(
        query: str, db: AsyncSessionLocal, limit: int = 20
    ) -> List[TagResponse]:
        """Search tags by name or description"""
        try:
            result = await db.execute(
                select(Tag)
                .where(
                    Tag.name.ilike(f"%{query}%") | Tag.description.ilike(f"%{query}%")
                )
                .order_by(Tag.name)
                .limit(limit)
            )

            tags = result.scalars().all()
            return [TagResponse.from_orm(tag) for tag in tags]

        except Exception as e:
            logger = get_logger("tag")
            logger.error(f"Failed to search tags: {e}")
            return []
