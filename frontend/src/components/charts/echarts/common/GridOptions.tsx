import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Switch,
  Typography,
  Stack,
  TextField,
  Paper,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { GridComponentOption } from "echarts";
import ColorPicker from "@/components/common/ColorPicker";
import { useChartStore } from "@/stores/chartStore";

// 网格配置组件
interface GridOptionsProps {
  label?: string;
  gridIndex?: number;
}

const GridOptions: React.FC<GridOptionsProps> = ({
  label = "网格配置",
  gridIndex: initialGridIndex = 0,
}) => {
  const { chartOption, setChartOption } = useChartStore();
  const [gridIndex, setGridIndex] = useState(initialGridIndex);

  // 直接获取 grid 配置，处理数组情况
  const getGridOption = useCallback(() => {
    const grid = chartOption?.grid;
    if (Array.isArray(grid)) {
      return grid[gridIndex] || {};
    }
    return grid || {};
  }, [chartOption?.grid, gridIndex]);

  // 获取当前选中的网格名称
  const currentGridName = useMemo(() => {
    const grid = chartOption?.grid;
    if (Array.isArray(grid) && grid[gridIndex]) {
      return `网格 ${gridIndex + 1}`;
    }
    return `网格 ${gridIndex + 1}`;
  }, [chartOption?.grid, gridIndex]);

  // 确保所有值都有默认值，避免受控/非受控组件警告
  const safeValue = useMemo(() => {
    const gridOption = getGridOption();
    return {
      show: gridOption?.show !== false,
      left: gridOption?.left ?? "10%",
      top: gridOption?.top ?? "10%",
      right: gridOption?.right ?? "10%",
      bottom: gridOption?.bottom ?? "10%",
      width: gridOption?.width ?? "auto",
      height: gridOption?.height ?? "auto",
      containLabel: gridOption?.containLabel ?? false,
      backgroundColor: (gridOption?.backgroundColor as string) ?? undefined,
      borderColor: (gridOption?.borderColor as string) ?? undefined,
      borderWidth: gridOption?.borderWidth ?? 0,
      shadowBlur: gridOption?.shadowBlur ?? 0,
      shadowColor: (gridOption?.shadowColor as string) ?? undefined,
      shadowOffsetX: gridOption?.shadowOffsetX ?? 0,
      shadowOffsetY: gridOption?.shadowOffsetY ?? 0,
    };
  }, [getGridOption]);

  // 直接更新 grid 配置
  const updateGrid = useCallback(
    (key: keyof GridComponentOption, newValue: any) => {
      setChartOption((draft) => {
        if (!draft) return;

        // 确保 grid 存在
        if (!draft.grid) {
          draft.grid = [];
        }

        // 处理 grid 是数组的情况
        if (Array.isArray(draft.grid)) {
          if (draft.grid.length <= gridIndex) {
            // 扩展数组到所需长度
            while (draft.grid.length <= gridIndex) {
              draft.grid.push({});
            }
          }
          (draft.grid[gridIndex] as any)[key] = newValue;
        } else {
          (draft.grid as any)[key] = newValue;
        }
      });
    },
    [setChartOption, gridIndex]
  );

  const gridContent = useMemo(
    () => (
      <Box sx={{ p: 1 }}>
        <Stack spacing={3}>
          {/* 选择当前要配置的网格 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              选择网格
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>选择网格</InputLabel>
                  <Select
                    label="选择网格"
                    value={currentGridName}
                    onChange={(e) => {
                      const selectedName = e.target.value as string;

                      // 从名称中提取索引
                      const match = selectedName.match(/网格 (\d+)/);
                      if (match) {
                        const newIndex = parseInt(match[1]) - 1;
                        setGridIndex(newIndex);
                      } else {
                        // 如果没找到，创建新网格
                        const newIndex = Array.isArray(chartOption?.grid)
                          ? chartOption.grid.length
                          : 0;
                        setChartOption((draft) => {
                          if (!draft) return;
                          if (!draft.grid) draft.grid = [] as any;
                          if (Array.isArray(draft.grid)) {
                            (draft.grid as any).push({});
                          }
                        });
                        setGridIndex(newIndex);
                      }
                    }}
                  >
                    {Array.isArray(chartOption?.grid) ? (
                      chartOption.grid.map((_, idx) => (
                        <MenuItem key={idx} value={`网格 ${idx + 1}`}>
                          网格 {idx + 1}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="网格 1">网格 1</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                {/* 可以在这里添加其他网格相关的控制 */}
              </Grid>
            </Grid>
          </Box>

          {/* 显示网格 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              显示网格
            </Typography>
            <Switch
              checked={safeValue.show}
              onChange={(e) => updateGrid("show", e.target.checked)}
            />
          </Box>

          {/* 只有当显示网格时才渲染网格相关组件 */}
          {safeValue.show && (
            <Paper sx={{ p: 2 }} elevation={2}>
              {/* 网格边距设置 */}
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  网格边距
                </Typography>
                <Stack spacing={2}>
                  {/* 上下边距 */}
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="左边距"
                      value={safeValue.left}
                      onChange={(e) => updateGrid("left", e.target.value)}
                      placeholder="10%"
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="右边距"
                      value={safeValue.right}
                      onChange={(e) => updateGrid("right", e.target.value)}
                      placeholder="10%"
                    />
                  </Stack>
                  {/* 上下边距 */}
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="上边距"
                      value={safeValue.top}
                      onChange={(e) => updateGrid("top", e.target.value)}
                      placeholder="10%"
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="下边距"
                      value={safeValue.bottom}
                      onChange={(e) => updateGrid("bottom", e.target.value)}
                      placeholder="10%"
                    />
                  </Stack>
                </Stack>
              </Box>

              {/* 网格尺寸 */}
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  网格尺寸
                </Typography>
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="宽度"
                    value={safeValue.width}
                    onChange={(e) => updateGrid("width", e.target.value)}
                    placeholder="auto"
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="高度"
                    value={safeValue.height}
                    onChange={(e) => updateGrid("height", e.target.value)}
                    placeholder="auto"
                  />
                </Stack>
              </Box>

              {/* 包含标签 */}
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  包含坐标轴标签
                </Typography>
                <Switch
                  checked={safeValue.containLabel}
                  onChange={(e) => updateGrid("containLabel", e.target.checked)}
                />
              </Box>

              {/* 网格背景 */}
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  背景颜色
                </Typography>
                <ColorPicker
                  value={safeValue.backgroundColor}
                  onChange={(color) => {
                    const colorValue = Array.isArray(color)
                      ? color[0] || ""
                      : color;
                    updateGrid("backgroundColor", colorValue as any);
                  }}
                  label=""
                  maxColors={1}
                />
              </Box>

              {/* 网格边框 */}
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  边框设置
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    边框颜色
                  </Typography>
                  <ColorPicker
                    value={safeValue.borderColor}
                    onChange={(color) => {
                      const colorValue = Array.isArray(color)
                        ? color[0] || ""
                        : color;
                      updateGrid("borderColor", colorValue as any);
                    }}
                    label=""
                    maxColors={1}
                  />
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  label="边框宽度"
                  type="number"
                  value={safeValue.borderWidth}
                  onChange={(e) =>
                    updateGrid("borderWidth", parseInt(e.target.value) || 0)
                  }
                />
              </Box>

              {/* 阴影设置 */}
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  阴影设置
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    阴影颜色
                  </Typography>
                  <ColorPicker
                    value={safeValue.shadowColor}
                    onChange={(color) => {
                      const colorValue = Array.isArray(color)
                        ? color[0] || ""
                        : color;
                      updateGrid("shadowColor", colorValue as any);
                    }}
                    label=""
                    maxColors={1}
                  />
                </Box>
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="阴影模糊"
                    type="number"
                    value={safeValue.shadowBlur}
                    onChange={(e) =>
                      updateGrid("shadowBlur", parseInt(e.target.value) || 0)
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="阴影X偏移"
                    type="number"
                    value={safeValue.shadowOffsetX}
                    onChange={(e) =>
                      updateGrid("shadowOffsetX", parseInt(e.target.value) || 0)
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="阴影Y偏移"
                    type="number"
                    value={safeValue.shadowOffsetY}
                    onChange={(e) =>
                      updateGrid("shadowOffsetY", parseInt(e.target.value) || 0)
                    }
                  />
                </Stack>
              </Box>
            </Paper>
          )}
        </Stack>
      </Box>
    ),
    [safeValue, updateGrid, currentGridName, chartOption?.grid, setChartOption]
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {gridContent}
    </Paper>
  );
};

export default GridOptions;
