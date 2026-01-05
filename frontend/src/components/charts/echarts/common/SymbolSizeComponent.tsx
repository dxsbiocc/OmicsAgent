import React, { useCallback, useState } from "react";
import {
  Box,
  MenuItem,
  Select,
  TextField,
  FormControl,
  InputLabel,
  Slider,
  Typography,
  Stack,
  FormControlLabel,
  Grid,
  Alert,
} from "@mui/material";

// 标记点大小设置组件
interface SymbolSizeComponentProps {
  value: number | number[] | Function | undefined;
  onChange: (value: number | number[] | Function) => void;
}

const SymbolSizeComponent: React.FC<SymbolSizeComponentProps> = ({
  value,
  onChange,
}) => {
  const [mode, setMode] = useState<"number" | "array" | "function">(() => {
    if (typeof value === "function") return "function";
    if (Array.isArray(value)) return "array";
    return "number";
  });

  const [numberValue, setNumberValue] = useState<number>(() => {
    if (typeof value === "number") return value;
    if (Array.isArray(value)) return value[0] || 8;
    return 8;
  });

  const [arrayValue, setArrayValue] = useState<[number, number]>(() => {
    if (Array.isArray(value) && value.length >= 2) {
      return [value[0] || 8, value[1] || 8];
    }
    return [8, 8];
  });

  const [functionValue, setFunctionValue] = useState<string>(() => {
    if (typeof value === "function") {
      // 尝试从函数中提取代码（这是一个简化的实现）
      return "8"; // 默认值，实际应用中可能需要更复杂的解析
    }
    return "8";
  });

  const [functionError, setFunctionError] = useState<string>("");

  const handleModeChange = (newMode: "number" | "array" | "function") => {
    setMode(newMode);
    setFunctionError("");

    switch (newMode) {
      case "number":
        onChange(numberValue);
        break;
      case "array":
        onChange(arrayValue);
        break;
      case "function":
        // 将函数字符串转换为匿名函数
        try {
          if (functionValue.trim()) {
            const anonymousFunction = new Function(
              "value",
              "params",
              `return (${functionValue})`
            );
            onChange(anonymousFunction);
          } else {
            // 默认函数
            const defaultFunction = new Function("value", "params", "return 8");
            onChange(defaultFunction);
          }
        } catch (error) {
          // 如果转换失败，使用默认函数
          const defaultFunction = new Function("value", "params", "return 8");
          onChange(defaultFunction);
        }
        break;
    }
  };

  const handleNumberChange = (newValue: number) => {
    setNumberValue(newValue);
    if (mode === "number") {
      onChange(newValue);
    }
  };

  const handleArrayChange = (index: 0 | 1, newValue: number) => {
    const newArray: [number, number] = [...arrayValue];
    newArray[index] = newValue;
    setArrayValue(newArray);
    if (mode === "array") {
      onChange(newArray);
    }
  };

  const handleFunctionChange = (newValue: string) => {
    setFunctionValue(newValue);
    setFunctionError("");

    // 验证函数语法并转换为匿名函数
    try {
      if (newValue.trim()) {
        // 尝试创建一个安全的函数来验证语法
        const func = new Function("value", "params", `return (${newValue})`);
        // 测试函数
        func([1, 2], {});
        if (mode === "function") {
          // 将字符串转换为匿名函数
          const anonymousFunction = new Function(
            "value",
            "params",
            `return (${newValue})`
          );
          onChange(anonymousFunction);
        }
      }
    } catch (error) {
      setFunctionError("函数语法错误");
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        标记点大小
      </Typography>

      {/* 模式选择 */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>设置模式</InputLabel>
        <Select
          value={mode}
          onChange={(e) => handleModeChange(e.target.value as any)}
          label="设置模式"
        >
          <MenuItem value="number">单一数值</MenuItem>
          <MenuItem value="array">宽高数组</MenuItem>
          <MenuItem value="function">回调函数</MenuItem>
        </Select>
      </FormControl>

      {/* 单一数值模式 */}
      {mode === "number" && (
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: "center", gap: 2 }}
        >
          <TextField
            fullWidth
            size="small"
            type="number"
            label="精确数值"
            value={numberValue}
            onChange={(e) => handleNumberChange(Number(e.target.value) || 0)}
            inputProps={{ min: 0, max: 100 }}
          />
          <Slider
            value={numberValue}
            onChange={(_, newValue) => handleNumberChange(newValue as number)}
            min={0}
            max={50}
            step={1}
            valueLabelDisplay="auto"
            sx={{ mr: 2 }}
          />
        </Stack>
      )}

      {/* 数组模式 */}
      {mode === "array" && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="宽度"
              value={arrayValue[0]}
              onChange={(e) =>
                handleArrayChange(0, Number(e.target.value) || 0)
              }
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="高度"
              value={arrayValue[1]}
              onChange={(e) =>
                handleArrayChange(1, Number(e.target.value) || 0)
              }
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>
        </Grid>
      )}

      {/* 函数模式 */}
      {mode === "function" && (
        <Box>
          <Typography variant="body2">回调函数:</Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              color: "text.secondary",
              mb: 2,
              mt: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            (value: Array|number, params: Object) =&gt; number|Array
          </Typography>
          <Typography
            variant="caption"
            sx={{ mb: 1, display: "block", color: "text.secondary" }}
          >
            只需输入函数体，系统会自动包装为匿名函数
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            size="small"
            label="函数代码"
            value={functionValue}
            onChange={(e) => handleFunctionChange(e.target.value)}
            placeholder="value.length > 2 ? 12 : 8"
            sx={{ fontFamily: "monospace" }}
          />
          {functionError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {functionError}
            </Alert>
          )}
          <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
            示例: <code>value.length &gt; 2 ? 12 : 8</code> 或{" "}
            <code>[value[0] * 2, value[1]]</code>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SymbolSizeComponent;
export type { SymbolSizeComponentProps };
