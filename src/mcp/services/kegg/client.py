"""
KEGG API client implementation
"""

import base64
import httpx
from services.common.base_client import BaseAPIClient
from schemas.base import ContentType, Status
from schemas.kegg import KEGGSuccessResponse, KEGGErrorResponse


class KEGGClient(BaseAPIClient):
    """KEGG API client"""

    def __init__(self, base_url: str = "https://rest.kegg.jp", timeout: float = 30.0):
        super().__init__(base_url, timeout)

    async def make_request(
        self, operation: str, argument: str, **kwargs
    ) -> KEGGSuccessResponse | KEGGErrorResponse:
        """Make a request to the KEGG API"""
        try:
            url = f"{self.base_url}/{operation}/{argument}"

            # Add additional arguments if provided
            if kwargs:
                additional_args = "/".join(
                    str(v) for v in kwargs.values() if v is not None
                )
                if additional_args:
                    url += f"/{additional_args}"

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
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

                return KEGGSuccessResponse(
                    data=data,
                    content_type=content_type,
                    url=url,
                    operation=operation,
                    argument=argument,
                )

        except httpx.RequestError as e:
            return KEGGErrorResponse(
                error=str(e),
                url=url if "url" in locals() else None,
                operation=operation,
                argument=argument,
            )
        except Exception as e:
            return KEGGErrorResponse(
                error=f"Unexpected error: {str(e)}",
                operation=operation,
                argument=argument,
            )

    def parse_response(self, result: KEGGSuccessResponse | KEGGErrorResponse) -> str:
        """Parse the response from the KEGG API"""
        if result.status == Status.ERROR:
            raise ValueError(result.error)
        if result.content_type == ContentType.IMAGE:
            return base64.b64encode(result.data)
        return result.data
