"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";

export interface AnnoLinkConfig {
  type: "anno_link";
  arguments?: {
    [key: string]: any;
  };
}

interface AnnoLinkComponentProps {
  value?: AnnoLinkConfig;
  onChange?: (config: AnnoLinkConfig) => void;
}

/**
 * AnnoLink 组件
 * Link Annotation for ComplexHeatmap
 */
export const AnnoLink: React.FC<AnnoLinkComponentProps> = ({
  value,
  onChange,
}) => {
  const availableParams: ParameterConfig[] = useMemo(
    () => [
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
        name: "link_rot",
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
      type: "anno_link",
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

