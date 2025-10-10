from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    status,
    Response,
    UploadFile,
    File,
    Form,
)
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta
from typing import Optional

from app.api.deps import get_db
from app.models.user import User
from app.schemas.auth import (
    UserCreate,
    UserResponse,
    UserLogin,
    Token,
    PasswordChange,
    UserUpdate,
)
from app.schemas.email_verification import (
    EmailVerificationCode,
    EmailVerificationResponse,
    EmailVerificationStatus,
    ResendVerificationRequest,
)
from app.schemas.avatar import (
    AvatarUpdateRequest,
    AvatarUploadResponse,
    AvatarPresetResponse,
)
from app.core.security import (
    authenticate_user,
    get_current_active_user,
    get_current_user,
    get_current_user_from_token,
    security,
)
from app.utils.query_helpers import get_user_with_relationships
from app.core.config import settings
from app.services.email_verification import EmailVerificationService
from app.services.email import EmailService
from app.core.logging import get_logger
from app.utils.file_upload import (
    save_avatar_file,
    get_avatar_url,
    get_preset_avatars,
    delete_avatar_file,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=EmailVerificationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user and send email verification"""
    logger = get_logger("auth")

    # Check if username already exists
    existing_user = await db.execute(
        select(User).where(User.username == user_data.username)
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Check if email already exists
    existing_email = await db.execute(select(User).where(User.email == user_data.email))
    if existing_email.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create new user (inactive until email verification)
    hashed_password = security.get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        bio=user_data.bio,
        avatar_url=user_data.avatar_url,
        is_active=False,  # User is inactive until email verification
    )

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    # Create and send email verification
    verification_code = await EmailVerificationService.create_verification(
        user_data.email, db_user.id, db
    )

    if verification_code:
        logger.info(f"User {user_data.username} registered, verification email sent")
        return EmailVerificationResponse(
            message="Registration successful! Please check your email for verification code.",
            email=user_data.email,
            success=True,
        )
    else:
        logger.warning(
            f"User {user_data.username} registered but verification email failed"
        )
        return EmailVerificationResponse(
            message="Registration successful, but verification email could not be sent. Please contact support.",
            email=user_data.email,
            success=False,
        )


@router.post("/verify-email", response_model=EmailVerificationResponse)
async def verify_email(
    verification_data: EmailVerificationCode, db: AsyncSession = Depends(get_db)
):
    """Verify email with verification code"""
    logger = get_logger("auth")

    # Verify the code
    is_verified = await EmailVerificationService.verify_code(
        verification_data.email, verification_data.verification_code, db
    )

    if is_verified:
        # Activate the user
        user_result = await db.execute(
            select(User).where(User.email == verification_data.email)
        )
        user = user_result.scalar_one_or_none()

        if user:
            user.is_active = True
            await db.commit()

            # Send welcome email
            await EmailService.send_welcome_email(user.email, user.username)

            logger.info(f"Email {verification_data.email} verified and user activated")
            return EmailVerificationResponse(
                message="Email verified successfully! Your account is now active.",
                email=verification_data.email,
                success=True,
            )
        else:
            logger.error(f"User not found for email {verification_data.email}")
            return EmailVerificationResponse(
                message="Verification successful but user not found. Please contact support.",
                email=verification_data.email,
                success=False,
            )
    else:
        logger.warning(f"Invalid verification code for {verification_data.email}")
        return EmailVerificationResponse(
            message="Invalid or expired verification code. Please try again.",
            email=verification_data.email,
            success=False,
        )


@router.post("/resend-verification", response_model=EmailVerificationResponse)
async def resend_verification(
    request_data: ResendVerificationRequest, db: AsyncSession = Depends(get_db)
):
    """Resend email verification code"""
    logger = get_logger("auth")

    # Check if user exists
    user_result = await db.execute(select(User).where(User.email == request_data.email))
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already verified"
        )

    # Resend verification
    success = await EmailVerificationService.resend_verification(request_data.email, db)

    if success:
        logger.info(f"Verification code resent to {request_data.email}")
        return EmailVerificationResponse(
            message="Verification code sent successfully! Please check your email.",
            email=request_data.email,
            success=True,
        )
    else:
        logger.error(f"Failed to resend verification to {request_data.email}")
        return EmailVerificationResponse(
            message="Failed to send verification code. Please try again later.",
            email=request_data.email,
            success=False,
        )


@router.get("/verification-status/{email}", response_model=EmailVerificationStatus)
async def get_verification_status(email: str, db: AsyncSession = Depends(get_db)):
    """Get email verification status"""
    status = await EmailVerificationService.get_verification_status(email, db)
    return EmailVerificationStatus(email=email, **status)


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)
):
    """Login user and return access token"""
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    # Create tokens
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    refresh_token = security.create_refresh_token(subject=user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.access_token_expire_minutes * 60,
    }


@router.post("/login-json", response_model=Token)
async def login_json(
    user_data: UserLogin, response: Response, db: AsyncSession = Depends(get_db)
):
    """Login user with JSON data and return access token with HttpOnly Cookie"""
    user = await authenticate_user(db, user_data.username, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    # Create tokens
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    refresh_token = security.create_refresh_token(subject=user.id)

    # 设置HttpOnly Cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.access_token_expire_minutes * 60,
        httponly=True,
        secure=False,  # 开发环境设为False，生产环境应设为True
        samesite="lax",
        path="/",
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=7 * 24 * 60 * 60,  # 7天
        httponly=True,
        secure=False,  # 开发环境设为False，生产环境应设为True
        samesite="lax",
        path="/",
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.access_token_expire_minutes * 60,
        "user": user,
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str, db: AsyncSession = Depends(get_db)):
    """Refresh access token using refresh token"""
    user_id = security.verify_refresh_token(refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )

    user = await get_user_with_relationships(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    # Create new tokens
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    new_refresh_token = security.create_refresh_token(subject=user.id)

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "expires_in": settings.access_token_expire_minutes * 60,
    }


@router.post("/logout")
async def logout(
    response: Response, current_user: User = Depends(get_current_active_user)
):
    """Logout user and clear HttpOnly Cookies"""
    # 清除HttpOnly Cookies
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")

    # In a real application, you would add the token to a blacklist
    # For now, we'll just return a success message
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(request: Request, db: AsyncSession = Depends(get_db)):
    """Get current user information (supports both Bearer token and Cookie auth)"""
    try:
        # 首先尝试从Cookie获取用户
        # print(request)
        current_user = await get_current_user(request, db)
    except HTTPException:
        # 如果Cookie认证失败，尝试Bearer token认证
        try:
            security_scheme = OAuth2PasswordBearer()
            token = await security_scheme(request)
            current_user = await get_current_user_from_token(token.credentials, db)
        except:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user information"""
    # Check if username is being changed and if it's available
    if user_data.username and user_data.username != current_user.username:
        existing_user = await db.execute(
            select(User).where(User.username == user_data.username)
        )
        if existing_user.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken"
            )

    # Check if email is being changed and if it's available
    if user_data.email and user_data.email != current_user.email:
        existing_email = await db.execute(
            select(User).where(User.email == user_data.email)
        )
        if existing_email.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Email already taken"
            )

    # Update user data
    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)

    return current_user


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Change user password"""
    # Verify current password
    if not security.verify_password(
        password_data.current_password, current_user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    # Update password
    current_user.hashed_password = security.get_password_hash(
        password_data.new_password
    )
    await db.commit()

    return {"message": "Password changed successfully"}


@router.delete("/me")
async def delete_current_user(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete current user account"""
    # Soft delete by deactivating the user
    current_user.is_active = False
    await db.commit()

    return {"message": "Account deleted successfully"}


