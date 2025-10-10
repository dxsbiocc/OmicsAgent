from fastapi import Query
from app.db.base import get_db
from app.core.security import (
    get_current_user,
    get_current_active_user,
    get_current_admin_user,
    get_current_user_optional,
)
from app.core.config import settings


# Re-export security dependencies for convenience
__all__ = [
    "get_db",
    "get_current_user",
    "get_current_active_user",
    "get_current_admin_user",
    "get_current_user_optional",
    "get_settings",
    "get_pagination_params",
]


# Dependency to get settings
async def get_settings():
    """Get application settings"""
    return settings


# Dependency to get pagination params
async def get_pagination_params(
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page"),
) -> dict:
    """Get pagination parameters"""
    return {"skip": (page - 1) * size, "limit": size, "page": page, "size": size}
