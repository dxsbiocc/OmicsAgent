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
import { ColorPicker, TextStyle, LabelLayout } from "../common";
import { BarSeriesOption } from "echarts";
import { useChartStore } from "@/stores/chartStore";
import MarkOptionComponent from "../common/MarkDataComponent";
import ItemStyle from "../common/ItemStyle";

// 柱状图系列配置
interface BarSeriesProps {
  seriesIndex?: number; // 系列索引，默认为0
}

const BarSeries: React.FC<BarSeriesProps> = ({
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
    const seriesOption = getSeriesOption() as BarSeriesOption;
    return {
      name: seriesOption?.name || "",
      stack: seriesOption?.stack || "",
      colorBy: seriesOption?.colorBy || "series",
      coordinateSystem: seriesOption?.coordinateSystem || "cartesian2d",
      stackStrategy: (seriesOption as any)?.stackStrategy || "samesign",
      stackOrder: (seriesOption as any)?.stackOrder || "seriesAsc",
      barWidth: seriesOption?.barWidth || "60%",
      barMaxWidth: seriesOption?.barMaxWidth || "",
      barMinWidth: seriesOption?.barMinWidth || "",
      barGap: seriesOption?.barGap || "20%",
      barCategoryGap: seriesOption?.barCategoryGap || "20%",
      showBackground: seriesOption?.showBackground || false,
      backgroundStyle: seriesOption?.backgroundStyle || {},
      itemStyle: seriesOption?.itemStyle || {},
      label: seriesOption?.label || {},
      labelLine: seriesOption?.labelLine || {},
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
          柱状图
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

              {/* 堆积设置 */}
              <Stack direction="row" spacing={2} sx={{ p: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="堆积标签"
                  value={currentSeries.stack || ""}
                  onChange={(e) =>
                    updateSeries("stack", e.target.value || undefined)
                  }
                  placeholder="相同标签将堆积"
                />
                <FormControl fullWidth size="small">
                  <InputLabel>堆积策略</InputLabel>
                  <Select
                    value={(currentSeries as any).stackStrategy || "samesign"}
                    onChange={(e) =>
                      updateSeries("stackStrategy", e.target.value as any)
                    }
                    label="堆积策略"
                  >
                    <MenuItem value="samesign">同符号</MenuItem>
                    <MenuItem value="all">全部</MenuItem>
                    <MenuItem value="positive">正值</MenuItem>
                    <MenuItem value="negative">负值</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>堆积顺序</InputLabel>
                  <Select
                    value={(currentSeries as any).stackOrder || "seriesAsc"}
                    onChange={(e) =>
                      updateSeries("stackOrder", e.target.value as any)
                    }
                    label="堆积顺序"
                  >
                    <MenuItem value="seriesAsc">序号升序</MenuItem>
                    <MenuItem value="seriesDesc">序号降序</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              {/* 柱子尺寸设置 */}
              <Stack direction="row" spacing={2} sx={{ p: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="柱子宽度"
                  value={currentSeries.barWidth || "60%"}
                  onChange={(e) => updateSeries("barWidth", e.target.value)}
                  placeholder="60%"
                />
                <TextField
                  fullWidth
                  size="small"
                  label="最大宽度"
                  value={currentSeries.barMaxWidth || ""}
                  onChange={(e) => updateSeries("barMaxWidth", e.target.value)}
                  placeholder="100px"
                />
                <TextField
                  fullWidth
                  size="small"
                  label="最小宽度"
                  value={currentSeries.barMinWidth || ""}
                  onChange={(e) => updateSeries("barMinWidth", e.target.value)}
                  placeholder="10px"
                />
              </Stack>

              {/* 间距设置 */}
              <Stack direction="row" spacing={2} sx={{ p: 1 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>颜色分类</InputLabel>
                  <Select
                    value={currentSeries.colorBy || "series"}
                    onChange={(e) => updateSeries("colorBy", e.target.value)}
                    label="颜色分类"
                  >
                    <MenuItem value="series">系列</MenuItem>
                    <MenuItem value="data">数据</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  size="small"
                  label="柱子间距"
                  value={currentSeries.barGap || "20%"}
                  onChange={(e) => updateSeries("barGap", e.target.value)}
                  placeholder="20%"
                />
                <TextField
                  fullWidth
                  size="small"
                  label="类目间距"
                  value={currentSeries.barCategoryGap || "20%"}
                  onChange={(e) =>
                    updateSeries("barCategoryGap", e.target.value)
                  }
                  placeholder="20%"
                />
              </Stack>
            </Paper>
          </Box>

          <Divider />

          {/* 柱子样式 */}
          <Box sx={{ p: 1 }}>
            <ItemStyle
              value={currentSeries.itemStyle as any}
              onChange={(itemStyle) => updateSeries("itemStyle", itemStyle)}
              label="柱子样式"
              isRadius={true}
            />
          </Box>

          <Divider />

          {/* 背景设置 */}
          <Typography variant="subtitle2">背景设置</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={currentSeries.showBackground === true}
                onChange={(e) =>
                  updateSeries("showBackground", e.target.checked)
                }
              />
            }
            label="显示背景"
          />
          {currentSeries.showBackground && (
            <Paper sx={{ p: 3 }}>
              <Stack direction="column" spacing={2}>
                <ColorPicker
                  value={
                    typeof currentSeries.backgroundStyle?.color === "string"
                      ? currentSeries.backgroundStyle.color
                      : "#f0f0f0"
                  }
                  onChange={(color) =>
                    updateNestedSeries(["backgroundStyle", "color"], color)
                  }
                  label="背景颜色"
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2">背景透明度</Typography>
                  <Slider
                    sx={{ flex: 1, minWidth: 0 }}
                    value={
                      (currentSeries.backgroundStyle?.opacity || 0.3) * 100
                    }
                    onChange={(_, newValue) =>
                      updateNestedSeries(
                        ["backgroundStyle", "opacity"],
                        (newValue as number) / 100
                      )
                    }
                    min={0}
                    max={100}
                    step={1}
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Stack>
            </Paper>
          )}

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
                  isPolar={currentSeries.coordinateSystem === "polar"}
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

              {/* 标签线配置 */}
              <FormControlLabel
                control={
                  <Switch
                    checked={currentSeries.labelLine?.show === true}
                    onChange={(e) =>
                      updateSeries("labelLine", {
                        ...currentSeries.labelLine,
                        show: e.target.checked,
                      })
                    }
                  />
                }
                label="显示标签线"
              />
              {currentSeries.labelLine?.show === true && (
                <Grid container spacing={2}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="标签线长度"
                        value={(currentSeries.labelLine as any)?.length2 || 0}
                        onChange={(e) =>
                          updateNestedSeries(
                            ["labelLine", "length2"],
                            parseInt(e.target.value) || 0
                          )
                        }
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">px</InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Grid>
                    <Grid
                      size={{ xs: 4 }}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={currentSeries.labelLine?.smooth === true}
                            onChange={(e) =>
                              updateNestedSeries(
                                ["labelLine", "smooth"],
                                e.target.checked
                              )
                            }
                            sx={{ ml: 5 }}
                          />
                        }
                        label="是否平滑"
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        type="number"
                        size="small"
                        label="最小转角"
                        value={
                          (currentSeries.labelLine as any)?.minTurnAngle || 0
                        }
                        onChange={(e) =>
                          updateNestedSeries(
                            ["labelLine", "minTurnAngle"],
                            parseInt(e.target.value) || 0
                          )
                        }
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">°</InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              )}
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

export default BarSeries;
export type { BarSeriesProps };
