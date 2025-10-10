"""
Common utilities for MCP services
"""

import json
from typing import Any, Dict, Optional
from schemas.base import BaseResponse, T


def format_response(response: BaseResponse, indent: int = 2) -> str:
    """Format response for display"""
    if response.status == "success":
        return json.dumps(response.model_dump(), indent=indent)
    return f"Error: {response.error}"


def extract_data(response: BaseResponse[T]) -> Optional[T]:
    """Extract data from response"""
    if response.status == "success":
        return response.data
    return None


def is_success(response: BaseResponse[T]) -> bool:
    """Check if response is successful"""
    return response.status == "success"


def get_error_message(response: BaseResponse[T]) -> Optional[str]:
    """Get error message from response"""
    return response.error if response.status == "error" else None
