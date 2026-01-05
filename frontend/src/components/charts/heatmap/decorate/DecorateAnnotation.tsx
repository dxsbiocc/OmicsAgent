"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface DecorateAnnotationConfig {
  type: "decorate_annotation";
  arguments?: {
    [key: string]: any;
  };
}

interface DecorateAnnotationComponentProps {
  value?: DecorateAnnotationConfig;
  onChange?: (config: DecorateAnnotationConfig) => void;
}

/**
 * DecorateAnnotation 组件
 * Decorate Heatmap Annotation for ComplexHeatmap
 */
export const DecorateAnnotation: React.FC<DecorateAnnotationComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "annotation_name",
        type: "string",
        required: true,
      },
      {
        name: "code",
        type: "string",
        required: true,
      },
      {
        name: "slice",
        type: "number",
        default: 1,
        min: 1,
      },
      {
        name: "heatmap_name",
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
      type: "decorate_annotation",
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

