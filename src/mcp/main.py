"""
Main MCP server with modular service architecture
"""

import sys
import os
import asyncio

# Add the current directory to the path
sys.path.append(os.path.dirname(__file__))


from fastmcp import FastMCP
from services.kegg.tools import register_kegg_tools
from services.kegg.resources import register_kegg_resources
from services.uniprot.tools import register_uniprot_tools

# from services.uniprot.resources import register_uniprot_resources

# Create main MCP server
mcp = FastMCP(
    name="OmicsAgent",
    version="1.0.0",
    instructions="You are a helpful assistant that can help with omics data analysis, data visualization, and data interpretation.",
    on_duplicate_tools="warn",
    on_duplicate_resources="warn",
    on_duplicate_prompts="warn",
)

# Register KEGG services
register_kegg_tools(mcp)
register_kegg_resources(mcp)

register_uniprot_tools(mcp)
# register_uniprot_resources(mcp)

# TODO: Register other services (NCBI, etc.)


@mcp.tool
async def test_tool() -> str:
    """
    Test tool
    """
    return "Test tool"


if __name__ == "__main__":
    asyncio.run(mcp.run_async(transport="stdio"))
