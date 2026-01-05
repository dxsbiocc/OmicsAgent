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
  Paper,
  FormControlLabel,
  Grid,
  Slider,
} from "@mui/material";

import { TextStyle, ColorPicker, LineStyle, ItemStyle } from "../common";
import { useChartStore } from "@/stores/chartStore";

// 坐标轴配置组件
interface PolarAxisProps {
  axisType: "radiusAxis" | "angleAxis";
  axisIndex?: number;
  label?: string;
}

const PolarAxis: React.FC<PolarAxisProps> = ({
  axisType,
  axisIndex = 0,
  label = "坐标轴",
}) => {
  const { chartOption, setChartOption } = useChartStore();
  // 当前选中的轴索引状态
  const [currentAxisIndex, setCurrentAxisIndex] = useState(axisIndex);

  // 直接获取坐标轴配置，处理数组情况
  const getAxisOption = useCallback(() => {
    const axis = chartOption?.[axisType];
    if (Array.isArray(axis)) {
      return axis[currentAxisIndex] || {};
    }
    return axis || {};
  }, [chartOption, axisType, currentAxisIndex]);

  // 获取可用的轴数量
  const getAvailableAxesCount = useCallback(() => {
    const axis = chartOption?.[axisType];
    if (Array.isArray(axis)) {
      return Math.max(axis.length, 1); // 至少有一个轴
    }
    return 1; // 单个轴
  }, [chartOption, axisType]);

  // 同步外部传入的 axisIndex
  useEffect(() => {
    setCurrentAxisIndex(axisIndex);
  }, [axisIndex]);

  // 确保所有值都有默认值，避免受控/非受控组件警告
  const safeValue = useMemo(() => {
    const axisOption = getAxisOption();
    return {
      type: axisOption?.type || "category",

      // radius
      name: axisOption?.name || "",
      nameLocation: axisOption?.nameLocation || "middle",
      nameGap: axisOption?.nameGap ?? 15,
      nameRotate: axisOption?.nameRotate ?? 0,
      nameTextStyle: axisOption?.nameTextStyle || {},
      inverse: axisOption?.inverse ?? false,
      // angle
      startAngle: (axisOption as any)?.startAngle ?? 90,
      endAngle: (axisOption as any)?.endAngle ?? "",
      clockwise: (axisOption as any)?.clockwise ?? true,

      splitNumber: (axisOption as any)?.splitNumber ?? 5,
      logBase: (axisOption as any)?.logBase ?? 10,
      boundaryGap: (axisOption as any)?.boundaryGap ?? 1,

      startValue: axisOption?.startValue ?? "",
      min: axisOption?.min ?? "",
      max: axisOption?.max ?? "",

      interval: (axisOption as any)?.interval ?? "",
      minInterval: (axisOption as any)?.minInterval ?? "",
      maxInterval: (axisOption as any)?.maxInterval ?? "",

      axisLine: {
        show: axisOption?.axisLine?.show !== false,
        lineStyle: axisOption?.axisLine?.lineStyle || {},
      },
      axisTick: {
        show: axisOption?.axisTick?.show ?? false,
        lineStyle: axisOption?.axisTick?.lineStyle || {},
      },
      axisLabel: {
        show: axisOption?.axisLabel?.show ?? true,
        rotate: axisOption?.axisLabel?.rotate ?? 0,
        inside: axisOption?.axisLabel?.inside ?? false,
        margin: axisOption?.axisLabel?.margin ?? "",
        interval: axisOption?.axisLabel?.interval ?? "auto",
        customValues: axisOption?.axisLabel?.customValues ?? "",
        formatter: axisOption?.axisLabel?.formatter ?? "",
        color: axisOption?.axisLabel?.color ?? "",
        fontFamily: axisOption?.axisLabel?.fontFamily ?? "",
        fontSize: axisOption?.axisLabel?.fontSize ?? 12,
        fontWeight: axisOption?.axisLabel?.fontWeight ?? "normal",
        fontStyle: axisOption?.axisLabel?.fontStyle ?? "normal",
        align: axisOption?.axisLabel?.align ?? "auto",
        verticalAlign: axisOption?.axisLabel?.verticalAlign ?? "auto",
        lineHeight: axisOption?.axisLabel?.lineHeight ?? "",
        overflow: axisOption?.axisLabel?.overflow ?? "none",
      },
      splitLine: {
        show: axisOption?.splitLine?.show ?? axisType === "radiusAxis",
        lineStyle: axisOption?.splitLine?.lineStyle || {},
      },
      splitArea: {
        show: axisOption?.splitArea?.show ?? false,
        areaStyle: axisOption?.splitArea?.areaStyle || {},
      },
    };
  }, [getAxisOption, axisType]);

  // 直接更新坐标轴配置
  const updateAxis = useCallback(
    (key: string, newValue: any) => {
      setChartOption((draft) => {
        if (!draft) return;

        // 确保坐标轴存在
        if (!draft[axisType]) {
          draft[axisType] = {};
        }

        // 处理坐标轴是数组的情况
        if (Array.isArray(draft[axisType])) {
          if (draft[axisType].length === 0) {
            draft[axisType] = [{}];
          }
          // 确保数组有足够的长度
          while (draft[axisType].length <= currentAxisIndex) {
            draft[axisType].push({});
          }
          (draft[axisType][currentAxisIndex] as any)[key] = newValue;
        } else {
          (draft[axisType] as any)[key] = newValue;
        }
      });
    },
    [setChartOption, axisType, currentAxisIndex]
  );

  const updateNestedAxis = useCallback(
    (parentKey: string, childKey: string, newValue: any) => {
      setChartOption((draft) => {
        if (!draft) return;

        // 确保坐标轴存在
        if (!draft[axisType]) {
          draft[axisType] = {};
        }

        let targetAxis: any;
        if (Array.isArray(draft[axisType])) {
          if (draft[axisType].length === 0) {
            draft[axisType] = [{}];
          }
          // 确保数组有足够的长度
          while (draft[axisType].length <= currentAxisIndex) {
            draft[axisType].push({});
          }
          targetAxis = draft[axisType][currentAxisIndex];
        } else {
          targetAxis = draft[axisType];
        }

        // 确保父级对象存在
        if (!targetAxis[parentKey]) {
          targetAxis[parentKey] = {};
        }

        targetAxis[parentKey][childKey] = newValue;
      });
    },
    [setChartOption, axisType, currentAxisIndex]
  );

  const updateLineStyle = useCallback(
    (parentKey: string, childKey: string, lineStyle: any) => {
      setChartOption((draft) => {
        if (!draft) return;

        // 确保坐标轴存在
        if (!draft[axisType]) {
          draft[axisType] = {};
        }

        let targetAxis: any;
        if (Array.isArray(draft[axisType])) {
          if (draft[axisType].length === 0) {
            draft[axisType] = [{}];
          }
          // 确保数组有足够的长度
          while (draft[axisType].length <= currentAxisIndex) {
            draft[axisType].push({});
          }
          targetAxis = draft[axisType][currentAxisIndex];
        } else {
          targetAxis = draft[axisType];
        }

        // 确保父级对象存在
        if (!targetAxis[parentKey]) {
          targetAxis[parentKey] = {};
        }

        targetAxis[parentKey][childKey] = lineStyle;
      });
    },
    [setChartOption, axisType, currentAxisIndex]
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
        if (!draft[axisType]) {
          draft[axisType] = {};
        }

        let targetAxis: any;
        if (Array.isArray(draft[axisType])) {
          if (draft[axisType].length === 0) {
            draft[axisType] = [{}];
          }
          // 确保数组有足够的长度
          while (draft[axisType].length <= currentAxisIndex) {
            draft[axisType].push({});
          }
          targetAxis = draft[axisType][currentAxisIndex];
        } else {
          targetAxis = draft[axisType];
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
    [setChartOption, axisType, currentAxisIndex]
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
            <Box sx={{ p: 1 }}>
              <Stack direction="row" spacing={2}>
                <FormControl fullWidth size="small" variant="outlined">
                  <InputLabel>
                    选择{axisType === "radiusAxis" ? "半径" : "角度"}轴
                  </InputLabel>
                  <Select
                    value={currentAxisIndex}
                    onChange={(e) =>
                      setCurrentAxisIndex(Number(e.target.value))
                    }
                    label={`选择${
                      axisType === "radiusAxis" ? "半径" : "角度"
                    }轴`}
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
                    {Array.from(
                      { length: getAvailableAxesCount() },
                      (_, index) => (
                        <MenuItem key={index} value={index}>
                          {axisType === "radiusAxis" ? "半径" : "角度"}轴{" "}
                          {index + 1}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" variant="outlined">
                  <InputLabel>类型</InputLabel>
                  <Select
                    value={safeValue.type}
                    onChange={(e) => updateAxis("type", e.target.value)}
                    label="类型"
                    sx={{
                      "& .MuiSelect-select": {
                        fontSize: "0.875rem",
                      },
                    }}
                  >
                    <MenuItem value="category">分类</MenuItem>
                    <MenuItem value="value">数值</MenuItem>
                    <MenuItem value="time">时间</MenuItem>
                    <MenuItem value="log">对数</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          </Paper>
        </Box>
        {/* 只有当显示坐标轴时才渲染坐标轴相关组件 */}
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            基本设置
          </Typography>
          <Paper sx={{ p: 2 }} elevation={2}>
            {/* 坐标轴名称和旋转角度 */}
            {axisType === "radiusAxis" ? (
              <Box sx={{ p: 1 }}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="轴标签"
                    value={safeValue.name}
                    onChange={(e) => updateAxis("name", e.target.value)}
                    placeholder="输入坐标轴名称"
                  />
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel>轴标签位置</InputLabel>
                    <Select
                      value={safeValue.nameLocation}
                      onChange={(e) =>
                        updateAxis("nameLocation", e.target.value)
                      }
                      label="轴标签位置"
                    >
                      <MenuItem value="start">开始</MenuItem>
                      <MenuItem value="middle">中间</MenuItem>
                      <MenuItem value="end">结束</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    size="small"
                    label="标签与轴线的间距"
                    value={safeValue.nameGap}
                    onChange={(e) =>
                      updateAxis("nameGap", parseInt(e.target.value) || 15)
                    }
                  />
                </Stack>
                <Stack direction="row" spacing={2} sx={{ my: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={safeValue.inverse}
                        onChange={(e) =>
                          updateAxis("inverse", e.target.checked)
                        }
                      />
                    }
                    label="反转坐标"
                    sx={{ width: "100%" }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="标签旋转角度"
                    value={safeValue.nameRotate}
                    onChange={(e) =>
                      updateAxis("nameRotate", parseInt(e.target.value) || 0)
                    }
                  />
                </Stack>
                <TextStyle
                  value={safeValue.nameTextStyle as any}
                  onChange={(textStyle) =>
                    updateAxis("nameTextStyle", textStyle)
                  }
                  label="轴标签样式"
                />
              </Box>
            ) : (
              <Box sx={{ p: 1 }}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="起始角度"
                    value={safeValue.startAngle}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateAxis(
                        "startAngle",
                        value === "" ? 90 : Number(value) || 90
                      );
                    }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="终止角度"
                    type="number"
                    value={safeValue.endAngle}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateAxis(
                        "endAngle",
                        value === "" ? undefined : Number(value) || undefined
                      );
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={safeValue.clockwise}
                        onChange={(e) =>
                          updateAxis("clockwise", e.target.checked)
                        }
                      />
                    }
                    sx={{
                      width: "100%",
                    }}
                    label="顺时针"
                  />
                </Stack>
              </Box>
            )}

            {/* 间距 */}
            <Box sx={{ mb: 2, p: 1 }}>
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="坐标刻度间隔"
                  type="number"
                  value={safeValue.interval}
                  onChange={(e) =>
                    updateAxis(
                      "interval",
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  label="最小间隔"
                  type="number"
                  value={safeValue.minInterval}
                  onChange={(e) =>
                    updateAxis(
                      "minInterval",
                      e.target.value === ""
                        ? undefined
                        : parseInt(e.target.value)
                    )
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  label="最大间隔"
                  type="number"
                  value={safeValue.maxInterval}
                  onChange={(e) =>
                    updateAxis(
                      "maxInterval",
                      e.target.value === ""
                        ? undefined
                        : parseInt(e.target.value)
                    )
                  }
                />
              </Stack>
              {/* 位置 */}
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="起始值"
                  type="number"
                  value={safeValue.startValue}
                  onChange={(e) =>
                    updateAxis(
                      "startValue",
                      e.target.value === ""
                        ? undefined
                        : parseInt(e.target.value)
                    )
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  label="最小刻度值"
                  type="number"
                  value={safeValue.min}
                  onChange={(e) =>
                    updateAxis(
                      "min",
                      e.target.value === ""
                        ? undefined
                        : parseInt(e.target.value)
                    )
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  label="最大刻度值"
                  type="number"
                  value={safeValue.max}
                  onChange={(e) =>
                    updateAxis(
                      "max",
                      e.target.value === ""
                        ? undefined
                        : parseInt(e.target.value)
                    )
                  }
                />
              </Stack>

              {/*  */}
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="分割数量"
                  type="number"
                  value={safeValue.splitNumber}
                  onChange={(e) =>
                    updateAxis("splitNumber", parseInt(e.target.value) || 5)
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  label="对数基数"
                  type="number"
                  value={safeValue.logBase}
                  onChange={(e) =>
                    updateAxis("logBase", parseInt(e.target.value) || 10)
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  label="边界间隙"
                  type="number"
                  value={safeValue.boundaryGap}
                  onChange={(e) =>
                    updateAxis("boundaryGap", parseInt(e.target.value) || 1)
                  }
                />
              </Stack>
            </Box>

            <Divider />

            {/* 轴线设置 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                轴线设置
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={safeValue.axisLine.show}
                    onChange={(e) =>
                      updateNestedAxis("axisLine", "show", e.target.checked)
                    }
                  />
                }
                label="显示轴线"
              />
            </Box>
            {safeValue.axisLine.show && (
              <Box sx={{ p: 1 }}>
                <LineStyle
                  value={safeValue.axisLine.lineStyle as any}
                  onChange={(lineStyle) =>
                    updateLineStyle("axisLine", "lineStyle", lineStyle)
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
                    checked={Boolean(safeValue.axisTick.show)}
                    onChange={(e) =>
                      updateNestedAxis("axisTick", "show", e.target.checked)
                    }
                  />
                }
                label="显示刻度"
              />
            </Box>

            {safeValue.axisTick.show && (
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
                        value={(safeValue.axisTick as any)?.length ?? 5}
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
                          value={(safeValue.axisTick as any)?.inside ?? false}
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
                        value={(safeValue.axisTick as any)?.customValues ?? ""}
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
                    value={(safeValue.axisTick as any)?.lineStyle as any}
                    onChange={(lineStyle) =>
                      updateLineStyle("axisTick", "lineStyle", lineStyle)
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
                    checked={safeValue.axisLabel.show}
                    onChange={(e) =>
                      updateNestedAxis("axisLabel", "show", e.target.checked)
                    }
                  />
                }
                label="显示刻度标签"
              />
            </Box>
            {safeValue.axisLabel.show && (
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
                          value={safeValue.axisLabel.inside}
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
                        value={safeValue.axisLabel.customValues}
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
                          : safeValue.axisLabel.fontSize,
                      fontWeight: safeValue.axisLabel.fontWeight as any,
                      fontStyle: safeValue.axisLabel.fontStyle as any,
                      textAlign: safeValue.axisLabel.align as any,
                      textVerticalAlign: safeValue.axisLabel
                        .verticalAlign as any,
                      lineHeight: safeValue.axisLabel.lineHeight as number,
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
                    checked={safeValue.splitLine.show}
                    onChange={(e) =>
                      updateNestedAxis("splitLine", "show", e.target.checked)
                    }
                  />
                }
                label="显示分割线"
              />
            </Box>

            {safeValue.splitLine.show && (
              <Box sx={{ p: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  分割线样式
                </Typography>
                <LineStyle
                  value={safeValue.splitLine.lineStyle as any}
                  onChange={(lineStyle) =>
                    updateLineStyle("splitLine", "lineStyle", lineStyle)
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
                    checked={safeValue.splitArea.show}
                    onChange={(e) =>
                      updateNestedAxis("splitArea", "show", e.target.checked)
                    }
                  />
                }
                label="显示分割区域"
              />
            </Box>

            {safeValue.splitArea.show && (
              <Box sx={{ p: 1 }}>
                <Paper sx={{ p: 2 }} elevation={2}>
                  <Box sx={{ flex: 1 }}>
                    <ColorPicker
                      value={
                        (safeValue.splitArea as any)?.areaStyle?.color ?? "#000"
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
                          (safeValue.splitArea as any)?.areaStyle?.opacity ?? 1
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
                      value={
                        (safeValue.splitArea as any)?.areaStyle?.opacity ?? 1
                      }
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
                          (safeValue.splitArea as any)?.areaStyle
                            ?.shadowColor ?? "#000"
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
                            (safeValue.splitArea as any)?.areaStyle
                              ?.shadowBlur ?? 0
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
                            (safeValue.splitArea as any)?.areaStyle
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
                            (safeValue.splitArea as any)?.areaStyle
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
          </Paper>
        </Box>
      </Stack>
    ),
    [safeValue, updateAxis, updateNestedAxis, updateNestedNestedAxis]
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

interface PolarOptionsProps {
  polarIndex?: number;
  label?: string;
}

export const PolarOptions: React.FC<PolarOptionsProps> = ({
  polarIndex = 0,
  label = "极坐标轴",
}) => {
  const { chartOption, setChartOption } = useChartStore();

  // 当前选中的轴索引状态
  const [currentPolarIndex, setCurrentPolarIndex] = useState(polarIndex);

  // 直接获取坐标轴配置，处理数组情况
  const getAxisOption = useCallback(() => {
    const axis = chartOption?.polar;
    if (Array.isArray(axis)) {
      return axis[currentPolarIndex] || {};
    }
    return axis || {};
  }, [chartOption, currentPolarIndex]);

  const updatePolarAxis = useCallback(
    (key: string, newValue: any) => {
      setChartOption((draft) => {
        if (!draft) return;

        // 确保坐标轴存在
        if (!draft.polar) {
          draft.polar = {};
        }

        // 处理坐标轴是数组的情况
        if (Array.isArray(draft.polar)) {
          if (draft.polar.length === 0) {
            draft.polar = [{}];
          }
          // 确保数组有足够的长度
          while (draft.polar.length <= currentPolarIndex) {
            draft.polar.push({});
          }
          (draft.polar[currentPolarIndex] as any)[key] = newValue;
        } else {
          (draft.polar as any)[key] = newValue;
        }
      });
    },
    [setChartOption, currentPolarIndex]
  );

  const getAvailablePolarsCount = useCallback(() => {
    const polar = chartOption?.polar;
    if (Array.isArray(polar)) {
      return Math.max(polar.length, 1); // 至少有一个极
    }
    return 1; // 单个极
  }, [chartOption, polarIndex]);

  const safeValue = useMemo(() => {
    const axisOption = getAxisOption();
    return {
      center: axisOption?.center || ["50%", "50%"],
      radius: axisOption?.radius || [0, "75%"],
    };
  }, [getAxisOption]);

  const polarContent = useMemo(
    () => (
      <Box>
        {/* 轴选择器 */}
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            轴选择
          </Typography>
          <Paper sx={{ p: 2 }} elevation={2}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>选择极坐标轴</InputLabel>
              <Select
                value={currentPolarIndex}
                onChange={(e) => setCurrentPolarIndex(Number(e.target.value))}
                label={`选择极坐标轴`}
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
                {Array.from(
                  { length: getAvailablePolarsCount() },
                  (_, index) => (
                    <MenuItem key={index} value={index}>
                      极坐标轴 {index + 1}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Paper>
        </Box>
        <Stack direction="column" spacing={2} sx={{ p: 1 }}>
          <Typography variant="subtitle2">位置和尺寸</Typography>
          <Paper sx={{ p: 2 }} elevation={2}>
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
                        updatePolarAxis("center", [
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
                        updatePolarAxis("center", [
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
                          updatePolarAxis("radius", [
                            innerValue,
                            safeValue.radius[1] || "75%",
                          ]);
                        } else {
                          // 当radius为单个值时，将其作为外半径，内半径设为0
                          updatePolarAxis("radius", [
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
                          updatePolarAxis("radius", [
                            safeValue.radius[0] || 0,
                            outerValue,
                          ]);
                        } else {
                          // 当radius为单个值时，将其作为外半径，内半径设为0
                          updatePolarAxis("radius", [0, outerValue]);
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
            </Grid>
          </Paper>
        </Stack>
      </Box>
    ),
    [safeValue, updatePolarAxis, currentPolarIndex, getAvailablePolarsCount]
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {label}配置
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {polarContent}
    </Paper>
  );
};

export const AngleAxisOptions = () => {
  return <PolarAxis axisType="angleAxis" axisIndex={0} label="角度轴" />;
};

export const RadiusAxisOptions = () => {
  return <PolarAxis axisType="radiusAxis" axisIndex={0} label="半径轴" />;
};
