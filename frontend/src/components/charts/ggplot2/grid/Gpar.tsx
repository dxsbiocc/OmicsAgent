"use client";

import { useCallback, useMemo } from "react";
import { Paper, Typography, Box, IconButton } from "@mui/material";
import Iconify from "@/components/common/Iconify";
import { GparConfig, ParameterConfig } from "../types";
import { DynamicParams } from "../common/DynamicParams";
import {
  linetypeOptions,
  lineendOptions,
  linejoinOptions,
} from "../common/constants";

const fontFaceOptions = ["plain", "bold", "italic", "bold.italic"];

interface GparConfigProps {
  params?: GparConfig;
  onChange: (config: GparConfig | undefined) => void;
}

// gpar 参数配置（支持向量值）
export const gparParams: ParameterConfig[] = [
  {
    name: "col",
    type: "colors", // 支持颜色向量
  },
  {
    name: "fill",
    type: "colors", // 支持颜色向量
  },
  {
    name: "alpha",
    type: "numbers", // 支持数字向量
  },
  {
    name: "lty",
    type: "strings", // 支持字符串向量
    options: linetypeOptions, // 从预定义选项中选择
  },
  {
    name: "lwd",
    type: "numbers", // 支持数字向量
  },
  {
    name: "lex",
    type: "numbers", // 支持数字向量
  },
  {
    name: "fontsize",
    type: "numbers", // 支持数字向量
  },
  {
    name: "cex",
    type: "numbers", // 支持数字向量
  },
  {
    name: "fontfamily",
    type: "strings", // 支持字符串向量
    options: ["sans", "serif", "mono"], // 从预定义选项中选择
  },
  {
    name: "fontface",
    type: "strings", // 支持字符串向量
    options: fontFaceOptions, // 从预定义选项中选择
  },
  {
    name: "lineheight",
    type: "numbers", // 支持数字向量
  },
  {
    name: "font",
    type: "numbers", // 支持数字向量
  },
  {
    name: "lineend",
    type: "strings", // 支持字符串向量
    options: lineendOptions, // 从预定义选项中选择
  },
  {
    name: "linejoin",
    type: "strings", // 支持字符串向量
    options: linejoinOptions, // 从预定义选项中选择
  },
  {
    name: "linemitre",
    type: "numbers", // 支持数字向量
  },
];

export const Gpar: React.FC<GparConfigProps> = ({ params, onChange }) => {
  // 如果配置中不存在 gpar 字段，不显示组件
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

  const handleRemove = useCallback(() => {
    onChange(undefined);
  }, [onChange]);

  return (
    <Paper sx={{ p: 2, position: "relative" }} elevation={1}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          图形参数 (gpar)
        </Typography>
        <IconButton
          size="small"
          color="error"
          onClick={handleRemove}
          sx={{
            minWidth: 32,
            width: 32,
            height: 32,
          }}
        >
          <Iconify icon="mdi:delete" size={20} />
        </IconButton>
      </Box>
      <DynamicParams
        availableParams={gparParams}
        value={dynamicParamsValue}
        onChange={updateParams}
      />
    </Paper>
  );
};
