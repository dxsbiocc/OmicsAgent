"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface DecorateDimnamesConfig {
  type: "decorate_dimnames";
  arguments?: {
    [key: string]: any;
  };
}

interface DecorateDimnamesComponentProps {
  value?: DecorateDimnamesConfig;
  onChange?: (config: DecorateDimnamesConfig) => void;
}

/**
 * DecorateDimnames 组件
 * Decorate Heatmap Dimension Names for ComplexHeatmap
 */
export const DecorateDimnames: React.FC<DecorateDimnamesComponentProps> = ({
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
      type: "decorate_dimnames",
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

