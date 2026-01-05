"""
Core Agent implementation for visual tool generation.
This module provides the VisualAgent class that handles LLM-based conversation and visualization.
"""

import json
import os
from typing import Dict, Any, Optional, List, AsyncGenerator

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

from app.core.config import settings
from app.core.logging import get_logger
from app.services.visual import VisualService
from app.agent.models import (
    VisualToolRequest,
    AgentResponse,
    VisualAnalysisResponse,
)
from app.agent.rag import VisualRAG
from app.agent.prompts import JSON_GENERATION_PROMPT
from app.agent.error_recovery import ErrorRecoveryAgent

logger = get_logger("visual_agent")


class VisualAgent:
    """
    Visual Agent for understanding user requirements and generating visualizations.

    This agent uses LLM to:
    1. Understand user's visualization requirements
    2. Extract and structure parameters
    3. Generate visualizations via VisualService
    4. Analyze results and provide insights
    """

    def __init__(self, llm_config: Optional[Dict[str, Any]] = None):
        """
        Initialize the visual agent

        Args:
            llm_config: Optional LLM configuration dict with keys:
                - source: LLM source (OpenAI, Anthropic, Custom, etc.)
                - model: Model name
                - base_url: Base URL for custom models
                - api_key: API key
                - temperature: Temperature setting
                - max_tokens: Maximum tokens
        """
        from app.utils.llm_factory import get_llm, get_default_llm_config

        # Use provided config or default
        if llm_config:
            config = llm_config
        else:
            config = get_default_llm_config()
        # Initialize LLM
        self.llm = get_llm(
            model=config.get("model"),
            temperature=config.get("temperature", 0.7),
            source=config.get("source"),
            base_url=config.get("base_url"),
            api_key=config.get("api_key"),
            max_tokens=config.get("max_tokens", 4000),
        )

        if self.llm:
            logger.info(
                f"Visual Agent LLM initialized: {config.get('model')} ({config.get('source')})"
            )
        else:
            logger.warning("No LLM initialized. Agent functionality will be limited.")

        # Load available visual tools
        self.visual_tools = VisualService.list_tools()

        # Initialize RAG system for knowledge retrieval
        # Pass scripts_root to load utility R scripts
        self.rag = VisualRAG(scripts_root=settings.scripts_root)
        try:
            # Only build index if embedding model is available
            if self.rag.embed_model:
                self.rag.build_index()
                logger.info("RAG index built successfully")
            else:
                logger.info(
                    "RAG index not built: No embedding model available. "
                    "Agent will work without RAG knowledge retrieval."
                )
        except Exception as e:
            logger.warning(
                f"Failed to build RAG index: {e}. Agent will work without RAG."
            )
            # Don't set rag to None, keep it but with limited functionality
            # RAG will gracefully degrade if not available

        # Initialize error recovery agent
        self.error_recovery = ErrorRecoveryAgent(self.llm) if self.llm else None

        self._setup_prompts()  # This sets up all prompts including title_prompt

    def _setup_prompts(self):
        """Setup prompt templates for LLM interactions"""
        # Get visual tools information
        tools_info = []
        for tool in self.visual_tools:
            tools_info.append(f"- {tool.tool}: {tool.name} - {tool.description}")
        tools_info_str = "\n".join(tools_info)

        # System prompt for understanding user requirements
        # Use string replacement to avoid format() escaping issues with JSON examples
        understanding_prompt_template = """You are a knowledgeable bioinformatics visualization and data analysis assistant. Your role is to help users with visualization tasks and answer questions about data analysis, visualization techniques, and bioinformatics concepts.

## Important Guidelines

1. **Be Natural and Conversational**: Respond directly to the user's question or request. Do NOT start with generic introductions like "Hello! I'm your assistant..." unless it's the very first message in the conversation. Instead, jump straight into answering their question or helping with their task.

2. **Use Conversation History**: Reference previous messages in the conversation to provide context-aware responses. If the user is continuing a previous discussion, acknowledge that context naturally.

3. **Avoid Repetitive Introductions**: Do NOT repeat your capabilities or list what you can do unless the user explicitly asks. Focus on the specific question or task at hand.

## Understanding User Intent

When a user asks a question, first determine their intent:

### Knowledge Questions (Answer directly, NO visual_request needed):
- Questions starting with "what", "how", "why", "when", "which", "explain", "tell me about"
- Questions about concepts, methods, best practices, or comparisons
- Questions like: "What is a volcano plot?", "How do I interpret a heatmap?", "Which chart is best for...?"
- Questions about data analysis workflows or bioinformatics concepts
- Questions about visualization parameters, aesthetics, or design choices

For knowledge questions, respond directly and helpfully. Answer the question first, then optionally offer to help with related tasks. Do NOT generate a visual_request.

### Visualization Requests (Generate JSON configuration):
- Direct requests to create plots: "create a volcano plot", "draw a heatmap", "make a scatter plot"
- Requests with data: "plot this data", "visualize my results"
- Requests to modify existing plots: "change the colors", "add labels"

For visualization requests, follow the JSON generation process below.

Available visualization tools:
{TOOLS_INFO_PLACEHOLDER}

{KNOWLEDGE_BASE_PLACEHOLDER}

{JSON_GENERATION_GUIDE}

Common chart types and their use cases:
- scatter/volcano: For differential expression analysis, showing log2FC vs -log10(p-value)
- scatter/basic: Basic scatter plots for correlation analysis
- heatmap/cluster_basic: Heatmaps with clustering for gene expression patterns
- heatmap/basic: Basic heatmaps without clustering
- bar/basic: Bar charts for comparisons
- boxplot/basic: Box plots for distribution comparisons
- line/basic: Line charts for time series or trends

## Response Format

Return a JSON object with:
- message: Your friendly, helpful response to the user
- needs_info: true if you need more information for visualization, false otherwise
- missing_params: list of missing parameter names (only for visualization requests)
- visual_request: ONLY include this if the user wants to create/modify a visualization. Include:
  - chart_type: e.g., "scatter/volcano" or "heatmap/cluster_basic"
  - engine: "r" or "python" (default: "r")
  - data: array of data objects (if provided)
  - params: Complete JSON configuration object (ggplot2 or heatmap structure)
  - reasoning: why you chose this chart type and configuration
- show_example: Tool name if user wants to see an example (e.g., "scatter/volcano")
- suggestions: list of helpful suggestions or follow-up questions

IMPORTANT: 
- For knowledge questions, set visual_request to null
- For visualization requests, the "params" field should contain the complete JSON configuration structure:
  - For ggplot2 plots: {{"ggplot2": {{"mapping": {{...}}, "layers": [...], "scales": [...], ...}}}}
  - For heatmap plots: {{"heatmap": {{"transform": {{...}}, "heatmap": [...], "draw": {{...}}}}}}

Example response for knowledge question (be direct, no introduction):
{{
    "message": "A volcano plot visualizes differential expression analysis results by plotting log2 fold change (log2FC) on the x-axis and -log10(p-value) on the y-axis. Points in the upper corners represent genes with both significant fold changes and statistical significance, helping identify biologically and statistically important genes. The plot typically uses color coding to highlight different significance groups (e.g., upregulated, downregulated, not significant). Would you like me to create one for your data?",
    "needs_info": false,
    "missing_params": [],
    "visual_request": null,
    "suggestions": ["I can create a volcano plot if you have differential expression data", "Heatmaps are also useful for showing expression patterns across samples"]
}}

Example response when ready to visualize (be direct, no introduction):
{{
    "message": "Creating a volcano plot for your differential expression analysis to identify significantly differentially expressed genes.",
    "needs_info": false,
    "missing_params": [],
    "visual_request": {{
        "chart_type": "scatter/volcano",
        "engine": "r",
        "data": [...],
        "params": {{
            "ggplot2": {{
                "mapping": {{
                    "x": "log2FC",
                    "y": "-log10(qvalue)",
                    "colour": "group",
                    "label": "symbol"
                }},
                "layers": [
                    {{
                        "type": "geom_point",
                        "mapping": {{"size": "abs(log2FC)"}},
                        "arguments": {{"alpha": 0.8, "stroke": 0}}
                    }},
                    {{
                        "type": "geom_text_repel",
                        "arguments": {{
                            "top": "log2FC",
                            "top.k": 10,
                            "show.legend": false
                        }}
                    }}
                ],
                "scales": [
                    {{
                        "type": "scale_colour_manual",
                        "arguments": {{
                            "values": ["#a3ad62", "grey70", "#df91a3"]
                        }}
                    }}
                ],
                "labs": {{
                    "type": "labs",
                    "arguments": {{
                        "title": "Volcano Plot",
                        "x": "log2FC",
                        "y": "-log10(p.adjust)"
                    }}
                }},
                "themes": [{{"type": "theme_prism"}}],
                "width": 800,
                "height": 600
            }}
        }},
        "reasoning": "Volcano plot is ideal for showing differential expression with log2FC and p-values"
    }},
    "suggestions": ["You can adjust the significance thresholds", "Consider adding gene labels"]
}}

Example response when needs info for visualization (be direct, no introduction):
{{
    "message": "To create a volcano plot, I need your differential expression data. Please provide: 1) log2FC values, 2) p-values or q-values, 3) gene symbols (optional). You can upload a CSV file or provide the data in JSON format.",
    "needs_info": true,
    "missing_params": ["data"],
    "visual_request": null,
    "suggestions": ["Upload a CSV file with your data", "Or provide data in JSON format", "I can show you an example first if you'd like"]
}}"""

        # Replace placeholders - RAG knowledge base will be injected at runtime
        understanding_prompt_text = (
            understanding_prompt_template.replace(
                "{TOOLS_INFO_PLACEHOLDER}", tools_info_str
            )
            .replace(
                "{KNOWLEDGE_BASE_PLACEHOLDER}",
                "{KNOWLEDGE_BASE}",  # Will be replaced with actual knowledge at runtime
            )
            .replace(
                "{JSON_GENERATION_GUIDE}",
                JSON_GENERATION_PROMPT,  # Add JSON generation guide
            )
        )

        self.understanding_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", understanding_prompt_text),
                (
                    "human",
                    "User request: {user_message}\n\nConversation history:\n{history}",
                ),
            ]
        )

        # System prompt for analyzing visualization results
        self.analysis_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are a bioinformatics expert. Analyze visualization results and provide insights.

