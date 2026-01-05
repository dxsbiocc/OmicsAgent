"use client";

import { useCallback, useMemo } from "react";
import { Box, Paper, Typography, Stack, alpha } from "@mui/material";
import { BaseConfig, AestheticConfig } from "../types";
import { Aesthetics } from "../common/Aesthetics";
import { DynamicParams } from "../common/DynamicParams";
import { ParameterConfig } from "../types";

// 定义包含 mapping 的 Layer 类型约束
interface LayerWithMapping extends BaseConfig {
  mapping?: AestheticConfig;
}

interface GeomBaseProps<T extends LayerWithMapping> {
  /** 图层参数 */
  params: T;
  /** 参数变更回调 */
  onChange: (layer: T) => void;
  /** 可选择的列名列表 */
  columns?: string[];
  /** 组件标题 */
  title: string;
  /** 可用的美学映射列表 */
  availableAesthetics: string[];
  /** 可用的参数配置列表 */
  availableParams: ParameterConfig[];
  /** 必需的美学映射（可选） */
  requiredAesthetics?: string[];
}

/**
 * 通用的几何图层基础组件
 * 所有 Geom_* 组件都可以基于此组件构建，只需传入对应的配置即可
 */
export function GeomBase<T extends LayerWithMapping>({
  params,
  onChange,
  columns = [],
  title,
  availableAesthetics,
  availableParams,
  requiredAesthetics = [],
}: GeomBaseProps<T>) {
  const updateMapping = useCallback(
    (mapping: AestheticConfig) => {
      // 直接更新 mapping，不通过 updateLayer，避免触发所有参数的默认值
      onChange({ ...params, mapping });
    },
    [params, onChange]
  );

  const updateParams = useCallback(
    (newParams: Record<string, any>) => {
      // 完全替换 arguments，而不是合并，这样可以确保删除的参数被移除
      onChange({
        ...params,
        arguments: newParams,
      });
    },
    [params, onChange]
  );

  // 构建传递给 DynamicParams 的 value 对象，只包含 params.arguments 中已定义的参数
  // 这样只会显示 meta.json 中设置的参数，而不是所有可用参数
  const dynamicParamsValue = useMemo(() => {
    const value: Record<string, any> = {};
    // 直接从 params.arguments 中提取所有已定义的参数
    if (params.arguments) {
      const args = params.arguments as Record<string, any>;
      Object.keys(args).forEach((key) => {
        if (args[key] !== undefined) {
          value[key] = args[key];
        }
      });
    }
    return value;
  }, [params]);

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
        {title}
      </Typography>

      <Stack spacing={3}>
        {/* 几何映射设置 */}
        <Paper
          sx={{
            p: 2,
            backgroundColor: (theme) =>
              alpha(theme.palette.primary.light, 0.05),
          }}
          elevation={1}
        >
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
            几何映射
          </Typography>
          <Aesthetics
            availableAesthetics={availableAesthetics}
            availableColumns={columns}
            value={
              ((params as LayerWithMapping).mapping || {}) as AestheticConfig
            }
            onChange={updateMapping}
            requiredAesthetics={requiredAesthetics}
          />
        </Paper>
        {/* 基本设置 */}
        <Paper
          sx={{
            p: 2,
            backgroundColor: (theme) =>
              alpha(theme.palette.secondary.light, 0.05),
          }}
          elevation={1}
        >
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
            基本设置
          </Typography>
          <DynamicParams
            availableParams={availableParams}
            value={dynamicParamsValue}
            onChange={updateParams}
          />
        </Paper>
      </Stack>
    </Box>
  );
}
