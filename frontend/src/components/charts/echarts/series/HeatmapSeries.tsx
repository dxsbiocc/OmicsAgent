import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  MenuItem,
  Select,
  Switch,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Slider,
  Typography,
  Stack,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
} from "@mui/material";
import { TextStyle, LabelLayout } from "../common";
import { HeatmapSeriesOption } from "echarts";
import { useChartStore } from "@/stores/chartStore";
import MarkOptionComponent from "../common/MarkDataComponent";
import ItemStyle from "../common/ItemStyle";

// 柱状图系列配置
interface HeatmapSeriesProps {
  seriesIndex?: number; // 系列索引，默认为0
}

const HeatmapSeries: React.FC<HeatmapSeriesProps> = ({
  seriesIndex: initialSeriesIndex = 0,
}) => {
  const { chartOption, setChartOption } = useChartStore();

  // 使用内部状态管理系列索引
  const [seriesIndex, setSeriesIndex] = useState(initialSeriesIndex);

  // 获取当前选中的系列名称
  const currentSeriesName = useMemo(() => {
    const series = chartOption?.series;
    if (Array.isArray(series) && series[seriesIndex]) {
      return series[seriesIndex].name || `系列 ${seriesIndex + 1}`;
    }
    return `系列 ${seriesIndex + 1}`;
  }, [chartOption?.series, seriesIndex]);

  // 直接获取系列配置，处理数组情况
  const getSeriesOption = useCallback(() => {
    const series = chartOption?.series;
    if (Array.isArray(series)) {
      return series[seriesIndex] || {};
    }
    return series || {};
  }, [chartOption?.series, seriesIndex]);

  // 确保所有值都有默认值，避免受控/非受控组件警告
  const currentSeries = useMemo(() => {
    const seriesOption = getSeriesOption() as HeatmapSeriesOption;
    return {
      name: seriesOption?.name || "",
      colorBy: seriesOption?.colorBy || "series",
      coordinateSystem: seriesOption?.coordinateSystem || "cartesian2d",

      pointSize: seriesOption?.pointSize || 10,
      blurSize: seriesOption?.blurSize || 10,
      minOpacity: seriesOption?.minOpacity || 0,
      maxOpacity: seriesOption?.maxOpacity || 1,

      itemStyle: seriesOption?.itemStyle || {},
      label: seriesOption?.label || {},
      labelLayout: (seriesOption as any)?.labelLayout || {},
      markLine: seriesOption?.markLine || undefined,
      markPoint: seriesOption?.markPoint || undefined,
      markArea: seriesOption?.markArea || undefined,
    };
  }, [seriesIndex, chartOption?.series, getSeriesOption]);

  // 直接更新系列配置
  const updateSeries = useCallback(
    (key: string, newValue: any) => {
      setChartOption((draft) => {
        if (!draft) return;

        // 确保 series 存在
        if (!draft.series) {
          draft.series = [];
        }

        // 处理 series 是数组的情况
        if (Array.isArray(draft.series)) {
          if (draft.series.length <= seriesIndex) {
            // 扩展数组到所需长度
            while (draft.series.length <= seriesIndex) {
              draft.series.push({});
            }
          }
          (draft.series[seriesIndex] as any)[key] = newValue;
        } else {
          (draft.series as any)[key] = newValue;
        }
      });
    },
    [setChartOption, seriesIndex]
  );

  // 更新嵌套对象的辅助函数
  const updateNestedSeries = useCallback(
    (path: (string | number)[], value: any) => {
      setChartOption((draft) => {
        if (!draft) return;

        // 确保 series 存在
        if (!draft.series) {
          draft.series = [];
        }

        // 处理 series 是数组的情况
        if (Array.isArray(draft.series)) {
          if (draft.series.length <= seriesIndex) {
            // 扩展数组到所需长度
            while (draft.series.length <= seriesIndex) {
              draft.series.push({});
            }
          }

          let current: any = draft.series[seriesIndex];
          for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
              current[path[i]] = {};
            }
            current = current[path[i]];
          }
          current[path[path.length - 1]] = value;
        } else {
          let current: any = draft.series;
          for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
              current[path[i]] = {};
            }
            current = current[path[i]];
          }
          current[path[path.length - 1]] = value;
        }
      });
    },
    [setChartOption, seriesIndex]
  );

  const barSeriesContent = useMemo(
    () => (
      <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
        <Typography variant="h6" gutterBottom>
          热力图
        </Typography>
        <Divider />
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Box sx={{ p: 1 }}>
            <Paper sx={{ p: 2 }} elevation={3}>
              {/* 选择当前要配置的系列 */}
              <Grid container spacing={2} alignItems="center" sx={{ p: 1 }}>
                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>选择系列</InputLabel>
                    <Select
                      label="选择系列"
                      value={currentSeriesName}
                      onChange={(e) => {
                        const selectedName = e.target.value as string;

                        // 查找对应的系列索引
                        const series = chartOption?.series;
                        if (Array.isArray(series)) {
                          const foundIndex = series.findIndex(
                            (s) =>
                              (s.name || `系列 ${series.indexOf(s) + 1}`) ===
                              selectedName
                          );

                          if (foundIndex !== -1) {
                            setSeriesIndex(foundIndex);
                          } else {
                            // 如果没找到，创建新系列
                            const newIndex = series.length;
                            setChartOption((draft) => {
                              if (!draft) return;
                              if (!draft.series) draft.series = [] as any;
                              if (Array.isArray(draft.series)) {
                                (draft.series as any).push({
                                  type: "bar",
                                  name: selectedName,
                                });
                              }
                            });
                            setSeriesIndex(newIndex);
                          }
                        }
                      }}
                    >
                      {Array.isArray(chartOption?.series) ? (
                        chartOption.series.map((s, idx) => {
                          const seriesName = s.name || `系列 ${idx + 1}`;
                          return (
                            <MenuItem key={idx} value={seriesName}>
                              {seriesName}
                            </MenuItem>
                          );
                        })
                      ) : (
                        <MenuItem value="系列 1">系列 1</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  {/* 基本设置 */}
                  <TextField
                    fullWidth
                    size="small"
                    label="系列名称"
                    value={currentSeries.name || ""}
                    onChange={(e) => updateSeries("name", e.target.value)}
                  />
                </Grid>
              </Grid>

              {/* 点 */}
              <Stack direction="row" spacing={2} sx={{ p: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="点大小"
                  type="number"
                  value={currentSeries.pointSize || 20}
                  onChange={(e) =>
                    updateSeries("pointSize", Number(e.target.value))
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  label="模糊大小"
                  type="number"
                  value={currentSeries.blurSize || 20}
                  onChange={(e) =>
                    updateSeries("blurSize", Number(e.target.value))
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  label="最小透明度"
                  type="number"
                  inputProps={{ min: 0, max: 1, step: 0.01 }}
                  value={currentSeries.minOpacity || 0}
                  onChange={(e) =>
                    updateSeries("minOpacity", Number(e.target.value))
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  label="最大透明度"
                  type="number"
                  inputProps={{ min: 0, max: 1, step: 0.01 }}
                  value={currentSeries.maxOpacity || 1}
                  onChange={(e) =>
                    updateSeries("maxOpacity", Number(e.target.value))
                  }
                />
              </Stack>
            </Paper>
          </Box>

          <Divider />

          {/* 点样式 */}
          <Box sx={{ p: 1 }}>
            <ItemStyle
              value={currentSeries.itemStyle as any}
              onChange={(itemStyle) => updateSeries("itemStyle", itemStyle)}
              label="样式设置"
              isRadius={true}
            />
          </Box>

          <Divider />

          {/* 标签显示控制 */}
          <Typography variant="subtitle2">标签配置</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={currentSeries.label?.show === true}
                onChange={(e) =>
                  updateSeries(
                    "label",
                    e.target.checked
                      ? {
                          ...(currentSeries.label || {}),
                          show: true,
                          position:
                            (currentSeries.label as any)?.position !== undefined
                              ? (currentSeries.label as any).position
                              : "top",
                        }
                      : { ...currentSeries.label, show: false }
                  )
                }
              />
            }
            label="显示标签"
          />
          {currentSeries.label?.show === true && (
            <>
              <Box sx={{ p: 1 }}>
                <TextStyle
                  value={currentSeries.label as any}
                  onChange={(label) => {
                    // 更新标签的各个属性
                    Object.keys(label as any).forEach((key) => {
                      updateNestedSeries(["label", key], (label as any)[key]);
                    });
                  }}
                  label=""
                  isLabel={true}
                />
              </Box>

              {/* 标签布局配置 */}
              <Box sx={{ p: 1 }}>
                <LabelLayout
                  value={currentSeries.labelLayout as any}
                  onChange={(next) => updateSeries("labelLayout", next)}
                  label="标签布局"
                />
              </Box>
            </>
          )}
        </Stack>
        <Divider />

        <Box sx={{ p: 1, mt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
            自定义标记
          </Typography>
          <MarkOptionComponent
            markPoint={currentSeries.markPoint || {}}
            markLine={currentSeries.markLine || {}}
            markArea={currentSeries.markArea || {}}
            onChangePoint={(value) => updateSeries("markPoint", value)}
            onChangeLine={(value) => updateSeries("markLine", value)}
            onChangeArea={(value) => updateSeries("markArea", value)}
          />
        </Box>
      </Paper>
    ),
    [currentSeries, updateSeries, updateNestedSeries, currentSeriesName]
  );

  return <>{barSeriesContent}</>;
};

export default HeatmapSeries;
export type { HeatmapSeriesProps };
