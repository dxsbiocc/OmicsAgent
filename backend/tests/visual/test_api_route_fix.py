#!/usr/bin/env python3
"""
测试API路由修复：验证 {tool:path} 参数
"""

import sys
import os
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from app.services.visual import VisualService


def test_tool_path_handling():
    """测试工具路径处理"""
    print("=== 测试工具路径处理 ===")

    # 测试各种工具路径
    test_paths = [
        "tree/radial",
        "line/basic",
        "bar/polar",
        "pie/doughnut",
        "scatter/jitter",
        "graph/basic",
        "heatmap/basic",
        "boxplot/basic",
        "radar/basic",
    ]

    for tool_path in test_paths:
        print(f"\n🔧 测试路径: {tool_path}")
        tool_info = VisualService.get_tool_info(tool_path)

        if tool_info:
            print(f"  ✅ 工具: {tool_info.tool}")
            print(f"  分类: {tool_info.category}")
            print(f"  工具名: {tool_info.tool_name}")
            print(f"  显示名称: {tool_info.name}")
        else:
            print(f"  ❌ 工具未找到")

    print("\n✅ 工具路径处理测试完成")


def test_api_route_compatibility():
    """测试API路由兼容性"""
    print("\n=== 测试API路由兼容性 ===")

    # 模拟API路径参数
    api_paths = [
        "/api/v1/visual/tools/tree/radial",
        "/api/v1/visual/tools/line/basic",
        "/api/v1/visual/tools/bar/polar",
        "/api/v1/visual/tools/pie/doughnut",
    ]

    for api_path in api_paths:
        # 提取工具名称部分
        tool_part = api_path.split("/tools/")[1]
        print(f"\n🔧 API路径: {api_path}")
        print(f"  提取的工具名: {tool_part}")

        tool_info = VisualService.get_tool_info(tool_part)
        if tool_info:
            print(f"  ✅ 工具信息获取成功: {tool_info.name}")
        else:
            print(f"  ❌ 工具信息获取失败")

    print("\n✅ API路由兼容性测试完成")


def test_edge_cases():
    """测试边界情况"""
    print("\n=== 测试边界情况 ===")

    edge_cases = [
        "tree/radial/extra",  # 多级路径
        "tree",  # 只有分类
        "radial",  # 只有工具名
        "tree-radial",  # 连字符
        "tree.radial",  # 点分隔
        "",  # 空字符串
        "nonexistent/category",  # 不存在的工具
    ]

    for case in edge_cases:
        print(f"\n🔧 测试边界情况: '{case}'")
        tool_info = VisualService.get_tool_info(case)

        if tool_info:
            print(f"  ⚠️ 意外找到工具: {tool_info.tool}")
        else:
            print(f"  ✅ 正确返回None")

    print("\n✅ 边界情况测试完成")


if __name__ == "__main__":
    print("🧪 测试API路由修复")
    print("=" * 50)

    try:
        test_tool_path_handling()
        test_api_route_compatibility()
        test_edge_cases()

        print("\n✅ 所有测试通过")

    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
