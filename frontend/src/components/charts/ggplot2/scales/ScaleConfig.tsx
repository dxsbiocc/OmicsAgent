"use client";

import { useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { ScaleConfig, GuideItemConfig } from "../types";
import { DynamicParams } from "../common/DynamicParams";
import { GuideConfigComponent } from "../guides/GuideConfig";
import { getScaleParams } from "./ScaleParams";
import { availableGuideTypes } from "../common/constants";

interface ScaleConfigProps {
  params: ScaleConfig;
  onChange: (scale: ScaleConfig) => void;
}

export const ScaleConfigComponent: React.FC<ScaleConfigProps> = ({
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

  // 构建传递给 DynamicParams 的 value 对象，排除 guide 参数
  const dynamicParamsValue = useMemo(() => {
    const value: Record<string, any> = {};
    // 直接从 params.arguments 中提取所有已定义的参数，排除 guide
    if (params.arguments) {
      const args = params.arguments as Record<string, any>;
      Object.keys(args).forEach((key) => {
        if (key === "guide") return; // 跳过 guide 参数
        if (args[key] !== undefined) {
          // 对于数组类型（如 values），直接传递数组（colors 类型会直接处理数组）
          if (Array.isArray(args[key])) {
            value[key] = args[key];
          } else if (
            typeof args[key] === "object" &&
            args[key] !== null &&
            !Array.isArray(args[key])
          ) {
            // 对于对象类型，暂时不显示在 DynamicParams 中
            // 可以后续扩展支持
          } else {
            value[key] = args[key];
          }
        }
      });
    }
    return value;
  }, [params]);

  // 获取当前的 guide 配置
  const currentGuide = useMemo(() => {
    const guide = params.arguments?.guide;
    if (
      guide &&
      typeof guide === "object" &&
      "type" in guide &&
      guide.type
    ) {
      return guide as GuideItemConfig;
    }
    return null;
  }, [params.arguments]);

  // 处理 guide 类型选择
  const handleGuideTypeChange = useCallback(
    (guideType: string) => {
      if (guideType === "none" || guideType === "") {
        // 删除 guide 参数（不设置该参数）
        const { guide, ...otherArgs } = params.arguments || {};
        onChange({
          ...params,
          arguments: otherArgs,
        });
      } else {
        // 创建或更新 guide 配置
        const newGuide: GuideItemConfig = {
          type: guideType as GuideItemConfig["type"],
          arguments: currentGuide?.arguments || {},
        };
        onChange({
          ...params,
          arguments: {
            ...params.arguments,
            guide: newGuide,
          },
        });
      }
    },
    [params, onChange, currentGuide]
  );

  // 处理 guide 配置更新
  const handleGuideChange = useCallback(
    (updatedGuide: GuideItemConfig) => {
      onChange({
        ...params,
        arguments: {
          ...params.arguments,
          guide: updatedGuide,
        },
      });
    },
    [params, onChange]
  );

  const handleParamsChange = useCallback(
    (newParams: Record<string, any>) => {
      // 直接使用 newParams，因为 colors 类型已经返回数组
      updateParams(newParams);
    },
    [updateParams]
  );

  // 根据 scale 类型获取相应的参数配置
  const availableParams = useMemo(() => {
    return getScaleParams(params.type);
  }, [params.type]);

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
        {params.type} 配置
      </Typography>

      <Stack spacing={3}>
        {/* 基本设置 */}
        <Paper sx={{ p: 2 }} elevation={1}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
            参数设置
          </Typography>
          <DynamicParams
            availableParams={availableParams}
            value={dynamicParamsValue}
            onChange={handleParamsChange}
          />
        </Paper>

        {/* Guide 设置 */}
        <Paper sx={{ p: 2 }} elevation={1}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
            Guide 设置
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Guide 类型</InputLabel>
              <Select
                value={currentGuide?.type || "none"}
                label="Guide 类型"
                onChange={(e) => handleGuideTypeChange(e.target.value)}
              >
                <MenuItem value="none">无 (None)</MenuItem>
                {availableGuideTypes.map((guideType) => (
                  <MenuItem key={guideType.type} value={guideType.type}>
                    {guideType.type === "guide_none"
                      ? "置空 (guide_none)"
                      : `${guideType.label} (${guideType.type})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {currentGuide && currentGuide.type !== "guide_none" && (
              <Box sx={{ mt: 2 }}>
                <GuideConfigComponent
                  params={currentGuide}
                  onChange={handleGuideChange}
                />
              </Box>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};
