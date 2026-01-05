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
  Tooltip,
  Paper,
} from "@mui/material";
import { ColorPicker, LineStyle, TextStyle, LabelLayout } from "../common";
import { PieSeriesOption } from "echarts";
import { useChartStore } from "@/stores/chartStore";
import MarkOptionComponent from "../common/MarkDataComponent";
import ItemStyle from "../common/ItemStyle";

// 饼图系列配置
interface PieSeriesProps {
  seriesIndex?: number; // 系列索引，默认为0
}

const PieSeries: React.FC<PieSeriesProps> = ({
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
    const seriesOption = getSeriesOption() as PieSeriesOption;
    return {
      name: seriesOption?.name || "",
      selectedMode: seriesOption?.selectedMode || false,
      selectedOffset: seriesOption?.selectedOffset || 10,
      colorBy: seriesOption?.colorBy || "data",

      center: seriesOption?.center || ["50%", "50%"],
      radius: seriesOption?.radius || [0, "75%"],

      clockwise: seriesOption?.clockwise ?? true,
      startAngle: seriesOption?.startAngle ?? 90,
      endAngle: seriesOption?.endAngle ?? "auto",
      minAngle: seriesOption?.minAngle ?? 0,
      padAngle: seriesOption?.padAngle ?? 0,
      minShowLabelAngle: seriesOption?.minShowLabelAngle ?? 0,
      roseType: seriesOption?.roseType ?? false,
      avoidLabelOverlap: seriesOption?.avoidLabelOverlap ?? false,
      stillShowZeroSum: seriesOption?.stillShowZeroSum ?? false,
      percentPrecision: seriesOption?.percentPrecision ?? 2,
      left: seriesOption?.left ?? "center",
      top: seriesOption?.top ?? "center",
      width: seriesOption?.width ?? "auto",
      height: seriesOption?.height ?? "auto",
      showEmptyCircle: seriesOption?.showEmptyCircle ?? false,
      emptyCircleStyle: seriesOption?.emptyCircleStyle || {},

      label: seriesOption?.label || {},
      labelLine: seriesOption?.labelLine || {},
      labelLayout: seriesOption?.labelLayout || "radial",

      itemStyle: seriesOption?.itemStyle || {},

      emphasis: seriesOption?.emphasis || {},
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

  const pieSeriesContent = useMemo(
    () => (
      <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
        <Typography variant="h6" gutterBottom>
          饼图
        </Typography>
        <Divider />
        <Stack spacing={2} sx={{ my: 2 }}>
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
                              type: "pie",
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

            <Grid size={{ xs: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>选择模式</InputLabel>
                <Select
                  label="选择模式"
                  value={currentSeries.selectedMode || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "true") {
                      updateSeries("selectedMode", true);
                    } else if (value === "false") {
                      updateSeries("selectedMode", false);
                    } else {
                      updateSeries("selectedMode", value);
                    }
                  }}
                >
                  <MenuItem value="single">单选</MenuItem>
                  <MenuItem value="multiple">多选</MenuItem>
                  <MenuItem value="series">整个系列</MenuItem>
                  <MenuItem value="false">禁用</MenuItem>
                  <MenuItem value="true">启用 (单选)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="选择偏移"
                value={currentSeries.selectedOffset || 10}
                onChange={(e) =>
                  updateSeries(
                    "selectedOffset",
                    parseFloat(e.target.value) || 10
                  )
                }
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>颜色分类</InputLabel>
                <Select
                  value={currentSeries.colorBy || "data"}
                  onChange={(e) => updateSeries("colorBy", e.target.value)}
                  label="颜色分类"
                >
                  <MenuItem value="series">系列</MenuItem>
                  <MenuItem value="data">数据</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* 饼图尺寸配置 */}
          <Typography variant="subtitle2">位置和尺寸</Typography>
          <Grid container spacing={2} sx={{ p: 1 }}>
            {/* 中心位置配置 */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                中心位置
              </Typography>
              <Grid container spacing={1}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="X坐标"
                    value={
                      Array.isArray(currentSeries.center)
                        ? currentSeries.center[0] || "50%"
                        : "50%"
                    }
                    onChange={(e) => {
                      const xValue = e.target.value;
                      // 验证输入：只允许数值或百分比
                      if (xValue === "" || /^(\d+(\.\d+)?%?)$/.test(xValue)) {
                        const currentCenter = Array.isArray(
                          currentSeries.center
                        )
                          ? currentSeries.center
                          : ["50%", "50%"];
                        updateSeries("center", [
                          xValue,
                          currentCenter[1] || "50%",
                        ]);
                      }
                    }}
                    placeholder="50% 或 100"
                    error={
                      !!(
                        currentSeries.center &&
                        Array.isArray(currentSeries.center) &&
                        currentSeries.center[0] &&
                        !/^(\d+(\.\d+)?%?)$/.test(
                          String(currentSeries.center[0])
                        )
                      )
                    }
                    helperText="请输入数值或百分比"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Y坐标"
                    value={
                      Array.isArray(currentSeries.center)
                        ? currentSeries.center[1] || "50%"
                        : "50%"
                    }
                    onChange={(e) => {
                      const yValue = e.target.value;
                      // 验证输入：只允许数值或百分比
                      if (yValue === "" || /^(\d+(\.\d+)?%?)$/.test(yValue)) {
                        const currentCenter = Array.isArray(
                          currentSeries.center
                        )
                          ? currentSeries.center
                          : ["50%", "50%"];
                        updateSeries("center", [
                          currentCenter[0] || "50%",
                          yValue,
                        ]);
                      }
                    }}
                    placeholder="50% 或 100"
                    error={
                      !!(
                        currentSeries.center &&
                        Array.isArray(currentSeries.center) &&
                        currentSeries.center[1] &&
                        !/^(\d+(\.\d+)?%?)$/.test(
                          String(currentSeries.center[1])
                        )
                      )
                    }
                    helperText="请输入数值或百分比"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* 半径配置 */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                半径
              </Typography>
              <Grid container spacing={1}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="内半径"
                    value={
                      Array.isArray(currentSeries.radius)
                        ? currentSeries.radius[0] || 0
                        : 0
                    }
                    onChange={(e) => {
                      const innerValue = e.target.value;
                      // 验证输入：只允许数值或百分比
                      if (
                        innerValue === "" ||
                        /^(\d+(\.\d+)?%?)$/.test(innerValue)
                      ) {
                        if (Array.isArray(currentSeries.radius)) {
                          updateSeries("radius", [
                            innerValue,
                            currentSeries.radius[1] || "75%",
                          ]);
                        } else {
                          // 当radius为单个值时，将其作为外半径，内半径设为0
                          updateSeries("radius", [
                            innerValue,
                            currentSeries.radius || "75%",
                          ]);
                        }
                      }
                    }}
                    placeholder="0% 或 20"
                    error={
                      !!(
                        currentSeries.radius &&
                        Array.isArray(currentSeries.radius) &&
                        currentSeries.radius[0] &&
                        !/^(\d+(\.\d+)?%?)$/.test(
                          String(currentSeries.radius[0])
                        )
                      )
                    }
                    helperText="请输入数值或百分比"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="外半径"
                    value={
                      Array.isArray(currentSeries.radius)
                        ? currentSeries.radius[1] || "75%"
                        : typeof currentSeries.radius === "string"
                        ? currentSeries.radius
                        : "75%"
                    }
                    onChange={(e) => {
                      const outerValue = e.target.value;
                      // 验证输入：只允许数值或百分比
                      if (
                        outerValue === "" ||
                        /^(\d+(\.\d+)?%?)$/.test(outerValue)
                      ) {
                        if (Array.isArray(currentSeries.radius)) {
                          updateSeries("radius", [
                            currentSeries.radius[0] || 0,
                            outerValue,
                          ]);
                        } else {
                          // 当radius为单个值时，将其作为外半径，内半径设为0
                          updateSeries("radius", [0, outerValue]);
                        }
                      }
                    }}
                    placeholder="50% 或 100"
                    error={
                      !!(
                        currentSeries.radius &&
                        Array.isArray(currentSeries.radius) &&
                        currentSeries.radius[1] &&
                        !/^(\d+(\.\d+)?%?)$/.test(
                          String(currentSeries.radius[1])
                        )
                      )
                    }
                    helperText="请输入数值或百分比"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* 角度配置 */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                角度配置
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="起始角度"
                    type="number"
                    value={currentSeries.startAngle || 90}
                    onChange={(e) =>
                      updateSeries("startAngle", parseInt(e.target.value) || 90)
                    }
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="结束角度"
                    type="number"
                    value={
                      currentSeries.endAngle === "auto"
                        ? ""
                        : currentSeries.endAngle
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^(\d+(\.\d+)?%?)$/.test(value)) {
                        updateSeries("endAngle", value === "" ? "auto" : value);
                      }
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="扇区间距"
                    type="number"
                    value={currentSeries.padAngle || 0}
                    onChange={(e) =>
                      updateSeries("padAngle", parseInt(e.target.value) || 0)
                    }
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="最小显示角度"
                    type="number"
                    value={currentSeries.minAngle || 0}
                    onChange={(e) =>
                      updateSeries("minAngle", parseInt(e.target.value) || 0)
                    }
                    helperText="小于该值不显示"
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="最小显示标签角度"
                    type="number"
                    value={currentSeries.minShowLabelAngle || 0}
                    onChange={(e) =>
                      updateSeries(
                        "minShowLabelAngle",
                        parseInt(e.target.value) || 0
                      )
                    }
                    helperText="小于该值不显示标签"
                  />
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="百分比精度"
                    type="number"
                    value={currentSeries.percentPrecision || 2}
                    onChange={(e) =>
                      updateSeries(
                        "percentPrecision",
                        parseInt(e.target.value) || 2
                      )
                    }
                    helperText="百分比精度"
                  />
                </Grid>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentSeries.clockwise === true}
                    onChange={(e) =>
                      updateSeries("clockwise", e.target.checked)
                    }
                  />
                }
                label="是否顺时排列"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={currentSeries.avoidLabelOverlap === true}
                    onChange={(e) =>
                      updateSeries("avoidLabelOverlap", e.target.checked)
                    }
                  />
                }
                label="防止标签重叠"
              />
            </Stack>
          </Grid>

          {/* 扇形样式 */}
          <Box sx={{ p: 1 }}>
            <ItemStyle
              value={currentSeries.itemStyle as any}
              onChange={(itemStyle) =>
                updateSeries("itemStyle", itemStyle as any)
              }
              label="扇形样式"
            />
          </Box>

          <Divider />

          <FormControlLabel
            control={
              <Switch
                checked={currentSeries.showEmptyCircle === true}
                onChange={(e) =>
                  updateSeries("showEmptyCircle", e.target.checked)
                }
              />
            }
            label="显示占位圆"
          />
          {currentSeries.showEmptyCircle === true && (
            <Box sx={{ p: 1 }}>
              <ItemStyle
                value={currentSeries.emptyCircleStyle as any}
                onChange={(value) =>
                  updateNestedSeries(["emptyCircleStyle"], value as any)
                }
                label="占位圆样式"
              />
            </Box>
          )}

          <Divider />
          <Box sx={{ p: 1 }}>
            <TextStyle
              value={currentSeries.label as any}
              onChange={(label) => {
                // 使用 updateNestedSeries 来更新 label，避免影响其他属性
                Object.keys(label as any).forEach((key) => {
                  updateNestedSeries(["label", key], (label as any)[key]);
                });
              }}
              label="标签样式"
              isLabel={true}
            />
          </Box>
          <Divider />

          <Divider />

          {/* 标签线配置 */}
          <Typography variant="subtitle2">标签线配置</Typography>
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
            <Box sx={{ p: 1 }}>
              <Stack direction="column" spacing={2}>
                <Stack direction="row" spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentSeries.labelLine?.showAbove === true}
                        onChange={(e) =>
                          updateNestedSeries(
                            ["labelLine", "showAbove"],
                            e.target.checked as boolean
                          )
                        }
                      />
                    }
                    label="标签线在扇形上方"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentSeries.labelLine?.smooth === true}
                        onChange={(e) =>
                          updateNestedSeries(
                            ["labelLine", "smooth"],
                            e.target.checked as boolean
                          )
                        }
                      />
                    }
                    label="标签线是否平滑"
                  />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="第一段引导线长度"
                    value={currentSeries.labelLine?.length || 0}
                    onChange={(e) =>
                      updateNestedSeries(
                        ["labelLine", "length"],
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="第二段引导线长度"
                    value={currentSeries.labelLine?.length2 || 0}
                    onChange={(e) =>
                      updateNestedSeries(
                        ["labelLine", "length2"],
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="引导线间的最小夹角"
                    value={currentSeries.labelLine?.minTurnAngle || 90}
                    onChange={(e) =>
                      updateNestedSeries(
                        ["labelLine", "minTurnAngle"],
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="引导线与扇形的最大夹角"
                    value={currentSeries.labelLine?.maxSurfaceAngle || 80}
                    onChange={(e) =>
                      updateNestedSeries(
                        ["labelLine", "maxSurfaceAngle"],
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </Stack>

                <LineStyle
                  value={currentSeries.labelLine?.lineStyle as any}
                  onChange={(lineStyle: any) =>
                    updateNestedSeries(
                      ["labelLine", "lineStyle"],
                      lineStyle as any
                    )
                  }
                  label="标签线样式"
                />
              </Stack>
            </Box>
          )}

          <Divider />
          <Box sx={{ p: 1 }}>
            <LabelLayout
              value={currentSeries.labelLayout as any}
              onChange={(next) => updateSeries("labelLayout", next)}
            />
          </Box>
        </Stack>
        <Divider />

        {/* 自定义标记 */}
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

  return <>{pieSeriesContent}</>;
};

export default PieSeries;
export type { PieSeriesProps };
