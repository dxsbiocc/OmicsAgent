"use client";

import { useCallback, useState, useEffect } from "react";
import {
  Box,
  Stack,
  Paper,
  TextField,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  alpha,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import Iconify from "@/components/common/Iconify";
import { NumberField } from "@/components/common";
import { ParameterItem } from "../types";

interface ListParamsProps {
  param: ParameterItem;
  onUpdate: (value: any) => void;
}

interface ListItem {
  key: string;
  value: any;
  valueType: "string" | "number" | "boolean";
}

/**
 * List 参数组件
 * 用于编辑 R 中的键值对 list 类型
 * 格式：{ type: "list", arguments: { key1: value1, key2: value2, ... } }
 */
export const ListParams: React.FC<ListParamsProps> = ({ param, onUpdate }) => {
  // 解析当前值
  const parseValue = useCallback((value: any): ListItem[] => {
    if (!value) return [];

    // 如果值已经是 { type: "list", arguments: {...} } 格式
    if (value.type === "list" && value.arguments) {
      return Object.entries(value.arguments).map(([key, val]) => ({
        key,
        value: val,
        valueType:
          typeof val === "boolean"
            ? "boolean"
            : typeof val === "number"
            ? "number"
            : "string",
      }));
    }

    // 如果值是普通对象
    if (typeof value === "object" && !Array.isArray(value) && value !== null) {
      return Object.entries(value).map(([key, val]) => ({
        key,
        value: val,
        valueType:
          typeof val === "boolean"
            ? "boolean"
            : typeof val === "number"
            ? "number"
            : "string",
      }));
    }

    return [];
  }, []);

  const [items, setItems] = useState<ListItem[]>(() => parseValue(param.value));
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // 当外部值变化时同步
  useEffect(() => {
    setItems(parseValue(param.value));
  }, [param.value, parseValue]);

  // 更新值
  const updateValue = useCallback(
    (newItems: ListItem[]) => {
      setItems(newItems);
      // 转换为 { type: "list", arguments: {...} } 格式
      const argumentsObj: Record<string, any> = {};
      newItems.forEach((item) => {
        if (item.key.trim()) {
          argumentsObj[item.key] = item.value;
        }
      });
      onUpdate({
        type: "list",
        arguments: argumentsObj,
      });
    },
    [onUpdate]
  );

  // 添加新项
  const handleAdd = useCallback(() => {
    // 暂时显示提示信息
    setSnackbarOpen(true);
    // TODO: 实现添加功能
    // const newItems = [
    //   ...items,
    //   { key: "", value: "", valueType: "string" as const },
    // ];
    // updateValue(newItems);
  }, []);

  // 删除项
  const handleRemove = useCallback(
    (index: number) => {
      const newItems = items.filter((_, i) => i !== index);
      updateValue(newItems);
    },
    [items, updateValue]
  );

  // 更新键
  const handleKeyChange = useCallback(
    (index: number, newKey: string) => {
      const newItems = [...items];
      newItems[index].key = newKey;
      updateValue(newItems);
    },
    [items, updateValue]
  );

  // 更新值（带类型校验）
  const handleValueChange = useCallback(
    (
      index: number,
      newValue: any,
      valueType: "string" | "number" | "boolean"
    ) => {
      const newItems = [...items];
      let validatedValue: any = newValue;

      // 根据类型进行校验和转换
      if (valueType === "boolean") {
        // 布尔值：接受 true/false 或字符串 "true"/"false"
        if (typeof newValue === "boolean") {
          validatedValue = newValue;
        } else if (typeof newValue === "string") {
          const lower = newValue.toLowerCase().trim();
          if (lower === "true" || lower === "1") {
            validatedValue = true;
          } else if (lower === "false" || lower === "0" || lower === "") {
            validatedValue = false;
          } else {
            // 无效的布尔值，保持原值但标记为错误
            validatedValue = newValue;
          }
        } else {
          validatedValue = Boolean(newValue);
        }
      } else if (valueType === "number") {
        // 数字：尝试转换为数字
        const numValue = Number(newValue);
        if (isNaN(numValue)) {
          // 如果转换失败，保持原值（可能是用户正在输入）
          validatedValue = newValue;
        } else {
          validatedValue = numValue;
        }
      } else {
        // 字符串：直接使用
        validatedValue = String(newValue);
      }

      newItems[index].value = validatedValue;
      updateValue(newItems);
    },
    [items, updateValue]
  );

  // 更新值类型
  const handleValueTypeChange = useCallback(
    (index: number, newType: "string" | "number" | "boolean") => {
      const newItems = [...items];
      const item = newItems[index];
      const oldValue = item.value;
      item.valueType = newType;

      // 根据新类型转换值
      if (newType === "boolean") {
        if (typeof oldValue === "boolean") {
          item.value = oldValue;
        } else if (typeof oldValue === "string") {
          const lower = oldValue.toLowerCase().trim();
          item.value = lower === "true" || lower === "1";
        } else {
          item.value = Boolean(oldValue);
        }
      } else if (newType === "number") {
        const numValue = Number(oldValue);
        item.value = isNaN(numValue) ? 0 : numValue;
      } else {
        item.value = String(oldValue);
      }

      updateValue(newItems);
    },
    [items, updateValue]
  );

  // 验证值是否有效
  const isValidValue = useCallback(
    (value: any, valueType: "string" | "number" | "boolean"): boolean => {
      if (valueType === "boolean") {
        return (
          typeof value === "boolean" ||
          (typeof value === "string" &&
            (value.toLowerCase().trim() === "true" ||
              value.toLowerCase().trim() === "false" ||
              value.toLowerCase().trim() === "1" ||
              value.toLowerCase().trim() === "0" ||
              value.trim() === ""))
        );
      } else if (valueType === "number") {
        return !isNaN(Number(value)) && value !== "";
      } else {
        return true; // 字符串总是有效的
      }
    },
    []
  );

  return (
    <Box>
      <Stack spacing={2}>
        {items.map((item, index) => {
          const isValueValid = isValidValue(item.value, item.valueType);

          return (
            <Paper
              key={index}
              sx={{
                p: 2,
                position: "relative",
                backgroundColor: (theme) =>
                  alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark" ? 0.1 : 0.05
                  ),
              }}
              elevation={1}
            >
              <Stack spacing={1.5}>
                {/* 键名输入行 */}
                <TextField
                  size="small"
                  label="参数名"
                  value={item.key}
                  onChange={(e) => handleKeyChange(index, e.target.value)}
                  fullWidth
                  placeholder="例如: paired, size, method"
                />

                {/* 值输入行 */}
                <Grid container spacing={1} alignItems="center">
                  <Grid size={{ xs: 6 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>值类型</InputLabel>
                      <Select
                        value={item.valueType}
                        label="值类型"
                        onChange={(e) =>
                          handleValueTypeChange(
                            index,
                            e.target.value as "string" | "number" | "boolean"
                          )
                        }
                      >
                        <MenuItem value="string">字符串</MenuItem>
                        <MenuItem value="number">数字</MenuItem>
                        <MenuItem value="boolean">布尔值</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    {item.valueType === "boolean" ? (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(item.value)}
                            onChange={(e) =>
                              handleValueChange(
                                index,
                                e.target.checked,
                                "boolean"
                              )
                            }
                          />
                        }
                        label={item.value ? "true" : "false"}
                      />
                    ) : item.valueType === "number" ? (
                      <Box>
                        <NumberField
                          value={
                            typeof item.value === "number"
                              ? item.value
                              : item.value === ""
                              ? undefined
                              : Number(item.value) || 0
                          }
                          onChange={(value) =>
                            handleValueChange(index, value ?? 0, "number")
                          }
                          size="small"
                          fullWidth
                          label="值"
                          error={!isValueValid}
                        />
                        {!isValueValid && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 0.5, ml: 1.75 }}
                          >
                            请输入有效的数字
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <TextField
                        size="small"
                        label="值"
                        value={String(item.value ?? "")}
                        onChange={(e) =>
                          handleValueChange(index, e.target.value, "string")
                        }
                        fullWidth
                        placeholder="例如: 'text', 'method'"
                        error={!isValueValid}
                        helperText={
                          !isValueValid ? "请输入有效的字符串" : undefined
                        }
                      />
                    )}
                  </Grid>
                </Grid>

                {/* 删除按钮 */}
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <IconButton
                    onClick={() => handleRemove(index)}
                    size="small"
                    color="error"
                    sx={{
                      minWidth: 32,
                      width: 32,
                      height: 32,
                    }}
                  >
                    <Iconify icon="mdi:delete" size={20} />
                  </IconButton>
                </Box>
              </Stack>
            </Paper>
          );
        })}

        {/* 添加按钮 */}
        <Box>
          <IconButton
            onClick={handleAdd}
            size="small"
            color="primary"
            sx={{
              border: 1,
              borderStyle: "dashed",
              borderColor: "divider",
              borderRadius: 1,
              width: "100%",
              py: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Iconify icon="mdi:plus" size={20} />
              <Typography variant="body2">添加键值对</Typography>
            </Box>
          </IconButton>
        </Box>
      </Stack>

      {/* Snackbar 提示 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="info"
          sx={{ width: "100%" }}
        >
          该功能正在开发中，敬请期待！
        </Alert>
      </Snackbar>
    </Box>
  );
};
