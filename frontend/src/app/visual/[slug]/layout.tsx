"use client";

import { useEffect } from "react";
import { Box } from "@mui/material";

export default function SlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalOverflowX = document.body.style.overflowX;
    const originalOverflowY = document.body.style.overflowY;

    // 禁用 body 滚动
    document.body.style.overflow = "hidden";
    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "hidden";

    // 禁用 html 滚动
    const htmlElement = document.documentElement;
    const originalHtmlOverflow = htmlElement.style.overflow;
    htmlElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overflowX = originalOverflowX;
      document.body.style.overflowY = originalOverflowY;
      htmlElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {children}
    </Box>
  );
}
