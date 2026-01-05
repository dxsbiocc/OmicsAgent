"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoEmptyConfig {
  type: "anno_empty";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoEmptyComponentProps {
  value?: AnnoEmptyConfig;
  onChange?: (config: AnnoEmptyConfig) => void;
}

/**
 * AnnoEmpty 组件
 * Empty Annotation for ComplexHeatmap
 */
export const AnnoEmpty: React.FC<AnnoEmptyComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "border",
        type: "boolean",
        default: false,
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
      type: "anno_empty",
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

