"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoSummaryConfig {
  type: "anno_summary";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoSummaryComponentProps {
  value?: AnnoSummaryConfig;
  onChange?: (config: AnnoSummaryConfig) => void;
}

/**
 * AnnoSummary 组件
 * Summary Annotation for ComplexHeatmap
 */
export const AnnoSummary: React.FC<AnnoSummaryComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "fun",
        type: "string",
        default: "mean",
      },
      {
        name: "gp",
        type: "gpar",
      },
      {
        name: "outline",
        type: "boolean",
        default: true,
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
      type: "anno_summary",
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

