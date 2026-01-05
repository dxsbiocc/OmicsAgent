"""
LLM configuration API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel, Field

from app.api.deps import get_current_active_user
from app.models.user import User
from app.utils.llm_factory import get_available_models, ALLOWED_SOURCES, SourceType
from app.core.logging import get_logger

logger = get_logger("llm_api")

router = APIRouter(prefix="/llm", tags=["llm"])


class LLMConfigRequest(BaseModel):
    """Request model for updating LLM configuration"""
    source: SourceType = Field(..., description="LLM source")
    model: str = Field(..., description="Model name")
    base_url: str | None = Field(None, description="Base URL for custom models")
    api_key: str | None = Field(None, description="API key (optional)")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="Temperature")
    max_tokens: int | None = Field(None, ge=1, description="Maximum tokens")


@router.get("/sources")
async def get_llm_sources():
    """Get available LLM sources"""
    return {
        "sources": [
            {"value": source, "label": source}
            for source in sorted(ALLOWED_SOURCES)
        ]
    }


@router.get("/models/{source}")
async def get_models_for_source(source: SourceType):
    """Get available models for a given source"""
    try:
        models = get_available_models(source)
        return {"models": models}
    except Exception as e:
        logger.error(f"Error getting models: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error getting models: {str(e)}"
        )

