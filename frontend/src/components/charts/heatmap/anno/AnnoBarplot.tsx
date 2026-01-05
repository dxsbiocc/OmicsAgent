"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoBarplotConfig {
  type: "anno_barplot";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoBarplotComponentProps {
  value?: AnnoBarplotConfig;
  onChange?: (config: AnnoBarplotConfig) => void;
}

/**
 * AnnoBarplot 组件
 * Barplot Annotation for ComplexHeatmap
 */
export const AnnoBarplot: React.FC<AnnoBarplotComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "x",
        type: "numbers",
        required: true,
      },
      {
        name: "baseline",
        type: "select",
        options: ["min", "max"],
        default: "min",
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
        name: "bar_width",
        type: "number",
        default: 0.6,
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        name: "beside",
        type: "boolean",
        default: false,
      },
      {
        name: "attach",
        type: "boolean",
        default: false,
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
        name: "axis",
        type: "boolean",
        default: true,
      },
      {
        name: "axis_param",
        type: "list",
      },
      {
        name: "add_numbers",
        type: "boolean",
        default: false,
      },
      {
        name: "numbers_gp",
        type: "gpar",
      },
      {
        name: "numbers_rot",
        type: "number",
        default: 0,
        min: 0,
        max: 360,
      },
      {
        name: "numbers_offset",
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
      type: "anno_barplot",
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
