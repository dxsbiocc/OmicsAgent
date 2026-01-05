"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface HeatmapConfig {
  type: "Heatmap";
  arguments?: {
    [key: string]: any;
  };
}

interface HeatmapComponentProps {
  value?: HeatmapConfig;
  onChange?: (config: HeatmapConfig) => void;
}

/**
 * Heatmap 组件
 * Heatmap function for ComplexHeatmap
 */
export const Heatmap: React.FC<HeatmapComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      // 基本参数
      {
        name: "col",
        type: "colorRamp2",
      },
      {
        name: "name",
        type: "string",
        default: "",
      },
      {
        name: "na_col",
        type: "color",
        default: "#FFFFFF",
      },
      {
        name: "rect_gp",
        type: "gpar",
      },
      {
        name: "color_space",
        type: "select",
        options: ["RGB", "LAB", "XYZ", "sRGB", "LUV"],
        default: "RGB",
      },
      {
        name: "border",
        type: "boolean",
        default: true,
      },
      {
        name: "border_gp",
        type: "gpar",
      },
      // 自定义函数
      {
        name: "cell_fun",
        type: "string",
        default: "",
      },
      {
        name: "layer_fun",
        type: "string",
        default: "",
      },
      // 抖动
      {
        name: "jitter",
        type: "boolean",
        default: false,
      },
      // 行标题
      {
        name: "row_title",
        type: "string",
        default: "",
      },
      {
        name: "row_title_side",
        type: "select",
        options: ["left", "right"],
        default: "left",
      },
      {
        name: "row_title_gp",
        type: "gpar",
      },
      {
        name: "row_title_rot",
        type: "number",
        default: 0,
        min: 0,
        max: 360,
      },
      // 列标题
      {
        name: "column_title",
        type: "string",
        default: "",
      },
      {
        name: "column_title_side",
        type: "select",
        options: ["top", "bottom"],
        default: "top",
      },
      {
        name: "column_title_gp",
        type: "gpar",
      },
      {
        name: "column_title_rot",
        type: "number",
        default: 0,
        min: 0,
        max: 360,
      },
      // 行聚类
      {
        name: "cluster_rows",
        type: "boolean",
        default: true,
      },
      {
        name: "cluster_row_slices",
        type: "boolean",
        default: false,
      },
      {
        name: "clustering_distance_rows",
        type: "select",
        options: [
          "euclidean",
          "maximum",
          "manhattan",
          "canberra",
          "binary",
          "minkowski",
          "pearson",
          "spearman",
          "kendall",
        ],
        default: "euclidean",
      },
      {
        name: "clustering_method_rows",
        type: "select",
        options: [
          "ward.D",
          "ward.D2",
          "single",
          "complete",
          "average",
          "mcquitty",
          "median",
          "centroid",
        ],
        default: "complete",
      },
      {
        name: "row_dend_side",
        type: "select",
        options: ["left", "right"],
        default: "left",
      },
      {
        name: "row_dend_width",
        type: "unit",
      },
      {
        name: "show_row_dend",
        type: "boolean",
        default: true,
      },
      {
        name: "row_dend_gp",
        type: "gpar",
      },
      {
        name: "row_dend_reorder",
        type: "boolean",
        default: false,
      },
      // 列聚类
      {
        name: "cluster_columns",
        type: "boolean",
        default: true,
      },
      {
        name: "cluster_column_slices",
        type: "boolean",
        default: false,
      },
      {
        name: "clustering_distance_columns",
        type: "select",
        options: [
          "euclidean",
          "maximum",
          "manhattan",
          "canberra",
          "binary",
          "minkowski",
          "pearson",
          "spearman",
          "kendall",
        ],
        default: "euclidean",
      },
      {
        name: "clustering_method_columns",
        type: "select",
        options: [
          "ward.D",
          "ward.D2",
          "single",
          "complete",
          "average",
          "mcquitty",
          "median",
          "centroid",
        ],
        default: "complete",
      },
      {
        name: "column_dend_side",
        type: "select",
        options: ["top", "bottom"],
        default: "top",
      },
      {
        name: "column_dend_height",
        type: "unit",
      },
      {
        name: "show_column_dend",
        type: "boolean",
        default: true,
      },
      {
        name: "column_dend_gp",
        type: "gpar",
      },
      {
        name: "column_dend_reorder",
        type: "boolean",
        default: false,
      },
      // 排序
      {
        name: "row_order",
        type: "numbers",
      },
      {
        name: "column_order",
        type: "numbers",
      },
      // 行标签
      {
        name: "row_labels",
        type: "strings",
      },
      {
        name: "row_names_side",
        type: "select",
        options: ["left", "right"],
        default: "left",
      },
      {
        name: "show_row_names",
        type: "boolean",
        default: true,
      },
      {
        name: "row_names_max_width",
        type: "unit",
      },
      {
        name: "row_names_gp",
        type: "gpar",
      },
      {
        name: "row_names_rot",
        type: "number",
        default: 0,
        min: 0,
        max: 360,
      },
      {
        name: "row_names_centered",
        type: "boolean",
        default: false,
      },
      // 列标签
      {
        name: "column_labels",
        type: "strings",
      },
      {
        name: "column_names_side",
        type: "select",
        options: ["top", "bottom"],
        default: "top",
      },
      {
        name: "column_names_max_height",
        type: "unit",
      },
      {
        name: "show_column_names",
        type: "boolean",
        default: true,
      },
      {
        name: "column_names_gp",
        type: "gpar",
      },
      {
        name: "column_names_rot",
        type: "number",
        default: 90,
        min: 0,
        max: 360,
      },
      {
        name: "column_names_centered",
        type: "boolean",
        default: false,
      },
      // 注释
      {
        name: "top_annotation",
        type: "list",
      },
      {
        name: "bottom_annotation",
        type: "list",
      },
      {
        name: "left_annotation",
        type: "list",
      },
      {
        name: "right_annotation",
        type: "list",
      },
      // 分割
      {
        name: "km",
        type: "number",
        default: 0,
        min: 0,
        step: 1,
      },
      {
        name: "split",
        type: "list",
      },
      {
        name: "row_km",
        type: "number",
        default: 0,
        min: 0,
        step: 1,
      },
      {
        name: "row_km_repeats",
        type: "number",
        default: 1,
        min: 1,
        step: 1,
      },
      {
        name: "row_split",
        type: "list",
      },
      {
        name: "column_km",
        type: "number",
        default: 0,
        min: 0,
        step: 1,
      },
      {
        name: "column_km_repeats",
        type: "number",
        default: 1,
        min: 1,
        step: 1,
      },
      {
        name: "column_split",
        type: "list",
      },
      // 间距
      {
        name: "gap",
        type: "unit",
      },
      {
        name: "row_gap",
        type: "unit",
      },
      {
        name: "column_gap",
        type: "unit",
      },
      {
        name: "show_parent_dend_line",
        type: "boolean",
        default: false,
      },
      // 尺寸
      {
        name: "width",
        type: "unit",
      },
      {
        name: "height",
        type: "unit",
      },
      {
        name: "heatmap_width",
        type: "unit",
      },
      {
        name: "heatmap_height",
        type: "unit",
      },
      // 图例
      {
        name: "show_heatmap_legend",
        type: "boolean",
        default: true,
      },
      {
        name: "heatmap_legend_param",
        type: "list",
      },
      // 栅格
      {
        name: "use_raster",
        type: "boolean",
        default: false,
      },
      {
        name: "raster_device",
        type: "select",
        options: ["png", "CairoPNG", "agg_png"],
        default: "png",
      },
      {
        name: "raster_quality",
        type: "number",
        default: 1,
        min: 1,
      },
      {
        name: "raster_device_param",
        type: "list",
      },
      {
        name: "raster_resize_mat",
        type: "boolean",
        default: false,
      },
      {
        name: "raster_by_magick",
        type: "boolean",
        default: false,
      },
      {
        name: "raster_magick_filter",
        type: "select",
        options: [
          "Lanczos",
          "Triangle",
          "Box",
          "Cubic",
          "Point",
          "Hermite",
          "Hanning",
          "Hamming",
          "Blackman",
          "Gaussian",
          "Quadratic",
          "Catrom",
          "Mitchell",
          "Jinc",
          "Sinc",
          "SincFast",
          "Kaiser",
          "Welch",
          "Parzen",
          "Bohman",
          "Bartlett",
          "Lagrange",
          "Robidoux",
          "RobidouxSharp",
          "Cosine",
          "Spline",
          "LanczosSharp",
          "Lanczos2",
          "Lanczos2Sharp",
          "RobidouxSoft",
          "LanczosSoft",
          "CubicSharp",
          "CubicSoft",
          "CatromSharp",
          "CatromSoft",
        ],
        default: "Lanczos",
      },
      // 后处理
      {
        name: "post_fun",
        type: "string",
        default: "",
      },
    ],
    []
  );

  const paramsValue = useMemo(() => {
    if (!value || !value.arguments) {
      return {};
    }
    return value.arguments;
  }, [value]);

  const handleChange = (params: Record<string, any>) => {
    if (!onChange) return;
    onChange({
      type: "Heatmap",
      arguments: params,
    });
  };

  return (
    <Box>
      <BaseDynamicParams
        availableParams={availableParams}
        value={paramsValue}
        onChange={handleChange}
        nested={true}
      />
    </Box>
  );
};
