"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Switch,
  FormControlLabel,
  Autocomplete,
  Chip,
  Typography,
  Paper,
  IconButton,
  alpha,
  Button,
} from "@mui/material";
import { ColorPicker, NumberField } from "@/components/common";
import Iconify from "@/components/common/Iconify";
import {
  ParameterConfig,
  ParameterItem,
  UnitConfig,
  ArrowConfig,
  GparConfig,
} from "../types";
import { Arrow, Unit, Gpar } from "../grid";
import { ListParams } from "./ListParams";
import { ColorRamp2Component } from "../../circlize/common/ColorRamp2Component";
import { ColorRamp2Config } from "../../circlize/type";

interface BaseDynamicParamsProps {
  /** 可用的参数配置列表 */
  availableParams: ParameterConfig[];
  /** 当前的参数值对象 */
  value: Record<string, any>;
  /** 参数变化时的回调 */
  onChange: (params: Record<string, any>) => void;
  /** 是否为嵌套组件（用于设置不同的背景色） */
  nested?: boolean;
}

/**
 * 基础动态参数组件
 * 处理原子类型：select, number, string, boolean, numbers, strings, list, color, colors, unit, pair
 * 以及复合类型：arrow（由简单组件组合而成）
 * 其他复合类型（element_*, margin）由其他组件处理
 */
