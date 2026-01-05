"""
Chat Orchestration service for managing conversation flows.
This service coordinates between API requests, Agent modules, and other services.

Key principles:
- Conversation / Message are first-class business entities
- Agent is stateless, PostgreSQL has state
- Streaming generation ≠ streaming database writes
- Frontend never writes directly to database
- LangChain only reads history, never writes history
"""

from typing import Dict, Any, Optional, List, AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.agent import VisualAgent
from app.agent.models import AgentResponse, VisualToolRequest, VisualAnalysisResponse
from app.services.conversation import ConversationService, MessageService
from app.schemas.conversation import ConversationUpdate

logger = get_logger("chat_orchestrator")


class ChatOrchestrator:
    """
    Chat Orchestrator for managing conversation flows.

    This orchestrator:
    1. Manages conversation state
    2. Coordinates with Agent modules
    3. Handles visualization generation
    4. Manages streaming responses
    """

    def __init__(self):
        """Initialize the chat orchestrator"""
        # Agent will be initialized per conversation with its LLM config
        self.agent = None
        logger.info("Chat Orchestrator initialized")

    def _get_agent(self, llm_config: Optional[Dict[str, Any]] = None) -> VisualAgent:
        """Get or create agent instance with LLM configuration"""
        # For now, create a new agent instance with config
        # In the future, we could cache agents per config
        return VisualAgent(llm_config=llm_config)

    async def process_message(
        self,
        db: AsyncSession,
        user_message: str,
        conversation_id: Optional[int] = None,
        user_id: int = 1,
    ) -> AgentResponse:
        """
        Process a user message through the agent.

        Key principle: User message is saved AFTER understanding (not before).
        Agent reads history from database (not from API parameter).

        Args:
            db: Database session
            user_message: User's input message
            conversation_id: Optional conversation ID (creates new if None)
            user_id: User ID for context

        Returns:
            AgentResponse with agent's reply
        """
        try:
            # Step 1: Get or create conversation
            # If creating new conversation, generate title from first message
            is_new_conversation = conversation_id is None
            conversation = await ConversationService.get_or_create_conversation(
                db, user_id, conversation_id
            )

            # Get LLM config from conversation metadata
            llm_config = (
                conversation.meta_data.get("llm_config")
                if conversation.meta_data
                else None
            )

            # Remove api_key from config if present (will be read from settings)
            if llm_config and "api_key" in llm_config:
                llm_config = {k: v for k, v in llm_config.items() if k != "api_key"}

            # Initialize agent with LLM config
            agent = self._get_agent(llm_config)

            # Generate title for new conversation based on first user message
            if is_new_conversation and conversation.title == "New Conversation":
                try:
                    title = await agent.generate_conversation_title(user_message)
                    if title and title != "New Conversation":
                        await ConversationService.update_conversation(
                            db=db,
                            conversation_id=conversation.id,
                            user_id=user_id,
                            update_data=ConversationUpdate(title=title),
                        )
                        # Refresh conversation to get updated title
                        conversation = await ConversationService.get_conversation(
                            db, conversation.id, user_id
                        )
                except Exception as e:
                    logger.error(
                        f"Error generating conversation title: {e}", exc_info=True
                    )
                    # Continue without updating title

            # Step 2: Read conversation history from database (Agent only reads)
            conversation_history = await MessageService.format_messages_for_agent(
                db, conversation.id
            )

            # Step 3: Process message through agent (Agent is stateless)
            response = await agent.process_message(
                user_message=user_message, conversation_history=conversation_history
            )

            # Step 4: Save user message AFTER understanding (not before)
            await MessageService.create_message(
                db=db,
                conversation_id=conversation.id,
                role="user",
                content=user_message,
            )

            # Step 5: Save agent response (complete message, not streaming)
            await MessageService.create_message(
                db=db,
                conversation_id=conversation.id,
                role="assistant",
                content=response.message,
                metadata={
                    "needs_info": response.needs_info,
                    "missing_params": response.missing_params,
                    "suggestions": response.suggestions,
                    "visual_request": (
                        response.visual_request.dict()
                        if response.visual_request
                        else None
                    ),
                    "show_example": response.show_example,
                },
            )

            return response
        except Exception as e:
            logger.error(f"Error in chat orchestrator: {e}", exc_info=True)
            return AgentResponse(
                message=f"Sorry, I encountered an error: {str(e)}. Please try again.",
                needs_info=True,
            )

    async def generate_visualization(
        self,
        visual_request: VisualToolRequest,
        user_id: int,
        llm_config: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Generate visualization through the agent.

        Args:
            visual_request: Visual tool request
            user_id: User ID for storing results
            llm_config: Optional LLM configuration

        Returns:
            Dict with visualization result
        """
        try:
            agent = self._get_agent(llm_config)
            result = await agent.generate_visualization(
                visual_request=visual_request, user_id=user_id
            )
            return result
        except Exception as e:
            logger.error(f"Error generating visualization: {e}", exc_info=True)
            return {
                "success": False,
                "message": f"Failed to generate visualization: {str(e)}",
                "image_url": None,
            }

    async def analyze_visualization(
        self,
        chart_type: str,
        params: Dict[str, Any],
        user_request: str,
        llm_config: Optional[Dict[str, Any]] = None,
    ) -> VisualAnalysisResponse:
        """
        Analyze visualization through the agent.

        Args:
            chart_type: Type of chart
            params: Chart parameters
            user_request: Original user request
            llm_config: Optional LLM configuration

        Returns:
            VisualAnalysisResponse with analysis
        """
        try:
            agent = self._get_agent(llm_config)
            analysis = await agent.analyze_visualization(
                chart_type=chart_type, params=params, user_request=user_request
            )
            return analysis
        except Exception as e:
            logger.error(f"Error analyzing visualization: {e}", exc_info=True)
            return VisualAnalysisResponse(
                analysis="Visualization generated successfully. Please review the plot.",
                insights=[],
                recommendations=["Consider pathway enrichment analysis."],
                possible_analyses=["Pathway enrichment", "GSEA", "Network analysis"],
            )

    async def process_stream(
        self,
        db: AsyncSession,
        user_message: str,
        conversation_id: Optional[int] = None,
        user_id: int = 1,
        files: Optional[List[Dict[str, Any]]] = None,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Process message with streaming response.

        Key principle: Streaming generation ≠ streaming database writes.
        - User message saved AFTER understanding
        - Agent message saved AFTER streaming completes (not per chunk)

        Yields events of different types:
        - "message": Agent's text response
        - "generating": Visualization generation in progress
        - "visualization": Visualization result
        - "analyzing": Analysis in progress
        - "analysis": Analysis result

        Args:
            db: Database session
            user_message: User's input message
            conversation_id: Optional conversation ID (creates new if None)
            user_id: User ID for context

        Yields:
            Dict with event type and data
        """
        conversation = None
        assistant_message_id = None
        full_message_content = ""
        final_metadata = {}

        try:
            # Step 1: Get or create conversation
            # If creating new conversation, generate title from first message
            is_new_conversation = conversation_id is None
            conversation = await ConversationService.get_or_create_conversation(
                db, user_id, conversation_id
            )

            # Get LLM config from conversation metadata
            llm_config = (
                conversation.meta_data.get("llm_config")
                if conversation.meta_data
                else None
            )

            # Remove api_key from config if present (will be read from settings)
            if llm_config and "api_key" in llm_config:
                llm_config = {k: v for k, v in llm_config.items() if k != "api_key"}

            # Initialize agent with LLM config
            agent = self._get_agent(llm_config)

            # Generate title for new conversation based on first user message
            if is_new_conversation and conversation.title == "New Conversation":
                try:
                    title = await agent.generate_conversation_title(user_message)
                    if title and title != "New Conversation":
                        await ConversationService.update_conversation(
                            db=db,
                            conversation_id=conversation.id,
                            user_id=user_id,
                            update_data=ConversationUpdate(title=title),
                        )
                        # Refresh conversation to get updated title
                        conversation = await ConversationService.get_conversation(
                            db, conversation.id, user_id
                        )
                except Exception as e:
                    logger.error(
                        f"Error generating conversation title: {e}", exc_info=True
                    )
                    # Continue without updating title

            # Step 2: Read conversation history from database (Agent only reads)
            conversation_history = await MessageService.format_messages_for_agent(
                db, conversation.id
            )
            logger.debug(
                f"Loaded {len(conversation_history)} messages from conversation {conversation.id} "
                f"for streaming processing"
            )

            # Step 3: Process message through agent (Agent is stateless)
            # Include file information in user message if files are provided
            enhanced_user_message = user_message
            if files:
                file_names = [f.get("filename", "unknown") for f in files]
                if file_names:
                    enhanced_user_message = (
                        f"{user_message}\n\n[已上传文件: {', '.join(file_names)}]"
                    )

            # Step 3.5: Process message with streaming
            # Stream the agent's response
            full_message_content = ""
            final_response = None

            async for chunk in agent.process_message_stream(
                user_message=enhanced_user_message,
                conversation_history=conversation_history,
            ):
                if chunk.get("type") == "message":
                    full_message_content = chunk.get("content", "")
                    # Yield incremental updates
                    yield {
                        "type": "message",
                        "content": full_message_content,
                        "needs_info": chunk.get("needs_info", False),
                        "missing_params": chunk.get("missing_params", []),
                        "suggestions": chunk.get("suggestions", []),
                    }
                    # Store final response metadata
                    if chunk.get("visual_request") or chunk.get("show_example"):
                        final_response = chunk
                elif chunk.get("type") == "error":
                    yield chunk
                    return

            # Convert final response to AgentResponse format for saving
            if final_response:
                from app.agent.models import AgentResponse, VisualToolRequest

                visual_request = None
                if final_response.get("visual_request"):
                    try:
                        visual_request = VisualToolRequest(
                            **final_response["visual_request"]
                        )
                    except Exception as e:
                        logger.error(f"Failed to parse visual_request: {e}")

                response = AgentResponse(
                    message=full_message_content,
                    needs_info=final_response.get("needs_info", True),
                    missing_params=final_response.get("missing_params", []),
                    visual_request=visual_request,
                    suggestions=final_response.get("suggestions", []),
                    show_example=final_response.get("show_example"),
                )
            else:
                # Fallback: create response from streamed content
                from app.agent.models import AgentResponse

                response = AgentResponse(
                    message=full_message_content,
                    needs_info=True,
                )

            # Step 4: Save user message AFTER understanding (not before)
            # Include file information in metadata (with file paths from server)
            file_metadata = []
            if files:
                for file_info in files:
                    file_metadata.append(
                        {
                            "filename": file_info.get("filename"),
                            "size": file_info.get("size"),
                            "content_type": file_info.get("content_type"),
                            "file_url": file_info.get(
                                "file_url"
                            ),  # Server path for file access
                            "file_path": file_info.get("file_path"),  # Server file path
                            "relative_path": file_info.get(
                                "relative_path"
                            ),  # Relative path
                        }
                    )

            await MessageService.create_message(
                db=db,
                conversation_id=conversation.id,
                role="user",
                content=user_message,
                metadata={
                    "files": file_metadata if file_metadata else None,
                },
            )

            # Step 5: Create assistant message placeholder (will be updated when complete)
            full_message_content = response.message
            assistant_message = await MessageService.create_message(
                db=db,
                conversation_id=conversation.id,
                role="assistant",
                content=full_message_content,
                metadata={
                    "needs_info": response.needs_info,
                    "missing_params": response.missing_params,
                    "suggestions": response.suggestions,
                },
                is_complete=False,  # Mark as incomplete during streaming
            )
            assistant_message_id = assistant_message.id

            # Yield initial response
            yield {
                "type": "message",
                "content": response.message,
                "needs_info": response.needs_info,
                "missing_params": response.missing_params,
                "suggestions": response.suggestions,
            }

            # Step 6: If user wants to see an example
            if response.show_example:
                yield {"type": "generating", "content": "正在生成示例图表..."}

                # Get tool info to load sample data and config
                from app.services.visual import VisualService

                tool_info = VisualService.get_tool_info(response.show_example)

                if tool_info:
                    # Load sample data
                    sample_data = VisualService.get_sample_data(response.show_example)

                    # Create visual request with sample data and default config
                    visual_request = VisualToolRequest(
                        chart_type=response.show_example,
                        engine="r",
                        data=(
                            sample_data[:100] if sample_data else []
                        ),  # Limit to first 100 rows
                        params={
                            "ggplot2": tool_info.ggplot2 if tool_info.ggplot2 else {},
                            "heatmap": tool_info.heatmap if tool_info.heatmap else {},
                        },
                        reasoning=f"Showing example for {tool_info.name}",
                    )

                    # Generate visualization with sample data
                    viz_result = await agent.generate_visualization(
                        visual_request, user_id
                    )

                    # Update metadata
                    final_metadata.update(
                        {
                            "show_example": response.show_example,
                            "sample_data": (
                                sample_data[:10] if sample_data else []
                            ),  # First 10 rows for display
                        }
                    )

                    if viz_result.get("success"):
                        yield {
                            "type": "visualization",
                            "image_url": viz_result.get("image_url"),
                            "pdf_url": viz_result.get("pdf_url"),
                            "sample_data": (
                                sample_data[:10] if sample_data else []
                            ),  # First 10 rows
                        }
                    else:
                        yield {
                            "type": "error",
                            "content": f"生成示例图表失败: {viz_result.get('message', 'Unknown error')}",
                        }
                else:
                    yield {
                        "type": "error",
                        "content": f"未找到工具: {response.show_example}",
                    }

            # Step 7: If ready to generate visualization
            elif response.visual_request and not response.needs_info:
                yield {"type": "generating", "content": "正在生成可视化图表..."}

                # Generate visualization
                viz_result = await agent.generate_visualization(
                    response.visual_request, user_id
                )

                # Update metadata with visualization info
                final_metadata.update(
                    {
                        "visual_request": (
                            response.visual_request.dict()
                            if response.visual_request
                            else None
                        ),
                        "visualization": {
                            "success": viz_result["success"],
                            "image_url": viz_result.get("image_url"),
                            "pdf_url": viz_result.get("pdf_url"),
                            "data_url": viz_result.get("data_url"),
                        },
                    }
                )

                yield {
                    "type": "visualization",
                    "success": viz_result["success"],
                    "image_url": viz_result.get("image_url"),
                    "pdf_url": viz_result.get("pdf_url"),
                    "data_url": viz_result.get("data_url"),
                    "message": viz_result.get("message"),
                    "retry_count": viz_result.get("retry_count", 0),
                }

                # If failed after retries, provide error information
                if not viz_result["success"] and viz_result.get("error_details"):
                    yield {
                        "type": "error",
                        "content": f"生成图表失败: {viz_result.get('message', 'Unknown error')}",
                        "error_details": viz_result.get("error_details"),
                        "retry_count": viz_result.get("retry_count", 0),
                    }

                # Step 7: If successful, analyze the result
                if viz_result["success"]:
                    yield {"type": "analyzing", "content": "正在分析结果..."}

                    analysis = await agent.analyze_visualization(
                        response.visual_request.chart_type,
                        {
                            "data": response.visual_request.data,
                            **response.visual_request.params,
                        },
                        user_message,
                    )

                    # Update metadata with analysis
                    final_metadata.update(
                        {
                            "analysis": {
                                "analysis": analysis.analysis,
                                "insights": analysis.insights,
                                "recommendations": analysis.recommendations,
                                "possible_analyses": analysis.possible_analyses,
                            }
                        }
                    )

                    yield {
                        "type": "analysis",
                        "analysis": analysis.analysis,
                        "insights": analysis.insights,
                        "recommendations": analysis.recommendations,
                        "possible_analyses": analysis.possible_analyses,
                    }

            # Step 8: Update assistant message as complete AFTER streaming finishes
            # This is the key: streaming generation ≠ streaming database writes
            if assistant_message_id:
                await MessageService.update_message(
                    db=db,
                    message_id=assistant_message_id,
                    metadata=final_metadata,
                    is_complete=True,  # Mark as complete
                )

        except Exception as e:
            logger.error(f"Error in stream processing: {e}", exc_info=True)

            # Save error message if we have a conversation
            if conversation and assistant_message_id:
                await MessageService.update_message(
                    db=db,
                    message_id=assistant_message_id,
                    content=full_message_content or f"Error: {str(e)}",
                    metadata={**final_metadata, "error": str(e)},
                    is_complete=True,
                )

            yield {
                "type": "error",
                "content": f"Sorry, I encountered an error: {str(e)}. Please try again.",
            }
