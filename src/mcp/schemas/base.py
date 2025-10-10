"""
Base schemas for MCP responses and common validation patterns
"""

from pydantic import BaseModel, Field
from typing import Optional, Any, Dict, List, Generic, TypeVar
from enum import Enum
from datetime import datetime

# Generic type for response data
T = TypeVar("T")


class Status(str, Enum):
    """Standard status values"""

    SUCCESS = "success"
    ERROR = "error"
    PENDING = "pending"


class ContentType(str, Enum):
    """Standard content type values"""

    JSON = "json"
    IMAGE = "image"
    TEXT = "text"
    XML = "xml"
    BINARY = "binary"


class BaseResponse(BaseModel, Generic[T]):
    """Generic base response model"""

    status: Status = Field(..., description="Response status")
    data: Optional[T] = Field(None, description="Response data")
    error: Optional[str] = Field(None, description="Error message if any")
    timestamp: datetime = Field(
        default_factory=datetime.now, description="Response timestamp"
    )

    model_config = {"use_enum_values": True}


class ErrorResponse(BaseResponse[None]):
    """Error response model"""

    status: Status = Status.ERROR
    error: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Error code")
    error_details: Optional[Dict[str, Any]] = Field(
        None, description="Additional error details"
    )


class SuccessResponse(BaseResponse[T]):
    """Success response model"""

    status: Status = Status.SUCCESS
    data: T = Field(..., description="Response data")
    content_type: Optional[ContentType] = Field(None, description="Content type")


class ValidationError(BaseModel):
    """Validation error details"""

    field: str = Field(..., description="Field name")
    message: str = Field(..., description="Error message")
    value: Any = Field(None, description="Invalid value")


class PaginationInfo(BaseModel):
    """Pagination information"""

    page: int = Field(1, ge=1, description="Current page number")
    per_page: int = Field(10, ge=1, le=100, description="Items per page")
    total: int = Field(0, ge=0, description="Total number of items")
    pages: int = Field(0, ge=0, description="Total number of pages")
    has_next: bool = Field(False, description="Has next page")
    has_prev: bool = Field(False, description="Has previous page")


class PaginatedResponse(SuccessResponse[List[T]]):
    """Paginated response model"""

    pagination: PaginationInfo = Field(..., description="Pagination information")


class APIInfo(BaseModel):
    """API information model"""

    name: str = Field(..., description="API name")
    version: str = Field(..., description="API version")
    description: Optional[str] = Field(None, description="API description")
    base_url: Optional[str] = Field(None, description="Base URL")
    endpoints: Optional[List[str]] = Field(None, description="Available endpoints")
    rate_limit: Optional[Dict[str, Any]] = Field(
        None, description="Rate limiting information"
    )
