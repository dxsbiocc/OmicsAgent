"""
Admin API endpoints
Provides admin user management and information endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_admin_user
from app.services.admin import AdminService
from app.core.logging import get_logger
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/admin", tags=["admin"])
logger = get_logger("admin_api")


@router.get("/info", response_model=dict)
async def get_admin_info(current_user: UserResponse = Depends(get_current_admin_user)):
    """Get admin user information (admin only)"""
    try:
        admin_info = await AdminService.get_admin_info()
        if not admin_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="No admin user found"
            )

        logger.info(f"Admin info requested by user {current_user.username}")
        return admin_info

    except Exception as e:
        logger.error(f"Failed to get admin info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get admin information",
        )


@router.get("/users", response_model=list)
async def list_all_users(current_user: UserResponse = Depends(get_current_admin_user)):
    """List all users (admin only)"""
    try:
        users = await AdminService.list_all_users()

        logger.info(f"User list requested by admin {current_user.username}")
        return users

    except Exception as e:
        logger.error(f"Failed to list users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list users",
        )


@router.post("/create-admin")
async def create_admin_user(
    current_user: UserResponse = Depends(get_current_admin_user),
):
    """Manually create admin user (admin only)"""
    try:
        success = await AdminService.create_admin_if_not_exists()

        if success:
            admin_info = await AdminService.get_admin_info()
            logger.info(f"Admin user creation requested by {current_user.username}")
            return {
                "message": "Admin user created successfully",
                "admin_info": admin_info,
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create admin user",
            )

    except Exception as e:
        logger.error(f"Failed to create admin user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create admin user",
        )
