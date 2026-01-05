"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface DecorateColumnNamesConfig {
  type: "decorate_column_names";
  arguments?: {
    [key: string]: any;
  };
}

interface DecorateColumnNamesComponentProps {
  value?: DecorateColumnNamesConfig;
  onChange?: (config: DecorateColumnNamesConfig) => void;
}

/**
 * DecorateColumnNames 组件
 * Decorate Heatmap Column Names for ComplexHeatmap
 */
export const DecorateColumnNames: React.FC<
  DecorateColumnNamesComponentProps
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
      type: "decorate_column_names",
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

