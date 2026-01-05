"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoJoyplotConfig {
  type: "anno_joyplot";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoJoyplotComponentProps {
  value?: AnnoJoyplotConfig;
  onChange?: (config: AnnoJoyplotConfig) => void;
}

/**
 * AnnoJoyplot 组件
 * Joyplot Annotation for ComplexHeatmap
 */
export const AnnoJoyplot: React.FC<AnnoJoyplotComponentProps> = ({
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
        name: "width",
        type: "number",
        default: 0.8,
        min: 0,
        max: 1,
      },
      {
        name: "space",
        type: "number",
        default: 0.02,
        min: 0,
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
      type: "anno_joyplot",
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

