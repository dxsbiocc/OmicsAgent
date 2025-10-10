import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData
from app.core.config import settings

# Only create async engine if not in migration mode
if not os.getenv("ALEMBIC_MIGRATION_MODE"):
    # Create async engine
    engine = create_async_engine(
        settings.database_url,
        echo=settings.database_echo,
        future=True,
    )

    # Create async session factory
    AsyncSessionLocal = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
else:
    # In migration mode, set to None
    engine = None
    AsyncSessionLocal = None


# Base class for all models
class Base(DeclarativeBase):
    """Base class for all database models"""

    metadata = MetaData()


# Dependency to get database session
async def get_db() -> AsyncSession:
    """Get database session dependency"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
