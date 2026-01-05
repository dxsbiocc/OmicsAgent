"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface DecorateColumnTitleConfig {
  type: "decorate_column_title";
  arguments?: {
    [key: string]: any;
  };
}

interface DecorateColumnTitleComponentProps {
  value?: DecorateColumnTitleConfig;
  onChange?: (config: DecorateColumnTitleConfig) => void;
}

/**
 * DecorateColumnTitle 组件
 * Decorate Heatmap Column Titles for ComplexHeatmap
 */
export const DecorateColumnTitle: React.FC<
  DecorateColumnTitleComponentProps
> = ({ value, onChange }) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "code",
        type: "string",
        required: true,
      },
      {
        name: "slice",
        type: "number",
        default: 1,
        min: 1,
      },
      {
        name: "heatmap_name",
        type: "string",
        default: "",
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
      type: "decorate_column_title",
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

