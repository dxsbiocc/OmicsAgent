import React, { useCallback, useMemo } from "react";
import {
  Box,
  MenuItem,
  Select,
  Switch,
  TextField,
  FormControl,
  InputLabel,
  Typography,
  Stack,
  FormControlLabel,
} from "@mui/material";
import { Info as TooltipIcon } from "@mui/icons-material";
import LazyAccordion from "./LazyAccordion";
import ColorPicker from "@/components/common/ColorPicker";
import TextStyle from "./TextStyle";
import { TooltipComponentOption } from "echarts";

// 工具提示配置组件
interface TooltipConfigProps {
  value: TooltipComponentOption;
  onChange: (tooltip: TooltipComponentOption) => void;
  defaultExpanded?: boolean;
  disabled?: boolean;
}

const TooltipConfig: React.FC<TooltipConfigProps> = ({
  value,
  onChange,
  defaultExpanded = false,
  disabled = false,
}) => {
  const updateTooltip = useCallback(
    (key: string, newValue: any) => {
      onChange({ ...value, [key]: newValue });
    },
    [value, onChange]
  );

  const tooltipContent = useMemo(
    () => (
      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Switch
              checked={value.show !== false}
              onChange={(e) => updateTooltip("show", e.target.checked)}
            />
          }
          label="显示工具提示"
        />
        {value.show !== false && (
          <>
            <FormControl fullWidth size="small">
              <InputLabel>触发方式</InputLabel>
              <Select
                value={value.trigger || "item"}
                onChange={(e) => updateTooltip("trigger", e.target.value)}
              >
                <MenuItem value="item">数据项</MenuItem>
                <MenuItem value="axis">坐标轴</MenuItem>
                <MenuItem value="none">无</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="格式化器"
              value={value.formatter || ""}
              onChange={(e) => updateTooltip("formatter", e.target.value)}
              placeholder="{a} <br/>{b} : {c}"
            />
            <ColorPicker
              value={value.backgroundColor || "#fff"}
              onChange={(color) => updateTooltip("backgroundColor", color)}
              label="背景颜色"
            />
            <ColorPicker
              value={value.borderColor || "#ccc"}
              onChange={(color) => updateTooltip("borderColor", color)}
              label="边框颜色"
            />
            <Box sx={{ p: 1 }}>
              <TextStyle
                value={(value.textStyle as any) || {}}
                onChange={(textStyle) => updateTooltip("textStyle", textStyle)}
                label="文本样式"
              />
            </Box>
          </>
        )}
      </Stack>
    ),
    [value, updateTooltip]
  );

  return (
    <LazyAccordion
      title="工具提示配置"
      icon={<TooltipIcon />}
      defaultExpanded={defaultExpanded}
      disabled={disabled}
    >
      {tooltipContent}
    </LazyAccordion>
  );
};

export default TooltipConfig;