Based on the visualization:
1. Describe what the plot shows
2. Identify key patterns or findings
3. Suggest next steps or follow-up analyses
4. Provide recommendations

Return a JSON object with:
- analysis: Detailed analysis of the visualization
- insights: List of key insights (3-5 items)
- recommendations: List of recommendations (3-5 items)
- possible_analyses: List of possible follow-up analyses (3-5 items)

Example:
{{
    "analysis": "This volcano plot shows differential gene expression...",
    "insights": [
        "1240 genes are significantly upregulated",
        "980 genes are significantly downregulated",
        "The fold changes range from -5 to 8"
    ],
    "recommendations": [
        "Consider pathway enrichment analysis for significant genes",
        "Validate top genes with qPCR",
        "Compare with published datasets"
    ],
    "possible_analyses": [
        "Pathway enrichment analysis (KEGG/GO)",
        "Gene set enrichment analysis (GSEA)",
        "Heatmap of top differentially expressed genes",
        "Network analysis of significant genes"
    ]
}}""",
                ),
                (
                    "human",
                    """Chart type: {chart_type}
Chart parameters: {params}
User's original request: {user_request}

Please analyze this visualization and provide insights.""",
                ),
            ]
        )

        # System prompt for generating conversation title
        self.title_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are a helpful assistant. Generate a concise, descriptive title for a conversation based on the user's first message.

The title should:
- Be 3-8 words long
- Capture the main topic or intent
- Be in the same language as the user's message
- Be clear and informative

Return only the title text, nothing else.""",
                ),
                ("human", "User's first message: {user_message}"),
            ]
        )

    def _format_history(self, messages: List[Dict[str, Any]]) -> str:
        """Format conversation history for prompt"""
        if not messages:
            logger.debug("No conversation history provided")
            return "No previous conversation."

        logger.debug(f"Formatting {len(messages)} messages for history (using last 10)")
        formatted = []
        # Use last 10 messages to avoid token overflow
        recent_messages = messages[-10:]
        for msg in recent_messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            # Truncate very long messages to avoid token overflow
            if len(content) > 500:
                content = content[:500] + "..."
            formatted.append(f"{role.capitalize()}: {content}")

        history_str = "\n".join(formatted)
        logger.debug(f"Formatted history length: {len(history_str)} characters")
        return history_str

    async def process_message(
        self,
        user_message: str,
        conversation_history: List[Dict[str, Any]] = None,
    ) -> AgentResponse:
        """
        Process a user message and return agent response.

        Args:
            user_message: User's input message
            conversation_history: Previous conversation messages

        Returns:
            AgentResponse with message, needs_info, and optional visual_request
        """
        if not self.llm:
            return AgentResponse(
                message="Sorry, the AI agent is not available. Please configure LLM API key.",
                needs_info=True,
                missing_params=["llm_config"],
            )

        conversation_history = conversation_history or []
        logger.debug(
            f"Processing message with {len(conversation_history)} history messages"
        )
        history_str = self._format_history(conversation_history)
        logger.debug(f"History string preview: {history_str[:200]}...")

        try:
            # Retrieve knowledge from RAG if available
            knowledge_base = ""
            if self.rag and self.rag.embed_model:
                try:
                    knowledge_base = self.rag.get_relevant_context(
                        user_message, max_results=3
                    )
                    if knowledge_base:
                        logger.debug(
                            f"Retrieved {len(knowledge_base)} characters of RAG context for query: {user_message[:50]}..."
                        )
                except Exception as e:
                    logger.warning(
                        f"RAG retrieval failed: {e}. Continuing without RAG knowledge."
                    )
                    knowledge_base = ""

            # Use LLM to understand user requirements
            parser = JsonOutputParser(pydantic_object=AgentResponse)
            chain = self.understanding_prompt | self.llm | parser

            # Prepare prompt variables (include knowledge base)
            prompt_vars = {
                "user_message": user_message,
                "history": history_str,
                "KNOWLEDGE_BASE": knowledge_base,  # Inject RAG knowledge
            }

            result = await chain.ainvoke(prompt_vars)

            # Convert dict to AgentResponse
            if isinstance(result, dict):
                # Handle visual_request if present
                visual_request = None
                if result.get("visual_request"):
                    try:
                        visual_request = VisualToolRequest(**result["visual_request"])
                    except Exception as e:
                        logger.error(f"Failed to parse visual_request: {e}")
                        result["visual_request"] = None
                else:
                    result["visual_request"] = None

                # Ensure all required fields are present
                if "message" not in result:
                    result["message"] = "Processing your request..."

                return AgentResponse(
                    message=result.get("message", "Processing your request..."),
                    needs_info=result.get("needs_info", True),
                    missing_params=result.get("missing_params", []),
                    visual_request=visual_request,
                    suggestions=result.get("suggestions", []),
                    show_example=result.get("show_example"),
                )
            else:
                return AgentResponse(message=str(result), needs_info=True)

        except Exception as e:
            logger.error(f"Error processing message: {e}", exc_info=True)
            return AgentResponse(
                message=f"Sorry, I encountered an error: {str(e)}. Please try again.",
                needs_info=True,
            )

    async def process_message_stream(
        self,
        user_message: str,
        conversation_history: List[Dict[str, Any]] = None,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Process a user message with streaming response.

        Args:
            user_message: User's input message
            conversation_history: Previous conversation messages

        Yields:
            Dict with type and content for streaming
        """
        if not self.llm:
            yield {
                "type": "message",
                "content": "Sorry, the AI agent is not available. Please configure LLM API key.",
                "needs_info": True,
                "missing_params": ["llm_config"],
            }
            return

        conversation_history = conversation_history or []
        logger.debug(
            f"Processing message with {len(conversation_history)} history messages"
        )
        history_str = self._format_history(conversation_history)
        logger.debug(f"History string preview: {history_str[:200]}...")

        try:
            # Retrieve knowledge from RAG if available
            knowledge_base = ""
            if self.rag and self.rag.embed_model:
                try:
                    knowledge_base = self.rag.get_relevant_context(
                        user_message, max_results=3
                    )
                    logger.debug(
                        f"Retrieved {len(knowledge_base)} characters of knowledge from RAG"
                    )
                except Exception as e:
                    logger.warning(
                        f"RAG retrieval failed: {e}. Continuing without RAG knowledge."
                    )
                    knowledge_base = ""

            # Use LLM to understand user requirements with streaming
            # Create chain for streaming (without parser, we'll parse at the end)
            chain = self.understanding_prompt | self.llm

            # Prepare prompt variables (include knowledge base)
            prompt_vars = {
                "user_message": user_message,
                "history": history_str,
                "KNOWLEDGE_BASE": knowledge_base,  # Inject RAG knowledge
            }

            # Stream the LLM response
            full_content = ""
            message_text = ""  # Extract just the message field from JSON

            async for chunk in chain.astream(prompt_vars):
                if hasattr(chunk, "content"):
                    content = chunk.content
                    if content:
                        full_content += content

                        # Try to extract message field from partial JSON for streaming display
                        # This is a best-effort approach to show incremental text
                        try:
                            import json
                            import re

                            # Try to find message field in the accumulated content
                            message_match = re.search(
                                r'"message"\s*:\s*"([^"]*)"', full_content
                            )
                            if message_match:
                                message_text = message_match.group(1)
                            else:
                                # If no message field found yet, show accumulated content
                                message_text = full_content
                        except:
                            message_text = full_content

                        # Yield incremental content (just the message text for display)
                        yield {
                            "type": "message",
                            "content": message_text,
                            "needs_info": False,  # Will be updated after parsing
                        }

            # Parse the complete response
            parser = JsonOutputParser(pydantic_object=AgentResponse)
            try:
                result = parser.parse(full_content)
            except Exception as parse_error:
                logger.warning(
                    f"Failed to parse streaming response as JSON: {parse_error}"
                )
                # Try to extract JSON from the response
                import re

                json_match = re.search(r"\{.*\}", full_content, re.DOTALL)
                if json_match:
                    try:
                        result = parser.parse(json_match.group())
                    except:
                        result = {"message": full_content, "needs_info": True}
                else:
                    result = {"message": full_content, "needs_info": True}

            # Convert dict to AgentResponse format and yield final message
            if isinstance(result, dict):
                # Handle visual_request if present
                visual_request = None
                if result.get("visual_request"):
                    try:
                        visual_request = VisualToolRequest(**result["visual_request"])
                    except Exception as e:
                        logger.error(f"Failed to parse visual_request: {e}")
                        result["visual_request"] = None
                else:
                    result["visual_request"] = None

                # Ensure all required fields are present
                if "message" not in result:
                    result["message"] = full_content or "Processing your request..."

                # Yield final message with all metadata
                yield {
                    "type": "message",
                    "content": result.get("message", full_content),
                    "needs_info": result.get("needs_info", True),
                    "missing_params": result.get("missing_params", []),
                    "suggestions": result.get("suggestions", []),
                    "visual_request": (
                        result["visual_request"].dict()
                        if result.get("visual_request")
                        else None
                    ),
                    "show_example": result.get("show_example"),
                }
            else:
                yield {
                    "type": "message",
                    "content": str(result) if result else full_content,
                    "needs_info": True,
                }

        except Exception as e:
            logger.error(f"Error processing message stream: {e}", exc_info=True)
            yield {
                "type": "error",
                "content": f"Sorry, I encountered an error: {str(e)}. Please try again.",
            }

    async def generate_visualization(
        self,
        visual_request: VisualToolRequest,
        user_id: int,
        max_retries: int = 2,
        enable_error_recovery: bool = True,
    ) -> Dict[str, Any]:
        """
        Generate visualization based on request with error recovery.

        Args:
            visual_request: Visual tool request with chart type and parameters
            user_id: User ID for storing results
            max_retries: Maximum number of retry attempts
            enable_error_recovery: Whether to enable automatic error recovery

        Returns:
            Dict with success status, message, and URLs
        """
        last_error = None
        last_result = None

        for attempt in range(max_retries + 1):
            try:
                # Prepare parameters for visual service
                params = {
                    "chart_type": visual_request.chart_type,
                    "engine": visual_request.engine,
                    "data": visual_request.data or [],
                    **visual_request.params,
                }

                # Call visual service
                result = await VisualService.run_tool(
                    tool=visual_request.chart_type.replace("/", "_"),
                    params=params,
                    user_id=user_id,
                )

                # If successful, return result
                if result.success:
                    return {
                        "success": True,
                        "message": result.message,
                        "image_url": result.image_url,
                        "pdf_url": result.pdf_url,
                        "data_url": result.data_url,
                        "retry_count": attempt,
                    }

                # If failed and we have error details, try to recover
                if (
                    result.error_details
                    and result.data_info
                    and attempt < max_retries
                    and enable_error_recovery
                ):
                    logger.info(
                        f"Attempt {attempt + 1} failed, attempting error recovery..."
                    )

                    if self.error_recovery and enable_error_recovery:
                        # Analyze the error
                        error_analysis = await self.error_recovery.analyze_error(
                            error_details=result.error_details,
                            data_info=result.data_info,
                            original_config=visual_request.params,
                            original_request=visual_request,
                        )

                        logger.info(
                            f"Error analysis: {error_analysis.error_type} - {error_analysis.error_description}"
                        )

                        # Try to fix the request
                        if error_analysis.can_auto_fix:
                            fixed_request = await self.error_recovery.fix_request(
                                error_analysis=error_analysis,
                                original_request=visual_request,
                                data_info=result.data_info,
                            )

                            if fixed_request:
                                logger.info(
                                    f"Applied fixes: {fixed_request.fixes_applied}"
                                )
                                # Update visual_request with fixed version
                                visual_request = VisualToolRequest(
                                    chart_type=fixed_request.chart_type,
                                    engine=fixed_request.engine,
                                    data=fixed_request.data,
                                    params=fixed_request.params,
                                    reasoning=fixed_request.reasoning,
                                )
                                # Continue to next retry
                                last_error = error_analysis
                                last_result = result
                                continue

                    # If cannot auto-fix, break and return error
                    break
                else:
                    # No error details or max retries reached
                    break

            except Exception as e:
                logger.error(
                    f"Error generating visualization (attempt {attempt + 1}): {e}",
                    exc_info=True,
                )
                if attempt >= max_retries:
                    return {
                        "success": False,
                        "message": f"Failed to generate visualization after {max_retries + 1} attempts: {str(e)}",
                        "image_url": None,
                        "retry_count": attempt + 1,
                    }
                # Continue to next retry
                last_error = {"error_type": "exception", "error_message": str(e)}

        # All retries failed
        error_message = last_result.message if last_result else "Unknown error"
        if last_error:
            error_message += f" (Error type: {last_error.get('error_type', 'unknown')})"

        return {
            "success": False,
            "message": error_message,
            "image_url": None,
            "retry_count": max_retries + 1,
            "error_details": last_result.error_details if last_result else None,
        }

    async def analyze_visualization(
        self, chart_type: str, params: Dict[str, Any], user_request: str
    ) -> VisualAnalysisResponse:
        """
        Analyze visualization results and provide insights.

        Args:
            chart_type: Type of chart that was generated
            params: Parameters used for the chart
            user_request: Original user request

        Returns:
            VisualAnalysisResponse with analysis, insights, and recommendations
        """
        if not self.llm:
            return VisualAnalysisResponse(
                analysis="Visualization generated successfully.",
                insights=["Please review the plot manually."],
                recommendations=["Consider pathway enrichment analysis."],
                possible_analyses=["Pathway enrichment", "GSEA", "Network analysis"],
            )

        try:
            parser = JsonOutputParser(pydantic_object=VisualAnalysisResponse)
            chain = self.analysis_prompt | self.llm | parser

            result = await chain.ainvoke(
                {
                    "chart_type": chart_type,
                    "params": json.dumps(params, indent=2),
                    "user_request": user_request,
                }
            )

            if isinstance(result, dict):
                return VisualAnalysisResponse(**result)
            else:
                return VisualAnalysisResponse(
                    analysis=str(result),
                    insights=[],
                    recommendations=[],
                    possible_analyses=[],
                )

        except Exception as e:
            logger.error(f"Error analyzing visualization: {e}", exc_info=True)
            return VisualAnalysisResponse(
                analysis="Visualization generated successfully. Please review the plot.",
                insights=[],
                recommendations=["Consider pathway enrichment analysis."],
                possible_analyses=["Pathway enrichment", "GSEA", "Network analysis"],
            )

    async def generate_conversation_title(self, user_message: str) -> str:
        """
        Generate a conversation title based on the user's first message.

        Args:
            user_message: User's first message

        Returns:
            Generated title (defaults to "New Conversation" if LLM is unavailable)
        """
        if not self.llm:
            # Fallback: extract first few words from message
            words = user_message.strip().split()[:5]
            return " ".join(words) if words else "New Conversation"

        try:
            # Use LLM to generate title
            result = await self.llm.ainvoke(
                self.title_prompt.format_messages(user_message=user_message)
            )

            # Extract title from response
            title = result.content.strip()

            # Clean up title (remove quotes, limit length)
            title = title.strip("\"'")
            if len(title) > 50:
                title = title[:47] + "..."

            return title if title else "New Conversation"
        except Exception as e:
            logger.error(f"Error generating conversation title: {e}", exc_info=True)
            # Fallback: extract first few words from message
            words = user_message.strip().split()[:5]
            return " ".join(words) if words else "New Conversation"
