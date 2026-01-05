"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import {
  Settings,
  Image,
  Animation,
  Palette,
  AspectRatio,
} from "@mui/icons-material";

// 参数类型定义
interface ParameterSchema {
  [key: string]: {
    type: string | string[];
    description?: string;
    default?: any;
    min?: number;
    max?: number;
    step?: number;
    options?: string[];
  };
}

interface DynamicParameterFormProps {
  toolInfo?: {
    name: string;
    description?: string;
    params_schema?: ParameterSchema;
    defaults?: { [key: string]: any };
  };
  metaData?: {
    name: string;
    description: string;
    params: Record<string, any>;
    additional_params?: Record<string, any>;
  };
  tableData?: any[]; // 添加表格数据用于列选择
  mode?: "js" | "py" | "r"; // 新增：模式支持
  onParametersChange?: (params: { [key: string]: any }) => void;
  onSubmit?: (params: { [key: string]: any }) => void;
}

export default function DynamicParameterForm({
  toolInfo,
  metaData,
  tableData = [],
  mode = "js",
  onParametersChange,
  onSubmit,
}: DynamicParameterFormProps) {
  const [parameters, setParameters] = useState<{ [key: string]: any }>({});

  // 初始化参数
  useEffect(() => {
    if (metaData) {
      // 优先使用metaData中的默认值
      const defaultParams: { [key: string]: any } = {};

      // 处理主要参数
      if (metaData.params && typeof metaData.params === "object") {
        Object.entries(metaData.params).forEach(
          ([key, param]: [string, any]) => {
            if (param.default !== undefined && param.default !== null) {
              defaultParams[key] = param.default;
            }
          }
        );
      }

      // 处理额外参数
      if (
        metaData.additional_params &&
        typeof metaData.additional_params === "object"
      ) {
        Object.entries(metaData.additional_params).forEach(
          ([key, param]: [string, any]) => {
            if (param.default !== undefined && param.default !== null) {
              defaultParams[key] = param.default;
            }
          }
        );
      }

      setParameters(defaultParams);
    } else if (toolInfo?.defaults) {
      setParameters(toolInfo.defaults);
    }
  }, [metaData, toolInfo]);

  // 参数变化时通知父组件（只有动态模式才实时响应）
  useEffect(() => {
    if (onParametersChange && mode === "js") {
      onParametersChange(parameters);
    }
  }, [parameters, onParametersChange, mode]);

  // 获取表格列名
  const getTableColumns = (): string[] => {
    if (tableData.length === 0) return [];
    return Object.keys(tableData[0] || {});
  };

  // 判断是否为数据列参数
  const isDataColumnParam = (key: string): boolean => {
    return (
      key.includes("_axis") ||
      key.includes("_col") ||
      key.includes("column") ||
      key.includes("field") ||
      key.includes("x_") ||
      key.includes("y_")
    );
  };

  // 渲染不同类型的参数控件
  const renderParameterControl = (key: string, schema: any) => {
    if (!schema) return null;

    const value = parameters[key] ?? schema.default;
    const paramType = schema.type;
    const columns = getTableColumns();

    // 如果是数据列参数且有表格数据，显示列选择框
    if (isDataColumnParam(key) && columns.length > 0) {
      return (
        <FormControl key={key} size="small" fullWidth>
          <InputLabel>{key}</InputLabel>
          <Select
            value={value || ""}
            label={key}
            onChange={(e) =>
              setParameters((prev) => ({ ...prev, [key]: e.target.value }))
            }
          >
            <MenuItem value="">
              <em>无</em>
            </MenuItem>
            {columns.map((column) => (
              <MenuItem key={column} value={column}>
                {column}
              </MenuItem>
            ))}
          </Select>
          {schema.description && (
            <Typography variant="caption" color="text.secondary">
              {schema.description}
            </Typography>
          )}
        </FormControl>
      );
    }

    switch (paramType) {
      case "string":
        return (
          <TextField
            key={key}
            label={key}
            value={value || ""}
            onChange={(e) =>
              setParameters((prev) => ({ ...prev, [key]: e.target.value }))
            }
            fullWidth
            size="small"
            helperText={schema.description}
          />
        );

      case "number":
        if (schema.min !== undefined && schema.max !== undefined) {
          return (
            <Box key={key}>
              <Typography gutterBottom>
                {key}: {value}
              </Typography>
              <Slider
                value={value || schema.default || 0}
                onChange={(_, newValue) =>
                  setParameters((prev) => ({ ...prev, [key]: newValue }))
                }
                min={schema.min}
                max={schema.max}
                step={schema.step || 1}
                marks={[
                  { value: schema.min, label: schema.min.toString() },
                  { value: schema.max, label: schema.max.toString() },
                ]}
              />
            </Box>
          );
        } else {
          return (
            <TextField
              key={key}
              label={key}
              type="number"
              value={value || ""}
              onChange={(e) =>
                setParameters((prev) => ({
                  ...prev,
                  [key]: Number(e.target.value),
                }))
              }
              fullWidth
              size="small"
              helperText={schema.description}
            />
          );
        }

      case "integer":
        return (
          <TextField
            key={key}
            label={key}
            type="number"
            value={value || ""}
            onChange={(e) =>
              setParameters((prev) => ({
                ...prev,
                [key]: parseInt(e.target.value) || 0,
              }))
            }
            fullWidth
            size="small"
            helperText={schema.description}
          />
        );

      case "boolean":
        return (
          <FormControlLabel
            key={key}
            control={
              <Switch
                checked={value || false}
                onChange={(e) =>
                  setParameters((prev) => ({
                    ...prev,
                    [key]: e.target.checked,
                  }))
                }
              />
            }
            label={key}
          />
        );

      case "select":
        return (
          <FormControl key={key} size="small" fullWidth>
            <InputLabel>{key}</InputLabel>
            <Select
              value={value || ""}
              label={key}
              onChange={(e) =>
                setParameters((prev) => ({ ...prev, [key]: e.target.value }))
              }
            >
              <MenuItem value="">
                <em>无</em>
              </MenuItem>
              {schema.options?.map((option: string) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {schema.description && (
              <Typography variant="caption" color="text.secondary">
                {schema.description}
              </Typography>
            )}
          </FormControl>
        );

      case "object":
        // 对于复杂对象，显示一个简化的配置界面
        return (
          <Box key={key}>
            <Typography variant="subtitle2" gutterBottom>
              {key}
            </Typography>
            {schema.description && (
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {schema.description}
              </Typography>
            )}
            {schema.properties &&
              typeof schema.properties === "object" &&
              Object.entries(schema.properties).map(
                ([propKey, propSchema]: [string, any]) => (
                  <Box key={propKey} sx={{ ml: 2, mb: 1 }}>
                    {renderParameterControl(`${key}.${propKey}`, propSchema)}
                  </Box>
                )
              )}
          </Box>
        );

      case "unit":
        return (
          <Box key={key}>
            <TextField
              label={key}
              value={value || ""}
              onChange={(e) =>
                setParameters((prev) => ({ ...prev, [key]: e.target.value }))
              }
              fullWidth
              size="small"
              helperText={
                schema.description || `单位: ${schema.unit || "inches"}`
              }
            />
          </Box>
        );

      default:
        return (
          <TextField
            key={key}
            label={key}
            value={value || ""}
            onChange={(e) =>
              setParameters((prev) => ({ ...prev, [key]: e.target.value }))
            }
            fullWidth
            size="small"
            helperText={schema.description}
          />
        );
    }
  };

  // 获取参数分组
  const getParameterGroups = () => {
    const schema = metaData
      ? {
          ...(metaData.params && typeof metaData.params === "object"
            ? metaData.params
            : {}),
          ...(metaData.additional_params &&
          typeof metaData.additional_params === "object"
            ? metaData.additional_params
            : {}),
        }
      : toolInfo?.params_schema;
    if (!schema) return { data: [], appearance: [], layout: [], other: [] };

    const groups: { [key: string]: string[] } = {
      data: [],
      appearance: [],
      layout: [],
      other: [],
    };

    Object.keys(schema).forEach((key) => {
      // 数据相关参数
      if (
        key.includes("_axis") ||
        key.includes("_col") ||
        key.includes("data") ||
        key.includes("x_") ||
        key.includes("y_")
      ) {
        groups.data.push(key);
      }
      // 外观相关参数
      else if (
        key.includes("color") ||
        key.includes("colour") ||
        key.includes("size") ||
        key.includes("style") ||
        key.includes("theme") ||
        key.includes("line") ||
        key.includes("alpha") ||
        key.includes("arrow")
      ) {
        groups.appearance.push(key);
      }
      // 布局相关参数
      else if (
        key.includes("width") ||
        key.includes("height") ||
        key.includes("title") ||
        key.includes("label") ||
        key.includes("lab") ||
        key.includes("legend") ||
        key.includes("orientation")
      ) {
        groups.layout.push(key);
      }
      // 其他参数
      else {
        groups.other.push(key);
      }
    });

    return groups;
  };

  const parameterGroups = getParameterGroups();

  return (
    <Box>
      <Stack spacing={3}>
        {/* 动态参数分组 */}
        {(metaData || toolInfo?.params_schema) && (
          <>
            {/* 数据参数 */}
            {parameterGroups.data.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Settings sx={{ mr: 1, verticalAlign: "middle" }} />
                  数据参数
                </Typography>
                <Stack spacing={2}>
                  {parameterGroups.data.map((key) => {
                    const schema =
                      metaData?.params[key] ||
                      metaData?.additional_params?.[key] ||
                      toolInfo?.params_schema?.[key];
                    return renderParameterControl(key, schema);
                  })}
                </Stack>
              </Paper>
            )}

            {/* 外观参数 */}
            {parameterGroups.appearance.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Palette sx={{ mr: 1, verticalAlign: "middle" }} />
                  外观设置
                </Typography>
                <Stack spacing={2}>
                  {parameterGroups.appearance.map((key) => {
                    const schema =
                      metaData?.params[key] ||
                      metaData?.additional_params?.[key] ||
                      toolInfo?.params_schema?.[key];
                    return renderParameterControl(key, schema);
                  })}
                </Stack>
              </Paper>
            )}

            {/* 布局参数 */}
            {parameterGroups.layout.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <AspectRatio sx={{ mr: 1, verticalAlign: "middle" }} />
                  布局设置
                </Typography>
                <Stack spacing={2}>
                  {parameterGroups.layout.map((key) => {
                    const schema =
                      metaData?.params[key] ||
                      metaData?.additional_params?.[key] ||
                      toolInfo?.params_schema?.[key];
                    return renderParameterControl(key, schema);
                  })}
                </Stack>
              </Paper>
            )}

            {/* 其他参数 */}
            {parameterGroups.other.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <Settings sx={{ mr: 1, verticalAlign: "middle" }} />
                  其他设置
                </Typography>
                <Stack spacing={2}>
                  {parameterGroups.other.map((key) => {
                    const schema =
                      metaData?.params[key] ||
                      metaData?.additional_params?.[key] ||
                      toolInfo?.params_schema?.[key];
                    return renderParameterControl(key, schema);
                  })}
                </Stack>
              </Paper>
            )}
          </>
        )}

        {/* 渲染模式说明 */}
        <Paper sx={{ p: 2, bgcolor: "info.light", color: "info.contrastText" }}>
          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center", mb: 1 }}
          >
            <Settings sx={{ mr: 1, fontSize: "small" }} />
            <strong>渲染模式说明</strong>
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
            <strong>静态图表 (R/matplotlib)</strong>:
            数据传递到后端，保存为临时文件，后端生成图片
          </Typography>
          <Typography variant="caption" sx={{ display: "block" }}>
            <strong>动态图表 (ECharts.js)</strong>:
            直接读取前端数据表格内容，使用前端代码进行图片绘制
          </Typography>
        </Paper>

        {/* 模式提示和操作按钮 */}
        {mode === "js" ? (
          <Paper
            sx={{
              p: 2,
              bgcolor: "success.light",
              color: "success.contrastText",
            }}
          >
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Animation sx={{ mr: 1, fontSize: "small" }} />
              动态图模式：参数调整将实时更新图表，无需点击生成按钮
            </Typography>
          </Paper>
        ) : (
          <Paper
            sx={{
              p: 2,
              bgcolor: "warning.light",
              color: "warning.contrastText",
            }}
          >
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", mb: 2 }}
            >
              <Image sx={{ mr: 1, fontSize: "small" }} />
              静态图模式：调整参数后需要点击绘制按钮生成图表
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => onSubmit && onSubmit(parameters)}
              startIcon={<Image />}
            >
              绘制静态图
            </Button>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}
