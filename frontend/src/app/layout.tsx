"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import theme from "../theme";
import { Header, SpeedDial as SpeedDialComponent } from "../components";
import { AuthProvider } from "../contexts/AuthContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAgentPage = pathname === "/agent";
  const isToolPage = pathname.startsWith("/visual/") && pathname !== "/visual";
  const shouldAutoHide = isAgentPage || isToolPage;

  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100vh",
                  overflow: "hidden",
                }}
              >
                <Header />
                <Box
                  component="main"
                  sx={{
                    flex: 1,
                    overflow: "auto",
                    pt: shouldAutoHide ? 0 : 8, // Agent 页面和工具页面不需要顶部 padding
                  }}
                >
                  {children}
                </Box>
                <SpeedDialComponent />
              </Box>
            </AuthProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
