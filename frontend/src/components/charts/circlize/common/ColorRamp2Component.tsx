"use client";

import { useMemo } from "react";
import { Box } from "@mui/material";
import { BaseDynamicParams } from "../../ggplot2/common/BaseDynamicParams";
import { ParameterConfig } from "../../ggplot2/types";
import { ColorRamp2Config } from "../type";

interface ColorRamp2ComponentProps {
  /** colorRamp2 配置值 */
  value?: ColorRamp2Config;
  /** 配置变化时的回调 */
  onChange?: (config: ColorRamp2Config) => void;
}

/**
 * ColorRamp2 动态组件
 * 基于 BaseDynamicParams 动态渲染 colorRamp2 的参数配置
 */
export const ColorRamp2Component: React.FC<ColorRamp2ComponentProps> = ({
  value,
  onChange,
}) => {
  // 定义 colorRamp2 的参数配置
  const availableParams: ParameterConfig[] = useMemo(
    () => [
      {
        name: "breaks",
        type: "numbers",
        default: [0, 1],
        required: true,
      },
      {
        name: "colors",
        type: "colors",
        default: ["#000000", "#FFFFFF"],
        required: true,
      },
      {
        name: "transparency",
        type: "number",
        default: 0,
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        name: "space",
        type: "select",
        options: ["RGB", "LAB", "XYZ", "sRGB", "LUV"],
        default: "RGB",
      },
      {
        name: "hcl_palette",
        type: "select",
        options: ["qualitative", "sequential", "diverging", "divergingx"],
        default: "",
      },
      {
        name: "reverse",
        type: "boolean",
        default: false,
      },
    ],
    []
  );

  // 将 ColorRamp2Config 转换为 BaseDynamicParams 需要的格式
  const paramsValue = useMemo(() => {
    if (!value || !value.arguments) {
      return {};
    }
    return value.arguments;
  }, [value]);

  // 处理参数变化
  const handleChange = (params: Record<string, any>) => {
    if (!onChange) return;

    // 构建配置参数对象
    const configArguments: any = {
      breaks: params.breaks || [0, 1],
      colors: params.colors || ["#000000", "#FFFFFF"],
      transparency: params.transparency ?? 0,
      space: (params.space || "RGB") as "RGB" | "LAB" | "XYZ" | "sRGB" | "LUV",
      reverse: params.reverse ?? false,
    };

    // 只有当 hcl_palette 不为空时才添加该字段
    if (params.hcl_palette && params.hcl_palette.trim() !== "") {
      configArguments.hcl_palette = params.hcl_palette;
    }

    // 构建新的配置对象
    const newConfig: ColorRamp2Config = {
      type: "colorRamp2",
      arguments: configArguments,
    };

    onChange(newConfig);
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
