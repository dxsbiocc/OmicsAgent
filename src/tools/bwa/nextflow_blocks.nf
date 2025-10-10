/*
 * BWA Nextflow Blocks for OmicsAgent
 * Provides BWA indexing and alignment functionality
 */

// BWA Index Process
process BWA_INDEX {
    container 'biocontainers/bwa:0.7.17-1-deb_cv1'
    cpus 4
    memory '8.GB'
    time '2h'
    
    input:
    path reference_fasta
    
    output:
    path "*.amb", emit: amb
    path "*.ann", emit: ann
    path "*.bwt", emit: bwt
    path "*.pac", emit: pac
    path "*.sa",  emit: sa
    path "*.fai", emit: fai
    
    script:
    """
    # Create BWA index
    bwa index ${reference_fasta}
    
    # Create FASTA index for compatibility
    samtools faidx ${reference_fasta}
    """
}

// BWA MEM Alignment Process
process BWA_MEM {
    container 'biocontainers/bwa:0.7.17-1-deb_cv1'
    cpus 8
    memory '16.GB'
    time '4h'
    
    input:
    path reference_fasta
    path reads1
    path reads2
    val bwa_params
    val sample_name
    
    output:
    path "*.sam", emit: sam
    path "*.bam", emit: bam
    path "*.bai", emit: bai
    path "*.log", emit: log
    
    script:
    """
    # Run BWA MEM alignment
    bwa mem ${bwa_params} ${reference_fasta} ${reads1} ${reads2} > ${sample_name}.sam
    
    # Convert SAM to BAM and sort
    samtools view -bS ${sample_name}.sam | samtools sort -o ${sample_name}.bam -
    
    # Index BAM file
    samtools index ${sample_name}.bam
    
    # Create log file
    echo "BWA MEM alignment completed for ${sample_name}" > ${sample_name}.log
    echo "Reference: ${reference_fasta}" >> ${sample_name}.log
    echo "Reads: ${reads1}, ${reads2}" >> ${sample_name}.log
    echo "Parameters: ${bwa_params}" >> ${sample_name}.log
    """
}

// BWA ALN Alignment Process (for older BWA versions)
process BWA_ALN {
    container 'biocontainers/bwa:0.7.17-1-deb_cv1'
    cpus 8
    memory '16.GB'
    time '4h'
    
    input:
    path reference_fasta
    path reads1
    path reads2
    val bwa_params
    val sample_name
    
    output:
    path "*.sai", emit: sai1, sai2
    path "*.sam", emit: sam
    path "*.bam", emit: bam
    path "*.bai", emit: bai
    path "*.log", emit: log
    
    script:
    """
    # Run BWA ALN for each read file
    bwa aln ${bwa_params} ${reference_fasta} ${reads1} > ${sample_name}_1.sai
    bwa aln ${bwa_params} ${reference_fasta} ${reads2} > ${sample_name}_2.sai
    
    # Generate SAM file
    bwa sampe ${reference_fasta} ${sample_name}_1.sai ${sample_name}_2.sai ${reads1} ${reads2} > ${sample_name}.sam
    
    # Convert SAM to BAM and sort
    samtools view -bS ${sample_name}.sam | samtools sort -o ${sample_name}.bam -
    
    # Index BAM file
    samtools index ${sample_name}.bam
    
    # Create log file
    echo "BWA ALN alignment completed for ${sample_name}" > ${sample_name}.log
    echo "Reference: ${reference_fasta}" >> ${sample_name}.log
    echo "Reads: ${reads1}, ${reads2}" >> ${sample_name}.log
    echo "Parameters: ${bwa_params}" >> ${sample_name}.log
    """
}

// Workflow for BWA Indexing
workflow BWA_INDEX_WORKFLOW {
    take:
    reference_fasta
    
    main:
    BWA_INDEX(reference_fasta)
    
    emit:
    index_files = BWA_INDEX.out
}

// Workflow for BWA MEM Alignment
workflow BWA_MEM_WORKFLOW {
    take:
    reference_fasta
    reads1
    reads2
    bwa_params
    sample_name
    
    main:
    BWA_MEM(reference_fasta, reads1, reads2, bwa_params, sample_name)
    
    emit:
    alignment_files = BWA_MEM.out
}

// Workflow for BWA ALN Alignment
workflow BWA_ALN_WORKFLOW {
    take:
    reference_fasta
    reads1
    reads2
    bwa_params
    sample_name
    
    main:
    BWA_ALN(reference_fasta, reads1, reads2, bwa_params, sample_name)
    
    emit:
    alignment_files = BWA_ALN.out
}

// Complete BWA Pipeline
workflow BWA_PIPELINE {
    take:
    reference_fasta
    reads1
    reads2
    bwa_params
    sample_name
    alignment_method // 'mem' or 'aln'
    
    main:
    // Index reference
    BWA_INDEX(reference_fasta)
    
    // Choose alignment method
    if (alignment_method == 'mem') {
        BWA_MEM(reference_fasta, reads1, reads2, bwa_params, sample_name)
    } else {
        BWA_ALN(reference_fasta, reads1, reads2, bwa_params, sample_name)
    }
    
    emit:
    index_files = BWA_INDEX.out
    alignment_files = alignment_method == 'mem' ? BWA_MEM.out : BWA_ALN.out
}
