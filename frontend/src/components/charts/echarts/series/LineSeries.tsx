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
import { ColorPicker, LineStyle, TextStyle } from "../common";
import { LineSeriesOption } from "echarts";
import { useChartStore } from "@/stores/chartStore";
import MarkOptionComponent from "../common/MarkDataComponent";
import ItemStyle from "../common/ItemStyle";

// 折线图系列配置
interface LineSeriesProps {
  seriesIndex?: number; // 系列索引，默认为 0
}

const LineSeries: React.FC<LineSeriesProps> = ({
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
    const seriesOption = getSeriesOption() as LineSeriesOption;
    return {
      name: seriesOption?.name || "",
      colorBy: seriesOption?.colorBy || "series",
      stack: seriesOption?.stack || "",
      stackStrategy: (seriesOption as any)?.stackStrategy || "samesign",
      stackOrder: (seriesOption as any)?.stackOrder || "seriesAsc",
      step: seriesOption?.step || false,
      sampling: seriesOption?.sampling || "none",
      showSymbol: seriesOption?.showSymbol !== false,
      symbol: seriesOption?.symbol || "circle",
      symbolSize: seriesOption?.symbolSize || 8,
      symbolRotate: seriesOption?.symbolRotate || 0,
      symbolOffset: seriesOption?.symbolOffset || [0, 0],
      itemStyle: seriesOption?.itemStyle || {},
      label: seriesOption?.label || {},
      labelLine: seriesOption?.labelLine || {},
      endLabel: seriesOption?.endLabel || {},
      smooth: seriesOption?.smooth,
      clip: seriesOption?.clip || false,
      lineStyle: seriesOption?.lineStyle || undefined,
      areaStyle: seriesOption?.areaStyle || undefined,
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

  const lineSeriesContent = useMemo(
    () => (
      <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
        <Typography variant="h6" gutterBottom>
          折线图
        </Typography>
        <Divider />
        <Stack spacing={1} sx={{ mt: 2 }}>
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
                              type: "line",
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
          {/* 是否阶梯线图 */}
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
            <FormControl fullWidth size="small">
              <InputLabel>阶梯线</InputLabel>
              <Select
                value={(currentSeries.step as any) || "false"}
                onChange={(e) =>
                  updateSeries(
                    "step",
                    e.target.value === "false" ? false : (e.target.value as any)
                  )
                }
                label="阶梯线"
              >
                <MenuItem value="false">否</MenuItem>
                <MenuItem value="start">起点</MenuItem>
                <MenuItem value="middle">中点</MenuItem>
                <MenuItem value="end">终点</MenuItem>
              </Select>
            </FormControl>

            {/* 降采样 */}
            {/* <FormControl fullWidth size="small">
              <InputLabel>降采样</InputLabel>
              <Select
                value={(currentSeries.sampling as any) || "none"}
                onChange={(e) =>
                  updateSeries(
                    "sampling",
                    e.target.value === "none"
                      ? undefined
                      : (e.target.value as any)
                  )
                }
                label="降采样"
              >
                <MenuItem value="none">无</MenuItem>
                <MenuItem value="lttb">LTTB</MenuItem>
                <MenuItem value="average">平均</MenuItem>
                <MenuItem value="max">最大</MenuItem>
                <MenuItem value="min">最小</MenuItem>
                <MenuItem value="sum">求和</MenuItem>
              </Select>
            </FormControl> */}

            {/* 平滑曲线 */}
            <TextField
              fullWidth
              size="small"
              type="number"
              label="平滑度"
              value={
                currentSeries.smooth === false
                  ? 0
                  : currentSeries.smooth === true
                  ? 0.5
                  : typeof currentSeries.smooth === "number"
                  ? currentSeries.smooth
                  : 0
              }
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                updateSeries("smooth", val);
              }}
              inputProps={{
                min: 0,
                max: 1,
                step: 0.1,
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">0-1</InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
          {/* 标记点配置 */}
          <FormControlLabel
            control={
              <Switch
                checked={currentSeries.showSymbol !== false}
                onChange={(e) => updateSeries("showSymbol", e.target.checked)}
              />
            }
            label="显示标记点"
          />
          {currentSeries.showSymbol !== false && (
            <Stack spacing={2} sx={{ p: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>形状</InputLabel>
                    <Select
                      value={currentSeries.symbol || "circle"}
                      onChange={(e) => updateSeries("symbol", e.target.value)}
                      label="形状"
                      sx={{
                        "& .MuiSelect-select": {
                          fontSize: "0.875rem",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.875rem",
                        },
                      }}
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
                <Grid size={{ xs: 8 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="body2">标记点大小</Typography>
                    <Slider
                      sx={{ flex: 1, minWidth: 0 }}
                      value={
                        typeof currentSeries.symbolSize === "number"
                          ? currentSeries.symbolSize
                          : 8
                      }
                      onChange={(_, newValue) =>
                        updateSeries("symbolSize", newValue as number)
                      }
                      min={0}
                      max={50}
                      step={1}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
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
                {/* symbolOffset 标记的偏移量 */}
                <Grid size={{ xs: 4 }}>
                  <TextField
                    size="small"
                    type="number"
                    label="偏移 X"
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
                <Grid size={{ xs: 4 }}>
                  <TextField
                    size="small"
                    type="number"
                    label="偏移 Y"
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
              {/* 标记点样式 */}
              <ItemStyle
                value={currentSeries.itemStyle as any}
                onChange={(itemStyle) => updateSeries("itemStyle", itemStyle)}
                label="标记点样式"
              />
            </Stack>
          )}
          <Divider />

          {/* 标签显示控制 */}
          <FormControlLabel
            control={
              <Tooltip title="显示标记点才可以设置">
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
                              (currentSeries.label as any)?.position !==
                              undefined
                                ? (currentSeries.label as any).position
                                : "top",
                          }
                        : { ...currentSeries.label, show: false }
                    )
                  }
                />
              </Tooltip>
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
                      {/* length2 */}
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
                      {/* smooth */}
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
                      {/* minTurnAngle */}
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
                  <Grid size={{ xs: 12 }} sx={{ p: 1 }}>
                    <LineStyle
                      value={currentSeries.labelLine?.lineStyle as any}
                      onChange={(lineStyle) => {
                        // 更新标签线的各个样式属性
                        Object.keys(lineStyle as any).forEach((key) => {
                          updateNestedSeries(
                            ["labelLine", "lineStyle", key],
                            (lineStyle as any)[key]
                          );
                        });
                      }}
                      label=""
                    />
                  </Grid>
                </Grid>
              )}
            </>
          )}
          <Divider />

          {/* 末端标签 */}
          <FormControlLabel
            control={
              <Switch
                checked={currentSeries.endLabel?.show === true}
                onChange={(e) =>
                  updateSeries("endLabel", {
                    ...currentSeries.endLabel,
                    show: e.target.checked,
                  })
                }
              />
            }
            label="显示末端标签"
          />
          {currentSeries.endLabel?.show && (
            <Stack spacing={1} sx={{ p: 1 }}>
              <ColorPicker
                value={(currentSeries.endLabel as any)?.color || "#333"}
                onChange={(color) =>
                  updateNestedSeries(["endLabel", "color"], color as any)
                }
                label="末端标签颜色"
              />
              <TextField
                size="small"
                label="文本"
                value={(currentSeries.endLabel as any)?.formatter || ""}
                onChange={(e) =>
                  updateNestedSeries(["endLabel", "formatter"], e.target.value)
                }
              />
            </Stack>
          )}
          <Divider />

          {/* 是否裁剪超出坐标系部分 */}
          <FormControlLabel
            control={
              <Switch
                checked={!!currentSeries.clip}
                onChange={(e) => updateSeries("clip", e.target.checked)}
              />
            }
            label="裁剪超出坐标系"
          />

          <Divider />

          {/* lineStyle 线条样式 */}
          <FormControlLabel
            control={
              <Switch
                checked={
                  currentSeries.lineStyle !== undefined &&
                  currentSeries.lineStyle !== null
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    // 如果开启，设置默认的线条样式
                    updateSeries("lineStyle", {
                      color: "#1976d2",
                      width: 2,
                      type: "solid",
                      opacity: 1,
                    });
                  } else {
                    // 如果关闭，清空线条样式
                    updateSeries("lineStyle", undefined);
                  }
                }}
              />
            }
            label="设置线条样式"
          />
          {currentSeries.lineStyle && (
            <Box sx={{ p: 1 }}>
              <LineStyle
                value={currentSeries.lineStyle as any}
                onChange={(lineStyle) => {
                  // 更新线条样式的各个属性
                  Object.keys(lineStyle as any).forEach((key) => {
                    updateNestedSeries(
                      ["lineStyle", key],
                      (lineStyle as any)[key]
                    );
                  });
                }}
                label=""
              />
            </Box>
          )}

          <Divider />

          {/* 面积样式 */}
          <Typography variant="subtitle2">面积样式</Typography>

          <FormControlLabel
            control={
              <Switch
                checked={!!currentSeries.areaStyle}
                onChange={(e) =>
                  updateSeries(
                    "areaStyle",
                    e.target.checked
                      ? { opacity: 0.3, color: "#1976d2" }
                      : undefined
                  )
                }
              />
            }
            label="显示面积"
          />

          {currentSeries.areaStyle && (
            <Box sx={{ p: 1 }}>
              <ColorPicker
                value={
                  typeof currentSeries.areaStyle.color === "string"
                    ? currentSeries.areaStyle.color
                    : "#1976d2"
                }
                onChange={(color) =>
                  updateNestedSeries(["areaStyle", "color"], color)
                }
                label="面积颜色"
              />
              <Typography variant="body1" sx={{ mt: 2 }}>
                透明度
              </Typography>
              <Slider
                value={(currentSeries.areaStyle.opacity || 0.3) * 100}
                onChange={(_, newValue) =>
                  updateNestedSeries(
                    ["areaStyle", "opacity"],
                    (newValue as number) / 100
                  )
                }
                min={0}
                max={100}
                step={1}
                valueLabelDisplay="auto"
              />
            </Box>
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
    [currentSeries, updateSeries]
  );

  return <>{lineSeriesContent}</>;
};

export default LineSeries;
export type { LineSeriesProps };
