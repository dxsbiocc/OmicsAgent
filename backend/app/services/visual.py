import json
import os
import uuid
import asyncio
from pathlib import Path
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, or_

from app.core.logging import get_logger
from app.schemas.visual import (
    VisualToolInfo,
    VisualRunResponse,
    VisualToolCreate,
    VisualToolUpdate,
    VisualToolResponse,
    VisualToolCommentCreate,
    VisualToolCommentResponse,
)
from app.models.visual import (
    VisualTool,
    UserToolLike,
    UserToolFavorite,
    VisualToolComment,
    VisualToolCommentLike,
)


TOOLS_ROOT = Path("scripts/visual")
OUTPUT_DIR = Path("static/images/visual")


class VisualService:
    """Service to manage visual tools and run R scripts to produce images."""

    @staticmethod
    def list_tools() -> List[VisualToolInfo]:
        tools: List[VisualToolInfo] = []
        if not TOOLS_ROOT.exists():
            return tools

        # 遍历所有分类目录
        for category_dir in TOOLS_ROOT.iterdir():
            if not category_dir.is_dir():
                continue

            # 检查是否直接在分类目录下有工具文件
            meta_path = category_dir / "meta.json"
            if meta_path.exists():
                # 直接在分类目录下的工具
                tool_info = VisualService._extract_tool_info(
                    category_dir, category_dir.name, category_dir.name
                )
                if tool_info:
                    tools.append(tool_info)
            else:
                # 遍历子分类目录
                for subcategory_dir in category_dir.iterdir():
                    if not subcategory_dir.is_dir():
                        continue

                    subcategory_meta_path = subcategory_dir / "meta.json"
                    if subcategory_meta_path.exists():
                        # 子分类中的工具
                        tool_name = f"{category_dir.name}/{subcategory_dir.name}"
                        tool_info = VisualService._extract_tool_info(
                            subcategory_dir, tool_name, subcategory_dir.name
                        )
                        if tool_info:
                            tools.append(tool_info)

        return tools

    @staticmethod
    def _extract_tool_info(
        tool_dir: Path, tool_name: str, display_name: str
    ) -> Optional[VisualToolInfo]:
        """从工具目录提取工具信息"""
        meta_path = tool_dir / "meta.json"
        docs_path = tool_dir / "README.md"
        sample_image = tool_dir / "sample.png"
        sample_data = tool_dir / "sample.csv"

        meta: Dict[str, Any] = {}
        if meta_path.exists():
            try:
                meta = json.loads(meta_path.read_text(encoding="utf-8"))
            except Exception:
                meta = {}

        return VisualToolInfo(
            tool=tool_name,
            name=meta.get("name", display_name),
            description=meta.get("description", ""),
            params_schema=meta.get("params_schema", {}),
            defaults=meta.get("defaults", {}),
            sample_data_filename="sample.csv" if sample_data.exists() else None,
            sample_image_url=(
                f"/static/images/visual/{tool_name.replace('/', '_')}/sample.png"
                if sample_image.exists()
                else None
            ),
            docs_markdown=(
                docs_path.read_text(encoding="utf-8") if docs_path.exists() else None
            ),
        )

    @staticmethod
    def get_tool_info(tool: str) -> Optional[VisualToolInfo]:
        """根据工具名称获取工具信息，支持层级结构"""
        # 处理层级结构：category/subcategory 或 category
        if "/" in tool:
            # 子分类工具：line/basic
            category, subcategory = tool.split("/", 1)
            tool_dir = TOOLS_ROOT / category / subcategory
        else:
            # 直接分类工具：scatter
            tool_dir = TOOLS_ROOT / tool

        if not tool_dir.exists():
            return None

        # 检查是否有meta.json文件
        meta_path = tool_dir / "meta.json"
        if not meta_path.exists():
            return None

        # 提取工具信息
        display_name = tool_dir.name
        return VisualService._extract_tool_info(tool_dir, tool, display_name)

    @staticmethod
    async def run_tool(tool: str, params: Dict[str, Any]) -> VisualRunResponse:
        # 处理层级结构：category/subcategory 或 category
        if "/" in tool:
            # 子分类工具：line/basic
            category, subcategory = tool.split("/", 1)
            tool_dir = TOOLS_ROOT / category / subcategory
        else:
            # 直接分类工具：scatter
            tool_dir = TOOLS_ROOT / tool

        script_path = tool_dir / "run.R"
        if not script_path.exists():
            return VisualRunResponse(
                success=False, message="R script not found", tool=tool
            )

        # Ensure output dir exists per tool (handle hierarchical names)
        tool_output_dir = OUTPUT_DIR / tool.replace("/", "_")
        tool_output_dir.mkdir(parents=True, exist_ok=True)

        # Load defaults from meta.json
        meta_path = tool_dir / "meta.json"
        defaults = {}
        if meta_path.exists():
            try:
                meta = json.loads(meta_path.read_text(encoding="utf-8"))
                defaults = meta.get("defaults", {})
            except Exception:
                pass

        # Merge params with defaults
        params_with_defaults = defaults.copy()
        params_with_defaults.update(params)

        # Generate unique run ID to prevent conflicts
        run_id = uuid.uuid4().hex[:12]
        params_json_path = tool_output_dir / f"params_{run_id}.json"
        output_png = tool_output_dir / f"output_{run_id}.png"

        # Write params to JSON file
        params_json_path.write_text(
            json.dumps(params_with_defaults, ensure_ascii=False), encoding="utf-8"
        )

        # Set environment variables
        env = os.environ.copy()
        env["VISUAL_PARAMS_JSON"] = str(params_json_path.resolve())
        env["VISUAL_OUTPUT_PNG"] = str(output_png.resolve())

        try:
            # Run R script asynchronously
            process = await asyncio.create_subprocess_exec(
                "Rscript",
                str(script_path.resolve()),
                cwd=str(tool_dir.resolve()),
                env=env,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            # Wait for completion with timeout
            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(), timeout=30.0
                )
            except asyncio.TimeoutError:
                process.kill()
                await process.wait()
                return VisualRunResponse(
                    success=False,
                    message="R script execution timed out",
                    tool=tool,
                    used_params=params_with_defaults,
                )

            # Check if process failed
            if process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown error"
                return VisualRunResponse(
                    success=False,
                    message=f"R script failed: {error_msg}",
                    tool=tool,
                    used_params=params_with_defaults,
                )

        except Exception as e:
            return VisualRunResponse(
                success=False,
                message=f"Failed to run R script: {str(e)}",
                tool=tool,
                used_params=params_with_defaults,
            )
        finally:
            # Clean up params file immediately
            try:
                params_json_path.unlink()
            except Exception:
                pass

        # Check if output file was created
        if not output_png.exists():
            return VisualRunResponse(
                success=False,
                message="Output image not produced",
                tool=tool,
                used_params=params_with_defaults,
            )

        image_url = f"/static/images/visual/{tool.replace('/', '_')}/{output_png.name}"

        return VisualRunResponse(
            success=True,
            message="ok",
            image_url=image_url,
            output_files=[image_url],
            tool=tool,
            used_params=params_with_defaults,
        )


