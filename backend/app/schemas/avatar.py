from pydantic import BaseModel, Field
from typing import Optional


class AvatarUpdateRequest(BaseModel):
    """Avatar update request schema"""

    avatar_url: Optional[str] = Field(
        None, description="Avatar URL (for preset avatars)"
    )


class AvatarUploadResponse(BaseModel):
    """Avatar upload response schema"""

    success: bool = Field(..., description="Whether the upload was successful")
    message: str = Field(..., description="Response message")
    avatar_url: Optional[str] = Field(None, description="New avatar URL")


class AvatarPresetResponse(BaseModel):
    """Avatar preset response schema"""

    filename: str = Field(..., description="Preset avatar filename")
    url: str = Field(..., description="Preset avatar URL")
    display_name: str = Field(..., description="Display name for the avatar")
