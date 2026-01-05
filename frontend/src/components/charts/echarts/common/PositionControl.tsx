import { useState, useMemo } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  Slider,
  TextField,
  Stack,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  Button,
  Grid,
  InputLabel,
  Paper,
} from "@mui/material";

// 位置控制组合组件
interface PositionControlProps {
  left?: string | number;
  top?: string | number;
  onLeftChange: (value: string | number | undefined) => void;
  onTopChange: (value: string | number | undefined) => void;
  label?: string;
}

const PositionControl: React.FC<PositionControlProps> = ({
  left = "auto",
  top = "auto",
  onLeftChange,
  onTopChange,
  label = "位置控制",
}) => {
  // 位置输入类型
  const [inputType, setInputType] = useState<
    "absolute" | "percentage" | "preset"
  >("preset");

  // 使用独立状态控制自定义位置开关
  const [isCustomPositionEnabled, setIsCustomPositionEnabled] = useState(false);

  // 记录每个输入类型的默认值，用于恢复状态
  const defaultValues = useMemo(
    () => ({
      preset: { top: "auto", left: "center" },
      percentage: { top: "0%", left: "0%" },
      absolute: { top: 0, left: 0 },
    }),
    []
  );

  // 直接使用外部传入的值，不维护内部状态
  const topValue = top;
  const leftValue = left;

  // 位置输入组件
  const PositionInput: React.FC<{
    label: string;
    value: string | number;
    onChange: (value: string | number) => void;
    inputType: "absolute" | "percentage" | "preset";
  }> = ({ label, value, onChange, inputType }) => {
    const currentValue = value || "auto";

    if (inputType === "preset") {
      const options = label.includes("上")
        ? ["auto", "top", "middle", "bottom"]
        : ["auto", "left", "center", "right"];

      // 确保当前值在可用选项中，否则使用 "auto"
      const validValue = options.includes(String(currentValue))
        ? String(currentValue)
        : "auto";

      return (
        <FormControl fullWidth size="small" variant="outlined">
          <InputLabel id="position-select-label">{label}</InputLabel>
          <Select
            value={validValue}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            label={label}
          >
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option === "auto"
                  ? "自动"
                  : option === "top"
                  ? "顶部"
                  : option === "middle"
                  ? "中间"
                  : option === "bottom"
                  ? "底部"
                  : option === "left"
                  ? "左对齐"
                  : option === "center"
                  ? "居中"
                  : option === "right"
                  ? "右对齐"
                  : option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    if (inputType === "percentage") {
      const numValue =
        typeof currentValue === "string" && currentValue.includes("%")
          ? parseFloat(currentValue.replace("%", "")) || 0
          : typeof currentValue === "number"
          ? currentValue
          : 0;

      const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement>
      ) => {
        const inputValue = parseFloat(event.target.value) || 0;
        const clampedValue = Math.min(Math.max(inputValue, 0), 100);
        onChange(`${clampedValue}%`);
      };

      return (
        <Box>
          <Typography
            gutterBottom
            sx={{ fontSize: "0.875rem", fontWeight: 500 }}
          >
            {label}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Slider
                value={numValue}
                onChange={(_, newValue) => onChange(`${newValue}%`)}
                min={0}
                max={100}
                step={1}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
              />
            </Box>
            <Box sx={{ minWidth: 80 }}>
              <TextField
                value={numValue}
                onChange={handleInputChange}
                type="number"
                size="small"
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 0.1,
                }}
                InputProps={{
                  endAdornment: (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    >
                      %
                    </Typography>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "0.875rem",
                    textAlign: "center",
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      );
    }

    // absolute
    return (
      <FormControl fullWidth size="small" variant="outlined">
        <TextField
          value={
            typeof currentValue === "number"
              ? currentValue
              : typeof currentValue === "string" && !isNaN(Number(currentValue))
              ? currentValue
              : ""
          }
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          label={label}
          type="number"
          placeholder="输入数值"
          size="small"
        />
      </FormControl>
    );
  };

  const positionContent = useMemo(
    () => (
      <Stack spacing={2}>
        {/* 自定义位置开关和恢复默认按钮 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isCustomPositionEnabled}
                onChange={(e) => {
                  setIsCustomPositionEnabled(e.target.checked);

                  if (e.target.checked) {
                    // 启用自定义位置，根据当前输入类型设置默认值
                    const currentDefaults = defaultValues[inputType];
                    onTopChange(currentDefaults.top);
                    onLeftChange(currentDefaults.left);
                  } else {
                    // 禁用自定义位置，恢复为 auto 让 ECharts 自动计算
                    onTopChange("auto");
                    onLeftChange("auto");
                  }
                }}
              />
            }
            label="自定义位置"
          />

          {/* 恢复默认位置按钮 - 只在自定义位置启用时显示 */}
          {isCustomPositionEnabled && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const currentDefaults = defaultValues[inputType];
                // 根据当前输入类型恢复对应的默认值
                onTopChange(currentDefaults.top);
                onLeftChange(currentDefaults.left);
              }}
              sx={{
                minWidth: "auto",
                fontSize: "0.75rem",
                py: 0.5,
                px: 1,
                ml: 1,
              }}
            >
              恢复默认
            </Button>
          )}
        </Box>

        {isCustomPositionEnabled && (
          <Paper sx={{ p: 1.5 }} elevation={3}>
            {/* 输入类型选择 */}
            <Box sx={{ mb: 1 }}>
              <Typography
                gutterBottom
                sx={{ fontSize: "0.875rem", fontWeight: 500 }}
              >
                输入类型
              </Typography>
              <RadioGroup
                row
                value={inputType}
                onChange={(e) => {
                  const newInputType = e.target.value as
                    | "absolute"
                    | "percentage"
                    | "preset";

                  // 记录当前输入类型，用于恢复其他按钮的状态
                  const previousInputType = inputType;

                  setInputType(newInputType);

                  // 切换输入类型时，根据输入类型设置不同的默认值
                  // 这确保了点击一个按钮时，其他按钮对应的位置值会恢复到默认状态
                  const newDefaults = defaultValues[newInputType];
                  onTopChange(newDefaults.top);
                  onLeftChange(newDefaults.left);
                }}
              >
                <FormControlLabel
                  value="preset"
                  control={<Radio size="small" />}
                  label="预设值"
                />
                <FormControlLabel
                  value="percentage"
                  control={<Radio size="small" />}
                  label="百分比"
                />
                <FormControlLabel
                  value="absolute"
                  control={<Radio size="small" />}
                  label="绝对值"
                />
              </RadioGroup>
            </Box>

            {/* 位置输入控件 */}
            {inputType === "percentage" ? (
              // 百分比模式：上下排列
              <Stack spacing={2}>
                <PositionInput
                  label="上边距"
                  value={topValue}
                  onChange={onTopChange}
                  inputType={inputType}
                />
                <PositionInput
                  label="左边距"
                  value={leftValue}
                  onChange={onLeftChange}
                  inputType={inputType}
                />
              </Stack>
            ) : (
              // 其他模式：左右排列
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <PositionInput
                    label="上边距"
                    value={topValue}
                    onChange={onTopChange}
                    inputType={inputType}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <PositionInput
                    label="左边距"
                    value={leftValue}
                    onChange={onLeftChange}
                    inputType={inputType}
                  />
                </Grid>
              </Grid>
            )}
          </Paper>
        )}
      </Stack>
    ),
    [
      isCustomPositionEnabled,
      inputType,
      topValue,
      leftValue,
      onTopChange,
      onLeftChange,
    ]
  );

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{
          mb: 2,
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
      {positionContent}
    </Box>
  );
};

export default PositionControl;
