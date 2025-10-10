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
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from pydantic import BaseModel, Field

from langchain_mcp_adapters.tools import load_mcp_tools
from langgraph.prebuilt import create_react_agent

server_params = StdioServerParameters(
    command="python",
    args=["/Users/dengxsh/Downloads/Work/OmicsAgent/src/mcp/main.py"],
)


class ToolInvocationRequest(BaseModel):
    """Request model for tool invocation"""

    tool_name: str = Field(..., description="Name of the tool to invoke")
    parameters: Dict[str, Any] = Field(..., description="Parameters for the tool")
    reasoning: str = Field(..., description="Reasoning for choosing this tool")


class ToolInvocationResponse(BaseModel):
    """Response model for tool invocation"""

    success: bool = Field(..., description="Whether the tool invocation was successful")
    result: Optional[Dict[str, Any]] = Field(None, description="Result from the tool")
    error: Optional[str] = Field(None, description="Error message if failed")
    tool_name: str = Field(..., description="Name of the tool that was invoked")


class OmicsAnalysisRequest(BaseModel):
    """Request model for omics analysis"""

    query: str = Field(..., description="User's query about omics data")
    analysis_type: Optional[str] = Field(None, description="Type of analysis requested")
    entities: List[str] = Field(
        default_factory=list, description="Biological entities mentioned"
    )
    species: Optional[str] = Field(None, description="Species of interest")


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


class ToolInvocationStats:
    """Track tool invocation statistics for success rate analysis"""

    def __init__(self):
        self.total_invocations = 0
        self.successful_invocations = 0
        self.failed_invocations = 0
        self.tool_usage = {}
        self.error_types = {}
        self.start_time = None
        self.end_time = None

    def record_invocation(self, tool_name: str, success: bool, error_type: str = None):
        """Record a tool invocation attempt"""
        self.total_invocations += 1

        if success:
            self.successful_invocations += 1
        else:
            self.failed_invocations += 1
            if error_type:
                self.error_types[error_type] = self.error_types.get(error_type, 0) + 1

        # Track tool usage
        if tool_name not in self.tool_usage:
            self.tool_usage[tool_name] = {"total": 0, "successful": 0, "failed": 0}

        self.tool_usage[tool_name]["total"] += 1
        if success:
            self.tool_usage[tool_name]["successful"] += 1
        else:
            self.tool_usage[tool_name]["failed"] += 1

    def get_success_rate(self) -> float:
        """Calculate overall success rate"""
        if self.total_invocations == 0:
            return 0.0
        return (self.successful_invocations / self.total_invocations) * 100

    def get_tool_success_rate(self, tool_name: str) -> float:
        """Calculate success rate for a specific tool"""
        if tool_name not in self.tool_usage or self.tool_usage[tool_name]["total"] == 0:
            return 0.0
        return (
            self.tool_usage[tool_name]["successful"]
            / self.tool_usage[tool_name]["total"]
        ) * 100

    def start_session(self):
        """Start timing the session"""
        self.start_time = time.time()

    def end_session(self):
        """End timing the session"""
        self.end_time = time.time()

    def get_session_duration(self) -> float:
        """Get session duration in seconds"""
        if self.start_time and self.end_time:
            return self.end_time - self.start_time
        return 0.0

    def print_summary(self):
        """Print detailed statistics summary"""
        print("\n" + "=" * 60)
        print("📊 TOOL INVOCATION STATISTICS SUMMARY")
        print("=" * 60)

        print(f"⏱️  Session Duration: {self.get_session_duration():.2f} seconds")
        print(f"🔢 Total Invocations: {self.total_invocations}")
        print(f"✅ Successful: {self.successful_invocations}")
        print(f"❌ Failed: {self.failed_invocations}")
        print(f"📈 Overall Success Rate: {self.get_success_rate():.1f}%")

        if self.tool_usage:
            print(f"\n🛠️  Tool-Specific Success Rates:")
            for tool_name, stats in self.tool_usage.items():
                success_rate = self.get_tool_success_rate(tool_name)
                print(
                    f"   {tool_name}: {success_rate:.1f}% ({stats['successful']}/{stats['total']})"
                )

        if self.error_types:
            print(f"\n🚨 Error Types:")
            for error_type, count in self.error_types.items():
                print(f"   {error_type}: {count} occurrences")

        print("=" * 60)


class OmicsAgentChain:
    """OmicsAgent using LangChain chain pattern: prompt | LLM | extract_json"""

    def __init__(self, model: ChatOpenAI, tools: List[Any]):
        self.model = model
        self.tools = {tool.name: tool for tool in tools}
        self.stats = ToolInvocationStats()
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

Return a JSON object with:
- tool_name: exact name of the tool
- parameters: dictionary of parameters for the tool
- reasoning: why you chose this tool

