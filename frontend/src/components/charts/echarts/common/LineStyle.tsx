import { useState, useMemo, useCallback } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  TextField,
  Grid,
  InputLabel,
  Paper,
  Switch,
  FormControlLabel,
} from "@mui/material";
import ColorPicker from "@/components/common/ColorPicker";

interface LineStyleProps {
  value: {
    color?: string;
    width?: number;
    type?: "solid" | "dashed" | "dotted";
    dashOffset?: number;
    opacity?: number;
    shadowBlur?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    cap?: "butt" | "round" | "square";
    join?: "bevel" | "round" | "miter";
    miterLimit?: number;
    curveness?: number;
  };
  onChange: (style: any) => void;
  label?: string;
  isCurve?: boolean;
}

const LineStyle: React.FC<LineStyleProps> = ({
  value,
  onChange,
  label = "",
  isCurve = false,
}) => {
  // 确保所有值都有默认值，避免受控/非受控组件警告
  const safeValue = useMemo(
    () => ({
      color: value?.color || undefined,
      width: value?.width || 1,
      type: value?.type || "solid",
      opacity: value?.opacity ?? 1,
      shadowBlur: value?.shadowBlur ?? 0,
      shadowColor: value?.shadowColor || undefined,
      shadowOffsetX: value?.shadowOffsetX ?? 0,
      shadowOffsetY: value?.shadowOffsetY ?? 0,
      cap: value?.cap || "butt",
      join: value?.join || "miter",
      miterLimit: value?.miterLimit ?? 10,
      curveness: value?.curveness ?? 0,
    }),
    [value]
  );

  const updateStyle = useCallback(
    (key: string, newValue: any) => {
      onChange({ ...safeValue, [key]: newValue });
    },
    [safeValue, onChange]
  );

  return (
    <Paper sx={{ p: 2 }} elevation={3}>
      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Grid container spacing={2}>
        {/* 颜色配置 */}
        <Grid size={{ xs: 12 }} sx={{ p: 1 }}>
          <ColorPicker
            value={safeValue.color}
            onChange={(color) => updateStyle("color", color)}
            label="线条颜色"
          />
        </Grid>

        {/* 宽度、类型、透明度 */}
        <Grid size={{ xs: 4 }}>
          <FormControl fullWidth size="small" variant="outlined">
            <TextField
              value={safeValue.width}
              onChange={(e) =>
                updateStyle("width", Number(e.target.value) || 1)
              }
              label="线条宽度"
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
            <InputLabel>线条类型</InputLabel>
            <Select
              value={safeValue.type}
              onChange={(e) => updateStyle("type", e.target.value)}
              label="线条类型"
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
              <MenuItem value="solid">实线</MenuItem>
              <MenuItem value="dashed">虚线</MenuItem>
              <MenuItem value="dotted">点线</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <FormControl fullWidth size="small" variant="outlined">
            <TextField
              value={safeValue.opacity}
              onChange={(e) =>
                updateStyle("opacity", Number(e.target.value) || 1)
              }
              label="透明度"
              type="number"
              size="small"
              inputProps={{ min: 0, max: 1, step: 0.1 }}
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

        {/* 端点样式、连接样式、斜接限制 */}
        <Grid size={{ xs: 4 }}>
          <FormControl fullWidth size="small" variant="outlined">
            <InputLabel>端点样式</InputLabel>
            <Select
              value={safeValue.cap}
              onChange={(e) => updateStyle("cap", e.target.value)}
              label="端点样式"
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
              <MenuItem value="butt">平头</MenuItem>
              <MenuItem value="round">圆头</MenuItem>
              <MenuItem value="square">方头</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <FormControl fullWidth size="small" variant="outlined">
            <InputLabel>连接样式</InputLabel>
            <Select
              value={safeValue.join}
              onChange={(e) => updateStyle("join", e.target.value)}
              label="连接样式"
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
              <MenuItem value="bevel">斜角</MenuItem>
              <MenuItem value="round">圆角</MenuItem>
              <MenuItem value="miter">尖角</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <FormControl fullWidth size="small" variant="outlined">
            <TextField
              value={safeValue.miterLimit}
              onChange={(e) =>
                updateStyle("miterLimit", Number(e.target.value) || 10)
              }
              label="斜接限制"
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

        {isCurve && (
          <Grid size={{ xs: 4 }}>
            <TextField
              value={safeValue.curveness}
              onChange={(e) =>
                updateStyle("curveness", Number(e.target.value) || 0)
              }
              label="曲度"
              type="number"
              size="small"
              inputProps={{ min: 0, max: 1, step: 0.1 }}
            />
          </Grid>
        )}
        {/* 阴影配置 */}
        <Grid size={{ xs: 12 }} sx={{ p: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={!!safeValue.shadowColor}
                onChange={(e) => {
                  console.log("阴影开关变化:", e.target.checked);
                  console.log("shadowColor:", safeValue.shadowColor);
                  if (e.target.checked) {
                    // 开启阴影时设置默认阴影颜色和参数
                    updateStyle("shadowColor", "rgba(0,0,0,0.2)");
                  } else {
                    // 关闭阴影时清空所有阴影相关属性
                    safeValue.shadowColor = undefined;
                    updateStyle("shadowColor", undefined);
                    updateStyle("shadowBlur", 0);
                    updateStyle("shadowOffsetX", 0);
                    updateStyle("shadowOffsetY", 0);
                  }
                }}
              />
            }
            label="阴影效果"
          />
        </Grid>
        {safeValue.shadowColor !== undefined &&
          (console.log("shadowColor:", safeValue.shadowColor),
          (
            <>
              <Grid size={{ xs: 12 }} sx={{ p: 1 }}>
                <ColorPicker
                  value={safeValue.shadowColor}
                  onChange={(color) => updateStyle("shadowColor", color)}
                  label="阴影颜色"
                  maxColors={1}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <FormControl fullWidth size="small" variant="outlined">
                  <TextField
                    value={safeValue.shadowBlur}
                    onChange={(e) =>
                      updateStyle("shadowBlur", Number(e.target.value) || 0)
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
                    value={safeValue.shadowOffsetX}
                    onChange={(e) =>
                      updateStyle("shadowOffsetX", Number(e.target.value) || 0)
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
                    value={safeValue.shadowOffsetY}
                    onChange={(e) =>
                      updateStyle("shadowOffsetY", Number(e.target.value) || 0)
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
          ))}
      </Grid>
    </Paper>
  );
};

export default LineStyle;
