"""
Agent data models and schemas.
"""

from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field


class VisualToolRequest(BaseModel):
    """Request model for visual tool generation"""
    chart_type: str = Field(..., description="Chart type (e.g., scatter/volcano, heatmap/cluster_basic)")
    engine: str = Field(default="r", description="Engine to use: 'r' or 'python'")
    data: Optional[List[Dict[str, Any]]] = Field(None, description="Chart data")
    params: Dict[str, Any] = Field(default_factory=dict, description="Additional chart parameters")
    reasoning: str = Field(..., description="Reasoning for choosing this chart type")


class AgentResponse(BaseModel):
    """Response model for agent interactions"""
    message: str = Field(..., description="Agent's response message")
    needs_info: bool = Field(default=False, description="Whether agent needs more information")
    missing_params: List[str] = Field(default_factory=list, description="Missing required parameters")
    visual_request: Optional[VisualToolRequest] = Field(None, description="Visual tool request if ready")
    suggestions: List[str] = Field(default_factory=list, description="Suggestions for next steps")
    show_example: Optional[str] = Field(None, description="Tool name to show example for (e.g., 'scatter/volcano')")


class VisualAnalysisResponse(BaseModel):
    """Response model for visual analysis"""
    analysis: str = Field(..., description="Analysis of the visualization")
    insights: List[str] = Field(default_factory=list, description="Key insights")
    recommendations: List[str] = Field(default_factory=list, description="Recommendations for next steps")
    possible_analyses: List[str] = Field(default_factory=list, description="Possible follow-up analyses")

