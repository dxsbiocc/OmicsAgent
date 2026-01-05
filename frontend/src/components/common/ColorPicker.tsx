"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Popover,
  Paper,
  Stack,
  Divider,
  Chip,
  Button,
  FormControl,
  Select,
  MenuItem,
  Collapse,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import { SketchPicker, ColorResult } from "react-color";
import {
  Palette,
  ColorLens,
  Check,
  Close,
  Add,
  ExpandMore,
  ExpandLess,
  Search,
} from "@mui/icons-material";
import Iconify from "@/components/common/Iconify";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import chroma from "chroma-js";
import colorsData from "./colors.json";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useTheme } from "@mui/material";

/**
 * 获取与背景色对比度最高的颜色
 * @param bgColor 背景颜色（HEX / RGB / HSL）
 * @returns 最优对比色（hex 字符串）
 */
export function getContrastColor(bgColor: string | chroma.Color): string {
  try {
    // 处理空值或无效颜色
    if (!bgColor || (typeof bgColor === "string" && bgColor.trim() === "")) {
      return "#000000"; // 默认返回黑色
    }

    const bg = typeof bgColor === "string" ? chroma(bgColor) : bgColor;

    // 如果 chroma 无法解析颜色，返回默认值
    if (!bg || !bg.hex) {
      return "#000000";
    }

    // 获取背景色的亮度
    const bgLuminance = bg.luminance();

    // 亮度优先：确保足够的亮度对比度
    let contrastLuminance;
    if (bgLuminance < 0.5) {
      // 暗背景，使用亮色对比
      contrastLuminance = 0.9;
    } else {
      // 亮背景，使用暗色对比
      contrastLuminance = 0.1;
    }

    // 在保证亮度对比的前提下，适度考虑色相
    const bgHue = bg.get("hsl.h");
    if (bgHue !== null && !isNaN(bgHue)) {
      // 有明确色相时，使用互补色相
      const complementaryHue = (bgHue + 180) % 360;
      const contrastColor = chroma.hsl(
        complementaryHue,
        0.5,
        contrastLuminance
      );
      return contrastColor.hex();
    } else {
      // 无明确色相（如黑白灰），直接使用黑白对比
      return contrastLuminance > 0.5 ? "#ffffff" : "#000000";
    }
  } catch (error) {
    console.warn("Failed to calculate contrast color:", error);
    // 出错时回退到简单的黑白对比
    try {
      const bg = typeof bgColor === "string" ? chroma(bgColor) : bgColor;
      const bgLuminance = bg.luminance();
      return bgLuminance < 0.5 ? "#ffffff" : "#000000";
    } catch {
      return "#000000";
    }
  }
}

// 从 colors.json 导入预定义颜色数据
const PredefinedColorThemes: PredefinedColorThemesType = colorsData;

// 扁平化的颜色主题，用于 select 组件
const flattenColorThemes = () => {
  const flattened: { [key: string]: ColorTheme } = {};

  Object.entries(PredefinedColorThemes).forEach(([category, themes]) => {
    Object.entries(themes).forEach(([themeName, colors]) => {
      const key = `${category}_${themeName}`.toLowerCase().replace(/\s+/g, "_");
      flattened[key] = {
        name: themeName,
        colors: colors as string[],
        category: category,
      };
    });
  });

  return flattened;
};

const colorThemes = flattenColorThemes();

// 颜色选择器接口 - 支持字符串和字符串数组
interface ColorPickerProps {
  value?: string | string[]; // 选中的颜色（字符串或字符串数组）
  onChange: (value: string | string[]) => void; // 颜色变化回调
  label?: string;
  maxColors?: number; // 最大颜色数量（仅在数组模式下有效）
  pickerWidth?: number; // 颜色选择器宽度
  pickerHeight?: number; // 颜色选择器高度
}

// 预定义主题下拉选择器
export interface PresetColorSelectProps {
  label?: string;
  value?: string[]; // 当前颜色数组
  onChange: (colors: string[], themeKey: string) => void; // 选择主题后的回调
}

