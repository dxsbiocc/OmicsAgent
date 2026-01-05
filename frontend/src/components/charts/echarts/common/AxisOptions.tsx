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
  InputAdornment,
  FormControlLabel,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  RestartAlt as RestartAltIcon,
  Update as UpdateIcon,
} from "@mui/icons-material";
import { TextStyle, ColorPicker, LineStyle } from "../common";
import { useChartStore } from "@/stores/chartStore";
import ItemStyle from "./ItemStyle";

// 坐标轴配置组件
interface AxisOptionsProps {
  axisType: "xAxis" | "yAxis";
  axisIndex?: number;
  label?: string;
}

const AxisOptions: React.FC<AxisOptionsProps> = ({
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
      show: axisOption?.show !== false,
      type: axisOption?.type || "category",
      position:
        axisOption?.position || (axisType === "xAxis" ? "bottom" : "left"),
      name: axisOption?.name || "",
      nameLocation: axisOption?.nameLocation || "middle",
      nameGap: axisOption?.nameGap ?? 15,
      nameRotate: axisOption?.nameRotate ?? 0,
      nameTextStyle: axisOption?.nameTextStyle || {},

      inverse: axisOption?.inverse ?? false,
      scale: (axisOption as any)?.scale ?? false,
      splitNumber: (axisOption as any)?.splitNumber ?? 5,

      startValue: axisOption?.startValue ?? undefined,
      min: axisOption?.min ?? undefined,
      max: axisOption?.max ?? undefined,

      interval: (axisOption as any)?.interval ?? undefined,
      minInterval: (axisOption as any)?.minInterval ?? undefined,
      maxInterval: (axisOption as any)?.maxInterval ?? undefined,
      // scatter
      jitter: axisOption?.jitter ?? 0,
      jitterOverlap: axisOption?.jitterOverlap ?? true,
      jitterMargin: axisOption?.jitterMargin ?? 2,
      // 断轴
      breaks: axisOption?.breaks ?? [],
      breakArea: axisOption?.breakArea ?? {},
      breakLabelLayout: axisOption?.breakLabelLayout ?? {
        moveOverlap: "auto",
      },

      axisLine: {
        show: axisOption?.axisLine?.show !== false,
        lineStyle: {
          color: (axisOption?.axisLine?.lineStyle?.color as string) ?? "#333",
          width: axisOption?.axisLine?.lineStyle?.width ?? 1,
          type: (axisOption?.axisLine?.lineStyle?.type as any) || "solid",
          dashOffset: axisOption?.axisLine?.lineStyle?.dashOffset ?? 0,
          opacity: axisOption?.axisLine?.lineStyle?.opacity ?? 1,
          shadowBlur: axisOption?.axisLine?.lineStyle?.shadowBlur ?? 0,
          shadowColor:
            (axisOption?.axisLine?.lineStyle?.shadowColor as string) ??
            undefined,
          shadowOffsetX: axisOption?.axisLine?.lineStyle?.shadowOffsetX ?? 0,
          shadowOffsetY: axisOption?.axisLine?.lineStyle?.shadowOffsetY ?? 0,
          cap: axisOption?.axisLine?.lineStyle?.cap || "butt",
          join: axisOption?.axisLine?.lineStyle?.join || "miter",
          miterLimit: axisOption?.axisLine?.lineStyle?.miterLimit ?? 10,
        },
        symbol: axisOption?.axisLine?.symbol || "none",
        symbolSize: axisOption?.axisLine?.symbolSize ?? [8, 8],
        symbolOffset: axisOption?.axisLine?.symbolOffset ?? [0, 0],
      },
      axisTick: {
        show: axisOption?.axisTick?.show !== false,
        length: axisOption?.axisTick?.length ?? 5,
        inside: axisOption?.axisTick?.inside ?? false,
        customValues: axisOption?.axisTick?.customValues ?? "",
        lineStyle: {
          color: (axisOption?.axisTick?.lineStyle?.color as string) ?? "#333",
          width: axisOption?.axisTick?.lineStyle?.width ?? 1,
          type: (axisOption?.axisTick?.lineStyle?.type as any) || "solid",
          dashOffset: axisOption?.axisTick?.lineStyle?.dashOffset ?? 0,
          opacity: axisOption?.axisTick?.lineStyle?.opacity ?? 1,
          shadowBlur: axisOption?.axisTick?.lineStyle?.shadowBlur ?? 0,
          shadowColor:
            (axisOption?.axisTick?.lineStyle?.shadowColor as string) ??
            undefined,
          shadowOffsetX: axisOption?.axisTick?.lineStyle?.shadowOffsetX ?? 0,
          shadowOffsetY: axisOption?.axisTick?.lineStyle?.shadowOffsetY ?? 0,
          cap: axisOption?.axisTick?.lineStyle?.cap || "butt",
          join: axisOption?.axisTick?.lineStyle?.join || "miter",
          miterLimit: axisOption?.axisTick?.lineStyle?.miterLimit ?? 10,
        },
      },
      axisLabel: {
        show: axisOption?.axisLabel?.show,
        rotate: axisOption?.axisLabel?.rotate ?? 0,
        formatter: axisOption?.axisLabel?.formatter,
        inside: axisOption?.axisLabel?.inside ?? false,
        margin: axisOption?.axisLabel?.margin,
        interval: axisOption?.axisLabel?.interval ?? "auto",
        customValues: axisOption?.axisLabel?.customValues ?? "",
        color: axisOption?.axisLabel?.color || "#333",
        fontFamily: axisOption?.axisLabel?.fontFamily || "sans-serif",
        fontSize: axisOption?.axisLabel?.fontSize || 12,
        fontWeight: axisOption?.axisLabel?.fontWeight || "normal",
        fontStyle: axisOption?.axisLabel?.fontStyle || "normal",
        align: axisOption?.axisLabel?.align || "auto",
        verticalAlign: axisOption?.axisLabel?.verticalAlign || "auto",
        lineHeight: axisOption?.axisLabel?.lineHeight,
        overflow: axisOption?.axisLabel?.overflow || "none",
      },
      splitLine: {
        show: axisOption?.splitLine?.show !== false,
        lineStyle: {
          color:
            (axisOption?.splitLine?.lineStyle?.color as string) ?? undefined,
          width: axisOption?.splitLine?.lineStyle?.width ?? 1,
          type: axisOption?.splitLine?.lineStyle?.type || "solid",
          dashOffset: axisOption?.splitLine?.lineStyle?.dashOffset ?? 0,
          opacity: axisOption?.splitLine?.lineStyle?.opacity ?? 1,
          shadowBlur: axisOption?.splitLine?.lineStyle?.shadowBlur ?? 0,
          shadowColor:
            axisOption?.splitLine?.lineStyle?.shadowColor ?? undefined,
          shadowOffsetX: axisOption?.splitLine?.lineStyle?.shadowOffsetX ?? 0,
          shadowOffsetY: axisOption?.splitLine?.lineStyle?.shadowOffsetY ?? 0,
          cap: axisOption?.splitLine?.lineStyle?.cap || "butt",
          join: axisOption?.splitLine?.lineStyle?.join || "miter",
          miterLimit: axisOption?.splitLine?.lineStyle?.miterLimit ?? 10,
        },
      },
      splitArea: {
        show: axisOption?.splitArea?.show ?? false,
        areaStyle: {
          // ECharts 支持传入字符串或字符串数组，这里统一规范为字符串数组
          color: Array.isArray(axisOption?.splitArea?.areaStyle?.color)
            ? (axisOption?.splitArea?.areaStyle?.color as string[])
            : axisOption?.splitArea?.areaStyle?.color
            ? [axisOption?.splitArea?.areaStyle?.color as string]
            : ["rgba(250,250,250,0.3)"],
          opacity: axisOption?.splitArea?.areaStyle?.opacity ?? 1,
          shadowColor:
            axisOption?.splitArea?.areaStyle?.shadowColor ?? undefined,
        },
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

  // 本地 breaks JSON 文本与校验状态
  const [breaksJsonText, setBreaksJsonText] = useState("[]");
  const [isBreaksJsonValid, setIsBreaksJsonValid] = useState(true);

  // Snackbar 状态
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  // 获取当前已定义的视觉映射信息
  const breaksJsonInfo = useMemo(() => {
    const breaks = safeValue.breaks;

    if (!breaks) {
      return "[]";
    }

    try {
      // 将 visualMap 转换为格式化的 JSON 字符串
      return JSON.stringify(breaks, null, 2);
    } catch (error) {
      console.error("Error formatting visualMap:", error);
      return "[]";
    }
  }, [safeValue.breaks]);

  // 只在组件初始化时同步 breaksJsonInfo 到 jsonText
  useEffect(() => {
    setBreaksJsonText(breaksJsonInfo);
  }, [breaksJsonInfo]); // 空依赖数组，只在组件挂载时执行一次

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // 关闭 Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const validateBreaksJson = (text: string) => {
    const allowedKeys = new Set(["start", "end", "gap", "isExpanded"]);
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        return { ok: false, error: "必须是对象数组" };
      }
      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        if (typeof item !== "object" || item === null || Array.isArray(item)) {
          return { ok: false, error: `第 ${i + 1} 项必须是对象` };
        }
        const keys = Object.keys(item);
        if (keys.length === 0) {
          return { ok: false, error: `第 ${i + 1} 项不能为空对象` };
        }
        for (const k of keys) {
          if (!allowedKeys.has(k)) {
            return {
              ok: false,
              error: `第 ${
                i + 1
              } 项包含非法键: ${k}，仅允许 start,end,gap,isExpanded`,
            };
          }
        }
        if (
          item.isExpanded !== undefined &&
          typeof item.isExpanded !== "boolean"
        ) {
          return { ok: false, error: `第 ${i + 1} 项 isExpanded 必须为布尔值` };
        }
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "JSON 解析失败" };
    }
  };

  const handleBreaksJsonChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newText = event.target.value;
    setBreaksJsonText(newText);
    setIsBreaksJsonValid(validateBreaksJson(newText).ok);
  };

  const handleUpdateBreaks = () => {
    // 先移除焦点，避免 aria-hidden 警告
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (!isBreaksJsonValid) {
      showSnackbar("JSON 格式不正确，请检查语法");
      return;
    }

    try {
      const parsed = JSON.parse(breaksJsonText);
      updateAxis("breaks", parsed as any);

      // 重新格式化 JSON 文本
      const formattedJson = JSON.stringify(parsed, null, 2);
      setBreaksJsonText(formattedJson);

      showSnackbar("断轴配置已更新");
    } catch (error) {
      console.error("Error updating breaks:", error);
      showSnackbar("更新失败，请检查 JSON 格式");
    }
  };

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
              <InputLabel>选择{axisType === "xAxis" ? "X" : "Y"}轴</InputLabel>
              <Select
                value={currentAxisIndex}
                onChange={(e) => setCurrentAxisIndex(Number(e.target.value))}
                label={`选择${axisType === "xAxis" ? "X" : "Y"}轴`}
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
                    {axisType === "xAxis" ? "X" : "Y"}轴 {index + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Box>

        {/* 显示坐标轴 */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            显示坐标轴
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={safeValue.show}
                onChange={(e) => updateAxis("show", e.target.checked)}
              />
            }
            label="显示坐标轴"
          />
        </Box>

        {/* 只有当显示坐标轴时才渲染坐标轴相关组件 */}
        {safeValue.show && (
          <>
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                基本设置
              </Typography>
              <Paper sx={{ p: 2 }} elevation={2}>
                {/* 坐标轴名称和旋转角度 */}
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="轴标签"
                    value={safeValue.name}
                    onChange={(e) => updateAxis("name", e.target.value)}
                    placeholder="输入坐标轴名称"
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
                  <TextField
                    fullWidth
                    size="small"
                    label="旋转角度"
                    type="number"
                    value={safeValue.nameRotate}
                    onChange={(e) =>
                      updateAxis("nameRotate", parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
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
                {/* 坐标轴类型和位置 */}
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel>位置</InputLabel>
                    {(() => {
                      const isX = axisType === "xAxis";
                      const allowedPositions = isX
                        ? ["top", "bottom"]
                        : ["left", "right"];
                      const current = allowedPositions.includes(
                        safeValue.position
                      )
                        ? safeValue.position
                        : allowedPositions[0];
                      return (
                        <Select
                          value={current}
                          onChange={(e) =>
                            updateAxis("position", e.target.value)
                          }
                          label="位置"
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
                          {allowedPositions.map((pos) => (
                            <MenuItem key={pos} value={pos}>
                              {pos === "top" && "顶部"}
                              {pos === "bottom" && "底部"}
                              {pos === "left" && "左侧"}
                              {pos === "right" && "右侧"}
                            </MenuItem>
                          ))}
                        </Select>
                      );
                    })()}
                  </FormControl>

                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel>轴标签位置</InputLabel>
                    <Select
                      value={safeValue.nameLocation}
                      onChange={(e) =>
                        updateAxis("nameLocation", e.target.value)
                      }
                      label="轴标签位置"
                      sx={{
                        "& .MuiSelect-select": {
                          fontSize: "0.875rem",
                        },
                      }}
                    >
                      <MenuItem value="start">开始</MenuItem>
                      <MenuItem value="middle">中间</MenuItem>
                      <MenuItem value="end">结束</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    size="small"
                    label="轴标签间距"
                    type="number"
                    value={safeValue.nameGap}
                    onChange={(e) =>
                      updateAxis("nameGap", parseInt(e.target.value) || 15)
                    }
                  />
                </Stack>
                {/* 抖动 */}
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="抖动"
                    type="number"
                    value={safeValue.jitter}
                    onChange={(e) =>
                      updateAxis("jitter", parseInt(e.target.value) || 0)
                    }
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">px</InputAdornment>
                        ),
                      },
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={safeValue.jitterOverlap}
                        onChange={(e) =>
                          updateAxis("jitterOverlap", e.target.checked)
                        }
                      />
                    }
                    label="抖动重叠"
                    sx={{
                      width: "100%",
                    }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="抖动间距"
                    type="number"
                    value={safeValue.jitterMargin}
                    onChange={(e) =>
                      updateAxis("jitterMargin", parseInt(e.target.value) || 2)
                    }
                  />
                </Stack>
                {/* 间距 */}
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="坐标轴分割间隔"
                    type="number"
                    value={safeValue.interval}
                    onChange={(e) =>
                      updateAxis("interval", parseInt(e.target.value) || 0)
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="最小间距"
                    type="number"
                    value={safeValue.minInterval}
                    onChange={(e) =>
                      updateAxis("minInterval", parseInt(e.target.value) || 0)
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="最大间距"
                    type="number"
                    value={safeValue.maxInterval}
                    onChange={(e) =>
                      updateAxis("maxInterval", parseInt(e.target.value) || 0)
                    }
                  />
                </Stack>
                {/*  */}
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="起始值"
                    type="number"
                    value={safeValue.startValue}
                    onChange={(e) =>
                      updateAxis("startValue", parseInt(e.target.value) || "")
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="最小刻度值"
                    type="number"
                    value={safeValue.min}
                    onChange={(e) =>
                      updateAxis("min", parseInt(e.target.value) || "")
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="最大刻度值"
                    type="number"
                    value={safeValue.max}
                    onChange={(e) =>
                      updateAxis("max", parseInt(e.target.value) || "")
                    }
                  />
                </Stack>

                {/*  */}
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
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
                    sx={{
                      width: "100%",
                    }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={safeValue.scale}
                        onChange={(e) => updateAxis("scale", e.target.checked)}
                      />
                    }
                    label="不强制 0"
                    sx={{
                      width: "100%",
                    }}
                  />

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
                </Stack>
              </Paper>
            </Box>
            {/* 名称文本样式 */}
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                轴标签样式
              </Typography>
              <TextStyle
                value={{
                  color: safeValue.nameTextStyle.color,
                  fontFamily: safeValue.nameTextStyle.fontFamily,
                  fontSize:
                    typeof safeValue.nameTextStyle.fontSize === "string"
                      ? parseInt(safeValue.nameTextStyle.fontSize) || 12
                      : safeValue.nameTextStyle.fontSize || 12,
                  fontWeight: safeValue.nameTextStyle.fontWeight,
                  fontStyle: safeValue.nameTextStyle.fontStyle,
                  textAlign: safeValue.nameTextStyle.align,
                  textVerticalAlign: safeValue.nameTextStyle.verticalAlign,
                  lineHeight: safeValue.nameTextStyle.lineHeight,
                  overflow: safeValue.nameTextStyle.overflow,
                }}
                onChange={(textStyle) => updateAxis("nameTextStyle", textStyle)}
              />
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
                  value={safeValue.axisLine.lineStyle}
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
              <Typography variant="subtitle2">刻度设置</Typography>
              <Switch
                checked={safeValue.axisTick.show}
                onChange={(e) =>
                  updateNestedAxis("axisTick", "show", e.target.checked)
                }
              />
              <Typography variant="body2" sx={{ display: "inline" }}>
                显示刻度
              </Typography>
            </Box>

            {safeValue.axisTick.show && (
              <Box>
                {/* 刻度参数配置 */}
                <Box sx={{ p: 1 }}>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    刻度样式
                  </Typography>
                  <Grid container spacing={2}>
                    {/* 刻度长度 */}
                    <Grid size={{ xs: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="刻度长度"
                        type="number"
                        value={safeValue.axisTick.length}
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
                    value={safeValue.axisTick.lineStyle}
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
              <Switch
                checked={safeValue.axisLabel.show != false}
                onChange={(e) =>
                  updateNestedAxis("axisLabel", "show", e.target.checked)
                }
              />
              <Typography variant="body2" sx={{ ml: 1, display: "inline" }}>
                显示刻度标签
              </Typography>
            </Box>

            {safeValue.axisLabel.show != false && (
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
                      textVerticalAlign: safeValue.axisLabel
                        .verticalAlign as any,
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

            {/* 断轴设置 */}
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                断轴设置
              </Typography>

              <Paper sx={{ p: 2 }} elevation={2}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    断轴配置 (breaks)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={10}
                    value={breaksJsonText}
                    onChange={handleBreaksJsonChange}
                    label="断轴配置 (breaks)"
                    error={!isBreaksJsonValid}
                    helperText={
                      isBreaksJsonValid
                        ? "JSON 格式正确"
                        : "JSON 格式错误，请检查语法"
                    }
                    sx={{
                      "& .MuiInputBase-input": {
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                        color: isBreaksJsonValid
                          ? "text.primary"
                          : "error.main",
                        lineHeight: 1.4,
                      },
                    }}
                  />
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        // 先移除焦点，避免 aria-hidden 警告
                        if (document.activeElement instanceof HTMLElement) {
                          document.activeElement.blur();
                        }
                        setBreaksJsonText(breaksJsonInfo);
                        setIsBreaksJsonValid(true);
                      }}
                      disabled={breaksJsonText === breaksJsonInfo}
                      startIcon={<RestartAltIcon />}
                    >
                      重置
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleUpdateBreaks}
                      disabled={
                        !isBreaksJsonValid || breaksJsonText === breaksJsonInfo
                      }
                      startIcon={<UpdateIcon />}
                    >
                      应用
                    </Button>
                  </Stack>
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={(safeValue.breakArea as any)?.show ?? false}
                      onChange={(e) =>
                        updateNestedAxis("breakArea", "show", e.target.checked)
                      }
                    />
                  }
                  label="显示断轴区域"
                />
                {(safeValue.breakArea as any)?.show && (
                  <Stack direction="column" spacing={2}>
                    <ItemStyle
                      value={(safeValue.breakArea as any)?.itemStyle ?? {}}
                      onChange={(itemStyle) =>
                        updateNestedAxis("breakArea", "itemStyle", itemStyle)
                      }
                      label=""
                    />

                    {/* 锯齿 */}
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="锯齿振幅"
                        type="number"
                        value={
                          (safeValue.breakArea as any)?.zigzagAmplitude ?? 4
                        }
                        onChange={(e) =>
                          updateNestedAxis(
                            "breakArea",
                            "zigzagAmplitude",
                            parseInt(e.target.value) || 4
                          )
                        }
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="锯齿最小跨度"
                        type="number"
                        value={(safeValue.breakArea as any)?.zigzagMinSpan ?? 4}
                        onChange={(e) =>
                          updateNestedAxis(
                            "breakArea",
                            "zigzagMinSpan",
                            parseInt(e.target.value) || 4
                          )
                        }
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="锯齿最大跨度"
                        type="number"
                        value={
                          (safeValue.breakArea as any)?.zigzagMaxSpan ?? 20
                        }
                        onChange={(e) =>
                          updateNestedAxis(
                            "breakArea",
                            "zigzagMaxSpan",
                            parseInt(e.target.value) || 20
                          )
                        }
                      />

                      <TextField
                        fullWidth
                        size="small"
                        label="锯齿 Z 值"
                        type="number"
                        value={(safeValue.breakArea as any)?.zigzagZ ?? 4}
                        onChange={(e) =>
                          updateNestedAxis(
                            "breakArea",
                            "zigzagZ",
                            parseInt(e.target.value) || 4
                          )
                        }
                      />
                    </Stack>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={
                            (safeValue.breakArea as any)?.expandOnClick ?? true
                          }
                          onChange={(e) =>
                            updateNestedAxis(
                              "breakArea",
                              "expandOnClick",
                              e.target.checked
                            )
                          }
                        />
                      }
                      label="点击断轴截断区域是否展开截断区域"
                    />

                    <Box sx={{ mt: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>moveOverlap</InputLabel>
                        <Select
                          value={
                            typeof safeValue.breakLabelLayout.moveOverlap ===
                            "boolean"
                              ? safeValue.breakLabelLayout.moveOverlap.toString()
                              : safeValue.breakLabelLayout.moveOverlap
                          }
                          onChange={(e) => {
                            let value: string | boolean = e.target.value;
                            if (value === "true") {
                              value = true;
                            } else if (value === "false") {
                              value = false;
                            }
                            updateNestedAxis(
                              "breakLabelLayout",
                              "moveOverlap",
                              value
                            );
                          }}
                          label="moveOverlap"
                        >
                          <MenuItem value="auto">auto - 自动处理</MenuItem>
                          <MenuItem value="true">true - 允许重叠</MenuItem>
                          <MenuItem value="false">false - 避免重叠</MenuItem>
                        </Select>
                      </FormControl>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: "block" }}
                      >
                        控制断轴标签是否允许重叠显示
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </Paper>
            </Box>
            <Divider />

            {/* 分割线设置 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                分割线设置
              </Typography>
              <Switch
                checked={safeValue.splitLine.show}
                onChange={(e) =>
                  updateNestedAxis("splitLine", "show", e.target.checked)
                }
              />
              <Typography variant="body2" sx={{ ml: 1, display: "inline" }}>
                显示分割线
              </Typography>
            </Box>

            {safeValue.splitLine.show && (
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
                      value={safeValue.splitArea.areaStyle.color as string[]}
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
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    {/* 透明度输入框 */}
                    <FormControl fullWidth size="small" variant="outlined">
                      <TextField
                        value={(safeValue.splitArea.areaStyle as any).opacity}
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
                      value={(safeValue.splitArea.areaStyle as any).opacity}
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
                          safeValue.splitArea.areaStyle.shadowColor as string
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
                            (safeValue.splitArea.areaStyle as any).shadowBlur
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
                            (safeValue.splitArea.areaStyle as any).shadowOffsetX
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
                            (safeValue.splitArea.areaStyle as any).shadowOffsetY
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
        )}

        {/* Snackbar 提示 */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={
              snackbarMessage.includes("失败") ||
              snackbarMessage.includes("错误")
                ? "error"
                : "success"
            }
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Stack>
    ),
    [
      safeValue,
      updateAxis,
      updateNestedAxis,
      updateNestedNestedAxis,
      updateLineStyle,
      breaksJsonText,
      isBreaksJsonValid,
      snackbarOpen,
      snackbarMessage,
      currentAxisIndex,
      getAvailableAxesCount,
      axisType,
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

export default AxisOptions;
