"""
TCGA 数据分析工具

提供以下分析功能：
1. differential_expression - 差异表达分析
2. survival_analysis - 生存分析
3. gene_mutation - 基因突变分析
4. copy_number_variation - 拷贝数变异分析
5. immune_infiltration - 免疫浸润分析
6. stem_index - 干性指数分析
7. pan_cancer_expression - 泛癌表达分析
8. expression_correlation - 表达相关性分析
9. pathway_analysis - 通路分析
"""

import duckdb as ddb
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


TCGA_CANCER_TYPES = [
    "ACC",
    "BLCA",
    "BRCA",
    "CESC",
    "CHOL",
    "COAD",
    "DLBC",
    "ESCA",
    "GBM",
    "HNSC",
    "KICH",
    "KIRC",
    "KIRP",
    "LAML",
    "LGG",
    "LIHC",
    "LUAD",
    "LUSC",
    "MESO",
    "OV",
    "PAAD",
    "PCPG",
    "PRAD",
    "READ",
    "SARC",
    "SKCM",
    "STAD",
    "TGCT",
    "THCA",
    "THYM",
    "UCEC",
    "UCS",
    "UVM",
]

CLINICAL_COLUMNS = [
    "patient_barcode",
    "type",
    "age",
    "gender",
    "OS",
    "OS_time",
    "DFI",
    "DFI_time",
    "PFI",
    "PFI_time",
    "DFS",
    "DFS_time",
    "T",
    "N",
    "M",
    "stage",
    "grade",
]

VARIANT_TYPES = [
    "Missense_Mutation",
    "5'UTR",
    "3'UTR",
    "Silent",
    "RNA",
    "Intron",
    "In_Frame_Del",
    "Frame_Shift_Del",
    "3'Flank",
    "Splice_Site",
    "Nonsense_Mutation",
    "Frame_Shift_Ins",
    "Translation_Start_Site",
    "Nonstop_Mutation",
    "5'Flank",
    "In_Frame_Ins",
]


# 从配置文件读取数据路径
def get_tcga_data_dir() -> Path:
    """
    获取 TCGA 数据目录路径

    优先级：
    1. 环境变量 DATA_ROOT/tcga（推荐）
    2. 配置文件中的 data_root/tcga
    3. 默认：项目根目录/data/tcga

    支持绝对路径和相对路径：
    - 绝对路径：直接使用，如 /mnt/data/tcga
    - 相对路径：相对于项目根目录，如 data/tcga 或 ../external_data/tcga

    数据目录结构：
    {data_root}/
    └── tcga/
        ├── BRCA/
        │   ├── rsem_gene_tpm.parquet
        │   └── ...
        └── ...
    """
    try:
        from app.core.config import settings

        data_dir_str = settings.get_tcga_data_dir()

        if not data_dir_str:
            # 如果配置为空，使用默认路径
            base_dir = Path(__file__).parent.parent.parent.parent.parent.parent
            return (base_dir / "data" / "tcga").resolve()

        data_dir = Path(data_dir_str)

        # 如果是绝对路径，直接使用
        if data_dir.is_absolute():
            return data_dir.resolve()

        # 如果是相对路径，相对于项目根目录解析
        base_dir = Path(__file__).parent.parent.parent.parent.parent.parent
        return (base_dir / data_dir).resolve()

    except ImportError:
        # 如果无法导入配置，使用默认路径
        logger.warning("Cannot import settings, using default data path")
        base_dir = Path(__file__).parent.parent.parent.parent.parent.parent
        return (base_dir / "data" / "tcga").resolve()
    except Exception as e:
        logger.warning(f"Error getting data dir from config: {e}, using default")
        base_dir = Path(__file__).parent.parent.parent.parent.parent.parent
        return (base_dir / "data" / "tcga").resolve()


# 全局数据目录（延迟初始化）
_DATA_DIR: Optional[Path] = None


def get_data_dir() -> Path:
    """获取数据目录（带缓存）"""
    global _DATA_DIR
    if _DATA_DIR is None:
        _DATA_DIR = get_tcga_data_dir()
        # 验证数据目录是否存在
        if not _DATA_DIR.exists():
            logger.warning(
                f"TCGA data directory not found at {_DATA_DIR}. Using mock data."
            )
    return _DATA_DIR


