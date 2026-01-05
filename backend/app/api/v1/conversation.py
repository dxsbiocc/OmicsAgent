"""
Conversation and Message API endpoints.
These endpoints manage conversations and messages as first-class business entities.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.models.conversation import Conversation
from app.services.conversation import ConversationService, MessageService
from app.schemas.conversation import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    ConversationListResponse,
    ConversationListItem,
    MessageResponse,
    LLMConfig,
)
from app.core.logging import get_logger

logger = get_logger("conversation_api")

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("", response_model=ConversationResponse)
async def create_conversation(
    conversation: ConversationCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new conversation.

    Args:
        conversation: Conversation creation data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Created conversation
    """
    try:
        conv = await ConversationService.create_conversation(
            db=db,
            user_id=current_user.id,
            title=conversation.title,
            metadata=conversation.metadata,
        )
        # Refresh conversation with messages relationship loaded to avoid lazy loading issues
        from sqlalchemy.orm import selectinload
        from sqlalchemy import select

        stmt = (
            select(Conversation)
            .where(Conversation.id == conv.id)
            .options(selectinload(Conversation.messages))
        )
        result = await db.execute(stmt)
        conv = result.scalar_one()
        return ConversationResponse.model_validate(conv)
    except Exception as e:
        logger.error(f"Error creating conversation: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error creating conversation: {str(e)}"
        )


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    include_messages: bool = Query(False),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List conversations for the current user.

    Args:
        skip: Number of conversations to skip
        limit: Maximum number of conversations to return
        include_messages: Whether to include messages in response
        current_user: Current authenticated user
        db: Database session

    Returns:
        List of conversations
    """
    try:
        conversations = await ConversationService.list_conversations(
            db=db,
            user_id=current_user.id,
            skip=skip,
            limit=limit,
            include_messages=include_messages,
        )

        # Get total count
        from sqlalchemy import select, func
        from app.models.conversation import Conversation

        count_stmt = select(func.count(Conversation.id)).where(
            Conversation.user_id == current_user.id
        )
        total = await db.execute(count_stmt)
        total_count = total.scalar() or 0

        # Convert conversations to response format
        # Use ConversationListItem to avoid loading messages relationship
        # This prevents SQLAlchemy async lazy loading errors
        conversation_responses = [
            ConversationListItem.model_validate(conv) for conv in conversations
        ]

        return ConversationListResponse(
            conversations=conversation_responses,
            total=total_count,
        )
    except Exception as e:
        logger.error(f"Error listing conversations: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error listing conversations: {str(e)}"
        )


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a conversation by ID.

    Args:
        conversation_id: Conversation ID
        current_user: Current authenticated user
        db: Database session

    Returns:
        Conversation with messages
    """
    try:
        conversation = await ConversationService.get_conversation(
            db=db, conversation_id=conversation_id, user_id=current_user.id
        )
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Debug: Log the raw conversation object
        logger.debug(
            f"Conversation {conversation_id} meta_data: {conversation.meta_data}"
        )
        logger.debug(
            f"Conversation {conversation_id} meta_data type: {type(conversation.meta_data)}"
        )

        # Convert SQLAlchemy object to dict first, then validate
        # This ensures meta_data is properly included and mapped to metadata via alias
        conv_dict = {
            "id": conversation.id,
            "user_id": conversation.user_id,
            "title": conversation.title,
            "is_active": conversation.is_active,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at,
            "meta_data": conversation.meta_data,  # Use meta_data (database field name)
            "messages": [
                MessageResponse.model_validate(msg) for msg in conversation.messages
            ],
        }

        # Validate with the dict, Pydantic will map meta_data -> metadata via alias
        response = ConversationResponse.model_validate(conv_dict)
        logger.debug(f"Response metadata: {response.metadata}")
        logger.debug(
            f"Response model_dump (by_alias=False): {response.model_dump(by_alias=False)}"
        )
        logger.debug(
            f"Response model_dump (by_alias=True): {response.model_dump(by_alias=True)}"
        )

        # FastAPI uses by_alias=True by default for serialization, which means it will
        # use 'meta_data' instead of 'metadata'. To ensure frontend receives 'metadata',
        # we need to return a dict with by_alias=False and use JSONResponse
        from fastapi.responses import JSONResponse

        response_dict = response.model_dump(by_alias=False, mode="json")
        logger.debug(f"Response dict (by_alias=False): {response_dict}")
        return JSONResponse(content=response_dict)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error getting conversation: {str(e)}"
        )


