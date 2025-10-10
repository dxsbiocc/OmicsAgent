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
import animStyles from "../../../styles/common/global-animations.module.css";
import { useAuthContext } from "@/contexts/AuthContext";
import UserMenu from "./UserMenu";

export default function Header() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // 检查是否在需要自动隐藏Header的页面（Agent页面或工具页面）
  const isAgentPage = pathname === "/agent";
  const isToolPage = pathname.startsWith("/visual/") && pathname !== "/visual";
  const shouldAutoHide = isAgentPage || isToolPage;

  const handleMouseEnter = () => {
    if (!shouldAutoHide) return;
    setIsVisible(true);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!shouldAutoHide) return;
    setIsHovered(false);
    // 延迟隐藏，给用户一些缓冲时间
    setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  // 处理鼠标移动到页面顶部时显示 Header
  const handleMouseMove = (e: MouseEvent) => {
    if (!shouldAutoHide) return;

    // 如果鼠标在页面顶部 5px 范围内
    if (e.clientY <= 5) {
      // 如果还没有设置定时器，设置 1 秒延迟显示
      if (showTimeout === null) {
        const timeout = setTimeout(() => {
          setIsVisible(true);
          setIsHovered(true);
        }, 1000);
        setShowTimeout(timeout);
      }
      // 如果已经在顶部区域，不需要清除定时器，让定时器继续运行
    } else {
      // 鼠标离开顶部区域时，清除定时器并重置状态
      if (showTimeout) {
        clearTimeout(showTimeout);
        setShowTimeout(null);
      }
      setIsHovered(false);
    }
  };

  // 处理点击事件，确保点击页面其他地方时能正确重置状态
  const handleClick = () => {
    if (!shouldAutoHide) return;
    // 点击页面其他地方时，清除定时器并重置状态
    if (showTimeout) {
      clearTimeout(showTimeout);
      setShowTimeout(null);
    }
    setIsHovered(false);
  };

  // 自动隐藏逻辑
  useEffect(() => {
    if (!shouldAutoHide) {
      setIsVisible(true);
      return;
    }

    if (shouldAutoHide) {
      // 初始延迟后隐藏
      const initialTimeout = setTimeout(() => {
        setIsVisible(false);
      }, 500);

      window.addEventListener("mousemove", handleMouseMove as any);
      window.addEventListener("click", handleClick);

      return () => {
        clearTimeout(initialTimeout);
        if (showTimeout) {
          clearTimeout(showTimeout);
        }
        window.removeEventListener("mousemove", handleMouseMove as any);
        window.removeEventListener("click", handleClick);
      };
    }
  }, [shouldAutoHide, showTimeout]);

  return (
    <AppBar
      color="inherit"
      position="fixed"
      elevation={0}
      onMouseEnter={shouldAutoHide ? handleMouseEnter : undefined}
      onMouseLeave={shouldAutoHide ? handleMouseLeave : undefined}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "saturate(180%) blur(8px)",
        backgroundColor: "rgba(255,255,255,0.8)",
        transform:
          shouldAutoHide && !isVisible ? "translateY(-100%)" : "translateY(0)",
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
              src="/globe.svg"
              alt="logo"
              sx={{ width: 28, height: 28, mr: 1 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              OmicsAgent
            </Typography>
          </Box>
        </Stack>

        {/* Middle: Nav */}
        <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
          <Button component={Link} href="/" color="inherit">
            主页
          </Button>
          <Button component={Link} href="/agent" color="inherit">
            Agent
          </Button>
          <Button component={Link} href="/visual" color="inherit">
            可视化
          </Button>
          <Button component={Link} href="/analysis" color="inherit">
            分析
          </Button>
          <Button component={Link} href="/blog" color="inherit">
            博客
          </Button>
        </Stack>

        {/* Right: Actions */}
        <Stack direction="row" spacing={1} alignItems="center">
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
            <MenuItem onClick={handleClose}>外观设置</MenuItem>
            <MenuItem onClick={handleClose}>账户设置</MenuItem>
            <MenuItem onClick={handleClose}>关于</MenuItem>
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
            >
              登录
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
