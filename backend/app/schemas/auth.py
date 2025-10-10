from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
from app.core.security import validate_password_strength


class UserBase(BaseModel):
    """Base user schema"""

    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: EmailStr = Field(..., description="Email address")
    full_name: Optional[str] = Field(None, max_length=100, description="Full name")
    bio: Optional[str] = Field(None, description="User bio")
    avatar_url: Optional[str] = Field(None, max_length=500, description="Avatar URL")


class UserCreate(UserBase):
    """User creation schema"""

    password: str = Field(..., min_length=8, description="Password")

    @field_validator("password")
    def validate_password(cls, v):
        if not validate_password_strength(v):
            raise ValueError(
                "Password must be at least 8 characters long and contain "
                "uppercase, lowercase, digit, and special character"
            )
        return v


class UserUpdate(BaseModel):
    """User update schema"""

    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = None
    avatar_url: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
    is_email_verified: Optional[bool] = None


class UserResponse(UserBase):
    """User response schema"""

    id: int
    is_active: bool
    is_admin: bool
    is_email_verified: bool
    created_at: datetime
    updated_at: datetime

    # Note: Statistics are computed properties, not included in basic user response

    class Config:
        from_attributes = True


class UserStatsResponse(BaseModel):
    """User statistics response schema - computed properties"""

    user_id: int
    username: str
    total_posts: int
    total_likes_received: int
    total_views_received: int
    total_comments_received: int
    total_comment_likes_received: int
    total_likes_given: int = 0
    total_favorites_given: int = 0
    total_posts_published: int = 0

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """User login schema"""

    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="Password")


class Token(BaseModel):
    """Token response schema"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Optional[UserResponse] = None


class TokenData(BaseModel):
    """Token data schema"""

    user_id: Optional[int] = None


class PasswordChange(BaseModel):
    """Password change schema"""

    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New password")

    @field_validator("new_password")
    def validate_new_password(cls, v):
        if not validate_password_strength(v):
            raise ValueError(
                "Password must be at least 8 characters long and contain "
                "uppercase, lowercase, digit, and special character"
            )
        return v


class PasswordReset(BaseModel):
    """Password reset schema"""

    email: EmailStr = Field(..., description="Email address")


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation schema"""

    token: str = Field(..., description="Reset token")
    new_password: str = Field(..., min_length=8, description="New password")

    @field_validator("new_password")
    def validate_new_password(cls, v):
        if not validate_password_strength(v):
            raise ValueError(
                "Password must be at least 8 characters long and contain "
                "uppercase, lowercase, digit, and special character"
            )
        return v
