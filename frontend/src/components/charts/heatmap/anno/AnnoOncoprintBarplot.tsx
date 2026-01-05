"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoOncoprintBarplotConfig {
  type: "anno_oncoprint_barplot";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoOncoprintBarplotComponentProps {
  value?: AnnoOncoprintBarplotConfig;
  onChange?: (config: AnnoOncoprintBarplotConfig) => void;
}

/**
 * AnnoOncoprintBarplot 组件
 * Barplot Annotation for oncoPrint in ComplexHeatmap
 */
export const AnnoOncoprintBarplot: React.FC<
  AnnoOncoprintBarplotComponentProps
> = ({ value, onChange }) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "bar_width",
        type: "number",
        default: 0.6,
        min: 0,
        max: 1,
      },
      {
        name: "gp",
        type: "gpar",
      },
      {
        name: "border",
        type: "boolean",
        default: true,
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
      type: "anno_oncoprint_barplot",
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

