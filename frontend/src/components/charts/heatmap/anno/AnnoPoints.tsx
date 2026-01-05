"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoPointsConfig {
  type: "anno_points";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoPointsComponentProps {
  value?: AnnoPointsConfig;
  onChange?: (config: AnnoPointsConfig) => void;
}

/**
 * AnnoPoints 组件
 * Points Annotation for ComplexHeatmap
 */
export const AnnoPoints: React.FC<AnnoPointsComponentProps> = ({
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
      type: "anno_points",
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

