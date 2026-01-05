"""
Conversation and Message schemas for API requests and responses.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class MessageBase(BaseModel):
    """Base message schema"""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    metadata: Optional[Dict[str, Any]] = Field(
        None, alias="meta_data", description="Message metadata"
    )


class MessageCreate(MessageBase):
    """Schema for creating a message"""
    conversation_id: int = Field(..., description="Conversation ID")


class MessageResponse(MessageBase):
    """Schema for message response"""
    id: int
    conversation_id: int
    is_complete: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}


class LLMConfig(BaseModel):
    """LLM configuration schema"""
    source: str = Field(..., description="LLM source: OpenAI, Anthropic, Custom, etc.")
    model: str = Field(..., description="Model name")
    base_url: Optional[str] = Field(None, description="Base URL for custom models")
    api_key: Optional[str] = Field(None, description="API key (optional, can use default)")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="Temperature (0-2)")
    max_tokens: Optional[int] = Field(None, ge=1, description="Maximum tokens")


class ConversationBase(BaseModel):
    """Base conversation schema"""
    title: Optional[str] = Field(None, description="Conversation title")
    metadata: Optional[Dict[str, Any]] = Field(
        None, alias="meta_data", description="Conversation metadata"
    )
    llm_config: Optional[LLMConfig] = Field(None, description="LLM configuration for this conversation")


class ConversationCreate(ConversationBase):
    """Schema for creating a conversation"""
    pass


class ConversationUpdate(ConversationBase):
    """Schema for updating a conversation"""
    is_active: Optional[bool] = Field(None, description="Whether conversation is active")


class ConversationResponse(ConversationBase):
    """Schema for conversation response"""
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True, "populate_by_name": True}


class ConversationListItem(ConversationBase):
    """Schema for conversation list item (without messages)"""
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}


class ConversationListResponse(BaseModel):
    """Schema for conversation list response"""
    conversations: List[ConversationListItem]
    total: int

