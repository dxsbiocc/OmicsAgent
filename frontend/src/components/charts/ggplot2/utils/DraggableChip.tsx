"use client";

import { ReactElement, useMemo } from "react";
import { Chip, Box, useTheme, alpha } from "@mui/material";
import { Layers } from "@mui/icons-material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Iconify from "@/components/common/Iconify";

export interface DraggableChipProps<T extends { type: string }> {
  id: string;
  index: number;
  item: T;
  label: string;
  isSelected: boolean;
  onClick: () => void;
  icon?: string | ReactElement;
}

export function DraggableChip<T extends { type: string }>({
  id,
  index,
  item,
  label,
  isSelected,
  onClick,
  icon,
}: DraggableChipProps<T>) {
  const muiTheme = useTheme();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging
      ? "none"
      : transition || "transform 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    opacity: isDragging ? 0.3 : 1,
  };

  // 根据索引设置间隔背景颜色（斑马纹效果）
  const isEven = index % 2 === 0;
  const baseColor = isEven
    ? muiTheme.palette.warning.light
    : muiTheme.palette.info.light;

  // 使用 alpha 函数只设置背景色的透明度，不影响文字、图标和边框
  const backgroundColor = alpha(baseColor, 0.1);
  const hoverBackgroundColor = alpha(baseColor, 0.2);

  // 处理图标：如果是字符串，转换为 Iconify 组件；如果是 ReactElement，直接使用；否则使用默认图标
  // 图标颜色与背景颜色对应，但不用透明度
  const chipIcon: ReactElement = useMemo(() => {
    if (icon) {
      if (typeof icon === "string") {
        return <Iconify icon={icon} color={baseColor} />;
      }
      // 如果是 ReactElement，用 Box 包裹并添加颜色
      return (
        <Box
          sx={{
            color: baseColor,
            display: "flex",
            alignItems: "center",
          }}
        >
          {icon}
        </Box>
      );
    }
    return <Layers fontSize="small" sx={{ color: baseColor }} />;
  }, [icon, baseColor]);

  // 缓存 label 内容，避免每次渲染都重新创建
  const chipLabel = useMemo(
    () => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: "50%",
            backgroundColor: "primary.main",
            color: "white",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          {index + 1}
        </Box>
        <span>{label}</span>
      </Box>
    ),
    [index, label]
  );

  return (
    <Box
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      sx={{
        width: "100%",
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none", // 防止移动端的默认触摸行为
        willChange: isDragging ? "transform" : "auto", // 优化性能
      }}
    >
      <Chip
        icon={chipIcon}
        label={chipLabel}
        {...attributes}
        {...listeners}
        sx={{
          width: "100%",
          justifyContent: "flex-start",
          border: isSelected ? 2 : 1,
          borderColor: isSelected ? "primary.main" : "divider",
          backgroundColor: backgroundColor,
          pl: 2,
          transition: isDragging
            ? "none"
            : "background-color 120ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 120ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          "&:hover": {
            backgroundColor: hoverBackgroundColor,
            transform: isDragging ? "none" : "scale(1.01)",
          },
          "& .MuiChip-label": {
            textAlign: "left",
            flex: 1,
            overflow: "visible",
            display: "flex",
            alignItems: "center",
          },
        }}
      />
    </Box>
  );
}
