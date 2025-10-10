"""
Database factory for different environments
"""

import os
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData

from app.core.config import settings


def get_base_class():
    """Get the appropriate Base class based on environment"""
    if os.getenv("ALEMBIC_MIGRATION_MODE"):
        # For migrations, use synchronous base
        return declarative_base()
    else:
        # For application, use async base
        return DeclarativeBase


def get_engine():
    """Get the appropriate engine based on environment"""
    if os.getenv("ALEMBIC_MIGRATION_MODE"):
        return None  # No engine needed for migrations
    else:
        return create_async_engine(
            settings.database_url,
            echo=settings.database_echo,
            future=True,
        )


def get_session_factory():
    """Get the appropriate session factory based on environment"""
    if os.getenv("ALEMBIC_MIGRATION_MODE"):
        return None  # No session factory needed for migrations
    else:
        engine = get_engine()
        return async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )


# Export the appropriate Base class
Base = get_base_class()
engine = get_engine()
AsyncSessionLocal = get_session_factory()
