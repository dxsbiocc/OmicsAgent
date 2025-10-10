#!/usr/bin/env python3
"""
Test script for LangChain-based OmicsAgent
"""

import asyncio
import sys
import os
from dotenv import load_dotenv
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from langchain_openai import ChatOpenAI
from langchain_mcp_adapters.tools import load_mcp_tools

# Add the current directory to the path
sys.path.append(os.path.dirname(__file__))

# Import the chain-based agent
from agent import OmicsAgentChain

server_params = StdioServerParameters(
    command="python",
    args=["/Users/dengxsh/Downloads/Work/OmicsAgent/src/mcp/main.py"],
)


async def test_chain_agent():
    """Test the chain-based agent"""
    print("🔗 LangChain OmicsAgent Test")
    print("=" * 40)

    load_dotenv()

    # Check API key
    api_key = os.getenv("SILICONFLOW_API_KEY")
    if not api_key:
        print("❌ Error: SILICONFLOW_API_KEY not found")
        return False

    try:
        # Initialize model
        model = ChatOpenAI(
            model="deepseek-ai/DeepSeek-V3.1",
            temperature=0.3,
            api_key=api_key,
            base_url="https://api.siliconflow.cn/v1/",
        )
        print("✅ Model initialized")

        # Connect to MCP server
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                print("✅ MCP server connected")

                tools = await load_mcp_tools(session)
                print(f"✅ Loaded {len(tools)} tools")

                # Create chain-based agent
                agent_chain = OmicsAgentChain(model, tools)
                print("✅ Chain-based agent created")

                # Test queries
                test_queries = [
                    "Get information about the KEGG pathway database",
                    "Find information about the glycolysis pathway (hsa00010)",
                    "Search for glucose-related compounds in KEGG",
                ]

                for i, query in enumerate(test_queries, 1):
                    print(f"\n🧪 Test {i}: {query}")
                    print("-" * 40)

                    try:
                        response = await agent_chain.process_query(query)

                        print(f"🤖 Analysis: {response.analysis_result[:200]}...")
                        print(f"🛠️  Tools: {', '.join(response.tools_used)}")
                        print(f"📊 Confidence: {response.confidence:.2f}")

                    except Exception as e:
                        print(f"❌ Error: {e}")

                    print("-" * 40)

                # Print statistics
                stats = agent_chain.get_stats()
                stats.end_session()
                stats.print_summary()

                return True

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = asyncio.run(test_chain_agent())
    if success:
        print("\n🎉 Chain test completed!")
    else:
        print("\n💥 Chain test failed!")
    sys.exit(0 if success else 1)
