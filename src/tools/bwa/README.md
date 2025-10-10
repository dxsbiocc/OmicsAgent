# BWA Tools for OmicsAgent

This directory contains BWA (Burrows-Wheeler Aligner) tools for OmicsAgent, providing both Nextflow workflows and MCP (Model Context Protocol) tools for BWA indexing and alignment operations.

## Features

- **BWA Indexing**: Create BWA index for reference genomes
- **BWA MEM Alignment**: Modern BWA alignment for paired-end reads
- **BWA ALN Alignment**: Traditional BWA alignment for older versions
- **Alignment Statistics**: Get detailed statistics from BAM files
- **Complete Pipeline**: Automated index + alignment workflow
- **MCP Integration**: Direct integration with OmicsAgent MCP server

## Files

- `nextflow_blocks.nf`: Nextflow workflow blocks for BWA operations
- `bwa_tools.py`: Core BWA functionality and utilities
- `mcp_tools.py`: MCP tool definitions for server integration
- `config.json`: Configuration file with default parameters
- `__init__.py`: Package initialization
- `README.md`: This documentation file

## Prerequisites

- BWA (Burrows-Wheeler Aligner) installed and accessible in PATH
- samtools installed and accessible in PATH
- Python 3.12+
- FastMCP for MCP server integration

## Installation

The BWA tools are automatically integrated into the OmicsAgent MCP server. No additional installation steps are required.

## Usage

### MCP Tools

The following MCP tools are available through the OmicsAgent server:

#### 1. Check Installation
```python
bwa_check_installation()
```
Returns installation status of BWA and samtools.

#### 2. Create BWA Index
```python
bwa_create_index(
    reference_fasta="path/to/reference.fa",
    output_dir="path/to/output"  # optional
)
```

#### 3. BWA MEM Alignment
```python
bwa_mem_alignment(
    reference_fasta="path/to/reference.fa",
    reads1="path/to/reads1.fq",
    reads2="path/to/reads2.fq",
    sample_name="sample_001",
    bwa_params="-t 8 -k 21 -w 100",
    output_dir="path/to/output"  # optional
)
```

#### 4. BWA ALN Alignment
```python
bwa_aln_alignment(
    reference_fasta="path/to/reference.fa",
    reads1="path/to/reads1.fq",
    reads2="path/to/reads2.fq",
    sample_name="sample_001",
    bwa_params="-t 8 -n 0.04",
    output_dir="path/to/output"  # optional
)
```

#### 5. Get Alignment Statistics
```python
bwa_get_alignment_stats(bam_file="path/to/alignment.bam")
```

#### 6. Complete Pipeline
```python
bwa_run_pipeline(
    reference_fasta="path/to/reference.fa",
    reads1="path/to/reads1.fq",
    reads2="path/to/reads2.fq",
    sample_name="sample_001",
    alignment_method="mem",  # or "aln"
    bwa_params="-t 8",
    output_dir="path/to/output"  # optional
)
```

#### 7. List Parameters
```python
bwa_list_common_parameters()
```

### Nextflow Workflows

The Nextflow blocks can be imported and used in your Nextflow pipelines:

```groovy
include { BWA_INDEX_WORKFLOW, BWA_MEM_WORKFLOW, BWA_ALN_WORKFLOW, BWA_PIPELINE } from './nextflow_blocks.nf'

workflow {
    // Index reference
    BWA_INDEX_WORKFLOW(params.reference_fasta)
    
    // Align reads
    BWA_MEM_WORKFLOW(
        params.reference_fasta,
        params.reads1,
        params.reads2,
        params.bwa_params,
        params.sample_name
    )
}
```

## Configuration

Default parameters are defined in `config.json`:

- **BWA MEM parameters**: Threads, seed length, penalties, etc.
- **BWA ALN parameters**: Mismatch tolerance, gap penalties, etc.
- **Resource requirements**: CPU, memory, and time limits
- **File formats**: Supported input/output formats

## Output Files

### Index Files
- `.amb`: BWA index file
- `.ann`: BWA index file
- `.bwt`: BWA index file
- `.pac`: BWA index file
- `.sa`: BWA index file
- `.fai`: FASTA index file

### Alignment Files
- `.sam`: SAM alignment file
- `.bam`: BAM alignment file (sorted)
- `.bai`: BAM index file
- `.sai`: BWA ALN index files (for ALN method)
- `.log`: Alignment log file

## Error Handling

All tools return structured responses with:
- `status`: "success" or "error"
- `message`: Human-readable message
- `error`: Error details (if applicable)
- `files`: Dictionary of output file paths (if successful)

## Examples

### Basic Alignment Pipeline
```python
# Check installation
install_status = bwa_check_installation()
if not install_status["both_installed"]:
    print("BWA or samtools not installed!")

# Create index
index_result = bwa_create_index("reference.fa")
if "error" in index_result:
    print(f"Index creation failed: {index_result['error']}")

# Run alignment
alignment_result = bwa_mem_alignment(
    reference_fasta="reference.fa",
    reads1="sample_R1.fq",
    reads2="sample_R2.fq",
    sample_name="sample_001",
    bwa_params="-t 8 -k 21"
)

# Get statistics
if "files" in alignment_result:
    stats = bwa_get_alignment_stats(alignment_result["files"]["bam"])
    print(f"Alignment statistics: {stats['statistics']}")
```

### Advanced Parameters
```python
# High-sensitivity alignment
alignment_result = bwa_mem_alignment(
    reference_fasta="reference.fa",
    reads1="reads1.fq",
    reads2="reads2.fq",
    sample_name="sensitive_align",
    bwa_params="-t 16 -k 15 -w 50 -d 50 -r 1.0 -c 1000"
)
```

## Troubleshooting

1. **BWA not found**: Ensure BWA is installed and in your PATH
2. **samtools not found**: Ensure samtools is installed and in your PATH
3. **Permission errors**: Check file permissions for input/output directories
4. **Memory issues**: Reduce thread count or increase available memory
5. **Timeout errors**: Increase timeout values for large files

## Support

For issues and questions:
1. Check the error messages in tool responses
2. Verify BWA and samtools installation
3. Check file paths and permissions
4. Review the configuration parameters