// 颜色主题类型定义
interface ColorTheme {
  name: string;
  colors: string[];
  category: string;
}

// 预定义颜色数据结构类型
type PredefinedColorThemesType = {
  [category: string]: {
    [themeName: string]: string[];
  };
};

export const PresetColorSelect: React.FC<PresetColorSelectProps> = ({
  label = "预定义颜色主题",
  value = [],
  onChange,
}) => {
  const { mode } = useThemeContext();
  const theme = useTheme();

  // 根据当前颜色数组找到对应的主题key
  const getCurrentThemeKey = useCallback(() => {
    if (!value || !Array.isArray(value)) return "";

    for (const [key, theme] of Object.entries(colorThemes)) {
      if (JSON.stringify(theme.colors) === JSON.stringify(value)) {
        return key;
      }
    }
    return "";
  }, [value]);

  const currentThemeKey = getCurrentThemeKey();

  return (
    <Box>
      <Typography variant="body2" sx={{ textAlign: "left", mb: 2 }}>
        {label}
      </Typography>
      <FormControl fullWidth size="small">
        <Select
          value={currentThemeKey}
          onChange={(e) => {
            const key = (e.target.value as string) || "";
            const palette = key ? colorThemes[key]?.colors || [] : [];
            onChange(palette, key);
          }}
          sx={{
            minHeight: 40,
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
              minHeight: 24,
            },
          }}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 400, // 增加最大高度
                overflow: "auto",
                minWidth: 300, // 设置最小宽度
                // 自动隐藏滚动条
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE
              },
              sx: {
                "&::-webkit-scrollbar": {
                  display: "none", // Chrome, Safari, Edge
                },
                // 美化菜单项
                "& .MuiMenuItem-root": {
                  minHeight: 48,
                  padding: "8px 16px",
                },
              },
            },
          }}
        >
          <MenuItem value="">
            <Typography>不使用预设</Typography>
          </MenuItem>
          {Object.entries(PredefinedColorThemes)
            .map(([category, themes]) => [
              // 分组标题
              <MenuItem key={`group-${category}`} disabled>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    color: "primary.main",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {category}
                </Typography>
              </MenuItem>,
              // 该分组下的主题
              ...Object.entries(themes).map(([themeName, colors]) => {
                const key = `${category}_${themeName}`
                  .toLowerCase()
                  .replace(/\s+/g, "_");
                return (
                  <MenuItem
                    key={key}
                    value={key}
                    sx={{
                      pl: 3,
                      py: 1.5,
                      minHeight: 48,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                        minWidth: 0, // 允许内容收缩
                      }}
                    >
                      {/* 主题名称 */}
                      <Typography
                        variant="body2"
                        sx={{
                          flexShrink: 0,
                          fontWeight: "medium",
                          minWidth: "fit-content",
                        }}
                      >
                        {themeName}
                      </Typography>

                      {/* 颜色预览区域 */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          flex: 1,
                          minWidth: 0,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={0.4}
                          sx={{
                            flexWrap: "nowrap",
                            overflow: "hidden",
                          }}
                        >
                          {(colors as string[])
                            .slice(0, 9) // 显示更多颜色
                            .map((color, index) => (
                              <Box
                                key={index}
                                sx={{
                                  width: 18, // 增大颜色圈尺寸
                                  height: 18,
                                  backgroundColor: color,
                                  borderRadius: "50%",
                                  border:
                                    color === "#ffffff" || color === "#fff"
                                      ? `1px solid ${theme.palette.divider}`
                                      : "none",
                                  flexShrink: 0,
                                  boxShadow:
                                    mode === "dark"
                                      ? "0 1px 3px rgba(255,255,255,0.1)"
                                      : "0 1px 3px rgba(0,0,0,0.1)",
                                  transition: "transform 0.2s ease",
                                  "&:hover": {
                                    transform: "scale(1.1)",
                                    zIndex: 1,
                                    position: "relative",
                                  },
                                }}
                              />
                            ))}
                          {(colors as string[]).length > 9 && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 18,
                                height: 18,
                                backgroundColor:
                                  mode === "dark"
                                    ? "rgba(255,255,255,0.1)"
                                    : "grey.100",
                                borderRadius: "50%",
                                border: "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: "0.6rem",
                                  fontWeight: "bold",
                                  color: "text.secondary",
                                  lineHeight: 1,
                                }}
                              >
                                +{(colors as string[]).length - 9}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    </Box>
                  </MenuItem>
                );
              }),
            ])
            .flat()}
        </Select>
      </FormControl>
    </Box>
  );
};

