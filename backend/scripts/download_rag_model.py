#!/usr/bin/env python3
"""
手动下载 RAG Embedding 模型的脚本

使用方法:
    python scripts/download_rag_model.py

或者指定缓存目录:
    python scripts/download_rag_model.py --cache-dir /path/to/cache
"""

import argparse
import sys
from pathlib import Path

try:
    from huggingface_hub import snapshot_download
except ImportError:
    print("错误: 需要安装 huggingface_hub")
    print("请运行: pip install huggingface_hub")
    sys.exit(1)


def download_model(cache_dir: Path = None):
    """下载 RAG embedding 模型"""

    # 确定缓存目录
    if cache_dir is None:
        # 尝试使用项目配置
        try:
            from app.core.config import settings

            if hasattr(settings, "static_root"):
                cache_dir = settings.static_root / "hf_cache"
            else:
                cache_dir = Path.home() / ".cache" / "huggingface"
        except Exception:
            cache_dir = Path.home() / ".cache" / "huggingface"

    cache_dir = Path(cache_dir)
    cache_dir.mkdir(parents=True, exist_ok=True)

    # 设置环境变量
    import os

    os.environ["HF_HUB_CACHE"] = str(cache_dir.absolute())

    # 模型信息
    model_id = "sentence-transformers/all-MiniLM-L6-v2"
    model_dir = cache_dir / "hub" / f"models--{model_id.replace('/', '--')}"

    print("=" * 60)
    print("RAG Embedding 模型下载工具")
    print("=" * 60)
    print(f"模型: {model_id}")
    print(f"缓存目录: {cache_dir.absolute()}")
    print(f"模型目录: {model_dir.absolute()}")
    print("=" * 60)
    print()

    # 检查是否已存在
    if model_dir.exists() and any(model_dir.iterdir()):
        print(f"⚠️  模型目录已存在: {model_dir}")
        response = input("是否重新下载? (y/N): ").strip().lower()
        if response != "y":
            print("取消下载")
            return

    try:
        print(f"📥 开始下载模型: {model_id}")
        print("   这可能需要几分钟，请耐心等待...")
        print()

        snapshot_download(
            repo_id=model_id,
            local_dir=model_dir,
            local_dir_use_symlinks=False,
            resume_download=True,  # 支持断点续传
        )

        print()
        print("✅ 下载完成!")
        print(f"   模型位置: {model_dir.absolute()}")
        print()
        print("现在可以启动应用，RAG 系统将自动使用此模型。")

    except Exception as e:
        print()
        print(f"❌ 下载失败: {e}")
        print()
        print("可能的解决方案:")
        print("1. 检查网络连接")
        print("2. 使用代理:")
        print("   export HTTP_PROXY=http://your-proxy:port")
        print("   export HTTPS_PROXY=http://your-proxy:port")
        print("3. 使用镜像站点 (如果在中国):")
        print("   export HF_ENDPOINT=https://hf-mirror.com")
        print("4. 手动下载: 参考 docs/manual_model_download.md")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="下载 RAG Embedding 模型")
    parser.add_argument(
        "--cache-dir",
        type=str,
        help="指定缓存目录路径",
    )

    args = parser.parse_args()

    cache_dir = Path(args.cache_dir) if args.cache_dir else None
    download_model(cache_dir)


if __name__ == "__main__":
    main()
