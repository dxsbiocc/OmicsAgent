"use client";

import { useCallback, useMemo } from "react";
import { Paper, Typography, Stack } from "@mui/material";
import { QcorrplotConfig } from "../types";
import { DynamicParams } from "../common/DynamicParams";
import { ParameterConfig } from "../types";

interface QcorrplotConfigProps {
  params?: QcorrplotConfig;
  onChange: (config: QcorrplotConfig | undefined) => void;
}

// qcorrplot 参数配置（非 mapping 参数）
export const qcorrplotParams: ParameterConfig[] = [
  {
    name: "type",
    type: "select",
    options: ["upper", "lower", "full"],
    default: "lower",
  },
  {
    name: "drop",
    type: "boolean",
    default: false,
  },
  {
    name: "parse",
    type: "boolean",
    default: false,
  },
  {
    name: "grid_col",
    type: "color",
  },
  {
    name: "grid_size",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "fixed",
    type: "boolean",
    default: true,
  },
  {
    name: "facets",
    type: "list",
  },
  {
    name: "facets_order",
    type: "strings",
  },
];

export const QcorrplotConfigComponent: React.FC<QcorrplotConfigProps> = ({
  params,
  onChange,
}) => {
  // 如果配置中不存在 qcorrplot 字段，不显示组件
  if (!params) {
    return null;
  }

  const updateParams = useCallback(
    (newParams: Record<string, any>) => {
      onChange({
        ...params,
        arguments: {
          ...params.arguments,
          ...newParams,
        },
      });
    },
    [params, onChange]
  );

  const dynamicParamsValue = useMemo(() => {
    return params.arguments || {};
  }, [params.arguments]);

  return (
    <Paper sx={{ p: 2 }} elevation={1}>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
        Qcorrplot 配置
      </Typography>
      <DynamicParams
        availableParams={qcorrplotParams}
        value={dynamicParamsValue}
        onChange={updateParams}
      />
    </Paper>
  );
};
