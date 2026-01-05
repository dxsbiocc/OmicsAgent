import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Switch,
  Typography,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Grid,
  Slider,
  Paper,
  FormControlLabel,
} from "@mui/material";
import { TextStyle, ColorPicker, LineStyle } from "../common";
import { useChartStore } from "@/stores/chartStore";

// 坐标轴配置组件
interface RadarOptionsProps {
  axisIndex?: number;
  label?: string;
}

const RadarOptions: React.FC<RadarOptionsProps> = ({
  axisIndex = 0,
  label = "坐标轴",
}) => {
  const { chartOption, setChartOption } = useChartStore();

  // 当前选中的轴索引状态
  const [currentAxisIndex, setCurrentAxisIndex] = useState(axisIndex);

  // 直接获取坐标轴配置，处理数组情况
  const getRadarOption = useCallback(() => {
    const axis = chartOption?.radar;
    if (Array.isArray(axis)) {
      return axis[currentAxisIndex] || {};
    }
    return axis || {};
  }, [chartOption, currentAxisIndex]);

  // 获取可用的轴数量
  const getAvailableAxesCount = useCallback(() => {
    const axis = chartOption?.radar;
    if (Array.isArray(axis)) {
      return Math.max(axis.length, 1); // 至少有一个轴
    }
    return 1; // 单个轴
  }, [chartOption]);

  // 同步外部传入的 axisIndex
  useEffect(() => {
    setCurrentAxisIndex(axisIndex);
  }, [axisIndex]);

  // 确保所有值都有默认值，避免受控/非受控组件警告
  const safeValue = useMemo(() => {
    const axisOption = getRadarOption();
    return {
      center: axisOption?.center || ["50%", "50%"],
      radius: axisOption?.radius || "75%",
      startAngle: axisOption?.startAngle ?? 90,
      shape: axisOption?.shape || "polygon",
      indicator: axisOption?.indicator || [],
      splitNumber: axisOption?.splitNumber ?? 5,
      axisName: axisOption?.axisName || {},
      axisNameGap: axisOption?.axisNameGap ?? 15,
      axisLine: axisOption?.axisLine || {},
      axisTick: axisOption?.axisTick || {},
      axisLabel: axisOption?.axisLabel || {},
      splitLine: axisOption?.splitLine || {},
      splitArea: axisOption?.splitArea || {},
    };
  }, [getRadarOption]);

  // 直接更新坐标轴配置
  const updateRadarAxis = useCallback(
    (key: string, newValue: any) => {
      setChartOption((draft) => {
        if (!draft) return;

        // 确保坐标轴存在
        if (!draft.radar) {
          draft.radar = {};
        }

        // 处理坐标轴是数组的情况
        if (Array.isArray(draft.radar)) {
          if (draft.radar.length === 0) {
            draft.radar = [{}];
          }
          // 确保数组有足够的长度
          while (draft.radar.length <= currentAxisIndex) {
            draft.radar.push({});
          }
          (draft.radar[currentAxisIndex] as any)[key] = newValue;
        } else {
          (draft.radar as any)[key] = newValue;
        }
      });
    },
    [setChartOption, currentAxisIndex]
  );

  const updateNestedAxis = useCallback(
    (parentKey: string, childKey: string, newValue: any) => {
      setChartOption((draft) => {
        if (!draft) return;

        // 确保坐标轴存在
        if (!draft.radar) {
          draft.radar = {};
        }

        let targetAxis: any;
        if (Array.isArray(draft.radar)) {
          if (draft.radar.length === 0) {
            draft.radar = [{}];
          }
          // 确保数组有足够的长度
          while (draft.radar.length <= currentAxisIndex) {
            draft.radar.push({});
          }
          targetAxis = draft.radar[currentAxisIndex];
        } else {
          targetAxis = draft.radar;
        }

        // 确保父级对象存在
        if (!targetAxis[parentKey]) {
          targetAxis[parentKey] = {};
        }

        targetAxis[parentKey][childKey] = newValue;
      });
    },
    [setChartOption, currentAxisIndex]
  );

  const updateNestedNestedAxis = useCallback(
    (
      parentKey: string,
      childKey: string,
      grandChildKey: string,
      newValue: any
    ) => {
      setChartOption((draft) => {
        if (!draft) return;

        // 确保坐标轴存在
        if (!draft.radar) {
          draft.radar = {};
        }

        let targetAxis: any;
        if (Array.isArray(draft.radar)) {
          if (draft.radar.length === 0) {
            draft.radar = [{}];
          }
          // 确保数组有足够的长度
          while (draft.radar.length <= currentAxisIndex) {
            draft.radar.push({});
          }
          targetAxis = draft.radar[currentAxisIndex];
        } else {
          targetAxis = draft.radar;
        }

        // 确保父级和子级对象存在
        if (!targetAxis[parentKey]) {
          targetAxis[parentKey] = {};
        }
        if (!targetAxis[parentKey][childKey]) {
          targetAxis[parentKey][childKey] = {};
        }

        targetAxis[parentKey][childKey][grandChildKey] = newValue;
      });
    },
    [setChartOption, currentAxisIndex]
  );

  const axisContent = useMemo(
    () => (
      <Stack spacing={3}>
        {/* 轴选择器 */}
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            轴选择
          </Typography>
          <Paper sx={{ p: 2 }} elevation={2}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>选择雷达轴</InputLabel>
              <Select
                value={currentAxisIndex}
                onChange={(e) => setCurrentAxisIndex(Number(e.target.value))}
                label="选择雷达轴"
                sx={{
                  "& .MuiSelect-select": {
                    fontSize: "0.875rem",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "text.secondary",
                  },
                }}
              >
                {Array.from({ length: getAvailableAxesCount() }, (_, index) => (
                  <MenuItem key={index} value={index}>
                    雷达轴 {index + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Box>

        {/* 只有当显示坐标轴时才渲染坐标轴相关组件 */}
        <>
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              基本设置
            </Typography>
            <Paper sx={{ p: 2 }} elevation={2}>
              <Typography variant="subtitle2">位置和尺寸</Typography>
              <Grid container spacing={2} sx={{ p: 1 }}>
                {/* 中心位置配置 */}
                <Typography variant="body2">中心位置</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="X坐标"
                      value={
                        Array.isArray(safeValue.center)
                          ? safeValue.center[0] || "50%"
                          : "50%"
                      }
                      onChange={(e) => {
                        const xValue = e.target.value;
                        // 验证输入：只允许数值或百分比
                        if (xValue === "" || /^(\d+(\.\d+)?%?)$/.test(xValue)) {
                          const currentCenter = Array.isArray(safeValue.center)
                            ? safeValue.center
                            : ["50%", "50%"];
                          updateRadarAxis("center", [
                            xValue,
                            currentCenter[1] || "50%",
                          ]);
                        }
                      }}
                      placeholder="50% 或 100"
                      error={
                        !!(
                          safeValue.center &&
                          Array.isArray(safeValue.center) &&
                          safeValue.center[0] &&
                          !/^(\d+(\.\d+)?%?)$/.test(String(safeValue.center[0]))
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
                        Array.isArray(safeValue.center)
                          ? safeValue.center[1] || "50%"
                          : "50%"
                      }
                      onChange={(e) => {
                        const yValue = e.target.value;
                        // 验证输入：只允许数值或百分比
                        if (yValue === "" || /^(\d+(\.\d+)?%?)$/.test(yValue)) {
                          const currentCenter = Array.isArray(safeValue.center)
                            ? safeValue.center
                            : ["50%", "50%"];
                          updateRadarAxis("center", [
                            currentCenter[0] || "50%",
                            yValue,
                          ]);
                        }
                      }}
                      placeholder="50% 或 100"
                      error={
                        !!(
                          safeValue.center &&
                          Array.isArray(safeValue.center) &&
                          safeValue.center[1] &&
                          !/^(\d+(\.\d+)?%?)$/.test(String(safeValue.center[1]))
                        )
                      }
                      helperText="请输入数值或百分比"
                    />
                  </Grid>
                </Grid>

                {/* 半径配置 */}
                <Typography variant="body2">半径</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="内半径"
                      value={
                        Array.isArray(safeValue.radius)
                          ? safeValue.radius[0] || 0
                          : 0
                      }
                      onChange={(e) => {
                        const innerValue = e.target.value;
                        // 验证输入：只允许数值或百分比
                        if (
                          innerValue === "" ||
                          /^(\d+(\.\d+)?%?)$/.test(innerValue)
                        ) {
                          if (Array.isArray(safeValue.radius)) {
                            updateRadarAxis("radius", [
                              innerValue,
                              safeValue.radius[1] || "75%",
                            ]);
                          } else {
                            // 当radius为单个值时，将其作为外半径，内半径设为0
                            updateRadarAxis("radius", [
                              innerValue,
                              safeValue.radius || "75%",
                            ]);
                          }
                        }
                      }}
                      placeholder="0% 或 20"
                      error={
                        !!(
                          safeValue.radius &&
                          Array.isArray(safeValue.radius) &&
                          safeValue.radius[0] &&
                          !/^(\d+(\.\d+)?%?)$/.test(String(safeValue.radius[0]))
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
                        Array.isArray(safeValue.radius)
                          ? safeValue.radius[1] || "75%"
                          : typeof safeValue.radius === "string"
                          ? safeValue.radius
                          : "75%"
                      }
                      onChange={(e) => {
                        const outerValue = e.target.value;
                        // 验证输入：只允许数值或百分比
                        if (
                          outerValue === "" ||
                          /^(\d+(\.\d+)?%?)$/.test(outerValue)
                        ) {
                          if (Array.isArray(safeValue.radius)) {
                            updateRadarAxis("radius", [
                              safeValue.radius[0] || 0,
                              outerValue,
                            ]);
                          } else {
                            // 当radius为单个值时，将其作为外半径，内半径设为0
                            updateRadarAxis("radius", [0, outerValue]);
                          }
                        }
                      }}
                      placeholder="50% 或 100"
                      error={
                        !!(
                          safeValue.radius &&
                          Array.isArray(safeValue.radius) &&
                          safeValue.radius[1] &&
                          !/^(\d+(\.\d+)?%?)$/.test(String(safeValue.radius[1]))
                        )
                      }
                      helperText="请输入数值或百分比"
                    />
                  </Grid>
                </Grid>

                {/* 角度配置 */}
                <Typography variant="body2">角度配置</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="起始角度"
                      type="number"
                      value={safeValue.startAngle}
                      onChange={(e) =>
                        updateRadarAxis(
                          "startAngle",
                          Number(e.target.value) || ""
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <FormControl fullWidth size="small" variant="outlined">
                      <InputLabel>形状</InputLabel>
                      <Select
                        value={safeValue.shape}
                        onChange={(e) =>
                          updateRadarAxis("shape", e.target.value)
                        }
                        label="形状"
                      >
                        <MenuItem value="polygon">多边形</MenuItem>
                        <MenuItem value="circle">圆形</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="轴标签间距"
                      type="number"
                      value={safeValue.axisNameGap}
                      onChange={(e) =>
                        updateRadarAxis(
                          "axisNameGap",
                          Number(e.target.value) || ""
                        )
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Box>
          {/* 名称文本样式 */}
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              轴标签样式
            </Typography>
            <TextStyle
              value={safeValue.axisName as any}
              onChange={(textStyle) => updateRadarAxis("axisName", textStyle)}
            />
          </Box>

          <Divider />

          {/* 轴线设置 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              轴线设置
            </Typography>
            <Switch
              checked={Boolean(safeValue.axisLine?.show ?? true)}
              onChange={(e) =>
                updateNestedAxis("axisLine", "show", e.target.checked)
              }
            />
            <Typography variant="body2" sx={{ ml: 1, display: "inline" }}>
              显示轴线
            </Typography>
          </Box>

          {(safeValue.axisLine?.show ?? true) && (
            <Box sx={{ p: 1 }}>
              <LineStyle
                value={safeValue.axisLine?.lineStyle as any}
                onChange={(lineStyle) =>
                  updateNestedAxis("axisLine", "lineStyle", lineStyle)
                }
                label=""
              />
            </Box>
          )}

          <Divider />

          {/* 刻度设置 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              刻度设置
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(safeValue.axisTick?.show ?? false)}
                  onChange={(e) =>
                    updateNestedAxis("axisTick", "show", e.target.checked)
                  }
                />
              }
              label="显示刻度"
            />
          </Box>

          {(safeValue.axisTick?.show ?? false) && (
            <Box>
              <Box sx={{ p: 1 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  刻度样式
                </Typography>

                {/* 刻度参数配置 */}
                <Grid container spacing={2}>
                  {/* 刻度长度 */}
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="刻度长度"
                      type="number"
                      value={safeValue.axisTick?.length ?? 5}
                      onChange={(e) =>
                        updateNestedAxis(
                          "axisTick",
                          "length",
                          parseInt(e.target.value) || 5
                        )
                      }
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
                  </Grid>

                  {/* 是否朝内 */}
                  <Grid size={{ xs: 4 }}>
                    <FormControl fullWidth size="small" variant="outlined">
                      <InputLabel>刻度方向</InputLabel>
                      <Select
                        value={safeValue.axisTick.inside ?? false}
                        onChange={(e) =>
                          updateNestedAxis(
                            "axisTick",
                            "inside",
                            e.target.value === "true"
                          )
                        }
                        label="刻度方向"
                        sx={{
                          "& .MuiSelect-select": {
                            fontSize: "0.875rem",
                          },
                          "& .MuiInputLabel-root": {
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: "text.secondary",
                          },
                        }}
                      >
                        <MenuItem value="false">朝外</MenuItem>
                        <MenuItem value="true">朝内</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* 自定义刻度值 */}
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="自定义刻度值"
                      value={safeValue.axisTick.customValues ?? ""}
                      onChange={(e) =>
                        updateNestedAxis(
                          "axisTick",
                          "customValues",
                          e.target.value
                        )
                      }
                      placeholder="用逗号分隔，如：1,2,3"
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
                  </Grid>
                </Grid>
              </Box>

              {/* 线条样式独立行 */}
              <Box sx={{ p: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  刻度线条样式
                </Typography>
                <LineStyle
                  value={safeValue.axisTick?.lineStyle as any}
                  onChange={(lineStyle) =>
                    updateNestedAxis("axisTick", "lineStyle", lineStyle)
                  }
                  label=""
                />
              </Box>
            </Box>
          )}

          <Divider />

          {/* 刻度标签设置 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              刻度标签设置
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={safeValue.axisLabel.show ?? false}
                  onChange={(e) =>
                    updateNestedAxis("axisLabel", "show", e.target.checked)
                  }
                />
              }
              label="显示刻度标签"
            />
          </Box>
          {(safeValue.axisLabel.show ?? false) && (
            <Box>
              <Box sx={{ p: 1 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  刻度标签样式
                </Typography>

                {/* 刻度标签参数配置 */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {/* 旋转角度 */}
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="旋转角度"
                      type="number"
                      value={safeValue.axisLabel.rotate}
                      onChange={(e) =>
                        updateNestedAxis(
                          "axisLabel",
                          "rotate",
                          parseInt(e.target.value) || 0
                        )
                      }
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
                  </Grid>

                  {/* 是否朝内 */}
                  <Grid size={{ xs: 4 }}>
                    <FormControl fullWidth size="small" variant="outlined">
                      <InputLabel
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.875rem",
                          fontStyle: "normal",
                        }}
                      >
                        标签方向
                      </InputLabel>
                      <Select
                        value={safeValue.axisLabel.inside ?? false}
                        onChange={(e) =>
                          updateNestedAxis(
                            "axisLabel",
                            "inside",
                            e.target.value === "true"
                          )
                        }
                        label="标签方向"
                        sx={{
                          "& .MuiSelect-select": {
                            fontSize: "0.875rem",
                          },
                          "& .MuiInputLabel-root": {
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: "text.secondary",
                          },
                        }}
                      >
                        <MenuItem value="false">朝外</MenuItem>
                        <MenuItem value="true">朝内</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* 标签与轴线距离 */}
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="标签间距"
                      type="number"
                      value={safeValue.axisLabel.margin}
                      onChange={(e) =>
                        updateNestedAxis(
                          "axisLabel",
                          "margin",
                          parseInt(e.target.value) || undefined
                        )
                      }
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
                  </Grid>

                  {/* 显示间隔 */}
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="显示间隔"
                      type="number"
                      value={
                        typeof safeValue.axisLabel.interval === "number"
                          ? safeValue.axisLabel.interval
                          : ""
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        updateNestedAxis(
                          "axisLabel",
                          "interval",
                          v === ""
                            ? "auto"
                            : Number.isNaN(Number(v))
                            ? "auto"
                            : parseInt(v)
                        );
                      }}
                      placeholder="auto"
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
                  </Grid>

                  {/* 自定义标签位置 */}
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="自定义标签位置"
                      value={safeValue.axisLabel.customValues ?? ""}
                      onChange={(e) =>
                        updateNestedAxis(
                          "axisLabel",
                          "customValues",
                          e.target.value
                        )
                      }
                      placeholder="用逗号分隔，如：1,2,3"
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
                  </Grid>

                  {/* 格式化器 */}
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="格式化器"
                      value={safeValue.axisLabel.formatter}
                      onChange={(e) =>
                        updateNestedAxis(
                          "axisLabel",
                          "formatter",
                          e.target.value
                        )
                      }
                      placeholder="{value}"
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
                  </Grid>
                </Grid>
              </Box>
              {/* 文本样式独立行 */}
              <Box sx={{ p: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  标签文本样式
                </Typography>
                <TextStyle
                  value={{
                    color: safeValue.axisLabel.color as string,
                    fontFamily: safeValue.axisLabel.fontFamily,
                    fontSize:
                      typeof safeValue.axisLabel.fontSize === "string"
                        ? parseInt(safeValue.axisLabel.fontSize) || 12
                        : safeValue.axisLabel.fontSize || 12,
                    fontWeight: safeValue.axisLabel.fontWeight as any,
                    fontStyle: safeValue.axisLabel.fontStyle as any,
                    textAlign: safeValue.axisLabel.align as any,
                    textVerticalAlign: safeValue.axisLabel.verticalAlign as any,
                    lineHeight: safeValue.axisLabel.lineHeight,
                    overflow: safeValue.axisLabel.overflow as any,
                  }}
                  onChange={(textStyle) => {
                    // 将 TextStyle 的更新映射到 axisLabel 的各个属性
                    const updates: any = {};
                    if (textStyle.color !== undefined)
                      updates.color = textStyle.color;
                    if (textStyle.fontFamily !== undefined)
                      updates.fontFamily = textStyle.fontFamily;
                    if (textStyle.fontSize !== undefined)
                      updates.fontSize = textStyle.fontSize;
                    if (textStyle.fontWeight !== undefined)
                      updates.fontWeight = textStyle.fontWeight;
                    if (textStyle.fontStyle !== undefined)
                      updates.fontStyle = textStyle.fontStyle;
                    if (textStyle.textAlign !== undefined)
                      updates.align = textStyle.textAlign;
                    if (textStyle.textVerticalAlign !== undefined)
                      updates.verticalAlign = textStyle.textVerticalAlign;
                    if (textStyle.lineHeight !== undefined)
                      updates.lineHeight = textStyle.lineHeight;
                    if (textStyle.overflow !== undefined)
                      updates.overflow = textStyle.overflow;

                    // 批量更新 axisLabel 属性
                    Object.keys(updates).forEach((key) => {
                      updateNestedAxis("axisLabel", key, updates[key]);
                    });
                  }}
                />
              </Box>
            </Box>
          )}

          <Divider />

          {/* 分割线设置 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              分割线设置
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={safeValue.splitLine.show ?? false}
                  onChange={(e) =>
                    updateNestedAxis("splitLine", "show", e.target.checked)
                  }
                />
              }
              label="显示分割线"
            />
          </Box>

          {(safeValue.splitLine.show ?? false) && (
            <Box sx={{ p: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                分割线样式
              </Typography>
              <LineStyle
                value={safeValue.splitLine.lineStyle as any}
                onChange={(lineStyle) =>
                  updateNestedAxis("splitLine", "lineStyle", lineStyle)
                }
                label=""
              />
            </Box>
          )}

          <Divider />

          {/* 分割区域设置 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              分割区域设置
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={safeValue.splitArea.show ?? false}
                  onChange={(e) =>
                    updateNestedAxis("splitArea", "show", e.target.checked)
                  }
                />
              }
              label="显示分割区域"
            />
          </Box>

          {(safeValue.splitArea.show ?? false) && (
            <Box sx={{ p: 1 }}>
              <Paper sx={{ p: 2 }} elevation={2}>
                <Box sx={{ flex: 1 }}>
                  <ColorPicker
                    value={
                      (safeValue.splitArea.areaStyle as any)?.color ?? "#000"
                    }
                    onChange={(color) => {
                      const colorArray = Array.isArray(color)
                        ? (color as string[])
                        : [color as string];
                      updateNestedNestedAxis(
                        "splitArea",
                        "areaStyle",
                        "color",
                        colorArray as any
                      );
                    }}
                    label="分割区域颜色"
                    // 允许多色以实现交替分割区
                    maxColors={6}
                  />
                </Box>
                <Stack direction="row" spacing={2} sx={{ mt: 2, mr: 2 }}>
                  {/* 透明度输入框 */}
                  <FormControl fullWidth size="small" variant="outlined">
                    <TextField
                      value={
                        (safeValue.splitArea.areaStyle as any)?.opacity ?? 1
                      }
                      onChange={(e) =>
                        updateNestedNestedAxis(
                          "splitArea",
                          "areaStyle",
                          "opacity",
                          Number(e.target.value) || 1
                        )
                      }
                      label="图形透明度"
                      type="number"
                      size="small"
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
                  </FormControl>
                  {/* 透明度滑块 */}
                  <Slider
                    value={(safeValue.splitArea.areaStyle as any)?.opacity ?? 1}
                    onChange={(_, newValue) =>
                      updateNestedNestedAxis(
                        "splitArea",
                        "areaStyle",
                        "opacity",
                        newValue as number
                      )
                    }
                    min={0}
                    max={1}
                    step={0.01}
                    marks={[
                      { value: 0, label: "0" },
                      { value: 0.5, label: "0.5" },
                      { value: 1, label: "1" },
                    ]}
                    valueLabelDisplay="auto"
                    sx={{
                      color: "primary.main",
                      "& .MuiSlider-thumb": {
                        width: 20,
                        height: 20,
                      },
                      "& .MuiSlider-track": {
                        height: 6,
                      },
                      "& .MuiSlider-rail": {
                        height: 6,
                      },
                    }}
                  />
                </Stack>
                {/* 阴影配置 */}
                <Stack direction="column" spacing={2} sx={{ mt: 2 }}>
                  <Grid size={{ xs: 12 }}>
                    <ColorPicker
                      value={
                        (safeValue.splitArea.areaStyle as any)?.shadowColor ??
                        "#000"
                      }
                      onChange={(color) =>
                        updateNestedNestedAxis(
                          "splitArea",
                          "areaStyle",
                          "shadowColor",
                          color
                        )
                      }
                      label="阴影颜色"
                      maxColors={1}
                    />
                  </Grid>
                  <Stack direction="row" spacing={2}>
                    <FormControl fullWidth size="small" variant="outlined">
                      <TextField
                        value={
                          (safeValue.splitArea.areaStyle as any)?.shadowBlur ??
                          0
                        }
                        onChange={(e) =>
                          updateNestedNestedAxis(
                            "splitArea",
                            "areaStyle",
                            "shadowBlur",
                            Number(e.target.value) || 0
                          )
                        }
                        label="阴影模糊"
                        type="number"
                        size="small"
                      />
                    </FormControl>

                    <FormControl fullWidth size="small" variant="outlined">
                      <TextField
                        value={
                          (safeValue.splitArea.areaStyle as any)
                            ?.shadowOffsetX ?? 0
                        }
                        onChange={(e) =>
                          updateNestedNestedAxis(
                            "splitArea",
                            "areaStyle",
                            "shadowOffsetX",
                            Number(e.target.value) || 0
                          )
                        }
                        label="阴影 X 偏移"
                        type="number"
                        size="small"
                      />
                    </FormControl>

                    <FormControl fullWidth size="small" variant="outlined">
                      <TextField
                        value={
                          (safeValue.splitArea.areaStyle as any)
                            ?.shadowOffsetY ?? 0
                        }
                        onChange={(e) =>
                          updateNestedNestedAxis(
                            "splitArea",
                            "areaStyle",
                            "shadowOffsetY",
                            Number(e.target.value) || 0
                          )
                        }
                        label="阴影 Y 偏移"
                        type="number"
                        size="small"
                      />
                    </FormControl>
                  </Stack>
                </Stack>
              </Paper>
            </Box>
          )}
        </>
      </Stack>
    ),
    [
      safeValue,
      updateRadarAxis,
      updateNestedAxis,
      updateNestedNestedAxis,
      currentAxisIndex,
      getAvailableAxesCount,
    ]
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {label}配置
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {axisContent}
    </Paper>
  );
};

export default RadarOptions;
