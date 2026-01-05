"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoNumericConfig {
  type: "anno_numeric";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoNumericComponentProps {
  value?: AnnoNumericConfig;
  onChange?: (config: AnnoNumericConfig) => void;
}

/**
 * AnnoNumeric 组件
 * Numeric labels annotation for ComplexHeatmap
 */
export const AnnoNumeric: React.FC<AnnoNumericComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "labels_gp",
        type: "gpar",
      },
      {
        name: "labels_rot",
        type: "number",
        default: 0,
        min: 0,
        max: 360,
      },
      {
        name: "labels_just",
        type: "pair",
      },
      {
        name: "labels_offset",
        type: "unit",
      },
      {
        name: "format",
        type: "string",
        default: "",
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
      type: "anno_numeric",
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