def _load_tcga_data(
    cancer_type: str = "all",
    data_type: str = "expression",
    gene: Optional[str] = None,
) -> pd.DataFrame:
    """
    加载 TCGA 数据（使用 DuckDB 读取 Parquet 文件）

    Args:
        cancer_type: 癌种类型，'all' 表示所有癌种
        data_type: 数据类型（expression, mutation, survival, cnv等）
        gene: 基因名称（可选）

    Returns:
        pd.DataFrame: TCGA 数据
    """
    # 获取数据目录
    data_dir = get_data_dir()

    # 如果数据目录不存在，返回模拟数据
    if not data_dir.exists():
        logger.warning("TCGA data directory not found")
        return pd.DataFrame()

    # 根据数据类型确定文件名
    file_mapping = {
        "expression": "rsem_gene_tpm.parquet",
        "mutation": "mc3_maf.parquet",
        "survival": "clinical.parquet",
        "clinical": "clinical.parquet",
        "cnv": "gistic2_thresholded.parquet",  # 假设的 CNV 文件名
    }

    filename = file_mapping.get(data_type, "rsem_gene_tpm.parquet")

    # 确定要读取的癌种列表
    if cancer_type == "all":
        cancer_types = [
            ct for ct in TCGA_CANCER_TYPES if (data_dir / ct / filename).exists()
        ]
    else:
        cancer_types = (
            [cancer_type] if (data_dir / cancer_type / filename).exists() else []
        )

    if not cancer_types:
        logger.warning(f"No data files found for {cancer_type}, using mock data")
        return pd.DataFrame()

    # 使用 DuckDB 读取 parquet 文件
    conn = ddb.connect()
    all_data = []

    try:
        for ct in cancer_types:
            file_path = data_dir / ct / filename
            if not file_path.exists():
                logger.warning(f"File not found: {file_path}")
                continue

            # 将路径转换为绝对路径字符串
            file_path_str = str(file_path.resolve())

            # 读取 parquet 文件
            query = f"SELECT * FROM read_parquet('{file_path_str}')"

            # 如果是 expression 数据且有基因筛选，添加 WHERE 条件
            if data_type == "expression" and gene:
                # 假设表达数据有 'gene' 或 'gene_id' 列
                query += f" WHERE gene = '{gene}' OR gene_id = '{gene}'"

            # 如果是 mutation 数据且有基因筛选
            elif data_type == "mutation" and gene:
                query += f" WHERE Hugo_Symbol = '{gene}' OR gene = '{gene}'"

            # 执行查询并获取 DataFrame
            df = conn.execute(query).df()

            if len(df) > 0:
                df["cancer_type"] = ct
                all_data.append(df)

        if not all_data:
            logger.warning("No data loaded, using mock data")
            return pd.DataFrame()

        # 合并所有数据
        result = pd.concat(all_data, ignore_index=True)
        return result

    except Exception as e:
        logger.error(f"Error loading TCGA data: {str(e)}", exc_info=True)
        return pd.DataFrame()
    finally:
        conn.close()


def _load_expression_data(
    cancer_type: str = "all", columns: List[str] = None, sample_type: str = "all"
) -> pd.DataFrame:
    """
    加载表达数据（使用 DuckDB 读取 Parquet 文件）
    """
    data_dir = get_data_dir()
    filename = "rsem_gene_tpm.parquet"
    path = data_dir / cancer_type / filename
    if columns is None:
        columns = ["*"]
    if sample_type != "all":
        if sample_type == "tumor":
            sample_type = "01"
        elif sample_type == "normal":
            sample_type = "11"
        else:
            raise ValueError(f"Invalid sample type: {sample_type}")
        query = f"SELECT {', '.join(columns)} FROM '{path}' WHERE sample_type == '{sample_type}'"
    else:
        query = f"SELECT {', '.join(columns)} FROM '{path}'"
    return ddb.query(query).df()


