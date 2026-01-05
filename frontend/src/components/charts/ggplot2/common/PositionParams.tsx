"use client";

import { useCallback, useMemo, useEffect } from "react";
import { Box, Paper, Typography, alpha, useTheme } from "@mui/material";
import { BaseDynamicParams } from "./BaseDynamicParams";
import {
  ParameterConfig,
  ParameterItem,
  PositionConfig,
  PositionDodgeConfig,
  PositionDodge2Config,
  PositionJitterConfig,
  PositionJitterdodgeConfig,
  PositionStackConfig,
  PositionFillConfig,
  PositionNudgeConfig,
} from "../types";
import { getPositionParams } from "./Parameters";

interface PositionComponentProps<T extends PositionConfig> {
  position: T;
  onChange: (position: T) => void;
}

// 通用的 Position 组件
const createPositionComponent = <T extends PositionConfig>(
  defaultType: T["type"],
  displayName: string
) => {
  return ({ position, onChange }: PositionComponentProps<T>) => {
    const theme = useTheme();
    const currentType = (position.type || defaultType) as string;

    const availableParams = useMemo(() => {
      return getPositionParams(currentType);
    }, [currentType]);

    const updateParams = useCallback(
      (newParams: Record<string, any>) => {
        // 完全替换 arguments，而不是合并，这样可以确保删除的参数被移除
        onChange({
          ...position,
          arguments: newParams,
        } as T);
      },
      [position, onChange]
    );

    const dynamicParamsValue = useMemo(() => {
      const value: Record<string, any> = {};
      if (position.arguments) {
        const args = position.arguments as Record<string, any>;
        Object.keys(args).forEach((key) => {
          if (args[key] !== undefined) {
            value[key] = args[key];
          }
        });
      }
      return value;
    }, [position]);

    return (
      <Box>
        <Paper
          sx={{
            p: 2,
            elevation: 1,
            backgroundColor: alpha(
              theme.palette.success.main,
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

// PositionDodge 组件
export const PositionDodge: React.FC<
  PositionComponentProps<PositionDodgeConfig>
> = createPositionComponent<PositionDodgeConfig>(
  "position_dodge",
  "position_dodge"
);

// PositionDodge2 组件
export const PositionDodge2: React.FC<
  PositionComponentProps<PositionDodge2Config>
> = createPositionComponent<PositionDodge2Config>(
  "position_dodge2",
  "position_dodge2"
);

// PositionJitter 组件
export const PositionJitter: React.FC<
  PositionComponentProps<PositionJitterConfig>
> = createPositionComponent<PositionJitterConfig>(
  "position_jitter",
  "position_jitter"
);

// PositionJitterdodge 组件
export const PositionJitterdodge: React.FC<
  PositionComponentProps<PositionJitterdodgeConfig>
> = createPositionComponent<PositionJitterdodgeConfig>(
  "position_jitterdodge",
  "position_jitterdodge"
);

// PositionStack 组件
export const PositionStack: React.FC<
  PositionComponentProps<PositionStackConfig>
> = createPositionComponent<PositionStackConfig>(
  "position_stack",
  "position_stack"
);

// PositionFill 组件
export const PositionFill: React.FC<
  PositionComponentProps<PositionFillConfig>
> = createPositionComponent<PositionFillConfig>(
  "position_fill",
  "position_fill"
);

// PositionNudge 组件
export const PositionNudge: React.FC<
  PositionComponentProps<PositionNudgeConfig>
> = createPositionComponent<PositionNudgeConfig>(
  "position_nudge",
  "position_nudge"
);

// PositionRenderer 组件 - 用于在 DynamicParams 中渲染 position_* 类型
interface PositionRendererProps {
  param: ParameterItem;
  availableParams: ParameterConfig[];
  onUpdate: (value: any) => void;
}

/**
 * Position 类型参数渲染器
 * 处理所有 position_* 类型（position_dodge, position_jitter, etc.）
 * 这些组件内部使用 BaseDynamicParams 来渲染原子类型参数
 */
export const PositionRenderer: React.FC<PositionRendererProps> = ({
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

  // 确定实际的 position 类型：如果是 "position" 类型，从 param.value.type 获取，否则使用 config.type
  const positionType = useMemo(() => {
    if (config.type === "position") {
      // 对于 "position" 类型，从 param.value.type 获取实际的 position 类型
      return (
        (param.value as any)?.type ||
        (config as any).default?.type ||
        (config as any).options?.[0] ||
        "position_dodge"
      );
    }
    return config.type;
  }, [config, param.value]);

  // 使用 useEffect 确保当 param.value 为 undefined 时，初始化默认值
  useEffect(() => {
    if (param.value === undefined || param.value === null) {
      let defaultValue: any;
      if (config.type === "position") {
        // 对于 "position" 类型，使用 config.default 或 config.options 的第一个
        const positionDefault = (config as any).default;
        if (positionDefault && positionDefault.type) {
          defaultValue = positionDefault;
        } else {
          const positionOptions = (config as any).options || [
            "position_dodge",
            "position_dodge2",
            "position_jitter",
            "position_jitterdodge",
            "position_stack",
            "position_fill",
            "position_nudge",
          ];
          defaultValue = {
            type: positionOptions[0] || "position_dodge",
            arguments: {},
          };
        }
      } else {
        // 对于具体的 position_* 类型，使用 config.type
        defaultValue = { type: config.type, arguments: {} };
      }
      onUpdate(defaultValue);
    }
  }, [param.value, config, onUpdate]);

  switch (positionType) {
    case "position_dodge": {
      const positionValue = param.value as PositionDodgeConfig | undefined;
      if (!positionValue) {
        return <Box>Loading...</Box>;
      }

      return (
        <PositionDodge
          position={positionValue}
          onChange={(updatedPosition) => onUpdate(updatedPosition)}
        />
      );
    }

    case "position_dodge2": {
      const positionValue = param.value as PositionDodge2Config | undefined;
      if (!positionValue) {
        return <Box>Loading...</Box>;
      }

      return (
        <PositionDodge2
          position={positionValue}
          onChange={(updatedPosition) => onUpdate(updatedPosition)}
        />
      );
    }

    case "position_jitter": {
      const positionValue = param.value as PositionJitterConfig | undefined;
      if (!positionValue) {
        return <Box>Loading...</Box>;
      }

      return (
        <PositionJitter
          position={positionValue}
          onChange={(updatedPosition) => onUpdate(updatedPosition)}
        />
      );
    }

    case "position_jitterdodge": {
      const positionValue = param.value as
        | PositionJitterdodgeConfig
        | undefined;
      if (!positionValue) {
        return <Box>Loading...</Box>;
      }

      return (
        <PositionJitterdodge
          position={positionValue}
          onChange={(updatedPosition) => onUpdate(updatedPosition)}
        />
      );
    }

    case "position_stack": {
      const positionValue = param.value as PositionStackConfig | undefined;
      if (!positionValue) {
        return <Box>Loading...</Box>;
      }

      return (
        <PositionStack
          position={positionValue}
          onChange={(updatedPosition) => onUpdate(updatedPosition)}
        />
      );
    }

    case "position_fill": {
      const positionValue = param.value as PositionFillConfig | undefined;
      if (!positionValue) {
        return <Box>Loading...</Box>;
      }

      return (
        <PositionFill
          position={positionValue}
          onChange={(updatedPosition) => onUpdate(updatedPosition)}
        />
      );
    }

    case "position_nudge": {
      const positionValue = param.value as PositionNudgeConfig | undefined;
      if (!positionValue) {
        return <Box>Loading...</Box>;
      }

      return (
        <PositionNudge
          position={positionValue}
          onChange={(updatedPosition) => onUpdate(updatedPosition)}
        />
      );
    }

    default:
      return null;
  }
};
