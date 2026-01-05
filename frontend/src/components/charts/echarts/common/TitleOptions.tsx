import { TitleComponentOption } from "echarts";
import { useCallback, useMemo } from "react";
import { PositionControl, TextStyle } from "../common";
import {
  Stack,
  Box,
  Typography,
  Switch,
  TextField,
  Paper,
  Divider,
} from "@mui/material";
import { useChartStore } from "@/stores/chartStore";

interface TitleOptionsProps {
  label?: string;
}

const TitleOptions: React.FC<TitleOptionsProps> = ({ label = "标题样式" }) => {
  const { chartOption, setChartOption } = useChartStore();

  // 直接获取 title 配置，处理数组情况
  const getTitleOption = useCallback(() => {
    const title = chartOption?.title;
    if (Array.isArray(title)) {
      return title[0] || {};
    }
    return title || {};
  }, [chartOption?.title]);

  // 确保所有值都有默认值，避免受控/非受控组件警告
  const safeValue = useMemo(() => {
    const titleOption = getTitleOption();
    return {
      show: titleOption?.show ?? true,
      text: titleOption?.text ?? "",
      textStyle: titleOption?.textStyle ?? {},
      subtext: titleOption?.subtext ?? "",
      subtextStyle: titleOption?.subtextStyle ?? {},
      left: titleOption?.left ?? "auto",
      top: titleOption?.top ?? "auto",
    };
  }, [getTitleOption]);

  // 计算是否显示副标题（基于副标题文本是否为空）
  const showSubtext = useMemo(() => {
    return safeValue.subtext.trim() !== "";
  }, [safeValue.subtext]);

  // 直接更新 title 配置
  const updateTitle = useCallback(
    (key: keyof TitleComponentOption, newValue: any) => {
      setChartOption((draft) => {
        if (!draft) return;

        // 确保 title 存在
        if (!draft.title) {
          draft.title = {};
        }

        // 处理 title 是数组的情况
        if (Array.isArray(draft.title)) {
          if (draft.title.length === 0) {
            draft.title = [{}];
          }
          (draft.title[0] as any)[key] = newValue;
        } else {
          (draft.title as any)[key] = newValue;
        }
      });
    },
    [setChartOption]
  );

  const titleContent = useMemo(
    () => (
      <Stack spacing={3}>
        {/* 显示标题 */}
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            显示标题
          </Typography>
          <Switch
            checked={safeValue.show}
            onChange={(e) => updateTitle("show", e.target.checked)}
          />
        </Box>

        {/* 只有当显示标题时才渲染标题相关组件 */}
        {safeValue.show && (
          <Box sx={{ p: 1 }}>
            <Stack spacing={2}>
              {/* 标题文本 */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  标题
                </Typography>
                <TextField
                  fullWidth
                  value={safeValue.text}
                  onChange={(e) => updateTitle("text", e.target.value)}
                  placeholder="输入标题文本"
                  size="small"
                />
              </Box>

              {/* 标题样式 */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  标题样式
                </Typography>
                <TextStyle
                  value={{
                    ...(safeValue.textStyle as any),
                    fontSize:
                      typeof safeValue.textStyle.fontSize === "string"
                        ? parseInt(safeValue.textStyle.fontSize) || 14
                        : safeValue.textStyle.fontSize || 14,
                  }}
                  onChange={(textStyle) => updateTitle("textStyle", textStyle)}
                />
              </Box>

              {/* 副标题文本 */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  副标题
                </Typography>
                <TextField
                  fullWidth
                  value={safeValue.subtext}
                  onChange={(e) => updateTitle("subtext", e.target.value)}
                  placeholder="输入副标题文本（留空则不显示副标题）"
                  size="small"
                />
              </Box>

              {/* 只有当副标题不为空时才渲染副标题样式组件 */}
              {showSubtext && (
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    副标题样式
                  </Typography>
                  <TextStyle
                    value={{
                      ...(safeValue.subtextStyle as any),
                      fontSize:
                        typeof safeValue.subtextStyle.fontSize === "string"
                          ? parseInt(safeValue.subtextStyle.fontSize) || 14
                          : safeValue.subtextStyle.fontSize || 14,
                    }}
                    onChange={(subtextStyle) =>
                      updateTitle("subtextStyle", subtextStyle)
                    }
                  />
                </Box>
              )}

              {/* 标题位置 */}
              <Box sx={{ p: 1 }}>
                <PositionControl
                  left={safeValue.left}
                  top={safeValue.top}
                  onLeftChange={(leftValue) => updateTitle("left", leftValue)}
                  onTopChange={(topValue) => updateTitle("top", topValue)}
                  label="标题位置"
                />
              </Box>
            </Stack>
          </Box>
        )}
      </Stack>
    ),
    [safeValue, updateTitle, showSubtext]
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {titleContent}
    </Paper>
  );
};

export default TitleOptions;
