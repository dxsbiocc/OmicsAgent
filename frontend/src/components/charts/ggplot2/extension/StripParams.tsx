"use client";

import { useCallback, useMemo, useEffect } from "react";
import { Box, Paper, Typography, alpha, useTheme } from "@mui/material";
import { BaseDynamicParams } from "../common/BaseDynamicParams";
import {
  ParameterConfig,
  ParameterItem,
  StripConfig,
  StripThemedConfig,
  StripNestedConfig,
  StripSplitConfig,
  StripVanillaConfig,
  StripTagConfig,
} from "../types";
import { getStripParams } from "../common/Parameters";

interface StripComponentProps<T extends StripConfig> {
  strip: T;
  onChange: (strip: T) => void;
}

// 通用的 Strip 组件
const createStripComponent = <T extends StripConfig>(
  defaultType: T["type"],
  displayName: string
) => {
  return ({ strip, onChange }: StripComponentProps<T>) => {
    const theme = useTheme();
    const currentType = (strip.type || defaultType) as string;

    const availableParams = useMemo(() => {
      return getStripParams(currentType);
    }, [currentType]);

    const updateParams = useCallback(
      (newParams: Record<string, any>) => {
        // 完全替换 arguments，而不是合并，这样可以确保删除的参数被移除
        onChange({
          ...strip,
          arguments: newParams,
        } as T);
      },
      [strip, onChange]
    );

    const dynamicParamsValue = useMemo(() => {
      const value: Record<string, any> = {};
      if (strip.arguments) {
        const args = strip.arguments as Record<string, any>;
        Object.keys(args).forEach((key) => {
          if (args[key] !== undefined) {
            value[key] = args[key];
          }
        });
      }
      return value;
    }, [strip]);

    return (
      <Box>
        <Paper
          sx={{
            p: 2,
            elevation: 1,
            backgroundColor: alpha(
              theme.palette.warning.main,
              theme.palette.mode === "dark" ? 0.1 : 0.05
            ),
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
            {displayName} 参数
          </Typography>
          <BaseDynamicParams
            availableParams={availableParams}
            value={dynamicParamsValue}
            onChange={updateParams}
            nested={true}
          />
        </Paper>
      </Box>
    );
  };
};

// StripThemed 组件
export const StripThemed: React.FC<StripComponentProps<StripThemedConfig>> =
  createStripComponent<StripThemedConfig>("strip_themed", "strip_themed");

// StripNested 组件
export const StripNested: React.FC<StripComponentProps<StripNestedConfig>> =
  createStripComponent<StripNestedConfig>("strip_nested", "strip_nested");

// StripSplit 组件
export const StripSplit: React.FC<StripComponentProps<StripSplitConfig>> =
  createStripComponent<StripSplitConfig>("strip_split", "strip_split");

// StripVanilla 组件
export const StripVanilla: React.FC<StripComponentProps<StripVanillaConfig>> =
  createStripComponent<StripVanillaConfig>("strip_vanilla", "strip_vanilla");

// StripTag 组件
export const StripTag: React.FC<StripComponentProps<StripTagConfig>> =
  createStripComponent<StripTagConfig>("strip_tag", "strip_tag");

// StripRenderer 组件 - 用于在 DynamicParams 中渲染 strip_* 类型
interface StripRendererProps {
  param: ParameterItem;
  availableParams: ParameterConfig[];
  onUpdate: (value: any) => void;
}

/**
 * Strip 类型参数渲染器
 * 处理所有 strip_* 类型（strip_themed, strip_nested, strip_split, etc.）
 * 这些组件内部使用 BaseDynamicParams 来渲染原子类型参数
 */
export const StripRenderer: React.FC<StripRendererProps> = ({
  param,
  availableParams,
  onUpdate,
}) => {
  // 从 availableParams 中查找对应的 config
  const config = useMemo(() => {
    return availableParams.find((p) => p.name === param.name);
  }, [availableParams, param.name]);

  if (!config) {
    return null;
  }

  // 确定实际的 strip 类型：如果是 "strip" 类型，从 param.value.type 获取，否则使用 config.type
  const stripType = useMemo(() => {
    if (config.type === "strip") {
      // 对于 "strip" 类型，从 param.value.type 获取实际的 strip 类型
      return (
        (param.value as any)?.type ||
        (config as any).default?.type ||
        (config as any).options?.[0] ||
        "strip_vanilla"
      );
    }
    return config.type;
  }, [config, param.value]);

  // 使用 useEffect 确保当 param.value 为 undefined 时，初始化默认值
  useEffect(() => {
    if (param.value === undefined || param.value === null) {
      let defaultValue: any;
      if (config.type === "strip") {
        // 对于 "strip" 类型，使用 config.default 或 config.options 的第一个
        const stripDefault = (config as any).default;
        if (stripDefault && stripDefault.type) {
          defaultValue = stripDefault;
        } else {
          const stripOptions = (config as any).options || [
            "strip_vanilla",
            "strip_themed",
            "strip_nested",
            "strip_split",
            "strip_tag",
          ];
          defaultValue = {
            type: stripOptions[0] || "strip_vanilla",
            arguments: {},
          };
        }
      } else {
        // 对于具体的 strip_* 类型，使用 config.type
        defaultValue = { type: config.type, arguments: {} };
      }
      onUpdate(defaultValue);
    }
  }, [param.value, config, onUpdate]);

  switch (stripType) {
    case "strip_themed": {
      const stripValue = param.value as StripThemedConfig | undefined;
      if (!stripValue) {
        return <Box>Loading...</Box>;
      }

      return (
        <StripThemed
          strip={stripValue}
          onChange={(updatedStrip) => onUpdate(updatedStrip)}
        />
      );
    }

    case "strip_nested": {
      const stripValue = param.value as StripNestedConfig | undefined;
      if (!stripValue) {
        return <Box>Loading...</Box>;
      }

      return (
        <StripNested
          strip={stripValue}
          onChange={(updatedStrip) => onUpdate(updatedStrip)}
        />
      );
    }

    case "strip_split": {
      const stripValue = param.value as StripSplitConfig | undefined;
      if (!stripValue) {
        return <Box>Loading...</Box>;
      }

      return (
        <StripSplit
          strip={stripValue}
          onChange={(updatedStrip) => onUpdate(updatedStrip)}
        />
      );
    }

    case "strip_vanilla": {
      const stripValue = param.value as StripVanillaConfig | undefined;
      if (!stripValue) {
        return <Box>Loading...</Box>;
      }

      return (
        <StripVanilla
          strip={stripValue}
          onChange={(updatedStrip) => onUpdate(updatedStrip)}
        />
      );
    }

    case "strip_tag": {
      const stripValue = param.value as StripTagConfig | undefined;
      if (!stripValue) {
        return <Box>Loading...</Box>;
      }

      return (
        <StripTag
          strip={stripValue}
          onChange={(updatedStrip) => onUpdate(updatedStrip)}
        />
      );
    }

    default:
      return null;
  }
};
