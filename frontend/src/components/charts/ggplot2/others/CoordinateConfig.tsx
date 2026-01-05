"use client";

import { useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import { DynamicParams } from "../common/DynamicParams";
import { CoordinateConfig, ParameterConfig } from "../types";

interface CoordinateConfigProps {
  params: CoordinateConfig;
  onChange: (coordinate: CoordinateConfig) => void;
}

// coord_cartesian 参数
const coordCartesianParams: ParameterConfig[] = [
  {
    name: "xlim",
    type: "pair",
  },
  {
    name: "ylim",
    type: "pair",
  },
  {
    name: "expand",
    type: "boolean",
    default: true,
  },
  {
    name: "clip",
    type: "select",
    options: ["on", "off"],
    default: "on",
  },
];

// coord_polar 参数
const coordPolarParams: ParameterConfig[] = [
  {
    name: "theta",
    type: "select",
    options: ["x", "y"],
    default: "x",
  },
  {
    name: "start",
    type: "number",
    default: 0,
  },
  {
    name: "direction",
    type: "select",
    options: [1, -1],
    default: 1,
  },
  {
    name: "clip",
    type: "select",
    options: ["on", "off"],
    default: "on",
  },
];

// coord_radial 参数
const coordRadialParams: ParameterConfig[] = [
  {
    name: "theta",
    type: "select",
    options: ["x", "y"],
    default: "x",
  },
  {
    name: "start",
    type: "number",
    default: 0,
  },
  {
    name: "end",
    type: "number",
  },
  {
    name: "thetalim",
    type: "pair",
  },
  {
    name: "rlim",
    type: "pair",
  },
  {
    name: "expand",
    type: "boolean",
    default: true,
  },
  {
    name: "direction",
    type: "select",
    options: [1, -1],
    default: 1,
  },
  {
    name: "clip",
    type: "select",
    options: ["on", "off"],
    default: "on",
  },
  {
    name: "rotate.angle",
    type: "boolean",
    default: false,
  },
  {
    name: "inner.radius",
    type: "number",
    default: 0,
  },
  {
    name: "reverse",
    type: "select",
    options: ["none", "theta", "r", "thetar"],
  },
];

// coord_fixed 参数
const coordFixedParams: ParameterConfig[] = [
  {
    name: "ratio",
    type: "number",
    default: 1,
  },
  {
    name: "xlim",
    type: "pair",
  },
  {
    name: "ylim",
    type: "pair",
  },
  {
    name: "expand",
    type: "boolean",
    default: true,
  },
  {
    name: "clip",
    type: "select",
    options: ["on", "off"],
    default: "on",
  },
];

// coord_trans 参数
const coordTransParams: ParameterConfig[] = [
  {
    name: "x",
    type: "string",
    default: "identity",
  },
  {
    name: "y",
    type: "string",
    default: "identity",
  },
  {
    name: "xlim",
    type: "pair",
  },
  {
    name: "ylim",
    type: "pair",
  },
  {
    name: "clip",
    type: "select",
    options: ["on", "off"],
    default: "on",
  },
  {
    name: "expand",
    type: "boolean",
    default: true,
  },
];

// coord_map 参数（基本参数，实际使用可能需要更多）
const coordMapParams: ParameterConfig[] = [
  {
    name: "xlim",
    type: "pair",
  },
  {
    name: "ylim",
    type: "pair",
  },
  {
    name: "expand",
    type: "boolean",
    default: true,
  },
  {
    name: "clip",
    type: "select",
    options: ["on", "off"],
    default: "on",
  },
];

// coord_sf 参数（基本参数，实际使用可能需要更多）
const coordSfParams: ParameterConfig[] = [
  {
    name: "xlim",
    type: "pair",
  },
  {
    name: "ylim",
    type: "pair",
  },
  {
    name: "expand",
    type: "boolean",
    default: true,
  },
  {
    name: "clip",
    type: "select",
    options: ["on", "off"],
    default: "on",
  },
];

export const CoordinateConfigComponent: React.FC<CoordinateConfigProps> = ({
  params,
  onChange,
}) => {
  // 确保 params 有默认值
  const safeParams = useMemo(() => {
    return {
      type: params.type || "coord_cartesian",
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

  // 构建传递给 DynamicParams 的 value 对象
  const dynamicParamsValue = useMemo(() => {
    const value: Record<string, any> = {};
    if (safeParams.arguments) {
      const args = safeParams.arguments as Record<string, any>;
      Object.keys(args).forEach((key) => {
        if (args[key] !== undefined) {
          if (Array.isArray(args[key])) {
            value[key] = args[key];
          } else if (
            typeof args[key] === "object" &&
            args[key] !== null &&
            !Array.isArray(args[key])
          ) {
            // 对象类型暂时不显示
          } else {
            value[key] = args[key];
          }
        }
      });
    }
    return value;
  }, [safeParams]);

  const handleParamsChange = useCallback(
    (newParams: Record<string, any>) => {
      updateParams(newParams);
    },
    [updateParams]
  );

  // 根据坐标系统类型获取可用参数
  const availableParams = useMemo(() => {
    switch (safeParams.type) {
      case "coord_cartesian":
        return coordCartesianParams;
      case "coord_polar":
        return coordPolarParams;
      case "coord_radial":
        return coordRadialParams;
      case "coord_fixed":
        return coordFixedParams;
      case "coord_trans":
        return coordTransParams;
      case "coord_map":
        return coordMapParams;
      case "coord_sf":
        return coordSfParams;
      default:
        return coordCartesianParams;
    }
  }, [safeParams.type]);

  // 可用的坐标系统类型（移除已弃用的）
  const availableCoordinateTypes = [
    { type: "coord_cartesian", label: "Cartesian" },
    { type: "coord_polar", label: "Polar" },
    { type: "coord_fixed", label: "Fixed" },
    { type: "coord_trans", label: "Trans" },
    { type: "coord_map", label: "Map" },
    { type: "coord_sf", label: "SF" },
  ];

  return (
    <Box>
      <Paper sx={{ p: 2 }} elevation={1}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          坐标系统配置
        </Typography>
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>坐标系统类型</InputLabel>
                <Select
                  value={safeParams.type}
                  onChange={(e) =>
                    onChange({
                      ...safeParams,
                      type: e.target.value as CoordinateConfig["type"],
                    })
                  }
                  label="坐标系统类型"
                >
                  {availableCoordinateTypes.map((coord) => (
                    <MenuItem key={coord.type} value={coord.type}>
                      {coord.label} ({coord.type})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

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
