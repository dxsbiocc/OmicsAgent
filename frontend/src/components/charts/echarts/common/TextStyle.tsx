import { useState, useMemo, useCallback, useEffect } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  TextField,
  Grid,
  InputLabel,
  Paper,
  Button,
  Stack,
  Tooltip,
  Link,
} from "@mui/material";
import ColorPicker from "@/components/common/ColorPicker";

const COMMON_POSITIONS = [
  { value: "top", label: "顶部" },
  { value: "left", label: "左" },
  { value: "right", label: "右" },
  { value: "bottom", label: "底部" },
  { value: "inside", label: "内部" },
  { value: "insideLeft", label: "内部左" },
  { value: "insideRight", label: "内部右" },
  { value: "insideTop", label: "内部顶部" },
  { value: "insideBottom", label: "内部底部" },
  { value: "insideTopLeft", label: "内部顶部左" },
  { value: "insideTopRight", label: "内部顶部右" },
  { value: "insideBottomLeft", label: "内部底部左" },
  { value: "insideBottomRight", label: "内部底部右" },
];

const MARK_LINE_POSITIONS = [
  { value: "start", label: "开始" },
  { value: "middle", label: "中间" },
  { value: "end", label: "结束" },
  { value: "insideStartTop", label: "内部开始顶部" },
  { value: "insideStartBottom", label: "内部开始底部" },
  { value: "insideMiddleTop", label: "内部中间顶部" },
  { value: "insideMiddleBottom", label: "内部中间底部" },
  { value: "insideEndTop", label: "内部结束顶部" },
  { value: "insideEndBottom", label: "内部结束底部" },
];

const POLAR_POSITIONS = [
  { value: "start", label: "开始" },
  { value: "insideStart", label: "内部开始" },
  { value: "middle", label: "中间" },
  { value: "end", label: "结束" },
  { value: "insideEnd", label: "内部结束" },
];

interface TextStyleProps {
  value: {
    color?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: "normal" | "bold" | "bolder" | "lighter" | number;
    fontStyle?: "normal" | "italic" | "oblique";
    textAlign?: "auto" | "left" | "center" | "right";
    textVerticalAlign?: "auto" | "top" | "middle" | "bottom";
    align?: "auto" | "left" | "center" | "right";
    verticalAlign?: "auto" | "top" | "middle" | "bottom";
    width?: number;
    height?: number;
    lineHeight?: number;
    overflow?: "none" | "truncate" | "break" | "breakAll";
    ellipsis?: string;
    position?: string;
    distance?: number;
    rotate?: number | string;
    minAngle?: number;
    offset?: number | number[];
    padding?: number;
    formatter?: string;
    rich?: object;
  };
  onChange: (style: any) => void;
  label?: string;
  isLabel?: boolean;
  isPolar?: boolean;
  isMarkLine?: boolean;
  isSunburst?: boolean;
}

