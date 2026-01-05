import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  TextField,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import {
  RestartAlt as RestartAltIcon,
  Update as UpdateIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import {
  ContinousVisualMapComponentOption,
  PiecewiseVisualMapComponentOption,
} from "echarts";
import TextStyle from "./TextStyle";
import ColorPicker from "@/components/common/ColorPicker";
import { useChartStore } from "@/stores/chartStore";
import { deepFilterUndefined } from "../utils/validation";

interface RangeItemProps {
  symbol: any[];
  symbolSize: any[];
  color: any[];
  opacity: any[]; // 0-1
  // colorAlpha: number;  // 0-1
  colorLightness: any[]; // 0-1
  colorSaturation: any[]; // 0-1
  colorHue: any[]; // 0-360
}

interface RangeProps {
  range?: RangeItemProps;
  onChange: (value: RangeItemProps) => void;
}

const RangeComponent: React.FC<RangeProps> = ({ range, onChange }) => {
  const safeRange = useMemo(
    () => ({
      symbol: range?.symbol || [],
      symbolSize: range?.symbolSize || [],
      color: range?.color || [],
      opacity: range?.opacity || [],
      colorLightness: range?.colorLightness || [],
      colorSaturation: range?.colorSaturation || [],
      colorHue: range?.colorHue || [],
    }),
    [range]
  );

  // 本地状态管理输入值
  const [localValues, setLocalValues] = useState({
    symbolSize: "",
    opacity: "",
    colorHue: "",
    colorSaturation: "",
    colorLightness: "",
  });

  // 初始化本地状态
  useEffect(() => {
    setLocalValues({
      symbolSize: Array.isArray(safeRange.symbolSize)
        ? safeRange.symbolSize.join(", ")
        : (safeRange.symbolSize as any)?.toString() || "",
      opacity: Array.isArray(safeRange.opacity)
        ? safeRange.opacity.join(", ")
        : (safeRange.opacity as any)?.toString() || "",
      colorHue: Array.isArray(safeRange.colorHue)
        ? safeRange.colorHue.join(", ")
        : (safeRange.colorHue as any)?.toString() || "",
      colorSaturation: Array.isArray(safeRange.colorSaturation)
        ? safeRange.colorSaturation.join(", ")
        : (safeRange.colorSaturation as any)?.toString() || "",
      colorLightness: Array.isArray(safeRange.colorLightness)
        ? safeRange.colorLightness.join(", ")
        : (safeRange.colorLightness as any)?.toString() || "",
    });
  }, [safeRange]);

  const updateRange = useCallback(
    (key: string, newValue: any) => {
      onChange({ ...safeRange, [key]: newValue });
    },
    [safeRange, onChange]
  );

  const handleInputChange = useCallback((field: string, value: string) => {
    setLocalValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleInputBlur = useCallback(
    (field: string, value: string) => {
      if (!value.trim()) {
        updateRange(field, []);
        return;
      }
      const parts = value
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part);

      let nums: number[] = [];
      if (field === "symbolSize") {
        nums = parts
          .map((part) => parseFloat(part))
          .filter((num) => !isNaN(num));
      } else if (
        field === "opacity" ||
        field === "colorSaturation" ||
        field === "colorLightness"
      ) {
        nums = parts
          .map((part) => parseFloat(part))
          .filter((num) => !isNaN(num) && num >= 0 && num <= 1);
      } else if (field === "colorHue") {
        nums = parts
          .map((part) => parseFloat(part))
          .filter((num) => !isNaN(num) && num >= 0 && num <= 360);
      }

      updateRange(field, nums);
    },
    [updateRange]
  );

  return (
    <Stack direction="column" spacing={2}>
      {/* 符号配置 */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          符号配置
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>符号类型</InputLabel>
            <Select
              multiple
              value={safeRange.symbol || []}
              onChange={(e) => updateRange("symbol", e.target.value)}
              label="符号类型"
              renderValue={(selected) => (selected as string[]).join(", ")}
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

          <TextField
            label="符号大小"
            fullWidth
            value={localValues.symbolSize}
            onChange={(e) => handleInputChange("symbolSize", e.target.value)}
            onBlur={(e) => handleInputBlur("symbolSize", e.target.value)}
            placeholder="10,20,30 或单个数值"
            size="small"
          />
        </Stack>
      </Paper>

      {/* 颜色配置 */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          颜色配置
        </Typography>
        <Stack direction="column" spacing={2}>
          <ColorPicker
            value={safeRange.color}
            onChange={(colors) => updateRange("color", colors)}
            label="颜色"
          />

          <TextField
            label="透明度"
            fullWidth
            value={localValues.opacity}
            onChange={(e) => handleInputChange("opacity", e.target.value)}
            onBlur={(e) => handleInputBlur("opacity", e.target.value)}
            placeholder="0.5,0.8,1.0 (0-1)"
            size="small"
          />
        </Stack>
      </Paper>

      {/* HSL 颜色配置 */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          HSL 颜色配置
        </Typography>
        <Stack direction="column" spacing={2}>
          <TextField
            label="色相"
            fullWidth
            value={localValues.colorHue}
            onChange={(e) => handleInputChange("colorHue", e.target.value)}
            onBlur={(e) => handleInputBlur("colorHue", e.target.value)}
            placeholder="0,120,240 (0-360)"
            size="small"
          />

          <TextField
            label="饱和度"
            fullWidth
            value={localValues.colorSaturation}
            onChange={(e) =>
              handleInputChange("colorSaturation", e.target.value)
            }
            onBlur={(e) => handleInputBlur("colorSaturation", e.target.value)}
            placeholder="0.5,0.8,1.0 (0-1)"
            size="small"
          />

          <TextField
            label="亮度"
            fullWidth
            value={localValues.colorLightness}
            onChange={(e) =>
              handleInputChange("colorLightness", e.target.value)
            }
            onBlur={(e) => handleInputBlur("colorLightness", e.target.value)}
            placeholder="0.3,0.6,0.9 (0-1)"
            size="small"
          />
        </Stack>
      </Paper>
    </Stack>
  );
};

interface VisualMapContinuousProps {
  value?: ContinousVisualMapComponentOption;
  onChange?: (value: ContinousVisualMapComponentOption) => void;
  seriesIndex?: number;
}
const VisualMapContinuous: React.FC<VisualMapContinuousProps> = ({
  value,
  onChange,
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

  const safeValue = useMemo(() => {
    if (!value)
      return {
        type: "continuous", // 必须参数
        seriesIndex: seriesIndex, // 必须参数
      };
    return {
      type: "continuous", // 必须参数
      min: value?.min,
      max: value?.max,
      range: value?.range,
      unboundedRange: value?.unboundedRange,
      calculable: value?.calculable,
      realtime: value?.realtime,
      inverse: value?.inverse,
      precision: value?.precision,
      itemWidth: value?.itemWidth,
      itemHeight: value?.itemHeight,
      align: value?.align,
      text: value?.text,
      textGap: value?.textGap,
      show: value?.show,
      dimension: value?.dimension,
      seriesIndex: seriesIndex,
      inRange: value?.inRange,
      outOfRange: value?.outOfRange,
      controller: value?.controller,
      zlevel: value?.zlevel,
      z: value?.z,
      left: value?.left,
      top: value?.top,
      orient: value?.orient,
      padding: value?.padding,
      backgroundColor: value?.backgroundColor,
      borderColor: value?.borderColor,
      borderWidth: value?.borderWidth,
      textStyle: value?.textStyle,
      formatter: value?.formatter,
      handleIcon: value?.handleIcon,
    };
  }, [value, seriesIndex]);

  const updateContinuous = useCallback(
    (key: string, newValue: any) => {
      const updated = { ...safeValue, [key]: newValue };
      onChange?.(updated as ContinousVisualMapComponentOption);
    },
    [safeValue, onChange]
  );

  return (
    <Box>
      <Stack direction="column" spacing={2}>
        {/* 基本配置 */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            基本配置
          </Typography>

          {/* 选择当前要配置的系列 */}
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
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

            {/* 指定数据维度 */}
            <Tooltip
              title="数据维度索引，表示数据在哪个维度上进行映射，其中每个列是一个维度，从 0 开始计数，默认取最后一个维度"
              placement="top"
            >
              <TextField
                label="数据维度索引"
                type="number"
                fullWidth
                value={safeValue.dimension ?? ""}
                onChange={(e) =>
                  updateContinuous("dimension", parseInt(e.target.value) || 0)
                }
                size="small"
              />
            </Tooltip>
          </Stack>

          <Grid container spacing={2} sx={{ width: "100%" }}>
            <Grid size={3}>
              <TextField
                label="最小值"
                type="number"
                fullWidth
                value={safeValue.min ?? ""}
                onChange={(e) =>
                  updateContinuous("min", parseFloat(e.target.value) || 0)
                }
                size="small"
              />
            </Grid>
            <Grid size={3}>
              <TextField
                label="最大值"
                type="number"
                fullWidth
                value={safeValue.max ?? ""}
                onChange={(e) =>
                  updateContinuous("max", parseFloat(e.target.value) || 100)
                }
                size="small"
              />
            </Grid>
            <Grid size={3}>
              <TextField
                label="范围下限"
                type="number"
                fullWidth
                value={
                  Array.isArray(safeValue.range)
                    ? safeValue.range[0] ?? ""
                    : safeValue.min ?? ""
                }
                onChange={(e) => {
                  const lowerLimit = parseFloat(e.target.value) || 0;
                  const upperLimit = Array.isArray(safeValue.range)
                    ? safeValue.range[1] ?? 100
                    : safeValue.max ?? 100;
                  updateContinuous("range", [lowerLimit, upperLimit]);
                }}
                size="small"
              />
            </Grid>
            <Grid size={3}>
              <TextField
                label="范围上限"
                type="number"
                fullWidth
                value={
                  Array.isArray(safeValue.range)
                    ? safeValue.range[1] ?? ""
                    : safeValue.max ?? ""
                }
                onChange={(e) => {
                  const upperLimit = parseFloat(e.target.value) || 100;
                  const lowerLimit = Array.isArray(safeValue.range)
                    ? safeValue.range[0] ?? 0
                    : safeValue.min ?? 0;
                  updateContinuous("range", [lowerLimit, upperLimit]);
                }}
                size="small"
              />
            </Grid>
            <Grid size={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={safeValue.show ?? false}
                    onChange={(e) => updateContinuous("show", e.target.checked)}
                  />
                }
                label="显示组件"
              />
            </Grid>
            <Grid size={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={safeValue.calculable ?? false}
                    onChange={(e) =>
                      updateContinuous("calculable", e.target.checked)
                    }
                  />
                }
                label="显示拖拽手柄"
              />
            </Grid>
            <Grid size={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={safeValue.realtime ?? false}
                    onChange={(e) =>
                      updateContinuous("realtime", e.target.checked)
                    }
                  />
                }
                label="实时更新"
              />
            </Grid>
            <Grid size={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={safeValue.inverse ?? false}
                    onChange={(e) =>
                      updateContinuous("inverse", e.target.checked)
                    }
                  />
                }
                label="反向映射"
              />
            </Grid>
            <Grid size={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={safeValue.unboundedRange ?? false}
                    onChange={(e) =>
                      updateContinuous("unboundedRange", e.target.checked)
                    }
                  />
                }
                label="无界范围"
              />
            </Grid>
            <Grid size={4}>
              <TextField
                label="小数精度"
                type="number"
                fullWidth
                value={safeValue.precision ?? ""}
                onChange={(e) =>
                  updateContinuous("precision", parseFloat(e.target.value) || 2)
                }
                inputProps={{ min: 0, max: 10, step: 1 }}
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* 位置配置 */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            位置配置
          </Typography>
          <Stack direction="row" spacing={2} sx={{ my: 2 }}>
            <TextField
              label="图形宽度"
              type="number"
              fullWidth
              value={safeValue.itemWidth ?? ""}
              onChange={(e) =>
                updateContinuous("itemWidth", parseFloat(e.target.value) || 20)
              }
              inputProps={{ min: 0, max: 100, step: 1 }}
              size="small"
            />
            <TextField
              label="图形高度"
              type="number"
              fullWidth
              value={safeValue.itemHeight ?? ""}
              onChange={(e) =>
                updateContinuous(
                  "itemHeight",
                  parseFloat(e.target.value) || 140
                )
              }
              inputProps={{ min: 0, max: 100, step: 1 }}
              size="small"
            />
            <TextField
              label="Canvas 层级"
              type="number"
              fullWidth
              value={safeValue.zlevel ?? ""}
              onChange={(e) =>
                updateContinuous("zlevel", parseFloat(e.target.value) || 0)
              }
              inputProps={{ min: 0, max: 100, step: 1 }}
              size="small"
            />
            <TextField
              label="Z 轴层级"
              type="number"
              fullWidth
              value={safeValue.z ?? ""}
              onChange={(e) =>
                updateContinuous("z", parseFloat(e.target.value) || 0)
              }
              inputProps={{ min: 0, max: 100, step: 1 }}
              size="small"
            />
          </Stack>

          <Stack direction="row" spacing={2} sx={{ my: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>摆放位置</InputLabel>
              <Select
                value={safeValue.align || ""}
                onChange={(e) => updateContinuous("align", e.target.value)}
                label="摆放位置"
              >
                <MenuItem value="auto">自动</MenuItem>
                <MenuItem value="left">左</MenuItem>
                <MenuItem value="right">右</MenuItem>
                <MenuItem value="top">上</MenuItem>
                <MenuItem value="bottom">下</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="手柄形状"
              type="number"
              fullWidth
              value={safeValue.handleIcon ?? ""}
              onChange={(e) => updateContinuous("handleIcon", e.target.value)}
              inputProps={{ min: 0, max: 100, step: 1 }}
              size="small"
            />
            <TextField
              label="两端文本"
              type="number"
              fullWidth
              value={safeValue.text ?? ""}
              onChange={(e) => updateContinuous("text", e.target.value)}
              size="small"
            />
            <TextField
              label="文本间距"
              type="number"
              fullWidth
              value={safeValue.textGap ?? ""}
              onChange={(e) =>
                updateContinuous("textGap", parseFloat(e.target.value) || 10)
              }
              inputProps={{ min: 0, max: 100, step: 1 }}
              size="small"
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>左侧间距</InputLabel>
              <Select
                value={safeValue.left || ""}
                onChange={(e) => updateContinuous("left", e.target.value)}
                label="左侧间距"
              >
                <MenuItem value="left">左</MenuItem>
                <MenuItem value="center">中</MenuItem>
                <MenuItem value="right">右</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>顶部间距</InputLabel>
              <Select
                value={safeValue.top || ""}
                onChange={(e) => updateContinuous("top", e.target.value)}
                label="顶部间距"
              >
                <MenuItem value="top">上</MenuItem>
                <MenuItem value="middle">中</MenuItem>
                <MenuItem value="bottom">下</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>排列方向</InputLabel>
              <Select
                value={safeValue.orient || ""}
                onChange={(e) => updateContinuous("orient", e.target.value)}
                label="排列方向"
              >
                <MenuItem value="vertical">垂直</MenuItem>
                <MenuItem value="horizontal">水平</MenuItem>
              </Select>
            </FormControl>

            <Tooltip
              title="支持格式：单个数值(5)、两个数值(5,10)或四个数值(5,10,5,10)。四个数值分别表示上、右、下、左的内边距"
              placement="top"
            >
              <TextField
                label="内边距"
                fullWidth
                value={
                  Array.isArray(safeValue.padding)
                    ? safeValue.padding.join(", ")
                    : safeValue.padding?.toString() || ""
                }
                onChange={(e) => {
                  const inputValue = e.target.value.trim();
                  if (!inputValue) {
                    updateContinuous("padding", 5);
                    return;
                  }

                  // 尝试解析为数组
                  const parts = inputValue
                    .split(",")
                    .map((part) => part.trim())
                    .filter((part) => part);

                  if (parts.length === 1) {
                    // 单个数值
                    const num = parseFloat(parts[0]);
                    if (!isNaN(num)) {
                      updateContinuous("padding", num);
                    }
                  } else if (parts.length === 2) {
                    // 两个数值 [top/bottom, left/right]
                    const nums = parts.map((part) => parseFloat(part));
                    if (nums.every((num) => !isNaN(num))) {
                      updateContinuous("padding", nums);
                    }
                  } else if (parts.length === 4) {
                    // 四个数值 [top, right, bottom, left]
                    const nums = parts.map((part) => parseFloat(part));
                    if (nums.every((num) => !isNaN(num))) {
                      updateContinuous("padding", nums);
                    }
                  } else {
                    // 无效输入，保持原值
                    console.warn(
                      'Invalid padding format. Expected: number, "num1, num2", or "top, right, bottom, left"'
                    );
                  }
                }}
                placeholder="5 或 5,10 或 5,10,5,10"
                size="small"
              />
            </Tooltip>
          </Stack>
        </Paper>

        {/* 尺寸配置 */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            样式配置
          </Typography>
          <Stack direction="column" spacing={2} sx={{ my: 2 }}>
            <ColorPicker
              value={safeValue.backgroundColor as string}
              onChange={(color) => updateContinuous("backgroundColor", color)}
              label="背景颜色"
            />
            <ColorPicker
              value={safeValue.borderColor as string}
              onChange={(color) => updateContinuous("borderColor", color)}
              label="边框颜色"
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="边框宽度"
                type="number"
                fullWidth
                value={safeValue.borderWidth ?? ""}
                onChange={(e) =>
                  updateContinuous(
                    "borderWidth",
                    parseFloat(e.target.value) || 0
                  )
                }
                size="small"
              />
              <Tooltip
                title="支持字符串模板或函数。字符串模板使用 {value} 占位符，函数接收 value 参数并返回格式化后的字符串"
                placement="top"
              >
                <TextField
                  label="格式化文本"
                  fullWidth
                  multiline
                  rows={1}
                  value={
                    typeof safeValue.formatter === "function"
                      ? safeValue.formatter.toString()
                      : safeValue.formatter || ""
                  }
                  onChange={(e) => {
                    const inputValue = e.target.value.trim();
                    if (!inputValue) {
                      updateContinuous("formatter", undefined);
                      return;
                    }

                    // 尝试解析为函数
                    if (
                      inputValue.startsWith("function") ||
                      inputValue.includes("=>")
                    ) {
                      try {
                        // 如果是函数字符串，尝试转换为函数
                        const func = new Function("return " + inputValue)();
                        updateContinuous("formatter", func);
                      } catch (error) {
                        // 如果解析失败，作为字符串处理
                        updateContinuous("formatter", inputValue);
                      }
                    } else {
                      // 作为字符串处理
                      updateContinuous("formatter", inputValue);
                    }
                  }}
                  placeholder="字符串或函数"
                  size="small"
                />
              </Tooltip>
            </Stack>
            <TextStyle
              value={(safeValue.textStyle as any) || {}}
              onChange={(value) => updateContinuous("textStyle", value)}
              label="文本样式"
            />
          </Stack>
        </Paper>

        {/* 范围配置 */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            范围配置
          </Typography>
          <RangeComponent
            range={safeValue.inRange as any}
            onChange={(value) => updateContinuous("inRange", value)}
          />
        </Paper>

        {/* 超出范围配置 */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            超出范围配置
          </Typography>
          <RangeComponent
            range={safeValue.outOfRange as any}
            onChange={(value) => updateContinuous("outOfRange", value)}
          />
        </Paper>

        {/* controller */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Controller 配置
          </Typography>
          <Stack direction="column" spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={
                    safeValue.controller !== undefined &&
                    safeValue.controller.inRange !== undefined &&
                    safeValue.controller.outOfRange !== undefined
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      // 打开时初始化 controller 对象
                      updateContinuous("controller", {
                        inRange: {},
                        outOfRange: {},
                      });
                    } else {
                      // 关闭时清空 controller 对象
                      updateContinuous("controller", undefined);
                    }
                  }}
                  size="small"
                />
              }
              label="显示 Controller"
            />

            {safeValue.controller?.inRange !== undefined && (
              <RangeComponent
                range={safeValue.controller?.inRange as any}
                onChange={(value) =>
                  updateContinuous("controller", {
                    ...safeValue.controller,
                    inRange: value,
                  })
                }
              />
            )}
            {safeValue.controller?.outOfRange !== undefined && (
              <RangeComponent
                range={safeValue.controller?.outOfRange as any}
                onChange={(value) =>
                  updateContinuous("controller", {
                    ...safeValue.controller,
                    outOfRange: value,
                  })
                }
              />
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

interface VisualMapPiecewiseProps {
  value?: PiecewiseVisualMapComponentOption;
  onChange?: (value: PiecewiseVisualMapComponentOption) => void;
  seriesIndex?: number;
  showSnackbar?: (message: string) => void;
}

const VisualMapPiecewise: React.FC<VisualMapPiecewiseProps> = ({
  value,
  onChange,
  seriesIndex: initialSeriesIndex = 0,
  showSnackbar,
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

  // 安全获取值，提供默认值
  const safeValue = useMemo(() => {
    if (!value)
      return {
        type: "piecewise", // 必须参数
        seriesIndex: seriesIndex, // 必须参数
      };
    return {
      type: "piecewise", // 必须参数
      splitNumber: value?.splitNumber,
      pieces: value?.pieces,
      categories: value?.categories,
      min: value?.min,
      max: value?.max,
      minOpen: value?.minOpen,
      maxOpen: value?.maxOpen,
      selectedMode: value?.selectedMode,
      inverse: value?.inverse,
      precision: value?.precision,
      itemWidth: value?.itemWidth,
      itemHeight: value?.itemHeight,
      align: value?.align,
      text: value?.text,
      textGap: value?.textGap,
      showLabel: value?.showLabel,
      itemGap: value?.itemGap,
      itemSymbol: value?.itemSymbol,
      show: value?.show,
      dimension: value?.dimension,
      seriesIndex: seriesIndex,
      inRange: value?.inRange,
      outOfRange: value?.outOfRange,
      controller: value?.controller,
      zlevel: value?.zlevel,
      z: value?.z,
      left: value?.left,
      top: value?.top,
      right: value?.right,
      bottom: value?.bottom,
      orient: value?.orient,
      padding: value?.padding,
      backgroundColor: value?.backgroundColor,
      borderColor: value?.borderColor,
      borderWidth: value?.borderWidth,
      textStyle: value?.textStyle,
      formatter: value?.formatter,
    };
  }, [value, seriesIndex]);

  // 更新样式的回调函数
  const updatePiecewise = useCallback(
    (key: string, newValue: any) => {
      const updated = { ...safeValue, [key]: newValue };
      onChange?.(updated as PiecewiseVisualMapComponentOption);
    },
    [safeValue, onChange]
  );

  return (
    <Box>
      <Stack direction="column" spacing={2}>
        {/* 基本配置 */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            基本配置
          </Typography>

          {/* 选择当前要配置的系列 */}
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
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

            {/* 指定数据维度 */}
            <Tooltip
              title="数据维度索引，表示数据在哪个维度上进行映射，其中每个列是一个维度，从 0 开始计数，默认取最后一个维度"
              placement="top"
            >
              <TextField
                label="数据维度索引"
                type="number"
                fullWidth
                value={safeValue.dimension ?? ""}
                onChange={(e) =>
                  updatePiecewise("dimension", parseInt(e.target.value) || 0)
                }
                size="small"
              />
            </Tooltip>
          </Stack>

          <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                label="最小值"
                type="number"
                fullWidth
                value={safeValue.min ?? ""}
                onChange={(e) =>
                  updatePiecewise("min", parseFloat(e.target.value) || 100)
                }
                size="small"
              />

              <TextField
                label="最大值"
                type="number"
                fullWidth
                value={safeValue.max ?? ""}
                onChange={(e) =>
                  updatePiecewise("max", parseFloat(e.target.value) || 100)
                }
                size="small"
              />

              <Tooltip
                title="对于连续型数据，自动平均切分成几段。默认为5段。 连续数据的范围需要 max 和 min 来指定。如果设置了 pieces 或者 categories，则 splitNumber 无效。"
                placement="top"
              >
                <TextField
                  label="均分为几段"
                  type="number"
                  fullWidth
                  value={safeValue.splitNumber ?? ""}
                  onChange={(e) =>
                    updatePiecewise(
                      "splitNumber",
                      parseInt(e.target.value) || 0
                    )
                  }
                  size="small"
                />
              </Tooltip>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={safeValue.minOpen ?? false}
                    onChange={(e) =>
                      updatePiecewise("minOpen", e.target.checked)
                    }
                  />
                }
                label="最小值开区间"
                sx={{ width: "100%" }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={safeValue.maxOpen ?? false}
                    onChange={(e) =>
                      updatePiecewise("maxOpen", e.target.checked)
                    }
                  />
                }
                label="最大值开区间"
                sx={{ width: "100%" }}
              />

              <FormControl fullWidth size="small">
                <InputLabel>选择模式</InputLabel>
                <Select
                  value={
                    safeValue.selectedMode === true
                      ? "true"
                      : safeValue.selectedMode === false
                      ? "false"
                      : safeValue.selectedMode || "single"
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    // 如果是布尔值，转换为字符串；如果是字符串，保持原样
                    if (value === "true") {
                      updatePiecewise("selectedMode", true);
                    } else if (value === "false") {
                      updatePiecewise("selectedMode", false);
                    } else {
                      updatePiecewise("selectedMode", value);
                    }
                  }}
                  label="选择模式"
                >
                  <MenuItem value="single">单选</MenuItem>
                  <MenuItem value="multiple">多选</MenuItem>
                  <MenuItem value="true">启用 (单选)</MenuItem>
                  <MenuItem value="false">禁用</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </Paper>

        {/* 选择模式配置 */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            自定义分段
          </Typography>

          <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
            <Tooltip
              title={
                <Box
                  maxHeight="300px"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    whiteSpace: "pre-line",
                    color: "#ffffff",
                  }}
                >
                  <Box sx={{ fontWeight: "bold", mb: 1, color: "#f8f9fa" }}>
                    自定义分段配置 (pieces)
                  </Box>
                  <Box sx={{ mb: 1, color: "#e9ecef" }}>格式：JSON 数组</Box>
                  <Box sx={{ color: "#74c0fc", fontWeight: "500" }}>
                    基础用法：
                  </Box>
                  <Box sx={{ color: "#dee2e6" }}>
                    • {"{min: 1500}"} - 不指定 max，表示 max 为无限大
                  </Box>
                  <Box sx={{ color: "#dee2e6" }}>
                    • {"{min: 900, max: 1500}"} - 指定范围
                  </Box>
                  <Box sx={{ color: "#dee2e6" }}>
                    • {"{max: 5}"} - 不指定 min，表示 min 为无限小
                  </Box>
                  <Box sx={{ color: "#dee2e6" }}>
                    • {"{value: 123, color: 'grey'}"} - 指定具体值
                  </Box>
                  <Box sx={{ color: "#74c0fc", mt: 1, fontWeight: "500" }}>
                    高级用法：
                  </Box>
                  <Box sx={{ color: "#dee2e6" }}>
                    • {"{gt: 1500}"} - 大于 1500
                  </Box>
                  <Box sx={{ color: "#dee2e6" }}>
                    • {"{gt: 900, lte: 1500}"} - 大于 900 且小于等于 1500
                  </Box>
                  <Box sx={{ color: "#dee2e6" }}>• {"{lt: 5}"} - 小于 5</Box>
                  <Box sx={{ color: "#74c0fc", mt: 1, fontWeight: "500" }}>
                    支持的属性：
                  </Box>
                  <Box sx={{ color: "#dee2e6" }}>• symbol: 图元的图形类别</Box>
                  <Box sx={{ color: "#dee2e6" }}>• symbolSize: 图元的大小</Box>
                  <Box sx={{ color: "#dee2e6" }}>• color: 图元的颜色</Box>
                  <Box sx={{ color: "#dee2e6" }}>
                    • colorAlpha: 图元的颜色的透明度
                  </Box>
                  <Box sx={{ color: "#dee2e6" }}>
                    • opacity: 图元以及其附属物的透明度
                  </Box>
                  <Box sx={{ color: "#dee2e6" }}>
                    • colorLightness: 颜色的明暗度 (HSL)
                  </Box>
                  <Box sx={{ color: "#dee2e6" }}>
                    • colorSaturation: 颜色的饱和度 (HSL)
                  </Box>
                  <Box sx={{ color: "#dee2e6" }}>
                    • colorHue: 颜色的色调 (HSL)
                  </Box>
                  <Box sx={{ color: "#74c0fc", mt: 1, fontWeight: "500" }}>
                    示例：
                  </Box>
                  <Box
                    sx={{
                      color: "#ffd43b",
                      backgroundColor: "#495057",
                      p: 0.5,
                      borderRadius: 1,
                      fontFamily: "monospace",
                    }}
                  >
                    {
                      '[{"min": 0, "max": 50, "color": "red", "symbolSize": 10}, {"min": 50, "max": 100, "color": "blue", "opacity": 0.8}]'
                    }
                  </Box>
                </Box>
              }
              placement="top"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: "#212529",
                    border: "1px solid #495057",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    maxWidth: "400px",
                    maxHeight: "60vh",
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "#495057",
                      borderRadius: "3px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "#74c0fc",
                      borderRadius: "3px",
                      "&:hover": {
                        backgroundColor: "#339af0",
                      },
                    },
                  },
                },
                arrow: {
                  sx: {
                    color: "#212529",
                  },
                },
              }}
            >
              <TextField
                label="分段值 (pieces)"
                fullWidth
                multiline
                rows={3}
                value={
                  Array.isArray(safeValue.pieces)
                    ? JSON.stringify(safeValue.pieces, null, 2)
                    : safeValue.pieces || ""
                }
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (!inputValue) {
                    updatePiecewise("pieces", undefined);
                    return;
                  }

                  // 只更新值，不进行校验
                  updatePiecewise("pieces", inputValue);
                }}
                placeholder='[{"min": 0, "max": 50, "color": "red"}, {"min": 50, "max": 100, "color": "blue"}]'
                size="small"
              />
            </Tooltip>

            <Tooltip
              title={
                <Box
                  maxHeight="300px"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    whiteSpace: "pre-line",
                    color: "#ffffff",
                  }}
                >
                  <Box sx={{ fontWeight: "bold", mb: 1, color: "#f8f9fa" }}>
                    分类值配置 (categories)
                  </Box>
                  <Box sx={{ mb: 1, color: "#e9ecef" }}>
                    用于表示离散型数据的全集
                  </Box>
                  <Box sx={{ color: "#74c0fc", mb: 1, fontWeight: "500" }}>
                    格式：
                  </Box>
                  <Box sx={{ color: "#dee2e6" }}>
                    • 逗号分隔的字符串：类别1, 类别2, 类别3
                  </Box>
                  <Box sx={{ color: "#dee2e6" }}>
                    • 自动转换为数组：["类别1", "类别2", "类别3"]
                  </Box>
                  <Box sx={{ color: "#74c0fc", mt: 1, fontWeight: "500" }}>
                    示例：
                  </Box>
                  <Box sx={{ color: "#dee2e6" }}>
                    • 等级：优秀, 良好, 一般, 较差
                  </Box>
                  <Box sx={{ color: "#dee2e6" }}>• 类型：A类, B类, C类</Box>
                  <Box sx={{ color: "#dee2e6" }}>
                    • 状态：启用, 禁用, 待审核
                  </Box>
                </Box>
              }
              placement="top"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: "#212529",
                    border: "1px solid #495057",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    maxWidth: "400px",
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "#495057",
                      borderRadius: "3px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "#74c0fc",
                      borderRadius: "3px",
                      "&:hover": {
                        backgroundColor: "#339af0",
                      },
                    },
                  },
                },
                arrow: {
                  sx: {
                    color: "#212529",
                  },
                },
              }}
            >
              <TextField
                label="分类值 (categories)"
                fullWidth
                multiline
                rows={2}
                value={
                  Array.isArray(safeValue.categories)
                    ? safeValue.categories.join(", ")
                    : safeValue.categories || ""
                }
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (!inputValue) {
                    updatePiecewise("categories", undefined);
                    return;
                  }

                  // 只更新值，不进行校验
                  updatePiecewise("categories", inputValue);
                }}
                placeholder="类别1, 类别2, 类别3"
                size="small"
              />
            </Tooltip>
          </Stack>
        </Paper>

        {/* 位置配置 */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            位置配置
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="图形宽度"
              type="number"
              fullWidth
              value={safeValue.itemWidth ?? ""}
              onChange={(e) =>
                updatePiecewise("itemWidth", parseFloat(e.target.value) || 20)
              }
              inputProps={{ min: 0, max: 100, step: 1 }}
              size="small"
            />
            <TextField
              label="图形高度"
              type="number"
              fullWidth
              value={safeValue.itemHeight ?? ""}
              onChange={(e) =>
                updatePiecewise("itemHeight", parseFloat(e.target.value) || 140)
              }
              inputProps={{ min: 0, max: 100, step: 1 }}
              size="small"
            />
            <TextField
              label="Canvas 层级"
              type="number"
              fullWidth
              value={safeValue.zlevel ?? ""}
              onChange={(e) =>
                updatePiecewise("zlevel", parseFloat(e.target.value) || 0)
              }
              inputProps={{ min: 0, max: 100, step: 1 }}
              size="small"
            />
            <TextField
              label="Z 轴层级"
              type="number"
              fullWidth
              value={safeValue.z ?? ""}
              onChange={(e) =>
                updatePiecewise("z", parseFloat(e.target.value) || 0)
              }
              inputProps={{ min: 0, max: 100, step: 1 }}
              size="small"
            />
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>摆放位置</InputLabel>
              <Select
                value={safeValue.align || ""}
                onChange={(e) => updatePiecewise("align", e.target.value)}
                label="摆放位置"
              >
                <MenuItem value="auto">自动</MenuItem>
                <MenuItem value="left">左</MenuItem>
                <MenuItem value="right">右</MenuItem>
                <MenuItem value="top">上</MenuItem>
                <MenuItem value="bottom">下</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="两端文本"
              type="number"
              fullWidth
              value={safeValue.text ?? ""}
              onChange={(e) => updatePiecewise("text", e.target.value)}
              size="small"
            />
            <TextField
              label="文本间距"
              type="number"
              fullWidth
              value={safeValue.textGap ?? ""}
              onChange={(e) =>
                updatePiecewise("textGap", parseFloat(e.target.value) || 10)
              }
              inputProps={{ min: 0, max: 100, step: 1 }}
              size="small"
            />
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={safeValue.showLabel ?? false}
                  onChange={(e) =>
                    updatePiecewise("showLabel", e.target.checked)
                  }
                  size="small"
                />
              }
              label="显示标签"
              sx={{ width: "100%" }}
            />

            <TextField
              label="图元间距"
              type="number"
              fullWidth
              value={safeValue.itemGap ?? ""}
              onChange={(e) =>
                updatePiecewise("itemGap", parseFloat(e.target.value) || 0)
              }
              inputProps={{ min: 0, max: 100, step: 1 }}
              size="small"
            />

            <FormControl fullWidth size="small">
              <InputLabel>图元形状</InputLabel>
              <Select
                value={safeValue.itemSymbol || ""}
                onChange={(e) => updatePiecewise("itemSymbol", e.target.value)}
                label="图元形状"
              >
                <MenuItem value="circle">圆形</MenuItem>
                <MenuItem value="rect">矩形</MenuItem>
                <MenuItem value="roundRect">圆角矩形</MenuItem>
                <MenuItem value="triangle">三角形</MenuItem>
                <MenuItem value="diamond">菱形</MenuItem>
                <MenuItem value="pin">图钉</MenuItem>
                <MenuItem value="arrow">箭头</MenuItem>
                <MenuItem value="none">无</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>左侧间距</InputLabel>
              <Select
                value={safeValue.left || ""}
                onChange={(e) => updatePiecewise("left", e.target.value)}
                label="左侧间距"
              >
                <MenuItem value="left">左</MenuItem>
                <MenuItem value="center">中</MenuItem>
                <MenuItem value="right">右</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>顶部间距</InputLabel>
              <Select
                value={safeValue.top || ""}
                onChange={(e) => updatePiecewise("top", e.target.value)}
                label="顶部间距"
              >
                <MenuItem value="top">上</MenuItem>
                <MenuItem value="middle">中</MenuItem>
                <MenuItem value="bottom">下</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>排列方向</InputLabel>
              <Select
                value={safeValue.orient || ""}
                onChange={(e) => updatePiecewise("orient", e.target.value)}
                label="排列方向"
              >
                <MenuItem value="vertical">垂直</MenuItem>
                <MenuItem value="horizontal">水平</MenuItem>
              </Select>
            </FormControl>

            <Tooltip
              title="支持格式：单个数值(5)、两个数值(5,10)或四个数值(5,10,5,10)。四个数值分别表示上、右、下、左的内边距"
              placement="top"
            >
              <TextField
                label="内边距"
                fullWidth
                value={
                  Array.isArray(safeValue.padding)
                    ? safeValue.padding.join(", ")
                    : safeValue.padding?.toString() || ""
                }
                onChange={(e) => {
                  const inputValue = e.target.value.trim();
                  if (!inputValue) {
                    updatePiecewise("padding", 5);
                    return;
                  }

                  // 尝试解析为数组
                  const parts = inputValue
                    .split(",")
                    .map((part) => part.trim())
                    .filter((part) => part);

                  if (parts.length === 1) {
                    // 单个数值
                    const num = parseFloat(parts[0]);
                    if (!isNaN(num)) {
                      updatePiecewise("padding", num);
                    }
                  } else if (parts.length === 2) {
                    // 两个数值 [top/bottom, left/right]
                    const nums = parts.map((part) => parseFloat(part));
                    if (nums.every((num) => !isNaN(num))) {
                      updatePiecewise("padding", nums);
                    }
                  } else if (parts.length === 4) {
                    // 四个数值 [top, right, bottom, left]
                    const nums = parts.map((part) => parseFloat(part));
                    if (nums.every((num) => !isNaN(num))) {
                      updatePiecewise("padding", nums);
                    }
                  } else {
                    // 无效输入，保持原值
                    console.warn(
                      'Invalid padding format. Expected: number, "num1, num2", or "top, right, bottom, left"'
                    );
                  }
                }}
                placeholder="5 或 5,10 或 5,10,5,10"
                size="small"
              />
            </Tooltip>
          </Stack>
        </Paper>

        {/* 尺寸配置 */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            样式配置
          </Typography>
          <Stack direction="column" spacing={2} sx={{ my: 2 }}>
            <ColorPicker
              value={safeValue.backgroundColor as string}
              onChange={(color) => updatePiecewise("backgroundColor", color)}
              label="背景颜色"
            />
            <ColorPicker
              value={safeValue.borderColor as string}
              onChange={(color) => updatePiecewise("borderColor", color)}
              label="边框颜色"
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="边框宽度"
                type="number"
                fullWidth
                value={safeValue.borderWidth ?? ""}
                onChange={(e) =>
                  updatePiecewise(
                    "borderWidth",
                    parseFloat(e.target.value) || 0
                  )
                }
                size="small"
              />
              <Tooltip
                title="支持字符串模板或函数。字符串模板使用 {value} 占位符，函数接收 value 参数并返回格式化后的字符串"
                placement="top"
              >
                <TextField
                  label="格式化文本"
                  fullWidth
                  multiline
                  rows={1}
                  value={
                    typeof safeValue.formatter === "function"
                      ? safeValue.formatter.toString()
                      : safeValue.formatter || ""
                  }
                  onChange={(e) => {
                    const inputValue = e.target.value.trim();
                    if (!inputValue) {
                      updatePiecewise("formatter", undefined);
                      return;
                    }

                    // 尝试解析为函数
                    if (
                      inputValue.startsWith("function") ||
                      inputValue.includes("=>")
                    ) {
                      try {
                        // 如果是函数字符串，尝试转换为函数
                        const func = new Function("return " + inputValue)();
                        updatePiecewise("formatter", func);
                      } catch (error) {
                        // 如果解析失败，作为字符串处理
                        updatePiecewise("formatter", inputValue);
                      }
                    } else {
                      // 作为字符串处理
                      updatePiecewise("formatter", inputValue);
                    }
                  }}
                  placeholder="字符串或函数"
                  size="small"
                />
              </Tooltip>
            </Stack>
            <TextStyle
              value={(safeValue.textStyle as any) || {}}
              onChange={(value) => updatePiecewise("textStyle", value)}
              label="文本样式"
            />
          </Stack>
        </Paper>

        {/* 范围配置 */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            范围配置
          </Typography>
          <RangeComponent
            range={safeValue.inRange as any}
            onChange={(value) => updatePiecewise("inRange", value)}
          />
        </Paper>

        {/* 超出范围配置 */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            超出范围配置
          </Typography>
          <RangeComponent
            range={safeValue.outOfRange as any}
            onChange={(value) => updatePiecewise("outOfRange", value)}
          />
        </Paper>

        {/* controller */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Controller 配置
          </Typography>
          <Stack direction="column" spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={
                    safeValue.controller !== undefined &&
                    safeValue.controller.inRange !== undefined &&
                    safeValue.controller.outOfRange !== undefined
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      // 打开时初始化 controller 对象
                      updatePiecewise("controller", {
                        inRange: {},
                        outOfRange: {},
                      });
                    } else {
                      // 关闭时清空 controller 对象
                      updatePiecewise("controller", undefined);
                    }
                  }}
                  size="small"
                />
              }
              label="显示 Controller"
            />

            {safeValue.controller?.inRange !== undefined && (
              <RangeComponent
                range={safeValue.controller?.inRange as any}
                onChange={(value) =>
                  updatePiecewise("controller", {
                    ...safeValue.controller,
                    inRange: value,
                  })
                }
              />
            )}
            {safeValue.controller?.outOfRange !== undefined && (
              <RangeComponent
                range={safeValue.controller?.outOfRange as any}
                onChange={(value) =>
                  updatePiecewise("controller", {
                    ...safeValue.controller,
                    outOfRange: value,
                  })
                }
              />
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

const VisualMapOptions: React.FC = () => {
  const { chartOption, setChartOption } = useChartStore();
  const [continuousDialogOpen, setContinuousDialogOpen] = useState(false);
  const [piecewiseDialogOpen, setPiecewiseDialogOpen] = useState(false);

  // 本地状态管理
  const [continuous, setContinuous] =
    useState<ContinousVisualMapComponentOption>({});
  const [piecewise, setPiecewise] = useState<PiecewiseVisualMapComponentOption>(
    {}
  );

  // JSON 编辑状态
  const [jsonText, setJsonText] = useState("");
  const [isJsonValid, setIsJsonValid] = useState(true);

  // Snackbar 状态
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // 本地状态更新函数
  const handleContinuousChange = (value: ContinousVisualMapComponentOption) => {
    setContinuous(value);
  };

  const handlePiecewiseChange = (value: PiecewiseVisualMapComponentOption) => {
    setPiecewise(value);
  };

  // 清空表单状态
  const clearContinuousForm = () => {
    setContinuous({});
  };

  const clearPiecewiseForm = () => {
    setPiecewise({});
  };

  const handleContinuousDialogOpen = () => {
    setContinuousDialogOpen(true);
  };

  const handleContinuousDialogClose = () => {
    // 先移除焦点，避免 aria-hidden 警告
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setContinuousDialogOpen(false);
  };

  const handlePiecewiseDialogOpen = () => {
    setPiecewiseDialogOpen(true);
  };

  const handlePiecewiseDialogClose = () => {
    // 先移除焦点，避免 aria-hidden 警告
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setPiecewiseDialogOpen(false);
  };

  const handleAddContinuousVisualMap = (visualMap: any) => {
    const filteredVisualMap = deepFilterUndefined(visualMap);
    console.log("continuous visualMap", filteredVisualMap);

    setChartOption((draft) => {
      if (!draft) return;
      if (!draft.visualMap) {
        draft.visualMap = [];
      }
      if (Array.isArray(draft.visualMap)) {
        draft.visualMap.push(filteredVisualMap);
      }
    });
    showSnackbar("连续型 VisualMap 添加成功");
  };

  const handleAddPiecewiseVisualMap = (visualMap: any) => {
    // 校验 pieces JSON 格式
    if (visualMap.pieces && typeof visualMap.pieces === "string") {
      try {
        const parsedPieces = JSON.parse(visualMap.pieces);
        if (!Array.isArray(parsedPieces)) {
          showSnackbar("pieces 必须是数组格式");
          return;
        }
        visualMap.pieces = parsedPieces;
      } catch (error) {
        showSnackbar(
          `pieces JSON 格式错误: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        return;
      }
    }

    // 校验 categories 格式
    if (visualMap.categories && typeof visualMap.categories === "string") {
      const categories = visualMap.categories
        .split(",")
        .map((cat: string) => cat.trim())
        .filter((cat: string) => cat.length > 0);

      if (categories.length === 0) {
        showSnackbar("categories 不能为空");
        return;
      }
      visualMap.categories = categories;
    }

    const filteredVisualMap = deepFilterUndefined(visualMap);
    console.log("piecewise visualMap", filteredVisualMap);

    setChartOption((draft) => {
      if (!draft) return;
      if (!draft.visualMap) {
        draft.visualMap = [];
      }
      if (Array.isArray(draft.visualMap)) {
        draft.visualMap.push(filteredVisualMap);
      }
    });
    showSnackbar("分段型 VisualMap 添加成功");
  };

  // 获取当前已定义的视觉映射信息
  const visualMapInfo = useMemo(() => {
    const visualMap = chartOption?.visualMap;

    if (!visualMap) {
      return "[]";
    }

    try {
      // 将 visualMap 转换为格式化的 JSON 字符串
      return JSON.stringify(visualMap, null, 2);
    } catch (error) {
      console.error("Error formatting visualMap:", error);
      return "[]";
    }
  }, [chartOption?.visualMap]);

  // 同步 visualMapInfo 到 jsonText
  useEffect(() => {
    setJsonText(visualMapInfo);
  }, [visualMapInfo]);

  // 验证 JSON 格式
  const validateJson = (text: string): boolean => {
    try {
      const parsed = JSON.parse(text);
      // 检查是否是数组或单个对象
      if (
        Array.isArray(parsed) ||
        (typeof parsed === "object" && parsed !== null)
      ) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // 处理 JSON 文本变化
  const handleJsonTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newText = event.target.value;
    setJsonText(newText);
    setIsJsonValid(validateJson(newText));
  };

  // 显示 Snackbar
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // 关闭 Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // 更新 VisualMap 配置
  const handleUpdateVisualMap = () => {
    // 先移除焦点，避免 aria-hidden 警告
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (!isJsonValid) {
      showSnackbar("JSON 格式不正确，请检查语法");
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      setChartOption((draft) => {
        if (!draft) return;
        draft.visualMap = parsed;
      });
      showSnackbar("视觉映射配置已更新");
    } catch (error) {
      console.error("Error updating visualMap:", error);
      showSnackbar("更新失败，请检查 JSON 格式");
    }
  };

  return (
    <Paper sx={{ p: 2 }} elevation={2}>
      <Typography variant="h6" gutterBottom>
        视觉映射
      </Typography>
      <Divider />
      {/* 显示已定义的视觉映射信息 */}
      <Box sx={{ my: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={20}
          value={jsonText}
          onChange={handleJsonTextChange}
          label="映射配置 (JSON 对象数组格式)"
          error={!isJsonValid}
          helperText={
            isJsonValid ? "JSON 格式正确" : "JSON 格式错误，请检查语法"
          }
          sx={{
            "& .MuiInputBase-input": {
              fontSize: "0.75rem",
              fontFamily: "monospace",
              color: isJsonValid ? "text.primary" : "error.main",
              lineHeight: 1.4,
            },
          }}
        />
      </Box>

      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: "space-between" }}
      >
        <Stack direction="row" spacing={2}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleContinuousDialogOpen}
            size="medium"
            startIcon={<AddIcon />}
          >
            连续型映射
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handlePiecewiseDialogOpen}
            size="medium"
            startIcon={<AddIcon />}
          >
            分段型映射
          </Button>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={() => {
              // 先移除焦点，避免 aria-hidden 警告
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
              setJsonText(visualMapInfo);
              setIsJsonValid(true);
            }}
            disabled={jsonText === visualMapInfo}
            size="medium"
            startIcon={<RestartAltIcon />}
          >
            重置
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateVisualMap}
            disabled={!isJsonValid || jsonText === visualMapInfo}
            color="primary"
            size="medium"
            startIcon={<UpdateIcon />}
          >
            更新
          </Button>
        </Stack>
      </Stack>

      {/* 连续型视觉映射弹窗 */}
      <Dialog
        open={continuousDialogOpen}
        onClose={handleContinuousDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>连续型视觉映射配置</DialogTitle>
        <DialogContent>
          <VisualMapContinuous
            value={continuous}
            onChange={handleContinuousChange}
            seriesIndex={0}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
              requestAnimationFrame(() => {
                handleContinuousDialogClose();
              });
            }}
          >
            取消
          </Button>
          <Button
            onClick={() => {
              // 先移除焦点，避免 aria-hidden 警告
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }

              // 确认并添加到 visualMap 数组
              handleAddContinuousVisualMap(continuous);
              // 清空表单
              clearContinuousForm();

              // 使用 requestAnimationFrame 确保焦点完全移除后再关闭对话框
              requestAnimationFrame(() => {
                handleContinuousDialogClose();
              });
            }}
            variant="contained"
            color="primary"
          >
            确认添加
          </Button>
        </DialogActions>
      </Dialog>

      {/* 分段型视觉映射弹窗 */}
      <Dialog
        open={piecewiseDialogOpen}
        onClose={handlePiecewiseDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>分段型视觉映射配置</DialogTitle>
        <DialogContent>
          <VisualMapPiecewise
            value={piecewise}
            onChange={handlePiecewiseChange}
            seriesIndex={0}
            showSnackbar={showSnackbar}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
              requestAnimationFrame(() => {
                handlePiecewiseDialogClose();
              });
            }}
            variant="outlined"
          >
            取消
          </Button>
          <Button
            onClick={() => {
              // 先移除焦点，避免 aria-hidden 警告
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }

              // 确认并添加到 visualMap 数组
              handleAddPiecewiseVisualMap(piecewise);
              // 清空表单
              clearPiecewiseForm();

              // 使用 requestAnimationFrame 确保焦点完全移除后再关闭对话框
              requestAnimationFrame(() => {
                handlePiecewiseDialogClose();
              });
            }}
            variant="contained"
            color="primary"
          >
            确认添加
          </Button>
        </DialogActions>
      </Dialog>

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
            snackbarMessage.includes("失败") || snackbarMessage.includes("错误")
              ? "error"
              : "success"
          }
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default VisualMapOptions;
