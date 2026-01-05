"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { CheckCircle, PlayArrow, Refresh } from "@mui/icons-material";
import DynamicParameterForm from "@/components/common/DynamicParameterForm";
import { OptionsComponent } from "@/components/charts/echarts/charts";
import { Ggplot2Config } from "@/components/charts/ggplot2/types";
import { Ggplot2Component } from "@/components/charts/ggplot2/ggplot2";
import {
  HeatmapComponent,
  HeatmapFullConfig,
} from "@/components/charts/heatmap";
import { useChartStore } from "@/stores/chartStore";

interface ConfigTabProps {
  chartType: "js" | "py" | "r";
  currentTool: any;
  slug: string;
  onParametersChange?: (params: { [key: string]: any }) => void;
  tableData?: any[]; // 用于 ggplot2 的列选择
  onUpdateParams?: () => void; // 更新参数的按钮回调（可选）
  onDrawClick?: (includeData?: boolean) => void; // 触发重绘事件的回调，includeData 表示是否包含数据
  isDrawing?: boolean; // 是否正在绘制
  initialParams?: { [key: string]: any }; // 初始参数，用于恢复状态
}

export default function ConfigTab({
  chartType,
  currentTool,
  slug,
  onParametersChange,
  tableData = [],
  onUpdateParams,
  onDrawClick,
  isDrawing = false,
  initialParams,
}: ConfigTabProps) {
  // 从 chartStore 获取数据更新状态
  const { dataUpdated } = useChartStore();
  const [paramsUpdated, setParamsUpdated] = useState(false);
  const [paramsUpdatedKey, setParamsUpdatedKey] = useState(0); // 用于强制提示组件更新
  const [configKey, setConfigKey] = useState(0); // 用于强制重新渲染组件

  // 检查工具是否有 heatmap 或 ggplot2 配置
  const hasHeatmapConfig = useMemo(() => {
    return !!currentTool?.heatmap;
  }, [currentTool]);

  const hasGgplot2Config = useMemo(() => {
    return !!currentTool?.ggplot2;
  }, [currentTool]);

  // 初始化 ggplot2 配置（默认配置）
  const defaultGgplot2Config = useMemo<Ggplot2Config>(() => {
    if (currentTool?.ggplot2) {
      return currentTool.ggplot2;
    }
    return {
      mapping: { x: "", y: "" },
      layers: [],
      labs: {},
      theme: [],
      width: 800,
      height: 600,
    };
  }, [currentTool]);

  // 初始化 heatmap 配置（默认配置）
  const defaultHeatmapConfig = useMemo<HeatmapFullConfig>(() => {
    if (currentTool?.heatmap) {
      return currentTool.heatmap;
    }
    return {
      transform: {},
      heatmap: [],
      draw: { order: "h" },
    };
  }, [currentTool]);

  // 从 initialParams 或默认配置中恢复 ggplot2 配置
  const initialGgplot2Config = useMemo<Ggplot2Config>(() => {
    if (initialParams?.ggplot2) {
      return initialParams.ggplot2;
    }
    return defaultGgplot2Config;
  }, [initialParams, defaultGgplot2Config]);

  // 从 initialParams 或默认配置中恢复 heatmap 配置
  const initialHeatmapConfig = useMemo<HeatmapFullConfig>(() => {
    if (initialParams?.heatmap) {
      return initialParams.heatmap;
    }
    return defaultHeatmapConfig;
  }, [initialParams, defaultHeatmapConfig]);

  // 当前使用的配置（可以通过重置恢复为默认）
  const [ggplot2Config, setGgplot2Config] =
    useState<Ggplot2Config>(initialGgplot2Config);
  const [heatmapConfig, setHeatmapConfig] =
    useState<HeatmapFullConfig>(initialHeatmapConfig);

  // 参数状态，从 initialParams 恢复或使用空对象
  const [parameters, setParameters] = useState<{ [key: string]: any }>(
    initialParams || {}
  );

  // 当 initialParams 变化时（从父组件恢复或重置），更新配置和参数
  useEffect(() => {
    if (hasHeatmapConfig && initialParams?.heatmap) {
      // 如果有 heatmap 配置，使用 heatmap
      setHeatmapConfig(initialParams.heatmap);
      setParameters(initialParams);
    } else if (hasGgplot2Config && initialParams?.ggplot2) {
      // 如果有 ggplot2 配置，使用 ggplot2
      setGgplot2Config(initialParams.ggplot2);
      setParameters(initialParams);
    } else {
      // 如果 initialParams 为空或没有对应配置（切换页面后重置），使用默认配置
      if (hasHeatmapConfig) {
        setHeatmapConfig(defaultHeatmapConfig);
      } else if (hasGgplot2Config) {
        setGgplot2Config(defaultGgplot2Config);
      }
      setParameters({});
    }
  }, [
    initialParams,
    defaultGgplot2Config,
    defaultHeatmapConfig,
    hasHeatmapConfig,
    hasGgplot2Config,
  ]);

  const handleParametersChange = useCallback(
    (params: { [key: string]: any }) => {
      setParameters(params);
      setParamsUpdated(true);
      // 如果提供了 onParametersChange，立即更新（实时更新模式）
      onParametersChange?.(params);
    },
    [onParametersChange]
  );

  const handleGgplot2ConfigChange = useCallback(
    (config: Ggplot2Config) => {
      // 更新当前配置状态
      setGgplot2Config(config);
      // 将 ggplot2 配置包装成参数格式
      const params = {
        ggplot2: config,
      };
      setParameters(params);
      setParamsUpdated(true);
      // 如果提供了 onParametersChange，立即更新（实时更新模式）
      onParametersChange?.(params);
    },
    [onParametersChange]
  );

  const handleHeatmapConfigChange = useCallback(
    (config: HeatmapFullConfig) => {
      // 更新当前配置状态
      setHeatmapConfig(config);
      // 将 heatmap 配置包装成参数格式
      const params = {
        heatmap: config,
      };
      setParameters(params);
      setParamsUpdated(true);
      // 如果提供了 onParametersChange，立即更新（实时更新模式）
      onParametersChange?.(params);
    },
    [onParametersChange]
  );

  const handleUpdateAndDraw = useCallback(() => {
    // 更新参数并触发重绘
    if (Object.keys(parameters).length > 0) {
      onParametersChange?.(parameters);
      setParamsUpdated(false);
      onUpdateParams?.();
      // 触发重绘事件，如果数据有更新，传递 includeData=true
      onDrawClick?.(dataUpdated);
    }
  }, [
    parameters,
    onParametersChange,
    onUpdateParams,
    onDrawClick,
    dataUpdated,
  ]);

  const handleReset = useCallback(() => {
    // 重置为默认配置
    let resetParams: { [key: string]: any } = {};
    
    if (hasHeatmapConfig) {
      resetParams = { heatmap: defaultHeatmapConfig };
      setHeatmapConfig(defaultHeatmapConfig);
    } else if (hasGgplot2Config) {
      resetParams = { ggplot2: defaultGgplot2Config };
      setGgplot2Config(defaultGgplot2Config);
    }
    
    // 强制重新渲染组件（通过改变 key）
    setConfigKey((prev) => prev + 1);
    // 更新参数状态
    setParameters(resetParams);
    // 重置后隐藏提示组件
    setParamsUpdated(false);
    setParamsUpdatedKey((prev) => prev + 1);
    // 通知父组件参数已更新
    onParametersChange?.(resetParams);
  }, [
    defaultGgplot2Config,
    defaultHeatmapConfig,
    hasHeatmapConfig,
    hasGgplot2Config,
    onParametersChange,
  ]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {chartType === "js" ? (
          // JavaScript图表：使用统一的配置组件，不需要 params_schema 和 defaults
          <OptionsComponent toolName={slug} />
        ) : chartType === "r" ? (
          // R图表：根据配置选择渲染 ggplot2 或 heatmap 组件
          hasHeatmapConfig ? (
            <HeatmapComponent
              key={configKey}
              config={heatmapConfig}
              onChange={handleHeatmapConfigChange}
              columns={Object.keys(tableData?.[0] || {})}
            />
          ) : hasGgplot2Config ? (
            <Ggplot2Component
              key={configKey}
              config={ggplot2Config}
              onChange={handleGgplot2ConfigChange}
              columns={Object.keys(tableData?.[0] || {})}
            />
          ) : (
            // 如果没有配置，显示提示
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                该工具没有配置 ggplot2 或 heatmap 参数
              </Typography>
            </Box>
          )
        ) : (
          // Python图表：使用传统的参数配置表单，需要 params_schema 和 defaults
          <DynamicParameterForm
            toolInfo={{
              name: currentTool?.name || "",
              description: currentTool?.description || "",
              params_schema:
                currentTool?.params_schema || currentTool?.params || {},
              defaults: currentTool?.defaults || {},
            }}
            onParametersChange={handleParametersChange}
            mode={chartType}
          />
        )}
      </Box>

      {/* 更新并重新绘制按钮（可选，仅在 R/Python 模式下显示） */}
      {(chartType === "r" || chartType === "py") && onDrawClick && (
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.03)",
          }}
        >
          <Stack spacing={1} sx={{ alignItems: "center" }}>
            {(paramsUpdated || dataUpdated) && (
              <Typography
                key={paramsUpdatedKey}
                variant="caption"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <CheckCircle fontSize="small" color="success" />
                {paramsUpdated && dataUpdated
                  ? "参数和数据已更新，点击按钮应用并重新绘制"
                  : paramsUpdated
                  ? "参数已更新，点击按钮应用并重新绘制"
                  : "数据已更新，点击按钮应用并重新绘制"}
              </Typography>
            )}
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleReset}
                disabled={isDrawing}
              >
                重置
              </Button>
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={handleUpdateAndDraw}
                disabled={Object.keys(parameters).length === 0 || isDrawing}
              >
                {isDrawing ? "绘制中..." : "更新"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