const TextStyle: React.FC<TextStyleProps> = ({
  value,
  onChange,
  label = "",
  isLabel = false,
  isPolar = false,
  isMarkLine = false,
  isSunburst = false,
}) => {
  // 富文本 tooltip 内容
  const richTextTooltipContent = (
    <Box
      sx={{
        maxWidth: 500,
        maxHeight: 400,
        overflow: "auto",
        p: 1,
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "rgba(0,0,0,0.1)",
          borderRadius: "3px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(0,0,0,0.3)",
          borderRadius: "3px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "rgba(0,0,0,0.5)",
        },
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
        富文本标签使用说明
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        富文本标签可以自定义文本块的样式，支持颜色、字体、背景、边框等多种样式。
      </Typography>

      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5, mt: 1 }}>
        基本用法：
      </Typography>
      <Typography
        variant="body2"
        component="div"
        sx={{ fontSize: "0.75rem", fontFamily: "monospace", mb: 1 }}
      >
        formatter: '{"{a|样式名}"}'
      </Typography>

      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5, mt: 1 }}>
        支持的样式属性：
      </Typography>
      <Typography
        variant="body2"
        component="div"
        sx={{ fontSize: "0.75rem", fontFamily: "monospace" }}
      >
        • color: 文字颜色
        <br />
        • fontFamily: 字体
        <br />
        • fontSize: 字体大小
        <br />
        • fontWeight: 字体粗细
        <br />
        • fontStyle: 字体样式
        <br />
        • backgroundColor: 背景色
        <br />
        • borderColor: 边框颜色
        <br />
        • borderWidth: 边框宽度
        <br />
        • borderRadius: 圆角半径
        <br />
        • padding: 内边距
        <br />
        • width/height: 宽高
        <br />
        • align: 对齐方式
        <br />• verticalAlign: 垂直对齐
      </Typography>

      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5, mt: 1 }}>
        示例：
      </Typography>
      <Typography
        variant="body2"
        component="div"
        sx={{ fontSize: "0.75rem", fontFamily: "monospace", mb: 1 }}
      >
        {`{
  "title": {
    "color": "#333",
    "fontSize": 18,
    "fontWeight": "bold"
  },
  "value": {
    "color": "#666",
    "fontSize": 14
  }
}`}
      </Typography>

      <Link
        href="https://echarts.apache.org/zh/tutorial.html#%E5%AF%8C%E6%96%87%E6%9C%AC%E6%A0%87%E7%AD%BE"
        target="_blank"
        rel="noopener noreferrer"
        sx={{ fontSize: "0.75rem" }}
      >
        查看完整文档 →
      </Link>
    </Box>
  );

  // Formatter tooltip 内容
  const formatterTooltipContent = (
    <Box
      sx={{
        maxWidth: 400,
        maxHeight: 400,
        overflow: "auto",
        p: 1,
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "rgba(0,0,0,0.1)",
          borderRadius: "3px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(0,0,0,0.3)",
          borderRadius: "3px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "rgba(0,0,0,0.5)",
        },
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
        格式化器使用说明
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        支持字符串模板和回调函数两种形式，支持用 \n 换行。
      </Typography>

      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5, mt: 1 }}>
        字符串模板变量：
      </Typography>
      <Typography
        variant="body2"
        component="div"
        sx={{ fontSize: "0.75rem", fontFamily: "monospace" }}
      >
        • {"{a}"}：系列名
        <br />• {"{b}"}：数据名
        <br />• {"{c}"}：数据值
        <br />• {"{d}"}：百分比
        <br />• {"{@xxx}"}：数据中名为 'xxx' 的维度的值
        <br />• {"{@[n]}"}：数据中维度 n 的值，从 0 开始计数
      </Typography>

      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5, mt: 1 }}>
        示例：
      </Typography>
      <Typography
        variant="body2"
        component="div"
        sx={{ fontSize: "0.75rem", fontFamily: "monospace", mb: 1 }}
      >
        formatter: '{"{b}: {d}"}'
      </Typography>

      <Typography variant="body2" sx={{ mb: 1 }}>
        回调函数格式：
        <br />
        <Box
          component="span"
          sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}
        >
          (params: Object|Array) =&gt; string
        </Box>
      </Typography>

      <Link
        href="https://echarts.apache.org/zh/option.html#series-line.label.formatter"
        target="_blank"
        rel="noopener noreferrer"
        sx={{ fontSize: "0.75rem" }}
      >
        查看完整文档 →
      </Link>
    </Box>
  );
  // 独立状态控制富文本字符串输入
  const [richTextInput, setRichTextInput] = useState<string>("");
  const [richTextError, setRichTextError] = useState<string>("");

  // 同步外部值到内部状态
  useEffect(() => {
    if (value?.rich) {
      const richString =
        typeof value.rich === "string"
          ? value.rich
          : JSON.stringify(value.rich, null, 2);
      setRichTextInput(richString);
    } else {
      setRichTextInput("");
    }
    setRichTextError("");
  }, [value?.rich]);

  // 更新富文本的函数
  const handleUpdateRich = useCallback(() => {
    if (!richTextInput.trim()) {
      updateStyle("rich", undefined);
      setRichTextError("");
      return;
    }

    try {
      const parsedValue = JSON.parse(richTextInput);
      updateStyle("rich", parsedValue);
      setRichTextError("");
    } catch (error) {
      setRichTextError("JSON 格式错误，请检查语法");
    }
  }, [richTextInput, onChange]);

  // 确保所有值都有默认值，避免受控/非受控组件警告
  const safeValue = useMemo(
    () => ({
      color: value?.color || undefined,
      fontFamily: value?.fontFamily || undefined,
      fontSize: value?.fontSize || undefined,
      fontWeight: value?.fontWeight || undefined,
      fontStyle: value?.fontStyle || undefined,
      // label 模式下使用 align 和 verticalAlign
      align: value?.align || undefined,
      verticalAlign: value?.verticalAlign || undefined,
      // 非 label 模式下使用 textAlign 和 textVerticalAlign
      textAlign: value?.textAlign || undefined,
      textVerticalAlign: value?.textVerticalAlign || undefined,
      width: value?.width,
      height: value?.height,
      lineHeight: value?.lineHeight,
      overflow: value?.overflow || undefined,
      ellipsis: value?.ellipsis || undefined,
      // 标签类型额外属性
      position: value?.position || undefined,
      distance: value?.distance || undefined,
      rotate: value?.rotate || undefined,
      offset: value?.offset || undefined,
      padding: value?.padding || undefined,
      formatter: value?.formatter,
      rich: value?.rich
        ? typeof value.rich === "string"
          ? value.rich
          : JSON.stringify(value.rich, null, 2)
        : "",
      // sunburst 模式下
      minAngle: value?.minAngle || undefined,
    }),
    [value]
  );

  const updateStyle = useCallback(
    (key: string, newValue: any) => {
      // 合并当前值和新的修改值，避免重置其他属性
      const updatedValue = {
        ...value,
        [key]: newValue,
      };
      onChange(updatedValue);
    },
    [onChange, value]
  );

  return (
    <Paper sx={{ p: 2 }} elevation={3}>
      {label && (
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
      )}
      <Box sx={{ p: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <ColorPicker
              value={safeValue.color}
              onChange={(color) => updateStyle("color", color)}
              label="字体颜色"
            />
          </Grid>
          {/* 字体相关配置 */}
          <Grid size={{ xs: 4 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>字体</InputLabel>
              <Select
                value={safeValue.fontFamily || "sans-serif"}
                onChange={(e) => updateStyle("fontFamily", e.target.value)}
                label="字体"
                sx={{
                  "& .MuiSelect-select": {
                    fontSize: "0.875rem",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "text.secondary",
                  },
                }}
              >
                <MenuItem value="sans-serif">sans-serif</MenuItem>
                <MenuItem value="serif">serif</MenuItem>
                <MenuItem value="monospace">monospace</MenuItem>
                <MenuItem value="Arial">Arial</MenuItem>
                <MenuItem value="Courier New">Courier New</MenuItem>
                <MenuItem value="Microsoft YaHei">Microsoft YaHei</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>字体大小</InputLabel>
              <Select
                value={safeValue.fontSize || 16}
                onChange={(e) =>
                  updateStyle("fontSize", Number(e.target.value))
                }
                label="字体大小"
                sx={{
                  "& .MuiSelect-select": {
                    fontSize: "0.875rem",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "text.secondary",
                  },
                }}
              >
                {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}px
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>字体粗细</InputLabel>
              <Select
                value={safeValue.fontWeight || "normal"}
                onChange={(e) => updateStyle("fontWeight", e.target.value)}
                label="字体粗细"
                sx={{
                  "& .MuiSelect-select": {
                    fontSize: "0.875rem",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "text.secondary",
                  },
                }}
              >
                <MenuItem value="normal">正常</MenuItem>
                <MenuItem value="bold">粗体</MenuItem>
                <MenuItem value="bolder">更粗</MenuItem>
                <MenuItem value="lighter">更细</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* 样式和对齐配置 */}
          <Grid size={{ xs: 4 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>字体样式</InputLabel>
              <Select
                value={safeValue.fontStyle || "normal"}
                onChange={(e) => updateStyle("fontStyle", e.target.value)}
                label="字体样式"
                sx={{
                  "& .MuiSelect-select": {
                    fontSize: "0.875rem",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "text.secondary",
                  },
                }}
              >
                <MenuItem value="normal">正常</MenuItem>
                <MenuItem value="italic">斜体</MenuItem>
                <MenuItem value="oblique">倾斜</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>水平对齐</InputLabel>
              <Select
                value={
                  isLabel
                    ? safeValue.align || "auto"
                    : safeValue.textAlign || "auto"
                }
                onChange={(e) =>
                  updateStyle(isLabel ? "align" : "textAlign", e.target.value)
                }
                label="水平对齐"
                sx={{
                  "& .MuiSelect-select": {
                    fontSize: "0.875rem",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "text.secondary",
                  },
                }}
              >
                <MenuItem value="auto">自动</MenuItem>
                <MenuItem value="left">左对齐</MenuItem>
                <MenuItem value="center">居中</MenuItem>
                <MenuItem value="right">右对齐</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>垂直对齐</InputLabel>
              <Select
                value={
                  isLabel
                    ? safeValue.verticalAlign || "auto"
                    : safeValue.textVerticalAlign || "auto"
                }
                onChange={(e) =>
                  updateStyle(
                    isLabel ? "verticalAlign" : "textVerticalAlign",
                    e.target.value
                  )
                }
                label="垂直对齐"
                sx={{
                  "& .MuiSelect-select": {
                    fontSize: "0.875rem",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "text.secondary",
                  },
                }}
              >
                <MenuItem value="auto">自动</MenuItem>
                <MenuItem value="top">顶部</MenuItem>
                <MenuItem value="middle">中间</MenuItem>
                <MenuItem value="bottom">底部</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* 尺寸和溢出配置 */}
          <Grid size={{ xs: 4 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <TextField
                value={safeValue.height}
                onChange={(e) => updateStyle("height", Number(e.target.value))}
                label="高度"
                size="small"
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "0.875rem",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "text.secondary",
                  },
                }}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <TextField
                value={safeValue.width}
                onChange={(e) => updateStyle("width", Number(e.target.value))}
                label="宽度"
                size="small"
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "0.875rem",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "text.secondary",
                  },
                }}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <TextField
                value={safeValue.lineHeight}
                onChange={(e) =>
                  updateStyle("lineHeight", Number(e.target.value))
                }
                label="行高"
                size="small"
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "0.875rem",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "text.secondary",
                  },
                }}
              />
            </FormControl>
          </Grid>

          {/* 溢出配置 */}
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>溢出</InputLabel>
              <Select
                value={safeValue.overflow || "none"}
                onChange={(e) => updateStyle("overflow", e.target.value)}
                label="溢出"
                sx={{
                  "& .MuiSelect-select": {
                    fontSize: "0.875rem",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "text.secondary",
                  },
                }}
              >
                <MenuItem value="none">无</MenuItem>
                <MenuItem value="truncate">截断</MenuItem>
                <MenuItem value="break">换行</MenuItem>
                <MenuItem value="breakAll">换行所有</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="截断文本"
              value={safeValue.ellipsis || ""}
              onChange={(e) => updateStyle("ellipsis", e.target.value as any)}
              placeholder="..."
            />
          </Grid>
        </Grid>
        {isLabel && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              标签位置
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>位置</InputLabel>
                  <Select
                    value={
                      safeValue.position ||
                      (isMarkLine ? "middle" : isPolar ? "start" : "top")
                    }
                    onChange={(e) =>
                      updateStyle("position", e.target.value as any)
                    }
                    label="位置"
                  >
                    {isMarkLine
                      ? MARK_LINE_POSITIONS.map((position) => (
                          <MenuItem key={position.value} value={position.value}>
                            {position.label}
                          </MenuItem>
                        ))
                      : isPolar
                      ? POLAR_POSITIONS.map((position) => (
                          <MenuItem key={position.value} value={position.value}>
                            {position.label}
                          </MenuItem>
                        ))
                      : COMMON_POSITIONS.map((position) => (
                          <MenuItem key={position.value} value={position.value}>
                            {position.label}
                          </MenuItem>
                        ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="距离"
                  value={safeValue.distance ?? 5}
                  onChange={(e) =>
                    updateStyle("distance", parseInt(e.target.value) || 0)
                  }
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                {isSunburst ? (
                  <Tooltip title="可以输入 'radial'、'tangential' 或数字，失焦后自动验证">
                    <TextField
                      fullWidth
                      size="small"
                      label="旋转角度"
                      value={safeValue.rotate ?? 0}
                      onChange={(e) => {
                        // 输入过程中只更新显示值
                        updateStyle("rotate", e.target.value);
                      }}
                      onBlur={(e) => {
                        // 失焦时验证并修正值
                        const value = e.target.value;
                        if (value === "") {
                          updateStyle("rotate", 0);
                        } else if (
                          value === "radial" ||
                          value === "tangential"
                        ) {
                          updateStyle("rotate", value);
                        } else if (!isNaN(Number(value))) {
                          updateStyle("rotate", parseInt(value) || 0);
                        } else {
                          // 无效输入，重置为 0
                          updateStyle("rotate", 0);
                        }
                      }}
                    />
                  </Tooltip>
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="旋转角度"
                    value={safeValue.rotate ?? 0}
                    onChange={(e) =>
                      updateStyle("rotate", parseInt(e.target.value) || 0)
                    }
                  />
                )}
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="偏移 X"
                  value={
                    Array.isArray(safeValue.offset) ? safeValue.offset[0] : 0
                  }
                  onChange={(e) => {
                    const x = parseInt(e.target.value) || 0;
                    const y = Array.isArray(safeValue.offset)
                      ? safeValue.offset[1]
                      : 0;
                    updateStyle("offset", [x, y] as any);
                  }}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="偏移 Y"
                  value={
                    Array.isArray(safeValue.offset) ? safeValue.offset[1] : 0
                  }
                  onChange={(e) => {
                    const y = parseInt(e.target.value) || 0;
                    const x = Array.isArray(safeValue.offset)
                      ? safeValue.offset[0]
                      : 0;
                    updateStyle("offset", [x, y] as any);
                  }}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="内边距"
                  value={safeValue.padding ?? 0}
                  onChange={(e) =>
                    updateStyle("padding", parseInt(e.target.value) || 0)
                  }
                />
              </Grid>
              {/* 格式化器 */}
              <Grid size={{ xs: 12 }}>
                <Tooltip
                  title={formatterTooltipContent}
                  placement="top"
                  arrow
                  enterDelay={500}
                  leaveDelay={200}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="格式化器"
                    value={safeValue.formatter || ""}
                    onChange={(e) =>
                      updateStyle("formatter", e.target.value as any)
                    }
                    placeholder="{value}"
                    helperText="鼠标悬停查看详细使用说明"
                  />
                </Tooltip>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Stack spacing={1}>
                  <Tooltip
                    title={richTextTooltipContent}
                    placement="top"
                    arrow
                    enterDelay={500}
                    leaveDelay={200}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="富文本"
                      multiline
                      rows={6}
                      value={richTextInput}
                      onChange={(e) => {
                        setRichTextInput(e.target.value);
                        setRichTextError("");
                      }}
                      placeholder={`{
  "a": {
    "color": "red",
    "lineHeight": 10
  },
  "b": {
    "backgroundColor": {
      "image": "xxx/xxx.jpg"
    },
    "height": 40
  },
  "x": {
    "fontSize": 18,
    "fontFamily": "Microsoft YaHei",
    "borderColor": "#449933",
    "borderRadius": 4
  }
}`}
                      sx={{
                        "& .MuiInputBase-input": {
                          fontFamily: "monospace",
                          fontSize: "0.75rem",
                          lineHeight: 1.4,
                        },
                      }}
                      error={!!richTextError}
                      helperText={richTextError || "鼠标悬停查看详细使用说明"}
                    />
                  </Tooltip>
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setRichTextInput("");
                        setRichTextError("");
                      }}
                    >
                      清空
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleUpdateRich}
                      disabled={!richTextInput.trim()}
                    >
                      更新
                    </Button>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default TextStyle;
