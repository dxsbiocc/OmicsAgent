"use client";

import { useCallback, useMemo } from "react";
import { Box, Paper, Typography, Stack, IconButton } from "@mui/material";
import Iconify from "@/components/common/Iconify";
import { MarkerConfig, ParameterConfig } from "../types";
import { BaseDynamicParams } from "../common/BaseDynamicParams";

// Marker 参数配置
export const markerParams: ParameterConfig[] = [
  {
    name: "x",
    type: "select",
    options: [
      "square",
      "circle",
      "star",
      "heart",
      "ellipse",
      "cross",
      "triangle",
      "triangle2",
    ],
    default: "square",
  },
];

interface MarkerParamsProps {
  param: {
    name: string;
    value: MarkerConfig | undefined;
  };
  onUpdate: (value: MarkerConfig | undefined) => void;
}

export const MarkerRenderer: React.FC<MarkerParamsProps> = ({
  param,
  onUpdate,
}) => {
  const markerValue = useMemo((): MarkerConfig => {
    return param.value || { type: "marker", arguments: {} };
  }, [param.value]);

  const updateMarker = useCallback(
    (newValue: Record<string, any>) => {
      const updatedMarker: MarkerConfig = {
        type: "marker",
        arguments: {
          ...markerValue.arguments,
          ...newValue,
        },
      };
      onUpdate(updatedMarker);
    },
    [markerValue, onUpdate]
  );

  const handleRemove = useCallback(() => {
    onUpdate(undefined);
  }, [onUpdate]);

  return (
    <Paper
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        position: "relative",
      }}
      elevation={0}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          Marker 配置
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
      <BaseDynamicParams
        availableParams={markerParams}
        value={markerValue.arguments || {}}
        onChange={updateMarker}
        nested={false}
      />
    </Paper>
  );
};
