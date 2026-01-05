import React, { useMemo, useCallback, useState } from "react";
import {
  Paper,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Switch,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { Add as AddIcon, Clear as ClearIcon } from "@mui/icons-material";
import ColorPicker from "@/components/common/ColorPicker";
import TextStyle from "./TextStyle";
import {
  MarkDataItem,
  validateMarkDataArray,
  validateDataItem,
} from "../utils/validation";

// 错误提示组件
interface ErrorSnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const ErrorSnackbar: React.FC<ErrorSnackbarProps> = ({
  open,
  message,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{ mb: 2, mr: 2 }}
    >
      <Alert onClose={onClose} severity="error" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

interface MarkPointProps {
  value?: MarkDataItem;
  onChange: (data: MarkDataItem) => void;
  label?: string;
  isLine?: boolean;
  isStraightLine?: boolean;
}

// 符号类型选项
const SYMBOL_OPTIONS = [
  { value: "circle", label: "圆形" },
  { value: "rect", label: "矩形" },
  { value: "roundRect", label: "圆角矩形" },
  { value: "triangle", label: "三角形" },
  { value: "diamond", label: "菱形" },
  { value: "pin", label: "大头针" },
  { value: "arrow", label: "箭头" },
  { value: "none", label: "无" },
];

// 边框类型选项
const BORDER_TYPE_OPTIONS = [
  { value: "solid", label: "实线" },
  { value: "dashed", label: "虚线" },
  { value: "dotted", label: "点线" },
];

const MarkPointData: React.FC<MarkPointProps> = ({
  value,
  onChange,
  label = "数据点配置",
  isLine = false,
  isStraightLine = false,
}) => {
  // 安全获取值，提供默认值
  const safeValue = useMemo((): MarkDataItem => {
    return {
      name: value?.name || "",
      type: value?.type || undefined,
      valueIndex: value?.valueIndex || undefined,
      coord: value?.coord || undefined,
      x: value?.x || undefined,
      y: value?.y || undefined,
      xAxis: value?.xAxis || undefined,
      yAxis: value?.yAxis || undefined,
      z2: value?.z2 || undefined,
      symbol: value?.symbol || undefined,
      symbolSize: value?.symbolSize || undefined,
      symbolRotate: value?.symbolRotate || undefined,
      symbolKeepAspect: value?.symbolKeepAspect || undefined,
      symbolOffset: value?.symbolOffset || undefined,
      itemStyle: value?.itemStyle || undefined,
      lineStyle: value?.lineStyle || undefined,
      label: value?.label || undefined,
    };
  }, [value]);

  // 更新数据的回调函数
  const updateData = useCallback(
    (key: string, newValue: any) => {
      // 只收集非空值
      const updated = { ...safeValue, [key]: newValue };

      // 过滤掉空值、undefined、空字符串等
      const filteredData: any = {};

      Object.keys(updated).forEach((k) => {
        const val = updated[k as keyof MarkDataItem];
        if (
          val !== undefined &&
          val !== null &&
          val !== "" &&
          !(Array.isArray(val) && val.length === 0) &&
          !(
            typeof val === "object" &&
            val !== null &&
            Object.keys(val).length === 0
          )
        ) {
          filteredData[k] = val;
        }
      });

      onChange(filteredData);
    },
    [safeValue, onChange]
  );

  // 更新 itemStyle 的回调函数
  const updateItemStyle = useCallback(
    (key: string, newValue: any) => {
      const updatedItemStyle = {
        ...(safeValue.itemStyle || {}),
        [key]: newValue,
      };

      // 过滤掉空值
      const filteredItemStyle: any = {};
      Object.keys(updatedItemStyle).forEach((k) => {
        const val = (updatedItemStyle as any)[k];
        if (
          val !== undefined &&
          val !== null &&
          val !== "" &&
          !(Array.isArray(val) && val.length === 0) &&
          !(
            typeof val === "object" &&
            val !== null &&
            Object.keys(val).length === 0
          )
        ) {
          filteredItemStyle[k] = val;
        }
      });

      // 只有当 filteredItemStyle 有内容时才设置 itemStyle
      if (Object.keys(filteredItemStyle).length > 0) {
        updateData("itemStyle", filteredItemStyle);
      } else {
        updateData("itemStyle", undefined);
      }
    },
    [safeValue.itemStyle, updateData]
  );

  return (
    <Box component="form" sx={{ width: "100%" }}>
      <Typography variant="h6" sx={{ mb: 3, textAlign: "center" }}>
        {label}
      </Typography>

      <Stack spacing={3}>
        {/* 基本信息 */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
            基本信息
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="名称"
              value={safeValue.name}
              onChange={(e) => updateData("name", e.target.value)}
              size="small"
            />

            <TextField
              label="Z2 层级"
              type="number"
              value={safeValue.z2 || ""}
              onChange={(e) =>
                updateData(
                  "z2",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              size="small"
            />
          </Stack>
        </Box>

        {/* 位置信息 */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              位置信息
            </Typography>
            <Tooltip
              title={
                <Box sx={{ p: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: "bold" }}
                  >
                    位置设置说明（按优先级排序）：
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>1. 像素/百分比坐标</strong>
                    （最高优先级）：直接指定相对于屏幕的 X、Y
                    坐标值，可以是像素值，也可以是百分比值，如 100px 或 90%
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>2. 值/索引坐标</strong>：使用数据索引定位，如 0 或
                    1，也可以使用数据值，如 100 或 200
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>3. 统计坐标</strong>：使用统计值（如 min、max）定位
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>4. 笛卡尔坐标</strong>
                    （最低优先级）：使用笛卡尔坐标系定位，如 [100,
                    200]，只有当坐标轴类为笛卡尔坐标系时有效
                  </Typography>
                </Box>
              }
              placement="top"
              arrow
            >
              <Typography
                variant="body2"
                sx={{
                  color: "primary.main",
                  cursor: "help",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                }}
              >
                如何设置位置？
              </Typography>
            </Tooltip>
          </Box>
          <Typography
            variant="body2"
            sx={{ fontStyle: "italic", color: "text.secondary", mb: 2 }}
          >
            💡 提示：可以选择其中任意一种方式，系统会按优先级自动选择有效的设置
          </Typography>
          <Stack spacing={2}>
            {!isStraightLine && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  像素/百分比坐标
                </Typography>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="X 坐标值"
                    fullWidth
                    value={safeValue.x || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) {
                        updateData("x", undefined);
                        return;
                      }

                      // 尝试转换为数字（像素值）或保持字符串
                      const numValue = Number(value);
                      updateData("x", isNaN(numValue) ? value : numValue);
                    }}
                    size="small"
                    placeholder="数值表示像素值，字符串表示其他值"
                  />
                  <TextField
                    label="Y 坐标值"
                    fullWidth
                    value={safeValue.y || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) {
                        updateData("y", undefined);
                        return;
                      }

                      // 尝试转换为数字（像素值）或保持字符串
                      const numValue = Number(value);
                      updateData("y", isNaN(numValue) ? value : numValue);
                    }}
                    size="small"
                    placeholder="数值表示像素值，字符串表示其他值"
                  />
                </Stack>

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  值/索引坐标 (coord)
                </Typography>

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="X 坐标值"
                    fullWidth
                    value={
                      Array.isArray(safeValue.coord) &&
                      safeValue.coord[0] !== undefined
                        ? safeValue.coord[0].toString()
                        : ""
                    }
                    onChange={(e) => {
                      const xValue = e.target.value;
                      const currentCoord = Array.isArray(safeValue.coord)
                        ? safeValue.coord
                        : [undefined, undefined];

                      let newX: any = undefined;
                      if (xValue !== "") {
                        const numValue = Number(xValue);
                        newX = Number.isNaN(numValue) ? xValue : numValue;
                      }

                      const newY = currentCoord[1];

                      // 允许部分输入，保持另一个维度的现值
                      updateData("coord", [newX, newY]);
                    }}
                    size="small"
                    placeholder="数值表示数据索引，字符串表示轴上具体数值"
                  />
                  <TextField
                    label="Y 坐标值"
                    fullWidth
                    value={
                      Array.isArray(safeValue.coord) &&
                      safeValue.coord[1] !== undefined
                        ? safeValue.coord[1].toString()
                        : ""
                    }
                    onChange={(e) => {
                      const yValue = e.target.value;
                      const currentCoord = Array.isArray(safeValue.coord)
                        ? safeValue.coord
                        : [undefined, undefined];

                      const newX = currentCoord[0];
                      let newY: any = undefined;
                      if (yValue !== "") {
                        const numValue = Number(yValue);
                        newY = Number.isNaN(numValue) ? yValue : numValue;
                      }

                      // 允许部分输入，保持另一个维度的现值
                      updateData("coord", [newX, newY]);
                    }}
                    size="small"
                    placeholder="数值表示数据索引，字符串表示轴上具体数值"
                  />
                </Stack>
              </>
            )}

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              统计坐标
            </Typography>
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>统计类型</InputLabel>
                <Select
                  value={safeValue.type || ""}
                  onChange={(e) => updateData("type", e.target.value)}
                  label="统计类型"
                  size="small"
                  endAdornment={
                    <InputAdornment position="end" sx={{ mr: 2 }}>
                      <IconButton
                        size="small"
                        onClick={() => updateData("type", undefined)}
                        sx={{ p: 0.5 }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  }
                >
                  {["min", "max", "average", "median"].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>坐标索引</InputLabel>
                <Select
                  value={
                    safeValue.valueIndex !== undefined
                      ? safeValue.valueIndex
                      : 0
                  }
                  onChange={(e) =>
                    updateData("valueIndex", Number(e.target.value))
                  }
                  label="坐标索引"
                  size="small"
                >
                  {[0, 1].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {isLine && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  笛卡尔坐标
                </Typography>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="X 坐标值"
                    fullWidth
                    value={safeValue.xAxis || ""}
                    onChange={(e) => updateData("xAxis", e.target.value)}
                    size="small"
                  />
                  {isStraightLine && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="body2">或</Typography>
                    </Box>
                  )}
                  <TextField
                    label="Y 坐标值"
                    fullWidth
                    value={safeValue.yAxis || ""}
                    onChange={(e) => updateData("yAxis", e.target.value)}
                    size="small"
                  />
                </Stack>
              </>
            )}
          </Stack>
        </Box>

        {/* 符号配置 */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
            符号配置
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>符号类型</InputLabel>
                <Select
                  value={safeValue.symbol || ""}
                  onChange={(e) => updateData("symbol", e.target.value)}
                  label="符号类型"
                >
                  {SYMBOL_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="符号大小"
                type="number"
                value={safeValue.symbolSize || ""}
                onChange={(e) =>
                  updateData(
                    "symbolSize",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                size="small"
                sx={{ flex: 1 }}
                inputProps={{ min: 0, max: 100, step: 1 }}
              />
              <TextField
                fullWidth
                label="符号旋转角度"
                type="number"
                value={safeValue.symbolRotate || ""}
                onChange={(e) =>
                  updateData(
                    "symbolRotate",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                size="small"
                sx={{ flex: 1 }}
                inputProps={{ min: 0, max: 360, step: 1 }}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={safeValue.symbolKeepAspect || false}
                    onChange={(e) =>
                      updateData("symbolKeepAspect", e.target.checked)
                    }
                    sx={{ mx: 1.5 }}
                  />
                }
                label="保持宽高比"
              />

              {/* 符号偏移 */}
              <TextField
                label="X轴偏移"
                type="number"
                value={
                  Array.isArray(safeValue.symbolOffset)
                    ? safeValue.symbolOffset[0] || ""
                    : ""
                }
                onChange={(e) => {
                  const xOffset = e.target.value ? Number(e.target.value) : 0;
                  const currentOffset = Array.isArray(safeValue.symbolOffset)
                    ? safeValue.symbolOffset
                    : [0, 0];
                  updateData("symbolOffset", [xOffset, currentOffset[1] || 0]);
                }}
                size="small"
                sx={{ flex: 1 }}
                inputProps={{ min: -100, max: 100, step: 1 }}
              />
              <TextField
                label="Y轴偏移"
                type="number"
                value={
                  Array.isArray(safeValue.symbolOffset)
                    ? safeValue.symbolOffset[1] || ""
                    : ""
                }
                onChange={(e) => {
                  const yOffset = e.target.value ? Number(e.target.value) : 0;
                  const currentOffset = Array.isArray(safeValue.symbolOffset)
                    ? safeValue.symbolOffset
                    : [0, 0];
                  updateData("symbolOffset", [currentOffset[0] || 0, yOffset]);
                }}
                size="small"
                sx={{ flex: 1 }}
                inputProps={{ min: -100, max: 100, step: 1 }}
              />
            </Stack>
          </Stack>
        </Box>

        {/* 样式配置 */}
        {isLine ? (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
              线条样式配置
            </Typography>
            <Stack spacing={2}>
              <ColorPicker
                label="线条颜色"
                value={safeValue.lineStyle?.color}
                onChange={(color) => {
                  const updatedLineStyle = {
                    ...(safeValue.lineStyle || {}),
                    color,
                  };
                  updateData("lineStyle", updatedLineStyle);
                }}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="线条宽度"
                  type="number"
                  value={safeValue.lineStyle?.width || ""}
                  onChange={(e) => {
                    const updatedLineStyle = {
                      ...(safeValue.lineStyle || {}),
                      width: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    };
                    updateData("lineStyle", updatedLineStyle);
                  }}
                  size="small"
                  sx={{ flex: 1 }}
                  inputProps={{ min: 0, max: 10, step: 1 }}
                />
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel>线条类型</InputLabel>
                  <Select
                    value={safeValue.lineStyle?.type || "solid"}
                    onChange={(e) => {
                      const updatedLineStyle = {
                        ...(safeValue.lineStyle || {}),
                        type: e.target.value,
                      };
                      updateData("lineStyle", updatedLineStyle);
                    }}
                    label="线条类型"
                  >
                    {BORDER_TYPE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
              样式配置
            </Typography>
            <Stack spacing={2}>
              <ColorPicker
                label="填充颜色"
                value={safeValue.itemStyle?.color || "#ff0000"}
                onChange={(color) => updateItemStyle("color", color)}
              />
              <Stack direction="column" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <ColorPicker
                    label="边框颜色"
                    value={safeValue.itemStyle?.borderColor || "#000000"}
                    onChange={(color) => updateItemStyle("borderColor", color)}
                  />
                </Box>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="边框宽度"
                    type="number"
                    value={safeValue.itemStyle?.borderWidth || ""}
                    onChange={(e) =>
                      updateItemStyle(
                        "borderWidth",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    size="small"
                    sx={{ flex: 1 }}
                    inputProps={{ min: 0, max: 10, step: 1 }}
                  />
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel>边框类型</InputLabel>
                    <Select
                      value={safeValue.itemStyle?.borderType || "solid"}
                      onChange={(e) =>
                        updateItemStyle("borderType", e.target.value)
                      }
                      label="边框类型"
                    >
                      {BORDER_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        )}

        {/* 标签配置 */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
            标签配置
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={safeValue.label?.show || false}
                onChange={(e) =>
                  updateData("label", {
                    ...(safeValue.label || {}),
                    show: e.target.checked,
                  })
                }
              />
            }
            label="显示标签"
          />
          {safeValue.label?.show && (
            <TextStyle
              value={safeValue.label as any}
              onChange={(textStyle) => updateData("label", textStyle)}
              label="标签样式"
              isLabel={true}
            />
          )}
        </Box>
      </Stack>
    </Box>
  );
};

// 弹窗组件接口
interface MarkDataPopoverProps {
  open: boolean;
  onClose: () => void;
  type: "point" | "line" | "area";
  value?: MarkDataItem | MarkDataItem[];
  onChange: (data: any[]) => void;
  label?: string;
}

const MarkDataPopover: React.FC<MarkDataPopoverProps> = ({
  open,
  onClose,
  type,
  onChange,
  label = "数据配置",
}) => {
  const [lineType, setLineType] = useState<"straight" | "segment">("straight");
  const [pointData1, setPointData1] = useState<MarkDataItem>(() => {
    return {};
  });

  const [pointData2, setPointData2] = useState<MarkDataItem>(() => {
    return {};
  });

  // 过滤空值的辅助函数
  const filterEmptyValues = (data: MarkDataItem): any => {
    const filtered: any = {};
    Object.keys(data).forEach((k) => {
      const val = data[k as keyof MarkDataItem];
      if (
        val !== undefined &&
        val !== null &&
        val !== "" &&
        !(Array.isArray(val) && val.length === 0) &&
        !(
          typeof val === "object" &&
          val !== null &&
          Object.keys(val).length === 0
        )
      ) {
        filtered[k] = val;
      }
    });
    return filtered;
  };

  // 检查数据是否为空的辅助函数
  const isEmptyData = (data: any): boolean => {
    if (!data || typeof data !== "object") {
      return true;
    }
    const filtered = filterEmptyValues(data);
    return Object.keys(filtered).length === 0;
  };

  const handleConfirm = useCallback(() => {
    // 验证至少设置了其中一个参数
    if (type === "point") {
      if (isEmptyData(pointData1)) {
        alert("请至少设置一个参数后再确认");
        return;
      }
      onChange(filterEmptyValues(pointData1));
    } else if (type === "area") {
      if (isEmptyData(pointData1) && isEmptyData(pointData2)) {
        alert("请至少设置一个参数后再确认");
        return;
      }
      onChange([filterEmptyValues(pointData1), filterEmptyValues(pointData2)]);
    } else if (type === "line") {
      if (lineType === "segment") {
        if (isEmptyData(pointData1) && isEmptyData(pointData2)) {
          alert("请至少设置一个参数后再确认");
          return;
        }
        onChange([
          filterEmptyValues(pointData1),
          filterEmptyValues(pointData2),
        ]);
      } else {
        if (isEmptyData(pointData1)) {
          alert("请至少设置一个参数后再确认");
          return;
        }
        onChange(filterEmptyValues(pointData1));
      }
    }

    // 先移除焦点，避免 aria-hidden 警告
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // 使用 setTimeout 确保 blur 操作完成后再关闭弹窗
    setTimeout(() => {
      // 清空表单数据
      setPointData1({} as MarkDataItem);
      setPointData2({} as MarkDataItem);
      onClose();
    }, 100);
  }, [type, lineType, pointData1, pointData2, onChange, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={false}
    >
      <DialogTitle>{label}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {type === "line" && (
            <FormControl size="small" sx={{ mt: 2, minWidth: 120 }}>
              <InputLabel>线条类型</InputLabel>
              <Select
                value={lineType}
                onChange={(e) =>
                  setLineType(e.target.value as "straight" | "segment")
                }
                label="线条类型"
              >
                <MenuItem value="straight">直线</MenuItem>
                <MenuItem value="segment">线段</MenuItem>
              </Select>
            </FormControl>
          )}
          {/* 第一个数据点 */}
          <Paper sx={{ p: 2 }} elevation={2}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {type === "point"
                ? "标记点配置"
                : type === "area"
                ? "起点配置"
                : lineType === "segment"
                ? "起点配置"
                : "标记线配置"}
            </Typography>
            <MarkPointData
              value={pointData1}
              onChange={setPointData1}
              isLine={type === "line"}
              isStraightLine={type === "line" && lineType === "straight"}
              label=""
            />
          </Paper>

          {/* 第二个数据点（仅用于 area 和 line segment） */}
          {(type === "area" || (type === "line" && lineType === "segment")) && (
            <>
              <Divider />
              <Paper sx={{ p: 2 }} elevation={2}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {type === "area" ? "终点配置" : "终点配置"}
                </Typography>
                <MarkPointData
                  value={pointData2}
                  onChange={setPointData2}
                  isLine={type === "line"}
                  isStraightLine={type === "line" && lineType === "straight"}
                  label=""
                />
              </Paper>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            // 先移除焦点，避免 aria-hidden 警告
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }

            // 使用 setTimeout 确保 blur 操作完成后再关闭弹窗
            setTimeout(() => {
              // 清空表单数据
              setPointData1({} as MarkDataItem);
              setPointData2({} as MarkDataItem);
              onClose();
            }, 100);
          }}
        >
          取消
        </Button>
        <Button onClick={handleConfirm} variant="contained">
          确认
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// MarkData 组件 - 管理多个数据点的 JSON 格式
interface MarkDataProps {
  value?: MarkDataItem | MarkDataItem[];
  onChange: (data: MarkDataItem | MarkDataItem[]) => void;
  type?: "point" | "line" | "area";
  label?: string;
}

const MarkData: React.FC<MarkDataProps> = ({
  value,
  onChange,
  label = "数据点管理",
  type = "point",
}) => {
  const [openPopover, setOpenPopover] = useState(false);

  // 错误状态管理
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 显示错误提示
  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setErrorOpen(true);
  }, []);

  // 关闭错误提示
  const handleCloseError = useCallback(() => {
    setErrorOpen(false);
  }, []);

  // 标准化数据为数组格式
  const normalizedValue = useMemo(() => {
    if (value !== undefined && value !== null) {
      return Array.isArray(value) ? value : [value];
    }
    return [];
  }, [value]);

  // JSON 文本状态
  const [jsonText, setJsonText] = useState(() => {
    if (normalizedValue.length > 0) {
      try {
        return JSON.stringify(normalizedValue, null, 2);
      } catch {
        return "[]";
      }
    }
    return "[]";
  });

  // 当 value 变化时更新 JSON 文本
  React.useEffect(() => {
    if (normalizedValue.length > 0) {
      try {
        setJsonText(JSON.stringify(normalizedValue, null, 2));
      } catch {
        setJsonText("[]");
      }
    } else {
      setJsonText("[]");
    }
  }, [normalizedValue]);

  // 处理 JSON 文本变化
  const handleJsonChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setJsonText(event.target.value);
    },
    []
  );

  // 添加数据
  const handleAddData = (data: MarkDataItem | MarkDataItem[]) => {
    try {
      // 检查输入数据是否为空
      if (!data || (Array.isArray(data) && data.length === 0)) {
        showError("请先填写数据后再添加");
        return;
      }

      let validatedData: MarkDataItem[] = [];
      let validationErrors: string[] = [];

      if (Array.isArray(data)) {
        // 数组模式：验证每个数据项
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          if (!item || typeof item !== "object") {
            validationErrors.push(`第${i + 1}个数据项无效`);
            continue;
          }

          const validatedItem = validateDataItem(item, showError);
          if (validatedItem) {
            validatedData.push(validatedItem);
          } else {
            validationErrors.push(`第${i + 1}个数据项验证失败`);
          }
        }
      } else {
        // 单对象模式：验证单个数据项
        if (!data || typeof data !== "object") {
          showError("数据项必须是有效的对象");
          return;
        }

        const validatedItem = validateDataItem(data, showError);
        if (validatedItem) {
          validatedData.push(validatedItem);
        } else {
          showError("数据项验证失败，请检查输入参数");
          return;
        }
      }

      // 如果有验证错误，显示所有错误信息
      if (validationErrors.length > 0) {
        showError(`数据验证失败：\n${validationErrors.join("\n")}`);
        return;
      }

      // 检查是否有有效数据
      if (validatedData.length === 0) {
        showError("没有有效的数据可以添加");
        return;
      }

      // 根据类型限制数据数量
      if (type === "point" && validatedData.length > 1) {
        showError("标记点 (point) 类型只能添加一个数据项");
        return;
      }

      if (type === "area" && validatedData.length !== 2) {
        showError("标记区域 (area) 类型必须添加两个数据项");
        return;
      }

      if (
        type === "line" &&
        (validatedData.length < 1 || validatedData.length > 2)
      ) {
        showError("标记线 (line) 类型可以添加1-2个数据项");
        return;
      }

      // 合并现有数据和新数据
      const currentData = normalizedValue;
      let newData: any[] = [];
      if (validatedData.length == 2) {
        newData = [...currentData, validatedData];
      } else if (validatedData.length == 1) {
        newData = [...currentData, validatedData[0]];
      } else {
        showError("数据项验证失败，请检查输入参数");
        return;
      }

      // 更新数据
      onChange(newData as any[]);
    } catch (error) {
      alert(
        `数据添加失败：${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  };

  // 提交更新数据
  const handleUpdateData = useCallback(() => {
    try {
      // 检查输入是否为空
      if (!jsonText.trim()) {
        showError("请输入数据后再更新");
        return;
      }

      const parsed = JSON.parse(jsonText);

      // 使用统一的验证函数
      const isValid = validateMarkDataArray(parsed, type, showError);
      if (!isValid) {
        return; // 验证失败，错误信息已显示
      }

      onChange(parsed);
    } catch (error) {
      if (error instanceof SyntaxError) {
        showError("JSON 格式错误，请检查输入内容");
      } else {
        showError(
          `数据更新失败：${error instanceof Error ? error.message : "未知错误"}`
        );
      }
    }
  }, [jsonText, onChange, type]);

  // 打开弹窗
  const handleOpenPopover = useCallback(() => {
    setOpenPopover(true);
  }, []);

  // 关闭弹窗
  const handleClosePopover = useCallback(() => {
    // 确保按钮失去焦点
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setOpenPopover(false);
  }, []);

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
          {label}
        </Typography>

        <Stack spacing={2}>
          {/* JSON 文本框 */}
          <TextField
            multiline
            rows={20}
            fullWidth
            value={jsonText}
            onChange={handleJsonChange}
            placeholder="输入 JSON 格式的数据..."
            variant="outlined"
            sx={{
              "& .MuiInputBase-input": {
                fontFamily: "monospace",
                fontSize: "12px",
                lineHeight: 1.2,
              },
            }}
          />

          {/* 操作按钮 - 右对齐 */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenPopover}
              size="small"
            >
              {type === "point" && "添加点"}
              {type === "line" && "添加线条"}
              {type === "area" && "添加区域"}
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateData}
              size="small"
            >
              更新数据
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* 弹窗组件 */}
      <MarkDataPopover
        open={openPopover}
        onClose={handleClosePopover}
        type={type}
        onChange={handleAddData}
        label={label}
      />

      {/* 错误提示 */}
      <ErrorSnackbar
        open={errorOpen}
        message={errorMessage}
        onClose={handleCloseError}
      />
    </>
  );
};

export default MarkData;
