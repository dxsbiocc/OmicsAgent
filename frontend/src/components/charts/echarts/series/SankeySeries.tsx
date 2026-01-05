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
import { ColorPicker, LabelLayout, LineStyle, TextStyle } from "../common";
import { SankeySeriesOption } from "echarts";
import { useChartStore } from "@/stores/chartStore";
import ItemStyle from "../common/ItemStyle";

// 桑基图系列配置
interface SankeySeriesProps {
  seriesIndex?: number; // 系列索引，默认为0
}

const SankeySeries: React.FC<SankeySeriesProps> = ({
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
    const seriesOption = getSeriesOption() as SankeySeriesOption;
    return {
      name: seriesOption?.name || "",
      left: seriesOption?.left ?? "left",
      top: seriesOption?.top ?? "top",
      bottom: seriesOption?.bottom ?? "bottom",
      right: seriesOption?.right ?? "right",
      width: seriesOption?.width ?? "auto",
      height: seriesOption?.height ?? "auto",
      center: seriesOption?.center ?? ["50%", "50%"],
      nodeWidth: seriesOption?.nodeWidth ?? 20,
      nodeGap: seriesOption?.nodeGap ?? 8,
      nodeAlign: seriesOption?.nodeAlign ?? "justify",
      layoutIterations: seriesOption?.layoutIterations ?? 32,
      orient: seriesOption?.orient ?? "horizontal",
      draggable: seriesOption?.draggable ?? true,
      zoom: seriesOption?.zoom ?? 1,
      scaleLimit: seriesOption?.scaleLimit ?? { min: 0.5, max: 2 },
      roam: seriesOption?.roam ?? true,
      roamTrigger: seriesOption?.roamTrigger ?? "global",
      itemStyle: seriesOption?.itemStyle ?? {},
      edgeLabel: seriesOption?.edgeLabel ?? {},
      label: seriesOption?.label ?? {},
      labelLayout: seriesOption?.labelLayout ?? {},
      lineStyle: seriesOption?.lineStyle ?? undefined,

      levels: seriesOption?.levels ?? [],
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

  // 是否显示多层配置
  const [showLevelsConfig, setShowLevelsConfig] = useState(false);

  // 当前选中的层级索引
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(0);

  // 是否显示节点样式配置
  const [showItemStyleConfig, setShowItemStyleConfig] = useState(false);

  // 是否显示标签样式配置
  const [showLabelStyleConfig, setShowLabelStyleConfig] = useState(false);
  // 是否显示关系边样式配置
  const [showEdgeStyleConfig, setShowEdgeStyleConfig] = useState(false);

  // 计算桑基图层级数（基于 depth 概念）
  // 桑基图从左边到右边有多个层级，每一层对应一个 depth
  const calculateSankeyLevels = useCallback((seriesOption: any): number => {
    if (!seriesOption) return 0;

    const links = seriesOption.links;

    if (!Array.isArray(links) || links.length === 0) return 0;

    // 收集所有节点
    const allNodes = new Set<string>();
    links.forEach((link: any) => {
      const source = String(link.source || link.source);
      const target = String(link.target || link.target);
      allNodes.add(source);
      allNodes.add(target);
    });

    // 如果没有链接，返回至少 2 层
    if (allNodes.size === 0) return 2;

    // 使用广度优先搜索 (BFS) 来计算层级
    // 找出所有没有入边的节点（最左侧的节点）
    const targets = new Set<string>();
    links.forEach((link: any) => {
      targets.add(String(link.target));
    });

    const sourceNodes = Array.from(allNodes).filter(
      (node) => !targets.has(node)
    );

    // 如果没有源节点，返回至少 2 层
    if (sourceNodes.length === 0) return 2;

    // 使用拓扑排序的简化版本来计算层级
    const nodeDepth = new Map<string, number>();

    // 初始化所有节点
    allNodes.forEach((node) => {
      nodeDepth.set(node, 0);
    });

    // 为所有源节点设置 depth = 0
    sourceNodes.forEach((node) => {
      nodeDepth.set(node, 0);
    });

    // 从源节点开始，按照链接关系计算每个节点的深度
    let maxDepth = 0;
    const visited = new Set<string>();

    const calculateDepth = (nodeName: string): void => {
      if (visited.has(nodeName)) return;
      visited.add(nodeName);

      const currentDepth = nodeDepth.get(nodeName) || 0;
      maxDepth = Math.max(maxDepth, currentDepth);

      links.forEach((link: any) => {
        if (String(link.source) === nodeName) {
          const target = String(link.target);
          const targetCurrentDepth = nodeDepth.get(target) || 0;
          const newDepth = currentDepth + 1;

          if (newDepth > targetCurrentDepth) {
            nodeDepth.set(target, newDepth);
            maxDepth = Math.max(maxDepth, newDepth);
          }

          if (!visited.has(target)) {
            calculateDepth(target);
          }
        }
      });
    };

    sourceNodes.forEach((node) => {
      calculateDepth(node);
    });

    // 返回层级数 + 1（因为包含第 0 层）
    return Math.max(2, maxDepth + 1);
  }, []);

  // 自动计算层级数
  const sankeyDepth = useMemo(() => {
    const seriesOption = getSeriesOption();
    return calculateSankeyLevels(seriesOption);
  }, [
    chartOption?.series,
    seriesIndex,
    calculateSankeyLevels,
    getSeriesOption,
  ]);

  // 初始化 levels 数组
  const initializeLevels = useCallback(() => {
    if (!currentSeries.levels || currentSeries.levels.length === 0) {
      // 为每一层创建配置
      const newLevels = Array.from({ length: sankeyDepth }).map((_, index) => ({
        depth: index,
      }));
      updateSeries("levels", newLevels);
    }
  }, [currentSeries.levels, sankeyDepth, updateSeries]);

  // 自动初始化 levels
  React.useEffect(() => {
    if (
      sankeyDepth > 0 &&
      (!currentSeries.levels || currentSeries.levels.length === 0)
    ) {
      initializeLevels();
    }
  }, [sankeyDepth, currentSeries.levels, initializeLevels]);

  return (
    <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
      <Typography variant="h6" gutterBottom>
        桑基图
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
          {/* 桑基图位置和尺寸配置 */}
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

          <Divider />

          {/* 节点配置 */}
          <Paper sx={{ p: 1, mt: 2 }} elevation={2}>
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2">节点配置</Typography>
              <Grid container spacing={2} sx={{ p: 1, mt: 2 }}>
                {/* 节点宽度 */}
                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="节点宽度"
                    type="number"
                    value={currentSeries.nodeWidth || 20}
                    onChange={(e) =>
                      updateSeries("nodeWidth", parseInt(e.target.value) || 20)
                    }
                    helperText="节点矩形的宽度"
                  />
                </Grid>

                {/* 节点间隔 */}
                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="节点间隔"
                    type="number"
                    value={currentSeries.nodeGap || 8}
                    onChange={(e) =>
                      updateSeries("nodeGap", parseInt(e.target.value) || 8)
                    }
                    helperText="同级节点间的间隔"
                  />
                </Grid>

                {/* 节点对齐 */}
                <Grid size={{ xs: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>节点对齐</InputLabel>
                    <Select
                      label="节点对齐"
                      value={currentSeries.nodeAlign || "justify"}
                      onChange={(e) =>
                        updateSeries("nodeAlign", e.target.value)
                      }
                    >
                      <MenuItem value="justify">两端对齐</MenuItem>
                      <MenuItem value="left">左对齐</MenuItem>
                      <MenuItem value="right">右对齐</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

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

                {/* 布局迭代次数 */}
                <Grid size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="布局迭代次数"
                    type="number"
                    value={currentSeries.layoutIterations || 32}
                    onChange={(e) =>
                      updateSeries(
                        "layoutIterations",
                        parseInt(e.target.value) || 32
                      )
                    }
                  />
                </Grid>
                {/* 方向 */}
                <Grid size={{ xs: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>方向</InputLabel>
                    <Select
                      label="方向"
                      value={currentSeries.orient || "horizontal"}
                      onChange={(e) => updateSeries("orient", e.target.value)}
                    >
                      <MenuItem value="horizontal">水平</MenuItem>
                      <MenuItem value="vertical">垂直</MenuItem>
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
              </Grid>
            </Box>
          </Paper>
        </Box>

        <Divider />

        {/* 节点样式 */}
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
                节点矩形样式
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

        {/* 节点标签 */}
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
                节点标签
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
            <Paper sx={{ p: 2, mt: 2 }} elevation={2}>
              <Box sx={{ p: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>颜色来源</InputLabel>
                      <Select
                        label="颜色来源"
                        value={
                          currentSeries.lineStyle?.color === "source" ||
                          currentSeries.lineStyle?.color === "target" ||
                          currentSeries.lineStyle?.color === "gradient"
                            ? (currentSeries.lineStyle?.color as string)
                            : "color"
                        }
                        onChange={(e) => {
                          const val = e.target.value as string;
                          if (
                            val === "source" ||
                            val === "target" ||
                            val === "gradient"
                          ) {
                            updateNestedSeries(["lineStyle", "color"], val);
                          } else {
                            // 切换为自定义颜色模式，如果之前是特殊字符串，则给一个默认值
                            const prev = currentSeries.lineStyle?.color;
                            const next =
                              prev === "source" ||
                              prev === "target" ||
                              prev === "gradient"
                                ? "#999"
                                : (prev as string) || "#999";
                            updateNestedSeries(["lineStyle", "color"], next);
                          }
                        }}
                      >
                        <MenuItem value="color">自定义颜色</MenuItem>
                        <MenuItem value="source">source（源节点颜色）</MenuItem>
                        <MenuItem value="target">
                          target（目标节点颜色）
                        </MenuItem>
                        <MenuItem value="gradient">
                          gradient（源到目标渐变）
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {!(
                    currentSeries.lineStyle?.color === "source" ||
                    currentSeries.lineStyle?.color === "target" ||
                    currentSeries.lineStyle?.color === "gradient"
                  ) && (
                    <Grid size={{ xs: 12 }}>
                      <ColorPicker
                        value={currentSeries.lineStyle?.color as string}
                        onChange={(color) =>
                          updateNestedSeries(["lineStyle", "color"], color)
                        }
                        label="关系边颜色"
                      />
                    </Grid>
                  )}
                </Grid>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="边透明度"
                      type="number"
                      value={currentSeries.lineStyle?.opacity || 1}
                      onChange={(e) =>
                        updateNestedSeries(
                          ["lineStyle", "opacity"],
                          Number(e.target.value) || 1
                        )
                      }
                      slotProps={{
                        input: {
                          inputProps: {
                            min: 0,
                            max: 1,
                            step: 0.01,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="边曲度"
                      type="number"
                      value={currentSeries.lineStyle?.curveness || 0}
                      onChange={(e) =>
                        updateNestedSeries(
                          ["lineStyle", "curveness"],
                          Number(e.target.value) || 1
                        )
                      }
                      slotProps={{
                        input: {
                          inputProps: {
                            min: 0,
                            max: 1,
                            step: 0.01,
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                {/* 阴影配置 */}
                <Grid size={{ xs: 12 }} sx={{ p: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!currentSeries.lineStyle?.shadowColor}
                        onChange={(e) => {
                          console.log("阴影开关变化:", e.target.checked);
                          console.log(
                            "shadowColor:",
                            currentSeries.lineStyle?.shadowColor
                          );
                          if (e.target.checked) {
                            // 开启阴影时设置默认阴影颜色和参数
                            updateNestedSeries(
                              ["lineStyle", "shadowColor"],
                              "rgba(0,0,0,0.2)"
                            );
                          } else {
                            // 关闭阴影时清空所有阴影相关属性
                            updateNestedSeries(
                              ["lineStyle", "shadowColor"],
                              undefined
                            );
                            updateNestedSeries(["lineStyle", "shadowBlur"], 0);
                            updateNestedSeries(
                              ["lineStyle", "shadowOffsetX"],
                              0
                            );
                            updateNestedSeries(
                              ["lineStyle", "shadowOffsetY"],
                              0
                            );
                          }
                        }}
                      />
                    }
                    label="阴影效果"
                  />
                </Grid>
                {currentSeries.lineStyle?.shadowColor !== undefined &&
                  (console.log(
                    "shadowColor:",
                    currentSeries.lineStyle?.shadowColor
                  ),
                  (
                    <Box sx={{ p: 1 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                          <ColorPicker
                            value={
                              currentSeries.lineStyle?.shadowColor ||
                              "rgba(0,0,0,0.2)"
                            }
                            onChange={(color) =>
                              updateNestedSeries(
                                ["lineStyle", "shadowColor"],
                                color
                              )
                            }
                            label="阴影颜色"
                            maxColors={1}
                          />
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <FormControl
                            fullWidth
                            size="small"
                            variant="outlined"
                          >
                            <TextField
                              value={currentSeries.lineStyle?.shadowBlur || 0}
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
                          <FormControl
                            fullWidth
                            size="small"
                            variant="outlined"
                          >
                            <TextField
                              value={
                                currentSeries.lineStyle?.shadowOffsetX || 0
                              }
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
                          <FormControl
                            fullWidth
                            size="small"
                            variant="outlined"
                          >
                            <TextField
                              value={
                                currentSeries.lineStyle?.shadowOffsetY || 0
                              }
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
                      </Grid>
                    </Box>
                  ))}
              </Box>
            </Paper>
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

        {/* 多层配置 */}
        <Box sx={{ p: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showLevelsConfig}
                onChange={(e) => setShowLevelsConfig(e.target.checked)}
              />
            }
            label={
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                多层配置
              </Typography>
            }
          />

          {showLevelsConfig && sankeyDepth > 0 && (
            <Box sx={{ p: 1, mt: 2 }}>
              <Paper sx={{ p: 2 }} elevation={2}>
                <Box sx={{ p: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    levels 数组为桑基图的每一层（从左到右）设置样式
                  </Typography>
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
                          {Array.from({ length: sankeyDepth }).map(
                            (_, index) => (
                              <MenuItem key={index} value={index}>
                                levels[{index}] - 第 {index} 层
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

                        {/* 当前层的节点样式 */}
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
                                    length: sankeyDepth,
                                  }).map((_, idx) => ({ depth: idx }));
                                }
                                if (
                                  !(series as any).levels[selectedLevelIndex]
                                ) {
                                  (series as any).levels[selectedLevelIndex] = {
                                    depth: selectedLevelIndex,
                                  };
                                }
                                (series as any).levels[
                                  selectedLevelIndex
                                ].itemStyle = itemStyle;
                              });
                            }}
                            label="当前层节点样式"
                          />
                        </Box>

                        {/* 当前层的连线样式 */}
                        {currentLevel.lineStyle && (
                          <Box sx={{ mb: 2 }}>
                            <LineStyle
                              value={currentLevel.lineStyle as any}
                              onChange={(lineStyle) => {
                                setChartOption((draft) => {
                                  if (!draft?.series) return;
                                  const series = Array.isArray(draft.series)
                                    ? draft.series[seriesIndex]
                                    : draft.series;
                                  if (!(series as any).levels) {
                                    (series as any).levels = Array.from({
                                      length: sankeyDepth,
                                    }).map((_, idx) => ({ depth: idx }));
                                  }
                                  if (
                                    !(series as any).levels[selectedLevelIndex]
                                  ) {
                                    (series as any).levels[selectedLevelIndex] =
                                      { depth: selectedLevelIndex };
                                  }
                                  (series as any).levels[
                                    selectedLevelIndex
                                  ].lineStyle = lineStyle;
                                });
                              }}
                              label="当前层连线样式"
                            />
                          </Box>
                        )}

                        {/* 当前层的标签 */}
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
                                    length: sankeyDepth,
                                  }).map((_, idx) => ({ depth: idx }));
                                }
                                if (
                                  !(series as any).levels[selectedLevelIndex]
                                ) {
                                  (series as any).levels[selectedLevelIndex] = {
                                    depth: selectedLevelIndex,
                                  };
                                }
                                (series as any).levels[
                                  selectedLevelIndex
                                ].label = label;
                              });
                            }}
                            label="当前层标签样式"
                            isLabel={true}
                          />
                        </Box>
                      </Box>
                    );
                  })()}
                </Box>
              </Paper>
            </Box>
          )}

          {showLevelsConfig && sankeyDepth === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              暂无数据或数据为空
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};

export default SankeySeries;
export type { SankeySeriesProps };
