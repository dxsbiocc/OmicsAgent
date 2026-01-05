"use client";

import { useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Stack,
} from "@mui/material";
import { FacetConfig, ParameterConfig } from "../types";
import { DynamicParams } from "../common/DynamicParams";

interface FacetConfigProps {
  params: FacetConfig;
  onChange: (facet: FacetConfig) => void;
  columns?: string[]; // 可用的列名
}

// facet_wrap 特定参数
const facetWrapParams: ParameterConfig[] = [
  {
    name: "nrow",
    type: "number",
    min: 1,
  },
  {
    name: "ncol",
    type: "number",
    min: 1,
  },
  {
    name: "dir",
    type: "select",
    options: ["h", "v"],
    default: "h",
  },
  {
    name: "strip.position",
    type: "select",
    options: ["top", "bottom", "left", "right"],
    default: "top",
  },
];

// facet_wrap2 特定参数（ggh4x 包）
const facetWrap2Params: ParameterConfig[] = [
  {
    name: "nrow",
    type: "number",
    min: 1,
  },
  {
    name: "ncol",
    type: "number",
    min: 1,
  },
  {
    name: "dir",
    type: "select",
    options: ["h", "v"],
    default: "h",
  },
  {
    name: "strip.position",
    type: "select",
    options: ["top", "bottom", "left", "right"],
    default: "top",
  },
  {
    name: "trim_blank",
    type: "boolean",
    default: false,
  },
  {
    name: "remove_labels",
    type: "select",
    options: ["none", "x", "y", "all"],
    default: "none",
  },
  {
    name: "strip",
    type: "strip",
    options: [
      "strip_vanilla",
      "strip_themed",
      "strip_nested",
      "strip_split",
      "strip_tag",
    ],
    default: { type: "strip_vanilla", arguments: {} },
  },
];

// facet_grid 特定参数
const facetGridParams: ParameterConfig[] = [
  {
    name: "space",
    type: "select",
    options: ["fixed", "free_x", "free_y", "free"],
    default: "fixed",
  },
  {
    name: "margins",
    type: "boolean",
    default: false,
  },
];

// 共通参数
const commonFacetParams: ParameterConfig[] = [
  {
    name: "scales",
    type: "select",
    options: ["fixed", "free_x", "free_y", "free"],
    default: "fixed",
  },
  {
    name: "shrink",
    type: "boolean",
    default: true,
  },
  {
    name: "labeller",
    type: "string",
    default: "label_value",
  },
  {
    name: "as.table",
    type: "boolean",
    default: true,
  },
  {
    name: "drop",
    type: "boolean",
    default: true,
  },
  {
    name: "axes",
    type: "select",
    options: ["margins", "all", "x", "y"],
    default: "margins",
  },
  {
    name: "axis.labels",
    type: "select",
    options: ["all", "margins", "x", "y"],
    default: "all",
  },
];

