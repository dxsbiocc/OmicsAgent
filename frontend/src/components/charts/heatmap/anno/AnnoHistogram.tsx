"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoHistogramConfig {
  type: "anno_histogram";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoHistogramComponentProps {
  value?: AnnoHistogramConfig;
  onChange?: (config: AnnoHistogramConfig) => void;
}

/**
 * AnnoHistogram 组件
 * Histogram Annotation for ComplexHeatmap
 */
export const AnnoHistogram: React.FC<AnnoHistogramComponentProps> = ({
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
        name: "n_breaks",
        type: "number",
        default: 20,
        min: 1,
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
      type: "anno_histogram",
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

