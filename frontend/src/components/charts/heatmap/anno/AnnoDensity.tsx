"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoDensityConfig {
  type: "anno_density";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoDensityComponentProps {
  value?: AnnoDensityConfig;
  onChange?: (config: AnnoDensityConfig) => void;
}

/**
 * AnnoDensity 组件
 * Density Annotation for ComplexHeatmap
 */
export const AnnoDensity: React.FC<AnnoDensityComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "type",
        type: "select",
        options: ["lines", "violin", "heatmap"],
        default: "lines",
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
      type: "anno_density",
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

