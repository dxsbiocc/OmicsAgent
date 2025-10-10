"""
KEGG MCP resources implementation
"""

from fastmcp import FastMCP
from .client import KEGGClient
from services.common.utils import format_response


def register_kegg_resources(mcp: FastMCP):
    """Register KEGG resources with MCP server"""

    client = KEGGClient()

    @mcp.resource(
        uri="kegg://pathway/{pathway_id}",
        name="KEGG Pathway",
        description="KEGG pathway information and data",
    )
    async def kegg_pathway_resource(pathway_id: str) -> str:
        """KEGG pathway resource"""
        try:
            result = await client.make_request("get", f"{pathway_id}/json")
            return format_response(result)
        except Exception as e:
            return f"Validation error for pathway {pathway_id}: {str(e)}"

    @mcp.resource(
        uri="kegg://compound/{compound_id}",
        name="KEGG Compound",
        description="KEGG compound information and data",
    )
    async def kegg_compound_resource(compound_id: str) -> str:
        """KEGG compound resource"""
        try:
            result = await client.make_request("get", compound_id)
            return format_response(result)
        except Exception as e:
            return f"Validation error for compound {compound_id}: {str(e)}"

    @mcp.resource(
        uri="kegg://gene/{gene_id}",
        name="KEGG Gene",
        description="KEGG gene information and data",
    )
    async def kegg_gene_resource(gene_id: str) -> str:
        """KEGG gene resource"""
        try:
            result = await client.make_request("get", gene_id)
            return format_response(result)
        except Exception as e:
            return f"Validation error for gene {gene_id}: {str(e)}"