export const FacetConfigComponent: React.FC<FacetConfigProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  // 确保 params 有默认值
  const safeParams = useMemo(() => {
    return {
      type: params.type || "facet_grid",
      arguments: params.arguments || {},
    };
  }, [params]);

  const updateParams = useCallback(
    (newParams: Record<string, any>) => {
      // 完全替换 arguments，而不是合并，这样可以确保删除的参数被移除
      onChange({
        ...safeParams,
        arguments: newParams,
      });
    },
    [safeParams, onChange]
  );

  // 处理 facets/rows/cols 的值（可能是字符串或数组）
  const getFacetValue = useCallback(
    (key: "facets" | "rows" | "cols") => {
      const value = safeParams.arguments?.[key];
      if (Array.isArray(value)) {
        return value;
      }
      if (typeof value === "string" && value) {
        return [value];
      }
      return [];
    },
    [safeParams.arguments]
  );

  const handleFacetChange = useCallback(
    (key: "facets" | "rows" | "cols", newValue: string[]) => {
      // 如果只有一个值，存储为字符串；多个值存储为数组
      const newArguments = { ...safeParams.arguments };
      if (newValue.length === 0) {
        delete newArguments[key];
      } else if (newValue.length === 1) {
        newArguments[key] = newValue[0];
      } else {
        newArguments[key] = newValue;
      }
      updateParams(newArguments);
    },
    [safeParams.arguments, updateParams]
  );

  // 构建传递给 DynamicParams 的 value 对象（排除 facets/rows/cols）
  const dynamicParamsValue = useMemo(() => {
    const value: Record<string, any> = {};
    if (safeParams.arguments) {
      const args = safeParams.arguments as Record<string, any>;
      Object.keys(args).forEach((key) => {
        // 排除 facets/rows/cols，这些由专门的组件处理
        // strip 参数现在由 DynamicParams 处理，不需要排除
        if (
          key !== "facets" &&
          key !== "rows" &&
          key !== "cols" &&
          args[key] !== undefined
        ) {
          value[key] = args[key];
        }
      });
    }
    return value;
  }, [safeParams.arguments]);

  const handleParamsChange = useCallback(
    (newParams: Record<string, any>) => {
      // 合并 facets/rows/cols 和动态参数
      const currentFacets = safeParams.arguments?.facets;
      const currentRows = safeParams.arguments?.rows;
      const currentCols = safeParams.arguments?.cols;
      const mergedParams = {
        ...newParams,
        ...(currentFacets !== undefined && { facets: currentFacets }),
        ...(currentRows !== undefined && { rows: currentRows }),
        ...(currentCols !== undefined && { cols: currentCols }),
      };
      updateParams(mergedParams);
    },
    [safeParams.arguments, updateParams]
  );

  // 根据 facet 类型获取可用参数
  const availableParams = useMemo(() => {
    if (safeParams.type === "facet_wrap") {
      return [...commonFacetParams, ...facetWrapParams];
    }
    if (safeParams.type === "facet_wrap2") {
      return [...commonFacetParams, ...facetWrap2Params];
    }
    return [...commonFacetParams, ...facetGridParams];
  }, [safeParams.type]);

  return (
    <Box>
      <Paper sx={{ p: 2 }} elevation={1}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          分面配置
        </Typography>
        <Stack spacing={3}>
          {/* 分面类型选择 */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>分面类型</InputLabel>
                <Select
                  value={safeParams.type}
                  onChange={(e) =>
                    onChange({
                      ...safeParams,
                      type: e.target.value as
                        | "facet_grid"
                        | "facet_wrap"
                        | "facet_wrap2",
                    })
                  }
                  label="分面类型"
                >
                  <MenuItem value="facet_grid">facet_grid</MenuItem>
                  <MenuItem value="facet_wrap">facet_wrap</MenuItem>
                  <MenuItem value="facet_wrap2">facet_wrap2 (ggh4x)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* facet_wrap 和 facet_wrap2 的 facets 选择 */}
          {(safeParams.type === "facet_wrap" ||
            safeParams.type === "facet_wrap2") && (
            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
                Facets
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                size="small"
                options={columns}
                value={getFacetValue("facets")}
                onChange={(_, newValue) => {
                  handleFacetChange("facets", newValue);
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, idx) => (
                    <Chip label={option} {...getTagProps({ index: idx })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Facets"
                    placeholder="输入或选择列名"
                  />
                )}
              />
            </Paper>
          )}

          {/* facet_grid 的 rows 和 cols 选择 */}
          {safeParams.type === "facet_grid" && (
            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
                Grid Layout
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Autocomplete
                    multiple
                    freeSolo
                    size="small"
                    options={columns}
                    value={getFacetValue("rows")}
                    onChange={(_, newValue) => {
                      handleFacetChange("rows", newValue);
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, idx) => (
                        <Chip label={option} {...getTagProps({ index: idx })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Rows"
                        placeholder="输入或选择列名"
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Autocomplete
                    multiple
                    freeSolo
                    size="small"
                    options={columns}
                    value={getFacetValue("cols")}
                    onChange={(_, newValue) => {
                      handleFacetChange("cols", newValue);
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, idx) => (
                        <Chip label={option} {...getTagProps({ index: idx })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cols"
                        placeholder="输入或选择列名"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* 动态参数配置 */}
          <Paper sx={{ p: 2 }} elevation={1}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
              参数设置
            </Typography>
            <DynamicParams
              availableParams={availableParams}
              value={dynamicParamsValue}
              onChange={handleParamsChange}
            />
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
};
