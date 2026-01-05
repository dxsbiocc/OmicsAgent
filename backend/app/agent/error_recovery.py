"""
Error recovery module for Visual Agent.
This module provides error analysis and automatic fix suggestions using LLM.
"""

import json
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

from app.core.logging import get_logger
from app.agent.models import VisualToolRequest

logger = get_logger("error_recovery")


class ErrorAnalysis(BaseModel):
    """Analysis of an error"""
    error_type: str = Field(..., description="Type of error (e.g., 'data_format', 'config_error', 'missing_column')")
    error_description: str = Field(..., description="Human-readable description of the error")
    root_cause: str = Field(..., description="Root cause of the error")
    suggested_fixes: List[str] = Field(default_factory=list, description="List of suggested fixes")
    can_auto_fix: bool = Field(default=False, description="Whether the error can be automatically fixed")


class FixedVisualRequest(BaseModel):
    """Fixed visual request after error recovery"""
    chart_type: str
    engine: str
    data: Optional[List[Dict[str, Any]]] = None
    params: Dict[str, Any]
    reasoning: str
    fixes_applied: List[str] = Field(default_factory=list, description="List of fixes that were applied")


class ErrorRecoveryAgent:
    """
    Agent for analyzing errors and suggesting fixes.
    """
    
    def __init__(self, llm):
        """
        Initialize error recovery agent.
        
        Args:
            llm: LangChain LLM instance
        """
        self.llm = llm
        self._setup_prompts()
    
    def _setup_prompts(self):
        """Setup prompt templates for error analysis"""
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import JsonOutputParser
        
        # Prompt for error analysis
        self.error_analysis_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are an expert at debugging data visualization errors. 
Your task is to analyze error messages and suggest fixes.

Common error types:
1. data_format: Data format issues (missing columns, wrong types, etc.)
2. config_error: Configuration errors (invalid JSON structure, missing fields, etc.)
3. missing_column: Required columns are missing from data
4. type_mismatch: Data type mismatches (e.g., expecting numeric but got string)
5. value_error: Invalid values (e.g., NaN, null, out of range)
6. execution_error: R/Python script execution errors

Analyze the error and provide:
- error_type: The type of error
- error_description: Human-readable description
- root_cause: What caused the error
- suggested_fixes: List of specific fixes to try
- can_auto_fix: Whether this can be automatically fixed

Return a JSON object with these fields.""",
                ),
                (
                    "human",
                    """Error Information:
{error_details}

Data Information:
{data_info}

Original Configuration:
{original_config}

Original Request:
{original_request}

Please analyze this error and suggest fixes.""",
                ),
            ]
        )
        
        # Prompt for fixing the request
        self.fix_request_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are an expert at fixing data visualization configurations.
Your task is to fix the configuration based on error analysis.

Rules:
1. Only modify what's necessary to fix the error
2. Preserve user's intent as much as possible
3. Ensure the fixed configuration is valid
4. If data format is wrong, adjust the mapping accordingly
5. If columns are missing, use available columns or remove the mapping

Return the fixed configuration in the same format as the original request.""",
                ),
                (
                    "human",
                    """Error Analysis:
{error_analysis}

Original Request:
{original_request}

Data Information:
{data_info}

Please provide a fixed version of the request that addresses the error.""",
                ),
            ]
        )
        
        self.error_parser = JsonOutputParser(pydantic_object=ErrorAnalysis)
        self.fix_parser = JsonOutputParser(pydantic_object=FixedVisualRequest)
    
    async def analyze_error(
        self,
        error_details: Dict[str, Any],
        data_info: Dict[str, Any],
        original_config: Dict[str, Any],
        original_request: VisualToolRequest,
    ) -> ErrorAnalysis:
        """
        Analyze an error and suggest fixes.
        
        Args:
            error_details: Error details from VisualService
            data_info: Data format information
            original_config: Original configuration that failed
            original_request: Original visual request
            
        Returns:
            ErrorAnalysis with suggested fixes
        """
        if not self.llm:
            # Fallback analysis without LLM
            return ErrorAnalysis(
                error_type="unknown",
                error_description=error_details.get("error_message", "Unknown error"),
                root_cause="Unable to analyze without LLM",
                suggested_fixes=["Check data format", "Verify configuration"],
                can_auto_fix=False,
            )
        
        try:
            chain = self.error_analysis_prompt | self.llm | self.error_parser
            
            result = await chain.ainvoke(
                {
                    "error_details": json.dumps(error_details, indent=2),
                    "data_info": json.dumps(data_info, indent=2),
                    "original_config": json.dumps(original_config, indent=2),
                    "original_request": original_request.dict(),
                }
            )
            
            if isinstance(result, dict):
                return ErrorAnalysis(**result)
            else:
                return ErrorAnalysis(**result.dict() if hasattr(result, "dict") else {})
                
        except Exception as e:
            logger.error(f"Error analyzing error: {e}", exc_info=True)
            return ErrorAnalysis(
                error_type="analysis_error",
                error_description=f"Failed to analyze error: {str(e)}",
                root_cause="Error analysis failed",
                suggested_fixes=[],
                can_auto_fix=False,
            )
    
    async def fix_request(
        self,
        error_analysis: ErrorAnalysis,
        original_request: VisualToolRequest,
        data_info: Dict[str, Any],
    ) -> Optional[FixedVisualRequest]:
        """
        Fix the visual request based on error analysis.
        
        Args:
            error_analysis: Analysis of the error
            original_request: Original request that failed
            data_info: Data format information
            
        Returns:
            Fixed visual request, or None if cannot be fixed
        """
        if not error_analysis.can_auto_fix or not self.llm:
            return None
        
        try:
            chain = self.fix_request_prompt | self.llm | self.fix_parser
            
            result = await chain.ainvoke(
                {
                    "error_analysis": error_analysis.dict(),
                    "original_request": original_request.dict(),
                    "data_info": json.dumps(data_info, indent=2),
                }
            )
            
            if isinstance(result, dict):
                return FixedVisualRequest(**result)
            else:
                return FixedVisualRequest(**result.dict() if hasattr(result, "dict") else {})
                
        except Exception as e:
            logger.error(f"Error fixing request: {e}", exc_info=True)
            return None

