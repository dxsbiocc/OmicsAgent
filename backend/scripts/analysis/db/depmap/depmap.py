import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq


def correlation(
    data: pd.DataFrame,
    feature_type_x: str,
    feature_type_y: str,
    feature_x: str,
    feature_y: str,
    method: str = "pearson",
    cancer_type: str = "all",
    min_samples: int = 50,
) -> pd.DataFrame:
    """
    Calculate the correlation between two features.
    Args:
        data: pd.DataFrame
        feature_type_x: str, the type of the feature on the x-axis
        feature_type_y: str, the type of the feature on the y-axis
        feature_x: str, the feature on the x-axis
        feature_y: str, the feature on the y-axis
        method: str, the method of the correlation
        cancer_type: str, the cancer type
        min_samples: int, the minimum number of samples
    Returns:
        pd.DataFrame, the correlation between the two features
    """
    if cancer_type != "all":
        data = data[data["cancer_type"] == cancer_type]
    if min_samples > 0:
        data = data[data["samples"] >= min_samples]
    return data.corr(method=method)


def dependency(
    data: pd.DataFrame,
    feature_type: str,
    gene: str,
    dataset: str = "CRISPR",
    cancer_type: str = "all",
    top_n: int = 25,
):
    if cancer_type != "all":
        data = data[data["cancer_type"] == cancer_type]
    if top_n > 0:
        data = data.head(top_n)
    return data


def synthetic_lethality(
    data: pd.DataFrame,
    anchor_gene: str,
    partner_search_space: str = "genome_wide",
    method: str = "rank_product",
    cancer_type: str = "all",
    min_effect_size: float = 0.3,
    fdr: float = 0.1,
):
    if cancer_type != "all":
        data = data[data["cancer_type"] == cancer_type]
    if min_effect_size > 0:
        data = data[data["effect_size"] >= min_effect_size]
    if fdr > 0:
        data = data[data["fdr"] <= fdr]
    return data


def drug_association(
    data: pd.DataFrame,
    gene: str,
    drug_panel: str = "PRISM",
    response_metric: str = "AUC",
    cancer_type: str = "all",
    min_samples: int = 30,
):
    if cancer_type != "all":
        data = data[data["cancer_type"] == cancer_type]
