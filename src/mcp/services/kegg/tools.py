"""
KEGG MCP tools implementation
"""

import re
from fastmcp import FastMCP
from pydantic import Field
from typing import Literal, Optional
from .client import KEGGClient
from services.common.utils import format_response


def register_kegg_tools(mcp: FastMCP):
    """Register KEGG tools with MCP server"""

    client = KEGGClient()

    @mcp.tool
    async def kegg_info(
        database: str = Field(..., description="KEGG database name")
    ) -> str:
        """
        This operation displays the database release information with
        statistics for the databases shown in Table 1. Except for kegg,
        genes and ligand, this operation also displays the list of
        linked databases that can be used in the link operation.
        ```
        https://rest.kegg.jp/info/<database>

        <database> = kegg | pathway | brite | module | ko | genes | <org> | vg | vp | ag |
                    genome | ligand | compound | glycan | reaction | rclass | enzyme |
                    network | variant | disease | drug | dgroup
        ```
        Parameters:
        - <database> = database name or organism code

        Returns:
        - Database information

        Example:
        >>> kegg_info(database="kegg")
        >>> kegg_info(database="pathway")
        >>> kegg_info(database="hsa")
        """
        result = await client.make_request("info", database)
        return client.parse_response(result)

    @mcp.tool
    async def kegg_list(
        database: str = Field(..., description="KEGG database name"),
        organism: Optional[str] = Field(
            None, description="Organism code (optional) or option"
        ),
    ) -> str:
        """
        This operation can be used to obtain a list of all entries in
        each database. The database names shown in Tables 1 and 2,
        excluding the composite database names of genes, ligand and
        kegg, may be given. The special database name "organism" is
        allowed only in this operation, which may be used to obtain a
        list of KEGG organisms with the three- or four-letter organism
        codes.

        When the organism code is known, the second form can be used to
        obtain a list of organism-specific pathways.

        The third form is a similar option for brite hierarchies.

        The fourth form may be used to obtain a list of definitions for
        a given set of database entry identifiers. The maximum number of
        identifiers that can be given is 10
        ```
        https://rest.kegg.jp/list/<database>/<organism>

        <database> = pathway | brite | module | ko | genes | <org> | vg | vp | ag | genome |
                    ligand | compound | glycan | reaction | rclass | enzyme | network |
                    variant | disease | drug | dgroup
        <organism> = organism code (optional) or option
        ```

        ```
        https://rest.kegg.jp/list/pathway/<org>
        ```

        ```
        https://rest.kegg.jp/list/brite/<option>

        <option> = br | jp | ko | <org>
        ```

        ```
        https://rest.kegg.jp/list/<dbentries>

        <dbentries> = Entries of the following <database>
        <database> = pathway | brite | module | ko | <org> | vg | vp | ag | genome | compound |
                    glycan | reaction | rclass | enzyme | network | variant | disease |
                    drug | dgroup
        ```

        Parameters:
        - <database> = database name or dbentries
        - <organism> = organism code (optional) or <option> = br | jp | ko | <org> (optional)

        Returns:
        - List of entries in the database

        Example:
        >>> kegg_list(database="pathway")
        >>> kegg_list(database="pathway", organism="hsa")
        >>> kegg_list(database="organism")
        >>> kegg_list(database="T01001")
        >>> kegg_list(database="hsa:10458+ece:Z5100")
        >>> kegg_list(database="C01290+G00092")
        """
        if database == "pathway":
            if organism:
                argument = f"{database}/{organism}"
        elif database == "brite":
            if not organism or organism not in ["br", "jp", "ko"]:
                raise ValueError("Organism code is required for brite database")
            argument = f"{database}/{organism}"
        else:
            argument = database

        result = await client.make_request("list", argument)
        return client.parse_response(result)

    @mcp.tool
    async def kegg_find(
        database: str = Field(..., description="KEGG database name"),
        query: str = Field(..., min_length=1, description="Search query/keyword"),
        option: Optional[Literal["formula", "exact_mass", "mol_weight", "nop"]] = Field(
            None, description="Search option"
        ),
    ) -> str:
        """
        This is a search operation. The first form searches entry
        identifier and associated fields shown below for matching
        keywords.
        ```
        https://rest.kegg.jp/find/<database>/<query>

        <database> = pathway | brite | module | ko | genes | <org> | vg | vp | ag | genome |
                    ligand | compound | glycan | reaction | rclass | enzyme | network |
                    variant | disease | drug | dgroup
        ```

        In the second form the chemical formula search is a partial
        match irrespective of the order of atoms given. The exact
        mass (or molecular weight) is checked by rounding off to the
        same decimal place as the query data. A range of values may
        also be specified with the minus(-) sign.
        ```
        https://rest.kegg.jp/find/<database>/<query>/<option>

        <database> = compound | drug | pathway | brite | module | ko | genes | <org> | vg | vp | ag | genome |
                            ligand | compound | glycan | reaction | rclass | enzyme | network |
                            variant | disease | drug | dgroup
        <option> = formula | exact_mass | mol_weight | nop
        ```

        Parameters:
        - <database> = compound | drug | pathway | brite | module | ko | genes | <org> | vg | vp | ag | genome |
                       ligand | compound | glycan | reaction | rclass | enzyme | network |
                       variant | disease | drug | dgroup
        - query: Search query/keyword
        - option: Search option (formula | exact_mass | mol_weight | nop)

        Returns:
        - List of entries matching the search criteria

        Example:
        >>> kegg_find(database="genes", query="shiga+toxin")
        >>> kegg_find(database="genes", query="\"shiga toxin\"")
        >>> kegg_find(database="compound", query="C7H10O5", option="formula")
        >>> kegg_find(database="compound", query="O5C7", option="formula")
        >>> kegg_find(database="compound", query="O5C7", option="formula")
        >>> kegg_find(database="compound", query="174.05", option="exact_mass")
        >>> kegg_find(database="compound", query="300-310", option="mol_weight")
        """
        if database in ["compound", "drug"]:
            if not option:
                raise ValueError("Option is required for compound and drug databases")
            argument = f"{database}/{query}/{option}"
        else:
            argument = f"{database}/{query}"

        result = await client.make_request("find", argument)
        return client.parse_response(result)

    @mcp.tool
    async def kegg_get(
        dbentries: str = Field(..., description="KEGG entry identifiers"),
        option: Optional[
            Literal[
                "json", "kgml", "htext", "turtle", "n-triple", "image", "aaseq", "ntseq"
            ]
        ] = Field(None, description="Search option"),
    ) -> str:
        """
        This operation retrieves given database entries in a flat file
        format or in other formats with options. Flat file formats are
        available for all KEGG databases except brite. The input is
        limited up to 10 entries.

        Options allow retrieval of selected fields, including sequence
        data from genes entries, chemical structure data or gif image
        files from compound, glycan and drug entries, png image files
        or kgml files from pathway entries. The input is limited to one
        compound/glycan/drug entry with the image option, and to one
        pathway entry with the image or kgml option.

        ```
        https://rest.kegg.jp/get/<dbentries>[/<option>]

        <dbentries> = KEGG database entries of the following <database>
        <database> = pathway | brite | module | ko | <org> | vg | vp | ag | genome | compound |
                    glycan | reaction | rclass | enzyme | network | variant | disease |
                    drug | dgroup | disease_ja | drug_ja | dgroup_ja | compound_ja

        <option> = aaseq | ntseq | mol | kcf | image | conf | kgml | json
        ```

        Parameters:
        - <dbentries> = KEGG database entries of the following <database>
        - <option> = aaseq | ntseq | mol | kcf | image | conf | kgml | json

        Returns:
        - Detailed information for specific KEGG entries

        Example:
        >>> kegg_get(dbentries="C01290+G00092")
        >>> kegg_get(dbentries="hsa:10458+ece:Z5100", option="kgml")
        >>> kegg_get(dbentries="hsa:10458+ece:Z5100", option="aaseq")
        >>> kegg_get(dbentries="C00002", option="image")
        >>> kegg_get(dbentries="hsa00600", option="image")
        >>> kegg_get(dbentries="hsa00600", option="kgml")
        >>> kegg_get(dbentries="br:br08301", option="json")
        """
        if not re.match(r"^[a-zA-Z0-9:_\-\.]+$", dbentries):
            raise ValueError("Invalid KEGG entry ID format")

        if option:
            argument = f"{dbentries}/{option}"
        else:
            argument = dbentries

        result = await client.make_request("get", argument)
        return client.parse_response(result)

    @mcp.tool
    async def kegg_convert(
        target_db: str = Field(..., description="Target database name"),
        source_db: str = Field(..., description="Source database name"),
    ) -> str:
        """
        This operation can be used to convert entry identifiers
        (accession numbers) of outside databases to KEGG identifiers,
        and vice versa. The first form allows database to database
        mapping, while the second form allows conversion of a selected
        number of entries. The database name "genes" may be used only
        in the second form.

        ```
        https://rest.kegg.jp/conv/<target_db>/<source_db>

        (<target_db> <source_db>) = (<kegg_db> <outside_db>) | (<outside_db> <kegg_db>)

        For gene identifiers:
        <kegg_db> = <org>
        <org> = KEGG organism code or T number
        <outside_db> = ncbi-geneid | ncbi-proteinid | uniprot

        For chemical substance identifiers:
        <kegg_db> = compound | glycan | drug
        <outside_db> = pubchem | chebi
        ```

        ```
        https://rest.kegg.jp/conv/<target_db>/<dbentries>

        For gene identifiers:
        <dbentries> = database entries of the following <database>
        <database> = <org> | genes | ncbi-geneid | ncbi-proteinid | uniprot
        <org> = KEGG organism code or T number

        For chemical substance identifiers:
        <dbentries> = database entries of the following <database>
        <database> = compound | glycan | drug | pubchem | chebi
        ```

        Parameters:
        - <target_db> = Target database name
        - <source_db> = Source database name
        - <dbentries> = Entries of the following <database>

        Returns:
        - Converted entries

        Example:
        >>> kegg_convert(target_db="eco", source_db="ncbi-geneid")
        >>> kegg_convert(target_db="ncbi-geneid", source_db="eco")
        >>> kegg_convert(target_db="ncbi-proteinid", source_db="hsa:10458+ece:Z5100")
        >>> kegg_convert(target_db="genes", source_db="ncbi-geneid:948364")
        """
        argument = f"{target_db}/{source_db}"

        result = await client.make_request("conv", argument)
        return client.parse_response(result)

    @mcp.tool
    async def kegg_link(
        target_db: str = Field(..., description="Target database name"),
        source_db: str = Field(..., description="Source database name"),
    ) -> str:
        """
        This operation allows retrieval of cross-references within all
        KEGG databases, as well as between KEGG databases and outside
        databases. It is useful for finding various relationships, such
        as relationships between genes and pathways. The first form
        allows retrieval of database to database cross-references, while
        the second form allows retrieval for a selected number of entries.
        The database name "genes" may be used only for "ko" entries in
        the second form.

        ```
        https://rest.kegg.jp/link/<target_db>/<source_db>

        <target_db> = <database>
        <source_db> = <database>

        <database> = pathway | brite | module | ko | <org> | vg | vp | ag | genome | compound |
                    glycan | reaction | rclass | enzyme | network | variant | disease |
                    drug | dgroup | <outside_db>
        <outside_db> = pubmed | atc | jtc | ndc | yk
        ```

        ```
        https://rest.kegg.jp/link/<target_db>/<dbentries>

        <dbentries> = KEGG database entries of the following <database>
        <database> = pathway | brite | module | ko | <org> | vg | vp | ag | genome | compound |
                    glycan | reaction | rclass | enzyme | network | variant | disease |
                    drug | dgroup | <outside_db>
        <outside_db> = pubmed | atc | jtc | ndc | yk
        ```

        Parameters:
        - <target_db> = Target database name
        - <source_db> = Source database name
        - <dbentries> = Entries of the following <database>

        Returns:
        - Cross-references between databases

        Example:
        >>> kegg_link(target_db="pathway", source_db="hsa")
        >>> kegg_link(target_db="hsa", source_db="pathway")
        >>> kegg_link(target_db="genes", source_db="K00500")
        >>> kegg_link(target_db="hsa", source_db="hsa00010")
        >>> kegg_link(target_db="ko", source_db="ko00010")
        >>> kegg_link(target_db="rn", source_db="rn00010")
        >>> kegg_link(target_db="ec", source_db="ec00010")
        >>> kegg_link(target_db="cpd", source_db="map00010")
        >>> kegg_link(target_db="pathway", source_db="hsa:10458+ece:Z5100")
        """
        argument = f"{target_db}/{source_db}"

        result = await client.make_request("link", argument)
        return client.parse_response(result)

    @mcp.tool
    async def kegg_drug_interaction(
        dbentry: str = Field(..., description="KEGG drug entry identifier")
    ) -> str:
        """
        This operation searches against the KEGG drug interaction
        database, where drug-drug interactions designated as
        contraindication (CI) and precaution (P) in Japanese drug
        labels are extracted, standardized by KEGG identifiers and
        annotated with any possible molecular mechanims. The first
        form reports all known interactions, while the second form
        can be used to check if any drug pair in a given set of drugs
        is CI or P.

        ```
        https://rest.kegg.jp/ddi/<dbentry>

        <dbentry> = Single entry of the following <database>
        <database> = drug | ndc | yj
        ```
        ```
        https://rest.kegg.jp/ddi/<dbentries>

        <dbentries> = Multiple entries in one of the following <database>
        <database> = drug | ndc | yj
        ```

        Parameters:
        - <dbentry> = Single entry of the following <database>

        Returns:
        - Drug-drug interactions

        Example:
        >>> kegg_drug_interaction(dbentry="D00564")
        >>> kegg_drug_interaction(dbentry="D00564+D00100+D00109")
        >>> kegg_drug_interaction(dbentry="ndc:0078-0401")
        """
        result = await client.make_request("ddi", dbentry)
        return client.parse_response(result)

    @mcp.tool
    async def kegg_get_pathway(
        pathway_id: str = Field(
            ...,
            min_length=1,
            description="Pathway identifier, e.g. hsa00010, map00010, etc.",
        ),
        format_type: Literal[
            "json", "kgml", "htext", "turtle", "n-triple", "image", "aaseq", "ntseq"
        ] = Field("json", description="Output format"),
    ) -> str:
        """
        Get KEGG pathway information in specified format
        ```
        https://rest.kegg.jp/get/<pathway_id>/<format_type>

        <pathway_id> = Pathway identifier, e.g. hsa00010, map00010, etc.
        <format_type> = Output format, e.g. json, kgml, image
        ```
        """
        result = await client.make_request("get", f"{pathway_id}/{format_type}")
        return client.parse_response(result)

    @mcp.tool
    async def kegg_get_compound(
        compound_id: str = Field(
            ...,
            min_length=1,
            description="Compound identifier, e.g. C00010, C00020, etc.",
        )
    ) -> str:
        """Get KEGG compound information"""
        if not re.match(r"^[C]\d{5}$", compound_id):
            raise ValueError("Invalid compound ID format. Expected C#####")
        result = await client.make_request("get", compound_id)
        return client.parse_response(result)

    @mcp.tool
    async def kegg_get_gene(
        gene_id: str = Field(
            ...,
            min_length=1,
            description="Gene identifier, e.g. hsa:10458, eco:b0001, etc.",
        )
    ) -> str:
        """Get KEGG gene information"""
        if not re.match(r"^[a-z]{3}:\w+$", gene_id):
            raise ValueError(
                "Invalid gene ID format. Expected hsa:10458, eco:b0001, etc."
            )
        result = await client.make_request("get", gene_id)
        return client.parse_response(result)

    @mcp.tool
    async def kegg_find_pathways_by_gene(
        gene_id: str = Field(
            ...,
            min_length=1,
            description="Gene identifier, e.g. hsa:10458, eco:b0001, etc.",
        )
    ) -> str:
        """Find pathways associated with a specific gene"""
        if not re.match(r"^[a-z]{3}:\w+$", gene_id):
            raise ValueError(
                "Invalid gene ID format. Expected hsa:10458, eco:b0001, etc."
            )
        result = await client.make_request("link", f"pathway/{gene_id}")
        return client.parse_response(result)

    @mcp.tool
    async def kegg_find_genes_in_pathway(
        pathway_id: str = Field(
            ...,
            min_length=1,
            description="Pathway identifier, e.g. hsa00010, map00010, etc.",
        )
    ) -> str:
        """Find genes in a specific pathway"""
        if not re.match(r"^[a-z]{3}\d{5}$|^map\d{5}$", pathway_id):
            raise ValueError(
                "Invalid pathway ID format. Expected hsa00010, map00010, etc."
            )
        result = await client.make_request("link", f"hsa/{pathway_id}")
        return client.parse_response(result)

    @mcp.tool
    async def kegg_search_compounds(
        keyword: str = Field(
            ...,
            min_length=1,
            description="Search keyword, query string",
        )
    ) -> str:
        """Search for compounds by keyword"""
        result = await client.make_request("find", f"compound/{keyword}")
        return client.parse_response(result)

    @mcp.tool
    async def kegg_search_pathways(
        keyword: str = Field(
            ...,
            min_length=1,
            description="Search keyword, query string",
        )
    ) -> str:
        """Search for pathways by keyword"""
        result = await client.make_request("find", f"pathway/{keyword}")
        return client.parse_response(result)
