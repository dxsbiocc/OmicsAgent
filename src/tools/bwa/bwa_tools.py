"""
BWA Tools for OmicsAgent MCP Server
Provides BWA indexing and alignment functionality through MCP tools
"""

import os
import subprocess
import tempfile
from pathlib import Path
from typing import Optional, Dict, Any, List
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BWATools:
    """BWA tools for indexing and alignment operations"""

    def __init__(self, work_dir: Optional[str] = None):
        """
        Initialize BWA tools

        Args:
            work_dir: Working directory for temporary files. If None, uses system temp.
        """
        self.work_dir = (
            Path(work_dir) if work_dir else Path(tempfile.gettempdir()) / "bwa_work"
        )
        self.work_dir.mkdir(parents=True, exist_ok=True)

    def check_bwa_installation(self) -> bool:
        """Check if BWA is installed and accessible"""
        try:
            result = subprocess.run(["bwa"], capture_output=True, text=True, timeout=30)
            return result.returncode == 1  # BWA returns 1 when called without args
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False

    def check_samtools_installation(self) -> bool:
        """Check if samtools is installed and accessible"""
        try:
            result = subprocess.run(
                ["samtools", "--version"], capture_output=True, text=True, timeout=30
            )
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False

    def create_bwa_index(
        self, reference_fasta: str, output_dir: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create BWA index for reference genome

        Args:
            reference_fasta: Path to reference FASTA file
            output_dir: Output directory for index files. If None, uses same dir as reference.

        Returns:
            Dictionary with index file paths and status
        """
        try:
            ref_path = Path(reference_fasta)
            if not ref_path.exists():
                return {"error": f"Reference file not found: {reference_fasta}"}

            if output_dir:
                output_path = Path(output_dir)
                output_path.mkdir(parents=True, exist_ok=True)
            else:
                output_path = ref_path.parent

            # Check if index already exists
            index_files = [".amb", ".ann", ".bwt", ".pac", ".sa"]
            existing_files = [
                f for f in index_files if (output_path / f"{ref_path.stem}{f}").exists()
            ]

            if len(existing_files) == len(index_files):
                logger.info(f"BWA index already exists for {reference_fasta}")
                return {
                    "status": "success",
                    "message": "Index already exists",
                    "index_files": {
                        f: str(output_path / f"{ref_path.stem}{f}") for f in index_files
                    },
                }

            # Create BWA index
            cmd = ["bwa", "index", str(ref_path)]
            logger.info(f"Running: {' '.join(cmd)}")

            result = subprocess.run(
                cmd,
                cwd=str(output_path),
                capture_output=True,
                text=True,
                timeout=3600,  # 1 hour timeout
            )

            if result.returncode != 0:
                return {
                    "error": f"BWA index failed: {result.stderr}",
                    "stdout": result.stdout,
                }

            # Create FASTA index
            samtools_cmd = ["samtools", "faidx", str(ref_path)]
            subprocess.run(samtools_cmd, cwd=str(output_path), timeout=300)

            # Verify index files
            index_files_dict = {}
            for ext in index_files:
                index_file = output_path / f"{ref_path.stem}{ext}"
                if index_file.exists():
                    index_files_dict[ext] = str(index_file)

            return {
                "status": "success",
                "message": "BWA index created successfully",
                "index_files": index_files_dict,
                "reference": str(ref_path),
                "output_dir": str(output_path),
            }

        except subprocess.TimeoutExpired:
            return {"error": "BWA indexing timed out"}
        except Exception as e:
            return {"error": f"Unexpected error during BWA indexing: {str(e)}"}

    def run_bwa_mem(
        self,
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
            output_dir: Output directory. If None, uses current directory.

        Returns:
            Dictionary with alignment results and file paths
        """
        try:
            # Validate input files
            for file_path in [reference_fasta, reads1, reads2]:
                if not Path(file_path).exists():
                    return {"error": f"Input file not found: {file_path}"}

            if output_dir:
                output_path = Path(output_dir)
                output_path.mkdir(parents=True, exist_ok=True)
            else:
                output_path = Path.cwd()

            # Run BWA MEM
            sam_file = output_path / f"{sample_name}.sam"
            bam_file = output_path / f"{sample_name}.bam"

            cmd = (
                ["bwa", "mem"] + bwa_params.split() + [reference_fasta, reads1, reads2]
            )
            logger.info(f"Running: {' '.join(cmd)}")

            with open(sam_file, "w") as f:
                result = subprocess.run(
                    cmd,
                    stdout=f,
                    stderr=subprocess.PIPE,
                    text=True,
                    timeout=7200,  # 2 hour timeout
                )

            if result.returncode != 0:
                return {
                    "error": f"BWA MEM failed: {result.stderr}",
                    "sam_file": str(sam_file),
                }

            # Convert SAM to BAM and sort
            samtools_cmd = ["samtools", "view", "-bS", str(sam_file)]
            sort_cmd = ["samtools", "sort", "-o", str(bam_file), "-"]

            logger.info("Converting SAM to BAM and sorting...")
            p1 = subprocess.Popen(samtools_cmd, stdout=subprocess.PIPE)
            p2 = subprocess.Popen(
                sort_cmd,
                stdin=p1.stdout,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            p1.stdout.close()
            stdout, stderr = p2.communicate()

            if p2.returncode != 0:
                return {
                    "error": f"SAM to BAM conversion failed: {stderr.decode()}",
                    "sam_file": str(sam_file),
                }

            # Index BAM file
            index_cmd = ["samtools", "index", str(bam_file)]
            subprocess.run(index_cmd, timeout=300)

            # Create log file
            log_file = output_path / f"{sample_name}.log"
            with open(log_file, "w") as f:
                f.write(f"BWA MEM alignment completed for {sample_name}\n")
                f.write(f"Reference: {reference_fasta}\n")
                f.write(f"Reads: {reads1}, {reads2}\n")
                f.write(f"Parameters: {bwa_params}\n")
                f.write(f"Command: {' '.join(cmd)}\n")

            return {
                "status": "success",
                "message": "BWA MEM alignment completed successfully",
                "files": {
                    "sam": str(sam_file),
                    "bam": str(bam_file),
                    "bai": str(bam_file.with_suffix(".bam.bai")),
                    "log": str(log_file),
                },
                "sample_name": sample_name,
                "reference": reference_fasta,
                "reads": [reads1, reads2],
            }

        except subprocess.TimeoutExpired:
            return {"error": "BWA MEM alignment timed out"}
        except Exception as e:
            return {"error": f"Unexpected error during BWA MEM alignment: {str(e)}"}

    def run_bwa_aln(
        self,
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
            output_dir: Output directory. If None, uses current directory.

        Returns:
            Dictionary with alignment results and file paths
        """
        try:
            # Validate input files
            for file_path in [reference_fasta, reads1, reads2]:
                if not Path(file_path).exists():
                    return {"error": f"Input file not found: {file_path}"}

            if output_dir:
                output_path = Path(output_dir)
                output_path.mkdir(parents=True, exist_ok=True)
            else:
                output_path = Path.cwd()

            # Run BWA ALN for each read file
            sai1_file = output_path / f"{sample_name}_1.sai"
            sai2_file = output_path / f"{sample_name}_2.sai"
            sam_file = output_path / f"{sample_name}.sam"
            bam_file = output_path / f"{sample_name}.bam"

            # ALN for R1
            cmd1 = ["bwa", "aln"] + bwa_params.split() + [reference_fasta, reads1]
            logger.info(f"Running: {' '.join(cmd1)}")

            with open(sai1_file, "w") as f:
                result1 = subprocess.run(
                    cmd1, stdout=f, stderr=subprocess.PIPE, text=True, timeout=3600
                )

            if result1.returncode != 0:
                return {"error": f"BWA ALN failed for R1: {result1.stderr}"}

            # ALN for R2
            cmd2 = ["bwa", "aln"] + bwa_params.split() + [reference_fasta, reads2]
            logger.info(f"Running: {' '.join(cmd2)}")

            with open(sai2_file, "w") as f:
                result2 = subprocess.run(
                    cmd2, stdout=f, stderr=subprocess.PIPE, text=True, timeout=3600
                )

            if result2.returncode != 0:
                return {"error": f"BWA ALN failed for R2: {result2.stderr}"}

            # Generate SAM file
            sampe_cmd = [
                "bwa",
                "sampe",
                reference_fasta,
                str(sai1_file),
                str(sai2_file),
                reads1,
                reads2,
            ]
            logger.info(f"Running: {' '.join(sampe_cmd)}")

            with open(sam_file, "w") as f:
                result3 = subprocess.run(
                    sampe_cmd, stdout=f, stderr=subprocess.PIPE, text=True, timeout=3600
                )

            if result3.returncode != 0:
                return {"error": f"BWA SAMPE failed: {result3.stderr}"}

            # Convert SAM to BAM and sort
            samtools_cmd = ["samtools", "view", "-bS", str(sam_file)]
            sort_cmd = ["samtools", "sort", "-o", str(bam_file), "-"]

            logger.info("Converting SAM to BAM and sorting...")
            p1 = subprocess.Popen(samtools_cmd, stdout=subprocess.PIPE)
            p2 = subprocess.Popen(
                sort_cmd,
                stdin=p1.stdout,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            p1.stdout.close()
            stdout, stderr = p2.communicate()

            if p2.returncode != 0:
                return {
                    "error": f"SAM to BAM conversion failed: {stderr.decode()}",
                    "sam_file": str(sam_file),
                }

            # Index BAM file
            index_cmd = ["samtools", "index", str(bam_file)]
            subprocess.run(index_cmd, timeout=300)

            # Create log file
            log_file = output_path / f"{sample_name}.log"
            with open(log_file, "w") as f:
                f.write(f"BWA ALN alignment completed for {sample_name}\n")
                f.write(f"Reference: {reference_fasta}\n")
                f.write(f"Reads: {reads1}, {reads2}\n")
                f.write(f"Parameters: {bwa_params}\n")
                f.write(
                    f"Commands: {' '.join(cmd1)}, {' '.join(cmd2)}, {' '.join(sampe_cmd)}\n"
                )

            return {
                "status": "success",
                "message": "BWA ALN alignment completed successfully",
                "files": {
                    "sai1": str(sai1_file),
                    "sai2": str(sai2_file),
                    "sam": str(sam_file),
                    "bam": str(bam_file),
                    "bai": str(bam_file.with_suffix(".bam.bai")),
                    "log": str(log_file),
                },
                "sample_name": sample_name,
                "reference": reference_fasta,
                "reads": [reads1, reads2],
            }

        except subprocess.TimeoutExpired:
            return {"error": "BWA ALN alignment timed out"}
        except Exception as e:
            return {"error": f"Unexpected error during BWA ALN alignment: {str(e)}"}

    def get_alignment_stats(self, bam_file: str) -> Dict[str, Any]:
        """
        Get alignment statistics from BAM file

        Args:
            bam_file: Path to BAM file

        Returns:
            Dictionary with alignment statistics
        """
        try:
            if not Path(bam_file).exists():
                return {"error": f"BAM file not found: {bam_file}"}

            # Get basic stats
            stats_cmd = ["samtools", "flagstat", bam_file]
            result = subprocess.run(
                stats_cmd, capture_output=True, text=True, timeout=300
            )

            if result.returncode != 0:
                return {"error": f"Failed to get BAM stats: {result.stderr}"}

            # Parse flagstat output
            stats = {}
            for line in result.stdout.strip().split("\n"):
                if line:
                    parts = line.split(" + ")
                    if len(parts) == 2:
                        count = int(parts[0].split()[0])
                        description = parts[1]
                        stats[description] = count

            return {"status": "success", "bam_file": bam_file, "statistics": stats}

        except subprocess.TimeoutExpired:
            return {"error": "BAM stats extraction timed out"}
        except Exception as e:
            return {"error": f"Unexpected error getting BAM stats: {str(e)}"}
