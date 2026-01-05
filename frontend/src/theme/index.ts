"use client";

import { createTheme, Theme } from "@mui/material/styles";

const darkPalette = {
  mode: "dark" as const,
  background: {
    default: "#121212",
    paper: "#1e1e1e",
  },
  text: {
    primary: "#ffffff",
    secondary: "#cfcfcf",
  },
  primary: {
    main: "#ff4f81",
    light: "#ff769d",
    dark: "#b33a5b",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#6a67ce",
    light: "#8e8be2",
    dark: "#4a48a0",
    contrastText: "#ffffff",
  },
  success: {
    main: "#2dde98",
    light: "#52efb1",
    dark: "#1c9b6a",
    contrastText: "#ffffff",
  },
  info: {
    main: "#1cc7d0",
    light: "#3fd8e0",
    dark: "#139298",
    contrastText: "#ffffff",
  },
  warning: {
    main: "#ffc168",
    light: "#ffd588",
    dark: "#b38647",
    contrastText: "#1e1e1e",
  },
  error: {
    main: "#ff6c5f",
    light: "#ff8e84",
    dark: "#b44b44",
    contrastText: "#ffffff",
  },
};

const lightPalette = {
  primary: {
    main: "#ff4f81",
    light: "#ff82a3",
    dark: "#b2385b",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#6a67ce",
    light: "#9c99eb",
    dark: "#4845a0",
    contrastText: "#ffffff",
  },
  success: {
    main: "#2dde98",
    light: "#61f2b7",
    dark: "#1e9c6b",
    contrastText: "#ffffff",
  },
  info: {
    main: "#1cc7d0",
    light: "#5de1e6",
    dark: "#14929a",
    contrastText: "#ffffff",
  },
  warning: {
    main: "#ffc168",
    light: "#ffd68c",
    dark: "#b38345",
    contrastText: "#000000",
  },
  error: {
    main: "#ff6c5f",
    light: "#ff948a",
    dark: "#b24b42",
    contrastText: "#ffffff",
  },
};

const omicsPalette = {
  primary: {
    main: "#2DD4BF", // Bio Teal - 生物与生命色，生命、生长、安全
    light: "#5EEAD4",
    dark: "#14B8A6",
    contrastText: "#0F172A", // Teal 较亮，使用深色文本增加对比度
  },
  secondary: {
    main: "#8B5CF6", // Agent Violet - 核心 AI 驱动色，智慧、AI、神秘
    light: "#A78BFA",
    dark: "#7C3AED",
    contrastText: "#ffffff",
  },
  info: {
    main: "#3B82F6", // Data Blue - 数据检索色，数据、检索、科技
    light: "#60A5FA",
    dark: "#2563EB",
    contrastText: "#ffffff",
  },
  warning: {
    main: "#F59E0B", // Solar Amber - 温暖的琥珀色，用于警告
    light: "#FBBF24",
    dark: "#D97706",
    contrastText: "#ffffff",
  },
  success: {
    main: "#10B981", // Gene Green - 纯粹的翡翠绿，区别于 Bio Teal
    light: "#34D399",
    dark: "#059669",
    contrastText: "#ffffff",
  },
  error: {
    main: "#F472B6", // Watercolor Pink - 活力、亲和力点缀，用作强调或软性警告
    light: "#F9A8D4",
    dark: "#EC4899",
    contrastText: "#ffffff",
  },
  background: {
    default: "#F8FAFC", // Slate-50 - 柔和背景，匹配 demo.html
    paper: "#FFFFFF",
  },
  text: {
    primary: "#1E293B", // Slate-800 - 匹配 demo.html
    secondary: "#64748B", // Slate-500 - 匹配 demo.html
  },
};

// Create theme based on mode
export const createAppTheme = (mode: "light" | "dark"): Theme => {
  const isLight = mode === "light";

  return createTheme({
    cssVariables: true,
    palette: {
      mode,
      ...(isLight ? omicsPalette : darkPalette),
      background: isLight
        ? {
            default: "#F8FAFC", // Slate-50 - 匹配 demo.html 的背景色
            paper: "#FFFFFF",
          }
        : {
            default: "#121212",
            paper: "#1e1e1e",
          },
      text: isLight
        ? {
            primary: "#1E293B", // Slate-800 - 匹配 demo.html
            secondary: "#64748B", // Slate-500 - 匹配 demo.html
          }
        : {
            primary: "#ffffff",
            secondary: "#cfcfcf",
          },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily:
        '"Nunito", "Noto Sans SC", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700 },
      h4: { fontWeight: 700, color: "#1E293B" },
      h6: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600 }, // 取消大写，增加亲和力
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
          },
          containedPrimary: {
            background: "linear-gradient(45deg, #2DD4BF 30%, #5EEAD4 90%)", // 渐变按钮 - 使用新的 primary 颜色
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)", // 柔和的水彩阴影感
            border: "1px solid #E2E8F0", // Slate-200 - 匹配 demo.html 的边框颜色
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500 },
        },
      },
    },
  });
};

// Default theme (light mode)
const theme = createAppTheme("light");

export default theme;
