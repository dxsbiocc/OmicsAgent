"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoCustomizeConfig {
  type: "anno_customize";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoCustomizeComponentProps {
  value?: AnnoCustomizeConfig;
  onChange?: (config: AnnoCustomizeConfig) => void;
}

/**
 * AnnoCustomize 组件
 * Customized annotation for ComplexHeatmap
 */
export const AnnoCustomize: React.FC<AnnoCustomizeComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "fun",
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
      type: "anno_customize",
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

