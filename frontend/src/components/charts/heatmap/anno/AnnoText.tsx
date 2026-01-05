"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoTextConfig {
  type: "anno_text";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoTextComponentProps {
  value?: AnnoTextConfig;
  onChange?: (config: AnnoTextConfig) => void;
}

/**
 * AnnoText 组件
 * Text Annotation for ComplexHeatmap
 */
export const AnnoText: React.FC<AnnoTextComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "labels",
        type: "strings",
      },
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
      type: "anno_text",
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

