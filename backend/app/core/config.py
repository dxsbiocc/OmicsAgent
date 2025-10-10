from pydantic_settings import BaseSettings
from urllib.parse import quote_plus


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
    access_token_expire_minutes: int = 30

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

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",  # 忽略额外的环境变量
    }


# Global settings instance
settings = Settings()
