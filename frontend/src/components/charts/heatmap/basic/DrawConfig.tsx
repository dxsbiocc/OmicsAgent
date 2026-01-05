"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface DrawConfig {
  row_title?: string;
  column_title?: string;
  order?: "h" | "v";
  width?: number;
  height?: number;
  [key: string]: any;
}

interface DrawConfigComponentProps {
  value?: DrawConfig;
  onChange?: (config: DrawConfig) => void;
}

/**
 * DrawConfig 组件
 * Draw configuration for heatmap
 */
export const DrawConfigComponent: React.FC<DrawConfigComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "row_title",
        type: "string",
        default: "",
      },
      {
        name: "column_title",
        type: "string",
        default: "",
      },
      {
        name: "order",
        type: "select",
        options: ["h", "v"],
        default: "h",
      },
      {
        name: "width",
        type: "number",
        default: 600,
        min: 100,
        step: 10,
      },
      {
        name: "height",
        type: "number",
        default: 500,
        min: 100,
        step: 10,
      },
    ],
    []
  );

  const paramsValue = useMemo(() => {
    if (!value) {
      return {};
    }
    return {
      row_title: value.row_title || "",
      column_title: value.column_title || "",
      order: value.order || "h",
      width: value.width ?? 600,
      height: value.height ?? 500,
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

