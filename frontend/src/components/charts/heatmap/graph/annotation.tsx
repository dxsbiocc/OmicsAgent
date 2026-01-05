"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

// HeatmapAnnotation 配置接口
export interface HeatmapAnnotationConfig {
  type: "HeatmapAnnotation";
  arguments?: {
    [key: string]: any;
  };
}

interface HeatmapAnnotationComponentProps {
  value?: HeatmapAnnotationConfig;
  onChange?: (config: HeatmapAnnotationConfig) => void;
}

/**
 * HeatmapAnnotation 组件
 * Heatmap Annotation for ComplexHeatmap
 */
export const HeatmapAnnotation: React.FC<HeatmapAnnotationComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "name",
        type: "string",
        default: "",
      },
      {
        name: "col",
        type: "colorRamp2",
      },
      {
        name: "na_col",
        type: "color",
        default: "#FFFFFF",
      },
      {
        name: "annotation_legend_param",
        type: "list",
      },
      {
        name: "show_legend",
        type: "boolean",
        default: true,
      },
      {
        name: "which",
        type: "select",
        options: ["column", "row"],
        default: "column",
      },
      {
        name: "gp",
        type: "gpar",
      },
      {
        name: "border",
        type: "boolean",
        default: true,
      },
      {
        name: "gap",
        type: "unit",
      },
      {
        name: "show_annotation_name",
        type: "boolean",
        default: true,
      },
      {
        name: "annotation_label",
        type: "strings",
      },
      {
        name: "annotation_name_gp",
        type: "gpar",
      },
      {
        name: "annotation_name_offset",
        type: "unit",
      },
      {
        name: "annotation_name_side",
        type: "select",
        options: ["right", "left", "top", "bottom"],
        default: "right",
      },
      {
        name: "annotation_name_rot",
        type: "number",
        default: 0,
        min: 0,
        max: 360,
      },
      {
        name: "annotation_name_align",
        type: "boolean",
        default: false,
      },
      {
        name: "annotation_height",
        type: "unit",
      },
      {
        name: "annotation_width",
        type: "unit",
      },
      {
        name: "height",
        type: "unit",
      },
      {
        name: "width",
        type: "unit",
      },
      {
        name: "simple_anno_size",
        type: "unit",
      },
      {
        name: "simple_anno_size_adjust",
        type: "boolean",
        default: false,
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
      type: "HeatmapAnnotation",
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