class VisualToolDBService:
    """Service to manage visual tools in database."""

    @staticmethod
    def get_tools(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        category_id: Optional[int] = None,
        featured: Optional[bool] = None,
        user_id: Optional[int] = None,
    ) -> List[VisualToolResponse]:
        """获取工具列表"""
        query = select(VisualTool)

        if category_id:
            query = query.where(VisualTool.category_id == category_id)
        if featured is not None:
            query = query.where(VisualTool.featured == featured)

        query = query.offset(skip).limit(limit).order_by(VisualTool.created_at.desc())

        tools = db.execute(query).scalars().all()

        # 转换为响应格式
        result = []
        for tool in tools:
            # 从文件系统获取配置信息
            tool_info = VisualService.get_tool_info(tool.tool)

            tool_dict = {
                "id": tool.id,
                "tool": tool.tool,
                "name": tool.name,
                "description": tool.description,
                "category_id": tool.category_id,
                "author_id": tool.author_id,
                "status": tool.status,
                "featured": tool.featured,
                "view_count": tool.view_count,
                "like_count": tool.like_count,
                "favorite_count": tool.favorite_count,
                "comment_count": tool.comment_count,
                "usage_count": tool.usage_count,
                "created_at": tool.created_at,
                "updated_at": tool.updated_at,
                "author_name": tool.author.full_name if tool.author else None,
                "category_name": tool.category.name if tool.category else None,
                "tags": [tag.name for tag in tool.tags],
                "is_liked": False,
                "is_favorited": False,
                # 从文件系统动态获取的配置信息
                "params_schema": tool_info.params_schema if tool_info else {},
                "defaults": tool_info.defaults if tool_info else {},
                "sample_data_filename": (
                    tool_info.sample_data_filename if tool_info else None
                ),
                "sample_image_url": tool_info.sample_image_url if tool_info else None,
                "docs_markdown": tool_info.docs_markdown if tool_info else None,
            }

            # 如果提供了用户ID，检查用户是否点赞/收藏
            if user_id:
                tool_dict["is_liked"] = any(
                    like.user_id == user_id for like in tool.likes
                )
                tool_dict["is_favorited"] = any(
                    fav.user_id == user_id for fav in tool.favorites
                )

            result.append(VisualToolResponse(**tool_dict))

        return result

    @staticmethod
    def get_tool_by_id(
        db: Session, tool_id: int, user_id: Optional[int] = None
    ) -> Optional[VisualToolResponse]:
        """根据ID获取工具"""
        tool = db.execute(
            select(VisualTool).where(VisualTool.id == tool_id)
        ).scalar_one_or_none()
        if not tool:
            return None

        # 增加查看次数
        tool.view_count += 1
        db.commit()

        # 从文件系统获取配置信息
        tool_info = VisualService.get_tool_info(tool.tool)

        tool_dict = {
            "id": tool.id,
            "tool": tool.tool,
            "name": tool.name,
            "description": tool.description,
            "category_id": tool.category_id,
            "author_id": tool.author_id,
            "status": tool.status,
            "featured": tool.featured,
            "view_count": tool.view_count,
            "like_count": tool.like_count,
            "favorite_count": tool.favorite_count,
            "comment_count": tool.comment_count,
            "usage_count": tool.usage_count,
            "created_at": tool.created_at,
            "updated_at": tool.updated_at,
            "author_name": tool.author.full_name if tool.author else None,
            "category_name": tool.category.name if tool.category else None,
            "tags": [tag.name for tag in tool.tags],
            "is_liked": False,
            "is_favorited": False,
            # 从文件系统动态获取的配置信息
            "params_schema": tool_info.params_schema if tool_info else {},
            "defaults": tool_info.defaults if tool_info else {},
            "sample_data_filename": (
                tool_info.sample_data_filename if tool_info else None
            ),
            "sample_image_url": tool_info.sample_image_url if tool_info else None,
            "docs_markdown": tool_info.docs_markdown if tool_info else None,
        }

        # 如果提供了用户ID，检查用户是否点赞/收藏
        if user_id:
            tool_dict["is_liked"] = any(like.user_id == user_id for like in tool.likes)
            tool_dict["is_favorited"] = any(
                fav.user_id == user_id for fav in tool.favorites
            )

        return VisualToolResponse(**tool_dict)

    @staticmethod
    def get_tool_by_tool_name(db: Session, tool_name: str) -> Optional[VisualTool]:
        """根据工具名称获取工具"""
        return db.execute(
            select(VisualTool).where(VisualTool.tool == tool_name)
        ).scalar_one_or_none()

    @staticmethod
    def create_tool(
        db: Session, tool_data: VisualToolCreate, author_id: int
    ) -> VisualTool:
        """创建工具"""
        tool = VisualTool(**tool_data.model_dump(), author_id=author_id)
        db.add(tool)
        db.commit()
        db.refresh(tool)
        return tool

    @staticmethod
    def update_tool(
        db: Session, tool_id: int, tool_data: VisualToolUpdate
    ) -> Optional[VisualTool]:
        """更新工具"""
        tool = db.execute(
            select(VisualTool).where(VisualTool.id == tool_id)
        ).scalar_one_or_none()
        if not tool:
            return None

        update_data = tool_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tool, field, value)

        db.commit()
        db.refresh(tool)
        return tool

    @staticmethod
    def delete_tool(db: Session, tool_id: int) -> bool:
        """删除工具"""
        tool = db.execute(
            select(VisualTool).where(VisualTool.id == tool_id)
        ).scalar_one_or_none()
        if not tool:
            return False

        db.delete(tool)
        db.commit()
        return True

    @staticmethod
    def like_tool(db: Session, tool_id: int, user_id: int) -> bool:
        """点赞工具"""
        # 检查是否已经点赞
        existing_like = db.execute(
            select(UserToolLike).where(
                and_(UserToolLike.tool_id == tool_id, UserToolLike.user_id == user_id)
            )
        ).scalar_one_or_none()

        if existing_like:
            return False  # 已经点赞过了

        # 创建点赞记录
        like = UserToolLike(tool_id=tool_id, user_id=user_id)
        db.add(like)

        # 更新工具点赞数
        tool = db.execute(
            select(VisualTool).where(VisualTool.id == tool_id)
        ).scalar_one_or_none()
        if tool:
            tool.like_count += 1

        db.commit()
        return True

    @staticmethod
    def unlike_tool(db: Session, tool_id: int, user_id: int) -> bool:
        """取消点赞工具"""
        like = db.execute(
            select(UserToolLike).where(
                and_(UserToolLike.tool_id == tool_id, UserToolLike.user_id == user_id)
            )
        ).scalar_one_or_none()

        if not like:
            return False  # 没有点赞记录

        db.delete(like)

        # 更新工具点赞数
        tool = db.execute(
            select(VisualTool).where(VisualTool.id == tool_id)
        ).scalar_one_or_none()
        if tool and tool.like_count > 0:
            tool.like_count -= 1

        db.commit()
        return True

    @staticmethod
    def favorite_tool(db: Session, tool_id: int, user_id: int) -> bool:
        """收藏工具"""
        # 检查是否已经收藏
        existing_favorite = db.execute(
            select(UserToolFavorite).where(
                and_(
                    UserToolFavorite.tool_id == tool_id,
                    UserToolFavorite.user_id == user_id,
                )
            )
        ).scalar_one_or_none()

        if existing_favorite:
            return False  # 已经收藏过了

        # 创建收藏记录
        favorite = UserToolFavorite(tool_id=tool_id, user_id=user_id)
        db.add(favorite)

        # 更新工具收藏数
        tool = db.execute(
            select(VisualTool).where(VisualTool.id == tool_id)
        ).scalar_one_or_none()
        if tool:
            tool.favorite_count += 1

        db.commit()
        return True

    @staticmethod
    def unfavorite_tool(db: Session, tool_id: int, user_id: int) -> bool:
        """取消收藏工具"""
        favorite = db.execute(
            select(UserToolFavorite).where(
                and_(
                    UserToolFavorite.tool_id == tool_id,
                    UserToolFavorite.user_id == user_id,
                )
            )
        ).scalar_one_or_none()

        if not favorite:
            return False  # 没有收藏记录

        db.delete(favorite)

        # 更新工具收藏数
        tool = db.execute(
            select(VisualTool).where(VisualTool.id == tool_id)
        ).scalar_one_or_none()
        if tool and tool.favorite_count > 0:
            tool.favorite_count -= 1

        db.commit()
        return True

    @staticmethod
    def increment_usage_count(db: Session, tool_name: str) -> bool:
        """增加使用次数"""
        tool = db.execute(
            select(VisualTool).where(VisualTool.tool == tool_name)
        ).scalar_one_or_none()
        if not tool:
            return False

        tool.usage_count += 1
        db.commit()
        return True

    @staticmethod
    def get_tool_comments(
        db: Session,
        tool_id: int,
        skip: int = 0,
        limit: int = 50,
        user_id: Optional[int] = None,
    ) -> List[VisualToolCommentResponse]:
        """获取工具评论"""
        # 获取顶级评论（没有父评论的评论）
        query = (
            select(VisualToolComment)
            .where(
                and_(
                    VisualToolComment.tool_id == tool_id,
                    VisualToolComment.parent_id.is_(None),
                    VisualToolComment.status == "approved",
                )
            )
            .order_by(VisualToolComment.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        comments = db.execute(query).scalars().all()

        result = []
        for comment in comments:
            comment_dict = {
                "id": comment.id,
                "tool_id": comment.tool_id,
                "user_id": comment.user_id,
                "content": comment.content,
                "status": comment.status,
                "like_count": comment.like_count,
                "created_at": comment.created_at,
                "updated_at": comment.updated_at,
                "author_name": comment.user.full_name if comment.user else None,
                "author_avatar": comment.user.avatar_url if comment.user else None,
                "parent_id": comment.parent_id,
                "replies": [],
                "is_liked": False,
            }

            # 如果提供了用户ID，检查用户是否点赞
            if user_id:
                comment_dict["is_liked"] = any(
                    like.user_id == user_id for like in comment.likes
                )

            # 获取回复
            replies_query = (
                select(VisualToolComment)
                .where(
                    and_(
                        VisualToolComment.parent_id == comment.id,
                        VisualToolComment.status == "approved",
                    )
                )
                .order_by(VisualToolComment.created_at.asc())
            )

            replies = db.execute(replies_query).scalars().all()
            comment_dict["replies"] = [
                {
                    "id": reply.id,
                    "tool_id": reply.tool_id,
                    "user_id": reply.user_id,
                    "content": reply.content,
                    "status": reply.status,
                    "like_count": reply.like_count,
                    "created_at": reply.created_at,
                    "updated_at": reply.updated_at,
                    "author_name": reply.user.full_name if reply.user else None,
                    "author_avatar": reply.user.avatar_url if reply.user else None,
                    "parent_id": reply.parent_id,
                    "replies": [],
                    "is_liked": (
                        any(like.user_id == user_id for like in reply.likes)
                        if user_id
                        else False
                    ),
                }
                for reply in replies
            ]

            result.append(VisualToolCommentResponse(**comment_dict))

        return result

    @staticmethod
    def create_tool_comment(
        db: Session, tool_id: int, comment_data: VisualToolCommentCreate, user_id: int
    ) -> VisualToolComment:
        """创建工具评论"""
        comment = VisualToolComment(
            tool_id=tool_id,
            content=comment_data.content,
            parent_id=comment_data.parent_id,
            user_id=user_id,
        )
        db.add(comment)

        # 更新工具评论数
        tool = db.execute(
            select(VisualTool).where(VisualTool.id == tool_id)
        ).scalar_one_or_none()
        if tool:
            tool.comment_count += 1

        db.commit()
        db.refresh(comment)
        return comment

    @staticmethod
    def like_comment(db: Session, comment_id: int, user_id: int) -> bool:
        """点赞评论"""
        # 检查是否已经点赞
        existing_like = db.execute(
            select(VisualToolCommentLike).where(
                and_(
                    VisualToolCommentLike.comment_id == comment_id,
                    VisualToolCommentLike.user_id == user_id,
                )
            )
        ).scalar_one_or_none()

        if existing_like:
            return False  # 已经点赞过了

        # 创建点赞记录
        like = VisualToolCommentLike(comment_id=comment_id, user_id=user_id)
        db.add(like)

        # 更新评论点赞数
        comment = db.execute(
            select(VisualToolComment).where(VisualToolComment.id == comment_id)
        ).scalar_one_or_none()
        if comment:
            comment.like_count += 1

        db.commit()
        return True

    @staticmethod
    def unlike_comment(db: Session, comment_id: int, user_id: int) -> bool:
        """取消点赞评论"""
        like = db.execute(
            select(VisualToolCommentLike).where(
                and_(
                    VisualToolCommentLike.comment_id == comment_id,
                    VisualToolCommentLike.user_id == user_id,
                )
            )
        ).scalar_one_or_none()

        if not like:
            return False  # 没有点赞记录

        db.delete(like)

        # 更新评论点赞数
        comment = db.execute(
            select(VisualToolComment).where(VisualToolComment.id == comment_id)
        ).scalar_one_or_none()
        if comment and comment.like_count > 0:
            comment.like_count -= 1

        db.commit()
        return True
