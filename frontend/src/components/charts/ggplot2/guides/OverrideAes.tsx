"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Stack,
  Paper,
  Typography,
  Grid,
  Button,
} from "@mui/material";
import Iconify from "@/components/common/Iconify";
import { availableAestheticsTypes } from "../common/constants";

interface OverrideAesItem {
  aes: string; // 选择的 aes，如 size, color, fill
  value: string | number; // 输入的值，可以是字符串或数字
}

interface OverrideAesProps {
  value:
    | { type: "list"; arguments: Record<string, string | number> }
    | undefined;
  onChange: (value: {
    type: "list";
    arguments: Record<string, string | number>;
  }) => void;
}

/**
 * OverrideAes 组件
 * 用于处理 override.aes 参数，格式为 {type: 'list', arguments: {size: 1}}
 */
export const OverrideAes: React.FC<OverrideAesProps> = ({
  value,
  onChange,
}) => {
  // 将 value 转换为内部格式
  const [items, setItems] = useState<OverrideAesItem[]>(() => {
    if (value?.arguments) {
      return Object.entries(value.arguments).map(([aes, val]) => ({
        aes,
        value: val,
      }));
    }
    return [];
  });

  // 当外部 value 变化时，同步内部状态
  useEffect(() => {
    if (value?.arguments) {
      const newItems = Object.entries(value.arguments).map(([aes, val]) => ({
        aes,
        value: val,
      }));
      setItems(newItems);
    } else {
      setItems([]);
    }
  }, [value]);

  // 获取已使用的 aes
  const usedAes = useMemo(
    () => new Set(items.map((item) => item.aes)),
    [items]
  );

  // 获取可用的 aes（排除已使用的）
  const getAvailableAes = useCallback(
    (currentAes?: string) => {
      return availableAestheticsTypes.filter(
        (aes) => !usedAes.has(aes) || aes === currentAes
      );
    },
    [usedAes]
  );

  // 更新单个项
  const updateItem = useCallback(
    (index: number, updates: Partial<OverrideAesItem>) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], ...updates };
      setItems(newItems);

      // 转换为目标格式
      const argumentsObj: Record<string, string | number> = {};
      newItems.forEach((item) => {
        if (item.aes && item.value !== undefined && item.value !== "") {
          // 尝试转换为数字，如果失败则保持字符串
          const numValue = Number(item.value);
          argumentsObj[item.aes] = isNaN(numValue)
            ? String(item.value)
            : numValue;
        }
      });

      onChange({
        type: "list",
        arguments: argumentsObj,
      });
    },
    [items, onChange]
  );

  // 删除项
  const removeItem = useCallback(
    (index: number) => {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);

      // 转换为目标格式
      const argumentsObj: Record<string, string | number> = {};
      newItems.forEach((item) => {
        if (item.aes && item.value !== undefined && item.value !== "") {
          const numValue = Number(item.value);
          argumentsObj[item.aes] = isNaN(numValue)
            ? String(item.value)
            : numValue;
        }
      });

      onChange({
        type: "list",
        arguments: argumentsObj,
      });
    },
    [items, onChange]
  );

  // 添加新项
  const addItem = useCallback(() => {
    const available = getAvailableAes();
    if (available.length === 0) return;

    const newItem: OverrideAesItem = {
      aes: available[0],
      value: "",
    };
    const newItems = [...items, newItem];
    setItems(newItems);

    // 转换为目标格式
    const argumentsObj: Record<string, string | number> = {};
    newItems.forEach((item) => {
      if (item.aes && item.value !== undefined && item.value !== "") {
        const numValue = Number(item.value);
        argumentsObj[item.aes] = isNaN(numValue)
          ? String(item.value)
          : numValue;
      }
    });

    onChange({
      type: "list",
      arguments: argumentsObj,
    });
  }, [items, getAvailableAes, onChange]);

  return (
    <Box>
      <Stack spacing={1}>
        {items.map((item, index) => {
          const availableAes = getAvailableAes(item.aes);
          return (
            <Paper key={index} sx={{ p: 2 }} elevation={1}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 5 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>AES</InputLabel>
                    <Select
                      value={item.aes || ""}
                      onChange={(e) =>
                        updateItem(index, { aes: e.target.value })
                      }
                      label="AES"
                    >
                      {availableAes.map((aes) => (
                        <MenuItem key={aes} value={aes}>
                          {aes}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="值"
                    value={item.value ?? ""}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // 尝试转换为数字，如果失败则保持字符串
                      const numValue = Number(inputValue);
                      updateItem(index, {
                        value:
                          isNaN(numValue) || inputValue === ""
                            ? inputValue
                            : numValue,
                      });
                    }}
                    placeholder="输入数值或字符串"
                  />
                </Grid>
                <Grid size={{ xs: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => removeItem(index)}
                    color="error"
                  >
                    <Iconify icon="mdi:delete" size={20} />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          );
        })}

        {getAvailableAes().length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              color="success"
              onClick={addItem}
              startIcon={<Iconify icon="gridicons:add" size={24} />}
            >
              添加覆盖项
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
};
