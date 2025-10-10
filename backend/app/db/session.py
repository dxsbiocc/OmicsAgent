from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.base import AsyncSessionLocal, engine, Base


class DatabaseManager:
    """Database management utilities"""

    @staticmethod
    async def create_tables():
        """Create all database tables"""

        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    @staticmethod
    async def drop_tables():
        """Drop all database tables"""

        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)

    @staticmethod
    async def check_connection() -> bool:
        """Check database connection"""
        try:
            async with AsyncSessionLocal() as session:
                await session.execute(text("SELECT 1"))
                return True
        except Exception as e:
            from app.core.logging import get_logger

            logger = get_logger("database")
            logger.error(f"Database connection failed: {e}")
            return False

    @staticmethod
    async def get_session() -> AsyncSession:
        """Get database session"""
        return AsyncSessionLocal()


# Database initialization
async def init_db():
    """Initialize database"""
    await DatabaseManager.create_tables()
    print("Database initialized successfully")