def _load_survival_data(
    cancer_type: str = "all", columns: List[str] = None
) -> pd.DataFrame:
    """
    加载生存数据（使用 DuckDB 读取 Parquet 文件）
    """
    data_dir = get_data_dir()
    filename = "clinical.parquet"
    path = data_dir / cancer_type / filename
    if columns is None:
        columns = ["*"]
    for c in columns:
        if c not in CLINICAL_COLUMNS:
            raise ValueError(f"Invalid column: {c}")
    query = f"SELECT {', '.join(columns)} FROM '{path}'"
    return ddb.query(query).df()


def _load_mutation_data(
    cancer_type: str = "all", columns: List[str] = None, variant_type: str = "all"
) -> pd.DataFrame:
    """
    加载突变数据（使用 DuckDB 读取 Parquet 文件）
    """
    data_dir = get_data_dir()
    filename = "mc3_maf.parquet"
    path = data_dir / cancer_type / filename
    if columns is None:
        columns = ["*"]
    if variant_type != "all":
        if variant_type not in VARIANT_TYPES:
            raise ValueError(f"Invalid variant type: {variant_type}")
        query = f"SELECT {', '.join(columns)} FROM '{path}' WHERE Variant_Classification == '{variant_type}'"
    else:
        query = f"SELECT {', '.join(columns)} FROM '{path}'"
    return ddb.query(query).df()


def differential_expression(
    gene: str,
    cancer_type: str = "BRCA",
    comparison: str = "tumor_vs_normal",
) -> Dict[str, Any]:
    """
    差异表达分析

    Args:
        gene: 基因名称
        cancer_type: 癌种类型
        comparison: 比较组类型

    Returns:
        Dict: 包含差异表达分析结果的字典
    """
    logger.info(f"Running differential expression analysis for {gene} in {cancer_type}")

    # 加载数据
    try:
        # TCGA data
        path = get_data_dir() / cancer_type / "rsem_gene_tpm.parquet"
        data = None
        if "tumor" in comparison:
            tcga_data = _load_expression_data(
                cancer_type=cancer_type, columns=["patient", "sample_type", gene]
            )
            normal_data = tcga_data.query('sample_type == "11"')
            if comparison == "tumor_vs_normal":
                tumor_data = tcga_data.query(
                    'sample_type == "01" and patient not in @normal_data.patient'
                )
                # GTEx data
                path = get_data_dir() / cancer_type / "gtex_rsem_gene_tpm.parquet"
                gtex_data = ddb.query(f"SELECT patient, {gene} FROM '{path}'").df()
                data = pd.concat([tumor_data, normal_data, gtex_data])
                data["sample_type"] = data["sample_type"].apply(
                    lambda x: (
                        "Normal" if x == "11" else ("Tumor" if x == "01" else "GTEx")
                    )
                )
                data = data[["patient", "sample_type", gene]]
            elif comparison == "paired_tumor_vs_normal":
                tumor_data = tcga_data.query('sample_type == "01"')
                merged_data = pd.merge(
                    tumor_data,
                    normal_data,
                    on="patient",
                    suffixes=("_Tumor", "_Normal"),
                )[["patient", f"{gene}_Tumor", f"{gene}_Normal"]]
                data = merged_data.melt(
                    id_vars="patient", var_name="sample_type", value_name=gene
                )
                data["sample_type"] = data["sample_type"].apply(
                    lambda x: ("Normal" if x == f"{gene}_Normal" else "Tumor")
                )
                data = data[["patient", "sample_type", gene]].sort_values(by="patient")
            else:
                raise ValueError(f"Invalid comparison: {comparison}")
        else:
            tcga_data = _load_expression_data(
                cancer_type=cancer_type, columns=["patient", gene], sample_type="tumor"
            )
            if comparison == "pathologic_stage":
                clinical_data = _load_survival_data(
                    cancer_type=cancer_type, columns=["patient_barcode", "stage"]
                )
                data = pd.merge(
                    tcga_data,
                    clinical_data,
                    left_on="patient",
                    right_on="patient_barcode",
                )[["patient", "stage", gene]]
            elif comparison == "pathologic_t":
                clinical_data = _load_survival_data(
                    cancer_type=cancer_type, columns=["patient_barcode", "T"]
                )
                data = pd.merge(
                    tcga_data,
                    clinical_data,
                    left_on="patient",
                    right_on="patient_barcode",
                )[["patient", "T", gene]]
            elif comparison == "pathologic_n":
                clinical_data = _load_survival_data(
                    cancer_type=cancer_type, columns=["patient_barcode", "N"]
                )
                data = pd.merge(
                    tcga_data,
                    clinical_data,
                    left_on="patient",
                    right_on="patient_barcode",
                )[["patient", "N", gene]]
            elif comparison == "pathologic_m":
                clinical_data = _load_survival_data(
                    cancer_type=cancer_type, columns=["patient_barcode", "M"]
                )
                data = pd.merge(
                    tcga_data,
                    clinical_data,
                    left_on="patient",
                    right_on="patient_barcode",
                )[["patient", "M", gene]]
            elif comparison == "pathologic_grade":
                clinical_data = _load_survival_data(
                    cancer_type=cancer_type, columns=["patient_barcode", "grade"]
                )
                data = pd.merge(
                    tcga_data,
                    clinical_data,
                    left_on="patient",
                    right_on="patient_barcode",
                )[["patient", "grade", gene]]
            elif comparison == "gender":
                clinical_data = _load_survival_data(
                    cancer_type=cancer_type, columns=["patient_barcode", "gender"]
                )
                data = pd.merge(
                    tcga_data,
                    clinical_data,
                    left_on="patient",
                    right_on="patient_barcode",
                )[["patient", "gender", gene]]
            else:
                raise ValueError(f"Invalid comparison: {comparison}")

    except Exception as e:
        logger.error(f"Error loading TCGA data: {str(e)}", exc_info=True)
        return {"error": str(e)}
    else:
        return data.to_json(orient="records")


