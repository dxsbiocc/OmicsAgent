"use client";

import { useCallback, useMemo } from "react";
import { Paper, Typography } from "@mui/material";
import { ThemeConfig } from "../types";
import { DynamicParams } from "../common/DynamicParams";
import { getAvailableThemeParams } from "./themeParams";

interface ThemeConfigProps {
  params: ThemeConfig;
  onChange: (theme: ThemeConfig) => void;
}

export const ThemeConfigComponent: React.FC<ThemeConfigProps> = ({
  params,
  onChange,
}) => {
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

  // 构建传递给 DynamicParams 的 value 对象，包含 params.arguments 中所有已定义的参数
  // DynamicParams 会处理所有类型的参数，包括 element_*, margin, unit, position 等
  const dynamicParamsValue = useMemo(() => {
    // 直接返回 params.arguments，包含所有参数（简单类型和复杂类型）
    return params.arguments || {};
  }, [params]);

  // 根据主题类型获取对应的参数配置
  const availableParams = useMemo(() => {
    return getAvailableThemeParams(params.type) || [];
  }, [params.type]);

  return (
    <Paper sx={{ p: 2 }} elevation={1}>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
        参数设置
      </Typography>
      <DynamicParams
        availableParams={availableParams}
        value={dynamicParamsValue}
        onChange={updateParams}
      />
    </Paper>
  );
};