# Avatar management endpoints
@router.post("/avatar/upload", response_model=AvatarUploadResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload and set user avatar"""
    logger = get_logger("avatar_upload")
    logger.info(f"用户上传头像: {current_user.username}")

    try:
        # 保存上传的文件
        filename = await save_avatar_file(file)
        avatar_url = get_avatar_url(filename)

        # 删除旧头像文件（如果存在）
        if current_user.avatar_url and current_user.avatar_url.startswith(
            "/static/avatars/"
        ):
            old_filename = current_user.avatar_url.split("/")[-1]
            delete_avatar_file(old_filename)

        # 更新用户头像URL
        current_user.avatar_url = avatar_url
        await db.commit()
        await db.refresh(current_user)

        logger.info(f"头像上传成功: {filename}")
        return AvatarUploadResponse(
            success=True, message="头像上传成功", avatar_url=avatar_url
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"头像上传失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"头像上传失败: {str(e)}",
        )


@router.put("/avatar/preset", response_model=AvatarUploadResponse)
async def set_preset_avatar(
    avatar_data: AvatarUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Set user avatar to a preset avatar"""
    logger = get_logger("avatar_preset")
    logger.info(f"用户设置预设头像: {current_user.username}")

    if not avatar_data.avatar_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="请提供头像URL"
        )

    try:
        # 删除旧头像文件（如果存在且是上传的头像）
        # if current_user.avatar_url and current_user.avatar_url.startswith(
        #     "/static/avatars/"
        # ):
        #     old_filename = current_user.avatar_url.split("/")[-1]
        #     delete_avatar_file(old_filename)

        # 更新用户头像 URL
        current_user.avatar_url = avatar_data.avatar_url
        await db.commit()
        await db.refresh(current_user)

        logger.info(f"预设头像设置成功: {avatar_data.avatar_url}")
        return AvatarUploadResponse(
            success=True, message="预设头像设置成功", avatar_url=avatar_data.avatar_url
        )

    except Exception as e:
        logger.error(f"预设头像设置失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"预设头像设置失败: {str(e)}",
        )


@router.get("/avatar/presets", response_model=list[AvatarPresetResponse])
async def get_preset_avatars_list():
    """Get list of available preset avatars"""
    logger = get_logger("avatar_presets")
    logger.info("获取预设头像列表")

    try:
        presets = get_preset_avatars()
        return presets
    except Exception as e:
        logger.error(f"获取预设头像列表失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取预设头像列表失败: {str(e)}",
        )


@router.delete("/avatar")
async def delete_avatar(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete user avatar"""
    logger = get_logger("avatar_delete")
    logger.info(f"用户删除头像: {current_user.username}")

    try:
        # 删除头像文件（如果存在且是上传的头像）
        if current_user.avatar_url and current_user.avatar_url.startswith(
            "/static/avatars/"
        ):
            filename = current_user.avatar_url.split("/")[-1]
            delete_avatar_file(filename)

        # 清除用户头像URL
        current_user.avatar_url = None
        await db.commit()
        await db.refresh(current_user)

        logger.info("头像删除成功")
        return {"message": "头像删除成功"}

    except Exception as e:
        logger.error(f"头像删除失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"头像删除失败: {str(e)}",
        )
