import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  MenuItem,
  Select,
  Switch,
  TextField,
  FormControl,
  InputLabel,
  Typography,
  Stack,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
} from "@mui/material";
import { LineStyle, TextStyle, LabelLayout } from "../common";
import { SunburstSeriesOption } from "echarts";
import { useChartStore } from "@/stores/chartStore";
import ItemStyle from "../common/ItemStyle";

// 饼图系列配置
interface SunburstSeriesProps {
  seriesIndex?: number; // 系列索引，默认为0
}

const SunburstSeries: React.FC<SunburstSeriesProps> = ({
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
    const seriesOption = getSeriesOption() as SunburstSeriesOption;
    return {
      name: seriesOption?.name || "",

      center: seriesOption?.center || ["50%", "50%"],
      radius: seriesOption?.radius || [0, "75%"],

      startAngle: seriesOption?.startAngle ?? 90,
      nodeClick: seriesOption?.nodeClick ?? "rootToNode",
      sort: seriesOption?.sort || "desc",

      renderLabelForZeroData: seriesOption?.renderLabelForZeroData || false,
      clockwise: seriesOption?.clockwise ?? true,

      label: seriesOption?.label || {},
      labelLine: seriesOption?.labelLine || {},
      labelLayout: seriesOption?.labelLayout || "radial",

      itemStyle: seriesOption?.itemStyle || {},

      emphasis: seriesOption?.emphasis || {},

      levels: seriesOption?.levels || [],
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

  // 计算数据层级的辅助函数（从 root 层开始，depth=1）
  // 返回值表示有多少层数据（不包括下钻返回层）
  const calculateDataDepth = useCallback((data: any, depth = 1): number => {
    if (!data || !Array.isArray(data)) return depth;

    let maxDepth = depth;
    for (const item of data) {
      if (
        item &&
        item.children &&
        Array.isArray(item.children) &&
        item.children.length > 0
      ) {
        const childDepth = calculateDataDepth(item.children, depth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    }
    return maxDepth;
  }, []);

  // 自动计算层级数
  const dataDepth = useMemo(() => {
    const series = chartOption?.series;
    const currentSeriesData = Array.isArray(series)
      ? series[seriesIndex]?.data
      : series?.data;

    if (currentSeriesData) {
      return calculateDataDepth(currentSeriesData);
    }
    return 0;
  }, [chartOption?.series, seriesIndex, calculateDataDepth]);

  // 当前选中的层级索引
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(0);

  // 是否显示多层配置
  const [showLevelsConfig, setShowLevelsConfig] = useState(false);

  // 是否显示扇形样式配置
  const [showItemStyleConfig, setShowItemStyleConfig] = useState(false);

  // 是否显示标签样式配置
  const [showLabelStyleConfig, setShowLabelStyleConfig] = useState(false);

  // 初始化 levels 数组
  const initializeLevels = useCallback(() => {
    if (!currentSeries.levels || currentSeries.levels.length === 0) {
      // 如果没有 levels，创建一个基础数组
      // 第 0 项用于下钻，从第 1 项开始是数据层
      const newLevels = [
        {},
        ...Array.from({ length: dataDepth }).map(() => ({})),
      ];
      updateSeries("levels", newLevels);
    }
  }, [currentSeries.levels, dataDepth, updateSeries]);

  // 自动初始化 levels
  React.useEffect(() => {
    if (dataDepth > 0) {
      initializeLevels();
    }
  }, [dataDepth, initializeLevels]);

  const sunburstSeriesContent = useMemo(
    () => (
      <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
        <Typography variant="h6" gutterBottom>
          旭日图
        </Typography>
        <Divider />
        <Stack spacing={2} sx={{ my: 2 }}>
          <Box sx={{ p: 1 }}>
            {/* 选择当前要配置的系列 */}
            <Paper sx={{ p: 1 }}>
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
              </Grid>
            </Paper>
            {/* 饼图尺寸配置 */}
            <Paper sx={{ p: 1, mt: 2 }} elevation={2}>
              <Box sx={{ p: 1 }}>
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
                            if (
                              xValue === "" ||
                              /^(\d+(\.\d+)?%?)$/.test(xValue)
                            ) {
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
                            if (
                              yValue === "" ||
                              /^(\d+(\.\d+)?%?)$/.test(yValue)
                            ) {
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
                </Grid>
                {/* 角度配置 */}

                <Typography variant="body2" sx={{ mb: 2 }}>
                  其他配置
                </Typography>
                <Grid container spacing={2} sx={{ p: 1 }}>
                  <Grid size={{ xs: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>节点点击行为</InputLabel>
                      <Select
                        label="节点点击行为"
                        value={
                          currentSeries.nodeClick === false
                            ? "false"
                            : currentSeries.nodeClick || "rootToNode"
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "false") {
                            updateSeries("nodeClick", false);
                          } else {
                            updateSeries("nodeClick", value);
                          }
                        }}
                      >
                        <MenuItem value="rootToNode">根到节点</MenuItem>
                        <MenuItem value="link">跳转到链接</MenuItem>
                        <MenuItem value="false">无反应</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="起始角度"
                      type="number"
                      value={currentSeries.startAngle || 90}
                      onChange={(e) =>
                        updateSeries(
                          "startAngle",
                          parseInt(e.target.value) || 90
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>排序方式</InputLabel>
                      <Select
                        label="排序方式"
                        value={currentSeries.sort || "desc"}
                        onChange={(e) => updateSeries("sort", e.target.value)}
                      >
                        <MenuItem value="desc">降序</MenuItem>
                        <MenuItem value="asc">升序</MenuItem>
                      </Select>
                    </FormControl>
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
                        checked={currentSeries.renderLabelForZeroData === true}
                        onChange={(e) =>
                          updateSeries(
                            "renderLabelForZeroData",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="无数据时是否展示标签"
                  />
                </Stack>
              </Box>
            </Paper>
          </Box>
          <Divider />
          {/* 扇形样式 */}
          <Box sx={{ p: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showItemStyleConfig}
                  onChange={(e) => setShowItemStyleConfig(e.target.checked)}
                />
              }
              label={
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  扇形样式
                </Typography>
              }
            />

            {showItemStyleConfig && (
              <Box sx={{ mt: 2 }}>
                <ItemStyle
                  value={currentSeries.itemStyle as any}
                  onChange={(itemStyle) =>
                    updateSeries("itemStyle", itemStyle as any)
                  }
                  label=""
                  isRadius={true}
                />
              </Box>
            )}
          </Box>

          <Divider />

          {/* 标签样式 */}
          <Box sx={{ p: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showLabelStyleConfig}
                  onChange={(e) => setShowLabelStyleConfig(e.target.checked)}
                />
              }
              label={
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  标签样式
                </Typography>
              }
            />

            {showLabelStyleConfig && (
              <Box sx={{ mt: 2 }}>
                <TextStyle
                  value={currentSeries.label as any}
                  onChange={(label) => {
                    // 使用 updateNestedSeries 来更新 label，避免影响其他属性
                    Object.keys(label as any).forEach((key) => {
                      updateNestedSeries(["label", key], (label as any)[key]);
                    });
                  }}
                  label=""
                  isLabel={true}
                  isSunburst={true}
                />
              </Box>
            )}
          </Box>
          <Divider />

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
              label="标签布局"
            />
          </Box>

          <Divider />

          {/* 多层配置开关 */}
          <Box sx={{ p: 1, mb: 2 }}>
            <Paper sx={{ p: 2 }} elevation={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showLevelsConfig}
                    onChange={(e) => setShowLevelsConfig(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      多层配置
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dataDepth > 0
                        ? `检测到 ${dataDepth} 层数据，可分别为每层设置样式`
                        : "暂无数据"}
                    </Typography>
                  </Box>
                }
                sx={{ mb: 2 }}
              />

              {/* 多层配置内容 */}
              {showLevelsConfig && (
                <Box sx={{ p: 1 }}>
                  {dataDepth > 0 && (
                    <>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 12 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>选择要配置的层级</InputLabel>
                            <Select
                              label="选择要配置的层级"
                              value={selectedLevelIndex}
                              onChange={(e) => {
                                setSelectedLevelIndex(e.target.value as number);
                              }}
                            >
                              <MenuItem value={0}>levels[0] - 下钻层</MenuItem>
                              {Array.from({ length: dataDepth }).map(
                                (_, index) => (
                                  <MenuItem key={index + 1} value={index + 1}>
                                    levels[{index + 1}] - 第 {index + 1} 层 （
                                    {index === 0
                                      ? "最内层"
                                      : index === dataDepth - 1
                                      ? "最外层"
                                      : "中间层"}
                                    ）
                                  </MenuItem>
                                )
                              )}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>

                      {/* 当前选中层级的配置 */}
                      {(() => {
                        const currentLevel =
                          currentSeries.levels?.[selectedLevelIndex] || {};
                        return (
                          <Box>
                            <Typography variant="subtitle2" sx={{ mb: 2 }}>
                              配置第 {selectedLevelIndex} 层
                            </Typography>

                            {/* 当前层的内外半径 */}
                            <Grid container spacing={2} sx={{ p: 1, mb: 2 }}>
                              <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                  当前层半径设置
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ mb: 2, display: "block" }}
                                >
                                  每一层可以独立设置内外半径
                                </Typography>
                                <Grid container spacing={1}>
                                  <Grid size={{ xs: 6 }}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      label="内半径"
                                      value={
                                        Array.isArray(currentLevel.radius)
                                          ? String(
                                              currentLevel.radius[0] || "0"
                                            )
                                          : "0"
                                      }
                                      onChange={(e) => {
                                        const innerValue = e.target.value;
                                        if (
                                          innerValue === "" ||
                                          /^(\d+(\.\d+)?%?)$/.test(innerValue)
                                        ) {
                                          const currentRadius = Array.isArray(
                                            currentLevel.radius
                                          )
                                            ? currentLevel.radius
                                            : ["0", "100%"];
                                          setChartOption((draft) => {
                                            if (!draft?.series) return;
                                            const series = Array.isArray(
                                              draft.series
                                            )
                                              ? draft.series[seriesIndex]
                                              : draft.series;
                                            if (!(series as any).levels) {
                                              (series as any).levels =
                                                Array.from({
                                                  length: dataDepth + 1,
                                                }).map(() => ({}));
                                            }
                                            if (
                                              !(series as any).levels[
                                                selectedLevelIndex
                                              ]
                                            ) {
                                              (series as any).levels[
                                                selectedLevelIndex
                                              ] = {};
                                            }
                                            (series as any).levels[
                                              selectedLevelIndex
                                            ].radius = [
                                              innerValue,
                                              currentRadius[1] || "100%",
                                            ];
                                          });
                                        }
                                      }}
                                      placeholder="例如: 0% 或 20"
                                      helperText="内半径"
                                    />
                                  </Grid>
                                  <Grid size={{ xs: 6 }}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      label="外半径"
                                      value={
                                        Array.isArray(currentLevel.radius)
                                          ? String(
                                              currentLevel.radius[1] || "100%"
                                            )
                                          : "100%"
                                      }
                                      onChange={(e) => {
                                        const outerValue = e.target.value;
                                        if (
                                          outerValue === "" ||
                                          /^(\d+(\.\d+)?%?)$/.test(outerValue)
                                        ) {
                                          const currentRadius = Array.isArray(
                                            currentLevel.radius
                                          )
                                            ? currentLevel.radius
                                            : ["0", "100%"];
                                          setChartOption((draft) => {
                                            if (!draft?.series) return;
                                            const series = Array.isArray(
                                              draft.series
                                            )
                                              ? draft.series[seriesIndex]
                                              : draft.series;
                                            if (!(series as any).levels) {
                                              (series as any).levels =
                                                Array.from({
                                                  length: dataDepth + 1,
                                                }).map(() => ({}));
                                            }
                                            if (
                                              !(series as any).levels[
                                                selectedLevelIndex
                                              ]
                                            ) {
                                              (series as any).levels[
                                                selectedLevelIndex
                                              ] = {};
                                            }
                                            (series as any).levels[
                                              selectedLevelIndex
                                            ].radius = [
                                              currentRadius[0] || "0",
                                              outerValue,
                                            ];
                                          });
                                        }
                                      }}
                                      placeholder="例如: 100% 或 200"
                                      helperText="外半径"
                                    />
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>

                            {/* 当前层的 itemStyle */}
                            <Box sx={{ mb: 2 }}>
                              <ItemStyle
                                value={currentLevel.itemStyle as any}
                                onChange={(itemStyle) => {
                                  setChartOption((draft) => {
                                    if (!draft?.series) return;
                                    const series = Array.isArray(draft.series)
                                      ? draft.series[seriesIndex]
                                      : draft.series;
                                    if (!(series as any).levels) {
                                      (series as any).levels = Array.from({
                                        length: dataDepth + 1,
                                      }).map(() => ({}));
                                    }
                                    if (
                                      !(series as any).levels[
                                        selectedLevelIndex
                                      ]
                                    ) {
                                      (series as any).levels[
                                        selectedLevelIndex
                                      ] = {};
                                    }
                                    (series as any).levels[
                                      selectedLevelIndex
                                    ].itemStyle = itemStyle;
                                  });
                                }}
                                label="当前层扇形样式"
                                isRadius={true}
                              />
                            </Box>

                            {/* 当前层的 label */}
                            <Box>
                              <TextStyle
                                value={currentLevel.label as any}
                                onChange={(label) => {
                                  setChartOption((draft) => {
                                    if (!draft?.series) return;
                                    const series = Array.isArray(draft.series)
                                      ? draft.series[seriesIndex]
                                      : draft.series;
                                    if (!(series as any).levels) {
                                      (series as any).levels = Array.from({
                                        length: dataDepth + 1,
                                      }).map(() => ({}));
                                    }
                                    if (
                                      !(series as any).levels[
                                        selectedLevelIndex
                                      ]
                                    ) {
                                      (series as any).levels[
                                        selectedLevelIndex
                                      ] = {};
                                    }
                                    (series as any).levels[
                                      selectedLevelIndex
                                    ].label = label;
                                  });
                                }}
                                label="当前层标签样式"
                                isLabel={true}
                                isSunburst={true}
                              />
                            </Box>
                          </Box>
                        );
                      })()}
                    </>
                  )}

                  {dataDepth === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      暂无数据或数据为空
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Box>
        </Stack>
      </Paper>
    ),
    [
      currentSeries,
      updateSeries,
      updateNestedSeries,
      currentSeriesName,
      chartOption,
      dataDepth,
      selectedLevelIndex,
      setChartOption,
      seriesIndex,
      showLevelsConfig,
      showItemStyleConfig,
      showLabelStyleConfig,
    ]
  );

  return <>{sunburstSeriesContent}</>;
};

export default SunburstSeries;
export type { SunburstSeriesProps };
