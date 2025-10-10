"""
Admin Service
Handles admin user creation and management
"""

from sqlalchemy import select
from app.db.base import AsyncSessionLocal
from app.core.security import SecurityManager
from app.core.config import settings
from app.core.logging import get_logger
from app.models.user import User


class AdminService:
    """Admin user management service"""

    @staticmethod
    async def create_admin_if_not_exists() -> bool:
        """Create admin user if it doesn't exist"""
        logger = get_logger("admin")

        try:
            async with AsyncSessionLocal() as db:
                # Check if admin user already exists using ORM
                result = await db.execute(
                    select(User).where(
                        (User.username == settings.admin_username)
                        | (User.email == settings.admin_email)
                    )
                )
                existing_user = result.scalar_one_or_none()

                if existing_user:
                    logger.info(f"Admin user already exists: {settings.admin_username}")
                    return True

                # Hash password using Argon2
                password = settings.admin_password
                if len(password) > 128:
                    password = password[:128]
                    logger.warning(f"Password truncated to 128 characters for security")

                logger.info(f"Using admin password from config: {password[:3]}***")

                # Hash password using Argon2
                try:
                    hashed_password = SecurityManager.get_password_hash(password)
                    logger.info("Password hashed successfully with Argon2")
                except Exception as e:
                    logger.error(f"Password hashing failed: {e}")
                    raise

                # Create admin user using ORM
                admin_user = User(
                    username=settings.admin_username,
                    email=settings.admin_email,
                    hashed_password=hashed_password,
                    is_active=True,
                    is_admin=True,
                    is_email_verified=True,  # Admin email is pre-verified
                )

                db.add(admin_user)
                await db.commit()
                await db.refresh(admin_user)

                logger.info(
                    f"Admin user created successfully: {admin_user.username} ({admin_user.email})"
                )
                return True

        except Exception as e:
            logger.error(f"Failed to create admin user: {e}")
            return False

    @staticmethod
    async def get_admin_info() -> dict:
        """Get admin user information"""
        try:
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(User)
                    .where(User.is_admin == True)
                    .order_by(User.created_at)
                    .limit(1)
                )
                admin = result.scalar_one_or_none()

                if admin:
                    return {
                        "id": admin.id,
                        "username": admin.username,
                        "email": admin.email,
                        "is_active": admin.is_active,
                        "is_admin": admin.is_admin,
                        "is_email_verified": admin.is_email_verified,
                        "created_at": admin.created_at,
                    }
                return {}

        except Exception as e:
            logger = get_logger("admin")
            logger.error(f"Failed to get admin info: {e}")
            return {}

    @staticmethod
    async def list_all_users() -> list:
        """List all users"""
        try:
            async with AsyncSessionLocal() as db:
                result = await db.execute(select(User).order_by(User.created_at))
                users = result.scalars().all()

                return [
                    {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "is_admin": user.is_admin,
                        "is_active": user.is_active,
                        "is_email_verified": user.is_email_verified,
                        "created_at": user.created_at,
                    }
                    for user in users
                ]

        except Exception as e:
            logger = get_logger("admin")
            logger.error(f"Failed to list users: {e}")
            return []
