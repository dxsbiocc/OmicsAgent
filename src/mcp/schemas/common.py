"""
Common validation patterns and utilities for MCP services
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from enum import Enum
import re


class DatabaseType(str, Enum):
    """Common database types"""

    PATHWAY = "pathway"
    COMPOUND = "compound"
    GENE = "gene"
    PROTEIN = "protein"
    REACTION = "reaction"
    ENZYME = "enzyme"
    DISEASE = "disease"
    DRUG = "drug"


class FormatType(str, Enum):
    """Common format types"""

    JSON = "json"
    XML = "xml"
    CSV = "csv"
    TSV = "tsv"
    FASTA = "fasta"
    KGML = "kgml"
    HTEXT = "htext"
    TURTLE = "turtle"
    N_TRIPLE = "n-triple"


class BaseSearchParams(BaseModel):
    """Base search parameters"""

    query: str = Field(..., min_length=1, max_length=200, description="Search query")
    limit: Optional[int] = Field(
        10, ge=1, le=100, description="Maximum number of results"
    )
    offset: Optional[int] = Field(0, ge=0, description="Number of results to skip")

    @field_validator("query")
    @classmethod
    def validate_query(cls, v):
        if not v.strip():
            raise ValueError("Query cannot be empty")
        return v.strip()


class BaseGetParams(BaseModel):
    """Base get parameters"""

    entry_id: str = Field(..., min_length=1, description="Entry identifier")
    format_type: Optional[FormatType] = Field(
        FormatType.JSON, description="Output format"
    )

    @field_validator("entry_id")
    @classmethod
    def validate_entry_id(cls, v):
        if not re.match(r"^[a-zA-Z0-9:_\-\.]+$", v):
            raise ValueError("Invalid entry ID format")
        return v


class BaseListParams(BaseModel):
    """Base list parameters"""

    database: str = Field(..., description="Database name")
    limit: Optional[int] = Field(
        100, ge=1, le=1000, description="Maximum number of results"
    )
    offset: Optional[int] = Field(0, ge=0, description="Number of results to skip")


class BaseConvertParams(BaseModel):
    """Base conversion parameters"""

    source_db: str = Field(..., description="Source database")
    target_db: str = Field(..., description="Target database")
    entry_ids: Optional[List[str]] = Field(
        None, description="Specific entry IDs to convert"
    )


class BaseLinkParams(BaseModel):
    """Base link parameters"""

    source_db: str = Field(..., description="Source database")
    target_db: str = Field(..., description="Target database")
    entry_ids: Optional[List[str]] = Field(
        None, description="Specific entry IDs to link"
    )


def validate_id_format(id_value: str, pattern: str, error_message: str) -> str:
    """Generic ID format validation"""
    if not re.match(pattern, id_value):
        raise ValueError(error_message)
    return id_value


def validate_database_name(db_name: str, valid_databases: List[str]) -> str:
    """Generic database name validation"""
    if db_name not in valid_databases:
        raise ValueError(
            f"Invalid database name. Must be one of: {', '.join(valid_databases)}"
        )
    return db_name


def validate_organism_code(org_code: str, valid_organisms: List[str]) -> str:
    """Generic organism code validation"""
    if org_code not in valid_organisms:
        raise ValueError(
            f"Invalid organism code. Must be one of: {', '.join(valid_organisms)}"
        )
    return org_code
