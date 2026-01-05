"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoSimpleConfig {
  type: "anno_simple";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoSimpleComponentProps {
  value?: AnnoSimpleConfig;
  onChange?: (config: AnnoSimpleConfig) => void;
}

/**
 * AnnoSimple 组件
 * Simple Annotation for ComplexHeatmap
 */
export const AnnoSimple: React.FC<AnnoSimpleComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "col",
        type: "colors",
      },
      {
        name: "gp",
        type: "gpar",
      },
      {
        name: "border",
        type: "boolean",
        default: false,
      },
      {
        name: "na_col",
        type: "color",
        default: "#FFFFFF",
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
      type: "anno_simple",
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

