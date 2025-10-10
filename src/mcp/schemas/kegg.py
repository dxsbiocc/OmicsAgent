from typing import Optional
from schemas.base import SuccessResponse, ErrorResponse


# KEGG Database mappings
KEGG_DATABASES = {
    "pathway": "path",
    "brite": "br",
    "module": "md",
    "orthology": "ko",
    "genes": "genes",
    "genome": "gn",
    "compound": "cpd",
    "glycan": "gl",
    "reaction": "rn",
    "rclass": "rc",
    "enzyme": "ec",
    "network": "ne",
    "variant": "hsa_var",
    "disease": "ds",
    "drug": "dr",
    "dgroup": "dg",
}

# Common organism codes
ORGANISM_CODE = [
    "hsa",
    "mmu",
    "rno",
    "dre",
    "dme",
    "eco",
    "sce",
    "ath",
    "bta",
    "gga",
    "ssc",
    "cfa",
    "xtr",
    "cel",
    "ddi",
    "spn",
    "mja",
    "afu",
    "tvo",
    "pfu",
]

# Outside databases
OUTSIDE_DATABASES = [
    "pubmed",
    "ncbi-geneid",
    "ncbi-proteinid",
    "uniprot",
    "pubchem",
    "chebi",
    "atc",
    "jtc",
    "ndc",
    "yj",
    "yk",
]

# KEGG operations and their valid parameters
OPERATION = {
    "info": {
        "database": [
            "pathway",
            "brite",
            "module",
            "ko",
            "genome",
            "compound",
            "glycan",
            "reaction",
            "rclass",
            "enzyme",
            "network",
            "variant",
            "disease",
            "drug",
            "dgroup",
            "kegg",
            "genes",
            "ligand",
        ]
    },
    "get": {
        "option": [
            "json",
            "kgml",
            "htext",
            "turtle",
            "n-triple",
            "image",
            "aaseq",
            "ntseq",
        ]
    },
    "link": {
        "database": [
            "pathway",
            "brite",
            "module",
            "ko",
            "genome",
            "compound",
            "glycan",
            "reaction",
            "rclass",
            "enzyme",
            "network",
            "variant",
            "disease",
            "drug",
            "dgroup",
        ],
        "outside_db": [
            "pubmed",
            "ncbi-geneid",
            "ncbi-proteinid",
            "uniprot",
            "pubchem",
            "chebi",
            "atc",
            "jtc",
            "ndc",
            "yj",
            "yk",
        ],
    },
}


class KEGGSuccessResponse(SuccessResponse):
    url: Optional[str] = None
    data: Optional[str] = None
    content_type: Optional[str] = None
    operation: Optional[str] = None
    argument: Optional[str] = None


class KEGGErrorResponse(ErrorResponse):
    url: Optional[str] = None
    operation: Optional[str] = None
    argument: Optional[str] = None
