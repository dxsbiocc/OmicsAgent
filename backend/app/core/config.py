import os
import orjson
from typing import Optional
from pydantic_settings import BaseSettings
from urllib.parse import quote_plus
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent


class Settings(BaseSettings):
    """Application settings"""

    # Database settings
    db_host: str = "localhost"
    db_port: int = 5432
    db_user: str = "omicsagent_admin"
    db_password: str = "Dxs@omicsdb2025!"
    db_name: str = "omicsagent"
    database_url: str = (
        f"postgresql+asyncpg://{quote_plus(db_user)}:{quote_plus(db_password)}@{db_host}:{db_port}/{db_name}"
    )
    database_echo: bool = False

    # Application settings
    app_name: str = "OmicsAgent Backend"
    debug: bool = True

    # Security settings
    secret_key: str = "Dengxsh@2025"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 300

    # Admin user settings
    admin_username: str = "admin"
    admin_email: str = "admin@omicsagent.com"
    admin_password: str = "admin123"

    # CORS settings
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]

    # Backend URL for generating absolute URLs
    backend_url: str = "http://localhost:8000"

    # Email settings
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_from_name: str = "OmicsAgent"
    email_verification_expire_minutes: int = 30

    # Redis configuration for Celery
    redis_url: str = "redis://localhost:6379/0"

    # LLM API Keys (automatically loaded from .env file via Pydantic BaseSettings)
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    deepseek_api_key: str = ""
    qwen_api_key: str = ""
    siliconflow_api_key: str = ""
    groq_api_key: str = ""
    gemini_api_key: str = ""

    # LLM Base URLs (automatically loaded from .env file via Pydantic BaseSettings)
    llm_base_url: str = "https://api.siliconflow.cn/v1/"
    deepseek_base_url: str = "https://api.deepseek.com/v1"
    qwen_base_url: str = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"

    # Data directory root path (can be configured via environment variable DATA_ROOT)
    # Subdirectories (tcga, depmap, gtex) will be automatically identified under this root
    # Default: relative to project root (data/)
    data_root: Path = BASE_DIR.parent / "data"
    scripts_root: Path = BASE_DIR / "scripts"
    static_root: Path = BASE_DIR / "static"
    visual_root: Path = scripts_root / "visual"
    analysis_root: Path = scripts_root / "analysis"
    visual_output_root: Path = static_root / "visual"
    analysis_output_root: Path = static_root / "analysis"

    model_config: dict = {
        # Use absolute path to .env file in project root for consistency
        # BASE_DIR is backend/app/core, so BASE_DIR.parent is project root
        "env_file": str(BASE_DIR / ".env"),
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",  # 忽略额外的环境变量
        # Note: Pydantic Settings loading priority (highest to lowest):
        # 1. Initialization parameters (passed to Settings())
        # 2. Environment variables (will override .env file)
        # 3. .env file values
        # 4. Field default values
        # So environment variables ALWAYS take precedence over .env file
    }

    interpreter_config: dict = {
        "r": {
            "command": os.getenv("R", "Rscript"),
            "timeout": 30,
            "env_vars": {
                "R_LIBS_USER": os.getenv("R_LIBS_USER", ""),
                "R_HOME": os.getenv("R_HOME", ""),
            },
        },
        "python": {
            "command": os.getenv("PYTHON", "python"),
            "timeout": 30,
            "env_vars": {
                "PYTHONPATH": os.getenv("PYTHONPATH", ""),
                "PYTHONUNBUFFERED": "1",
            },
        },
    }

    def get_data_root(self) -> str:
        """获取数据根目录路径"""
        if self.data_root:
            return self.data_root
        # 默认：相对于项目根目录
        from pathlib import Path

        base_dir = Path(__file__).parent.parent.parent
        return str(base_dir / "data")

    def get_tcga_data_dir(self) -> str:
        """获取 TCGA 数据目录路径（自动从 data_root 识别）"""
        from pathlib import Path

        root = Path(self.get_data_root())
        return str(root / "tcga")

    def get_depmap_data_dir(self) -> str:
        """获取 DepMap 数据目录路径（自动从 data_root 识别）"""
        from pathlib import Path

        root = Path(self.get_data_root())
        return str(root / "depmap")

    def get_gtex_data_dir(self) -> str:
        """获取 GTEx 数据目录路径（自动从 data_root 识别）"""
        from pathlib import Path

        root = Path(self.get_data_root())
        return str(root / "gtex")

    def get_interpreter_config(self, engine: str) -> dict:
        """获取解释器配置"""
        if engine.lower() not in self.interpreter_config:
            raise ValueError(f"Unsupported engine: {engine}")
        return self.interpreter_config[engine.lower()].copy()

    def get_ggplot2_config(self, chart_type: str, subdir: str = None) -> dict:
        """获取 ggplot2 配置"""
        meta_path = self.visual_root / chart_type / "meta.json"
        if not meta_path.exists():
            return {}
        meta_data = orjson.loads(meta_path.read_text(encoding="utf-8"))
        return meta_data.get("ggplot2", {})


# Global settings instance
# Note: This instance is created at module import time and caches environment variables.
# If you change environment variables, you need to either:
# 1. Restart the application, or
# 2. Call settings.reload() to reload from environment variables
_settings_instance: Optional[Settings] = None


def get_settings() -> Settings:
    """Get the global settings instance, creating it if necessary."""
    global _settings_instance
    if _settings_instance is None:
        _settings_instance = Settings()
    return _settings_instance


def reload_settings() -> Settings:
    """Reload settings from environment variables and .env file.

    This is useful when environment variables change at runtime.
    Note: This creates a new Settings instance, so any code holding
    a reference to the old instance will not see the changes.
    """
    global _settings_instance
    _settings_instance = Settings()
    return _settings_instance


# Create initial settings instance
settings = get_settings()
