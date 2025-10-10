"""
MCP Tools for BWA functionality
Integrates BWA tools with the MCP server
"""

from fastmcp import FastMCP
from typing import Optional, Dict, Any
import json
import os
from pathlib import Path
from .bwa_tools import BWATools

# Initialize BWA tools
bwa_tools = BWATools()


def register_bwa_tools(mcp: FastMCP):
    """Register BWA tools with the MCP server"""

    @mcp.tool
    def bwa_check_installation() -> Dict[str, Any]:
        """
        Check if BWA and samtools are installed and accessible

        Returns:
            Dictionary with installation status of BWA and samtools
        """
        bwa_installed = bwa_tools.check_bwa_installation()
        samtools_installed = bwa_tools.check_samtools_installation()

        return {
            "bwa_installed": bwa_installed,
            "samtools_installed": samtools_installed,
            "both_installed": bwa_installed and samtools_installed,
            "message": "Installation check completed",
        }

    @mcp.tool
    def bwa_create_index(
        reference_fasta: str, output_dir: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create BWA index for reference genome

        Args:
            reference_fasta: Path to reference FASTA file
            output_dir: Output directory for index files (optional)

        Returns:
            Dictionary with index creation results and file paths
        """
        return bwa_tools.create_bwa_index(reference_fasta, output_dir)

    @mcp.tool
    def bwa_mem_alignment(
        reference_fasta: str,
        reads1: str,
        reads2: str,
        sample_name: str,
        bwa_params: str = "-t 8",
        output_dir: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Run BWA MEM alignment

        Args:
            reference_fasta: Path to reference FASTA file
            reads1: Path to first read file (R1)
            reads2: Path to second read file (R2)
            sample_name: Name for output files
            bwa_params: BWA MEM parameters (default: "-t 8")
            output_dir: Output directory (optional)

        Returns:
            Dictionary with alignment results and file paths
        """
        return bwa_tools.run_bwa_mem(
            reference_fasta, reads1, reads2, sample_name, bwa_params, output_dir
        )

    @mcp.tool
    def bwa_aln_alignment(
        reference_fasta: str,
        reads1: str,
        reads2: str,
        sample_name: str,
        bwa_params: str = "-t 8",
        output_dir: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Run BWA ALN alignment (for older BWA versions)

        Args:
            reference_fasta: Path to reference FASTA file
            reads1: Path to first read file (R1)
            reads2: Path to second read file (R2)
            sample_name: Name for output files
            bwa_params: BWA ALN parameters (default: "-t 8")
            output_dir: Output directory (optional)

        Returns:
            Dictionary with alignment results and file paths
        """
        return bwa_tools.run_bwa_aln(
            reference_fasta, reads1, reads2, sample_name, bwa_params, output_dir
        )

    @mcp.tool
    def bwa_get_alignment_stats(bam_file: str) -> Dict[str, Any]:
        """
        Get alignment statistics from BAM file

        Args:
            bam_file: Path to BAM file

        Returns:
            Dictionary with alignment statistics
        """
        return bwa_tools.get_alignment_stats(bam_file)

    @mcp.tool
    def bwa_run_pipeline(
        reference_fasta: str,
        reads1: str,
        reads2: str,
        sample_name: str,
        alignment_method: str = "mem",
        bwa_params: str = "-t 8",
        output_dir: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Run complete BWA pipeline (index + alignment)

        Args:
            reference_fasta: Path to reference FASTA file
            reads1: Path to first read file (R1)
            reads2: Path to second read file (R2)
            sample_name: Name for output files
            alignment_method: Alignment method ("mem" or "aln")
            bwa_params: BWA parameters (default: "-t 8")
            output_dir: Output directory (optional)

        Returns:
            Dictionary with complete pipeline results
        """
        # First create index
        index_result = bwa_tools.create_bwa_index(reference_fasta, output_dir)
        if "error" in index_result:
            return {
                "status": "error",
                "step": "indexing",
                "error": index_result["error"],
            }

        # Then run alignment
        if alignment_method.lower() == "mem":
            alignment_result = bwa_tools.run_bwa_mem(
                reference_fasta, reads1, reads2, sample_name, bwa_params, output_dir
            )
        else:
            alignment_result = bwa_tools.run_bwa_aln(
                reference_fasta, reads1, reads2, sample_name, bwa_params, output_dir
            )

        if "error" in alignment_result:
            return {
                "status": "error",
                "step": "alignment",
                "index_result": index_result,
                "error": alignment_result["error"],
            }

        return {
            "status": "success",
            "message": "BWA pipeline completed successfully",
            "index_result": index_result,
            "alignment_result": alignment_result,
            "pipeline_summary": {
                "reference": reference_fasta,
                "reads": [reads1, reads2],
                "sample_name": sample_name,
                "alignment_method": alignment_method,
                "bwa_params": bwa_params,
                "output_dir": output_dir or "current directory",
            },
        }

    @mcp.tool
    def bwa_list_common_parameters() -> Dict[str, Any]:
        """
        List common BWA parameters and their descriptions

        Returns:
            Dictionary with BWA parameters and descriptions
        """
        return {
            "bwa_mem_parameters": {
                "-t": "Number of threads (default: 1)",
                "-k": "Minimum seed length (default: 19)",
                "-w": "Band width for banded alignment (default: 100)",
                "-d": "Off-diagonal X-dropoff (default: 100)",
                "-r": "Look for internal seeds inside a seed longer than {-k} (default: 1.5)",
                "-c": "Skip seeds with more than INT occurrences (default: 500)",
                "-D": "Drop chains shorter than FLOAT fraction of the longest overlapping chain (default: 0.50)",
                "-W": "Discard a chain if seeded bases shorter than INT (default: 0)",
                "-m": "Maximum number of alignments to output (default: 5)",
                "-S": "Skip mate rescue",
                "-P": "Skip pairing; mate rescue performed unless -S also in use",
                "-A": "Matching score (default: 1)",
                "-B": "Mismatch penalty (default: 4)",
                "-O": "Gap open penalty (default: 6)",
                "-E": "Gap extension penalty (default: 1)",
                "-L": "Clipping penalty (default: 5)",
                "-U": "Penalty for an unpaired read pair (default: 17)",
                "-R": "Read group header line such as '@RG\\tID:foo\\tSM:bar'",
                "-v": "Verbose level (default: 3)",
                "-T": "Minimum score to output (default: 30)",
                "-h": "Number of hits to output (default: 5)",
                "-a": "Output all alignments for SE or unpaired PE",
                "-C": "Append append FASTA/FASTQ comment to SAM output",
                "-V": "Output the reference FASTA header in the XR tag",
                "-Y": "Use soft clipping for supplementary alignments",
                "-x": "Path to read-to-alt-ref mapping file",
                "-p": "First query file consists of interleaved paired-end sequences",
                "-j": "Treat ALT contigs as part of the primary assembly",
            },
            "bwa_aln_parameters": {
                "-t": "Number of threads (default: 1)",
                "-n": "Maximum number of mismatches allowed (default: 0.04)",
                "-o": "Maximum number of gap opens (default: 1)",
                "-e": "Maximum number of gap extensions (default: -1)",
                "-d": "Disallow a long deletion (default: 16)",
                "-i": "Disallow an indel (default: 5)",
                "-l": "Take the first INT subsequence as seed (default: 32)",
                "-k": "Maximum edit distance in the seed (default: 2)",
                "-m": "Maximum number of gap opens (default: 1)",
                "-t": "Number of threads (default: 1)",
                "-M": "Mismatch penalty (default: 3)",
                "-O": "Gap open penalty (default: 11)",
                "-E": "Gap extension penalty (default: 4)",
                "-R": "Stop when the first INT best hits are found (default: 0)",
                "-q": "Quality threshold for read trimming down to 35bp (default: 0)",
                "-f": "Don't output the SA:Z tag",
                "-B": "Length of the barcode starting from the 5' end (default: 0)",
                "-b": "Length of the barcode starting from the 3' end (default: 0)",
                "-N": "Disable iterative search",
                "-I": "The input is in the Illumina 1.3+ FASTQ-like format",
                "-B": "Length of the barcode starting from the 5' end (default: 0)",
                "-b": "Length of the barcode starting from the 3' end (default: 0)",
            },
            "usage_examples": {
                "basic_mem": "bwa mem -t 8 reference.fa reads1.fq reads2.fq",
                "advanced_mem": "bwa mem -t 8 -k 21 -w 100 -d 100 -r 1.5 reference.fa reads1.fq reads2.fq",
                "basic_aln": "bwa aln -t 8 reference.fa reads1.fq > reads1.sai",
                "advanced_aln": "bwa aln -t 8 -n 0.04 -o 1 -e -1 reference.fa reads1.fq > reads1.sai",
            },
        }
