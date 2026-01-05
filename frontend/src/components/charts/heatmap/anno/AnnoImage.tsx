"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoImageConfig {
  type: "anno_image";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoImageComponentProps {
  value?: AnnoImageConfig;
  onChange?: (config: AnnoImageConfig) => void;
}

/**
 * AnnoImage 组件
 * Image Annotation for ComplexHeatmap
 */
export const AnnoImage: React.FC<AnnoImageComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "image",
        type: "string",
        default: "",
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
      type: "anno_image",
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