const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label = "颜色选择器",
  maxColors = 10,
  pickerWidth = 300,
  pickerHeight = 450,
}) => {
  const { mode } = useThemeContext();
  const theme = useTheme();

  // 根据 value 类型判断模式
  const isArrayMode = Array.isArray(value);
  const isSingleMode = typeof value === "string";

  // 内部状态管理
  const [presetAnchorEl, setPresetAnchorEl] = useState<HTMLElement | null>(
    null
  );
  const [customAnchorEl, setCustomAnchorEl] = useState<HTMLElement | null>(
    null
  );
  const [clickedChipIndex, setClickedChipIndex] = useState<number>(-1);
  const [selectedColors, setSelectedColors] = useState<string[]>(() => {
    if (isArrayMode) {
      return value as string[];
    } else if (isSingleMode) {
      return [value as string];
    }
    return [];
  });
  const [clickedColor, setClickedColor] = useState<string>("");
  const [clickedSelectedColorIndex, setClickedSelectedColorIndex] =
    useState<number>(-1);

  // 临时颜色状态管理
  const [tempColor, setTempColor] = useState<string>("");
  const [tempColorIndex, setTempColorIndex] = useState<number>(-1);
  const popoverContentRef = useRef<HTMLDivElement | null>(null);

  // 折叠状态管理
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["Brand", "Qualitative"]) // 默认展开常用分类
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showScrollbar, setShowScrollbar] = useState<boolean>(false);

  // 初始化值
  const initializeValue = useCallback(() => {
    if (isArrayMode) {
      setSelectedColors(value as string[]);
    } else if (isSingleMode) {
      setSelectedColors([value as string]);
    } else {
      setSelectedColors([]);
    }
  }, [value, isArrayMode, isSingleMode]);

  React.useEffect(() => {
    initializeValue();
  }, [initializeValue]);

  const handlePresetClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setPresetAnchorEl(event.currentTarget);
    },
    []
  );

  const handleCustomClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      (event.currentTarget as HTMLElement)?.blur();
      setCustomAnchorEl(event.currentTarget);
      setClickedColor(getCurrentColor());
      setClickedSelectedColorIndex(-1);
      setTempColor(getCurrentColor());
      setTempColorIndex(-1);
    },
    []
  );

  const handlePresetClose = useCallback(() => {
    setPresetAnchorEl(null);
  }, []);

  const handleCustomClose = useCallback(() => {
    setCustomAnchorEl(null);
    setClickedChipIndex(-1);
    setClickedColor("");
    setClickedSelectedColorIndex(-1);
    setTempColor("");
    setTempColorIndex(-1);
    // 避免关闭时焦点留在被 aria-hidden 的节点上
    requestAnimationFrame(() => {
      const el = document.activeElement as HTMLElement | null;
      if (el && typeof el.blur === "function") el.blur();
    });
  }, []);

  // 确认颜色选择
  const handleConfirmColor = useCallback(() => {
    if (tempColor) {
      if (tempColorIndex >= 0) {
        // 更新现有颜色
        const newColors = [...selectedColors];
        newColors[tempColorIndex] = tempColor;
        setSelectedColors(newColors);
        if (isSingleMode) {
          onChange(newColors[0] || "");
        } else {
          onChange(newColors);
        }
      } else {
        // 添加新颜色
        if (isSingleMode) {
          setSelectedColors([tempColor]);
          onChange(tempColor);
        } else {
          const newColors = [...selectedColors, tempColor];
          if (newColors.length <= maxColors) {
            setSelectedColors(newColors);
            onChange(newColors);
          }
        }
      }
    }
    handleCustomClose();
  }, [
    tempColor,
    tempColorIndex,
    selectedColors,
    onChange,
    maxColors,
    isSingleMode,
    handleCustomClose,
  ]);

  // 取消颜色选择
  const handleCancelColor = useCallback(() => {
    handleCustomClose();
  }, [handleCustomClose]);

  const handleChipClick = useCallback(
    (event: React.MouseEvent<HTMLElement>, index: number) => {
      (event.currentTarget as HTMLElement)?.blur();
      // 使用事件目标的最外层容器作为锚点，避免拖拽组件的 ref 问题
      const container = event.currentTarget.closest(
        "[data-color-picker-container]"
      ) as HTMLElement;
      if (container) {
        setCustomAnchorEl(container);
      } else {
        // 回退到使用当前目标
        setCustomAnchorEl(event.currentTarget);
      }
      setClickedChipIndex(index);
      setClickedColor(selectedColors[index]);
      setClickedSelectedColorIndex(index);
      setTempColor(selectedColors[index]);
      setTempColorIndex(index);
    },
    [selectedColors]
  );

  // 在声明 customOpen 之后再声明 focus 逻辑（见下方 customOpen 定义）

  const handleColorChange = useCallback((color: ColorResult) => {
    const decimalToHex = (alpha: number | undefined) =>
      alpha === 0 ? "00" : Math.round(255 * alpha!).toString(16);
    const hexCode = `${color.hex}${decimalToHex(color.rgb.a)}`;
    const newColor = hexCode;
    setTempColor(newColor);
  }, []);

  const handleThemeColorClick = useCallback(
    (color: string) => {
      if (isSingleMode) {
        // 单色模式：直接替换颜色
        setSelectedColors([color]);
        onChange(color);
        handlePresetClose();
      } else {
        // 数组模式：添加新颜色并关闭弹窗
        const newColors = [...selectedColors, color];
        if (newColors.length <= maxColors) {
          setSelectedColors(newColors);
          onChange(newColors);
          handlePresetClose();
        }
      }
    },
    [selectedColors, onChange, maxColors, handlePresetClose, isSingleMode]
  );

  // 选择整行颜色（仅在数组模式下使用）
  const handleSelectThemeRow = useCallback(
    (colors: string[]) => {
      if (isArrayMode) {
        // 数组模式：替换为整行颜色（限制在 maxColors 内）
        const newColors = colors.slice(0, maxColors);
        setSelectedColors(newColors);
        onChange(newColors);
        handlePresetClose();
      }
    },
    [onChange, maxColors, handlePresetClose, isArrayMode]
  );

  // 切换分类折叠状态
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  // 处理搜索
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    []
  );

  // 过滤颜色主题
  const filteredThemes = useCallback(() => {
    if (!searchQuery.trim()) {
      return PredefinedColorThemes;
    }

    const filtered: PredefinedColorThemesType = {};
    const query = searchQuery.toLowerCase();

    Object.entries(PredefinedColorThemes).forEach(([category, themes]) => {
      const filteredThemes: { [themeName: string]: string[] } = {};

      Object.entries(themes).forEach(([themeName, colors]) => {
        // 搜索分类名、主题名或颜色值
        const categoryMatch = category.toLowerCase().includes(query);
        const themeMatch = themeName.toLowerCase().includes(query);
        const colorMatch = (colors as string[]).some((color) =>
          color.toLowerCase().includes(query)
        );

        if (categoryMatch || themeMatch || colorMatch) {
          filteredThemes[themeName] = colors;
        }
      });

      if (Object.keys(filteredThemes).length > 0) {
        filtered[category] = filteredThemes;
      }
    });

    return filtered;
  }, [searchQuery]);

  const handleRemoveColor = useCallback(
    (index: number) => {
      const newColors = selectedColors.filter((_, i) => i !== index);
      setSelectedColors(newColors);

      // 根据模式返回不同的值
      if (isSingleMode) {
        onChange(newColors[0] || "");
      } else {
        onChange(newColors);
      }
    },
    [selectedColors, onChange, isSingleMode]
  );

  const presetOpen = Boolean(presetAnchorEl);
  const customOpen = Boolean(customAnchorEl);

  useEffect(() => {
    if (customOpen && popoverContentRef.current) {
      requestAnimationFrame(() => {
        popoverContentRef.current && popoverContentRef.current.focus();
      });
    }
  }, [customOpen]);
  const themeKeys = Object.keys(colorThemes) as Array<keyof typeof colorThemes>;

  // 获取当前选中的颜色
  const getCurrentColor = useCallback(() => {
    return selectedColors[selectedColors.length - 1] || "#000000";
  }, [selectedColors]);

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // 拖拽状态
  const [activeId, setActiveId] = useState<string | null>(null);

  // 处理拖拽开始
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // 处理拖拽结束
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id || !isArrayMode) return;

      const oldIndex = selectedColors.findIndex(
        (_, i) => `color-${i}` === active.id
      );
      const newIndex = selectedColors.findIndex(
        (_, i) => `color-${i}` === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newColors = arrayMove(selectedColors, oldIndex, newIndex);
        setSelectedColors(newColors);
        onChange(newColors);
      }
    },
    [selectedColors, onChange, isArrayMode]
  );

  // DnDChip 组件：可拖拽 Chip
  const DnDChip: React.FC<{
    id: string;
    index: number;
    color: string;
    labelText: string;
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
    disabled?: boolean;
    onDelete?: () => void;
  }> = ({ id, index, color, labelText, onClick, disabled, onDelete }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id, disabled });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isDragging
        ? "none"
        : transition ||
          "transform 300ms cubic-bezier(0.2, 0, 0.2, 1), opacity 200ms cubic-bezier(0.2, 0, 0.2, 1)",
      opacity: isDragging ? 0.3 : 1,
      zIndex: isDragging ? 1000 : 1,
    };

    const iconColor = getContrastColor(color);

    return (
      <Box
        ref={setNodeRef}
        sx={{
          position: "relative",
          ...style, // 将 transform 应用到外层 Box，这样关闭按钮也会跟随移动
        }}
      >
        <Chip
          component="div"
          label={labelText}
          {...attributes}
          {...listeners}
          sx={{
            width: 32,
            height: 32,
            backgroundColor: color,
            color: iconColor,
            fontWeight: "bold",
            border:
              color === "#ffffff" ? "1px solid rgb(174, 167, 167)" : "none",
            cursor: disabled ? "default" : "grab",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            touchAction: "none",
            borderRadius: "50%", // 确保 Chip 是圆形的
            transition: isDragging
              ? "none"
              : "box-shadow 200ms cubic-bezier(0.2, 0, 0.2, 1), opacity 200ms cubic-bezier(0.2, 0, 0.2, 1)",
            ".MuiChip-label": {
              p: 0,
              m: 0,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textOverflow: "clip",
              overflow: "visible",
              color: iconColor,
            },
            "&:hover": {
              transform: disabled ? "none" : "scale(1.05)",
              boxShadow:
                mode === "dark"
                  ? "0 2px 8px rgba(255,255,255,0.2)"
                  : "0 2px 8px rgba(0,0,0,0.2)",
              backgroundColor: color,
            },
            "&:active": {
              transform: disabled ? "none" : "scale(0.98)",
            },
          }}
          onClick={onClick}
        />
        {/* 删除按钮（右上角） */}
        {onDelete && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{
              position: "absolute",
              top: -5,
              right: -5,
              minWidth: 0,
              width: 15,
              height: 15,
              p: 0,
              borderRadius: "50%",
              backgroundColor: iconColor,
              opacity: isDragging ? 0.3 : 0.8, // 拖拽时也降低关闭按钮的透明度
              color: color,
              transition: isDragging
                ? "none"
                : "opacity 200ms cubic-bezier(0.2, 0, 0.2, 1)",
              "&:hover": { backgroundColor: iconColor },
            }}
          >
            <Iconify icon="icon-park-twotone:applet-closed" size={12} />
          </Button>
        )}
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 1, bgcolor: "transparent" }} elevation={0}>
      {label && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          {label}
        </Typography>
      )}

      {/* 上方居中显示已选择的颜色 Chip */}
      <Box
        data-color-picker-container
        sx={{ display: "flex", justifyContent: "center", mb: 2 }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={selectedColors.map((_, i) => `color-${i}`)}
            strategy={rectSortingStrategy}
      >
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          justifyContent="center"
              sx={{
                // 确保容器支持平滑过渡
                position: "relative",
              }}
        >
          {selectedColors.map((color, index) => (
            <DnDChip
                  key={`color-${index}`}
                  id={`color-${index}`}
              index={index}
              color={color}
              labelText={`${index + 1}`}
              onClick={(e) => handleChipClick(e, index)}
              disabled={!isArrayMode}
              onDelete={() => handleRemoveColor(index)}
            />
          ))}

          {/* 添加颜色按钮 - 仅在数组模式下显示 */}
          {isArrayMode && selectedColors.length < maxColors && (
            <Chip
              label={<Add sx={{ fontSize: "16px" }} />}
              variant="outlined"
              onClick={handleCustomClick}
              sx={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "& .MuiChip-label": {
                  p: 0,
                  m: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textOverflow: "clip",
                  overflow: "visible",
                },
              }}
            />
          )}
        </Stack>
          </SortableContext>
          <DragOverlay
            style={{
              cursor: "grabbing",
            }}
            dropAnimation={{
              duration: 300,
              easing: "cubic-bezier(0.2, 0, 0.2, 1)",
            }}
          >
            {activeId ? (
              (() => {
                const dragIndex = parseInt(activeId.replace("color-", ""));
                const dragColor = selectedColors[dragIndex];
                const iconColor = getContrastColor(dragColor || "#000000");
                return (
                  <Box
                    sx={{
                      opacity: 0.95,
                      transform: "rotate(2deg) scale(1.1)",
                      boxShadow: 6,
                      borderRadius: "50%", // 圆形边框，与 Chip 匹配
                      width: 32,
                      height: 32,
                      overflow: "visible", // 允许阴影显示
                      transition: "none", // 拖拽时禁用过渡
                    }}
                  >
                    <Chip
                      component="div"
                      label={`${dragIndex + 1}`}
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: dragColor,
                        color: iconColor,
                        fontWeight: "bold",
                        border:
                          dragColor === "#ffffff"
                            ? "1px solid rgb(174, 167, 167)"
                            : "none",
                        cursor: "grabbing",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%", // 确保 Chip 是圆形的
                        ".MuiChip-label": {
                          p: 0,
                          m: 0,
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textOverflow: "clip",
                          overflow: "visible",
                          color: iconColor,
                        },
                      }}
                    />
                  </Box>
                );
              })()
            ) : null}
          </DragOverlay>
        </DndContext>
      </Box>

      {/* 下方左右按钮 */}
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="outlined"
          startIcon={<Palette />}
          onClick={handlePresetClick}
          sx={{ minWidth: 120 }}
        >
          预定义颜色
        </Button>
        <Button
          variant="outlined"
          startIcon={<ColorLens />}
          onClick={handleCustomClick}
          sx={{ minWidth: 120 }}
        >
          自定义颜色
        </Button>
      </Stack>

      {/* 预定义颜色弹窗 */}
      <Popover
        open={presetOpen}
        anchorEl={presetAnchorEl}
        onClose={handlePresetClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Paper
          sx={{
            width: 450,
            height: 600,
            p: 2,
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            选择预定义颜色
          </Typography>

          {/* 搜索框 */}
          <TextField
            size="small"
            placeholder="搜索颜色主题..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Divider sx={{ mb: 2 }} />

          {/* 可滚动的内容区域 */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              // 自动隐藏/显示滚动条
              scrollbarWidth: showScrollbar ? "thin" : "none", // Firefox
              "&::-webkit-scrollbar": {
                width: showScrollbar ? "6px" : "none", // Chrome, Safari, Edge
              },
              "&::-webkit-scrollbar-track": {
                background: showScrollbar
                  ? mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0, 0, 0, 0.1)"
                  : "transparent",
                borderRadius: "3px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: showScrollbar
                  ? mode === "dark"
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(0, 0, 0, 0.3)"
                  : "transparent",
                borderRadius: "3px",
                "&:hover": {
                  background: showScrollbar
                    ? mode === "dark"
                      ? "rgba(255,255,255,0.5)"
                      : "rgba(0, 0, 0, 0.5)"
                    : "transparent",
                },
              },
              // 组件和滚动条之间的间距
              paddingRight: showScrollbar ? "8px" : "0px",
              // 鼠标悬停时显示滚动条
              "&:hover": {
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background:
                    mode === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0, 0, 0, 0.1)",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background:
                    mode === "dark"
                      ? "rgba(255,255,255,0.3)"
                      : "rgba(0, 0, 0, 0.3)",
                  borderRadius: "3px",
                  "&:hover": {
                    background:
                      mode === "dark"
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(0, 0, 0, 0.5)",
                  },
                },
                paddingRight: "8px",
              },
            }}
            onMouseEnter={() => setShowScrollbar(true)}
            onMouseLeave={() => setShowScrollbar(false)}
          >
            {Object.entries(filteredThemes()).map(([category, themes]) => (
              <Box key={category} sx={{ mb: 2 }}>
                {/* 分类标题 - 可点击折叠 */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                    cursor: "pointer",
                    p: 1,
                    borderRadius: 1,
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                  onClick={() => toggleCategory(category)}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "bold",
                      color: "primary.main",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {category}
                  </Typography>
                  <IconButton size="small">
                    {expandedCategories.has(category) ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </IconButton>
                </Box>

                {/* 折叠的内容 */}
                <Collapse in={expandedCategories.has(category)}>
                  {Object.entries(themes).map(([themeName, colors]) => (
                    <Box key={themeName} sx={{ mb: 2, ml: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1,
                          fontWeight: "medium",
                          fontSize: "0.8rem",
                          color: "text.secondary",
                        }}
                      >
                        {themeName}
                        {isArrayMode && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{
                              ml: 1,
                              color: "text.disabled",
                              fontSize: "0.7rem",
                            }}
                          >
                            (点击空白处选择整行)
                          </Typography>
                        )}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        sx={{
                          mb: 1,
                          minHeight: 24,
                          py: 0.5,
                          px: 0.5,
                          borderRadius: 1,
                          cursor: isArrayMode ? "pointer" : "default",
                          "&:hover": isArrayMode
                            ? {
                                backgroundColor: "action.hover",
                              }
                            : {},
                        }}
                        onClick={(e) => {
                          // 如果点击的是 Stack 本身（空白区域），则选择整行
                          // 检查点击目标是否是 Stack 或其直接子元素（但不是颜色圆圈）
                          const target = e.target as HTMLElement;
                          const isColorCircle =
                            target.closest("[data-color-circle]") !== null;
                          if (isArrayMode && !isColorCircle) {
                            handleSelectThemeRow(colors as string[]);
                          }
                        }}
                      >
                        {(colors as string[]).map((color, index) => (
                          <Box
                            key={index}
                            data-color-circle
                            sx={{
                              width: 20,
                              height: 20,
                              backgroundColor: color,
                              borderRadius: "50%",
                              cursor: "pointer",
                              border:
                                color === "#ffffff"
                                  ? `1px solid ${theme.palette.divider}`
                                  : "none",
                              transition: "all 0.2s ease",
                              flexShrink: 0,
                              "&:hover": {
                                transform: "scale(1.3)",
                                border: `2px solid ${
                                  theme.palette.mode === "dark"
                                    ? theme.palette.text.secondary
                                    : theme.palette.text.primary
                                }`,
                                backgroundColor: color,
                                zIndex: 1,
                                position: "relative",
                                boxShadow:
                                  mode === "dark"
                                    ? "0 2px 8px rgba(255,255,255,0.3)"
                                    : "0 2px 8px rgba(0,0,0,0.3)",
                              },
                            }}
                            onClick={(e) => {
                              // 阻止事件冒泡，确保点击颜色圆圈时不会触发整行选择
                              e.stopPropagation();
                              handleThemeColorClick(color);
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Collapse>
              </Box>
            ))}

            {/* 无搜索结果提示 */}
            {Object.keys(filteredThemes()).length === 0 && searchQuery && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 4,
                  color: "text.secondary",
                }}
              >
                <Search sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="body2">未找到匹配的颜色主题</Typography>
                <Typography variant="caption" sx={{ mt: 1 }}>
                  尝试搜索其他关键词
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Popover>

      {/* 自定义颜色弹窗 */}
      <Popover
        open={customOpen}
        anchorEl={customAnchorEl}
        onClose={handleCustomClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Paper
          sx={{
            width: pickerWidth,
            height: pickerHeight,
            p: 0,
            display: "flex",
            flexDirection: "column",
            boxShadow:
              mode === "dark"
                ? "0 4px 20px rgba(255,255,255,0.1)"
                : "0 4px 20px rgba(0,0,0,0.15)",
            overflow: "hidden",
            bgcolor: "background.paper",
            "& *": {
              pointerEvents: "auto !important",
            },
            "& .sketch-picker": {
              "& *": {
                pointerEvents: "auto !important",
              },
            },
          }}
          ref={popoverContentRef}
          tabIndex={-1}
        >
          {/* 标题栏 */}
          <Box
            sx={{
              p: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
              flexShrink: 0,
            }}
          >
            <Typography variant="subtitle2" sx={{ textAlign: "center" }}>
              自定义颜色
            </Typography>
          </Box>

          {/* SketchPicker 区域 - 占据剩余空间 */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              p: 1,
              bgcolor: "background.paper",
              "& .sketch-picker": {
                backgroundColor: theme.palette.background.paper + " !important",
                "& > div": {
                  backgroundColor:
                    theme.palette.background.paper + " !important",
                  "& input": {
                    backgroundColor:
                      mode === "dark"
                        ? theme.palette.background.paper
                        : "#ffffff",
                    color: theme.palette.text.primary + " !important",
                    borderColor: theme.palette.divider + " !important",
                  },
                  "& label": {
                    color: theme.palette.text.primary + " !important",
                  },
                  "& span": {
                    color: theme.palette.text.primary + " !important",
                  },
                },
              },
            }}
          >
            <SketchPicker
              color={tempColor || clickedColor || getCurrentColor()}
              onChange={handleColorChange}
              onChangeComplete={handleColorChange}
              width="100%"
              styles={{
                default: {
                  picker: {
                    boxShadow: "none",
                    border: "none",
                    width: "100%",
                    height: "100%",
                    backgroundColor: theme.palette.background.paper,
                  },
                },
              }}
            />
          </Box>

          {/* 按钮区域 */}
          <Box
            sx={{
              p: 1,
              borderTop: "1px solid",
              borderColor: "divider",
              flexShrink: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<Close />}
              onClick={handleCancelColor}
              size="small"
            >
              取消
            </Button>
            <Button
              variant="contained"
              startIcon={<Check />}
              onClick={handleConfirmColor}
              size="small"
              disabled={!tempColor}
            >
              确认
            </Button>
          </Box>
        </Paper>
      </Popover>
    </Paper>
  );
};

export default ColorPicker;