def expression_correlation(
    gene_x: str,
    gene_y: str,
    cancer_type: str = "BRCA",
    method: str = "pearson",
    min_samples: int = 30,
) -> Dict[str, Any]:
    """
    表达相关性分析（仅返回数据，分析在 R 绘图部分完成）

    Args:
        gene_x: 基因 X
        gene_y: 基因 Y
        cancer_type: 癌种类型
        method: 相关性方法（pearson, spearman, kendall）- 保留用于 R 绘图
        min_samples: 最小样本数

    Returns:
        Dict: 包含原始数据的字典，分析结果将在 R 绘图部分生成
    """
    logger.info(
        f"Loading expression correlation data for {gene_x} and {gene_y} in {cancer_type}"
    )

    # 加载两个基因的数据
    data = _load_expression_data(
        cancer_type=cancer_type,
        columns=["patient", gene_x, gene_y],
        sample_type="tumor",
    )

    if len(data) < min_samples:
        return {"error": f"Insufficient samples (need at least {min_samples})"}

    # 只返回原始数据，不进行任何分析
    result = {
        "data": data.to_json(orient="records"),
        "cancer_type": cancer_type,
        "method": method,  # 保留方法参数供 R 绘图使用
        "n_samples": len(data),
    }

    return result


def survival_analysis(
    gene: str,
    cancer_type: str = "BRCA",
    survival_type: str = "OS",
    expression_level: str = "median",
    expression_level_value: float = 0,
    high_label: str = "High",
    low_label: str = "Low",
) -> Dict[str, Any]:
    """
    生存分析（仅返回数据，分析在 R 绘图部分完成）

    Args:
        gene: 基因名称
        cancer_type: 癌种类型
        survival_type: 生存类型（OS, DFS, PFS, DSS）
        expression_level: 表达水平分组方式 - 保留用于 R 绘图
        high_label: 高表达组标签 - 保留用于 R 绘图
        low_label: 低表达组标签 - 保留用于 R 绘图

    Returns:
        Dict: 包含原始数据的字典，分析结果将在 R 绘图部分生成
    """
    logger.info(f"Loading survival analysis data for {gene} in {cancer_type}")

    # 加载表达数据
    expression_data = _load_expression_data(
        cancer_type=cancer_type, columns=["patient", gene], sample_type="tumor"
    )
    # 加载生存数据
    survival_data = _load_survival_data(
        cancer_type=cancer_type,
        columns=["patient_barcode", survival_type, f"{survival_type}_time"],
    )

    if len(expression_data) == 0 or len(survival_data) == 0:
        return {"error": "No data available"}

    # 合并表达数据和生存数据，过滤掉缺失值
    data = (
        pd.merge(
            expression_data,
            survival_data,
            left_on="patient",
            right_on="patient_barcode",
        )
        .query(f"~{survival_type}_time.isna() and ~{survival_type}.isna()")
        .drop(columns=["patient_barcode"])
    )
    # 分组
    if expression_level == "mean":
        expression_level_value = float(data[gene].mean())
    elif expression_level == "median":
        expression_level_value = float(data[gene].median())
    elif expression_level == "quartile_q1":
        expression_level_value = float(data[gene].quantile(0.25))
    elif expression_level == "quartile_q3":
        expression_level_value = float(data[gene].quantile(0.75))
    elif expression_level == "custom":
        expression_level_value = expression_level_value
    else:
        raise ValueError(f"Invalid expression level: {expression_level}")
    data["group"] = data[gene].apply(
        lambda x: high_label if x > expression_level_value else low_label
    )

    # 只返回原始数据，不进行任何分析
    result = {
        "data": data.to_json(orient="records"),
        "gene": gene,
        "cancer_type": cancer_type,
        "survival_type": survival_type,
        "expression_level": expression_level,  # 保留参数供 R 绘图使用
        "high_label": high_label,  # 保留参数供 R 绘图使用
        "low_label": low_label,  # 保留参数供 R 绘图使用
        "n_samples": len(data),
    }

    return result