export const BaseDynamicParams: React.FC<BaseDynamicParamsProps> = ({
  availableParams,
  value,
  onChange,
  nested = false,
}) => {
  // 用于跟踪是否是内部更新，避免循环更新
  const isInternalUpdate = useRef(false);

  // 获取参数的默认值（处理原子类型和 arrow）
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
      case "colorRamp2":
        return {
          type: "colorRamp2",
          arguments: {
            breaks: [0, 1],
            colors: ["#000000", "#FFFFFF"],
            transparency: 0,
            space: "RGB",
            hcl_palette: "",
            reverse: false,
          },
        };
      case "unit":
        return { type: "unit", arguments: { x: 0.25, units: "in" } };
      case "pair":
        return [0, 0];
      case "arrow":
        return {
          type: "arrow",
          arguments: {
            angle: 30,
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

  // 将参数对象转换为数组格式，便于管理
  // 只显示 value 中已存在的参数，不显示所有可用参数
  const [params, setParams] = useState<ParameterItem[]>(() => {
    const initial: ParameterItem[] = [];
    // 只添加 value 中已存在的参数
    Object.keys(value).forEach((key) => {
      const config = availableParams.find((p) => p.name === key);
      if (config) {
        // 如果参数在 availableParams 中定义了，使用配置
        let paramValue =
          value[key] ?? config.default ?? getDefaultValue(config);
        // 对于 numbers 和 strings 类型，如果值是单个值，转换为数组
        if (
          config.type === "numbers" &&
          !Array.isArray(paramValue) &&
          paramValue !== undefined &&
          paramValue !== null
        ) {
          const numValue = Number(paramValue);
          paramValue = !isNaN(numValue) ? [numValue] : [];
        } else if (
          config.type === "strings" &&
          !Array.isArray(paramValue) &&
          paramValue !== undefined &&
          paramValue !== null
        ) {
          paramValue = [String(paramValue)];
        }
        // list 类型保持原样，不需要转换
        initial.push({
          name: key,
          value: paramValue,
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
          let paramValue =
            value[item.name] !== undefined ? value[item.name] : item.value;
          // 对于 numbers 和 strings 类型，如果值是单个值，转换为数组
          if (
            config &&
            config.type === "numbers" &&
            !Array.isArray(paramValue) &&
            paramValue !== undefined &&
            paramValue !== null
          ) {
            const numValue = Number(paramValue);
            paramValue = !isNaN(numValue) ? [numValue] : [];
          } else if (
            config &&
            config.type === "strings" &&
            !Array.isArray(paramValue) &&
            paramValue !== undefined &&
            paramValue !== null
          ) {
            paramValue = [String(paramValue)];
          }
          // list 类型保持原样，不需要转换
          newParams.push({
            name: item.name,
            value: paramValue,
          });
        }
      });

      // 添加 value 中存在但 params 中不存在的参数
      Object.keys(value).forEach((key) => {
        if (!prevParams.some((item) => item.name === key)) {
          const config = availableParams.find((p) => p.name === key);
          if (config) {
            let paramValue =
              value[key] ?? config.default ?? getDefaultValue(config);
            // 对于 numbers 和 strings 类型，如果值是单个值，转换为数组
            if (
              config.type === "numbers" &&
              !Array.isArray(paramValue) &&
              paramValue !== undefined &&
              paramValue !== null
            ) {
              const numValue = Number(paramValue);
              paramValue = !isNaN(numValue) ? [numValue] : [];
            } else if (
              config.type === "strings" &&
              !Array.isArray(paramValue) &&
              paramValue !== undefined &&
              paramValue !== null
            ) {
              paramValue = [String(paramValue)];
            }
            // list 类型保持原样，不需要转换
            newParams.push({
              name: key,
              value: paramValue,
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
            // 如果 step 为 1，转换为整数
            if (config.step === 1) {
              convertedValue = Math.floor(convertedValue);
            }
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
          } else if (config.type === "colorRamp2") {
            // colorRamp2 类型保持为对象格式 { type: "colorRamp2", arguments: {...} }
            convertedValue = item.value;
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
          } else if (config.type === "unit") {
            // unit 类型保持原样
            convertedValue = item.value;
          } else if (config.type === "arrow") {
            // arrow 类型保持原样
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

  // 渲染参数输入组件（只处理原子类型）
  const renderParamInput = (
    param: ParameterItem,
    index: number,
    config: ParameterConfig
  ) => {
    const isDisabled = config.disabled
      ? config.disabled(params, param.name)
      : false;

    switch (config.type) {
      case "select":
        const options = config.options || [];
        const isNumericOptions =
          options.length > 0 && typeof options[0] === "number";

        let selectValue: any = param.value ?? "";
        if (isNumericOptions && selectValue !== "") {
          selectValue =
            typeof selectValue === "number" ? selectValue : Number(selectValue);
          if (isNaN(selectValue)) {
            selectValue = options[0];
          }
        }

        return (
          <FormControl fullWidth size="small" disabled={isDisabled}>
            <InputLabel>{config.name}</InputLabel>
            <Select
              value={selectValue}
              onChange={(e) => {
                const value = isNumericOptions
                  ? Number(e.target.value)
                  : e.target.value;
                updateParam(index, { value });
              }}
              label={config.name}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              {options.map((opt) => {
                return (
                  <MenuItem key={String(opt)} value={opt}>
                    {String(opt)}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        );

      case "number":
        return (
          <NumberField
            fullWidth
            size="small"
            label={config.name}
            value={param.value ?? 0}
            onChange={(value: number) => updateParam(index, { value })}
            min={config.min}
            max={config.max}
            step={config.step ?? 0.1}
            disabled={isDisabled}
          />
        );

      case "string":
        return (
          <TextField
            fullWidth
            size="small"
            label={config.name}
            value={param.value ?? ""}
            onChange={(e) => updateParam(index, { value: e.target.value })}
            disabled={isDisabled}
          />
        );

      case "strings":
        // 如果值是单个字符串，转换为数组
        const stringsValue = Array.isArray(param.value)
          ? param.value
          : param.value !== undefined && param.value !== null
          ? [String(param.value)]
          : [];
        // 如果配置中有 options，使用预定义选项（多选），否则允许自由输入
        const stringsOptions = config.options
          ? config.options.map((opt) => String(opt))
          : [];
        return (
          <Autocomplete
            multiple
            freeSolo={!config.options || config.options.length === 0}
            size="small"
            options={stringsOptions}
            value={stringsValue.map((v) => String(v))}
            onChange={(_, newValue) => {
              updateParam(index, { value: newValue });
            }}
            getOptionLabel={(option) => String(option || "")}
            renderTags={(value, getTagProps) =>
              value.map((option, idx) => (
                <Chip label={String(option)} {...getTagProps({ index: idx })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={config.name}
                placeholder={
                  config.options && config.options.length > 0
                    ? "从选项中选择或输入自定义值"
                    : "输入字符串后按回车添加"
                }
              />
            )}
            disabled={isDisabled}
          />
        );

      case "numbers":
        // 如果值是单个数字，转换为数组
        const numbersValue = Array.isArray(param.value)
          ? param.value
          : param.value !== undefined && param.value !== null
          ? (() => {
              const numValue = Number(param.value);
              return !isNaN(numValue) ? [numValue] : [];
            })()
          : [];
        return (
          <Autocomplete
            multiple
            freeSolo
            size="small"
            options={[]}
            value={numbersValue.map((v) => String(v))}
            onChange={(_, newValue) => {
              const numbers = newValue
                .map((v) => {
                  const num = Number(v);
                  return isNaN(num) ? null : num;
                })
                .filter((v) => v !== null) as number[];
              updateParam(index, { value: numbers });
            }}
            getOptionLabel={(option) => String(option || "")}
            renderTags={(value, getTagProps) =>
              value.map((option, idx) => (
                <Chip label={String(option)} {...getTagProps({ index: idx })} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={config.name}
                placeholder="输入数字后按回车添加"
                type="number"
              />
            )}
            disabled={isDisabled}
          />
        );

      case "list":
        return (
          <ListParams
            param={param}
            onUpdate={(value: any) => updateParam(index, { value })}
          />
        );

      case "boolean":
        return (
          <FormControlLabel
            control={
              <Switch
                checked={param.value ?? false}
                onChange={(e) =>
                  updateParam(index, { value: e.target.checked })
                }
              />
            }
            label={config.name}
          />
        );

      case "color":
        return (
          <ColorPicker
            value={param.value as string}
            onChange={(color) => updateParam(index, { value: color })}
          />
        );

      case "colors":
        return (
          <ColorPicker
            value={Array.isArray(param.value) ? param.value : []}
            onChange={(colors) => updateParam(index, { value: colors })}
            maxColors={10}
          />
        );

      case "colorRamp2": {
        const colorRamp2Value = param.value as ColorRamp2Config | undefined;
        return (
          <ColorRamp2Component
            value={colorRamp2Value}
            onChange={(config) => updateParam(index, { value: config })}
          />
        );
      }

      case "unit": {
        const unitValue = param.value as UnitConfig | undefined;
        const unit: UnitConfig =
          unitValue ||
          ({
            type: "unit",
            arguments: { x: 0.25, units: "in" },
          } as UnitConfig);

        return (
          <Unit
            unit={unit}
            onChange={(updatedUnit) =>
              updateParam(index, { value: updatedUnit })
            }
          />
        );
      }

      case "pair": {
        // 处理 pair 值：支持数组 [x, y] 或旧的对象形式 { x, y }
        let positionArray: [number, number] = [0, 0];
        if (Array.isArray(param.value) && param.value.length >= 2) {
          positionArray = [
            Number(param.value[0]) || 0,
            Number(param.value[1]) || 0,
          ];
        } else if (
          param.value &&
          typeof param.value === "object" &&
          !Array.isArray(param.value)
        ) {
          // 向后兼容：处理旧的对象形式 { x, y }
          const objValue = param.value as { x?: number; y?: number };
          positionArray = [objValue.x ?? 0, objValue.y ?? 0];
        }

        const [x, y] = positionArray;
        return (
          <Stack direction="row" spacing={2} alignItems="center">
            <NumberField
              fullWidth
              size="small"
              label="X"
              value={x}
              onChange={(newX) => {
                updateParam(index, {
                  value: [newX, y],
                });
              }}
              step={0.1}
            />
            <NumberField
              fullWidth
              size="small"
              label="Y"
              value={y}
              onChange={(newY) => {
                updateParam(index, {
                  value: [x, newY],
                });
              }}
              step={0.1}
            />
          </Stack>
        );
      }

      case "arrow": {
        const arrowValue = param.value as ArrowConfig | undefined;
        const arrow: ArrowConfig =
          arrowValue ||
          ({
            type: "arrow",
            arguments: {
              angle: 30,
              length: { type: "unit", arguments: { x: 0.25, units: "in" } },
              ends: "last",
              type: "open",
            },
          } as ArrowConfig);

        return (
          <Arrow
            arrow={arrow}
            onChange={(updatedArrow) =>
              updateParam(index, { value: updatedArrow })
            }
          />
        );
      }

      case "gpar": {
        const gparValue = param.value as GparConfig | undefined;
        const gpar: GparConfig =
          gparValue ||
          ({
            type: "gpar",
            arguments: {},
          } as GparConfig);

        return (
          <Gpar
            params={gpar}
            onChange={(updatedGpar) =>
              updateParam(index, { value: updatedGpar || undefined })
            }
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <Box>
      <Stack spacing={2}>
        {/* 已添加的参数 */}
        {params.map((param, index) => {
          const config = availableParams.find((p) => p.name === param.name);
          if (!config) return null;

          const isRequired = config.required || false;
          const available = getAvailableParams(param.name);
          const isColor = config.type === "color" || config.type === "colors";
          const isArrow = config.type === "arrow";
          const isUnit = config.type === "unit";
          const isGpar = config.type === "gpar";
          const isColorRamp2 = config.type === "colorRamp2";
          const isFullWidth =
            config.type === "numbers" ||
            config.type === "list" ||
            config.type === "strings";

          return (
            <Paper
              key={index}
              sx={{
                p: 2,
                position: "relative",
                backgroundColor: nested
                  ? (theme) =>
                      alpha(
                        theme.palette.info.main,
                        theme.palette.mode === "dark" ? 0.1 : 0.05
                      )
                  : (theme) =>
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
                  onClick={() => removeParam(index)}
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
              {isColor ? (
                // 颜色类型：上方参数选择框，下方颜色选择面板（上下排列）
                <Stack spacing={2}>
                  <Autocomplete
                    size="small"
                    fullWidth
                    value={available.find((p) => p.name === param.name) || null}
                    onChange={(_, newValue) => {
                      if (newValue) {
                        updateParam(index, {
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
                  {/* 颜色选择面板 */}
                  <Box>{renderParamInput(param, index, config)}</Box>
                </Stack>
              ) : isArrow ? (
                // arrow 类型：上方参数选择框，下方 Arrow 组件（上下排列，占据整行）
                <Stack spacing={2}>
                  <Autocomplete
                    size="small"
                    fullWidth
                    value={available.find((p) => p.name === param.name) || null}
                    onChange={(_, newValue) => {
                      if (newValue) {
                        updateParam(index, {
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
                  {/* Arrow 组件占据整行 */}
                  <Box>{renderParamInput(param, index, config)}</Box>
                </Stack>
              ) : isUnit ? (
                // unit 类型：上方参数选择框，下方 Unit 组件（上下排列，占据整行）
                <Stack spacing={2}>
                  <Autocomplete
                    size="small"
                    fullWidth
                    value={available.find((p) => p.name === param.name) || null}
                    onChange={(_, newValue) => {
                      if (newValue) {
                        updateParam(index, {
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
                  {/* Unit 组件占据整行 */}
                  <Box>{renderParamInput(param, index, config)}</Box>
                </Stack>
              ) : isGpar ? (
                // gpar 类型：上方参数选择框，下方 Gpar 组件（上下排列，占据整行）
                <Stack spacing={2}>
                  <Autocomplete
                    size="small"
                    fullWidth
                    value={available.find((p) => p.name === param.name) || null}
                    onChange={(_, newValue) => {
                      if (newValue) {
                        updateParam(index, {
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
                  {/* Gpar 组件占据整行 */}
                  <Box>{renderParamInput(param, index, config)}</Box>
                </Stack>
              ) : isColorRamp2 ? (
                // colorRamp2 类型：上方参数选择框，下方 ColorRamp2Component（上下排列，占据整行）
                <Stack spacing={2}>
                  <Autocomplete
                    size="small"
                    fullWidth
                    value={available.find((p) => p.name === param.name) || null}
                    onChange={(_, newValue) => {
                      if (newValue) {
                        updateParam(index, {
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
                  {/* ColorRamp2Component 作为嵌套子组件占据整行 */}
                  <Box>{renderParamInput(param, index, config)}</Box>
                </Stack>
              ) : isFullWidth ? (
                // numbers, list, strings 类型：上方参数选择框，下方输入组件（上下排列，占据整行）
                <Stack spacing={2}>
                  <Autocomplete
                    size="small"
                    fullWidth
                    value={available.find((p) => p.name === param.name) || null}
                    onChange={(_, newValue) => {
                      if (newValue) {
                        updateParam(index, {
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
                  {/* 输入组件占据整行 */}
                  <Box>{renderParamInput(param, index, config)}</Box>
                </Stack>
              ) : (
                // 其他类型：左侧参数选择，右侧值输入（左右排列）
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ flex: 1 }}>
                    <Autocomplete
                      size="small"
                      fullWidth
                      value={
                        available.find((p) => p.name === param.name) || null
                      }
                      onChange={(_, newValue) => {
                        if (newValue) {
                          updateParam(index, {
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
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    {renderParamInput(param, index, config)}
                  </Box>
                </Stack>
              )}
            </Paper>
          );
        })}

        {/* 添加按钮 */}
        {getAvailableParams().length > 0 && nested && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              color="info"
              startIcon={<Iconify icon="gridicons:add" size={24} />}
              onClick={addParam}
              sx={{
                backgroundColor: (theme) =>
                  alpha(
                    theme.palette.info.main,
                    theme.palette.mode === "dark" ? 0.1 : 0.05
                  ),
                color: "info.main",
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
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              暂无参数，点击按钮添加
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
};
