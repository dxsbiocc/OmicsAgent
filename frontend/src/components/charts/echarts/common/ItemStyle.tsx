import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { ColorPicker } from ".";

interface ItemStyleProps {
  value?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    borderType?: "solid" | "dashed" | "dotted";
    borderRadius?: number | number[];
    shadowBlur?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    opacity?: number;
  };
  onChange: (next: any) => void;
  label?: string;
  isRadius?: boolean;
}

// 圆角半径输入组件
interface BorderRadiusInputProps {
  value: number | number[];
  onChange: (value: number | number[]) => void;
}

const BorderRadiusInput: React.FC<BorderRadiusInputProps> = ({
  value,
  onChange,
}) => {
  const [isArrayMode, setIsArrayMode] = useState(Array.isArray(value));
  const [arrayValues, setArrayValues] = useState<number[]>(
    Array.isArray(value) ? value : [0, 0, 0, 0]
  );

  // 同步外部值到内部状态
  React.useEffect(() => {
    if (Array.isArray(value)) {
      setIsArrayMode(true);
      setArrayValues(value);
    } else {
      setIsArrayMode(false);
      setArrayValues([value || 0, 0, 0, 0]);
    }
  }, [value]);

  // 处理模式切换
  const handleModeToggle = (checked: boolean) => {
    if (checked) {
      // 切换到数组模式，显示4个输入框，默认为0
      setIsArrayMode(true);
      const newArray = [0, 0, 0, 0];
      setArrayValues(newArray);
      onChange(newArray);
    } else {
      // 切换到单值模式
      const currentValue = Array.isArray(value) ? value[0] || 0 : value || 0;
      setIsArrayMode(false);
      onChange(currentValue);
    }
  };

  // 处理单值变化
  const handleSingleValueChange = (newValue: number) => {
    onChange(newValue);
  };

  // 处理数组值变化
  const handleArrayValueChange = (index: number, newValue: number) => {
    const newArray = [...arrayValues];
    newArray[index] = newValue;
    setArrayValues(newArray);
    onChange(newArray);
  };

  const cornerLabels = ["左上", "右上", "右下", "左下"];

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ minWidth: "80px" }}>
          圆角半径
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isArrayMode}
              onChange={(e) => handleModeToggle(e.target.checked)}
              size="small"
            />
          }
          label={isArrayMode ? "4 个方向" : "统一圆角"}
        />
      </Stack>

      {isArrayMode ? (
        <Grid container spacing={2}>
          {arrayValues.map((val, index) => (
            <Grid key={index} size={{ xs: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={cornerLabels[index]}
                value={val}
                onChange={(e) =>
                  handleArrayValueChange(index, parseInt(e.target.value) || 0)
                }
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TextField
          fullWidth
          size="small"
          type="number"
          value={Array.isArray(value) ? value[0] || 0 : value || 0}
          onChange={(e) =>
            handleSingleValueChange(parseInt(e.target.value) || 0)
          }
          inputProps={{ min: 0, step: 1 }}
        />
      )}
    </Box>
  );
};

const ItemStyle: React.FC<ItemStyleProps> = ({
  value = {},
  onChange,
  label,
  isRadius = false,
}) => {
  const safeValue = useMemo(
    () => ({
      color: value?.color ?? undefined,
      borderColor: value?.borderColor ?? undefined,
      borderWidth: value?.borderWidth ?? 1,
      borderType: value?.borderType ?? "solid",
      borderRadius: value?.borderRadius ?? 0,
      shadowBlur: value?.shadowBlur ?? 0,
      shadowColor: value?.shadowColor ?? undefined,
      shadowOffsetX: value?.shadowOffsetX ?? 0,
      shadowOffsetY: value?.shadowOffsetY ?? 0,
      opacity: value?.opacity ?? 0.8,
    }),
    [value]
  );

  const updateStyle = useCallback(
    (key: string, newValue: any) => {
      // 合并当前值和新的修改值，避免重置其他属性
      const updatedValue = {
        ...value,
        [key]: newValue,
      };
      onChange(updatedValue);
    },
    [onChange, value]
  );

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      {label && (
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          {label}
        </Typography>
      )}

      <Box sx={{ p: 1 }}>
        {/* 图形颜色和透明度 */}
        <Stack direction="column" spacing={2}>
          <ColorPicker
            value={(safeValue?.color as any) || "#333"}
            onChange={(color) => updateStyle("color", color)}
            label="图形颜色"
          />

          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", gap: 2, width: "100%" }}
          >
            {/* 透明度输入框 */}
            <FormControl fullWidth size="small" variant="outlined">
              <TextField
                value={safeValue.opacity}
                onChange={(e) =>
                  updateStyle("opacity", Number(e.target.value) || 1)
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
              value={safeValue.opacity}
              onChange={(_, newValue) =>
                updateStyle("opacity", newValue as number)
              }
              min={0}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
            />
          </Stack>
        </Stack>
        {/* 边框配置 */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {/* 颜色独占一行 */}
          <Grid size={{ xs: 12 }}>
            {/* borderColor */}
            <ColorPicker
              value={(safeValue?.borderColor as any) || "#333"}
              onChange={(color) => updateStyle("borderColor", color)}
              label="边框颜色"
            />
          </Grid>
          {/* 其余两项在一行，三列中占前两列 */}
          <Grid container spacing={2} size={{ xs: 12 }}>
            <Grid size={{ xs: 6 }}>
              {/* borderWidth */}
              <TextField
                fullWidth
                size="small"
                type="number"
                label="边框宽度"
                value={safeValue?.borderWidth ?? 0}
                onChange={(e) => {
                  const newValue = Number(e.target.value) || 0;
                  updateStyle("borderWidth", Math.max(0, newValue));
                }}
                inputProps={{
                  min: 0,
                  step: 0.2,
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">px</InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              {/* borderType */}
              <FormControl fullWidth size="small">
                <InputLabel>边框类型</InputLabel>
                <Select
                  value={(safeValue?.borderType as any) || "solid"}
                  onChange={(e) =>
                    updateStyle("borderType", e.target.value as any)
                  }
                  label="边框类型"
                >
                  <MenuItem value="solid">实线</MenuItem>
                  <MenuItem value="dashed">虚线</MenuItem>
                  <MenuItem value="dotted">点线</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {isRadius && (
              <Grid size={{ xs: 12 }}>
                {/* borderRadius - 支持单个值或4个值 */}
                <BorderRadiusInput
                  value={safeValue?.borderRadius || 0}
                  onChange={(value) => updateStyle("borderRadius", value)}
                />
              </Grid>
            )}
          </Grid>
        </Grid>
        {/* 阴影配置 */}
        <Stack direction="column" spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12 }}>
            <ColorPicker
              value={safeValue.shadowColor}
              onChange={(color) => updateStyle("shadowColor", color)}
              label="阴影颜色"
              maxColors={1}
            />
          </Grid>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small" variant="outlined">
              <TextField
                value={safeValue.shadowBlur}
                onChange={(e) =>
                  updateStyle("shadowBlur", Number(e.target.value) || 0)
                }
                label="阴影模糊"
                type="number"
                size="small"
              />
            </FormControl>

            <FormControl fullWidth size="small" variant="outlined">
              <TextField
                value={safeValue.shadowOffsetX}
                onChange={(e) =>
                  updateStyle("shadowOffsetX", Number(e.target.value) || 0)
                }
                label="阴影 X 偏移"
                type="number"
                size="small"
              />
            </FormControl>

            <FormControl fullWidth size="small" variant="outlined">
              <TextField
                value={safeValue.shadowOffsetY}
                onChange={(e) =>
                  updateStyle("shadowOffsetY", Number(e.target.value) || 0)
                }
                label="阴影 Y 偏移"
                type="number"
                size="small"
              />
            </FormControl>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

export default ItemStyle;
export type { ItemStyleProps };
