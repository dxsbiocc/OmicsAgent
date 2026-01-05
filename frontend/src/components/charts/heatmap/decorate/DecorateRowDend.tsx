"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface DecorateRowDendConfig {
  type: "decorate_row_dend";
  arguments?: {
    [key: string]: any;
  };
}

interface DecorateRowDendComponentProps {
  value?: DecorateRowDendConfig;
  onChange?: (config: DecorateRowDendConfig) => void;
}

/**
 * DecorateRowDend 组件
 * Decorate Heatmap Row Dendrograms for ComplexHeatmap
 */
export const DecorateRowDend: React.FC<DecorateRowDendComponentProps> = ({
  value,
  onChange,
}) => {
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
      type: "decorate_row_dend",
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

