"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Stack,
  Paper,
  Button,
  IconButton,
  Typography,
  Autocomplete,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
} from "@mui/material";
import Iconify from "@/components/common/Iconify";
import { ParameterConfig, ParameterItem } from "../types";
import { ElementRenderer } from "./ElementParams";
import { PositionRenderer } from "./PositionParams";
import { StripRenderer } from "../extension/StripParams";
import { MarkerRenderer } from "../extension/MarkerParams";
import { OthersParams } from "./OthersParams";
import { BaseDynamicParams } from "./BaseDynamicParams";

interface DynamicParamsProps {
  /** 可用的参数配置列表 */
  availableParams: ParameterConfig[];
  /** 当前的参数值对象 */
  value: Record<string, any>;
  /** 参数变化时的回调 */
  onChange: (params: Record<string, any>) => void;
}

/**
 * 动态参数组件（最终整合组件）
 * 根据参数类型分发到对应的渲染器：
 * - 原子类型和 arrow -> BaseDynamicParams
 * - element_* 类型 -> ElementRenderer
 * - margin 类型 -> OthersParams
 */
export const DynamicParams: React.FC<DynamicParamsProps> = ({
  availableParams,
  value,
  onChange,
}) => {
  // 用于跟踪是否是内部更新，避免循环更新
  const isInternalUpdate = useRef(false);

  // 获取参数的默认值
  const getDefaultValue = (config: ParameterConfig): any => {
    if (config.default !== undefined) return config.default;
    switch (config.type) {
      case "boolean":
        return false;
      case "number":
        return 0;
      case "numbers":
        return [];
      case "string":
        return "";
      case "strings":
        return [];
      case "list":
        return { type: "list", arguments: {} };
      case "select":
        if (config.options && config.options.length > 0) {
          if (config.default !== undefined) {
            return config.default;
          }
          const firstOption = config.options[0];
          return firstOption;
        }
        return "";
      case "color":
        return "#000000";
      case "colors":
        return ["#000000"];
      case "unit":
        return { type: "unit", arguments: { x: 0.25, units: "in" } };
      case "pair":
        return [0, 0];
      case "element_text":
        return { type: "element_text", arguments: {} };
      case "element_markdown":
        return { type: "element_markdown", arguments: {} };
      case "element_rect":
        return { type: "element_rect", arguments: {} };
      case "element_line":
        return { type: "element_line", arguments: {} };
      case "element_point":
        return { type: "element_point", arguments: {} };
      case "element_polygon":
        return { type: "element_polygon", arguments: {} };
      case "element_geom":
        return { type: "element_geom", arguments: {} };
      case "position":
        return { type: "position", arguments: {} };
      case "position_dodge":
        return { type: "position_dodge", arguments: {} };
      case "position_dodge2":
        return { type: "position_dodge2", arguments: {} };
      case "position_jitter":
        return { type: "position_jitter", arguments: {} };
      case "position_jitterdodge":
        return { type: "position_jitterdodge", arguments: {} };
      case "position_stack":
        return { type: "position_stack", arguments: {} };
      case "position_fill":
        return { type: "position_fill", arguments: {} };
      case "position_nudge":
        return { type: "position_nudge", arguments: {} };
      case "strip":
        return { type: "strip_vanilla", arguments: {} };
      case "strip_vanilla":
        return { type: "strip_vanilla", arguments: {} };
      case "strip_themed":
        return { type: "strip_themed", arguments: {} };
      case "strip_nested":
        return { type: "strip_nested", arguments: {} };
      case "strip_split":
        return { type: "strip_split", arguments: {} };
      case "strip_tag":
        return { type: "strip_tag", arguments: {} };
      case "margin":
        return {
          type: "margin",
          arguments: { t: 0, r: 0, b: 0, l: 0, units: "pt" },
        };
      case "marker":
        return { type: "marker", arguments: { x: "square" } };
      case "arrow":
        return {
          type: "arrow",
          arguments: {
            angle: 0,
            length: { type: "unit", arguments: { x: 0.25, units: "in" } },
            ends: "last",
            type: "open",
          },
        };
      case "gpar":
        return { type: "gpar", arguments: {} };
      default:
        return "";
    }
  };

  // 判断参数类型是否为原子类型（包括 arrow，因为它由简单组件组合而成）
  const isAtomicType = (type: string): boolean => {
    return [
      "select",
      "number",
      "string",
      "boolean",
      "numbers",
      "strings",
      "list",
      "color",
      "colors",
      "unit",
      "pair",
      "arrow",
    ].includes(type);
  };

  // 判断参数类型是否为 strip 类型（包括通用 strip 和具体 strip_* 类型）
  const isStripType = (type: string): boolean => {
    return type === "strip" || type.startsWith("strip_");
  };

  // 判断参数类型是否为 element_* 类型
  const isElementType = (type: string): boolean => {
    return type.startsWith("element_");
  };

  // 判断参数类型是否为 position 类型
  const isPositionType = (type: string): boolean => {
    return type === "position" || type.startsWith("position_");
  };

  // 判断参数类型是否为其他复合类型
  const isOtherCompositeType = (type: string): boolean => {
    return ["margin"].includes(type);
  };

  // 判断参数类型是否为 marker 类型
  const isMarkerType = (type: string): boolean => {
    return type === "marker";
  };

  // 将参数对象转换为数组格式，便于管理
  // 只显示 value 中已存在的参数，不显示所有可用参数
  const [params, setParams] = useState<ParameterItem[]>(() => {
    const initial: ParameterItem[] = [];
    // 只添加 value 中已存在的参数
    Object.keys(value).forEach((key) => {
      const config = availableParams.find((p) => p.name === key);
      if (config) {
        // 如果参数在 availableParams 中定义了，使用配置
        initial.push({
          name: key,
          value: value[key] ?? config.default ?? getDefaultValue(config),
        });
      } else {
        // 如果参数不在 availableParams 中，也添加（可能是动态添加的）
        initial.push({ name: key, value: value[key] });
      }
    });
    return initial;
  });

  // 同步外部 value 变化到内部状态
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    setParams((prevParams) => {
      const newParams: ParameterItem[] = [];
      const valueKeys = new Set(Object.keys(value));

      // 只保留 value 中已存在的参数
      prevParams.forEach((item) => {
        if (valueKeys.has(item.name)) {
          const config = availableParams.find((p) => p.name === item.name);
          newParams.push({
            name: item.name,
            value:
              value[item.name] !== undefined ? value[item.name] : item.value,
          });
        }
      });

      // 添加 value 中存在但 params 中不存在的参数
      Object.keys(value).forEach((key) => {
        if (!prevParams.some((item) => item.name === key)) {
          const config = availableParams.find((p) => p.name === key);
          if (config) {
            newParams.push({
              name: key,
              value: value[key] ?? config.default ?? getDefaultValue(config),
            });
          } else {
            newParams.push({ name: key, value: value[key] });
          }
        }
      });

      return newParams;
    });
  }, [value, availableParams]);

  // 获取已使用的参数名称
  const usedParams = useMemo(
    () => new Set(params.map((p) => p.name)),
    [params]
  );

  // 获取可用的参数（排除已使用的，但保留当前项正在使用的）
  const getAvailableParams = useCallback(
    (currentParam?: string) => {
      return availableParams.filter(
        (p) => !usedParams.has(p.name) || p.name === currentParam
      );
    },
    [availableParams, usedParams]
  );

  // 更新参数
  const updateParam = useCallback(
    (index: number, updates: Partial<ParameterItem>) => {
      isInternalUpdate.current = true;
      const newParams = [...params];
      newParams[index] = { ...newParams[index], ...updates };
      setParams(newParams);

      // 转换为参数对象
      const newParamsObj: Record<string, any> = {};
      newParams.forEach((item) => {
        const config = availableParams.find((p) => p.name === item.name);
        if (config && item.value !== undefined && item.value !== null) {
          // 根据类型转换值
          let convertedValue = item.value;
          if (config.type === "number") {
            convertedValue = Number(item.value);
            if (isNaN(convertedValue)) return; // 跳过无效数字
          } else if (config.type === "select") {
            // select 类型：如果选项是数字类型，确保值是数字
            if (config.options && config.options.length > 0) {
              const isNumericOptions = typeof config.options[0] === "number";
              if (isNumericOptions) {
                convertedValue = Number(item.value);
                if (isNaN(convertedValue)) return; // 跳过无效数字
              } else {
                convertedValue = item.value;
              }
            } else {
              convertedValue = item.value;
            }
          } else if (config.type === "numbers") {
            // numbers 类型：数组，每个元素都是数字
            // 如果值是单个数字，自动转换为数组
            if (!Array.isArray(item.value)) {
              const numValue = Number(item.value);
              convertedValue = !isNaN(numValue) ? [numValue] : [];
            } else {
              convertedValue = item.value
                .map((v) => Number(v))
                .filter((v) => !isNaN(v));
            }
          } else if (config.type === "boolean") {
            convertedValue = Boolean(item.value);
          } else if (config.type === "colors") {
            // colors 类型保持为数组
            convertedValue = Array.isArray(item.value) ? item.value : [];
          } else if (config.type === "strings") {
            // strings 类型保持为数组
            // 如果值是单个字符串，自动转换为数组
            if (!Array.isArray(item.value)) {
              convertedValue =
                item.value !== undefined && item.value !== null
                  ? [String(item.value)]
                  : [];
            } else {
              convertedValue = item.value;
            }
          } else if (config.type === "list") {
            // list 类型保持为对象格式 { type: "list", arguments: {...} }
            convertedValue = item.value;
          } else if (config.type === "pair") {
            // pair 类型：确保是长度为 2 的数组 [x, y]
            if (Array.isArray(item.value) && item.value.length >= 2) {
              convertedValue = [
                Number(item.value[0]) || 0,
                Number(item.value[1]) || 0,
              ];
            } else if (
              item.value &&
              typeof item.value === "object" &&
              !Array.isArray(item.value)
            ) {
              // 向后兼容：处理旧的对象形式 { x, y }
              const objValue = item.value as { x?: number; y?: number };
              convertedValue = [objValue.x ?? 0, objValue.y ?? 0];
            } else {
              convertedValue = [0, 0];
            }
          } else if (
            config.type === "arrow" ||
            config.type === "unit" ||
            config.type === "margin" ||
            config.type.startsWith("element_") ||
            config.type.startsWith("position_") ||
            config.type === "position" ||
            config.type === "strip" ||
            config.type.startsWith("strip_")
          ) {
            // 复杂类型（arrow, unit, margin, element_*, position_*, position, strip, strip_*）保持原样
            convertedValue = item.value;
          }
          newParamsObj[item.name] = convertedValue;
        }
      });
      onChange(newParamsObj);
    },
    [params, onChange, availableParams]
  );

  // 添加新参数
  const addParam = useCallback(() => {
    isInternalUpdate.current = true;
    const available = getAvailableParams();
    if (available.length === 0) {
      return; // 没有可用的参数
    }
    const newParam: ParameterItem = {
      name: available[0].name,
      value: getDefaultValue(available[0]),
    };
    const newParams = [...params, newParam];
    setParams(newParams);

    // 更新参数对象
    const newParamsObj: Record<string, any> = {};
    newParams.forEach((item) => {
      const config = availableParams.find((p) => p.name === item.name);
      if (config && item.value !== undefined && item.value !== null) {
        newParamsObj[item.name] = item.value;
      }
    });
    onChange(newParamsObj);
  }, [params, getAvailableParams, availableParams, onChange]);

  // 删除参数
  const removeParam = useCallback(
    (index: number) => {
      isInternalUpdate.current = true;
      const param = params[index];
      const config = availableParams.find((p) => p.name === param.name);
      // 不能删除必需的参数
      if (config?.required) {
        return;
      }
      const newParams = params.filter((_, i) => i !== index);
      setParams(newParams);

      // 转换为参数对象，只包含新 params 中的参数，确保删除的参数不会传递到后端
      const newParamsObj: Record<string, any> = {};
      newParams.forEach((item) => {
        const config = availableParams.find((p) => p.name === item.name);
        if (config && item.value !== undefined && item.value !== null) {
          newParamsObj[item.name] = item.value;
        }
      });
      // 重要：只传递 newParamsObj，不包含已删除的参数
      onChange(newParamsObj);
    },
    [params, onChange, availableParams]
  );

  // 分离原子类型和其他类型的参数
  const atomicParams = useMemo(() => {
    return params.filter((param) => {
      const config = availableParams.find((p) => p.name === param.name);
      return config && isAtomicType(config.type);
    });
  }, [params, availableParams]);

  const complexParams = useMemo(() => {
    return params.filter((param) => {
      const config = availableParams.find((p) => p.name === param.name);
      return (
        config &&
        !isAtomicType(config.type) &&
        !isElementType(config.type) &&
        !isPositionType(config.type) &&
        !isStripType(config.type) &&
        !isMarkerType(config.type) &&
        !isOtherCompositeType(config.type)
      );
    });
  }, [params, availableParams]);

  const elementParams = useMemo(() => {
    return params.filter((param) => {
      const config = availableParams.find((p) => p.name === param.name);
      return config && isElementType(config.type);
    });
  }, [params, availableParams]);

  const positionParams = useMemo(() => {
    return params.filter((param) => {
      const config = availableParams.find((p) => p.name === param.name);
      return config && isPositionType(config.type);
    });
  }, [params, availableParams]);

  const stripParams = useMemo(() => {
    return params.filter((param) => {
      const config = availableParams.find((p) => p.name === param.name);
      return config && isStripType(config.type);
    });
  }, [params, availableParams]);

  const markerParams = useMemo(() => {
    return params.filter((param) => {
      const config = availableParams.find((p) => p.name === param.name);
      return config && isMarkerType(config.type);
    });
  }, [params, availableParams]);

  const otherCompositeParams = useMemo(() => {
    return params.filter((param) => {
      const config = availableParams.find((p) => p.name === param.name);
      return config && isOtherCompositeType(config.type);
    });
  }, [params, availableParams]);

  // 构建原子类型参数的值对象
  const atomicParamsValue = useMemo(() => {
    const value: Record<string, any> = {};
    atomicParams.forEach((param) => {
      value[param.name] = param.value;
    });
    return value;
  }, [atomicParams]);

  // 构建复合类型参数的值对象
  const complexParamsValue = useMemo(() => {
    const value: Record<string, any> = {};
    complexParams.forEach((param) => {
      value[param.name] = param.value;
    });
    elementParams.forEach((param) => {
      value[param.name] = param.value;
    });
    positionParams.forEach((param) => {
      value[param.name] = param.value;
    });
    stripParams.forEach((param) => {
      value[param.name] = param.value;
    });
    otherCompositeParams.forEach((param) => {
      value[param.name] = param.value;
    });
    return value;
  }, [
    complexParams,
    elementParams,
    positionParams,
    stripParams,
    otherCompositeParams,
  ]);

  // 获取原子类型参数的配置
  const atomicParamsConfig = useMemo(() => {
    return availableParams.filter((config) => isAtomicType(config.type));
  }, [availableParams]);

  // 渲染参数输入组件（根据类型分发到对应的渲染器）
  const renderParamInput = (
    param: ParameterItem,
    index: number,
    config: ParameterConfig
  ) => {
    // element_* 类型 -> ElementRenderer
    if (isElementType(config.type)) {
      return (
        <ElementRenderer
          param={param}
          index={index}
          config={config}
          onUpdate={(value) => updateParam(index, { value })}
        />
      );
    }

    // position_* 类型 -> PositionRenderer
    if (isPositionType(config.type)) {
      return (
        <PositionRenderer
          param={param}
          availableParams={availableParams}
          onUpdate={(value) => updateParam(index, { value })}
        />
      );
    }

    // strip_* 类型 -> StripRenderer
    if (isStripType(config.type)) {
      return (
        <StripRenderer
          param={param}
          availableParams={availableParams}
          onUpdate={(value: any) => updateParam(index, { value })}
        />
      );
    }

    // marker 类型 -> MarkerRenderer
    if (isMarkerType(config.type)) {
      return (
        <MarkerRenderer
          param={param}
          onUpdate={(value: any) => updateParam(index, { value })}
        />
      );
    }

    // 其他复合类型 -> OthersParams
    if (isOtherCompositeType(config.type)) {
      return (
        <OthersParams
          param={param}
          index={index}
          config={config}
          onUpdate={(value: any) => updateParam(index, { value })}
        />
      );
    }

    return null;
  };

  // 处理原子类型参数的变化
  const handleAtomicParamsChange = useCallback(
    (newValue: Record<string, any>) => {
      // 合并原子类型参数和其他类型参数
      const allParams = { ...complexParamsValue, ...newValue };
      onChange(allParams);
    },
    [complexParamsValue, onChange]
  );

  return (
    <Box>
      <Stack spacing={2}>
        {/* 原子类型参数 - 使用 BaseDynamicParams */}
        {atomicParams.length > 0 && (
          <BaseDynamicParams
            availableParams={atomicParamsConfig}
            value={atomicParamsValue}
            onChange={handleAtomicParamsChange}
            nested={false}
          />
        )}

        {/* 复合类型参数 */}
        {elementParams.map((param, index) => {
          const originalIndex = params.findIndex((p) => p.name === param.name);
          const config = availableParams.find((p) => p.name === param.name);
          if (!config) return null;

          const isRequired = config.required || false;
          const available = getAvailableParams(param.name);
          const isElement = true;

          return (
            <Paper
              key={originalIndex}
              sx={{
                p: 2,
                position: "relative",
                backgroundColor: (theme) =>
                  alpha(
                    theme.palette.warning.main,
                    theme.palette.mode === "dark" ? 0.1 : 0.05
                  ),
              }}
              elevation={1}
            >
              {!isRequired && (
                <IconButton
                  onClick={() => removeParam(originalIndex)}
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
              <Stack spacing={2}>
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid size={{ xs: 6 }}>
                    <Autocomplete
                      size="small"
                      fullWidth
                      value={
                        available.find((p) => p.name === param.name) || null
                      }
                      onChange={(_, newValue) => {
                        if (newValue) {
                          updateParam(originalIndex, {
                            name: newValue.name,
                            value: getDefaultValue(newValue),
                          });
                        }
                      }}
                      options={available}
                      getOptionLabel={(option) => String(option.name || "")}
                      disabled={isRequired}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={isRequired ? "必需参数" : "参数名称"}
                        />
                      )}
                      ListboxProps={{
                        style: {
                          maxHeight: 300,
                        },
                      }}
                    />
                  </Grid>
                  {config.type.startsWith("element_") && (
                    <Grid size={{ xs: 6 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Element Type</InputLabel>
                        <Select
                          value={
                            (param.value as any)?.type || config.type || ""
                          }
                          onChange={(e) => {
                            const newType = e.target.value;
                            const currentValue = param.value as any;
                            if (newType === "element_blank") {
                              updateParam(originalIndex, {
                                value: {
                                  type: "element_blank",
                                  arguments: {},
                                },
                              });
                            } else {
                              updateParam(originalIndex, {
                                value: {
                                  type: newType,
                                  arguments: currentValue?.arguments || {},
                                },
                              });
                            }
                          }}
                          label="Element Type"
                        >
                          <MenuItem value={config.type}>{config.type}</MenuItem>
                          <MenuItem value="element_blank">
                            element_blank
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
                <Box>{renderParamInput(param, originalIndex, config)}</Box>
              </Stack>
            </Paper>
          );
        })}

        {positionParams.map((param, index) => {
          const originalIndex = params.findIndex((p) => p.name === param.name);
          const config = availableParams.find((p) => p.name === param.name);
          if (!config) return null;

          const isRequired = config.required || false;
          const available = getAvailableParams(param.name);
          return (
            <Paper
              key={originalIndex}
              sx={{
                p: 2,
                position: "relative",
                backgroundColor: (theme) =>
                  alpha(
                    theme.palette.warning.main,
                    theme.palette.mode === "dark" ? 0.1 : 0.05
                  ),
              }}
              elevation={1}
            >
              {!isRequired && (
                <IconButton
                  onClick={() => removeParam(originalIndex)}
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
              <Stack spacing={2}>
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid
                    size={{
                      xs:
                        config.type === "position" || config.type === "strip"
                          ? 6
                          : 12,
                    }}
                  >
                    <Autocomplete
                      size="small"
                      fullWidth
                      value={
                        available.find((p) => p.name === param.name) || null
                      }
                      onChange={(_, newValue) => {
                        if (newValue) {
                          updateParam(originalIndex, {
                            name: newValue.name,
                            value: getDefaultValue(newValue),
                          });
                        }
                      }}
                      options={available}
                      getOptionLabel={(option) => String(option.name || "")}
                      disabled={isRequired}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={isRequired ? "必需参数" : "参数名称"}
                        />
                      )}
                      ListboxProps={{
                        style: {
                          maxHeight: 300,
                        },
                      }}
                    />
                  </Grid>
                  {config.type === "position" && (
                    <Grid size={{ xs: 6 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Position Type</InputLabel>
                        <Select
                          value={
                            (param.value as any)?.type ||
                            (config as any).default?.type ||
                            (config as any).options?.[0] ||
                            "position_dodge" ||
                            ""
                          }
                          onChange={(e) => {
                            const newType = e.target.value;
                            const currentValue = param.value as any;
                            updateParam(originalIndex, {
                              value: {
                                type: newType,
                                arguments: currentValue?.arguments || {},
                              },
                            });
                          }}
                          label="Position Type"
                        >
                          {(
                            (config as any).options || [
                              "position_dodge",
                              "position_dodge2",
                              "position_jitter",
                              "position_jitterdodge",
                              "position_stack",
                              "position_fill",
                              "position_nudge",
                            ]
                          ).map((type: string) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
                <Box>{renderParamInput(param, originalIndex, config)}</Box>
              </Stack>
            </Paper>
          );
        })}

        {markerParams.map((param, index) => {
          const originalIndex = params.findIndex((p) => p.name === param.name);
          const config = availableParams.find((p) => p.name === param.name);
          if (!config) return null;

          const isRequired = config.required || false;
          return (
            <Paper
              key={originalIndex}
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
              {!isRequired && (
                <IconButton
                  onClick={() => removeParam(originalIndex)}
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
              <Stack spacing={2}>
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                      {config.name}
                    </Typography>
                  </Grid>
                </Grid>
                <Box>{renderParamInput(param, originalIndex, config)}</Box>
              </Stack>
            </Paper>
          );
        })}

        {stripParams.map((param, index) => {
          const originalIndex = params.findIndex((p) => p.name === param.name);
          const config = availableParams.find((p) => p.name === param.name);
          if (!config) return null;

          const isRequired = config.required || false;
          const available = getAvailableParams(param.name);
          return (
            <Paper
              key={originalIndex}
              sx={{
                p: 2,
                position: "relative",
                backgroundColor: (theme) =>
                  alpha(
                    theme.palette.info.main,
                    theme.palette.mode === "dark" ? 0.1 : 0.05
                  ),
              }}
              elevation={1}
            >
              {!isRequired && (
                <IconButton
                  onClick={() => removeParam(originalIndex)}
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
              <Stack spacing={2}>
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid
                    size={{
                      xs:
                        config.type === "position" || config.type === "strip"
                          ? 6
                          : 12,
                    }}
                  >
                    <Autocomplete
                      size="small"
                      fullWidth
                      value={
                        available.find((p) => p.name === param.name) || null
                      }
                      onChange={(_, newValue) => {
                        if (newValue) {
                          updateParam(originalIndex, {
                            name: newValue.name,
                            value: getDefaultValue(newValue),
                          });
                        }
                      }}
                      options={available}
                      getOptionLabel={(option) => String(option.name || "")}
                      disabled={isRequired}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={isRequired ? "必需参数" : "参数名称"}
                        />
                      )}
                      ListboxProps={{
                        style: {
                          maxHeight: 300,
                        },
                      }}
                    />
                  </Grid>
                  {config.type === "strip" && (
                    <Grid size={{ xs: 6 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Strip Type</InputLabel>
                        <Select
                          value={
                            (param.value as any)?.type ||
                            (config as any).default?.type ||
                            (config as any).options?.[0] ||
                            "strip_vanilla" ||
                            ""
                          }
                          onChange={(e) => {
                            const newType = e.target.value;
                            const currentValue = param.value as any;
                            updateParam(originalIndex, {
                              value: {
                                type: newType,
                                arguments: currentValue?.arguments || {},
                              },
                            });
                          }}
                          label="Strip Type"
                        >
                          {(
                            (config as any).options || [
                              "strip_vanilla",
                              "strip_themed",
                              "strip_nested",
                              "strip_split",
                              "strip_tag",
                            ]
                          ).map((type: string) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
                <Box>{renderParamInput(param, originalIndex, config)}</Box>
              </Stack>
            </Paper>
          );
        })}

        {otherCompositeParams.map((param, index) => {
          const originalIndex = params.findIndex((p) => p.name === param.name);
          const config = availableParams.find((p) => p.name === param.name);
          if (!config) return null;

          const isRequired = config.required || false;
          const available = getAvailableParams(param.name);

          return (
            <Paper
              key={originalIndex}
              sx={{
                p: 2,
                position: "relative",
                backgroundColor: (theme) =>
                  alpha(
                    theme.palette.warning.main,
                    theme.palette.mode === "dark" ? 0.1 : 0.05
                  ),
              }}
              elevation={1}
            >
              {!isRequired && (
                <IconButton
                  onClick={() => removeParam(originalIndex)}
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
              <Stack spacing={2}>
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid size={{ xs: 12 }}>
                    <Autocomplete
                      size="small"
                      fullWidth
                      value={
                        available.find((p) => p.name === param.name) || null
                      }
                      onChange={(_, newValue) => {
                        if (newValue) {
                          updateParam(originalIndex, {
                            name: newValue.name,
                            value: getDefaultValue(newValue),
                          });
                        }
                      }}
                      options={available}
                      getOptionLabel={(option) => String(option.name || "")}
                      disabled={isRequired}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={isRequired ? "必需参数" : "参数名称"}
                        />
                      )}
                      ListboxProps={{
                        style: {
                          maxHeight: 300,
                        },
                      }}
                    />
                  </Grid>
                </Grid>
                <Box>{renderParamInput(param, originalIndex, config)}</Box>
              </Stack>
            </Paper>
          );
        })}

        {/* 已添加的参数（仅用于显示其他未分类的参数） */}
        {complexParams.map((param, index) => {
          const originalIndex = params.findIndex((p) => p.name === param.name);
          const config = availableParams.find((p) => p.name === param.name);
          if (!config) return null;

          const isRequired = config.required || false;
          const available = getAvailableParams(param.name);
          const isElement =
            isElementType(config.type) ||
            isOtherCompositeType(config.type) ||
            isPositionType(config.type) ||
            isMarkerType(config.type);

          return (
            <Paper
              key={originalIndex}
              sx={{
                p: 2,
                position: "relative",
                backgroundColor: (theme) =>
                  alpha(
                    theme.palette.warning.main,
                    theme.palette.mode === "dark" ? 0.1 : 0.05
                  ),
              }}
              elevation={1}
            >
              {/* 删除按钮 - 右上角转角中心 */}
              {!isRequired && (
                <IconButton
                  onClick={() => removeParam(originalIndex)}
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
              {isElement ? (
                // Element/Unit/Pair/Arrow 类型：上方参数选择框和类型选择框，下方配置面板（上下排列）
                <Stack spacing={2}>
                  <Grid
                    container
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Grid size={{ xs: 6 }}>
                      <Autocomplete
                        size="small"
                        fullWidth
                        value={
                          available.find((p) => p.name === param.name) || null
                        }
                        onChange={(_, newValue) => {
                          if (newValue) {
                            updateParam(originalIndex, {
                              name: newValue.name,
                              value: getDefaultValue(newValue),
                            });
                          }
                        }}
                        options={available}
                        getOptionLabel={(option) => String(option.name || "")}
                        disabled={isRequired}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={isRequired ? "必需参数" : "参数名称"}
                          />
                        )}
                        ListboxProps={{
                          style: {
                            maxHeight: 300,
                          },
                        }}
                      />
                    </Grid>
                    {/* 类型选择框 - 对 element_* 和 position 类型显示 */}
                    {config.type.startsWith("element_") && (
                      <Grid size={{ xs: 6 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Element Type</InputLabel>
                          <Select
                            value={
                              (param.value as any)?.type || config.type || ""
                            }
                            onChange={(e) => {
                              const newType = e.target.value;
                              const currentValue = param.value as any;
                              if (newType === "element_blank") {
                                updateParam(originalIndex, {
                                  value: {
                                    type: "element_blank",
                                    arguments: {},
                                  },
                                });
                              } else {
                                // 保持原有的 arguments，只更新 type
                                updateParam(originalIndex, {
                                  value: {
                                    type: newType,
                                    arguments: currentValue?.arguments || {},
                                  },
                                });
                              }
                            }}
                            label="Element Type"
                          >
                            <MenuItem value={config.type}>
                              {config.type}
                            </MenuItem>
                            <MenuItem value="element_blank">
                              element_blank
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    {config.type === "position" && (
                      <Grid size={{ xs: 6 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Position Type</InputLabel>
                          <Select
                            value={
                              (param.value as any)?.type ||
                              (config as any).default?.type ||
                              (config as any).options?.[0] ||
                              "position_dodge" ||
                              ""
                            }
                            onChange={(e) => {
                              const newType = e.target.value;
                              const currentValue = param.value as any;
                              updateParam(originalIndex, {
                                value: {
                                  type: newType,
                                  arguments: currentValue?.arguments || {},
                                },
                              });
                            }}
                            label="Position Type"
                          >
                            {(
                              (config as any).options || [
                                "position_dodge",
                                "position_dodge2",
                                "position_jitter",
                                "position_jitterdodge",
                                "position_stack",
                                "position_fill",
                                "position_nudge",
                              ]
                            ).map((type: string) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    {config.type === "strip" && (
                      <Grid size={{ xs: 6 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Strip Type</InputLabel>
                          <Select
                            value={
                              (param.value as any)?.type ||
                              (config as any).default?.type ||
                              (config as any).options?.[0] ||
                              "strip_vanilla" ||
                              ""
                            }
                            onChange={(e) => {
                              const newType = e.target.value;
                              const currentValue = param.value as any;
                              updateParam(originalIndex, {
                                value: {
                                  type: newType,
                                  arguments: currentValue?.arguments || {},
                                },
                              });
                            }}
                            label="Strip Type"
                          >
                            {(
                              (config as any).options || [
                                "strip_vanilla",
                                "strip_themed",
                                "strip_nested",
                                "strip_split",
                                "strip_tag",
                              ]
                            ).map((type: string) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                  </Grid>
                  {/* Element/Position/Other 配置面板 */}
                  <Box>{renderParamInput(param, originalIndex, config)}</Box>
                </Stack>
              ) : (
                // 其他类型：左侧参数选择，右侧值输入（左右排列）
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid size={{ xs: 6 }}>
                    <Autocomplete
                      size="small"
                      fullWidth
                      value={
                        available.find((p) => p.name === param.name) || null
                      }
                      onChange={(_, newValue) => {
                        if (newValue) {
                          updateParam(originalIndex, {
                            name: newValue.name,
                            value: getDefaultValue(newValue),
                          });
                        }
                      }}
                      options={available}
                      getOptionLabel={(option) => String(option.name || "")}
                      disabled={isRequired}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={isRequired ? "必需参数" : "参数名称"}
                        />
                      )}
                      ListboxProps={{
                        style: {
                          maxHeight: 300,
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    {renderParamInput(param, originalIndex, config)}
                  </Grid>
                </Grid>
              )}
            </Paper>
          );
        })}

        {/* 添加按钮 */}
        {getAvailableParams().length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              onClick={addParam}
              startIcon={<Iconify icon="gridicons:add" size={24} />}
              sx={{
                backgroundColor: (theme) =>
                  alpha(
                    theme.palette.warning.main,
                    theme.palette.mode === "dark" ? 0.1 : 0.05
                  ),
                color: "warning.main",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "action.hover",
                },
              }}
            >
              添加参数
            </Button>
          </Box>
        )}

        {params.length === 0 && (
          <Paper sx={{ p: 3, textAlign: "center" }} elevation={1}>
            <Typography variant="body2" color="text.secondary">
              暂无参数，点击按钮添加
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};
