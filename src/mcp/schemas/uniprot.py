from pydantic import BaseModel, Field
from schemas.base import SuccessResponse, ErrorResponse
from typing import Optional


class UniprotSuccessResponse(SuccessResponse):
    url: Optional[str] = None
    operation: Optional[str] = None
    argument: Optional[str] = None


class UniprotErrorResponse(ErrorResponse):
    url: Optional[str] = None
    operation: Optional[str] = None
    argument: Optional[str] = None


class UniProtKBParams(BaseModel):
    fields: Optional[str] = Field(
        None,
        description="List of entry sections (fields) to be returned, separated by commas. e.g. id, accession,protein_name,cc_function,ft_binding.",
    )
    version: Optional[str] = Field(
        None,
        description="Version of the entry. Versions are integers 1 or above; enter last for the latest version. Please note that when passing version file formats are restricted to fasta and txt only.",
    )


class UniProtKBStreamParams(BaseModel):
    query: str = Field(
        ...,
        description="Criteria to search UniProtKB. Advanced queries can be built with parentheses and conditionals such as AND, OR and NOT. List of valid search fields. e.g. insulin AND reviewed:true",
    )
    fields: Optional[str] = Field(
        None,
        description="List of entry sections (fields) to be returned, separated by commas. List of valid fields. eg. accession,protein_name,cc_function,ft_binding.",
    )
    sort: Optional[str] = Field(
        None,
        description="Specify field by which to sort results. e.g. accession desc.",
    )
    includeIsoform: Optional[bool] = Field(
        None,
        description="Specify true to include isoforms, default is false.",
    )
    download: Optional[str] = Field(
        None,
        description="Specify true to download the results, default is false.",
    )


class UniProtKBSearchParams(BaseModel):
    query: str = Field(
        ...,
        description="Criteria to search UniProtKB. Advanced queries can be built with parentheses and conditionals such as AND, OR and NOT. List of valid search fields. e.g. insulin AND reviewed:true",
    )
    fields: Optional[str] = Field(
        None,
        description="List of entry sections (fields) to be returned, separated by commas. List of valid fields. eg. accession,protein_name,cc_function,ft_binding.",
    )
    sort: Optional[str] = Field(
        None,
        description="Specify field by which to sort results. e.g. accession desc.",
    )
    includeIsoform: Optional[bool] = Field(
        None,
        description="Specify true to include isoforms, default is false.",
    )
    size: Optional[int] = Field(
        None,
        description="Specify the number of entries per page of results (Pagination size). Default is 25, max is 500.",
    )


class UniRefMembersParams(BaseModel):
    facetFilter: str = Field(
        ...,
        description="Facet filter query for UniRef Cluster Members. eg member_id_type:uniprotkb_id.",
    )
    size: Optional[int] = Field(
        None,
        description="Specify the number of entries per page of results (Pagination size). Default is 25, max is 500",
    )


class UniRefSearchParams(BaseModel):
    query: str = Field(
        ...,
        description="Criteria to search UniRef. Advanced queries can be built with parentheses and conditionals such as AND, OR and NOT. List of valid search fields. e.g. UniRef100_P05067",
    )
    sort: Optional[str] = Field(
        None,
        description="Specify field by which to sort results. e.g. id desc.",
    )
    fields: Optional[str] = Field(
        None,
        description="List of entry sections (fields) to be returned, separated by commas. List of valid fields. eg. id,name,types,organism,identity.",
    )
    complete: Optional[bool] = Field(
        None,
        description="Flag to include all member ids and organisms, or not. By default, it returns a maximum of 10 member ids and organisms.",
    )
    size: Optional[int] = Field(
        None,
        description="Specify the number of entries per page of results (Pagination size). Default is 25, max is 500.",
    )


class IDMappingParams(BaseModel):
    fromDb: str = Field(
        ...,
        description="Source database name, eg. UniProtKB or UniProtKB-Swiss-Prot or UniParc etc.",
    )
    to: str = Field(
        ...,
        description="Target database name, eg. uniprotkb, uniparc, uniref, etc.",
    )
    ids: str = Field(
        ...,
        description="your id list in comma separated form.",
    )
    taxId: Optional[int] = Field(
        None,
        description="Taxonomy ID. e.g. 9606, 10090, etc.",
    )


class IDMappingRequest(BaseModel):
    cursor: Optional[int] = Field(
        None,
        description="Specify the page number of results to return (Pagination page). Default is 1, max is 100.",
    )
    size: Optional[int] = Field(
        None,
        description="Specify the number of entries.",
    )
