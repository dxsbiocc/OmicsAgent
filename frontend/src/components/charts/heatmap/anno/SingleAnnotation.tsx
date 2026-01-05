"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface SingleAnnotationConfig {
  type: "SingleAnnotation";
  arguments?: {
    [key: string]: any;
  };
}

interface SingleAnnotationComponentProps {
  value?: SingleAnnotationConfig;
  onChange?: (config: SingleAnnotationConfig) => void;
}

/**
 * SingleAnnotation 组件
 * Single Annotation for ComplexHeatmap
 */
export const SingleAnnotation: React.FC<SingleAnnotationComponentProps> = ({
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
        name: "value",
        type: "list",
        required: true,
      },
      {
        name: "col",
        type: "colors",
      },
      {
        name: "fun",
        type: "string",
        default: "",
      },
      {
        name: "label",
        type: "string",
        default: "",
      },
      {
        name: "na_col",
        type: "color",
        default: "#FFFFFF",
      },
      {
        name: "which",
        type: "select",
        options: ["column", "row"],
        default: "column",
      },
      {
        name: "show_legend",
        type: "boolean",
        default: true,
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
        name: "legend_param",
        type: "list",
      },
      {
        name: "show_name",
        type: "boolean",
        default: true,
      },
      {
        name: "name_gp",
        type: "gpar",
      },
      {
        name: "name_offset",
        type: "unit",
      },
      {
        name: "name_side",
        type: "select",
        options: ["right", "left", "top", "bottom"],
        default: "right",
      },
      {
        name: "name_rot",
        type: "number",
        default: 0,
        min: 0,
        max: 360,
      },
      {
        name: "simple_anno_size",
        type: "unit",
      },
      {
        name: "width",
        type: "unit",
      },
      {
        name: "height",
        type: "unit",
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
      type: "SingleAnnotation",
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
