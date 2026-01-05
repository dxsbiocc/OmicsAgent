import React, { useCallback, useMemo } from "react";
import {
  Paper,
  Stack,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Box,
} from "@mui/material";
import { useChartStore } from "@/stores/chartStore";
import ColorPicker, { PresetColorSelect } from "@/components/common/ColorPicker";
import TextStyle from "./TextStyle";
import VisualMapOptions from "./VisualMapOptions";

export default function GlobalOptions() {
  const { chartOption, setChartOption } = useChartStore();

  const updateOption = useCallback(
    (path: Array<string | number>, newValue: any) => {
      setChartOption((draft) => {
        if (!draft) return;
        let target: any = draft as any;
        for (let i = 0; i < path.length - 1; i++) {
          const key = path[i];
          if (target[key] === undefined || target[key] === null) {
            target[key] = {};
          }
          target = target[key];
        }
        const lastKey = path[path.length - 1];
        if (newValue === undefined || newValue === "") {
          if (typeof lastKey === "number") {
            target[lastKey] = undefined;
          } else {
            delete target[lastKey];
          }
        } else {
          target[lastKey] = newValue;
        }
      });
    },
    [setChartOption]
  );

  const safe = useMemo(() => {
    const color = (chartOption as any)?.color;
    const backgroundColor = (chartOption as any)?.backgroundColor;
    const darkMode = Boolean((chartOption as any)?.darkMode) || false;
    const rootTextStyle = (chartOption as any)?.textStyle || {};

    return {
      color: Array.isArray(color) ? (color as string[]) : [],
      backgroundColor: (backgroundColor as string) || "",
      darkMode,
      textStyle: rootTextStyle as Record<string, any>,
    };
  }, [chartOption]);

  return (
    <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" gutterBottom>
          全局配置
        </Typography>
      </Stack>

      <Divider />

      {/* 行：全局调色板 */}
      <Stack sx={{ display: "flex", gap: 2, mb: 2, p: 1 }}>
        <Typography variant="subtitle2" sx={{ textAlign: "left" }}>
          全局调色板
        </Typography>
        {/* 选择预定义的颜色数组 */}
        <PresetColorSelect
          label="选择预定义的颜色数组"
          value={safe.color}
          onChange={(colors, themeKey) => {
            updateOption(["color"], colors);
          }}
        />
        {/* 自定义颜色数组 */}

        <ColorPicker
          label="自定义颜色数组"
          value={safe.color}
          onChange={(val) => {
            if (Array.isArray(val)) updateOption(["color"], val);
            else updateOption(["color"], val ? [val] : undefined);
          }}
          maxColors={12}
        />
      </Stack>

      {/* 行：背景颜色 */}
      <Stack sx={{ display: "flex", gap: 2, mb: 2, p: 1 }}>
        <Typography variant="subtitle2" sx={{ textAlign: "left" }}>
          背景颜色
        </Typography>
        <ColorPicker
          label=""
          value={safe.backgroundColor}
          onChange={(val) =>
            updateOption(["backgroundColor"], (val as string) || undefined)
          }
        />
      </Stack>

      {/* 行：全局字体样式 */}
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle2" sx={{ textAlign: "left", mb: 1 }}>
          全局字体样式
        </Typography>
        <TextStyle
          value={safe.textStyle}
          onChange={(next) => updateOption(["textStyle"], next)}
        />
      </Box>
    </Paper>
  );
}