Example:
{{
    "tool_name": "kegg_info",
    "parameters": {{"database": "pathway"}},
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
    ) -> ToolInvocationResponse:
        """Invoke a specific tool"""
        try:
            if tool_name not in self.tools:
                return ToolInvocationResponse(
                    success=False,
                    error=f"Tool '{tool_name}' not found",
                    tool_name=tool_name,
                )

            tool = self.tools[tool_name]
            result = await tool.ainvoke(parameters)

            self.stats.record_invocation(tool_name, True)

            return ToolInvocationResponse(
                success=True, result=result, tool_name=tool_name
            )

        except Exception as e:
            self.stats.record_invocation(tool_name, False, str(e))
            return ToolInvocationResponse(
                success=False, error=str(e), tool_name=tool_name
            )

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
            # For KEGG tools, we need to pass parameters directly, not wrapped in 'params'
            tool_name = tool_request_dict["tool_name"]
            parameters = tool_request_dict["parameters"]

            # Handle KEGG tools that expect direct parameters
            if tool_name.startswith("kegg_"):
                # KEGG tools expect direct parameters, not wrapped in 'params'
                tool_response = await self.invoke_tool(tool_name, parameters)
            else:
                # Other tools might expect wrapped parameters
                tool_response = await self.invoke_tool(tool_name, parameters)

            if not tool_response.success:
                return OmicsAnalysisResponse(
                    analysis_result=f"Error: {tool_response.error}",
                    tools_used=[tool_response.tool_name],
                    confidence=0.0,
                    recommendations=["Please check the tool parameters and try again"],
                )

            # Step 3: Analysis (prompt | LLM | extract_json)
            print(f"📊 Analyzing results from {tool_response.tool_name}")
            analysis_dict = await self.analysis_chain.ainvoke(
                {
                    "query": query,
                    "tool_name": tool_response.tool_name,
                    "tool_result": json.dumps(tool_response.result, indent=2),
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

    def get_stats(self) -> ToolInvocationStats:
        """Get statistics"""
        return self.stats


async def run_chain_test(
    agent_chain: OmicsAgentChain, test_cases: List[Dict[str, str]]
):
    """Run chain-based agent tests"""
    print(f"\n🧪 Running {len(test_cases)} test cases with LangChain...")
    print("=" * 60)

    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📋 Test Case {i}: {test_case['description']}")
        print(f"❓ Query: {test_case['query']}")
        print("-" * 40)

        try:
            start_time = time.time()
            response = await agent_chain.process_query(test_case["query"])
            end_time = time.time()

            print(f"🤖 Analysis Result: {response.analysis_result[:300]}...")
            print(f"🛠️  Tools Used: {', '.join(response.tools_used)}")
            print(f"📊 Confidence: {response.confidence:.2f}")
            if response.recommendations:
                print(f"💡 Recommendations: {', '.join(response.recommendations[:2])}")
            print(f"⏱️  Response time: {end_time - start_time:.2f}s")

        except Exception as e:
            print(f"❌ Error in test case {i}: {e}")
            agent_chain.stats.record_invocation("unknown", False, str(e))

        print("-" * 40)


async def main():
    load_dotenv()

    # Check for required environment variables
    api_key = os.getenv("SILICONFLOW_API_KEY")
    if not api_key:
        print("❌ Error: SILICONFLOW_API_KEY not found in environment variables")
        print("Please set your API key in the .env file")
        return

    model_name = "deepseek-ai/DeepSeek-V3.1"
    base_url = "https://api.siliconflow.cn/v1/"

    # Initialize statistics tracking
    stats = ToolInvocationStats()
    stats.start_session()

    # Enhanced system prompt for better tool invocation success
    system_prompt = """You are OmicsAgent, a specialized bioinformatics assistant with access to KEGG and UniProt databases through MCP tools. Your role is to help users with omics data analysis, protein information retrieval, pathway analysis, and biological data interpretation.

## Available Tools Overview

### KEGG Tools (Kyoto Encyclopedia of Genes and Genomes):
- **kegg_info**: Get database information and statistics
- **kegg_list**: List entries in KEGG databases (pathway, compound, gene, etc.)
- **kegg_find**: Search entries by keywords
- **kegg_get**: Get detailed information for specific entries
- **kegg_convert**: Convert between different database identifiers
- **kegg_link**: Find related entries across databases
- **kegg_drug_interaction**: Get drug interaction information
- **kegg_get_pathway**: Get pathway information in various formats
- **kegg_get_compound**: Get compound information
- **kegg_get_gene**: Get gene information
- **kegg_find_pathways_by_gene**: Find pathways containing a specific gene
- **kegg_find_genes_in_pathway**: Find genes in a specific pathway
- **kegg_search_compounds**: Search compounds by keyword
- **kegg_search_pathways**: Search pathways by keyword

### UniProt Tools (Universal Protein Resource):
- **uniprotkb_get**: Get protein information by accession number
- **uniprotkb_stream**: Stream multiple protein entries
- **uniprotkb_search**: Search proteins with complex queries
- **uniref_members**: Get UniRef cluster members
- **uniref_search**: Search UniRef clusters
- **idmapping_run**: Map identifiers between databases
- **idmapping_status**: Check ID mapping job status
- **idmapping_details**: Get ID mapping results

## Input Understanding
1. Read the user’s message thoroughly before choosing a tool.  
2. Identify key entities, such as:
   - Gene names (e.g., TP53, EGFR)
   - Dataset names (e.g., TCGA, GEO)
   - Species identifiers (e.g., human → hsa, mouse → mmu)
   - Analysis type (e.g., KEGG enrichment, differential expression)
3. Ignore irrelevant words. Focus only on the essential keywords that match tool parameters.

## Parameter Mapping
1. Match extracted keywords to the tool’s parameter schema.
2. Ensure:
   - All required parameters are filled.
   - Only allowed values are used for enumerated fields.
   - Data types strictly follow schema rules (strings, arrays, numbers).
3. Do not include extra or undefined parameters.

## Tool Invocation Best Practices

### 1. Parameter Validation
- **ALWAYS** check tool descriptions and parameter schemas before invocation
- **REQUIRED fields**: Must be provided with correct types
- **OPTIONAL fields**: Only include if relevant to the query
- **ENUM values**: Use only allowed values from the schema
- **ARRAY types**: Use proper JSON array format: ["value1", "value2"]

### 2. Common Parameter Patterns
- **KEGG IDs**: Use proper format (e.g., "hsa00010" for pathways, "C00031" for compounds)
- **UniProt accessions**: Use standard format (e.g., "P00533", "Q96PD3")
- **Organism codes**: Use 3-letter codes (e.g., "hsa" for human, "mmu" for mouse)
- **Database names**: Use exact names from KEGG (pathway, compound, gene, etc.)

### 3. Error Recovery Strategy
1. **First failure**: Analyze error message and adjust parameters
2. **Second failure**: Review tool documentation more carefully
3. **Third failure**: Try alternative tools or approaches
4. **Always**: Provide helpful error context to the user

### 4. Response Format
- Use **valid JSON** for all tool parameters
- Include **explanations** for complex biological queries
- Provide **context** about what the tools are doing
- **Format results** in a user-friendly way

## Example Interactions

### Protein Information Query:
User: "Get information about TP53 protein"
Action: Use `uniprotkb_get` with accession "P04637"
Response: Provide formatted protein information

### Pathway Analysis:
User: "Find pathways related to glycolysis"
Action: Use `kegg_search_pathways` with keyword "glycolysis"
Response: List relevant pathways with descriptions

### Gene-Pathway Relationships:
User: "What pathways contain the EGFR gene?"
Action: Use `kegg_find_pathways_by_gene` with gene ID "hsa:1956"
Response: List pathways and their relationships

Remember: Always prioritize accuracy and provide biological context in your responses."""

    try:
        model = ChatOpenAI(
        model=model_name,
            temperature=0.3,  # Lower temperature for more consistent tool usage
        api_key=api_key,
        base_url=base_url,
    )
        print("✅ Model initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing model: {e}")
        return

    # Define comprehensive test cases
    test_cases = [
        {
            "description": "UniProt protein information retrieval",
            "query": "Get detailed information about the TP53 protein (accession P04637) from UniProt",
        },
        {
            "description": "KEGG pathway information",
            "query": "Find information about the glycolysis pathway (hsa00010) in KEGG",
        },
        {
            "description": "KEGG compound search",
            "query": "Search for glucose-related compounds in KEGG database",
        },
        {
            "description": "Gene-pathway relationship",
            "query": "Find which pathways contain the EGFR gene (hsa:1956) in KEGG",
        },
        {
            "description": "UniProt protein search",
            "query": "Search for proteins related to cancer in UniProt database",
        },
        {
            "description": "KEGG database statistics",
            "query": "Get information about the KEGG pathway database",
        },
        {
            "description": "Protein identifier mapping",
            "query": "Map UniProt accessions P00533 and Q96PD3 to other databases",
        },
        {
            "description": "KEGG pathway search",
            "query": "Search for pathways related to metabolism in KEGG",
        },
    ]

    try:
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
                print("✅ MCP server connection established")

            tools = await load_mcp_tools(session)
                print(f"✅ Loaded {len(tools)} MCP tools")

                # Display available tools
                print(f"\n🛠️  Available MCP Tools:")
                for tool in tools:
                    print(f"   - {tool.name}: {tool.description[:80]}...")

                # Create chain-based agent
                agent_chain = OmicsAgentChain(model, tools)
                print("✅ Chain-based agent created")

                # Run comprehensive tests
                await run_chain_test(agent_chain, test_cases)

                # End session and print statistics
                chain_stats = agent_chain.get_stats()
                chain_stats.end_session()
                chain_stats.print_summary()

                print("\n🎉 Chain-based agent testing completed successfully!")

    except Exception as e:
        print(f"❌ Error running agent: {e}")
        print("Please check that the MCP server is working correctly")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
