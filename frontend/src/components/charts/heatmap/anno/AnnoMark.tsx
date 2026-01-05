"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoMarkConfig {
  type: "anno_mark";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoMarkComponentProps {
  value?: AnnoMarkConfig;
  onChange?: (config: AnnoMarkConfig) => void;
}

/**
 * AnnoMark 组件
 * Link annotation with labels for ComplexHeatmap
 */
export const AnnoMark: React.FC<AnnoMarkComponentProps> = ({
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
        name: "which",
        type: "select",
        options: ["column", "row"],
        default: "column",
      },
      {
        name: "link_width",
        type: "unit",
      },
      {
        name: "link_height",
        type: "unit",
      },
      {
        name: "link_gp",
        type: "gpar",
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
      type: "anno_mark",
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

