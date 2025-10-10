"""
Base API client for MCP services
"""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from schemas.base import BaseResponse, T


class BaseAPIClient(ABC):
    """Base API client class"""

    def __init__(self, base_url: str, timeout: float = 30.0):
        self.base_url = base_url
        self.timeout = timeout

    @abstractmethod
    async def make_request(
        self, operation: str, argument: str, **kwargs
    ) -> BaseResponse[T]:
        """Make a request to the API"""
        pass

    async def get(self, endpoint: str, **kwargs) -> BaseResponse:
        """GET request"""
        return await self.make_request("get", endpoint, **kwargs)

    async def post(
        self, endpoint: str, data: Optional[Dict[str, Any]] = None, **kwargs
    ) -> BaseResponse:
        """POST request"""
        return await self.make_request("post", endpoint, data=data, **kwargs)

    async def put(
        self, endpoint: str, data: Optional[Dict[str, Any]] = None, **kwargs
    ) -> BaseResponse:
        """PUT request"""
        return await self.make_request("put", endpoint, data=data, **kwargs)

    async def delete(self, endpoint: str, **kwargs) -> BaseResponse:
        """DELETE request"""
        return await self.make_request("delete", endpoint, **kwargs)
