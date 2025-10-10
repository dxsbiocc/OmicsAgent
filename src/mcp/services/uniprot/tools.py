from fastmcp import FastMCP
from pydantic import Field
from typing import Optional

from .client import UniprotClient
from schemas.uniprot import (
    UniProtKBParams,
    UniProtKBStreamParams,
    UniProtKBSearchParams,
    UniRefMembersParams,
    UniRefSearchParams,
    IDMappingParams,
    IDMappingRequest,
)


def register_uniprot_tools(mcp: FastMCP):
    """Register Uniprot tools with the MCP server"""

    client = UniprotClient()

    @mcp.tool
    async def uniprotkb_get(
        accession: str = Field(
            ...,
            description="Unique and stable identifier for each UniProtKB entry. e.g. P00533, Q96PD3, etc.",
        ),
        params: Optional[UniProtKBParams] = None,
    ) -> dict:
        """
        Search UniProtKB by protein entry accession to return all data
        associated with that entry. Specify fields to return only data
        for specific sections of that entry that are of interest to you

        Example:
        >>> uniprotkb_get(accession="P00533", fields="accession,protein_name,cc_function,ft_binding")
        """
        result = await client.make_request(
            "uniprotkb",
            accession,
            params=params.model_dump(exclude_none=True) if params else None,
        )
        return await client.parse_response(result)

    @mcp.tool
    async def uniprotkb_stream(params: UniProtKBStreamParams) -> dict:
        """
        The stream endpoint uses a request query to return all entries
        associated with the search term in a single download. Specify
        fields to return only data for specific sections of that entry
        that are of interest to you The stream endpoint has a maximum
        limit of 10 million entries. For larger requests, please use
        the 'UniProtKB asynchronous download job' requests described
        below. The 'UniProtKB asynchronous download job' requests can
        be used for any size -- the asynchronous download jobs can be
        paused and resumed at your convenience, unlike the stream
        endpoint.

        Example:
        >>> uniprotkb_stream(query="insulin AND reviewed:true", fields="accession,protein_name,cc_function,ft_binding", sort="accession desc", includeIsoform=True, download=True)
        """
        result = await client.make_request(
            "uniprotkb", "stream", params=params.model_dump(exclude_none=True)
        )
        return await client.parse_response(result)

    @mcp.tool
    async def uniprotkb_search(params: UniProtKBSearchParams) -> dict:
        """
        The search endpoint uses a request query to return all entries
        associated with the search term in a paginated list of entries.
        Use 'size' to specify the number of entries per page of results.
        Specify fields to return only data for specific sections of that
        entry that are of interest to you

        Example:
        >>> uniprotkb_search(query="insulin AND reviewed:true", fields="accession,protein_name,cc_function,ft_binding", sort="accession desc", includeIsoform=True, size=25)
        """
        result = await client.make_request(
            "uniprotkb", "search", params=params.model_dump(exclude_none=True)
        )
        return await client.parse_response(result)

    @mcp.tool
    async def uniref_get(
        id: str = Field(..., description="Unique identifier for the UniRef cluster"),
        fields: str = Field(
            ...,
            description="List of entry sections (fields) to be returned, separated by commas. eg. id,name,types,organism,identity.",
        ),
    ) -> dict:
        """
        Search UniRef entry by id to return all data associated with
        that entry. Specify fields to return only data for specific
        sections of that entry that are of interest to you

        Example:
        >>> uniref_get(id="UniRef100_P05067", fields="id,name,types,organism,identity")
        """
        result = await client.make_request(
            "uniref",
            id,
            params={"fields": fields},
        )
        return await client.parse_response(result)

    @mcp.tool
    async def uniref_members(
        id: str = Field(..., description="Unique identifier for the UniRef cluster"),
        params: Optional[UniRefMembersParams] = None,
    ) -> dict:
        """
        Search UniRef members by facet filter to return all data associated with that entry. Specify fields to return only data for specific sections of that entry that are of interest to you

        Example:
        >>> uniref_members(id="UniRef100_P05067", facetFilter="member_id_type:uniprotkb_id", size=50)
        """
        result = await client.make_request(
            "uniref",
            f"{id}/members",
            params=params.model_dump(exclude_none=True) if params else None,
        )
        return await client.parse_response(result)

    @mcp.tool
    async def uniref_light(
        id: str = Field(..., description="Unique identifier for the UniRef cluster"),
        fields: str = Field(
            ...,
            description="List of entry sections (fields) to be returned, separated by commas. eg. id,name,types,organism,identity.",
        ),
    ) -> dict:
        """
        Search light UniRef entry by id to return all data associated
        with that entry. Specify fields to return only data for specific
        sections of that entry that are of interest to you

        Example:
        >>> uniref_light(id="UniRef100_P05067", fields="id,name,types,organism,identity")
        """
        result = await client.make_request(
            "uniref",
            f"{id}/light",
            params={"fields": fields},
        )
        return result.model_dump()

    @mcp.tool
    async def uniref_search(params: UniRefSearchParams) -> dict:
        """
        The search endpoint uses a request query to return all entries
        associated with the search term in a paginated list of entries.
        Use 'size' to specify the number of entries per page of results.
        Specify fields to return only data for specific sections of that
        entry that are of interest to you

        Example:
        >>> uniref_search(query="UniRef100_P05067", fields="id,name,types,organism,identity", size=50)
        """
        result = await client.make_request(
            "uniref", "search", params=params.model_dump(exclude_none=True)
        )
        return await client.parse_response(result)

    @mcp.tool
    async def idmapping_run(params: IDMappingParams) -> dict:
        """
        The ID Mapping service can map between the identifiers used in
        one database, to the identifiers of another, e.g., from UniProt
        to Ensembl, or to PomBase, etc. If you map to UniProtKB, UniParc
        or UniRef data, the full entries will be returned to you for
        convenience.

        Example:
        >>> idmapping_run(fromDb="UniProtKB", to="UniProtKB-Swiss-Prot", ids="P00533,Q96PD3", taxId=9606)
        """
        result = await client.make_request(
            "idmapping", "run", params=params.model_dump(exclude_none=True), post=True
        )
        return await client.parse_response(result)

    @mcp.tool
    async def idmapping_status(
        jobId: str = Field(..., description="Unique identifier for the ID mapping job")
    ) -> dict:
        """
        The ID Mapping service can map between the identifiers used in
        one database, to the identifiers of another, e.g., from UniProt
        to Ensembl, or to PomBase, etc. If you map to UniProtKB, UniParc
        or UniRef data, the full entries will be returned to you for
        convenience.

        Example:
        >>> idmapping_status(jobId="1234567890")
        """
        if not jobId:
            raise ValueError("Job ID is required")

        result = await client.make_request("idmapping", f"status/{jobId}")
        return await client.parse_response(result)

    @mcp.tool
    async def idmapping_details(
        jobId: str = Field(..., description="Unique identifier for the ID mapping job")
    ) -> dict:
        """
        The ID Mapping service can map between the identifiers used in
        one database, to the identifiers of another, e.g., from UniProt
        to Ensembl, or to PomBase, etc. If you map to UniProtKB, UniParc
        or UniRef data, the full entries will be returned to you for
        convenience.
        """
        if not jobId:
            raise ValueError("Job ID is required")

        result = await client.make_request("idmapping", f"details/{jobId}")
        return await client.parse_response(result)

    @mcp.tool
    async def idmapping_results(
        jobId: str = Field(..., description="Unique identifier for the ID mapping job"),
        pageRequest: Optional[IDMappingRequest] = None,
    ) -> dict:
        """
        The search endpoint uses a request query to return all entries
        associated with the search term in a paginated list of entries.
        Use 'size' to specify the number of entries per page of results.
        Specify fields to return only data for specific sections of that
        entry that are of interest to you

        Example:
        >>> idmapping_results(jobId="1234567890", pageRequest=IDMappingRequest(cursor=1, size=50))
        """
        if not jobId:
            raise ValueError("Job ID is required")

        result = await client.make_request(
            "idmapping",
            f"results/{jobId}",
            params=pageRequest.model_dump(exclude_none=True) if pageRequest else None,
        )
        return await client.parse_response(result)

    @mcp.tool
    async def idmapping_stream(
        jobId: str = Field(..., description="Unique identifier for the ID mapping job"),
        download: bool = Field(
            False, description="Specify true to download the results, default is false"
        ),
    ) -> dict:
        """
        The stream endpoint uses a request query to return all entries
        associated with the search term in a single download. Specify
        fields to return only data for specific sections of that entry
        that are of interest to you

        Example:
        >>> idmapping_stream(jobId="1234567890", fields="id,name,types,organism,identity")
        """
        if not jobId:
            raise ValueError("Job ID is required")

        result = await client.make_request(
            "idmapping", f"stream/{jobId}", params={"download": download}
        )
        return await client.parse_response(result)
