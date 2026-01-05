import { memo } from "react";
import { Icon } from "@iconify/react";
import { Box } from "@mui/material";

interface IconifyProps {
  icon: string;
  size?: number;
  color?: string;
}

function Iconify({ icon, size = 24, color }: IconifyProps) {
  return (
    <Box
      component={Icon}
      icon={icon}
      sx={{
        width: size,
        height: size,
        color: color || "currentColor",
        display: "inline-flex",
      }}
    />
  );
}

// 使用 memo 缓存组件，避免不必要的重新渲染
// 自定义比较函数：返回 true 表示 props 相等（不需要重新渲染）
// 返回 false 表示 props 不同（需要重新渲染）
export default memo(Iconify, (prevProps, nextProps) => {
  // 如果所有 props 都相等，返回 true（不重新渲染）
  const isEqual =
    prevProps.icon === nextProps.icon &&
    prevProps.size === nextProps.size &&
    prevProps.color === nextProps.color;
  return isEqual;
});
