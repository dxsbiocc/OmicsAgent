"use client";

import { useCallback } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Paper,
  Typography,
  Grid,
  alpha,
  useTheme,
  Autocomplete,
  Chip,
} from "@mui/material";
import { ArrowConfig, UnitConfig } from "../types";

interface ArrowProps {
  arrow: ArrowConfig;
  onChange: (arrow: ArrowConfig) => void;
}

interface UnitProps {
  unit: UnitConfig;
  onChange: (unit: UnitConfig) => void;
}

// Unit 组件需要在 Arrow 组件之前定义，以便 Arrow 可以使用它
export const Unit: React.FC<UnitProps> = ({ unit, onChange }) => {
  const xValue = unit?.arguments?.x;
  const unitsValue = unit?.arguments?.units;

  // 处理 x：支持单个值或数组，转换为数组格式用于显示
  const xArray = Array.isArray(xValue)
    ? xValue
    : xValue !== undefined
    ? [xValue]
    : [0];

  // 处理 units：支持单个值或数组，转换为数组格式用于显示
  const unitsArray = Array.isArray(unitsValue)
    ? unitsValue
    : unitsValue !== undefined
    ? [unitsValue]
    : ["pt"];

  const updateUnit = useCallback(
    (updates: Partial<UnitConfig["arguments"]>) => {
      onChange({
        ...unit,
        arguments: {
          ...unit?.arguments,
          ...updates,
        } as UnitConfig["arguments"],
      });
    },
    [unit, onChange]
  );

  return (
    <Stack spacing={2}>
      {/* x 参数：使用 numbers 类型的 autocomplete */}
      <Autocomplete
        multiple
        freeSolo
        size="small"
        options={[]}
        value={xArray.map((v) => String(v))}
        onChange={(_, newValue) => {
          const numbers = newValue
            .map((v) => {
              const num = Number(v);
              return isNaN(num) ? null : num;
            })
            .filter((v) => v !== null) as number[];
          // 如果只有一个值，保存为单个值；否则保存为数组
          const x = numbers.length === 1 ? numbers[0] : numbers;
          updateUnit({
            x,
            units: unitsArray.length === 1 ? unitsArray[0] : unitsArray,
          });
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, idx) => (
            <Chip label={option} {...getTagProps({ index: idx })} />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="x"
            placeholder="输入数字后按回车添加"
            type="number"
          />
        )}
      />

      {/* units 参数：使用 strings 类型的 autocomplete */}
      <Autocomplete
        multiple
        freeSolo
        size="small"
        options={["pt", "in", "cm", "mm", "px", "pc"]}
        value={unitsArray}
        onChange={(_, newValue) => {
          // 如果只有一个值，保存为单个值；否则保存为数组
          const units = newValue.length === 1 ? newValue[0] : newValue;
          updateUnit({
            x: xArray.length === 1 ? xArray[0] : xArray,
            units,
          });
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, idx) => (
            <Chip label={option} {...getTagProps({ index: idx })} />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="units"
            placeholder="输入单位后按回车添加"
          />
        )}
      />
    </Stack>
  );
};

export const Arrow: React.FC<ArrowProps> = ({ arrow, onChange }) => {
  const args: ArrowConfig["arguments"] = arrow.arguments || {
    angle: 30,
    length: { type: "unit", arguments: { x: 0.25, units: "in" } },
    ends: "last",
    type: "open",
  };
  const angle = args?.angle as number | undefined;
  const length = args?.length as UnitConfig | undefined;
  const ends = args?.ends ?? "last";
  const type = args?.type ?? "open";

  const updateArrow = useCallback(
    (updates: Partial<ArrowConfig["arguments"]>) => {
      onChange({
        ...arrow,
        arguments: {
          ...args,
          ...updates,
        } as ArrowConfig["arguments"],
      });
    },
    [arrow, args, onChange]
  );

  const theme = useTheme();

  return (
    <Box>
      <Paper
        sx={{
          p: 2,
          elevation: 1,
          backgroundColor: alpha(
            theme.palette.info.main,
            theme.palette.mode === "dark" ? 0.1 : 0.05
          ),
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
          Arrow 参数
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="angle"
                  value={angle ?? 0}
                  onChange={(e) => {
                    const newValue = Number(e.target.value) || 0;
                    updateArrow({ angle: newValue });
                  }}
                  inputProps={{ step: 1, min: 0, max: 360 }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Unit
                  unit={
                    length || {
                      type: "unit",
                      arguments: { x: 0.25, units: "in" },
                    }
                  }
                  onChange={(updatedUnit) => {
                    updateArrow({ length: updatedUnit });
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            {/* Ends */}
            <FormControl fullWidth size="small">
              <InputLabel>Ends</InputLabel>
              <Select
                value={ends}
                onChange={(e) => {
                  updateArrow({ ends: e.target.value });
                }}
                label="Ends"
              >
                <MenuItem value="last">last</MenuItem>
                <MenuItem value="first">first</MenuItem>
                <MenuItem value="both">both</MenuItem>
              </Select>
            </FormControl>

            {/* Type */}
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={type}
                onChange={(e) => {
                  updateArrow({ type: e.target.value });
                }}
                label="Type"
              >
                <MenuItem value="open">open</MenuItem>
                <MenuItem value="closed">closed</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};
