"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface LegendConfig {
  type: "Legend";
  arguments?: {
    [key: string]: any;
  };
}

interface LegendComponentProps {
  value?: LegendConfig;
  onChange?: (config: LegendConfig) => void;
}

/**
 * Legend 组件
 * Legend function for ComplexHeatmap
 */
export const Legend: React.FC<LegendComponentProps> = ({ value, onChange }) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "at",
        type: "list",
      },
      {
        name: "labels",
        type: "strings",
      },
      {
        name: "col_fun",
        type: "string",
        default: "",
      },
      {
        name: "name",
        type: "string",
        default: "",
      },
      {
        name: "grob",
        type: "list",
      },
      {
        name: "break_dist",
        type: "numbers",
      },
      {
        name: "nrow",
        type: "number",
        default: 0,
        min: 0,
      },
      {
        name: "ncol",
        type: "number",
        default: 0,
        min: 0,
      },
      {
        name: "by_row",
        type: "boolean",
        default: true,
      },
      {
        name: "grid_height",
        type: "unit",
      },
      {
        name: "grid_width",
        type: "unit",
      },
      {
        name: "tick_length",
        type: "unit",
      },
      {
        name: "gap",
        type: "unit",
      },
      {
        name: "column_gap",
        type: "unit",
      },
      {
        name: "row_gap",
        type: "unit",
      },
      {
        name: "labels_gp",
        type: "gpar",
      },
      {
        name: "labels_rot",
        type: "number",
        default: 0,
        min: 0,
        max: 360,
      },
      {
        name: "border",
        type: "color",
        default: "#000000",
      },
      {
        name: "background",
        type: "colors",
      },
      {
        name: "type",
        type: "select",
        options: ["grid", "points", "lines", "boxplot"],
        default: "grid",
      },
      {
        name: "graphics",
        type: "list",
      },
      {
        name: "legend_gp",
        type: "gpar",
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
        name: "legend_height",
        type: "unit",
      },
      {
        name: "legend_width",
        type: "unit",
      },
      {
        name: "direction",
        type: "select",
        options: ["vertical", "horizontal"],
        default: "vertical",
      },
      {
        name: "title",
        type: "string",
        default: "",
      },
      {
        name: "title_gp",
        type: "gpar",
      },
      {
        name: "title_position",
        type: "select",
        options: [
          "topleft",
          "topcenter",
          "leftcenter-rot",
          "lefttop-rot",
          "leftcenter",
          "lefttop",
        ],
        default: "topleft",
      },
      {
        name: "title_gap",
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
      type: "Legend",
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
