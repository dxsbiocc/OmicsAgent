import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Stack,
  Box,
  Typography,
  TextField,
  Paper,
  Divider,
} from "@mui/material";
import { LegendComponentOption } from "echarts";
import { useCallback, useMemo } from "react";
import { PositionControl, TextStyle } from "../common";
import ColorPicker from "@/components/common/ColorPicker";
import { useChartStore } from "@/stores/chartStore";

interface LegendOptionsProps {
  label?: string;
}

const LegendOptions: React.FC<LegendOptionsProps> = ({
  label = "图例样式",
}) => {
  const { chartOption, setChartOption } = useChartStore();

  // 直接获取 legend 配置，处理数组情况
  const getLegendOption = useCallback(() => {
    const legend = chartOption?.legend;
    if (Array.isArray(legend)) {
      return legend[0] || {};
    }
    return legend || {};
  }, [chartOption?.legend]);

  // 确保所有值都有默认值，避免受控/非受控组件警告
  const safeValue = useMemo(() => {
    const legendOption = getLegendOption();
    return {
      show: legendOption?.show !== false,
      orient: legendOption?.orient ?? "horizontal",
      left: legendOption?.left ?? "auto",
      top: legendOption?.top ?? "auto",
      backgroundColor:
        (legendOption?.backgroundColor as string) ?? "transparent",
      borderColor: (legendOption?.borderColor as string) ?? "#ccc",
      borderWidth: legendOption?.borderWidth ?? 0,
      borderRadius: legendOption?.borderRadius ?? 0,
      padding: legendOption?.padding ?? 5,
      itemWidth: legendOption?.itemWidth ?? 25,
      itemHeight: legendOption?.itemHeight ?? 14,
      itemGap: legendOption?.itemGap ?? 10,
      textStyle: legendOption?.textStyle ?? {},
    };
  }, [getLegendOption]);

  // 直接更新 legend 配置
  const updateLegend = useCallback(
    (key: keyof LegendComponentOption, newValue: any) => {
      setChartOption((draft) => {
        if (!draft) return;

        // 确保 legend 存在
        if (!draft.legend) {
          draft.legend = {};
        }

        // 处理 legend 是数组的情况
        if (Array.isArray(draft.legend)) {
          if (draft.legend.length === 0) {
            draft.legend = [{}];
          }
          (draft.legend[0] as any)[key] = newValue;
        } else {
          (draft.legend as any)[key] = newValue;
        }
      });
    },
    [setChartOption]
  );

  const legendContent = useMemo(
    () => (
      <Box>
        <Stack spacing={1}>
          {/* 显示图例 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              显示图例
            </Typography>
            <Switch
              checked={safeValue.show}
              onChange={(e) => updateLegend("show", e.target.checked)}
            />
          </Box>

          {/* 只有当显示图例时才渲染图例相关组件 */}
          {safeValue.show && (
            <>
              {/* 图例排列方式 */}
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  排列方式
                </Typography>

                <FormControl fullWidth size="small" variant="outlined">
                  <InputLabel>排列方式</InputLabel>
                  <Select
                    label="排列方式"
                    size="small"
                    value={safeValue.orient}
                    onChange={(e) => updateLegend("orient", e.target.value)}
                  >
                    <MenuItem value="horizontal">水平</MenuItem>
                    <MenuItem value="vertical">垂直</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* 图例样式 */}
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  图例样式
                </Typography>
                <TextStyle
                  value={{
                    color: safeValue.textStyle.color,
                    fontFamily: safeValue.textStyle.fontFamily,
                    fontSize:
                      typeof safeValue.textStyle.fontSize === "string"
                        ? parseInt(safeValue.textStyle.fontSize) || 12
                        : safeValue.textStyle.fontSize || 12,
                    fontWeight: safeValue.textStyle.fontWeight,
                    fontStyle: safeValue.textStyle.fontStyle,
                    textAlign: safeValue.textStyle.align,
                    textVerticalAlign: safeValue.textStyle.verticalAlign,
                    lineHeight: safeValue.textStyle.lineHeight,
                    overflow: safeValue.textStyle.overflow,
                  }}
                  onChange={(textStyle) => updateLegend("textStyle", textStyle)}
                />
              </Box>

              {/* 图例背景 */}
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
                    updateLegend("backgroundColor", colorValue as any);
                  }}
                  label=""
                  maxColors={1}
                />
              </Box>

              {/* 图例边框 */}
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  边框设置
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    边框颜色
                  </Typography>
                  <ColorPicker
                    value={safeValue.borderColor}
                    onChange={(color) => {
                      const colorValue = Array.isArray(color)
                        ? color[0] || ""
                        : color;
                      updateLegend("borderColor", colorValue as any);
                    }}
                    label=""
                    maxColors={1}
                  />
                </Box>
                <Stack direction="row" spacing={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="边框宽度"
                    type="number"
                    value={safeValue.borderWidth}
                    onChange={(e) =>
                      updateLegend("borderWidth", parseInt(e.target.value) || 0)
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="圆角半径"
                    type="number"
                    value={safeValue.borderRadius}
                    onChange={(e) =>
                      updateLegend(
                        "borderRadius",
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </Stack>
              </Box>

              {/* 图例间距 */}
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  间距设置
                </Typography>
                <Stack direction="row" spacing={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="内边距"
                    type="number"
                    value={safeValue.padding}
                    onChange={(e) =>
                      updateLegend("padding", parseInt(e.target.value) || 5)
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="项目间距"
                    type="number"
                    value={safeValue.itemGap}
                    onChange={(e) =>
                      updateLegend("itemGap", parseInt(e.target.value) || 10)
                    }
                  />
                </Stack>
              </Box>

              {/* 图例项目尺寸 */}
              <Box sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  项目尺寸
                </Typography>
                <Stack direction="row" spacing={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="项目宽度"
                    type="number"
                    value={safeValue.itemWidth}
                    onChange={(e) =>
                      updateLegend("itemWidth", parseInt(e.target.value) || 25)
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="项目高度"
                    type="number"
                    value={safeValue.itemHeight}
                    onChange={(e) =>
                      updateLegend("itemHeight", parseInt(e.target.value) || 14)
                    }
                  />
                </Stack>
              </Box>

              {/* 图例位置 */}
              <Box sx={{ p: 1 }}>
                <PositionControl
                  left={safeValue.left}
                  top={safeValue.top}
                  onLeftChange={(leftValue) => updateLegend("left", leftValue)}
                  onTopChange={(topValue) => updateLegend("top", topValue)}
                  label="图例位置"
                />
              </Box>
            </>
          )}
        </Stack>
      </Box>
    ),
    [safeValue, updateLegend]
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {legendContent}
    </Paper>
  );
};

export default LegendOptions;
