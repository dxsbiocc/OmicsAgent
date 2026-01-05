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
import {
  ColorPicker,
  LabelLayout,
  LineStyle,
  TextStyle,
  MarkOptionComponent,
  SymbolSizeComponent,
} from "../common";
import { GraphSeriesOption } from "echarts";
import { useChartStore } from "@/stores/chartStore";
import ItemStyle from "../common/ItemStyle";

// 桑基图系列配置
interface GraphSeriesProps {
  seriesIndex?: number; // 系列索引，默认为0
}

const GraphSeries: React.FC<GraphSeriesProps> = ({
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
    const seriesOption = getSeriesOption() as GraphSeriesOption;
    return {
      name: seriesOption?.name || "",

      left: seriesOption?.left ?? "left",
      top: seriesOption?.top ?? "top",
      bottom: seriesOption?.bottom ?? "bottom",
      right: seriesOption?.right ?? "right",
      width: seriesOption?.width ?? "auto",
      height: seriesOption?.height ?? "auto",
      center: seriesOption?.center ?? ["50%", "50%"],

      coordinateSystem: seriesOption?.coordinateSystem ?? "cartesian2d",
      layout: seriesOption?.layout ?? "none",
      circular: seriesOption?.circular ?? {},
      force: seriesOption?.force ?? {},

      draggable: seriesOption?.draggable ?? true,

      symbol: seriesOption?.symbol ?? "circle",
      symbolSize: seriesOption?.symbolSize ?? 8,
      symbolRotate: seriesOption?.symbolRotate ?? 0,
      symbolOffset: seriesOption?.symbolOffset ?? [0, 0],
      symbolKeepAspect: seriesOption?.symbolKeepAspect ?? true,

      edgeSymbol: seriesOption?.edgeSymbol ?? ["none", "none"],
      edgeSymbolSize: seriesOption?.edgeSymbolSize ?? 10,
      autoCurveness: seriesOption?.autoCurveness ?? 0.3,

      zoom: seriesOption?.zoom ?? 1,
      scaleLimit: seriesOption?.scaleLimit ?? { min: 0.5, max: 2 },
      roam: seriesOption?.roam ?? true,
      roamTrigger: seriesOption?.roamTrigger ?? "global",
      nodeScaleRatio: seriesOption?.nodeScaleRatio ?? 0.6,

      itemStyle: seriesOption?.itemStyle ?? {},
      edgeLabel: seriesOption?.edgeLabel ?? {},
      label: seriesOption?.label ?? {},
      labelLayout: seriesOption?.labelLayout ?? {},
      lineStyle: seriesOption?.lineStyle ?? undefined,
      categories: seriesOption?.categories ?? [],

      markPoint: seriesOption?.markPoint ?? {},
      markLine: seriesOption?.markLine ?? {},
      markArea: seriesOption?.markArea ?? {},
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

  // 是否显示节点样式配置
  const [showItemStyleConfig, setShowItemStyleConfig] = useState(false);

  // 是否显示标签样式配置
  const [showLabelStyleConfig, setShowLabelStyleConfig] = useState(false);
  // 是否显示关系边样式配置
  const [showEdgeStyleConfig, setShowEdgeStyleConfig] = useState(false);

  // 是否显示分类配置
  const [showCategoriesConfig, setShowCategoriesConfig] = useState(false);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

  // 获取 categories 数据
  const categoriesData = useMemo(() => {
    return currentSeries.categories || [];
  }, [currentSeries.categories]);

  return (
    <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
      <Typography variant="h6" gutterBottom>
        关系图
      </Typography>
      <Divider />
      <Stack spacing={2} sx={{ my: 2 }}>
        <Box sx={{ p: 1 }}>
          {/* 选择当前要配置的系列 */}
          <Paper sx={{ p: 1 }}>
            <Box sx={{ p: 1 }}>
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
            </Box>
          </Paper>
          {/* 关系图位置和尺寸配置 */}
          <Paper sx={{ p: 1, mt: 2 }} elevation={2}>
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2">位置和尺寸</Typography>
              <Grid container spacing={2} sx={{ p: 1 }}>
                {/* 位置配置 - 上左下右 */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                    位置
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="左 (left)"
                        value={String(currentSeries.left || "left")}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateSeries("left", value);
                        }}
                        placeholder="left, 20%, 20"
                        helperText="left/center/right/数值/百分比"
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="右 (right)"
                        value={String(currentSeries.right || "right")}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateSeries("right", value);
                        }}
                        placeholder="right, 20%, 20"
                        helperText="right/center/left/数值/百分比"
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="上 (top)"
                        value={String(currentSeries.top || "top")}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateSeries("top", value);
                        }}
                        placeholder="top, 20%, 20"
                        helperText="top/center/bottom/数值/百分比"
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="下 (bottom)"
                        value={String(currentSeries.bottom || "bottom")}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateSeries("bottom", value);
                        }}
                        placeholder="bottom, 20%, 20"
                        helperText="bottom/center/top/数值/百分比"
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* 宽高配置 */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                    尺寸
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="宽度 (width)"
                        value={String(currentSeries.width || "auto")}
                        onChange={(e) => updateSeries("width", e.target.value)}
                        placeholder="auto, 500, 80%"
                        helperText="auto 或 数值/百分比"
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="高度 (height)"
                        value={String(currentSeries.height || "auto")}
                        onChange={(e) => updateSeries("height", e.target.value)}
                        placeholder="auto, 400, 80%"
                        helperText="auto 或 数值/百分比"
                      />
                    </Grid>
                  </Grid>
                </Grid>
                {/* 中心点配置 */}
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="缩放中心 X"
                    placeholder="如: 115, '50%', '0%'"
                    value={
                      Array.isArray(currentSeries.center)
                        ? String(currentSeries.center[0] || "")
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value || undefined;
                      const currentCenter = Array.isArray(currentSeries.center)
                        ? currentSeries.center
                        : ["50%", "50%"];
                      updateSeries("center", [value, currentCenter[1]]);
                    }}
                    helperText="X 坐标：数值或百分比"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="缩放中心 Y"
                    placeholder="如: 13, '30%', '100%'"
                    value={
                      Array.isArray(currentSeries.center)
                        ? String(currentSeries.center[1] || "")
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value || undefined;
                      const currentCenter = Array.isArray(currentSeries.center)
                        ? currentSeries.center
                        : ["50%", "50%"];
                      updateSeries("center", [currentCenter[0], value]);
                    }}
                    helperText="Y 坐标：数值或百分比"
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="缩放比例"
                    value={currentSeries.zoom || ""}
                    onChange={(e) =>
                      updateSeries("zoom", e.target.value || undefined)
                    }
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="最小缩放"
                    value={currentSeries.scaleLimit?.min || ""}
                    onChange={(e) =>
                      updateNestedSeries(
                        ["scaleLimit", "min"],
                        e.target.value || undefined
                      )
                    }
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="最大缩放"
                    value={currentSeries.scaleLimit?.max || ""}
                    onChange={(e) =>
                      updateNestedSeries(
                        ["scaleLimit", "max"],
                        e.target.value || undefined
                      )
                    }
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>漫游模式</InputLabel>
                    <Select
                      value={
                        (currentSeries.roam as any) === false
                          ? "false"
                          : currentSeries.roam === "scale" ||
                            currentSeries.roam === "zoom"
                          ? "scale"
                          : currentSeries.roam === "move" ||
                            currentSeries.roam === "pan"
                          ? "move"
                          : currentSeries.roam === true
                          ? "true"
                          : "true"
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "false") {
                          updateSeries("roam", false);
                        } else if (value === "scale") {
                          updateSeries("roam", "scale");
                        } else if (value === "move") {
                          updateSeries("roam", "move");
                        } else {
                          updateSeries("roam", true);
                        }
                      }}
                      label="漫游模式"
                    >
                      <MenuItem value="false">关闭</MenuItem>
                      <MenuItem value="scale">仅缩放</MenuItem>
                      <MenuItem value="move">仅平移</MenuItem>
                      <MenuItem value="true">缩放和平移</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>漫游触发方式</InputLabel>
                    <Select
                      value={currentSeries.roamTrigger || "global"}
                      onChange={(e) =>
                        updateSeries("roamTrigger", e.target.value)
                      }
                      label="漫游触发方式"
                    >
                      <MenuItem value="global">全局</MenuItem>
                      <MenuItem value="selfRect">图形元素</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* 布局配置 */}
          <Paper sx={{ p: 1, mt: 2 }} elevation={2}>
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2">布局配置</Typography>
              <Grid container spacing={2} sx={{ p: 1, mt: 2 }}>
                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>坐标系</InputLabel>
                    <Select
                      value={currentSeries.coordinateSystem ?? "cartesian2d"}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateSeries("coordinateSystem", value);
                      }}
                      label="坐标系"
                    >
                      <MenuItem value="none">独立布局</MenuItem>
                      <MenuItem value="cartesian2d">直角坐标系</MenuItem>
                      <MenuItem value="polar">极坐标系</MenuItem>
                      <MenuItem value="singleAxis">单轴坐标系</MenuItem>
                      <MenuItem value="matrix">矩阵坐标系</MenuItem>
                      <MenuItem value="geo">地理坐标系</MenuItem>
                      <MenuItem value="calendar">日历坐标系</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>布局</InputLabel>
                    <Select
                      value={currentSeries.layout || "none"}
                      onChange={(e) => updateSeries("layout", e.target.value)}
                      label="布局"
                    >
                      <MenuItem value="none">无</MenuItem>
                      <MenuItem value="circular">圆形布局</MenuItem>
                      <MenuItem value="force">力导向布局</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {currentSeries.layout === "circular" && (
                  <Grid size={{ xs: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={currentSeries.circular.rotateLabel as any}
                          onChange={(e) =>
                            updateNestedSeries(
                              ["circular", "rotateLabel"],
                              e.target.checked
                            )
                          }
                        />
                      }
                      label="旋转标签"
                    />
                  </Grid>
                )}
                {currentSeries.layout === "force" && (
                  <>
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="斥力因子"
                        type="number"
                        value={currentSeries.force.repulsion || 50}
                        onChange={(e) =>
                          updateNestedSeries(
                            ["force", "repulsion"],
                            Number(e.target.value)
                          )
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="引力因子"
                        type="number"
                        value={currentSeries.force.gravity || 0.1}
                        onChange={(e) =>
                          updateNestedSeries(
                            ["force", "gravity"],
                            Number(e.target.value)
                          )
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="摩擦力"
                        type="number"
                        value={currentSeries.force.friction || 0.6}
                        onChange={(e) =>
                          updateNestedSeries(
                            ["force", "friction"],
                            Number(e.target.value)
                          )
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="边长度"
                        type="number"
                        value={currentSeries.force.edgeLength || 30}
                        onChange={(e) =>
                          updateNestedSeries(
                            ["force", "edgeLength"],
                            Number(e.target.value)
                          )
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={
                              currentSeries.force.layoutAnimation || true
                            }
                            onChange={(e) =>
                              updateNestedSeries(
                                ["force", "layoutAnimation"],
                                e.target.checked
                              )
                            }
                          />
                        }
                        label="布局动画"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </Paper>
          {/* 节点配置 */}
          <Paper sx={{ p: 1, mt: 2 }} elevation={2}>
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2">节点配置</Typography>
              <Grid container spacing={2} sx={{ p: 1, mt: 2 }}>
                <Grid size={{ xs: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>图形类型</InputLabel>
                    <Select
                      value={currentSeries.symbol || "circle"}
                      onChange={(e) => updateSeries("symbol", e.target.value)}
                      label="图形类型"
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
                    label="旋转角度"
                    value={currentSeries.symbolRotate || ""}
                    onChange={(e) =>
                      updateSeries("symbolRotate", e.target.value || undefined)
                    }
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentSeries.symbolKeepAspect === true}
                        onChange={(e) =>
                          updateSeries("symbolKeepAspect", e.target.checked)
                        }
                      />
                    }
                    label="保持宽高比"
                    sx={{
                      width: "100%",
                      "& .MuiFormControlLabel-label": {
                        fontSize: "0.85rem",
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <SymbolSizeComponent
                    value={currentSeries.symbolSize as any}
                    onChange={(value) =>
                      updateSeries("symbolSize", value as any)
                    }
                  />
                </Grid>
                {/* 边两端节点 */}
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="边两端节点"
                    value={
                      Array.isArray(currentSeries.edgeSymbol)
                        ? (currentSeries.edgeSymbol as any[]).join(",")
                        : (currentSeries.edgeSymbol as any) ?? "none,arrow"
                    }
                    onChange={(e) => {
                      const raw = (e.target.value || "").toString().trim();
                      if (!raw) {
                        updateSeries("edgeSymbol", undefined);
                        return;
                      }
                      const parts = raw
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const arr =
                        parts.length === 1
                          ? [parts[0], parts[0]]
                          : [parts[0], parts[1]];
                      updateSeries("edgeSymbol", arr as any);
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="边两端节点大小"
                    value={
                      Array.isArray(currentSeries.edgeSymbolSize)
                        ? (currentSeries.edgeSymbolSize as any[]).join(",")
                        : (currentSeries.edgeSymbolSize as any) ?? "10,10"
                    }
                    onChange={(e) => {
                      const raw = (e.target.value || "").toString().trim();
                      if (!raw) {
                        updateSeries("edgeSymbolSize", undefined);
                        return;
                      }
                      const parts = raw
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0)
                        .map((s) => Number(s))
                        .map((n) => (Number.isFinite(n) ? n : 10));
                      const arr =
                        parts.length === 1
                          ? [parts[0], parts[0]]
                          : [parts[0], parts[1]];
                      updateSeries("edgeSymbolSize", arr as any);
                    }}
                  />
                </Grid>
                {/* 交互配置 */}
                <Grid size={{ xs: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentSeries.draggable === true}
                        onChange={(e) =>
                          updateSeries("draggable", e.target.checked)
                        }
                      />
                    }
                    label="允许拖拽节点"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentSeries.autoCurveness === true}
                        onChange={(e) =>
                          updateSeries("autoCurveness", e.target.checked)
                        }
                      />
                    }
                    label="自动曲率"
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* 缩放配置 */}
          <Paper sx={{ p: 1, mt: 2 }} elevation={2}>
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2">缩放配置</Typography>
              <Grid container spacing={2} sx={{ p: 1, mt: 2 }}>
                <Grid size={{ xs: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>漫游模式</InputLabel>
                    <Select
                      value={
                        (currentSeries.roam as any) === false
                          ? "false"
                          : currentSeries.roam === "scale" ||
                            currentSeries.roam === "zoom"
                          ? "scale"
                          : currentSeries.roam === "move" ||
                            currentSeries.roam === "pan"
                          ? "move"
                          : currentSeries.roam === true
                          ? "true"
                          : "true"
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "false") {
                          updateSeries("roam", false);
                        } else if (value === "scale") {
                          updateSeries("roam", "scale");
                        } else if (value === "move") {
                          updateSeries("roam", "move");
                        } else {
                          updateSeries("roam", true);
                        }
                      }}
                      label="漫游模式"
                    >
                      <MenuItem value="false">关闭</MenuItem>
                      <MenuItem value="scale">仅缩放</MenuItem>
                      <MenuItem value="move">仅平移</MenuItem>
                      <MenuItem value="true">缩放和平移</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="缩放比例"
                    value={currentSeries.zoom || ""}
                    onChange={(e) =>
                      updateSeries("zoom", e.target.value || undefined)
                    }
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="最小缩放"
                    value={currentSeries.scaleLimit?.min || ""}
                    onChange={(e) =>
                      updateNestedSeries(
                        ["scaleLimit", "min"],
                        e.target.value || undefined
                      )
                    }
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="最大缩放"
                    value={currentSeries.scaleLimit?.max || ""}
                    onChange={(e) =>
                      updateNestedSeries(
                        ["scaleLimit", "max"],
                        e.target.value || undefined
                      )
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>

        <Divider />

        {/* 图形样式 */}
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
                图形样式
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
              />
            </Box>
          )}
        </Box>

        <Divider />

        {/* 分类配置 */}
        {categoriesData.length > 0 && (
          <Box sx={{ p: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showCategoriesConfig}
                  onChange={(e) => setShowCategoriesConfig(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    分类样式配置
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    检测到 {categoriesData.length}{" "}
                    个分类，可分别为每个分类设置样式
                  </Typography>
                </Box>
              }
            />

            {showCategoriesConfig && (
              <Paper sx={{ mt: 2, p: 2 }} elevation={2}>
                <Box sx={{ mb: 2, p: 1 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>选择要配置的分类</InputLabel>
                    <Select
                      label="选择要配置的分类"
                      value={selectedCategoryIndex}
                      onChange={(e) => {
                        setSelectedCategoryIndex(e.target.value as number);
                      }}
                    >
                      {categoriesData.map((cat: any, idx: number) => (
                        <MenuItem key={idx} value={idx}>
                          categories[{idx}] - {cat.name || `分类 ${idx}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* 当前选分类的配置 */}
                {(() => {
                  const currentCategory =
                    categoriesData[selectedCategoryIndex] || {};
                  return (
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        配置分类 {selectedCategoryIndex}
                      </Typography>

                      {/* 分类基本信息 */}
                      <TextField
                        fullWidth
                        size="small"
                        label="分类名称"
                        value={currentCategory.name || ""}
                        onChange={(e) => {
                          const newCategories = [...categoriesData];
                          newCategories[selectedCategoryIndex] = {
                            ...newCategories[selectedCategoryIndex],
                            name: e.target.value,
                          };
                          updateSeries("categories", newCategories);
                        }}
                      />

                      {/* 分类节点图形配置 */}
                      <Typography variant="subtitle2" sx={{ mb: 2, mt: 2 }}>
                        分类节点图形
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 4 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>图形类型</InputLabel>
                            <Select
                              value={currentCategory.symbol || "circle"}
                              onChange={(e) => {
                                const newCategories = [...categoriesData];
                                const current =
                                  newCategories[selectedCategoryIndex] || {};
                                newCategories[selectedCategoryIndex] = {
                                  ...current,
                                  symbol: e.target.value,
                                };
                                updateSeries("categories", newCategories);
                              }}
                              label="图形类型"
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
                            label="旋转角度"
                            type="number"
                            value={currentCategory.symbolRotate || ""}
                            onChange={(e) => {
                              const newCategories = [...categoriesData];
                              const current =
                                newCategories[selectedCategoryIndex] || {};
                              const rotateValue = e.target.value
                                ? Number(e.target.value)
                                : undefined;
                              newCategories[selectedCategoryIndex] = {
                                ...current,
                                symbolRotate: rotateValue,
                              };
                              updateSeries("categories", newCategories);
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={
                                  currentCategory.symbolKeepAspect === true
                                }
                                onChange={(e) => {
                                  const newCategories = [...categoriesData];
                                  const current =
                                    newCategories[selectedCategoryIndex] || {};
                                  newCategories[selectedCategoryIndex] = {
                                    ...current,
                                    symbolKeepAspect: e.target.checked,
                                  };
                                  updateSeries("categories", newCategories);
                                }}
                              />
                            }
                            label="保持宽高比"
                            sx={{
                              width: "100%",
                              "& .MuiFormControlLabel-label": {
                                fontSize: "0.85rem",
                              },
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <SymbolSizeComponent
                            value={currentCategory.symbolSize as any}
                            onChange={(value) => {
                              const newCategories = [...categoriesData];
                              const current =
                                newCategories[selectedCategoryIndex] || {};
                              newCategories[selectedCategoryIndex] = {
                                ...current,
                                symbolSize: value as any,
                              };
                              updateSeries("categories", newCategories);
                            }}
                          />
                        </Grid>
                      </Grid>

                      {/* 分类样式配置 */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2 }}>
                          分类节点样式
                        </Typography>
                        <ItemStyle
                          value={currentCategory.itemStyle as any}
                          onChange={(itemStyle) => {
                            const newCategories = [...categoriesData];
                            const current =
                              newCategories[selectedCategoryIndex] || {};
                            newCategories[selectedCategoryIndex] = {
                              ...current,
                              itemStyle,
                            };
                            updateSeries("categories", newCategories);
                          }}
                          label=""
                        />
                      </Box>

                      {/* 分类标签配置 */}
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2 }}>
                          分类标签样式
                        </Typography>
                        <TextStyle
                          value={currentCategory.label as any}
                          onChange={(label) => {
                            const newCategories = [...categoriesData];
                            const current =
                              newCategories[selectedCategoryIndex] || {};
                            newCategories[selectedCategoryIndex] = {
                              ...current,
                              label,
                            };
                            updateSeries("categories", newCategories);
                          }}
                          label=""
                          isLabel={true}
                        />
                      </Box>
                    </Box>
                  );
                })()}
              </Paper>
            )}
          </Box>
        )}

        <Divider />

        {/* 文本标签 */}
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
                文本标签
              </Typography>
            }
          />

          {showLabelStyleConfig && (
            <Box sx={{ mt: 2 }}>
              <TextStyle
                value={currentSeries.label as any}
                onChange={(label) => {
                  Object.keys(label as any).forEach((key) => {
                    updateNestedSeries(["label", key], (label as any)[key]);
                  });
                }}
                label=""
                isLabel={true}
              />
            </Box>
          )}
        </Box>

        <Divider />
        {showLabelStyleConfig && (
          <Box sx={{ p: 1 }}>
            <LabelLayout
              value={currentSeries.labelLayout as any}
              onChange={(next) => {
                Object.keys(next as any).forEach((key) => {
                  updateNestedSeries(["labelLayout", key], (next as any)[key]);
                });
              }}
              label="标签布局"
            />
            <Divider sx={{ mt: 3 }} />
          </Box>
        )}

        {/* 连线样式 */}
        <Box sx={{ p: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showEdgeStyleConfig}
                onChange={(e) => setShowEdgeStyleConfig(e.target.checked)}
              />
            }
            label={
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                关系边样式
              </Typography>
            }
          />
          {showEdgeStyleConfig && (
            <Box sx={{ p: 1 }}>
              <LineStyle
                value={currentSeries.lineStyle as any}
                onChange={(lineStyle) => {
                  updateSeries("lineStyle", lineStyle as any);
                }}
                label=""
                isCurve={true}
              />
            </Box>
          )}
        </Box>

        {/* 边文本标签 */}
        {showEdgeStyleConfig && (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              边文本样式
            </Typography>
            <TextStyle
              value={currentSeries.edgeLabel as any}
              onChange={(edgeLabel) => {
                Object.keys(edgeLabel as any).forEach((key) => {
                  updateNestedSeries(
                    ["edgeLabel", key],
                    (edgeLabel as any)[key]
                  );
                });
              }}
              label=""
              isLabel={true}
            />
          </Box>
        )}

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
      </Stack>
    </Paper>
  );
};

export default GraphSeries;
export type { GraphSeriesProps };
