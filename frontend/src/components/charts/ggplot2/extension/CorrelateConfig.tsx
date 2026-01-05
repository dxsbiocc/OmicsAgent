"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Paper,
  Typography,
  Stack,
  Box,
  IconButton,
  Grid,
  Autocomplete,
  Chip,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import Iconify from "@/components/common/Iconify";
import { CorrelateConfig } from "../types";
import { DynamicParams } from "../common/DynamicParams";
import { ParameterConfig } from "../types";

interface CorrelateConfigProps {
  params?: CorrelateConfig;
  onChange: (config: CorrelateConfig | undefined) => void;
  /** 可选择的列名列表 */
  columns?: string[];
}

// correlate 参数配置
export const correlateParams: ParameterConfig[] = [
  {
    name: "method",
    type: "select",
    options: ["pearson", "spearman", "kendall"],
    default: "pearson",
  },
  {
    name: "engine",
    type: "select",
    options: ["default", "WGCNA", "picante", "Hmisc", "psych"],
    default: "default",
  },
  {
    name: "x",
    type: "strings",
  },
  {
    name: "y",
    type: "strings",
  },
  {
    name: "group",
    type: "strings",
  },
  {
    name: "use",
    type: "select",
    options: [
      "everything",
      "all.obs",
      "complete.obs",
      "na.or.complete",
      "pairwise.complete.obs",
    ],
  },
  {
    name: "adjust",
    type: "select",
    options: [
      "none",
      "holm",
      "hochberg",
      "hommel",
      "bonferroni",
      "BH",
      "BY",
      "fdr",
    ],
  },
  {
    name: "adjust_method",
    type: "select",
    options: [
      "none",
      "holm",
      "hochberg",
      "hommel",
      "bonferroni",
      "BH",
      "BY",
      "fdr",
    ],
  },
  {
    name: "cor.test",
    type: "boolean",
    default: false,
  },
];

export const CorrelateConfigComponent: React.FC<CorrelateConfigProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  // 如果配置中不存在 correlate 字段，不显示组件
  if (!params) {
    return null;
  }

  const updateParams = useCallback(
    (newParams: Record<string, any>) => {
      onChange({
        ...params,
        ...newParams,
      });
    },
    [params, onChange]
  );

  // 选择模式：'x' 或 'y'
  const [selectionMode, setSelectionMode] = useState<"x" | "y">("x");

  // 获取当前选择的值（根据选择模式）
  const currentValue = useMemo(() => {
    const value = selectionMode === "x" ? params.x : params.y;
    if (Array.isArray(value)) return value;
    if (value !== undefined && value !== null) return [value];
    return [];
  }, [params.x, params.y, selectionMode]);

  // 处理选择变化
  const handleSelectionChange = useCallback(
    (newSelection: string[]) => {
      // 计算另一个参数的值（所有列名减去当前选择的列名）
      const otherSelection = columns.filter(
        (col) => !newSelection.includes(col)
      );

      if (selectionMode === "x") {
        updateParams({
          x: newSelection,
          y: otherSelection,
        });
      } else {
        updateParams({
          x: otherSelection,
          y: newSelection,
        });
      }
    },
    [selectionMode, columns, updateParams]
  );

  // 处理选择模式切换
  const handleModeChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newMode: "x" | "y" | null) => {
      if (newMode !== null) {
        setSelectionMode(newMode);
      }
    },
    []
  );

  // 其他参数（排除 x 和 y）
  const otherParams = useMemo(() => {
    return correlateParams.filter((p) => p.name !== "x" && p.name !== "y");
  }, []);

  const otherParamsValue = useMemo(() => {
    const { x, y, ...rest } = params;
    return rest;
  }, [params]);

  const handleRemove = useCallback(() => {
    onChange(undefined);
  }, [onChange]);

  return (
    <Paper sx={{ p: 2, position: "relative" }} elevation={1}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          相关性计算 (correlate)
        </Typography>
        <IconButton
          size="small"
          color="error"
          onClick={handleRemove}
          sx={{
            minWidth: 32,
            width: 32,
            height: 32,
          }}
        >
          <Iconify icon="mdi:delete" size={20} />
        </IconButton>
      </Box>
      <Stack spacing={2}>
        {/* x 和 y 参数的特殊处理 */}
        <Box>
          <Box sx={{ mb: 1 }}>
            <ToggleButtonGroup
              value={selectionMode}
              exclusive
              onChange={handleModeChange}
              size="small"
              aria-label="选择模式"
            >
              <ToggleButton value="x" aria-label="选择 x">
                选择 x
              </ToggleButton>
              <ToggleButton value="y" aria-label="选择 y">
                选择 y
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Autocomplete
            multiple
            size="small"
            options={columns}
            value={currentValue}
            onChange={(_, newValue) => handleSelectionChange(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  size="small"
                  {...getTagProps({ index })}
                  key={option}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={`${selectionMode.toUpperCase()} (列名)`}
                placeholder="选择列名"
                helperText={
                  selectionMode === "x"
                    ? `已选择 ${currentValue.length} 个列，剩余 ${
                        columns.length - currentValue.length
                      } 个列将自动分配给 y`
                    : `已选择 ${currentValue.length} 个列，剩余 ${
                        columns.length - currentValue.length
                      } 个列将自动分配给 x`
                }
              />
            )}
            ListboxProps={{
              style: {
                maxHeight: 300,
              },
            }}
          />
        </Box>
        {/* 其他参数 */}
        <DynamicParams
          availableParams={otherParams}
          value={otherParamsValue}
          onChange={updateParams}
        />
      </Stack>
    </Paper>
  );
};
