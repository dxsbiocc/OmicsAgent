"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface DecorateTitleConfig {
  type: "decorate_title";
  arguments?: {
    [key: string]: any;
  };
}

interface DecorateTitleComponentProps {
  value?: DecorateTitleConfig;
  onChange?: (config: DecorateTitleConfig) => void;
}

/**
 * DecorateTitle 组件
 * Decorate Heatmap Title for ComplexHeatmap
 */
export const DecorateTitle: React.FC<DecorateTitleComponentProps> = ({
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
      type: "decorate_title",
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

