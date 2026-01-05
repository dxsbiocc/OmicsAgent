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
  TextStyle,
  LabelLayout,
  SymbolSizeComponent,
  ItemStyle,
} from "../common";
import { TreeSeriesOption } from "echarts";
import { useChartStore } from "@/stores/chartStore";

// 散点图系列配置
interface TreeSeriesProps {
  seriesIndex?: number; // 系列索引，默认为0
}

const TreeSeries: React.FC<TreeSeriesProps> = ({
  seriesIndex: initialSeriesIndex = 0,
}) => {
  const { chartOption, setChartOption } = useChartStore();

  // 使用内部状态管理系列索引
  const [seriesIndex, setSeriesIndex] = useState(initialSeriesIndex);

  // 控制叶子节点配置的展开/折叠状态
  const [leavesExpanded, setLeavesExpanded] = useState(false);

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
    const seriesOption = getSeriesOption() as TreeSeriesOption;
    return {
      name: seriesOption?.name || "",

      left: seriesOption?.left || "",
      top: seriesOption?.top || "",
      bottom: seriesOption?.bottom || "",
      right: seriesOption?.right || "",

      width: seriesOption?.width || "",
      height: seriesOption?.height || "",
      center: seriesOption?.center || ["50%", "50%"],

      zoom: seriesOption?.zoom ?? 1,
      scaleLimit: seriesOption?.scaleLimit ?? { min: 0.5, max: 2 },
      roam: seriesOption?.roam ?? true,
      roamTrigger: seriesOption?.roamTrigger ?? "global",

      expandAndCollapse: seriesOption?.expandAndCollapse ?? true,
      initialTreeDepth: seriesOption?.initialTreeDepth ?? 0,

      symbol: seriesOption?.symbol ?? "circle",
      symbolSize: seriesOption?.symbolSize ?? 8,
      symbolKeepAspect: seriesOption?.symbolKeepAspect ?? true,
      symbolRotate: seriesOption?.symbolRotate || 0,
      symbolOffset: seriesOption?.symbolOffset || [0, 0],

      layout: seriesOption?.layout || "orthogonal",
      orient: seriesOption?.orient || "LR",
      edgeShape: seriesOption?.edgeShape || "curve",
      edgeForkPosition: seriesOption?.edgeForkPosition || "50%",

      itemStyle: seriesOption?.itemStyle || {},
      label: seriesOption?.label || {},
      labelLayout: seriesOption?.labelLayout || {},
      lineStyle: seriesOption?.lineStyle || undefined,

      leaves: seriesOption?.leaves || {},
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

  const treeSeriesContent = useMemo(
    () => (
      <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
        <Typography variant="h6" gutterBottom>
          树状图
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

          {/* 基本配置 */}
          <Paper sx={{ p: 2 }} elevation={2}>
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                基本配置
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentSeries.expandAndCollapse === true}
                        onChange={(e) =>
                          updateSeries("expandAndCollapse", e.target.checked)
                        }
                      />
                    }
                    label="展开与折叠"
                    sx={{
                      width: "100%",
                      "& .MuiFormControlLabel-label": {
                        fontSize: "0.92rem",
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="初始树深度"
                    value={currentSeries.initialTreeDepth || 0}
                    onChange={(e) =>
                      updateSeries(
                        "initialTreeDepth",
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>布局</InputLabel>
                    <Select
                      value={currentSeries.layout || "orthogonal"}
                      onChange={(e) => {
                        const newLayout = e.target.value;
                        updateSeries("layout", newLayout);
                        // 如果是径向布局，清除正交布局特有的属性
                        if (newLayout === "radial") {
                          updateSeries("orient", "");
                          updateSeries("edgeShape", "");
                          updateSeries("edgeForkPosition", "50%");
                        }
                      }}
                      label="布局"
                    >
                      <MenuItem value="orthogonal">正交布局</MenuItem>
                      <MenuItem value="radial">径向布局</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {currentSeries.layout === "orthogonal" && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>布局方向</InputLabel>
                      <Select
                        value={currentSeries.orient || "LR"}
                        onChange={(e) => updateSeries("orient", e.target.value)}
                        label="布局方向"
                      >
                        <MenuItem value="LR">从左到右</MenuItem>
                        <MenuItem value="RL">从右到左</MenuItem>
                        <MenuItem value="TB">从上到下</MenuItem>
                        <MenuItem value="BT">从下到上</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>分支形状</InputLabel>
                      <Select
                        value={currentSeries.edgeShape || "curve"}
                        onChange={(e) =>
                          updateSeries("edgeShape", e.target.value)
                        }
                        label="分支形状"
                      >
                        <MenuItem value="curve">曲线</MenuItem>
                        <MenuItem value="polyline">折线</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {currentSeries.edgeShape === "polyline" && (
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="折线段分叉位置"
                        value={currentSeries.edgeForkPosition || "50%"}
                        onChange={(e) =>
                          updateSeries("edgeForkPosition", e.target.value)
                        }
                        helperText="支持百分比、像素值"
                      />
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>
          </Paper>

          {/* 容器位置 */}
          <Paper sx={{ p: 3 }} elevation={2}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              容器位置
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="宽度"
                  placeholder="如: 10%, 20, '50px'"
                  value={currentSeries.width || ""}
                  onChange={(e) =>
                    updateSeries("width", e.target.value || undefined)
                  }
                  helperText="支持百分比、像素值"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="高度"
                  placeholder="如: 10%, 20, '50px'"
                  value={currentSeries.height || ""}
                  onChange={(e) =>
                    updateSeries("height", e.target.value || undefined)
                  }
                  helperText="支持百分比、像素值"
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="左"
                  placeholder="如: 10%, 20, '50px'"
                  value={currentSeries.left || ""}
                  onChange={(e) =>
                    updateSeries("left", e.target.value || undefined)
                  }
                  helperText="支持百分比、像素值"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="上"
                  placeholder="如: 10%, 20, '50px'"
                  value={currentSeries.top || ""}
                  onChange={(e) =>
                    updateSeries("top", e.target.value || undefined)
                  }
                  helperText="支持百分比、像素值"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="右"
                  placeholder="如: 10%, 20, '50px'"
                  value={currentSeries.right || ""}
                  onChange={(e) =>
                    updateSeries("right", e.target.value || undefined)
                  }
                  helperText="支持百分比、像素值"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="下"
                  placeholder="如: 10%, 20, '50px'"
                  value={currentSeries.bottom || ""}
                  onChange={(e) =>
                    updateSeries("bottom", e.target.value || undefined)
                  }
                  helperText="支持百分比、像素值"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* 标记点配置 */}
          <Paper sx={{ p: 2 }} elevation={2}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              标记点
            </Typography>
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
                      <MenuItem value="emptyCircle">空心圆形</MenuItem>
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
                  <FormControlLabel
                    control={
                      <Switch
                        checked={currentSeries.symbolKeepAspect}
                        onChange={(e) =>
                          updateSeries("symbolKeepAspect", e.target.checked)
                        }
                      />
                    }
                    label="固定宽高比"
                    sx={{
                      width: "100%",
                      "& .MuiFormControlLabel-label": {
                        fontSize: "0.92rem",
                      },
                    }}
                  />
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

          {/* 缩放控制 */}
          <Paper sx={{ p: 2 }} elevation={2}>
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                缩放控制
              </Typography>
              <Grid container spacing={2}>
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

          {/* 节点样式 */}
          <ItemStyle
            value={currentSeries.itemStyle as any}
            onChange={(itemStyle) => updateSeries("itemStyle", itemStyle)}
            label="节点样式"
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
              <Box sx={{ mt: 2 }}>
                <LabelLayout
                  value={currentSeries.labelLayout as any}
                  onChange={(next) => updateSeries("labelLayout", next)}
                />
              </Box>
            </Box>
          )}
          <Divider />

          <Divider />
          {/* 树状图线条样式 */}
          <Paper sx={{ p: 2 }} elevation={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              线条样式
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }} sx={{ p: 1 }}>
                <ColorPicker
                  value={
                    (currentSeries.lineStyle?.color as string) || "#808080"
                  }
                  onChange={(color) =>
                    updateNestedSeries(["lineStyle", "color"], color)
                  }
                  label="边的颜色"
                />
              </Grid>
              <Grid size={{ xs: 6 }} sx={{ p: 1 }}>
                <FormControl fullWidth size="small" variant="outlined">
                  <TextField
                    value={currentSeries.lineStyle?.width}
                    onChange={(e) =>
                      updateNestedSeries(
                        ["lineStyle", "width"],
                        Number(e.target.value) || 1.5
                      )
                    }
                    label="边的宽度"
                    type="number"
                    size="small"
                  />
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }} sx={{ p: 1 }}>
                <FormControl fullWidth size="small" variant="outlined">
                  <TextField
                    type="number"
                    inputProps={{ step: 0.1 }}
                    value={currentSeries.lineStyle?.curveness ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        updateNestedSeries(
                          ["lineStyle", "curveness"],
                          undefined
                        );
                      } else {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                          updateNestedSeries(
                            ["lineStyle", "curveness"],
                            numValue
                          );
                        }
                      }
                    }}
                    label="边的曲度"
                    size="small"
                    helperText="支持小数，如：0.1, 0.5, 1.2"
                  />
                </FormControl>
              </Grid>

              {/* 阴影配置 */}
              <Grid size={{ xs: 12 }} sx={{ p: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!currentSeries.lineStyle?.shadowColor}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // 开启阴影时设置默认阴影颜色和参数
                          updateNestedSeries(
                            ["lineStyle", "shadowColor"],
                            "rgba(0,0,0,0.2)"
                          );
                        } else {
                          // 关闭阴影时清空所有阴影相关属性
                          (currentSeries.lineStyle as any).shadowColor =
                            undefined;
                          updateNestedSeries(
                            ["lineStyle", "shadowColor"],
                            undefined
                          );
                          updateNestedSeries(["lineStyle", "shadowBlur"], 0);
                          updateNestedSeries(["lineStyle", "shadowOffsetX"], 0);
                          updateNestedSeries(["lineStyle", "shadowOffsetY"], 0);
                        }
                      }}
                    />
                  }
                  label="阴影效果"
                />
              </Grid>
            </Grid>
            {currentSeries.lineStyle?.shadowColor !== undefined && (
              <>
                <Grid size={{ xs: 12 }} sx={{ p: 1 }}>
                  <ColorPicker
                    value={currentSeries.lineStyle?.shadowColor}
                    onChange={(color) =>
                      updateNestedSeries(["lineStyle", "shadowColor"], color)
                    }
                    label="阴影颜色"
                    maxColors={1}
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <TextField
                      value={currentSeries.lineStyle?.shadowBlur}
                      onChange={(e) =>
                        updateNestedSeries(
                          ["lineStyle", "shadowBlur"],
                          Number(e.target.value) || 0
                        )
                      }
                      label="阴影模糊"
                      type="number"
                      size="small"
                      sx={{
                        "& .MuiInputBase-input": {
                          fontSize: "0.875rem",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: "text.secondary",
                        },
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <TextField
                      value={currentSeries.lineStyle?.shadowOffsetX}
                      onChange={(e) =>
                        updateNestedSeries(
                          ["lineStyle", "shadowOffsetX"],
                          Number(e.target.value) || 0
                        )
                      }
                      label="阴影 X 偏移"
                      type="number"
                      size="small"
                      sx={{
                        "& .MuiInputBase-input": {
                          fontSize: "0.875rem",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: "text.secondary",
                        },
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <TextField
                      value={currentSeries.lineStyle?.shadowOffsetY}
                      onChange={(e) =>
                        updateNestedSeries(
                          ["lineStyle", "shadowOffsetY"],
                          Number(e.target.value) || 0
                        )
                      }
                      label="阴影 Y 偏移"
                      type="number"
                      size="small"
                      sx={{
                        "& .MuiInputBase-input": {
                          fontSize: "0.875rem",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: "text.secondary",
                        },
                      }}
                    />
                  </FormControl>
                </Grid>
              </>
            )}
          </Paper>

          <Divider />
          <Paper sx={{ p: 2 }} elevation={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={leavesExpanded}
                  onChange={(e) => setLeavesExpanded(e.target.checked)}
                />
              }
              label={
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  叶子节点样式
                </Typography>
              }
            />
            {leavesExpanded && (
              <Box sx={{ p: 1, pt: 2 }}>
                <TextStyle
                  value={(currentSeries.leaves as any)?.label || {}}
                  onChange={(label) => {
                    const currentLeaves = currentSeries.leaves || {};
                    updateSeries("leaves", {
                      ...currentLeaves,
                      label,
                    });
                  }}
                  label="文本标签"
                  isLabel={true}
                />
                <Box sx={{ mt: 2 }}>
                  <ItemStyle
                    value={(currentSeries.leaves as any)?.itemStyle || {}}
                    onChange={(itemStyle) => {
                      const currentLeaves = currentSeries.leaves || {};
                      updateSeries("leaves", {
                        ...currentLeaves,
                        itemStyle,
                      });
                    }}
                    label="节点样式"
                  />
                </Box>
              </Box>
            )}
          </Paper>
        </Stack>
      </Paper>
    ),
    [
      currentSeries,
      updateSeries,
      updateNestedSeries,
      currentSeriesName,
      chartOption,
      leavesExpanded,
      setLeavesExpanded,
    ]
  );

  return <>{treeSeriesContent}</>;
};

export default TreeSeries;
export type { TreeSeriesProps };
