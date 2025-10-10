from typing import Optional, List
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.blog import BlogPost, UserPostLike, UserPostFavorite
from app.models.tag import Tag
from app.models.category import Category
from app.models.comment import Comment
from app.schemas.blog import BlogPostResponse
from app.services.interaction import InteractionService
from app.utils.query_helpers import (
    get_blog_post_with_relationships,
    get_category_with_relationships,
)


class BlogService:
    """Service for blog post operations and responses"""

    @staticmethod
    async def get_post_response(
        post_id: int, db: AsyncSession, current_user_id: Optional[int] = None
    ) -> Optional[BlogPostResponse]:
        """Get formatted post response"""
        # Use query helper to avoid lazy loading issues
        post = await get_blog_post_with_relationships(db, post_id)

        if not post:
            return None

        # Get author username and avatar
        author_username = None
        author_avatar_url = None
        if post.author:
            author_username = post.author.username
            author_avatar_url = post.author.avatar_url

        # Get tags
        tags = []
        if post.tags:
            tags = [
                {"id": tag.id, "name": tag.name, "slug": tag.slug} for tag in post.tags
            ]

        # Get category info
        category_name = None
        if post.category:
            category_name = post.category.name

        # Check if current user liked/favorited this post
        is_liked = False
        is_favorited = False
        if current_user_id:
            is_liked = await InteractionService.has_user_liked_post(
                current_user_id, post.id, db
            )
            is_favorited = await InteractionService.has_user_favorited_post(
                current_user_id, post.id, db
            )

        return BlogPostResponse(
            id=post.id,
            title=post.title,
            slug=post.slug,
            content=post.content,
            excerpt=post.excerpt,
            background_image_url=post.background_image_url,
            author_id=post.author_id,
            author_username=author_username,
            author_avatar_url=author_avatar_url,
            category_id=post.category_id,
            category_name=category_name,
            status=post.status,
            featured=post.featured,
            comments_enabled=post.comments_enabled,
            view_count=post.view_count,
            like_count=post.like_count,
            favorite_count=post.favorite_count,
            comment_count=post.comment_count,
            created_at=post.created_at,
            updated_at=post.updated_at,
            published_at=post.published_at,
            tags=tags,
            is_liked=is_liked,
            is_favorited=is_favorited,
        )

    @staticmethod
    async def add_tags_to_post(post_id: int, tag_ids: List[int], db: AsyncSession):
        """Add tags to a post"""
        from app.services.tag import TagService

        post = await get_blog_post_with_relationships(db, post_id)
        if not post:
            return

        # Validate tags exist and are active
        tags = await TagService.validate_tags_exist(tag_ids, db)

        # Add tags to post
        post.tags.extend(tags)
        await db.commit()

    @staticmethod
    async def update_post_tags(post_id: int, tag_ids: List[int], db: AsyncSession):
        """Update tags for a post"""
        post = await get_blog_post_with_relationships(db, post_id)
        if not post:
            return

        # Clear existing tags
        post.tags.clear()

        # Add new tags
        if tag_ids:
            await BlogService.add_tags_to_post(post_id, tag_ids, db)

    @staticmethod
    async def update_like_count(post_id: int, db: AsyncSession) -> int:
        """Update like count for a post"""
        stmt = select(func.count(UserPostLike.user_id)).where(
            UserPostLike.post_id == post_id
        )
        result = await db.execute(stmt)
        like_count = result.scalar() or 0

        # Update the post's like_count
        post = await get_blog_post_with_relationships(db, post_id)
        if post:
            post.like_count = like_count
            await db.commit()

        return like_count

    @staticmethod
    async def update_favorite_count(post_id: int, db: AsyncSession) -> int:
        """Update favorite count for a post"""
        stmt = select(func.count(UserPostFavorite.user_id)).where(
            UserPostFavorite.post_id == post_id
        )
        result = await db.execute(stmt)
        favorite_count = result.scalar() or 0

        # Update the post's favorite_count
        post = await get_blog_post_with_relationships(db, post_id)
        if post:
            post.favorite_count = favorite_count
            await db.commit()

        return favorite_count

    @staticmethod
    async def update_comment_count(post_id: int, db: AsyncSession) -> int:
        """Update comment count for a post via generic Comment target"""
        stmt = select(func.count(Comment.id)).where(
            Comment.target_type == "blog_post",
            Comment.target_id == post_id,
            Comment.status == "approved",
        )
        result = await db.execute(stmt)
        comment_count = result.scalar() or 0

        # Update the post's comment_count
        post = await get_blog_post_with_relationships(db, post_id)
        if post:
            post.comment_count = comment_count
            await db.commit()

        return comment_count

    @staticmethod
    async def update_all_counts(post_id: int, db: AsyncSession) -> dict:
        """Update all counts for a post"""
        like_count = await BlogService.update_like_count(post_id, db)
        favorite_count = await BlogService.update_favorite_count(post_id, db)
        comment_count = await BlogService.update_comment_count(post_id, db)

        return {
            "like_count": like_count,
            "favorite_count": favorite_count,
            "comment_count": comment_count,
        }

    @staticmethod
    async def set_post_category(
        post_id: int, category_id: Optional[int], db: AsyncSession
    ):
        """Set category for a post"""
        post = await get_blog_post_with_relationships(db, post_id)
        if not post:
            return

        # Validate category if provided
        if category_id:
            category = await get_category_with_relationships(db, category_id)
            if not category:
                raise ValueError(f"Category with ID {category_id} not found")
            post.category_id = category_id
        else:
            post.category_id = None

        await db.commit()

    @staticmethod
    async def get_posts_by_category(
        category_id: int,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20,
        current_user_id: Optional[int] = None,
    ) -> List[BlogPostResponse]:
        """Get posts by category"""
        # Get posts with category and preload relationships
        stmt = (
            select(BlogPost)
            .options(
                selectinload(BlogPost.tags),
                selectinload(BlogPost.category),
                selectinload(BlogPost.author),
            )
            .where(BlogPost.category_id == category_id)
            .where(BlogPost.status == "published")
            .order_by(BlogPost.published_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        posts = result.scalars().all()

        # Convert to response format
        responses = []
        for post in posts:
            # Get author username
            author_username = None
            if post.author:
                author_username = post.author.username

            # Get tags
            tags = []
            if post.tags:
                tags = [
                    {"id": tag.id, "name": tag.name, "slug": tag.slug}
                    for tag in post.tags
                ]

            # Get category info
            category_name = None
            if post.category:
                category_name = post.category.name

            # Check if current user liked/favorited this post
            is_liked = False
            is_favorited = False
            if current_user_id:
                is_liked = await InteractionService.has_user_liked_post(
                    current_user_id, post.id, db
                )
                is_favorited = await InteractionService.has_user_favorited_post(
                    current_user_id, post.id, db
                )

            response = BlogPostResponse(
                id=post.id,
                title=post.title,
                slug=post.slug,
                content=post.content,
                excerpt=post.excerpt,
                background_image_url=post.background_image_url,
                author_id=post.author_id,
                author_username=author_username,
                category_id=post.category_id,
                category_name=category_name,
                status=post.status,
                featured=post.featured,
                comments_enabled=post.comments_enabled,
                view_count=post.view_count,
                like_count=post.like_count,
                favorite_count=post.favorite_count,
                comment_count=post.comment_count,
                created_at=post.created_at,
                updated_at=post.updated_at,
                published_at=post.published_at,
                tags=tags,
                is_liked=is_liked,
                is_favorited=is_favorited,
            )
            responses.append(response)

        return responses

    @staticmethod
    async def get_category_stats(category_id: int, db: AsyncSession) -> dict:
        """Get statistics for a category"""
        # Count posts in category
        post_count_stmt = select(func.count(BlogPost.id)).where(
            BlogPost.category_id == category_id
        )
        post_count_result = await db.execute(post_count_stmt)
        post_count = post_count_result.scalar()

        # Count published posts
        published_count_stmt = select(func.count(BlogPost.id)).where(
            BlogPost.category_id == category_id, BlogPost.status == "published"
        )
        published_count_result = await db.execute(published_count_stmt)
        published_count = published_count_result.scalar()

        # Get category info
        category = await get_category_with_relationships(db, category_id)
        if not category:
            return {}

        return {
            "category_id": category_id,
            "category_name": category.name,
            "category_slug": category.slug,
            "total_posts": post_count,
            "published_posts": published_count,
            "draft_posts": post_count - published_count,
        }
