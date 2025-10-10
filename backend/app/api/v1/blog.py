from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc
from typing import List, Optional
from datetime import datetime, timezone

from app.db.base import get_db
from app.models.user import User
from app.models.blog import (
    BlogPost,
)
from app.models.tag import Tag
from app.core.security import (
    get_current_active_user,
    get_current_admin_user,
    get_current_user_optional_from_cookie,
)
from app.api.deps import get_pagination_params
from app.core.logging import get_logger
from app.services.blog import BlogService
from app.models.category import Category
from app.utils.query_helpers import get_blog_post_with_relationships


from app.schemas.blog import (
    BlogPostCreate,
    BlogPostUpdate,
    BlogPostResponse,
)
from app.services.background_image import BackgroundImageService

router = APIRouter(prefix="/blog", tags=["blog"])
logger = get_logger("blog")


@router.post(
    "/posts", response_model=BlogPostResponse, status_code=status.HTTP_201_CREATED
)
async def create_post(
    post_data: BlogPostCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new blog post (admin or user)"""
    logger.info(f"创建博客文章: {post_data.title}", extra={"user_id": current_user.id})

    # Generate slug from title if not provided or empty
    if not post_data.slug or post_data.slug.strip() == "":
        import re
        from pypinyin import lazy_pinyin

        # Convert Chinese to pinyin, then to slug
        title_pinyin = " ".join(lazy_pinyin(post_data.title))
        slug = re.sub(r"[^a-zA-Z0-9\u4e00-\u9fa5]+", "-", title_pinyin.lower())
        slug = re.sub(r"-+", "-", slug).strip("-")
    else:
        slug = post_data.slug

    # Ensure slug is unique
    counter = 1
    original_slug = slug
    while True:
        existing_post = await db.execute(select(BlogPost).where(BlogPost.slug == slug))
        if not existing_post.scalar_one_or_none():
            break
        slug = f"{original_slug}-{counter}"
        counter += 1

    # Handle category - validate or create if needed
    category_id = post_data.category_id
    if category_id:
        # Validate that the category exists
        from app.services.category import CategoryService

        await CategoryService.validate_category_exists(category_id, db)

    if post_data.category_name and not category_id:
        # Get or create category by name
        from app.services.category import CategoryService

        category = await CategoryService.get_or_create_category_by_name(
            post_data.category_name, db
        )
        category_id = category.id

    # Handle tags - validate or create if needed
    tag_ids = []

    # First validate provided tag_ids if any
    if post_data.tag_ids:
        from app.services.tag import TagService

        await TagService.validate_tags_exist(post_data.tag_ids, db)
        tag_ids.extend(post_data.tag_ids)

    if post_data.tag_names:
        # Get or create tags by names
        from app.services.tag import TagService

        tags = await TagService.get_or_create_tags_by_names(post_data.tag_names, db)
        tag_ids.extend([tag.id for tag in tags])

    # Get background image URL (random if not provided)
    background_image_url = BackgroundImageService.get_background_image_url(
        post_data.background_image_url
    )

    # Create post
    post = BlogPost(
        title=post_data.title,
        slug=slug,
        content=post_data.content,
        excerpt=post_data.excerpt,
        background_image_url=background_image_url,
        author_id=current_user.id,
        category_id=category_id,
        status=post_data.status,
        featured=post_data.featured,
        comments_enabled=post_data.comments_enabled,
    )

    # Set published_at if status is published
    if post_data.status == "published":
        post.published_at = datetime.now(timezone.utc)

    db.add(post)
    await db.flush()  # Get the post ID

    # Add tags if provided
    if tag_ids:
        from app.models.blog import BlogPostTag

        for tag_id in tag_ids:
            post_tag = BlogPostTag(post_id=post.id, tag_id=tag_id)
            db.add(post_tag)

    await db.commit()

    logger.info(f"博客文章创建成功: {post.id}")

    return await BlogService.get_post_response(post.id, db, current_user.id)


@router.put("/posts/{post_id}", response_model=BlogPostResponse)
async def update_post(
    post_id: int,
    post_data: BlogPostUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a blog post (admin only)"""
    logger.info(f"更新博客文章: {post_id}", extra={"user_id": current_user.id})

    post = await get_blog_post_with_relationships(db, post_id)
    if not post:
        logger.warning(f"文章不存在: {post_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )

    # Check if slug is being changed and if it's available
    if post_data.slug and post_data.slug != post.slug:
        existing_post = await db.execute(
            select(BlogPost).where(BlogPost.slug == post_data.slug)
        )
        if existing_post.scalar_one_or_none():
            logger.warning(f"文章slug已存在: {post_data.slug}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists"
            )

    # Update post data
    update_data = post_data.model_dump(exclude_unset=True, exclude={"tag_ids"})

    # Handle background image URL
    if "background_image_url" in update_data:
        update_data["background_image_url"] = (
            BackgroundImageService.get_background_image_url(
                update_data["background_image_url"]
            )
        )

    for field, value in update_data.items():
        setattr(post, field, value)

    # Set published_at if status changed to published
    if post_data.status == "published" and post.status != "published":
        post.published_at = datetime.now(timezone.utc)

    # Update tags if provided
    if post_data.tag_ids is not None:
        await BlogService.update_post_tags(post.id, post_data.tag_ids, db)

    await db.commit()
    await db.refresh(post)

    logger.info(f"博客文章更新成功: {post_id}")

    return await BlogService.get_post_response(post.id, db, current_user.id)


@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a blog post (admin only)"""
    logger.info(f"删除博客文章: {post_id}", extra={"user_id": current_user.id})

    post = await get_blog_post_with_relationships(db, post_id)
    if not post:
        logger.warning(f"文章不存在: {post_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )

    # Note: Statistics are now computed properties, no need to update

    await db.delete(post)
    await db.commit()

    logger.info(f"博客文章删除成功: {post_id}")
    return {"message": "Post deleted successfully"}


# Public blog post viewing endpoints
@router.get("/background-images", response_model=List[str])
async def get_background_images():
    """Get list of available background images"""
    return BackgroundImageService.get_all_background_images()


@router.get("/posts", response_model=List[BlogPostResponse])
async def get_posts(
    pagination: dict = Depends(get_pagination_params),
    status: Optional[str] = Query("published", description="Filter by status"),
    featured: Optional[bool] = Query(None, description="Filter by featured status"),
    search: Optional[str] = Query(None, description="Search in title and content"),
    tag: Optional[str] = Query(None, description="Filter by tag slug"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    category_slug: Optional[str] = Query(None, description="Filter by category slug"),
    current_user: Optional[User] = Depends(get_current_user_optional_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    """Get blog posts (public access)"""
    logger.info(
        f"获取博客文章列表: status={status}, featured={featured}, search={search}, tag={tag}, category_id={category_id}, category_slug={category_slug}"
    )

    query = select(BlogPost)

    # Apply filters
    if status:
        query = query.where(BlogPost.status == status)

    if featured is not None:
        query = query.where(BlogPost.featured == featured)

    if search:
        query = query.where(
            or_(
                BlogPost.title.contains(search),
                BlogPost.content.contains(search),
                BlogPost.excerpt.contains(search),
            )
        )

    if tag:
        query = query.join(Tag, BlogPost.tags).where(Tag.slug == tag)

    if category_id:
        query = query.where(BlogPost.category_id == category_id)

    if category_slug:

        query = query.join(Category, BlogPost.category_id == Category.id).where(
            Category.slug == category_slug
        )

    # Apply default sorting by published_at (newest first)
    query = query.order_by(desc(BlogPost.published_at))

    # Apply pagination
    query = query.offset(pagination["skip"]).limit(pagination["limit"])

    result = await db.execute(query)
    posts = result.scalars().all()

    # Convert to response format
    post_responses = []
    for post in posts:
        post_response = await BlogService.get_post_response(
            post.id, db, current_user.id if current_user else None
        )
        post_responses.append(post_response)

    logger.info(f"返回 {len(post_responses)} 篇文章")
    return post_responses


@router.get("/posts/{post_id}", response_model=BlogPostResponse)
async def get_post(
    post_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific blog post (public access)"""
    logger.info(f"获取博客文章: {post_id}")

    post = await get_blog_post_with_relationships(db, post_id)
    if not post:
        logger.warning(f"文章不存在: {post_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )

    # Increment view count
    post.view_count += 1
    await db.commit()

    logger.info(f"文章查看次数增加: {post_id}, 当前查看数: {post.view_count}")

    return await BlogService.get_post_response(
        post.id, db, current_user.id if current_user else None
    )


@router.get("/posts/slug/{slug}", response_model=BlogPostResponse)
async def get_post_by_slug(
    slug: str,
    current_user: Optional[User] = Depends(get_current_user_optional_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific blog post by slug (public access)"""
    logger.info(f"通过slug获取博客文章: {slug}")

    # Find post by slug
    post = await db.execute(select(BlogPost).where(BlogPost.slug == slug))
    post = post.scalar_one_or_none()

    if not post:
        logger.warning(f"文章不存在: {slug}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )

    # Get post with relationships
    post_with_relations = await get_blog_post_with_relationships(db, post.id)
    if not post_with_relations:
        logger.warning(f"文章关系数据不存在: {post.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )

    # Increment view count
    post_with_relations.view_count += 1
    await db.commit()

    logger.info(
        f"文章查看次数增加: {post.id}, 当前查看数: {post_with_relations.view_count}"
    )

    return await BlogService.get_post_response(
        post.id, db, current_user.id if current_user else None
    )


@router.get("/posts/{post_id}/comments")
async def get_post_comments(
    post_id: int,
    current_user: Optional[User] = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get comments for a blog post (public access) - redirects to generic comment API"""
    logger.info(f"获取文章评论: {post_id}")

    post = await get_blog_post_with_relationships(db, post_id)
    if not post:
        logger.warning(f"文章不存在: {post_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )

    # This would typically be handled by the frontend or a different endpoint
    # For now, we'll return a message directing to the comment API
    return {
        "message": "Please use /comments/?target_type=blog_post&target_id={post_id} to get comments",
        "target_type": "blog_post",
        "target_id": post_id,
    }


# Category-related endpoints
@router.get("/posts/category/{category_id}", response_model=List[BlogPostResponse])
async def get_posts_by_category(
    category_id: int,
    skip: int = Query(0, ge=0, description="Number of posts to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of posts to return"),
    current_user: Optional[User] = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get posts by category"""
    logger.info(f"获取分类文章: {category_id}")

    try:
        posts = await BlogService.get_posts_by_category(
            category_id, db, skip, limit, current_user.id if current_user else None
        )
        return posts
    except Exception as e:
        logger.error(f"获取分类文章失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get posts by category",
        )


@router.get("/posts/category/{category_id}/stats")
async def get_category_stats(
    category_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get statistics for a category"""
    logger.info(f"获取分类统计: {category_id}")

    try:
        stats = await BlogService.get_category_stats(category_id, db)
        if not stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
            )
        return stats
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取分类统计失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get category stats",
        )


@router.put("/posts/{post_id}/category")
async def update_post_category(
    post_id: int,
    category_id: Optional[int] = Query(
        None, description="Category ID (null to remove category)"
    ),
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update post category (admin only)"""
    logger.info(
        f"更新文章分类: {post_id} -> {category_id}", extra={"user_id": current_user.id}
    )

    try:
        await BlogService.set_post_category(post_id, category_id, db)
        logger.info(f"文章分类更新成功: {post_id}")
        return {"message": "Post category updated successfully"}
    except ValueError as e:
        logger.warning(f"分类更新失败: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"分类更新失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update post category",
        )


@router.put("/posts/{post_id}/comments")
async def toggle_post_comments(
    post_id: int,
    enabled: bool = Query(..., description="Enable or disable comments"),
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle comments for a blog post (admin only)"""
    logger = get_logger("blog")
    logger.info(
        f"切换文章评论状态: {post_id} -> {enabled}", extra={"user_id": current_user.id}
    )

    try:
        post = await get_blog_post_with_relationships(db, post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
            )

        post.comments_enabled = enabled
        await db.commit()
        await db.refresh(post)

        logger.info(f"文章评论状态更新成功: {post_id} -> {enabled}")
        return {
            "message": f"Comments {'enabled' if enabled else 'disabled'} successfully",
            "comments_enabled": post.comments_enabled,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"评论状态更新失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update comments status",
        )
