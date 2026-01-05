"""
LLM Factory for creating language model instances.
Supports multiple LLM providers similar to Biomni's implementation.
"""

import os
from typing import Literal, Optional
from langchain_core.language_models.chat_models import BaseChatModel

from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger("llm_factory")

SourceType = Literal[
    "OpenAI",
    "Anthropic",
    "Ollama",
    "Gemini",
    "Qwen",
    "DeepSeek",
    "Custom",
]
ALLOWED_SOURCES: set[str] = {
    "OpenAI",
    "Anthropic",
    "Ollama",
    "Gemini",
    "Qwen",
    "DeepSeek",
    "Custom",
}


def get_llm(
    model: Optional[str] = None,
    temperature: float = 0.7,
    source: Optional[SourceType] = None,
    base_url: Optional[str] = None,
    api_key: Optional[str] = None,
    max_tokens: Optional[int] = None,
) -> Optional[BaseChatModel]:
    """
    Get a language model instance based on the specified parameters.

    Args:
        model: The model name to use
        temperature: Temperature setting for generation (default: 0.7)
        source: Source provider (OpenAI, Anthropic, Custom, etc.)
        base_url: Base URL for custom model serving
        api_key: API key for the LLM
        max_tokens: Maximum tokens for generation

    Returns:
        BaseChatModel instance or None if initialization fails
    """
    print(
        f"model: {model}, temperature: {temperature}, source: {source}, base_url: {base_url}, api_key: {api_key}, max_tokens: {max_tokens}"
    )
    # Use defaults if not specified
    if model is None:
        model = "deepseek-chat"
        # If model is defaulted to deepseek-chat, also default source to DeepSeek
        if source is None:
            source = "DeepSeek"
    if api_key is None:
        # Try to get API key from settings based on source
        if source == "DeepSeek":
            api_key = (
                settings.deepseek_api_key
                or settings.siliconflow_api_key
                or settings.openai_api_key
                or ""
            )
        elif source == "Qwen":
            api_key = (
                settings.qwen_api_key
                or settings.siliconflow_api_key
                or settings.openai_api_key
                or ""
            )
        elif source == "OpenAI":
            api_key = settings.openai_api_key or ""
        elif source == "Anthropic":
            api_key = settings.anthropic_api_key or ""
        elif source == "Groq":
            api_key = settings.groq_api_key or ""
        elif source == "Gemini":
            api_key = settings.gemini_api_key or ""
        else:
            # For Custom and other sources, try common API keys
            api_key = settings.siliconflow_api_key or settings.openai_api_key or ""

        if not api_key:
            api_key = "EMPTY"

    if base_url is None:
        # Try to get base URL from settings based on source
        if source == "DeepSeek":
            base_url = settings.deepseek_base_url
        elif source == "Qwen":
            base_url = settings.qwen_base_url
        else:
            base_url = settings.llm_base_url

    # Auto-detect source from model name if not specified
    if source is None:
        env_source = os.getenv("LLM_SOURCE")
        if env_source in ALLOWED_SOURCES:
            source = env_source
        else:
            # Check model name patterns (order matters - more specific first)
            if "deepseek" in model.lower() or model.startswith("deepseek-ai/"):
                source = "DeepSeek"
            elif model[:7] == "claude-":
                source = "Anthropic"
            elif model[:7] == "gpt-oss":
                source = "Ollama"
            elif model[:4] == "gpt-":
                source = "OpenAI"
            elif model.startswith("azure-"):
                source = "AzureOpenAI"
            elif model[:7] == "gemini-":
                source = "Gemini"
            elif "groq" in model.lower():
                source = "Groq"
            elif "qwen" in model.lower() or model.startswith("Qwen/"):
                source = "Qwen"
            elif base_url and base_url != "https://api.siliconflow.cn/v1/":
                source = "Custom"
            elif "/" in model or any(
                name in model.lower()
                for name in [
                    "llama",
                    "mistral",
                    "gemma",
                    "phi",
                    "dolphin",
                    "orca",
                    "vicuna",
                ]
            ):
                source = "Custom"  # Default to Custom for SiliconFlow and similar
            else:
                # Default to DeepSeek if no pattern matches
                source = "DeepSeek"

    # Create appropriate model based on source
    try:
        if source == "OpenAI":
            from langchain_openai import ChatOpenAI

            openai_api_key = api_key if api_key != "EMPTY" else settings.openai_api_key
            return ChatOpenAI(
                model=model,
                temperature=temperature,
                api_key=openai_api_key,
                max_tokens=max_tokens or 4000,
            )

        elif source == "Anthropic":
            from langchain_anthropic import ChatAnthropic

            anthropic_api_key = (
                api_key if api_key != "EMPTY" else settings.anthropic_api_key
            )
            return ChatAnthropic(
                model=model,
                temperature=temperature,
                max_tokens=max_tokens or 8192,
                api_key=anthropic_api_key,
            )

        elif source == "Gemini":
            from langchain_openai import ChatOpenAI

            gemini_api_key = api_key if api_key != "EMPTY" else settings.gemini_api_key
            return ChatOpenAI(
                model=model,
                temperature=temperature,
                api_key=gemini_api_key,
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            )

        elif source == "Ollama":
            from langchain_ollama import ChatOllama

            return ChatOllama(
                model=model,
                temperature=temperature,
            )

        elif source == "Qwen":
            from langchain_openai import ChatOpenAI

            # Qwen models are typically served via DashScope or similar services
            qwen_base_url = base_url or settings.qwen_base_url
            qwen_api_key = (
                api_key
                if api_key and api_key != "EMPTY"
                else (
                    settings.qwen_api_key
                    or settings.siliconflow_api_key
                    or settings.openai_api_key
                    or ""
                )
            )

            # Strip whitespace from API key
            if qwen_api_key:
                qwen_api_key = qwen_api_key.strip()

            # Validate API key is not empty
            if not qwen_api_key:
                logger.error(
                    "Qwen API key is missing. Please set QWEN_API_KEY, "
                    "SILICONFLOW_API_KEY, or OPENAI_API_KEY environment variable."
                )
                raise ValueError(
                    "Qwen API key is required. Please configure it in settings."
                )

            return ChatOpenAI(
                model=model,
                temperature=temperature,
                api_key=qwen_api_key,
                base_url=qwen_base_url,
                max_tokens=max_tokens or 8192,
            )

        elif source == "DeepSeek":
            from langchain_openai import ChatOpenAI

            # DeepSeek official API or via proxy services like SiliconFlow
            deepseek_base_url = base_url or settings.deepseek_base_url
            deepseek_api_key = (
                api_key
                if api_key and api_key != "EMPTY"
                else (
                    settings.deepseek_api_key
                    or settings.siliconflow_api_key
                    or settings.openai_api_key
                    or ""
                )
            )

            # Strip whitespace from API key
            if deepseek_api_key:
                deepseek_api_key = deepseek_api_key.strip()

            # Validate API key is not empty
            if not deepseek_api_key:
                logger.error(
                    "DeepSeek API key is missing. Please set DEEPSEEK_API_KEY, "
                    "SILICONFLOW_API_KEY, or OPENAI_API_KEY environment variable."
                )
                raise ValueError(
                    "DeepSeek API key is required. Please configure it in settings."
                )

            return ChatOpenAI(
                model=model,
                temperature=temperature,
                api_key=deepseek_api_key,
                base_url=deepseek_base_url,
                max_tokens=max_tokens or 8192,
            )

        elif source == "Custom":
            from langchain_openai import ChatOpenAI

            assert base_url is not None, "base_url must be provided for custom LLMs"
            custom_api_key = (
                api_key
                if api_key != "EMPTY"
                else (settings.siliconflow_api_key or settings.openai_api_key or "")
            )
            return ChatOpenAI(
                model=model,
                temperature=temperature,
                api_key=custom_api_key,
                base_url=base_url,
                max_tokens=max_tokens or 8192,
            )

        else:
            raise ValueError(f"Invalid source: {source}")

    except ImportError as e:
        logger.error(f"Failed to import required package: {e}")
        return None
    except Exception as e:
        logger.error(f"Failed to initialize LLM: {e}", exc_info=True)
        return None


