"""
Uniprot API client implementation
"""

import httpx
from typing import Optional

from services.common.base_client import BaseAPIClient
from schemas.base import ContentType, Status
from schemas.uniprot import UniprotSuccessResponse, UniprotErrorResponse


class UniprotClient(BaseAPIClient):
    def __init__(
        self, base_url: str = "https://rest.uniprot.org", timeout: float = 30.0
    ):
        super().__init__(base_url, timeout)

    async def make_request(
        self,
        operation: str,
        argument: Optional[str] = None,
        params: dict = {},
        post: bool = False,
    ) -> UniprotSuccessResponse | UniprotErrorResponse:
        """Make a request to the Uniprot API"""
        try:
            url = f"{self.base_url}/{operation}"
            if argument:
                url += f"/{argument}"
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                if post:
                    response = await client.post(url, json=params)
                else:
                    response = await client.get(url, params=params)
                response.raise_for_status()

                # Determine content type and parse accordingly
                content_type = response.headers.get("content-type", "")

                if "json" in content_type:
                    data = response.json()
                    content_type = ContentType.JSON
                elif "image" in content_type:
                    data = response.content
                    content_type = ContentType.IMAGE
                else:
                    data = response.text
                    content_type = ContentType.TEXT
                return UniprotSuccessResponse(
                    data=data,
                    content_type=content_type,
                    url=url,
                    operation=operation,
                    argument=argument if argument else None,
                )
        except httpx.RequestError as e:
            return UniprotErrorResponse(
                error=str(e),
                url=url if "url" in locals() else None,
                operation=operation,
                argument=argument if argument else None,
            )

    async def parse_response(
        self, result: UniprotSuccessResponse | UniprotErrorResponse
    ) -> dict:
        """
        Parse the response from the Uniprot API
        """
        if result.status == Status.ERROR:
            raise ValueError(result.error)
        if result.content_type != ContentType.JSON:
            raise ValueError(f"Unexpected content type: {result.content_type}")
        return result.data
