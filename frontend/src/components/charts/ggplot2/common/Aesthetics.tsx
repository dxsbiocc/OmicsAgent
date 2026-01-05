"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Stack,
  Paper,
  Typography,
  Grid,
  alpha,
  Button,
  Autocomplete,
  TextField,
} from "@mui/material";
import Iconify from "@/components/common/Iconify";
import { AestheticConfig } from "../types";

interface AestheticMapping {
  aesthetic: string; // 映射参数，如 colour, fill
  column: string; // 列名
}

interface AestheticsProps {
  /** 可定义的映射参数列表，如 ['colour', 'fill', 'alpha', 'size'] */
  availableAesthetics: string[];
  /** 用户可选择的列名列表 */
  availableColumns: string[];
  /** 当前的美学映射对象 */
  value: AestheticConfig;
  /** 映射变化时的回调 */
  onChange: (mapping: AestheticConfig) => void;
  /** 必需的映射参数（如 x, y），这些会始终显示且不能删除 */
  requiredAesthetics?: string[];
}

export const Aesthetics: React.FC<AestheticsProps> = ({
  availableAesthetics,
  availableColumns,
  value,
  onChange,
  requiredAesthetics = ["x", "y"],
}) => {
  // 用于跟踪是否是内部更新，避免循环更新
  const isInternalUpdate = useRef(false);

  // 将当前映射转换为数组格式，便于管理
  const [mappings, setMappings] = useState<AestheticMapping[]>(() => {
    const initial: AestheticMapping[] = [];
    // 添加必需的映射（即使没有值也显示）
    requiredAesthetics.forEach((aes) => {
      initial.push({ aesthetic: aes, column: value[aes] ?? "" });
    });
    // 添加其他映射
    Object.keys(value).forEach((key) => {
      if (
        !requiredAesthetics.includes(key) &&
        value[key] !== undefined &&
        value[key] !== null &&
        value[key] !== "" &&
        availableAesthetics.includes(key)
      ) {
        initial.push({ aesthetic: key, column: value[key] });
      }
    });
    return initial;
  });

  // 同步外部 value 变化到内部状态（仅在非内部更新时）
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    setMappings((prevMappings) => {
      // 构建新的映射数组，保留当前 mappings 中已有的项（即使 value 中没有对应的列名）
      const newMappings: AestheticMapping[] = [];

      // 添加必需的映射（即使没有值也显示）
      requiredAesthetics.forEach((aes) => {
        newMappings.push({ aesthetic: aes, column: value[aes] ?? "" });
      });

      // 保留当前 mappings 中已有的非必需映射项
      prevMappings.forEach((m) => {
        if (!requiredAesthetics.includes(m.aesthetic)) {
          // 如果 value 中有对应的列名，使用 value 中的值；否则保留当前的 column（可能是空字符串）
          const columnFromValue = value[m.aesthetic];
          newMappings.push({
            aesthetic: m.aesthetic,
            column: columnFromValue !== undefined ? columnFromValue : m.column,
          });
        }
      });

      // 添加 value 中存在但 mappings 中不存在的映射
      Object.keys(value).forEach((key) => {
        if (
          !requiredAesthetics.includes(key) &&
          value[key] !== undefined &&
          value[key] !== null &&
          value[key] !== "" &&
          availableAesthetics.includes(key) &&
          !prevMappings.some((m) => m.aesthetic === key)
        ) {
          newMappings.push({ aesthetic: key, column: value[key] });
        }
      });

      return newMappings;
    });
  }, [value, requiredAesthetics, availableAesthetics]);

  // 获取已使用的映射参数
  const usedAesthetics = useMemo(
    () => new Set(mappings.map((m) => m.aesthetic)),
    [mappings]
  );

  // 获取可用的映射参数（排除已使用的，但保留当前项正在使用的）
  const getAvailableAesthetics = useCallback(
    (currentAesthetic?: string) => {
      return availableAesthetics.filter(
        (aes) => !usedAesthetics.has(aes) || aes === currentAesthetic
      );
    },
    [availableAesthetics, usedAesthetics]
  );

  // 更新映射
  const updateMapping = useCallback(
    (index: number, updates: Partial<AestheticMapping>) => {
      isInternalUpdate.current = true;
      const newMappings = [...mappings];
      newMappings[index] = { ...newMappings[index], ...updates };
      setMappings(newMappings);

      // 转换为 Aesthetic 对象（只包含有列名的映射）
      const newAesthetic: AestheticConfig = {} as AestheticConfig;
      newMappings.forEach((m) => {
        if (m.column) {
          newAesthetic[m.aesthetic] = m.column;
        }
      });
      onChange(newAesthetic);
    },
    [mappings, onChange]
  );

  // 添加新映射
  const addMapping = useCallback(() => {
    isInternalUpdate.current = true;
    const available = getAvailableAesthetics();
    if (available.length === 0) {
      return; // 没有可用的映射参数
    }
    const newMapping: AestheticMapping = {
      aesthetic: available[0],
      column: "",
    };
    const newMappings = [...mappings, newMapping];
    setMappings(newMappings);
  }, [mappings, getAvailableAesthetics]);

  // 删除映射
  const removeMapping = useCallback(
    (index: number) => {
      isInternalUpdate.current = true;
      const mapping = mappings[index];
      // 不能删除必需的映射
      if (requiredAesthetics.includes(mapping.aesthetic)) {
        return;
      }
      const newMappings = mappings.filter((_, i) => i !== index);
      setMappings(newMappings);

      // 转换为 Aesthetic 对象（只包含有列名的映射）
      const newAesthetic: AestheticConfig = {} as AestheticConfig;
      newMappings.forEach((m) => {
        if (m.column) {
          newAesthetic[m.aesthetic] = m.column;
        }
      });
      onChange(newAesthetic);
    },
    [mappings, onChange, requiredAesthetics]
  );

  return (
    <Box>
      <Stack spacing={2}>
        {mappings.map((mapping, index) => {
          const isRequired = requiredAesthetics.includes(mapping.aesthetic);
          const availableAes = getAvailableAesthetics(mapping.aesthetic);

          return (
            <Paper
              key={index}
              sx={{
                p: 2,
                position: "relative",
                backgroundColor: (theme) =>
                  alpha(
                    theme.palette.success.main,
                    theme.palette.mode === "dark" ? 0.1 : 0.05
                  ),
              }}
              elevation={1}
            >
              {/* 删除按钮 - 右上角转角中心 */}
              {!isRequired && (
                <IconButton
                  onClick={() => removeMapping(index)}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    zIndex: 1,
                    padding: 0.5,
                    minWidth: 20,
                    width: 20,
                    height: 20,
                    backgroundColor: "error.main",
                    color: "error.contrastText",
                    boxShadow: 1,
                    "&:hover": {
                      backgroundColor: "error.dark",
                    },
                  }}
                >
                  <Iconify icon="icon-park-twotone:applet-closed" size={12} />
                </IconButton>
              )}
              <Grid
                container
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>
                      {isRequired ? "必需映射" : "映射参数"}
                    </InputLabel>
                    <Select
                      value={mapping.aesthetic}
                      onChange={(e) =>
                        updateMapping(index, { aesthetic: e.target.value })
                      }
                      label={isRequired ? "必需映射" : "映射参数"}
                      disabled={isRequired}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                          },
                        },
                      }}
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
                  <Autocomplete
                    freeSolo
                    forcePopupIcon
                    size="small"
                    fullWidth
                    options={availableColumns}
                    value={mapping.column ?? ""}
                    onChange={(_, newValue) =>
                      updateMapping(index, { column: newValue ?? "" })
                    }
                    onInputChange={(_, newInputValue, reason) => {
                      if (reason === "input") {
                        updateMapping(index, { column: newInputValue });
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="列名" />
                    )}
                    ListboxProps={{
                      style: {
                        maxHeight: 300,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          );
        })}

        {/* 添加按钮 */}
        {getAvailableAesthetics().length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              color="success"
              onClick={addMapping}
              startIcon={<Iconify icon="gridicons:add" size={24} />}
              sx={{
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "action.hover",
                },
              }}
            >
              添加映射
            </Button>
          </Box>
        )}

        {mappings.length === 0 && (
          <Paper sx={{ p: 3, textAlign: "center" }} elevation={1}>
            <Typography variant="body2" color="text.secondary">
              暂无映射，点击按钮添加
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};