def get_default_llm_config() -> dict:
    """Get default LLM configuration"""
    return {
        "source": "DeepSeek",
        "model": "deepseek-chat",
        "base_url": settings.deepseek_base_url,
        "api_key": settings.deepseek_api_key
        or settings.siliconflow_api_key
        or settings.openai_api_key
        or "",
        "temperature": 0.7,
        "max_tokens": 4000,
    }


def get_available_models(source: SourceType) -> list[dict]:
    """Get available models for a given source"""
    models = {
        "OpenAI": [
            {"value": "gpt-4o", "label": "GPT-4o"},
            {"value": "gpt-4-turbo", "label": "GPT-4 Turbo"},
            {"value": "gpt-4", "label": "GPT-4"},
            {"value": "gpt-3.5-turbo", "label": "GPT-3.5 Turbo"},
        ],
        "Anthropic": [
            {"value": "claude-3-5-sonnet-20241022", "label": "Claude 3.5 Sonnet"},
            {"value": "claude-3-opus-20240229", "label": "Claude 3 Opus"},
            {"value": "claude-3-sonnet-20240229", "label": "Claude 3 Sonnet"},
            {"value": "claude-3-haiku-20240307", "label": "Claude 3 Haiku"},
        ],
        "Qwen": [
            {"value": "qwen3-max", "label": "Qwen3-Max"},
            {"value": "qwen-plus", "label": "Qwen-Plus"},
            {"value": "qwen-flash", "label": "Qwen-Flash"},
        ],
        "DeepSeek": [
            {"value": "deepseek-chat", "label": "DeepSeek Chat"},
            {"value": "deepseek-reasoner", "label": "DeepSeek Reasoner"},
        ],
        "Custom": [
            {
                "value": "meta-llama/Meta-Llama-3.1-70B-Instruct",
                "label": "Llama 3.1 70B",
            },
            {"value": "meta-llama/Meta-Llama-3.1-8B-Instruct", "label": "Llama 3.1 8B"},
            {"value": "mistralai/Mistral-7B-Instruct-v0.2", "label": "Mistral 7B"},
        ],
    }
    return models.get(source, [])