def gene_mutation(
    gene: str,
    cancer_type: str = "BRCA",
    mutation_type: str = "all",
    min_mutation_rate: float = 0.01,
) -> Dict[str, Any]:
    """
    基因突变分析

    Args:
        gene: 基因名称
        cancer_type: 癌种类型
        mutation_type: 突变类型
        min_mutation_rate: 最小突变率

    Returns:
        Dict: 包含突变分析结果的字典
    """
    logger.info(f"Running gene mutation analysis for {gene} in {cancer_type}")

    # 加载突变数据
    data = _load_tcga_data(cancer_type=cancer_type, data_type="mutation", gene=gene)

    if len(data) == 0:
        return {"error": "No data available"}

    # 筛选突变类型
    if mutation_type != "all":
        data = data[data["mutation_type"] == mutation_type]

    # 计算突变统计
    total_samples = len(data)
    mutated_samples = len(data[data["mutation_type"] != "None"])
    mutation_rate = mutated_samples / total_samples if total_samples > 0 else 0

    # 按突变类型统计
    mutation_counts = data["mutation_type"].value_counts().to_dict()

    result = {
        "gene": gene,
        "cancer_type": cancer_type,
        "mutation_type": mutation_type,
        "total_samples": total_samples,
        "mutated_samples": mutated_samples,
        "mutation_rate": float(mutation_rate),
        "mutation_counts": {k: int(v) for k, v in mutation_counts.items()},
        "meets_threshold": mutation_rate >= min_mutation_rate,
    }

    return result


def copy_number_variation(
    gene: str,
    cancer_type: str = "BRCA",
    cnv_type: str = "both",
    min_samples: int = 10,
) -> Dict[str, Any]:
    """
    拷贝数变异分析

    Args:
        gene: 基因名称
        cancer_type: 癌种类型
        cnv_type: CNV 类型（amplification, deletion, both）
        min_samples: 最小样本数

    Returns:
        Dict: 包含 CNV 分析结果的字典
    """
    logger.info(f"Running CNV analysis for {gene} in {cancer_type}")

    # 加载 CNV 数据
    data = _load_tcga_data(cancer_type=cancer_type, data_type="cnv", gene=gene)

    if len(data) < min_samples:
        return {"error": f"Insufficient samples (need at least {min_samples})"}

    # 模拟 CNV 数据
    data["cnv_value"] = np.random.choice(
        [-2, -1, 0, 1, 2], len(data), p=[0.05, 0.1, 0.7, 0.1, 0.05]
    )

    # 分类 CNV
    data["cnv_category"] = data["cnv_value"].apply(
        lambda x: "amplification" if x > 0 else "deletion" if x < 0 else "normal"
    )

    # 筛选 CNV 类型
    if cnv_type == "amplification":
        cnv_data = data[data["cnv_category"] == "amplification"]
    elif cnv_type == "deletion":
        cnv_data = data[data["cnv_category"] == "deletion"]
    else:
        cnv_data = data[data["cnv_category"] != "normal"]

    # 计算统计
    result = {
        "gene": gene,
        "cancer_type": cancer_type,
        "cnv_type": cnv_type,
        "total_samples": len(data),
        "amplification_samples": len(data[data["cnv_category"] == "amplification"]),
        "deletion_samples": len(data[data["cnv_category"] == "deletion"]),
        "normal_samples": len(data[data["cnv_category"] == "normal"]),
        "amplification_rate": len(data[data["cnv_category"] == "amplification"])
        / len(data),
        "deletion_rate": len(data[data["cnv_category"] == "deletion"]) / len(data),
    }

    return result


