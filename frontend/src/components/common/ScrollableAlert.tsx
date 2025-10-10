"use client";

import React, { useRef, useEffect } from "react";
import { Alert, AlertProps } from "@mui/material";

interface ScrollableAlertProps extends Omit<AlertProps, "ref"> {
  children: React.ReactNode;
  scrollBehavior?: "smooth" | "auto" | "instant";
  scrollBlock?: "start" | "center" | "end" | "nearest";
  scrollInline?: "start" | "center" | "end" | "nearest";
  autoScroll?: boolean;
}

/**
 * 可滚动的Alert组件
 * 当Alert显示时自动滚动到该位置
 */
export const ScrollableAlert: React.FC<ScrollableAlertProps> = ({
  children,
  scrollBehavior = "smooth",
  scrollBlock = "center",
  scrollInline = "nearest",
  autoScroll = true,
  sx = {},
  ...props
}) => {
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && alertRef.current) {
      // 延迟一点时间确保Alert完全渲染
      const timer = setTimeout(() => {
        if (alertRef.current) {
          alertRef.current.scrollIntoView({
            behavior: scrollBehavior,
            block: scrollBlock,
            inline: scrollInline,
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [children, autoScroll, scrollBehavior, scrollBlock, scrollInline]);

  return (
    <Alert ref={alertRef} sx={{ mb: 2, ...sx }} {...props}>
      {children}
    </Alert>
  );
};

export default ScrollableAlert;
