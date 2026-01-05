"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoLinesConfig {
  type: "anno_lines";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoLinesComponentProps {
  value?: AnnoLinesConfig;
  onChange?: (config: AnnoLinesConfig) => void;
}

/**
 * AnnoLines 组件
 * Lines Annotation for ComplexHeatmap
 */
export const AnnoLines: React.FC<AnnoLinesComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "gp",
        type: "gpar",
      },
      {
        name: "smooth",
        type: "boolean",
        default: false,
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
        name: "axis",
        type: "boolean",
        default: true,
      },
      {
        name: "axis_param",
        type: "list",
      },
      {
        name: "which",
        type: "select",
        options: ["column", "row"],
        default: "column",
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
      type: "anno_lines",
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

