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
import {
  ColorPicker,
  TextStyle,
  LabelLayout,
  SymbolSizeComponent,
  ItemStyle,
} from "../common";
import { ScatterSeriesOption } from "echarts";
import { useChartStore } from "@/stores/chartStore";
import MarkOptionComponent from "../common/MarkDataComponent";

// 散点图系列配置
interface ScatterSeriesProps {
  seriesIndex?: number; // 系列索引，默认为0
}

const ScatterSeries: React.FC<ScatterSeriesProps> = ({
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
    const seriesOption = getSeriesOption() as ScatterSeriesOption;
    return {
      name: seriesOption?.name || "",
      colorBy: seriesOption?.colorBy || "series",
      symbol: seriesOption?.symbol || "circle",
      symbolSize: seriesOption?.symbolSize || 8,
      symbolRotate: seriesOption?.symbolRotate || 0,
      symbolOffset: seriesOption?.symbolOffset || [0, 0],
      itemStyle: seriesOption?.itemStyle || {},
      label: seriesOption?.label || {},
      labelLine: seriesOption?.labelLine || {},
      labelLayout: (seriesOption as any)?.labelLayout || {},
      markLine: seriesOption?.markLine || undefined,
      markPoint: seriesOption?.markPoint || undefined,
      markArea: seriesOption?.markArea || undefined,
    };
  }, [getSeriesOption]);

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

  const scatterSeriesContent = useMemo(
    () => (
      <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
        <Typography variant="h6" gutterBottom>
          散点图
        </Typography>
        <Divider />
        <Stack spacing={3} sx={{ mt: 2 }}>
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
                              type: "scatter",
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

          {/* 标记点配置 */}
          <Typography variant="subtitle2">标记点配置</Typography>
          <Paper sx={{ p: 2 }} elevation={2}>
            <Box sx={{ p: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>标记点形状</InputLabel>
                    <Select
                      value={currentSeries.symbol || "circle"}
                      onChange={(e) => updateSeries("symbol", e.target.value)}
                      label="标记点形状"
                    >
                      <MenuItem value="circle">圆形</MenuItem>
                      <MenuItem value="rect">矩形</MenuItem>
                      <MenuItem value="roundRect">圆角矩形</MenuItem>
                      <MenuItem value="triangle">三角形</MenuItem>
                      <MenuItem value="diamond">菱形</MenuItem>
                      <MenuItem value="pin">大头针</MenuItem>
                      <MenuItem value="arrow">箭头</MenuItem>
                      <MenuItem value="none">无</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="标记旋转角度"
                    value={
                      typeof currentSeries.symbolRotate === "number"
                        ? currentSeries.symbolRotate
                        : 0
                    }
                    onChange={(e) =>
                      updateSeries(
                        "symbolRotate",
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
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
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    size="small"
                    type="number"
                    label="偏移 X"
                    fullWidth
                    value={
                      Array.isArray(currentSeries.symbolOffset)
                        ? currentSeries.symbolOffset[0]
                        : 0
                    }
                    onChange={(e) => {
                      const x = parseInt(e.target.value) || 0;
                      const y = Array.isArray(currentSeries.symbolOffset)
                        ? currentSeries.symbolOffset[1]
                        : 0;
                      updateSeries("symbolOffset", [x, y]);
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    size="small"
                    type="number"
                    label="偏移 Y"
                    fullWidth
                    value={
                      Array.isArray(currentSeries.symbolOffset)
                        ? currentSeries.symbolOffset[1]
                        : 0
                    }
                    onChange={(e) => {
                      const y = parseInt(e.target.value) || 0;
                      const x = Array.isArray(currentSeries.symbolOffset)
                        ? currentSeries.symbolOffset[0]
                        : 0;
                      updateSeries("symbolOffset", [x, y]);
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            <SymbolSizeComponent
              value={currentSeries.symbolSize as any}
              onChange={(value) => updateSeries("symbolSize", value as any)}
            />
          </Paper>

          <Divider />

          {/* 数据点样式 */}
          {/* 数据点样式 */}
          <ItemStyle
            value={currentSeries.itemStyle as any}
            onChange={(itemStyle) => updateSeries("itemStyle", itemStyle)}
            label="数据点样式"
          />
          <Divider />
          {/* 标签显示控制 */}
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
          <Divider />
        </Stack>
        <Divider />

        <LabelLayout
          value={currentSeries.labelLayout as any}
          onChange={(next) => updateSeries("labelLayout", next)}
        />

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
    [
      currentSeries,
      updateSeries,
      updateNestedSeries,
      currentSeriesName,
      chartOption,
    ]
  );

  return <>{scatterSeriesContent}</>;
};

export default ScatterSeries;
export type { ScatterSeriesProps };
