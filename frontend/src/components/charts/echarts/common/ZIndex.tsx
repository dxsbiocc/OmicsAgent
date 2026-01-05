import React, { useCallback, useMemo } from "react";
import { Box, TextField, Typography, Grid, FormControl } from "@mui/material";

// z-index 组件
interface ZIndexProps {
  value: {
    zlevel?: number;
    z?: number;
  };
  onChange: (value: any) => void;
  label?: string;
}

const ZIndex: React.FC<ZIndexProps> = ({
  value,
  onChange,
  label = "z-index",
}) => {
  // 确保所有值都有默认值，避免受控/非受控组件警告
  const safeValue = useMemo(
    () => ({
      z: value?.z || 0,
      zlevel: value?.zlevel || 0,
    }),
    [value]
  );

  const updateZIndex = useCallback(
    (key: string, newValue: any) => {
      onChange({ ...safeValue, [key]: newValue });
    },
    [onChange]
  );

  const zIndexContent = useMemo(
    () => (
      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <FormControl fullWidth size="small" variant="outlined">
            <TextField
              value={safeValue.z}
              onChange={(e) => updateZIndex("z", Number(e.target.value))}
              label="z"
              size="small"
              type="number"
            />
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <FormControl fullWidth size="small" variant="outlined">
            <TextField
              value={safeValue.zlevel}
              onChange={(e) => updateZIndex("zlevel", Number(e.target.value))}
              label="zlevel"
              size="small"
              type="number"
            />
          </FormControl>
        </Grid>
      </Grid>
    ),
    [safeValue, updateZIndex]
  );

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{
          mb: 2,
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
      {zIndexContent}
    </Box>
  );
};

export default ZIndex;
