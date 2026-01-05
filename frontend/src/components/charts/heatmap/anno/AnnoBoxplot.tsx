"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoBoxplotConfig {
  type: "anno_boxplot";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoBoxplotComponentProps {
  value?: AnnoBoxplotConfig;
  onChange?: (config: AnnoBoxplotConfig) => void;
}

/**
 * AnnoBoxplot 组件
 * Boxplot Annotation for ComplexHeatmap
 */
export const AnnoBoxplot: React.FC<AnnoBoxplotComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "x",
        type: "list",
        required: true,
      },
      {
        name: "which",
        type: "select",
        options: ["column", "row"],
        default: "column",
      },
      {
        name: "border",
        type: "boolean",
        default: true,
      },
      {
        name: "gp",
        type: "gpar",
      },
      {
        name: "ylim",
        type: "pair",
      },
      {
        name: "extend",
        type: "number",
        default: 0,
        min: 0,
        step: 0.01,
      },
      {
        name: "outline",
        type: "boolean",
        default: true,
      },
      {
        name: "box_width",
        type: "number",
        default: 0.6,
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        name: "add_points",
        type: "boolean",
        default: false,
      },
      {
        name: "pch",
        type: "number",
        default: 1,
      },
      {
        name: "size",
        type: "unit",
      },
      {
        name: "pt_gp",
        type: "gpar",
      },
      {
        name: "axis",
        type: "boolean",
        default: true,
      },
      {
        name: "axis_param",
        type: "list",
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
      type: "anno_boxplot",
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
