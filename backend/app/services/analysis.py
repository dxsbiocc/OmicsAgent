import os
import sys
import time
import asyncio
import orjson
import importlib
import pandas as pd
from aiofile import AIOFile
from pathlib import Path
from typing import Dict, Any, Optional, List
from functools import lru_cache

from sqlalchemy import exc

from app.core.logging import get_logger
from app.schemas.analysis import (
    AnalysisToolInfo,
    AnalysisToolsResponse,
    AnalysisToolGroup,
)
from app.core.config import settings

# Base paths
BASE_DIR = Path(__file__).parent.parent.parent
SCRIPTS_ROOT = BASE_DIR / "scripts"
OUTPUT_ROOT = BASE_DIR / "static" / "images" / "analysis"
VISUAL_ROOT = SCRIPTS_ROOT / "visual"

logger = get_logger("analysis")

TOOL_VISUAL_MAPPING = {
    "differential_expression": "boxplot/diffrential_expression",
    "expression_correlation": "scatter/correlation",
    "survival_analysis": "line/basic",
}


class AnalysisService:
    """Service to manage analysis tools from file system."""

    # 工具信息缓存
    _tools_cache: Optional[List[AnalysisToolInfo]] = None
    _cache_timestamp: Optional[float] = None
    _cache_ttl: float = 300  # 5分钟缓存

    @staticmethod
    def _is_cache_valid() -> bool:
        """检查缓存是否有效"""
        if (
            AnalysisService._tools_cache is None
            or AnalysisService._cache_timestamp is None
        ):
            return False
        return (
            time.time() - AnalysisService._cache_timestamp < AnalysisService._cache_ttl
        )

    @staticmethod
    def _clear_cache():
        """清除缓存"""
        AnalysisService._tools_cache = None
        AnalysisService._cache_timestamp = None

    @staticmethod
    def list_tools(use_cache: bool = True) -> List[AnalysisToolInfo]:
        """获取工具列表，支持缓存"""
        # 如果使用缓存且缓存有效，直接返回
        if use_cache and AnalysisService._is_cache_valid():
            return AnalysisService._tools_cache.copy()

        # 重新加载工具列表
        tools: List[AnalysisToolInfo] = []
        if not settings.analysis_root.exists():
            AnalysisService._tools_cache = tools
            AnalysisService._cache_timestamp = time.time()
            return tools

        # 遍历所有分类目录 (analysis的子目录作为分类)
        for category_dir in settings.analysis_root.iterdir():
            if not category_dir.is_dir():
                continue

            category_name = category_dir.name

            # 遍历分类下的具体工具目录（只使用文件夹结构，不读取分类meta.json中的tools）
            for tool_dir in category_dir.iterdir():
                if not tool_dir.is_dir() or tool_dir.name == "__pycache__":
                    continue

                # 检查是否有meta.json文件
                meta_path = tool_dir / "meta.json"
                if meta_path.exists():
                    # 工具名称格式：category_tool_name（使用文件夹名称）
                    tool_name = f"{category_name}_{tool_dir.name}"
                    tool_info = AnalysisService._extract_tool_info(
                        tool_dir, tool_name, tool_dir.name, category_name
                    )
                    if tool_info:
                        tools.append(tool_info)

        # 更新缓存
        AnalysisService._tools_cache = tools
        AnalysisService._cache_timestamp = time.time()

        return tools.copy()

    @staticmethod
    def _extract_tool_info(
        tool_dir: Path, tool_name: str, display_name: str, category: str = None
    ) -> Optional[AnalysisToolInfo]:
        """从工具目录提取工具信息"""
        meta_path = tool_dir / "meta.json"
        docs_path = tool_dir / "document.md"

        meta: Dict[str, Any] = {}
        if meta_path.exists():
            try:
                meta = orjson.loads(meta_path.read_text(encoding="utf-8"))
            except Exception as e:
                logger.warning(f"Failed to parse meta.json {meta_path}: {e}")
                meta = {}

        # 提取分类和工具名
        if category is None:
            if "_" in tool_name:
                category, tool_name_only = tool_name.split("_", 1)
            else:
                category = tool_name
                tool_name_only = tool_name
        else:
            if "_" in tool_name:
                _, tool_name_only = tool_name.split("_", 1)
            else:
                tool_name_only = tool_name

        return AnalysisToolInfo(
            tool=tool_name,  # 使用文件夹名称组合，格式：category_toolname
            name=meta.get("name", display_name),  # 显示名称从 meta.json 读取
            display_name=meta.get("name", display_name),  # 显示名称从 meta.json 读取
            description=meta.get("description", ""),
            category=category,  # 分类来自一级目录名称
            tool_name=tool_name_only,  # 工具名称来自文件夹名称（不含分类）
            params_schema=meta.get("params_schema", {}),
            defaults=meta.get("defaults", {}),
            sample_data_filename=None,
            sample_image_url=None,
            docs_markdown=(
                docs_path.read_text(encoding="utf-8") if docs_path.exists() else None
            ),
        )

    @staticmethod
    def get_tool_info(tool: str, use_cache: bool = True) -> Optional[AnalysisToolInfo]:
        """根据工具名称获取工具信息，支持下划线格式和缓存"""
        # 如果使用缓存，先从缓存中查找
        if use_cache and AnalysisService._is_cache_valid():
            for cached_tool in AnalysisService._tools_cache:
                if cached_tool.tool == tool:
                    return cached_tool

        # 处理层级结构：category_tool_name
        if "_" not in tool:
            # 尝试直接查找
            tool_dir = settings.analysis_root / tool
            if tool_dir.exists() and tool_dir.is_dir():
                meta_path = tool_dir / "meta.json"
                if meta_path.exists():
                    return AnalysisService._extract_tool_info(
                        tool_dir, tool, tool_dir.name, tool
                    )
            return None

        category, tool_name = tool.split("_", 1)
        tool_dir = settings.analysis_root / category / tool_name

        if not tool_dir.exists():
            return None

        # 检查是否有meta.json文件
        meta_path = tool_dir / "meta.json"
        if not meta_path.exists():
            return None

        # 提取工具信息
        display_name = tool_dir.name
        tool_info = AnalysisService._extract_tool_info(
            tool_dir, tool, display_name, category
        )

        # 如果找到工具信息且使用缓存，更新缓存
        if tool_info and use_cache:
            # 清除缓存，强制下次重新加载
            AnalysisService._clear_cache()

        return tool_info

    @staticmethod
    def get_tools_by_category(
        category: str, use_cache: bool = True
    ) -> List[AnalysisToolInfo]:
        """根据分类获取工具列表"""
        all_tools = AnalysisService.list_tools(use_cache)
        return [tool for tool in all_tools if tool.category == category]

    @staticmethod
    def search_tools(query: str, use_cache: bool = True) -> List[AnalysisToolInfo]:
        """搜索工具（按名称和描述）"""
        all_tools = AnalysisService.list_tools(use_cache)
        query_lower = query.lower()

        results = []
        for tool in all_tools:
            # 搜索工具名称、显示名称和描述
            if (
                query_lower in tool.tool.lower()
                or query_lower in tool.name.lower()
                or query_lower in tool.display_name.lower()
                or query_lower in tool.description.lower()
            ):
                results.append(tool)

        return results

    @staticmethod
    def get_tool_categories(use_cache: bool = True) -> List[str]:
        """获取所有工具分类"""
        all_tools = AnalysisService.list_tools(use_cache)
        categories = set()
        for tool in all_tools:
            categories.add(tool.category)

        # 定义分类排序顺序
        category_order = [
            "db",
            "genomics",
            "transcriptomics",
            "epigenetics",
            "proteomics",
            "metabolomics",
            "metagenomics",
            "multiomics",
        ]

        # 按预定义顺序排序，未定义的分类放在最后
        sorted_categories = []
        for category in category_order:
            if category in categories:
                sorted_categories.append(category)

        # 添加未在预定义顺序中的分类
        for category in sorted(categories):
            if category not in sorted_categories:
                sorted_categories.append(category)

        return sorted_categories

    @staticmethod
    def get_tool_stats(use_cache: bool = True) -> Dict[str, Any]:
        """获取工具统计信息"""
        all_tools = AnalysisService.list_tools(use_cache)

        # 按分类统计
        category_stats = {}
        for tool in all_tools:
            category = tool.category
            if category not in category_stats:
                category_stats[category] = 0
            category_stats[category] += 1

        return {
            "total_tools": len(all_tools),
            "total_categories": len(category_stats),
            "category_stats": category_stats,
            "cache_status": "valid" if AnalysisService._is_cache_valid() else "invalid",
            "cache_timestamp": AnalysisService._cache_timestamp,
        }

    @staticmethod
    def get_tools_grouped(use_cache: bool = True) -> List[Dict[str, Any]]:
        """获取按分类分组的工具列表"""
        all_tools = AnalysisService.list_tools(use_cache)

        # 按分类分组
        groups = {}
        for tool in all_tools:
            category = tool.category
            if category not in groups:
                groups[category] = []
            groups[category].append(tool)

        # 分类显示名称映射
        category_display_names = {
            "db": "数据库分析",
            "genomics": "基因组学",
            "transcriptomics": "转录组学",
            "epigenetics": "表观遗传学",
            "proteomics": "蛋白质组学",
            "metabolomics": "代谢组学",
            "metagenomics": "宏基因组学",
            "multiomics": "多组学整合",
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

        # 按预定义分类顺序排序
        category_order = [
            "db",
            "genomics",
            "transcriptomics",
            "epigenetics",
            "proteomics",
            "metabolomics",
            "metagenomics",
            "multiomics",
        ]

        # 按预定义顺序排序
        sorted_result = []
        for category in category_order:
            for group in result:
                if group["category"] == category:
                    sorted_result.append(group)
                    break

        # 添加未在预定义顺序中的分类
        for group in result:
            if group not in sorted_result:
                sorted_result.append(group)

        return sorted_result

    @staticmethod
    def get_tools_with_grouping(use_cache: bool = True) -> AnalysisToolsResponse:
        """获取所有工具（包含分组信息）"""
        all_tools = AnalysisService.list_tools(use_cache)
        groups_data = AnalysisService.get_tools_grouped(use_cache)

        # 转换为响应格式
        groups = []
        for group_data in groups_data:
            groups.append(
                AnalysisToolGroup(
                    category=group_data["category"],
                    display_name=group_data["display_name"],
                    tools=group_data["tools"],
                    tool_count=group_data["tool_count"],
                )
            )

        # 计算统计信息
        category_stats = {}
        for tool in all_tools:
            category = tool.category
            if category not in category_stats:
                category_stats[category] = 0
            category_stats[category] += 1

        return AnalysisToolsResponse(
            tools=all_tools,
            groups=groups,
            total_tools=len(all_tools),
            total_categories=len(category_stats),
            category_stats=category_stats,
        )

    @staticmethod
    def get_sample_data(filename: str) -> List[Dict[str, Any]]:
        """获取工具的示例数据"""
        if filename.endswith(".json"):
            with open(filename, "r", encoding="utf-8") as f:
                loaded = orjson.load(f)
                data = loaded if isinstance(loaded, list) else [loaded]
        elif filename.endswith(".csv"):
            import pandas as pd

            df = pd.read_csv(filename)
            data = df.to_dict("records")
        else:
            raise ValueError(f"Unsupported file type: {filename}")
        return data

    @staticmethod
    def fetched_data(
        module_file_path: Path, sub_tool: str, params: Dict[str, Any], output_file: Path
    ) -> List[Dict[str, Any]]:
        """获取工具的示例数据"""
        # 将文件路径转换为模块路径
        # 例如: backend/scripts/analysis/db/tcga/tcga.py -> scripts.analysis.db.tcga.tcga
        try:
            # 获取相对于 BASE_DIR 的路径（BASE_DIR 是 backend 目录）
            relative_path = module_file_path.relative_to(BASE_DIR)
            # 转换为模块路径（移除 .py 扩展名，将 / 替换为 .）
            module_path = str(relative_path.with_suffix("")).replace("/", ".")

            # 确保 BASE_DIR 在 Python 路径中，这样 scripts 目录可以被导入
            if str(BASE_DIR) not in sys.path:
                sys.path.insert(0, str(BASE_DIR))

            if module_path not in sys.modules:
                try:
                    importlib.import_module(module_path)
                except ImportError as e:
                    logger.error(f"Failed to import module: {module_path}, error: {e}")
                    raise ValueError(
                        f"Failed to import module: {module_path}: {str(e)}"
                    )
            module = sys.modules[module_path]
        except Exception as e:
            logger.error(
                f"Error processing module path: {module_file_path}, error: {e}"
            )
            raise ValueError(
                f"Failed to process module path: {module_file_path}: {str(e)}"
            )
        result = module.run_analysis(sub_tool, params)

        if isinstance(result, str):
            # 如果是字符串，尝试解析为 JSON
            try:
                result = orjson.loads(result)
            except orjson.JSONDecodeError:
                # 如果无法解析，可能是错误消息
                raise ValueError(f"Analysis returned error: {result}")

        # 处理不同类型的返回值
        if isinstance(result, list):
            # 如果直接返回列表，直接使用
            result_data = result
        elif isinstance(result, dict):
            # 如果是字典，检查是否有错误
            if "error" in result:
                raise ValueError(result.get("error", "Analysis failed"))

            # 提取数据
            result_data = result.get("data") or result
            if isinstance(result_data, str):
                try:
                    result_data = orjson.loads(result_data)
                except orjson.JSONDecodeError:
                    # 如果无法解析，保持原样
                    pass
        else:
            # 其他类型，尝试转换为列表
            result_data = [result] if result is not None else []

        # 转换为 DataFrame 并保存为 CSV
        if isinstance(result_data, list):
            df = pd.DataFrame(result_data)
        elif isinstance(result_data, dict):
            # 如果 result_data 有 data 字段，使用它
            if "data" in result_data:
                data = result_data["data"]
                if isinstance(data, str):
                    data = orjson.loads(data)
                df = (
                    pd.DataFrame(data)
                    if isinstance(data, list)
                    else pd.DataFrame([data])
                )
            else:
                df = pd.DataFrame([result_data])
        else:
            raise ValueError(f"Unsupported data format: {type(result_data)}")

        # 保存数据到 CSV
        df.to_csv(output_file, index=False, encoding="utf-8")
        logger.info(f"Data saved to: {output_file}")

        return result_data

    @staticmethod
    async def fetch_config(meta_file: Path) -> Dict[str, Any]:
        """读取 ggplot2 配置"""
        if meta_file.exists():
            async with AIOFile(meta_file, "rb") as af:
                content = await af.read()
                return orjson.loads(content).get("ggplot2", {})
        return {}

    @staticmethod
    async def write_params(params_file: Path, params: Dict[str, Any]):
        """写入参数"""
        async with AIOFile(params_file, "wb") as f:
            await f.write(orjson.dumps(params))

    @staticmethod
    async def visualize(engine: str, script_path: Path, file_paths: Dict[str, Path]):
        """可视化"""
        interpreter_config = settings.get_interpreter_config(engine)
        env = {
            **os.environ,
            **interpreter_config["env_vars"],
            "VISUAL_PARAMS_JSON": str(file_paths["params"].resolve()),
            "VISUAL_OUTPUT_PDF": str(file_paths["pdf"].resolve()),
            "VISUAL_OUTPUT_PNG": str(file_paths["png"].resolve()),
            "R_SCRIPT_ROOT": str(SCRIPTS_ROOT.parent.resolve()),
        }

        # 运行 R 脚本
        process = await asyncio.create_subprocess_exec(
            interpreter_config["command"],
            str(script_path),
            env=env,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=str(script_path.parent),
        )
        try:
            stdout, stderr = await asyncio.wait_for(
                process.communicate(), timeout=interpreter_config["timeout"]
            )
        except asyncio.TimeoutError:
            process.kill()
            await process.wait()
            raise ValueError("R script execution timed out")

        if process.returncode != 0:
            error_msg = stderr.decode("utf-8") if stderr else "Unknown error"
            logger.error(f"Chart generation failed: {error_msg}")
            raise ValueError(f"Chart generation failed: {error_msg}")

        # 验证输出文件
        if not file_paths["png"].exists():
            raise ValueError("Output PNG not generated")

    @staticmethod
    async def run_analysis(
        tool: str, params: Dict[str, Any], user_id: int
    ) -> Dict[str, Any]:
        """运行分析工具"""
        tool_info = AnalysisService.get_tool_info(tool)
        if not tool_info:
            raise ValueError(f"Tool '{tool}' not found")

        category, tool_name = tool.split("_", 1)

        sub_tool = params.pop("sub_tool", None)
        if not sub_tool:
            raise ValueError(f"sub_tool parameter is required")

        # 创建临时输出目录
        output_dir = settings.analysis_output_root / str(user_id) / tool / sub_tool
        output_dir.mkdir(parents=True, exist_ok=True)

        file_paths = {
            "csv": output_dir / f"{sub_tool}_data.csv",
            "params": output_dir / f"{sub_tool}_params.json",
            "pdf": output_dir / f"{sub_tool}.pdf",
            "png": output_dir / f"{sub_tool}.png",
        }

        # tool script path
        module_path = settings.analysis_root / category / tool_name / f"{tool_name}.py"
        # 调用分析函数
        if params.pop("query_data", False):
            result = AnalysisService.fetched_data(
                module_path, sub_tool, params, file_paths["csv"]
            )
            # 获取 ggplot2 配置参数
            meta_file = (
                settings.visual_root / TOOL_VISUAL_MAPPING[sub_tool] / "meta.json"
            )
            ggplot2_config = await AnalysisService.fetch_config(meta_file)
            columns = list(result[0].keys())
            if len(columns) >= 3:
                ggplot2_config.get("mapping", {}).update(
                    {
                        "x": columns[1],
                        "y": columns[2],
                    }
                )
            params["ggplot2"] = ggplot2_config
        else:
            result = []
            # 获取前端传递的 ggplot2 配置参数
            ggplot2_config = params.pop("ggplot2", None)
            if not ggplot2_config:
                raise ValueError(f"The {sub_tool} did not pass ggplot2 config")

        await AnalysisService.write_params(
            file_paths["params"],
            {
                "data": str(file_paths["csv"].resolve()),
                "ggplot2": ggplot2_config,
            },
        )
        # visual
        # 优先使用特定工具的 plot.R，如果不存在则使用通用绘图脚本
        script_path = settings.visual_root / TOOL_VISUAL_MAPPING[sub_tool] / "plot.R"
        if not script_path.exists():
            # 使用通用绘图脚本
            script_path = SCRIPTS_ROOT / "utils" / "plot_ggplot2.R"
        await AnalysisService.visualize("r", script_path, file_paths)

        # 生成图片 URL（相对于 static 目录）
        # 将绝对路径转换为相对路径
        relative_path = file_paths["png"].relative_to(settings.analysis_output_root)
        image_url = f"/static/analysis/{relative_path.as_posix()}"
        base_url = settings.backend_url.rstrip("/")
        # 返回完整的结果，包括数据、ggplot2 配置和图片 URL
        return {
            "data": result,
            "ggplot2": ggplot2_config,
            "image_url": f"{base_url}{image_url}",
        }
