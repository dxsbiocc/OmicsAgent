"use client";

import { useMemo } from "react";
import { Box, Paper, Typography, Stack } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface TransformConfig {
  rownames?: string;
  scale?: {
    type: "scale";
    arguments?: {
      center?: boolean;
      scale?: boolean;
      row?: boolean;
    };
  };
  row?: boolean;
  log2?: boolean;
  log2_offset?: number;
  split?: {
    row?: any;
    col?: any;
  };
}

interface TransformConfigComponentProps {
  value?: TransformConfig;
  onChange?: (config: TransformConfig) => void;
}

/**
 * TransformConfig 组件
 * Transform configuration for heatmap data
 */
export const TransformConfigComponent: React.FC<
  TransformConfigComponentProps
> = ({ value, onChange }) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "rownames",
        type: "string",
        default: "sample",
      },
      {
        name: "row",
        type: "boolean",
        default: false,
      },
      {
        name: "log2",
        type: "boolean",
        default: false,
      },
      {
        name: "log2_offset",
        type: "number",
        default: 1,
        min: 0,
      },
    ],
    []
  );

  const paramsValue = useMemo(() => {
    if (!value) {
      return {};
    }
    return {
      rownames: value.rownames || "sample",
      row: value.row ?? false,
      log2: value.log2 ?? false,
      log2_offset: value.log2_offset ?? 1,
    };
  }, [value]);

  const handleChange = (params: Record<string, any>) => {
    if (!onChange) return;
    onChange({
      ...value,
      ...params,
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

