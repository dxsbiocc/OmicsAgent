#!/usr/bin/env python3
"""
LangChain-based OmicsAgent with chain pattern: prompt | LLM | extract_json
"""

from dotenv import load_dotenv
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import asyncio
import os
import json
import time
from typing import Dict, List, Any, Optional
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

from langchain_mcp_adapters.tools import load_mcp_tools

server_params = StdioServerParameters(
    command="python",
    args=["/Users/dengxsh/Downloads/Work/OmicsAgent/src/mcp/main.py"],
)


class ToolInvocationRequest(BaseModel):
    """Request model for tool invocation"""

    tool_name: str = Field(..., description="Name of the tool to invoke")
    parameters: Dict[str, Any] = Field(..., description="Parameters for the tool")
    reasoning: str = Field(..., description="Reasoning for choosing this tool")


class OmicsAnalysisResponse(BaseModel):
    """Response model for omics analysis"""

    analysis_result: str = Field(..., description="Result of the analysis")
    tools_used: List[str] = Field(
        default_factory=list, description="Tools that were used"
    )
    confidence: float = Field(..., description="Confidence score (0-1)")
    recommendations: List[str] = Field(
        default_factory=list, description="Additional recommendations"
    )


class OmicsAgentChain:
    """OmicsAgent using LangChain chain pattern: prompt | LLM | extract_json"""

    def __init__(self, model: ChatOpenAI, tools: List[Any]):
        self.model = model
        self.tools = {tool.name: tool for tool in tools}
        self.stats = {"total": 0, "successful": 0, "failed": 0}
        self._setup_chains()

    def _setup_chains(self):
        """Setup the LangChain chains"""

        # 1. Tool Selection Chain
        tool_selection_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are a bioinformatics expert. Analyze the user's query and select the most appropriate tool.

Available tools:
{tools_info}

Guidelines:
- For protein information: use uniprotkb_get or uniprotkb_search
- For pathway analysis: use kegg_get_pathway or kegg_search_pathways
- For compound information: use kegg_get_compound or kegg_search_compounds
- For gene-pathway relationships: use kegg_find_pathways_by_gene
- For database statistics: use kegg_info

IMPORTANT: For KEGG tools, wrap parameters in a "params" object:
- kegg_info: {{"params": {{"database": "pathway"}}}}
- kegg_get: {{"params": {{"dbentries": "hsa00010"}}}}
- kegg_find: {{"params": {{"database": "compound", "query": "glucose"}}}}

Return a JSON object with:
- tool_name: exact name of the tool
- parameters: dictionary of parameters for the tool (wrapped in "params" for KEGG tools)
- reasoning: why you chose this tool

