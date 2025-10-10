from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class EmailVerificationRequest(BaseModel):
    """Email verification request schema"""

    email: EmailStr = Field(..., description="Email address to verify")


class EmailVerificationCode(BaseModel):
    """Email verification code schema"""

    email: EmailStr = Field(..., description="Email address")
    verification_code: str = Field(
        ..., min_length=6, max_length=6, description="6-digit verification code"
    )


class EmailVerificationResponse(BaseModel):
    """Email verification response schema"""

    message: str = Field(..., description="Response message")
    email: str = Field(..., description="Email address")
    success: bool = Field(..., description="Whether the operation was successful")


class EmailVerificationStatus(BaseModel):
    """Email verification status schema"""

    email: str = Field(..., description="Email address")
    has_pending: bool = Field(..., description="Whether there's a pending verification")
    is_expired: bool = Field(
        ..., description="Whether the pending verification is expired"
    )
    expires_at: Optional[datetime] = Field(
        None, description="Expiration time of pending verification"
    )
    created_at: Optional[datetime] = Field(
        None, description="Creation time of pending verification"
    )


class ResendVerificationRequest(BaseModel):
    """Resend verification request schema"""

    email: EmailStr = Field(..., description="Email address to resend verification to")
