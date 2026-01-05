"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoBlockConfig {
  type: "anno_block";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoBlockComponentProps {
  value?: AnnoBlockConfig;
  onChange?: (config: AnnoBlockConfig) => void;
}

/**
 * AnnoBlock 组件
 * Block annotation for ComplexHeatmap
 */
export const AnnoBlock: React.FC<AnnoBlockComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "align_to",
        type: "numbers",
      },
      {
        name: "gp",
        type: "gpar",
      },
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
        name: "labels_offset",
        type: "unit",
      },
      {
        name: "labels_just",
        type: "pair",
      },
      {
        name: "which",
        type: "select",
        options: ["column", "row"],
        default: "column",
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
        name: "show_name",
        type: "boolean",
        default: true,
      },
      {
        name: "panel_fun",
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
      type: "anno_block",
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