@router.patch("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: int,
    update_data: ConversationUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update a conversation.

    Args:
        conversation_id: Conversation ID
        update_data: Update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated conversation
    """
    try:
        conversation = await ConversationService.update_conversation(
            db=db,
            conversation_id=conversation_id,
            user_id=current_user.id,
            update_data=update_data,
        )
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return ConversationResponse.model_validate(conversation)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating conversation: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error updating conversation: {str(e)}"
        )


@router.patch("/{conversation_id}/llm-config")
async def update_conversation_llm_config(
    conversation_id: int,
    llm_config: LLMConfig,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update LLM configuration for a conversation.

    Args:
        conversation_id: Conversation ID
        llm_config: LLM configuration (from request body, not URL)
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated conversation
    """
    try:
        # Log the received request data
        logger.debug(
            f"Received LLM config update request for conversation {conversation_id}: {llm_config.model_dump()}"
        )
        # Get conversation
        conversation = await ConversationService.get_conversation(
            db=db, conversation_id=conversation_id, user_id=current_user.id
        )
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Update metadata with LLM config
        # For JSON fields in SQLAlchemy, we need to create a new dict to trigger change detection
        new_llm_config = llm_config.model_dump(exclude_none=True)

        if conversation.meta_data is None:
            conversation.meta_data = {}

        # Create a new dict to ensure SQLAlchemy detects the change
        # Direct assignment to nested dict may not trigger change detection
        updated_meta_data = dict(conversation.meta_data)
        updated_meta_data["llm_config"] = new_llm_config
        conversation.meta_data = updated_meta_data

        logger.debug(
            f"Updating conversation {conversation_id} with LLM config: {new_llm_config}"
        )
        logger.debug(
            f"Before commit, conversation {conversation_id} meta_data: {conversation.meta_data}"
        )

        # Mark the object as modified to ensure SQLAlchemy detects the change
        from sqlalchemy.orm.attributes import flag_modified

        flag_modified(conversation, "meta_data")

        await db.commit()

        # Reload conversation with messages relationship to avoid lazy loading issues
        # Use a fresh query to ensure we get the latest data from database
        from sqlalchemy.orm import selectinload
        from sqlalchemy import select

        stmt = (
            select(Conversation)
            .where(Conversation.id == conversation_id)
            .options(selectinload(Conversation.messages))
        )
        result = await db.execute(stmt)
        conversation = result.scalar_one()

        logger.debug(
            f"After reload, conversation {conversation_id} meta_data: {conversation.meta_data}"
        )

        return ConversationResponse.model_validate(conversation)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating LLM config: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error updating LLM config: {str(e)}"
        )


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a conversation.

    Args:
        conversation_id: Conversation ID
        current_user: Current authenticated user
        db: Database session

    Returns:
        Success message
    """
    try:
        success = await ConversationService.delete_conversation(
            db=db, conversation_id=conversation_id, user_id=current_user.id
        )
        if not success:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"message": "Conversation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting conversation: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error deleting conversation: {str(e)}"
        )


@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: int,
    limit: Optional[int] = Query(None, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get messages for a conversation.

    Args:
        conversation_id: Conversation ID
        limit: Optional limit on number of messages
        current_user: Current authenticated user
        db: Database session

    Returns:
        List of messages
    """
    try:
        # Verify conversation belongs to user
        conversation = await ConversationService.get_conversation(
            db=db, conversation_id=conversation_id, user_id=current_user.id
        )
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        messages = await MessageService.get_conversation_messages(
            db=db, conversation_id=conversation_id, limit=limit
        )
        return [MessageResponse.model_validate(msg) for msg in messages]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting messages: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting messages: {str(e)}")
