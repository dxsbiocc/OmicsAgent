"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoHorizonConfig {
  type: "anno_horizon";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoHorizonComponentProps {
  value?: AnnoHorizonConfig;
  onChange?: (config: AnnoHorizonConfig) => void;
}

/**
 * AnnoHorizon 组件
 * Horizon chart Annotation for ComplexHeatmap
 */
export const AnnoHorizon: React.FC<AnnoHorizonComponentProps> = ({
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
        name: "n_slices",
        type: "number",
        default: 5,
        min: 1,
      },
      {
        name: "positive_col",
        type: "colors",
      },
      {
        name: "negative_col",
        type: "colors",
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
      type: "anno_horizon",
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

