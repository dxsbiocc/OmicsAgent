"""
Conversation and Message service for managing chat persistence.
This service handles all database operations for conversations and messages.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload

from app.models.conversation import Conversation, Message
from app.models.user import User
from app.schemas.conversation import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    MessageCreate,
    MessageResponse,
)
from app.core.logging import get_logger

logger = get_logger("conversation_service")


class ConversationService:
    """Service for managing conversations and messages"""

    @staticmethod
    async def create_conversation(
        db: AsyncSession, 
        user_id: int, 
        title: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Conversation:
        """
        Create a new conversation.
        
        Args:
            db: Database session
            user_id: User ID
            title: Optional conversation title
            metadata: Optional conversation metadata
            
        Returns:
            Created conversation
        """
        conversation = Conversation(
            user_id=user_id,
            title=title or "New Conversation",
            is_active=True,
            meta_data=metadata,
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
        logger.info(f"Created conversation {conversation.id} for user {user_id}")
        return conversation

    @staticmethod
    async def get_conversation(
        db: AsyncSession, conversation_id: int, user_id: Optional[int] = None
    ) -> Optional[Conversation]:
        """
        Get a conversation by ID.
        
        Args:
            db: Database session
            conversation_id: Conversation ID
            user_id: Optional user ID for authorization check
            
        Returns:
            Conversation if found, None otherwise
        """
        stmt = select(Conversation).where(Conversation.id == conversation_id)
        if user_id:
            stmt = stmt.where(Conversation.user_id == user_id)
        
        result = await db.execute(stmt.options(selectinload(Conversation.messages)))
        return result.scalar_one_or_none()

    @staticmethod
    async def list_conversations(
        db: AsyncSession,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        include_messages: bool = False,
    ) -> List[Conversation]:
        """
        List conversations for a user.
        
        Args:
            db: Database session
            user_id: User ID
            skip: Number of conversations to skip
            limit: Maximum number of conversations to return
            include_messages: Whether to include messages in the response
            
        Returns:
            List of conversations
        """
        stmt = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(desc(Conversation.updated_at))
            .offset(skip)
            .limit(limit)
        )
        
        if include_messages:
            stmt = stmt.options(selectinload(Conversation.messages))
        
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def update_conversation(
        db: AsyncSession,
        conversation_id: int,
        user_id: int,
        update_data: ConversationUpdate,
    ) -> Optional[Conversation]:
        """
        Update a conversation.
        
        Args:
            db: Database session
            conversation_id: Conversation ID
            user_id: User ID for authorization
            update_data: Update data
            
        Returns:
            Updated conversation if found, None otherwise
        """
        conversation = await ConversationService.get_conversation(
            db, conversation_id, user_id
        )
        if not conversation:
            return None

        if update_data.title is not None:
            conversation.title = update_data.title
        if update_data.is_active is not None:
            conversation.is_active = update_data.is_active
        if update_data.metadata is not None:
            conversation.meta_data = update_data.metadata

        await db.commit()
        await db.refresh(conversation)
        return conversation

    @staticmethod
    async def delete_conversation(
        db: AsyncSession, conversation_id: int, user_id: int
    ) -> bool:
        """
        Delete a conversation.
        
        Args:
            db: Database session
            conversation_id: Conversation ID
            user_id: User ID for authorization
            
        Returns:
            True if deleted, False otherwise
        """
        conversation = await ConversationService.get_conversation(
            db, conversation_id, user_id
        )
        if not conversation:
            return False

        await db.delete(conversation)
        await db.commit()
        logger.info(f"Deleted conversation {conversation_id} for user {user_id}")
        return True

    @staticmethod
    async def get_or_create_conversation(
        db: AsyncSession, user_id: int, conversation_id: Optional[int] = None
    ) -> Conversation:
        """
        Get existing conversation or create a new one.
        
        Args:
            db: Database session
            user_id: User ID
            conversation_id: Optional conversation ID to get
            
        Returns:
            Conversation instance
        """
        if conversation_id:
            conversation = await ConversationService.get_conversation(
                db, conversation_id, user_id
            )
            if conversation:
                return conversation

        # Create new conversation
        return await ConversationService.create_conversation(db, user_id)


class MessageService:
    """Service for managing messages"""

    @staticmethod
    async def create_message(
        db: AsyncSession,
        conversation_id: int,
        role: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None,
        is_complete: bool = True,
    ) -> Message:
        """
        Create a new message.
        
        Args:
            db: Database session
            conversation_id: Conversation ID
            role: Message role ('user' or 'assistant')
            content: Message content
            metadata: Optional message metadata
            is_complete: Whether message is complete (for streaming)
            
        Returns:
            Created message
        """
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            meta_data=metadata or {},
            is_complete=is_complete,
        )
        db.add(message)
        await db.commit()
        await db.refresh(message)
        logger.debug(f"Created message {message.id} in conversation {conversation_id}")
        return message

    @staticmethod
    async def update_message(
        db: AsyncSession,
        message_id: int,
        content: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        is_complete: Optional[bool] = None,
    ) -> Optional[Message]:
        """
        Update an existing message (useful for streaming updates).
        
        Args:
            db: Database session
            message_id: Message ID
            content: Optional new content
            metadata: Optional new metadata
            is_complete: Optional completion status
            
        Returns:
            Updated message if found, None otherwise
        """
        stmt = select(Message).where(Message.id == message_id)
        result = await db.execute(stmt)
        message = result.scalar_one_or_none()
        
        if not message:
            return None

        if content is not None:
            message.content = content
        if metadata is not None:
            # Merge metadata instead of replacing
            if message.meta_data:
                message.meta_data.update(metadata)
            else:
                message.meta_data = metadata
            # Explicitly mark JSON field as modified for SQLAlchemy
            from sqlalchemy.orm.attributes import flag_modified
            flag_modified(message, "meta_data")
        if is_complete is not None:
            message.is_complete = is_complete

        await db.commit()
        await db.refresh(message)
        return message

    @staticmethod
    async def get_conversation_messages(
        db: AsyncSession,
        conversation_id: int,
        limit: Optional[int] = None,
    ) -> List[Message]:
        """
        Get all messages for a conversation.
        
        Args:
            db: Database session
            conversation_id: Conversation ID
            limit: Optional limit on number of messages
            
        Returns:
            List of messages ordered by creation time
        """
        stmt = select(Message).where(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at)
        
        if limit:
            stmt = stmt.limit(limit)
        
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def format_messages_for_agent(
        db: AsyncSession, conversation_id: int
    ) -> List[Dict[str, Any]]:
        """
        Format messages for agent consumption.
        This is the only way agent reads history - from database.
        
        Args:
            db: Database session
            conversation_id: Conversation ID
            
        Returns:
            List of formatted messages for agent
        """
        messages = await MessageService.get_conversation_messages(db, conversation_id)
        # Filter out incomplete messages (streaming messages that haven't finished)
        # Only include complete messages in history
        formatted = [
            {
                "role": msg.role,
                "content": msg.content,
            }
            for msg in messages
            if msg.is_complete  # Only include complete messages
        ]
        logger.debug(
            f"Formatted {len(formatted)} complete messages out of {len(messages)} total "
            f"for conversation {conversation_id}"
        )
        return formatted

