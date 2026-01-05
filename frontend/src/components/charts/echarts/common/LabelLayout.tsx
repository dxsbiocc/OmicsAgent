import React, { useCallback, useMemo } from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

interface LabelLayoutProps {
  value?: {
    hideOverlap?: boolean;
    draggable?: boolean;
    moveOverlap?: "shiftX" | "shiftY";
    x?: number;
    y?: number;
    rotate?: number;
    fontSize?: number;
    width?: number;
    height?: number;
    align?: "left" | "center" | "right";
    verticalAlign?: "top" | "middle" | "bottom";
  };
  onChange: (next: any) => void;
  label?: string;
}

const LabelLayout: React.FC<LabelLayoutProps> = ({
  value = {},
  onChange,
  label = "",
}) => {
  const safeValue = useMemo(
    () => ({
      hideOverlap: value?.hideOverlap || false,
      draggable: value?.draggable || false,
      moveOverlap: value?.moveOverlap || "shiftX",
      x: value?.x || 0,
      y: value?.y || 0,
      rotate: value?.rotate || 0,
      fontSize: value?.fontSize || 18,
      width: value?.width || 0,
      height: value?.height || 0,
      align: value?.align || "center",
      verticalAlign: value?.verticalAlign || "middle",
    }),
    [value]
  );

  const update = useCallback(
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
    <Paper sx={{ p: 1 }} elevation={3}>
      {label && (
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          {label}
        </Typography>
      )}

      <Box sx={{ p: 1 }}>
        <Grid container spacing={2} alignItems="center" sx={{ p: 1, flex: 1 }}>
          <Grid size={{ xs: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={safeValue?.hideOverlap === true}
                  onChange={(e) => update("hideOverlap", e.target.checked)}
                />
              }
              label="隐藏重叠标签"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={safeValue?.draggable === true}
                  onChange={(e) => update("draggable", e.target.checked)}
                />
              }
              label="标签是否可以拖拽"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 1, p: 1 }}>
          <Grid size={{ xs: 4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>重叠标签处理</InputLabel>
              <Select
                value={safeValue?.moveOverlap || "shiftX"}
                onChange={(e) => update("moveOverlap", e.target.value)}
                label="重叠标签处理"
                size="small"
              >
                <MenuItem value="shiftX">水平偏移</MenuItem>
                <MenuItem value="shiftY">垂直偏移</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="X 坐标"
              value={
                Number.isFinite(Number(safeValue?.x))
                  ? Number(safeValue?.x)
                  : ""
              }
              onChange={(e) => update("x", Number(e.target.value) || 0)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">px</InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Y 坐标"
              value={
                Number.isFinite(Number(safeValue?.y))
                  ? Number(safeValue?.y)
                  : ""
              }
              onChange={(e) => update("y", Number(e.target.value) || 0)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">px</InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="旋转角度"
              value={
                Number.isFinite(Number(safeValue?.rotate))
                  ? Number(safeValue?.rotate)
                  : ""
              }
              onChange={(e) => update("rotate", Number(e.target.value) || 0)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">°</InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="字体大小"
              value={
                Number.isFinite(Number(safeValue?.fontSize))
                  ? Number(safeValue?.fontSize)
                  : ""
              }
              onChange={(e) => update("fontSize", Number(e.target.value) || 0)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">px</InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="标签宽度"
              value={
                Number.isFinite(Number(safeValue?.width))
                  ? Number(safeValue?.width)
                  : ""
              }
              onChange={(e) => update("width", Number(e.target.value) || 0)}
            />
          </Grid>

          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="标签高度"
              value={
                Number.isFinite(Number(safeValue?.height))
                  ? Number(safeValue?.height)
                  : ""
              }
              onChange={(e) => update("height", Number(e.target.value) || 0)}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>水平对齐</InputLabel>
              <Select
                value={safeValue?.align || "center"}
                onChange={(e) => update("align", e.target.value)}
                label="水平对齐"
                size="small"
              >
                <MenuItem value="left">左对齐</MenuItem>
                <MenuItem value="center">居中对齐</MenuItem>
                <MenuItem value="right">右对齐</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>竖直对齐</InputLabel>
              <Select
                value={safeValue?.verticalAlign || "middle"}
                onChange={(e) => update("verticalAlign", e.target.value)}
                label="竖直对齐"
                size="small"
              >
                <MenuItem value="top">上对齐</MenuItem>
                <MenuItem value="middle">居中对齐</MenuItem>
                <MenuItem value="bottom">下对齐</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default LabelLayout;
export type { LabelLayoutProps };
