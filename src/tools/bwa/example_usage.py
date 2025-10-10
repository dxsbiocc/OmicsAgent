#!/usr/bin/env python3
"""
Example usage of BWA tools for OmicsAgent
Demonstrates how to use the BWA MCP tools
"""

import sys
import os
from pathlib import Path

# Add the parent directory to the path to import the tools
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from bwa.bwa_tools import BWATools


def example_basic_pipeline():
    """Example of a basic BWA pipeline"""
    print("=== Basic BWA Pipeline Example ===")

    # Initialize BWA tools
    bwa = BWATools()

    # Check installation
    print("Checking BWA installation...")
    bwa_installed = bwa.check_bwa_installation()
    samtools_installed = bwa.check_samtools_installation()

    print(f"BWA installed: {bwa_installed}")
    print(f"samtools installed: {samtools_installed}")

    if not (bwa_installed and samtools_installed):
        print("ERROR: BWA or samtools not installed!")
        return

    # Example file paths (replace with your actual files)
    reference_fasta = "path/to/reference.fa"
    reads1 = "path/to/reads1.fq"
    reads2 = "path/to/reads2.fq"
    sample_name = "example_sample"

    print(f"\nUsing reference: {reference_fasta}")
    print(f"Using reads: {reads1}, {reads2}")
    print(f"Sample name: {sample_name}")

    # Create index
    print("\nCreating BWA index...")
    index_result = bwa.create_bwa_index(reference_fasta)

    if "error" in index_result:
        print(f"Index creation failed: {index_result['error']}")
        return

    print(f"Index created successfully: {index_result['message']}")
    print(f"Index files: {index_result['index_files']}")

    # Run alignment
    print("\nRunning BWA MEM alignment...")
    alignment_result = bwa.run_bwa_mem(
        reference_fasta=reference_fasta,
        reads1=reads1,
        reads2=reads2,
        sample_name=sample_name,
        bwa_params="-t 8 -k 21",
    )

    if "error" in alignment_result:
        print(f"Alignment failed: {alignment_result['error']}")
        return

    print(f"Alignment completed: {alignment_result['message']}")
    print(f"Output files: {alignment_result['files']}")

    # Get statistics
    if "files" in alignment_result and "bam" in alignment_result["files"]:
        print("\nGetting alignment statistics...")
        stats_result = bwa.get_alignment_stats(alignment_result["files"]["bam"])

        if "error" in stats_result:
            print(f"Stats extraction failed: {stats_result['error']}")
        else:
            print("Alignment statistics:")
            for stat, value in stats_result["statistics"].items():
                print(f"  {stat}: {value}")


def example_parameter_tuning():
    """Example of parameter tuning for different scenarios"""
    print("\n=== Parameter Tuning Examples ===")

    bwa = BWATools()

    # High sensitivity parameters
    print("High sensitivity parameters:")
    high_sens_params = "-t 16 -k 15 -w 50 -d 50 -r 1.0 -c 1000 -A 1 -B 2 -O 3 -E 1"
    print(f"  {high_sens_params}")

    # Fast alignment parameters
    print("Fast alignment parameters:")
    fast_params = "-t 8 -k 19 -w 100 -d 100 -r 1.5 -c 500"
    print(f"  {fast_params}")

    # Memory-efficient parameters
    print("Memory-efficient parameters:")
    mem_efficient_params = "-t 4 -k 21 -w 200 -d 200 -r 2.0 -c 1000"
    print(f"  {mem_efficient_params}")


def example_error_handling():
    """Example of error handling"""
    print("\n=== Error Handling Example ===")

    bwa = BWATools()

    # Try to create index for non-existent file
    print("Testing error handling with non-existent file...")
    result = bwa.create_bwa_index("non_existent_file.fa")

    if "error" in result:
        print(f"Expected error caught: {result['error']}")
    else:
        print("Unexpected: No error for non-existent file")


def example_configuration():
    """Example of using configuration"""
    print("\n=== Configuration Example ===")

    import json

    # Load configuration
    config_path = Path(__file__).parent / "config.json"
    with open(config_path, "r") as f:
        config = json.load(f)

    print("Default BWA MEM parameters:")
    mem_params = config["bwa_config"]["default_parameters"]["mem"]
    for param, value in mem_params.items():
        print(f"  {param}: {value}")

    print("\nResource requirements for indexing:")
    index_reqs = config["bwa_config"]["resource_requirements"]["index"]
    for req, value in index_reqs.items():
        print(f"  {req}: {value}")


def main():
    """Main function to run examples"""
    print("BWA Tools Example Usage")
    print("=" * 50)

    # Run examples
    example_basic_pipeline()
    example_parameter_tuning()
    example_error_handling()
    example_configuration()

    print("\n" + "=" * 50)
    print("Examples completed!")


if __name__ == "__main__":
    main()