def immune_infiltration(
    gene: str,
    cancer_type: str = "BRCA",
    immune_cell_type: str = "all",
    method: str = "CIBERSORT",
) -> Dict[str, Any]:
    """
    免疫浸润分析

    Args:
        gene: 基因名称
        cancer_type: 癌种类型
        immune_cell_type: 免疫细胞类型
        method: 计算方法

    Returns:
        Dict: 包含免疫浸润分析结果的字典
    """
    logger.info(f"Running immune infiltration analysis for {gene} in {cancer_type}")

    # 加载数据
    data = _load_tcga_data(cancer_type=cancer_type, data_type="expression", gene=gene)

    # 模拟免疫细胞浸润数据
    immune_cells = [
        "CD8_T_cells",
        "CD4_T_cells",
        "B_cells",
        "NK_cells",
        "Macrophages",
        "Dendritic_cells",
    ]

    immune_data = {}
    for cell_type in immune_cells:
        immune_data[cell_type] = np.random.beta(2, 5, len(data))

    immune_df = pd.DataFrame(immune_data, index=data.index)
    data = pd.concat([data, immune_df], axis=1)

    # 筛选免疫细胞类型
    if immune_cell_type != "all":
        cell_data = data[immune_cell_type]
    else:
        cell_data = data[immune_cells]

    # 计算相关性（基因表达与免疫浸润）
    correlations = {}
    for cell in immune_cells:
        if cell in data.columns:
            corr = data["expression"].corr(data[cell])
            correlations[cell] = float(corr) if not np.isnan(corr) else 0.0

    result = {
        "gene": gene,
        "cancer_type": cancer_type,
        "immune_cell_type": immune_cell_type,
        "method": method,
        "correlations": correlations,
        "mean_infiltration": {
            cell: float(data[cell].mean())
            for cell in immune_cells
            if cell in data.columns
        },
    }

    return result


def stem_index(
    gene: str,
    cancer_type: str = "BRCA",
    stem_index_type: str = "mRNAsi",
) -> Dict[str, Any]:
    """
    干性指数分析

    Args:
        gene: 基因名称
        cancer_type: 癌种类型
        stem_index_type: 干性指数类型

    Returns:
        Dict: 包含干性指数分析结果的字典
    """
    logger.info(f"Running stem index analysis for {gene} in {cancer_type}")

    # 加载数据
    data = _load_tcga_data(cancer_type=cancer_type, data_type="expression", gene=gene)

    # 模拟干性指数数据
    data["stem_index"] = np.random.beta(3, 2, len(data))

    # 计算相关性
    correlation = data["expression"].corr(data["stem_index"])

    result = {
        "gene": gene,
        "cancer_type": cancer_type,
        "stem_index_type": stem_index_type,
        "correlation": float(correlation) if not np.isnan(correlation) else 0.0,
        "mean_stem_index": float(data["stem_index"].mean()),
        "mean_expression": float(data["expression"].mean()),
        "n_samples": len(data),
    }

    return result


