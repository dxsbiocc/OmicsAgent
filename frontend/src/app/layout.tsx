"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import {
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
  Box,
} from "@mui/material";
import { ThemeProvider, useThemeContext } from "../contexts/ThemeContext";
import { createAppTheme } from "../theme";
import { Header } from "../components";
import { AuthProvider } from "../contexts/AuthContext";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

function ThemedContent({ children }: { children: ReactNode }) {
  const { mode } = useThemeContext();
  const theme = createAppTheme(mode);
  const pathname = usePathname();
  const isAgentPage = pathname === "/agent";
  const isToolPage =
    (pathname.startsWith("/visual/") && pathname !== "/visual") ||
    (pathname.startsWith("/analysis/") && pathname !== "/analysis") ||
    pathname.startsWith("/forum/post/");
  const shouldAutoHide = isAgentPage || isToolPage;

  // 设置 data-theme 属性到 html 元素
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            overflow: "hidden",
            bgcolor: "background.default",
          }}
        >
          <Header />
          <Box
            component="main"
            sx={{
              flex: 1,
              overflow: "auto",
              pt: shouldAutoHide ? 0 : 8,
              bgcolor: "background.default",
              // minHeight: "100%",
            }}
          >
            {children}
          </Box>
        </Box>
      </AuthProvider>
    </MuiThemeProvider>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('themeMode') || 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <ThemedContent>{children}</ThemedContent>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
