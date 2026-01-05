"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoTextboxConfig {
  type: "anno_textbox";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoTextboxComponentProps {
  value?: AnnoTextboxConfig;
  onChange?: (config: AnnoTextboxConfig) => void;
}

/**
 * AnnoTextbox 组件
 * Text box annotations for ComplexHeatmap
 */
export const AnnoTextbox: React.FC<AnnoTextboxComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "text",
        type: "strings",
      },
      {
        name: "gp",
        type: "gpar",
      },
      {
        name: "box_gp",
        type: "gpar",
      },
      {
        name: "width",
        type: "unit",
      },
      {
        name: "height",
        type: "unit",
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
      type: "anno_textbox",
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