Example:
{{
    "tool_name": "kegg_info",
    "parameters": {{"params": {{"database": "pathway"}}}},
    "reasoning": "User wants pathway database information"
}}""",
                ),
                ("human", "Query: {query}"),
            ]
        )

        self.tool_selection_chain = (
            tool_selection_prompt | self.model | JsonOutputParser()
        )

        # 2. Analysis Chain
        analysis_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are a bioinformatics expert. Based on the tool results, provide a comprehensive analysis.

Tool used: {tool_name}
Tool result: {tool_result}
Original query: {query}

Provide a JSON response with:
- analysis_result: detailed analysis of the results
- tools_used: list of tools used
- confidence: confidence score (0-1)
- recommendations: additional recommendations

Example:
{{
    "analysis_result": "The KEGG pathway database contains 580 pathways...",
    "tools_used": ["kegg_info"],
    "confidence": 0.95,
    "recommendations": ["Consider exploring specific pathways", "Use kegg_get_pathway for detailed pathway information"]
}}""",
                ),
                ("human", "Please analyze the results and provide insights."),
            ]
        )

        self.analysis_chain = analysis_prompt | self.model | JsonOutputParser()

    def _get_tools_info(self) -> str:
        """Get formatted tools information"""
        tools_info = []
        for tool in self.tools.values():
            tools_info.append(f"- {tool.name}: {tool.description}")
        return "\n".join(tools_info)

    async def invoke_tool(
        self, tool_name: str, parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Invoke a specific tool"""
        try:
            if tool_name not in self.tools:
                return {
                    "success": False,
                    "error": f"Tool '{tool_name}' not found",
                    "tool_name": tool_name,
                }

            tool = self.tools[tool_name]
            result = await tool.ainvoke(parameters)

            self.stats["total"] += 1
            self.stats["successful"] += 1

            return {"success": True, "result": result, "tool_name": tool_name}

        except Exception as e:
            self.stats["total"] += 1
            self.stats["failed"] += 1
            return {"success": False, "error": str(e), "tool_name": tool_name}

    async def process_query(self, query: str) -> OmicsAnalysisResponse:
        """Process a user query using the chain pattern"""
        try:
            # Step 1: Tool Selection (prompt | LLM | extract_json)
            print(f"🔍 Analyzing query: {query}")
            tool_request_dict = await self.tool_selection_chain.ainvoke(
                {"query": query, "tools_info": self._get_tools_info()}
            )

            print(f"🛠️  Selected tool: {tool_request_dict['tool_name']}")
            print(f"📝 Reasoning: {tool_request_dict['reasoning']}")

            # Step 2: Tool Invocation
            tool_name = tool_request_dict["tool_name"]
            parameters = tool_request_dict["parameters"]

            tool_response = await self.invoke_tool(tool_name, parameters)

            if not tool_response["success"]:
                return OmicsAnalysisResponse(
                    analysis_result=f"Error: {tool_response['error']}",
                    tools_used=[tool_response["tool_name"]],
                    confidence=0.0,
                    recommendations=["Please check the tool parameters and try again"],
                )

            # Step 3: Analysis (prompt | LLM | extract_json)
            print(f"📊 Analyzing results from {tool_response['tool_name']}")
            analysis_dict = await self.analysis_chain.ainvoke(
                {
                    "query": query,
                    "tool_name": tool_response["tool_name"],
                    "tool_result": json.dumps(tool_response["result"], indent=2),
                }
            )

            # Convert dict to Pydantic model
            return OmicsAnalysisResponse(**analysis_dict)

        except Exception as e:
            print(f"❌ Error in chain processing: {e}")
            return OmicsAnalysisResponse(
                analysis_result=f"Error processing query: {str(e)}",
                tools_used=[],
                confidence=0.0,
                recommendations=["Please try rephrasing your query"],
            )

    def get_stats(self) -> Dict[str, int]:
        """Get statistics"""
        return self.stats


async def main():
    """Main function to test the chain-based agent"""
    load_dotenv()

    # Check for required environment variables
    api_key = os.getenv("SILICONFLOW_API_KEY")
    if not api_key:
        print("❌ Error: SILICONFLOW_API_KEY not found in environment variables")
        return

    model_name = "deepseek-ai/DeepSeek-V3.1"
    base_url = "https://api.siliconflow.cn/v1/"

    try:
        model = ChatOpenAI(
            model=model_name,
            temperature=0.3,
            api_key=api_key,
            base_url=base_url,
        )
        print("✅ Model initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing model: {e}")
        return

    # Test cases
    test_cases = [
        {
            "description": "KEGG database information",
            "query": "Get information about the KEGG pathway database",
        },
        {
            "description": "KEGG pathway information",
            "query": "Find information about the glycolysis pathway (hsa00010)",
        },
        {
            "description": "KEGG compound search",
            "query": "Search for glucose-related compounds in KEGG",
        },
    ]

    try:
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                print("✅ MCP server connection established")

                tools = await load_mcp_tools(session)
                print(f"✅ Loaded {len(tools)} MCP tools")

                # Create chain-based agent
                agent_chain = OmicsAgentChain(model, tools)
                print("✅ Chain-based agent created")

                # Run tests
                for i, test_case in enumerate(test_cases, 1):
                    print(f"\n🧪 Test {i}: {test_case['description']}")
                    print(f"❓ Query: {test_case['query']}")
                    print("-" * 40)

                    try:
                        start_time = time.time()
                        response = await agent_chain.process_query(test_case["query"])
                        end_time = time.time()

                        print(f"🤖 Analysis: {response.analysis_result[:200]}...")
                        print(f"🛠️  Tools: {', '.join(response.tools_used)}")
                        print(f"📊 Confidence: {response.confidence:.2f}")
                        if response.recommendations:
                            print(
                                f"💡 Recommendations: {', '.join(response.recommendations[:2])}"
                            )
                        print(f"⏱️  Response time: {end_time - start_time:.2f}s")

                    except Exception as e:
                        print(f"❌ Error: {e}")

                    print("-" * 40)

                # Print statistics
                stats = agent_chain.get_stats()
                print(f"\n📊 Statistics:")
                print(f"   Total invocations: {stats['total']}")
                print(f"   Successful: {stats['successful']}")
                print(f"   Failed: {stats['failed']}")
                if stats["total"] > 0:
                    success_rate = (stats["successful"] / stats["total"]) * 100
                    print(f"   Success rate: {success_rate:.1f}%")

                print("\n🎉 Chain-based agent testing completed successfully!")

    except Exception as e:
        print(f"❌ Error running agent: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
