import json
import os
import asyncio
import time
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, or_
from functools import lru_cache

from app.core.logging import get_logger
from app.core.config import settings

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

logger = get_logger("visual_service")


class VisualService:
    """Service to manage visual tools and run R scripts to produce images."""

    # 工具信息缓存
    _tools_cache: Optional[List[VisualToolInfo]] = None
    _cache_timestamp: Optional[float] = None
    _cache_ttl: float = 300  # 5分钟缓存

    @staticmethod
    def _is_cache_valid() -> bool:
        """检查缓存是否有效"""
        if VisualService._tools_cache is None or VisualService._cache_timestamp is None:
            return False

        import time

        return time.time() - VisualService._cache_timestamp < VisualService._cache_ttl

    @staticmethod
    def _clear_cache():
        """清除缓存"""
        VisualService._tools_cache = None
        VisualService._cache_timestamp = None

    @staticmethod
    def list_tools(use_cache: bool = True) -> List[VisualToolInfo]:
        """获取工具列表，支持缓存"""
        # 如果使用缓存且缓存有效，直接返回
        if use_cache and VisualService._is_cache_valid():
            return VisualService._tools_cache.copy()

        # 重新加载工具列表
        tools: List[VisualToolInfo] = []
        if not settings.visual_root.exists():
            VisualService._tools_cache = tools
            VisualService._cache_timestamp = time.time()
            return tools

        # 遍历所有分类目录 (visual的子目录作为分类)
        for category_dir in settings.visual_root.iterdir():
            if not category_dir.is_dir():
                continue

            category_name = category_dir.name

            # 遍历分类下的具体工具目录
            for tool_dir in category_dir.iterdir():
                if not tool_dir.is_dir():
                    continue

                # 检查是否有meta.json文件
                meta_path = tool_dir / "meta.json"
                if meta_path.exists():
                    # 工具名称格式：category_tool_name
                    tool_name = f"{category_name}_{tool_dir.name}"
                    tool_info = VisualService._extract_tool_info(
                        tool_dir, tool_name, tool_dir.name, category_name
                    )
                    if tool_info:
                        tools.append(tool_info)

        # 更新缓存
        VisualService._tools_cache = tools
        VisualService._cache_timestamp = time.time()

        return tools.copy()

    @staticmethod
    def _extract_tool_info(
        tool_dir: Path, tool_name: str, display_name: str, category: str = None
    ) -> Optional[VisualToolInfo]:
        """从工具目录提取工具信息"""
        meta_path = tool_dir / "meta.json"
        docs_path = tool_dir / "document.md"
        sample_image = tool_dir / "sample.png"
        sample_data_primary = tool_dir / "data.json"
        sample_data_json = tool_dir / "sample.json"
        sample_data_csv = tool_dir / "sample.csv"

        meta: Dict[str, Any] = {}
        if meta_path.exists():
            try:
                meta = json.loads(meta_path.read_text(encoding="utf-8"))
            except Exception:
                meta = {}

        # 从 meta.json 读取 has_r，如果不存在则根据是否有 ggplot2 字段判断
        # 如果有 ggplot2 字段，说明可以使用通用脚本，默认 has_r = True
        # 否则检查文件是否存在（向后兼容）
        if "has_r" in meta:
            has_r = meta.get("has_r", False)
        elif "ggplot2" in meta:
            # 如果有 ggplot2 配置，可以使用通用脚本，默认支持 R
            has_r = True
        else:
            has_r = False

        # 从 meta.json 读取 has_python，如果不存在则检查文件是否存在（向后兼容）
        if "has_python" in meta:
            has_python = meta.get("has_python", False)
        else:
            has_python = False

        # 从 meta.json 读取 has_js，如果不存在则默认为 True（当前所有绘图都包含 JS）
        has_js = meta.get("has_js", True)

        # 提取分类和工具名
        if category is None:
            if "/" in tool_name:
                category, tool_name_only = tool_name.split("/", 1)
            else:
                category = tool_name
                tool_name_only = tool_name
        else:
            if "/" in tool_name:
                _, tool_name_only = tool_name.split("/", 1)
            else:
                tool_name_only = tool_name

        return VisualToolInfo(
            tool=tool_name,
            name=meta.get("name", display_name),
            description=meta.get("description", ""),
            category=category,
            tool_name=tool_name_only,
            params_schema=meta.get("params_schema", {}),
            defaults=meta.get("defaults", {}),
            sample_data_filename=(
                "data.json"
                if sample_data_primary.exists()
                else (
                    "sample.json"
                    if sample_data_json.exists()
                    else ("sample.csv" if sample_data_csv.exists() else None)
                )
            ),
            sample_image_url=(
                f"/static/images/visual/{tool_name.replace('/', '_')}/sample.png"
                if sample_image.exists()
                else None
            ),
            docs_markdown=(
                docs_path.read_text(encoding="utf-8") if docs_path.exists() else None
            ),
            has_python=has_python,
            has_r=has_r,
            has_js=has_js,
            ggplot2=meta.get("ggplot2"),  # 提取 ggplot2 配置
            heatmap=meta.get("heatmap"),  # 提取 heatmap 配置
        )

    @staticmethod
    def get_tool_info(tool: str, use_cache: bool = True) -> Optional[VisualToolInfo]:
        """根据工具名称获取工具信息，支持下划线格式和缓存"""
        # 如果使用缓存，先从缓存中查找
        if use_cache and VisualService._is_cache_valid():
            for cached_tool in VisualService._tools_cache:
                if cached_tool.tool == tool:
                    return cached_tool

        # 处理层级结构：category_tool_name
        if "_" not in tool:
            return None  # 必须有分类_工具名称的格式

        category, tool_name = tool.split("_", 1)

        tool_dir = settings.visual_root / category / tool_name

        if not tool_dir.exists():
            return None

        # 检查是否有meta.json文件
        meta_path = tool_dir / "meta.json"
        if not meta_path.exists():
            return None

        # 提取工具信息
        display_name = tool_dir.name
        tool_info = VisualService._extract_tool_info(
            tool_dir, tool, display_name, category
        )

        # 如果找到工具信息且使用缓存，清除缓存以强制下次重新加载所有工具
        if tool_info and use_cache:
            VisualService._clear_cache()

        return tool_info

    @staticmethod
    def get_tools_by_category(
        category: str, use_cache: bool = True
    ) -> List[VisualToolInfo]:
        """根据分类获取工具列表"""
        all_tools = VisualService.list_tools(use_cache)
        return [tool for tool in all_tools if tool.tool.startswith(f"{category}/")]

    @staticmethod
    def search_tools(query: str, use_cache: bool = True) -> List[VisualToolInfo]:
        """搜索工具（按名称和描述）"""
        all_tools = VisualService.list_tools(use_cache)
        query_lower = query.lower()

        results = []
        for tool in all_tools:
            # 搜索工具名称、显示名称和描述
            if (
                query_lower in tool.tool.lower()
                or query_lower in tool.name.lower()
                or query_lower in tool.description.lower()
            ):
                results.append(tool)

        return results

    @staticmethod
    def get_tool_categories(use_cache: bool = True) -> List[str]:
        """获取所有工具分类"""
        all_tools = VisualService.list_tools(use_cache)
        categories = set()
        for tool in all_tools:
            if "_" in tool.tool:
                categories.add(tool.tool.split("_")[0])
        return list(categories)

    @staticmethod
    def get_tool_stats(use_cache: bool = True) -> Dict[str, Any]:
        """获取工具统计信息"""
        all_tools = VisualService.list_tools(use_cache)

        # 按分类统计
        category_stats = {}
        for tool in all_tools:
            category = tool.tool.split("/")[0] if "/" in tool.tool else "unknown"
            if category not in category_stats:
                category_stats[category] = 0
            category_stats[category] += 1

        return {
            "total_tools": len(all_tools),
            "total_categories": len(category_stats),
            "category_stats": category_stats,
            "cache_status": "valid" if VisualService._is_cache_valid() else "invalid",
            "cache_timestamp": VisualService._cache_timestamp,
        }

    @staticmethod
    def get_tools_grouped(use_cache: bool = True) -> List[Dict[str, Any]]:
        """获取按分类分组的工具列表"""
        all_tools = VisualService.list_tools(use_cache)

        # 按分类分组
        groups = {}
        for tool in all_tools:
            category = tool.category
            if category not in groups:
                groups[category] = []
            groups[category].append(tool)

        # 分类显示名称映射
        category_display_names = {
            "line": "折线图",
            "bar": "柱状图",
            "scatter": "散点图",
            "pie": "饼图",
            "area": "面积图",
            "radar": "雷达图",
            "heatmap": "热力图",
            "tree": "树图",
            "graph": "关系图",
            "boxplot": "箱线图",
            "funnel": "漏斗图",
            "sankey": "桑基图",
            "parallel": "平行坐标",
            "sunburst": "旭日图",
        }

        # 转换为分组格式
        result = []
        for category, tools in groups.items():
            display_name = category_display_names.get(category, category.title())
            result.append(
                {
                    "category": category,
                    "display_name": display_name,
                    "tools": tools,
                    "tool_count": len(tools),
                }
            )

        return result

    @staticmethod
    def get_tools_with_grouping(use_cache: bool = True) -> Dict[str, Any]:
        """获取包含分组信息的完整工具列表"""
        all_tools = VisualService.list_tools(use_cache)
        groups = VisualService.get_tools_grouped(use_cache)
        stats = VisualService.get_tool_stats(use_cache)

        return {
            "tools": all_tools,
            "groups": groups,
            "total_tools": stats["total_tools"],
            "total_categories": stats["total_categories"],
            "category_stats": stats["category_stats"],
        }

    @staticmethod
    async def run_tool(
        tool: str, params: Dict[str, Any], user_id: int
    ) -> VisualRunResponse:
        """Run visual tool (R or Python)

        Args:
            tool: tool name
            params: tool parameters
            user_id: user ID (required, must be a logged in user)
        """
        # 从参数中获取引擎和图表类型，如果没有则从 tool 参数推断
        engine = params.get("engine", "r")  # 默认使用R

        # 如果参数中有 chart_type，使用它；否则从 tool 参数推断
        if "chart_type" in params:
            chart_type = params["chart_type"].replace("_", "/", 1)
        else:
            chart_type = tool.replace("_", "/", 1)

        return await VisualService._run_chart_tool(chart_type, engine, params, user_id)

    @staticmethod
    def _parse_chart_type(chart_type: str) -> Tuple[str, Optional[str]]:
        """解析图表类型，返回 (category, subdir)"""
        if "/" in chart_type:
            return chart_type.split("/", 1)
        return chart_type, None

    @staticmethod
    def _write_data_to_csv(data: list, csv_path: Path) -> str:
        """将数据写入CSV文件，返回文件路径"""
        try:
            import pandas as pd

            df = pd.DataFrame(data)
            df.to_csv(csv_path, index=False)
        except ImportError:
            import csv

            with open(csv_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=data[0].keys())
                writer.writeheader()
                writer.writerows(data)
        return str(csv_path.resolve())

    @staticmethod
    def _write_data_to_json(data: Any, json_path: Path) -> str:
        """将数据写入JSON文件，返回文件路径

        支持两种格式：
        - 单表格式（数组）：[{...}, {...}] -> 保存为数组格式
        - 多表格式（对象）：{table1: [...], table2: [...]} -> 保存为对象格式
        """
        json_path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        return str(json_path.resolve())

    @staticmethod
    def _create_error_response(
        message: str,
        chart_type: str,
        engine: str,
        error_details: Optional[Dict[str, Any]] = None,
        data_info: Optional[Dict[str, Any]] = None,
    ) -> VisualRunResponse:
        """创建错误响应"""
        return VisualRunResponse(
            success=False,
            message=message,
            tool=f"{chart_type}_{engine}",
            error_details=error_details,
            data_info=data_info,
        )
    
    @staticmethod
    def _analyze_data_format(data: Optional[List[Dict[str, Any]]]) -> Dict[str, Any]:
        """
        Analyze data format and return information about the data structure.
        
        Args:
            data: List of data records
            
        Returns:
            Dictionary with data format information
        """
        if not data:
            return {
                "has_data": False,
                "row_count": 0,
                "columns": [],
            }
        
        info = {
            "has_data": True,
            "row_count": len(data),
            "columns": list(data[0].keys()) if data else [],
            "column_types": {},
            "sample_values": {},
        }
        
        # Analyze first few rows to determine column types
        if data:
            first_row = data[0]
            for col, val in first_row.items():
                if isinstance(val, (int, float)):
                    info["column_types"][col] = "numeric"
                elif isinstance(val, str):
                    info["column_types"][col] = "string"
                elif isinstance(val, bool):
                    info["column_types"][col] = "boolean"
                else:
                    info["column_types"][col] = "unknown"
                
                # Store sample value
                info["sample_values"][col] = str(val)[:50]  # Limit length
        
        return info

    @staticmethod
    async def _run_chart_tool(
        chart_type: str, engine: str, params: Dict[str, Any], user_id: int
    ) -> VisualRunResponse:
        """Run chart plot tool (R or Python)"""
        logger = get_logger("visual_service")
        tool_name = f"{chart_type}_{engine}"

        try:
            # 解析图表类型
            category, subdir = VisualService._parse_chart_type(chart_type)

            # 获取脚本路径
            # 首先检查绘图目录下是否存在 plot.R
            script_path = None
            if engine == "r":
                # chart_type 已经是路径格式 (category/subdir)，直接构建路径
                plot_r_path = settings.visual_root / chart_type / "plot.R"

                if plot_r_path.exists():
                    script_path = plot_r_path
                    logger.info(f"Using chart-specific script: {plot_r_path}")
                else:
                    logger.debug(f"Chart-specific script not found: {plot_r_path}")

            # 如果绘图目录下没有 plot.R，且需要 ggplot2 或 heatmap 脚本，使用通用脚本
            if script_path is None:
                if engine == "r" and params.get("ggplot2"):
                    # 使用通用 ggplot2 脚本
                    script_path = settings.scripts_root / "utils" / "plot_ggplot2.R"
                    logger.info(f"Using generic ggplot2 script: {script_path}")
                elif engine == "r" and params.get("heatmap"):
                    # 对于 heatmap，使用特定的 plot.R 脚本（如果存在）
                    # 否则使用通用脚本（如果将来有的话）
                    # 目前 heatmap 工具都有自己的 plot.R，所以这里应该不会执行
                    logger.debug(f"Heatmap tool should have its own plot.R script")
                else:
                    # 其他方式暂未实现，抛出错误
                    raise ValueError(f"No script provided for {chart_type}")

            if not script_path.exists():
                return VisualService._create_error_response(
                    f"{engine.upper()} script not found: {script_path}",
                    chart_type,
                    engine,
                )

            # 获取配置和路径
            interpreter_config = settings.get_interpreter_config(engine)
            output_dir = settings.visual_output_root / str(user_id)
            tool_output_dir = output_dir / chart_type
            tool_output_dir.mkdir(parents=True, exist_ok=True)

            # 生成文件路径
            file_prefix = chart_type.replace("/", "_")
            file_paths = {
                "params": tool_output_dir / f"{file_prefix}_params.json",
                "pdf": tool_output_dir / f"{file_prefix}.pdf",
                "png": tool_output_dir / f"{file_prefix}.png",
                "json": tool_output_dir / f"{file_prefix}_data.json",
            }

            # 处理数据
            # 所有数据统一保存为 JSON 文件（支持单表和多表格式）
            # 如果没有传递数据，使用已存在的 JSON 文件（如果存在）
            if data := params.get("data", []):
                # 统一保存为 JSON 格式
                # 单表格式（数组）和多表格式（对象）都直接保存为 JSON
                params["data"] = VisualService._write_data_to_json(
                    data, file_paths["json"]
                )
            elif file_paths["json"].exists():
                # 没有传递数据，但 JSON 文件已存在，使用现有文件
                params["data"] = str(file_paths["json"].resolve())
            else:
                # 既没有传递数据，也没有已存在的文件，返回错误
                return VisualService._create_error_response(
                    "No data provided and no existing data file found. Please provide data first.",
                    chart_type,
                    engine,
                )

            # 合并 ggplot2 默认配置
            if not params.get("ggplot2"):
                default_ggplot2 = settings.get_ggplot2_config(chart_type)
                if default_ggplot2:
                    params["ggplot2"] = default_ggplot2

            # 合并 heatmap 默认配置（从 meta.json 中读取）
            # heatmap 配置通常已经在工具信息中，但如果参数中没有，可以从工具信息中获取
            # 注意：这里不自动合并，因为 heatmap 配置应该由前端明确传递

            # 写入参数文件
            file_paths["params"].write_text(
                json.dumps(params, ensure_ascii=False, indent=2), encoding="utf-8"
            )
            logger.info(f"Parameters written to: {file_paths['params']}")

            # 设置环境变量
            env = {
                **os.environ,
                **interpreter_config["env_vars"],
                "VISUAL_PARAMS_JSON": str(file_paths["params"].resolve()),
                "VISUAL_OUTPUT_PDF": str(file_paths["pdf"].resolve()),
                "VISUAL_OUTPUT_PNG": str(file_paths["png"].resolve()),
                "R_SCRIPT_ROOT": str(settings.scripts_root.parent.resolve()),
            }

            # 运行脚本
            process = await asyncio.create_subprocess_exec(
                interpreter_config["command"],
                str(script_path),
                env=env,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=str(script_path.parent),
            )

            # 等待完成
            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(), timeout=interpreter_config["timeout"]
                )
            except asyncio.TimeoutError:
                process.kill()
                await process.wait()
                return VisualService._create_error_response(
                    f"{engine.upper()} script execution timed out",
                    chart_type,
                    engine,
                )

            # 记录脚本输出（包括 print 语句）
            if stdout:
                stdout_text = (
                    stdout.decode("utf-8") if isinstance(stdout, bytes) else stdout
                )
                if stdout_text.strip():
                    logger.info(f"{engine.upper()} script stdout:\n{stdout_text}")

            # 记录脚本错误输出（包括 cat(..., file=stderr()) 的输出）
            if stderr:
                stderr_text = (
                    stderr.decode("utf-8") if isinstance(stderr, bytes) else stderr
                )
                if stderr_text.strip():
                    logger.info(f"{engine.upper()} script stderr:\n{stderr_text}")

            # 检查执行结果
            if process.returncode != 0:
                error_msg = stderr.decode("utf-8") if stderr else "Unknown error"
                logger.error(f"Chart generation failed: {error_msg}")
                
                # Analyze data format for error recovery
                data_info = VisualService._analyze_data_format(params.get("data"))
                
                # Extract error details
                error_details = {
                    "returncode": process.returncode,
                    "stderr": error_msg,
                    "stdout": stdout.decode("utf-8") if stdout else "",
                    "error_type": "execution_error",
                }
                
                return VisualService._create_error_response(
                    f"Chart generation failed: {error_msg}",
                    chart_type,
                    engine,
                    error_details=error_details,
                    data_info=data_info,
                )

            # 验证输出文件
            for file_type, path in [
                ("PDF", file_paths["pdf"]),
                ("PNG", file_paths["png"]),
            ]:
                if not path.exists():
                    return VisualService._create_error_response(
                        f"Output {file_type} not generated", chart_type, engine
                    )

            # 生成URL
            base_url = settings.backend_url.rstrip("/")
            relative_paths = {
                "png": file_paths["png"].relative_to(settings.visual_output_root),
                "pdf": file_paths["pdf"].relative_to(settings.visual_output_root),
            }
            output_files = [
                f"{base_url}/static/visual/{relative_paths['png'].as_posix()}",
                f"{base_url}/static/visual/{relative_paths['pdf'].as_posix()}",
            ]

            return VisualRunResponse(
                success=True,
                message="ok",
                output_files=output_files,
                tool=tool_name,
                used_params=params,
            )

        except Exception as e:
            logger.error(f"Error running chart tool: {e}", exc_info=True)
            
            # Analyze data format for error recovery
            data_info = VisualService._analyze_data_format(params.get("data"))
            
            # Extract error details
            error_details = {
                "error_type": "exception",
                "error_message": str(e),
                "error_class": type(e).__name__,
            }
            
            return VisualService._create_error_response(
                f"Error running chart tool: {str(e)}",
                chart_type,
                engine,
                error_details=error_details,
                data_info=data_info,
            )

    @staticmethod
    def get_sample_data(tool: str) -> Optional[List[Dict[str, Any]]]:
        """
        Get sample data for a visualization tool.
        
        Args:
            tool: Tool name (e.g., "scatter/volcano" or "scatter_volcano")
            
        Returns:
            List of sample data records, or None if not found
        """
        try:
            # Get tool info to find sample data filename
            tool_info = VisualService.get_tool_info(tool)
            if not tool_info or not tool_info.sample_data_filename:
                return None
            
            # Construct path to sample data file
            if "/" in tool:
                category, tool_name = tool.split("/", 1)
            elif "_" in tool:
                category, tool_name = tool.split("_", 1)
            else:
                return None
            
            tool_dir = settings.visual_root / category / tool_name
            sample_data_path = tool_dir / tool_info.sample_data_filename
            
            if not sample_data_path.exists():
                logger.warning(f"Sample data file not found: {sample_data_path}")
                return None
            
            # Read and parse sample data
            if sample_data_path.suffix == ".json":
                with open(sample_data_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    # Ensure it's a list
                    if isinstance(data, list):
                        return data
                    elif isinstance(data, dict):
                        return [data]
                    else:
                        return None
            elif sample_data_path.suffix == ".csv":
                import pandas as pd
                df = pd.read_csv(sample_data_path)
                return df.to_dict("records")
            else:
                logger.warning(f"Unsupported sample data format: {sample_data_path.suffix}")
                return None
                
        except Exception as e:
            logger.error(f"Error loading sample data for {tool}: {e}", exc_info=True)
            return None


class VisualToolDBService:
    """Service to manage visual tools in database."""

    @staticmethod
    def get_tools(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None,
        featured: Optional[bool] = None,
        user_id: Optional[int] = None,
    ) -> List[VisualToolResponse]:
        """获取工具列表"""
        query = select(VisualTool)

        if featured is not None:
            query = query.where(VisualTool.featured == featured)

        query = query.offset(skip).limit(limit).order_by(VisualTool.created_at.desc())

        tools = db.execute(query).scalars().all()

        # 转换为响应格式
        result = []
        for tool in tools:
            # 如果指定了分类，进行过滤
            if category and tool.category != category:
                continue

            # 从文件系统获取配置信息
            tool_info = VisualService.get_tool_info(tool.tool)

            tool_dict = {
                "id": tool.id,
                "tool": tool.tool,
                "name": tool.name,
                "description": tool.description,
                "category": tool.category,  # 使用动态分类属性
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
            "category": tool.category,  # 使用动态分类属性
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
