"use client";

import Link from "next/link";
import { useState, MouseEvent, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  Badge,
  Menu,
  MenuItem,
  Stack,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import animStyles from "../../../styles/common/global-animations.module.css";
import { useAuthContext } from "@/contexts/AuthContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import UserMenu from "./UserMenu";
import Dock, { DockItemData } from "../common/Dock";
import HomeIcon from "@mui/icons-material/Home";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import BarChartIcon from "@mui/icons-material/BarChart";
import ScienceIcon from "@mui/icons-material/Science";
import ArticleIcon from "@mui/icons-material/Article";
import ForumIcon from "@mui/icons-material/Forum";
import Iconify from "../common/Iconify";

export default function Header() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const { mode, toggleMode } = useThemeContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // 检查是否在需要自动隐藏Header的页面（Agent页面或工具页面）
  const isAgentPage = pathname === "/agent";
  const isToolPage =
    (pathname.startsWith("/visual/") && pathname !== "/visual") ||
    (pathname.startsWith("/analysis/") && pathname !== "/analysis") ||
    pathname.startsWith("/forum/post/");
  const shouldAutoHide = isAgentPage || isToolPage;

  // 自动隐藏逻辑 - 隐藏后不再显示
  useEffect(() => {
    if (!shouldAutoHide) {
      setIsVisible(true);
      return;
    }

    // 初始延迟后隐藏，隐藏后不再显示
    const initialTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 500);

    return () => {
      clearTimeout(initialTimeout);
    };
  }, [shouldAutoHide]);

  // Dock 导航项配置
  const dockItems: DockItemData[] = [
    {
      icon: <HomeIcon sx={{ fontSize: 22 }} />,
      label: "主页",
      onClick: () => {
        window.location.href = "/";
      },
      className: pathname === "/" ? "active" : "",
    },
    {
      icon: <Iconify icon="simple-icons:probot" size={22} />,
      label: "Agent",
      onClick: () => {
        window.location.href = "/agent";
      },
      className: pathname === "/agent" ? "active" : "",
    },
    {
      icon: <Iconify icon="oui:app-visualize" size={20} />,
      label: "绘图",
      onClick: () => {
        window.location.href = "/visual";
      },
      className: pathname.startsWith("/visual") ? "active" : "",
    },
    {
      icon: <Iconify icon="ep:data-analysis" size={22} />,
      label: "分析",
      onClick: () => {
        window.location.href = "/analysis";
      },
      className: pathname.startsWith("/analysis") ? "active" : "",
    },
    {
      icon: <ArticleIcon sx={{ fontSize: 22 }} />,
      label: "博客",
      onClick: () => {
        window.location.href = "/blog";
      },
      className: pathname.startsWith("/blog") ? "active" : "",
    },
    {
      icon: <Iconify icon="healthicons:forum" size={24} />,
      label: "论坛",
      onClick: () => {
        window.location.href = "/forum";
      },
      className: pathname.startsWith("/forum") ? "active" : "",
    },
  ];

  return (
    <>
      <AppBar
        color="inherit"
        position="fixed"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          backdropFilter: "saturate(180%) blur(8px)",
          backgroundColor:
            mode === "light" ? "rgba(255,255,255,0.8)" : "rgba(30,30,30,0.8)",
          transform:
            shouldAutoHide && !isVisible
              ? "translateY(-100%)"
              : "translateY(0)",
          transition: "transform 0.3s ease-in-out",
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: 64 }}>
          {/* Left: Logo */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mr: 2 }}>
            <Box
              component={Link}
              href="/"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              <Box
                component="img"
                src="/icons/panda-mini.svg"
                alt="logo"
                sx={{ width: 28, height: 28, mr: 1 }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: "linear-gradient(90deg, #2DD4BF, #8B5CF6)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                OmicsAgent
              </Typography>
            </Box>
          </Stack>

          {/* Middle: Nav */}
          <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
            <Button
              component={Link}
              href="/"
              color="inherit"
              sx={{ fontSize: "0.95rem", fontWeight: 500 }}
            >
              主页
            </Button>
            <Button
              component={Link}
              href="/agent"
              color="inherit"
              sx={{ fontSize: "0.95rem", fontWeight: 500 }}
            >
              Agent
            </Button>
            <Button
              component={Link}
              href="/visual"
              color="inherit"
              sx={{ fontSize: "0.95rem", fontWeight: 500 }}
            >
              绘图
            </Button>
            <Button
              component={Link}
              href="/analysis"
              color="inherit"
              sx={{ fontSize: "0.95rem", fontWeight: 500 }}
            >
              分析
            </Button>
            <Button
              component={Link}
              href="/blog"
              color="inherit"
              sx={{ fontSize: "0.95rem", fontWeight: 500 }}
            >
              博客
            </Button>
            <Button
              component={Link}
              href="/forum"
              color="inherit"
              sx={{ fontSize: "0.95rem", fontWeight: 500 }}
            >
              论坛
            </Button>
          </Stack>

          {/* Right: Actions */}
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Theme Toggle Button */}
            <IconButton
              onClick={toggleMode}
              color="inherit"
              aria-label="toggle theme"
              sx={{
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.1)",
                },
              }}
            >
              {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>

            <IconButton
              className={`${animStyles.messageButtonShake} ${animStyles.messageButtonPulse} ${animStyles.buttonScale}`}
              color="inherit"
              aria-label="notifications"
            >
              <Badge
                color="primary"
                variant="dot"
                sx={{
                  "& .MuiBadge-badge": {
                    right: 2, // 调整水平位置
                    top: 2, // 调整垂直位置
                    width: 8, // 设置固定宽度
                    height: 8, // 设置固定高度
                    minWidth: 8, // 确保最小宽度
                  },
                }}
              >
                <NotificationsNoneOutlinedIcon />
              </Badge>
            </IconButton>

            <IconButton
              className={`${animStyles.settingsButtonRotate} ${animStyles.buttonScale}`}
              color="inherit"
              aria-label="settings"
              onClick={handleOpen}
              aria-controls={open ? "settings-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <SettingsOutlinedIcon />
            </IconButton>
            <Menu
              id="settings-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem
                onClick={handleClose}
                sx={{ fontSize: "0.95rem", fontWeight: 500 }}
              >
                外观设置
              </MenuItem>
              <MenuItem
                onClick={handleClose}
                sx={{ fontSize: "0.95rem", fontWeight: 500 }}
              >
                账户设置
              </MenuItem>
              <MenuItem
                onClick={handleClose}
                sx={{ fontSize: "0.95rem", fontWeight: 500 }}
              >
                关于
              </MenuItem>
            </Menu>

            {isLoading ? (
              // 加载状态：显示骨架屏，保持与用户头像相同的尺寸
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  minWidth: 100,
                  opacity: 0.7,
                  transition: "opacity 0.3s ease-in-out",
                }}
              >
                <Skeleton
                  variant="circular"
                  width={40}
                  height={40}
                  sx={{
                    animation: "pulse 1.5s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.4 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
              </Box>
            ) : isAuthenticated ? (
              <UserMenu />
            ) : (
              <Button
                className={`${animStyles.loginButtonMask} ${animStyles.buttonScale}`}
                startIcon={<LoginOutlinedIcon />}
                variant="contained"
                color="primary"
                component={Link}
                href="/auth/login"
                sx={{ fontSize: "0.95rem", fontWeight: 500 }}
              >
                登录
              </Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>
      {/* Dock - 在 header 隐藏时显示 */}
      {shouldAutoHide && !isVisible && (
        <Dock items={dockItems} className={mode === "light" ? "light" : ""} />
      )}
    </>
  );
}