def pan_cancer_expression(
    gene: str,
    cancer_types: List[str] = None,
    show_normal: bool = True,
) -> Dict[str, Any]:
    """
    泛癌表达分析

    Args:
        gene: 基因名称
        cancer_types: 癌种列表（空列表表示所有癌种）
        show_normal: 是否显示正常组织

    Returns:
        Dict: 包含泛癌表达分析结果的字典
    """
    logger.info(f"Running pan-cancer expression analysis for {gene}")

    if cancer_types is None or len(cancer_types) == 0:
        cancer_types = TCGA_CANCER_TYPES

    results = {}
    for cancer_type in cancer_types:
        data = _load_tcga_data(
            cancer_type=cancer_type, data_type="expression", gene=gene
        )

        if show_normal:
            tumor_data = data[data["sample_type"] == "Tumor"]["expression"]
            normal_data = data[data["sample_type"] == "Normal"]["expression"]
            results[cancer_type] = {
                "tumor_mean": float(tumor_data.mean()) if len(tumor_data) > 0 else 0,
                "tumor_median": (
                    float(tumor_data.median()) if len(tumor_data) > 0 else 0
                ),
                "normal_mean": float(normal_data.mean()) if len(normal_data) > 0 else 0,
                "normal_median": (
                    float(normal_data.median()) if len(normal_data) > 0 else 0
                ),
                "n_tumor": len(tumor_data),
                "n_normal": len(normal_data),
            }
        else:
            tumor_data = data[data["sample_type"] == "Tumor"]["expression"]
            results[cancer_type] = {
                "tumor_mean": float(tumor_data.mean()) if len(tumor_data) > 0 else 0,
                "tumor_median": (
                    float(tumor_data.median()) if len(tumor_data) > 0 else 0
                ),
                "n_tumor": len(tumor_data),
            }

    return {
        "gene": gene,
        "cancer_types": cancer_types,
        "show_normal": show_normal,
        "results": results,
    }


def pathway_analysis(
    gene_set: str,
    cancer_type: str = "BRCA",
    pathway_database: str = "KEGG",
    min_genes: int = 5,
    max_genes: int = 500,
) -> Dict[str, Any]:
    """
    通路分析

    Args:
        gene_set: 基因集合（逗号分隔的字符串）
        cancer_type: 癌种类型
        pathway_database: 通路数据库
        min_genes: 最小基因数
        max_genes: 最大基因数

    Returns:
        Dict: 包含通路分析结果的字典
    """
    logger.info(f"Running pathway analysis for {cancer_type} using {pathway_database}")

    # 解析基因集合
    genes = [g.strip().upper() for g in gene_set.split(",") if g.strip()]

    if len(genes) < min_genes:
        return {"error": f"Too few genes (need at least {min_genes})"}

    if len(genes) > max_genes:
        return {"error": f"Too many genes (max {max_genes})"}

    # 模拟通路富集结果
    pathways = [
        {"pathway": "Cell cycle", "genes": 15, "pvalue": 0.001, "fdr": 0.01},
        {"pathway": "DNA repair", "genes": 12, "pvalue": 0.005, "fdr": 0.02},
        {"pathway": "Apoptosis", "genes": 10, "pvalue": 0.01, "fdr": 0.05},
        {"pathway": "p53 signaling", "genes": 8, "pvalue": 0.02, "fdr": 0.08},
    ]

    result = {
        "gene_set": genes,
        "cancer_type": cancer_type,
        "pathway_database": pathway_database,
        "n_genes": len(genes),
        "pathways": pathways,
        "significant_pathways": [p for p in pathways if p["fdr"] < 0.05],
    }

    return result


# 主函数：根据子工具名称调用相应的分析函数
def run_analysis(sub_tool: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """
    运行 TCGA 分析

    Args:
        sub_tool: 子工具名称
        params: 参数字典

    Returns:
        Dict: 分析结果
    """
    try:
        if sub_tool == "differential_expression":
            return differential_expression(**params)
        elif sub_tool == "survival_analysis":
            return survival_analysis(**params)
        elif sub_tool == "gene_mutation":
            return gene_mutation(**params)
        elif sub_tool == "copy_number_variation":
            return copy_number_variation(**params)
        elif sub_tool == "immune_infiltration":
            return immune_infiltration(**params)
        elif sub_tool == "stem_index":
            return stem_index(**params)
        elif sub_tool == "pan_cancer_expression":
            return pan_cancer_expression(**params)
        elif sub_tool == "expression_correlation":
            return expression_correlation(**params)
        elif sub_tool == "pathway_analysis":
            return pathway_analysis(**params)
        else:
            return {"error": f"Unknown sub-tool: {sub_tool}"}
    except Exception as e:
        logger.error(f"Error running {sub_tool}: {str(e)}", exc_info=True)
        return {"error": str(e)}
