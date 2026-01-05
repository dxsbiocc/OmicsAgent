"use client";

import { useCallback } from "react";
import { Box, Paper, Typography, Grid, Stack } from "@mui/material";
import { NumberField } from "@/components/common";
import { LimsConfig } from "../types";

interface LimsConfigProps {
  params: LimsConfig | undefined;
  onChange: (lims: LimsConfig | undefined) => void;
}

export const LimsConfigComponent: React.FC<LimsConfigProps> = ({
  params,
  onChange,
}) => {
  const updateArrayValue = useCallback(
    (key: "x" | "y", index: 0 | 1, value: number | null) => {
      const currentParams = params || { type: "lims", arguments: {} };
      const currentArray = (currentParams.arguments?.[key] as
        | number[]
        | undefined) || [null, null];
      const newArray: (number | null)[] = [...currentArray];
      newArray[index] = value;

      // 检查是否至少有一个有效值
      const hasValidValue =
        (newArray[0] !== null && newArray[0] !== undefined) ||
        (newArray[1] !== null && newArray[1] !== undefined);

      if (!hasValidValue) {
        // 如果两个值都为空，删除该参数
        const newArguments = { ...currentParams.arguments };
        delete newArguments[key];

        // 如果所有参数都为空，删除整个 lims 配置
        if (Object.keys(newArguments).length === 0) {
          onChange(undefined);
        } else {
          onChange({
            ...currentParams,
            arguments: newArguments,
          } as LimsConfig);
        }
      } else {
        // 至少有一个有效值，将 null/undefined 转换为 0
        const finalArray: number[] = [
          newArray[0] === null || newArray[0] === undefined ? 0 : newArray[0],
          newArray[1] === null || newArray[1] === undefined ? 0 : newArray[1],
        ];

        onChange({
          ...currentParams,
          arguments: {
            ...currentParams.arguments,
            [key]: finalArray,
          },
        } as LimsConfig);
      }
    },
    [params, onChange]
  );

  // 获取 x 和 y 的值，如果不存在则返回 undefined
  const xValue = params?.arguments?.x;
  const yValue = params?.arguments?.y;

  return (
    <Box>
      <Paper sx={{ p: 2 }} elevation={1}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          坐标轴范围
        </Typography>
        <Stack spacing={2}>
          {/* X 轴范围 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              X 轴范围
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <NumberField
                  fullWidth
                  size="small"
                  label="最小值"
                  value={xValue?.[0] ?? null}
                  onChange={(value) => updateArrayValue("x", 0, value)}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <NumberField
                  fullWidth
                  size="small"
                  label="最大值"
                  value={xValue?.[1] ?? null}
                  onChange={(value) => updateArrayValue("x", 1, value)}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Y 轴范围 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Y 轴范围
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <NumberField
                  fullWidth
                  size="small"
                  label="最小值"
                  value={yValue?.[0] ?? null}
                  onChange={(value) => updateArrayValue("y", 0, value)}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <NumberField
                  fullWidth
                  size="small"
                  label="最大值"
                  value={yValue?.[1] ?? null}
                  onChange={(value) => updateArrayValue("y", 1, value)}
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};
