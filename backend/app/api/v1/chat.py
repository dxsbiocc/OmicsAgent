"""
Chat API endpoints for conversational interactions.
This API layer uses the Chat Orchestration layer to coordinate with Agent modules.
"""

from fastapi import APIRouter, Depends, HTTPException, Body, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import json

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.orchestration import ChatOrchestrator
from app.core.logging import get_logger
from sqlalchemy.ext.asyncio import AsyncSession

logger = get_logger("chat_api")

router = APIRouter(prefix="/chat", tags=["chat"])


# Request models
class ChatRequest(BaseModel):
    """Request model for chat endpoint"""

    message: str = Field(..., description="User's message")
    conversation_id: Optional[int] = Field(
        None, description="Conversation ID (creates new if not provided)"
    )


# Initialize chat orchestrator (singleton)
_chat_orchestrator: Optional[ChatOrchestrator] = None


def get_chat_orchestrator() -> ChatOrchestrator:
    """Get or create chat orchestrator instance"""
    global _chat_orchestrator
    if _chat_orchestrator is None:
        _chat_orchestrator = ChatOrchestrator()
    return _chat_orchestrator


@router.post("")
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Chat with the AI agent to generate visualizations.

    Note: Conversation history is read from database, not from request.
    User message is saved AFTER understanding, agent message is saved after completion.

    Args:
        message: User's message
        conversation_id: Optional conversation ID (creates new if not provided)
        current_user: Current authenticated user
        db: Database session

    Returns:
        Agent response with visualization request or information needs
    """
    try:
        orchestrator = get_chat_orchestrator()

        response = await orchestrator.process_message(
            db=db,
            user_message=request.message,
            conversation_id=request.conversation_id,
            user_id=current_user.id,
        )

        return {
            "message": response.message,
            "needs_info": response.needs_info,
            "missing_params": response.missing_params,
            "suggestions": response.suggestions,
            "visual_request": (
                response.visual_request.dict() if response.visual_request else None
            ),
            "show_example": response.show_example,
        }

    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error processing message: {str(e)}"
        )


@router.post("/stream")
async def chat_stream(
    message: str = Form(""),
    conversation_id: Optional[int] = Form(None),
    files: List[UploadFile] = File([]),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Chat with the AI agent with streaming response (Server-Sent Events).

    Key principle: Streaming generation ≠ streaming database writes.
    - User message saved AFTER understanding
    - Agent message saved AFTER streaming completes (not per chunk)

    Returns streaming JSON responses with different event types:
    - "message": Agent's text response
    - "generating": Visualization generation in progress
    - "visualization": Visualization result
    - "analyzing": Analysis in progress
    - "analysis": Analysis result
    - "error": Error occurred

    Args:
        message: User's message
        conversation_id: Optional conversation ID (creates new if not provided)
        files: Optional list of uploaded files
        current_user: Current authenticated user
        db: Database session
    """
    try:
        orchestrator = get_chat_orchestrator()

        # Process uploaded files - save to temporary storage
        file_info = []
        if files:
            import uuid
            from pathlib import Path
            from app.core.config import settings
            from aiofile import AIOFile

            # Create temporary directory for chat files
            temp_dir = settings.static_root / "chat_files" / str(current_user.id)
            temp_dir.mkdir(parents=True, exist_ok=True)

            for file in files:
                # Generate unique filename
                file_ext = Path(file.filename).suffix if file.filename else ""
                unique_filename = f"{uuid.uuid4()}{file_ext}"
                file_path = temp_dir / unique_filename

                # Save file to disk
                content = await file.read()
                async with AIOFile(file_path, "wb") as f:
                    await f.write(content)

                # Get relative path for URL
                relative_path = f"chat_files/{current_user.id}/{unique_filename}"
                file_url = f"/static/{relative_path}"

                file_info.append(
                    {
                        "filename": file.filename or "unknown",
                        "size": len(content),
                        "content_type": file.content_type,
                        "file_path": str(file_path),
                        "file_url": file_url,
                        "relative_path": relative_path,
                    }
                )
                await file.seek(0)  # Reset file pointer

        async def generate():
            async for chunk in orchestrator.process_stream(
                db=db,
                user_message=message,
                conversation_id=conversation_id,
                user_id=current_user.id,
                files=file_info,
            ):
                yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    except Exception as e:
        logger.error(f"Error in chat_stream endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error processing message: {str(e)}"
        )


@router.get("/tools")
async def list_available_tools():
    """
    List all available visualization tools.
    This endpoint provides information about tools that the agent can use.
    """
    try:
        from app.services.visual import VisualService

        tools = VisualService.list_tools()

        return {
            "tools": [
                {
                    "tool": tool.tool,
                    "name": tool.name,
                    "description": tool.description,
                    "category": tool.category,
                }
                for tool in tools
            ]
        }
    except Exception as e:
        logger.error(f"Error listing tools: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error listing tools: {str(e)}")


@router.get("/sample-data/{tool}")
async def get_sample_data(
    tool: str,
    current_user: User = Depends(get_current_active_user),
    limit: int = 10,
):
    """
    Get sample data for a visualization tool.

    Args:
        tool: Tool name (e.g., "scatter/volcano" or "scatter_volcano")
        limit: Maximum number of rows to return (default: 10)
        current_user: Current authenticated user

    Returns:
        Sample data as a list of records
    """
    try:
        from app.services.visual import VisualService

        sample_data = VisualService.get_sample_data(tool)

        if sample_data is None:
            raise HTTPException(
                status_code=404, detail=f"Sample data not found for tool: {tool}"
            )

        # Limit the number of rows
        limited_data = sample_data[:limit] if len(sample_data) > limit else sample_data

        return {
            "tool": tool,
            "total_rows": len(sample_data),
            "returned_rows": len(limited_data),
            "data": limited_data,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting sample data: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error getting sample data: {str(e)}"
        )
