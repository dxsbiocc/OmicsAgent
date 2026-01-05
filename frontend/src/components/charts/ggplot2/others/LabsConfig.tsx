"use client";

import { useCallback } from "react";
import { Box, Paper, Typography, TextField, Grid } from "@mui/material";
import { LabsConfig } from "../types";

interface LabsConfigProps {
  params: LabsConfig;
  onChange: (labs: LabsConfig) => void;
}

export const LabsConfigComponent: React.FC<LabsConfigProps> = ({
  params,
  onChange,
}) => {
  const updateParam = useCallback(
    (key: string, value: any) => {
      onChange({
        ...params,
        arguments: { ...params.arguments, [key]: value },
      } as LabsConfig);
    },
    [params, onChange]
  );

  return (
    <Box>
      <Paper sx={{ p: 2 }} elevation={3}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          标签配置
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="标题"
              value={params.arguments?.title ?? ""}
              onChange={(e) => updateParam("title", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="副标题"
              value={params.arguments?.subtitle ?? ""}
              onChange={(e) => updateParam("subtitle", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="X 轴标签"
              value={params.arguments?.x ?? ""}
              onChange={(e) => updateParam("x", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Y 轴标签"
              value={params.arguments?.y ?? ""}
              onChange={(e) => updateParam("y", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label="说明文字"
              value={params.arguments?.caption ?? ""}
              onChange={(e) => updateParam("caption", e.target.value)}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
