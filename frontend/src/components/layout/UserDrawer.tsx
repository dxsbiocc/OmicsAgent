"use client";

import { useState, useEffect, useRef } from "react";
import {
  Drawer,
  Box,
  Typography,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Chip,
  Stack,
  IconButton,
  Paper,
  Grid,
  Card,
  CardContent,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Tabs,
  Tab,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import {
  Person,
  Settings,
  ExitToApp,
  Email,
  CalendarToday,
  AdminPanelSettings,
  CheckCircle,
  Close,
  Dashboard,
  Article,
  Comment,
  Verified,
  Warning,
  Favorite,
  Visibility,
  Edit,
  Home,
  Security,
  Add,
  RocketLaunch,
  PhotoCamera,
  CloudUpload,
} from "@mui/icons-material";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { authApi } from "@/libs/api/auth";
import styles from "../../../styles/layout/avatar.module.css";

interface UserDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function UserDrawer({ open, onClose }: UserDrawerProps) {
  const { user, logout, refreshUser, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // 焦点管理：当Drawer关闭时，确保焦点被正确管理
  useEffect(() => {
    if (!open) {
      // 当Drawer关闭时，关闭所有Dialog并移除焦点
      setAvatarDialogOpen(false);
      setSelectedTab(0);
      setSelectedAvatar("");
      setUploadedFile(null);

      if (drawerRef.current) {
        // 使用inert属性来防止焦点移动
        drawerRef.current.setAttribute("inert", "");

        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && drawerRef.current.contains(activeElement)) {
          activeElement.blur();
        }
      }
    } else if (drawerRef.current) {
      // 当Drawer打开时，移除inert属性
      drawerRef.current.removeAttribute("inert");
    }
  }, [open]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    onClose();
    router.push("/auth/login");
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleAvatarClick = () => {
    // 先移除当前焦点，避免 aria-hidden 警告
    if (document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }
    setAvatarDialogOpen(true);
  };

  const handleAvatarDialogClose = () => {
    setAvatarDialogOpen(false);
    setSelectedTab(0);
    setSelectedAvatar("");
    setUploadedFile(null);

    // 确保焦点被正确管理，避免 aria-hidden 警告
    setTimeout(() => {
      if (document.activeElement && document.activeElement !== document.body) {
        (document.activeElement as HTMLElement).blur();
      }
      // 将焦点返回到 Drawer 内的第一个可聚焦元素
      if (drawerRef.current) {
        const firstFocusable = drawerRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }
    }, 100);
  };

  // 当Drawer关闭时，确保Dialog也关闭
  useEffect(() => {
    if (!open && avatarDialogOpen) {
      handleAvatarDialogClose();
    }
  }, [open, avatarDialogOpen]);

  // 强制焦点管理：确保当Drawer关闭时，所有焦点都被移除
  useEffect(() => {
    if (!open) {
      // 延迟执行，确保DOM更新完成
      const timeoutId = setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement !== document.body) {
          // 如果焦点不在body上，强制移除焦点
          activeElement.blur();
          document.body.focus();
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
  };

  const handleSaveAvatar = async () => {
    try {
      // 先测试获取用户信息
      try {
        const currentUser = await authApi.getCurrentUser();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "认证失败";
        alert("认证失败，请重新登录: " + errorMessage);
        return;
      }

      if (selectedAvatar) {
        // 保存预设头像
        const avatarUrl = `/images/avatar/${selectedAvatar}`;
        await authApi.setPresetAvatar(avatarUrl);
      } else if (uploadedFile) {
        // 保存上传的头像
        await authApi.uploadAvatar(uploadedFile);
      }

      // 刷新用户信息
      await refreshUser();
      handleAvatarDialogClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "头像保存失败";
      alert("头像保存失败: " + errorMessage);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{
        BackdropProps: {
          sx: {
            backgroundColor: "transparent",
          },
        },
        // 修复无障碍性问题：当Drawer关闭时，确保焦点管理正确
        disableAutoFocus: true,
        disableEnforceFocus: true,
        disableRestoreFocus: true,
      }}
      sx={{
        "& .MuiDrawer-paper": {
          width: 360,
          maxWidth: "90vw",
          background: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(25px)",
          WebkitBackdropFilter: "blur(25px)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.4)",
        },
      }}
    >
      <Box
        ref={drawerRef}
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* Header with Close Button */}
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <IconButton
            onClick={onClose}
            sx={{
              color: "#666",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* User Profile Section */}
        <Box sx={{ px: 3, pb: 3 }}>
          <Stack alignItems="center" spacing={2}>
            {/* Main Avatar */}
            <IconButton
              onClick={handleAvatarClick}
              className={styles.userDrawerAvatar}
              sx={{
                width: 90,
                height: 90,
                p: 0,
                "&:hover": {
                  "& .MuiAvatar-root": {
                    transform: "scale(1.05)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  },
                },
              }}
            >
              <Avatar
                src={
                  user.avatar_url ||
                  (selectedAvatar
                    ? `/images/avatar/${selectedAvatar}`
                    : undefined)
                }
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor:
                    user.avatar_url || selectedAvatar
                      ? "grey.100"
                      : "primary.main",
                  fontSize: "1.8rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {!user.avatar_url &&
                  !selectedAvatar &&
                  getInitials(user.username)}
              </Avatar>
            </IconButton>

            {/* User Name */}
            <Typography variant="h5" fontWeight="600" color="#333">
              {user.username}
            </Typography>

            {/* Email */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" color="#666">
                {user.email}
              </Typography>
              <Chip
                label={user.is_email_verified ? "已验证" : "未验证"}
                color={user.is_email_verified ? "success" : "warning"}
                size="small"
                icon={user.is_email_verified ? <Verified /> : <Warning />}
                sx={{ fontSize: "0.7rem", height: "20px" }}
              />
            </Box>

            {/* Account Switcher */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                  fontSize: "0.8rem",
                }}
              >
                {getInitials(user.username)}
              </Avatar>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "secondary.main",
                  fontSize: "0.8rem",
                }}
              >
                JF
              </Avatar>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "info.main",
                  fontSize: "0.8rem",
                }}
              >
                JD
              </Avatar>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  border: "2px dashed #ccc",
                  bgcolor: "transparent",
                  color: "#666",
                }}
              >
                <Add fontSize="small" />
              </Avatar>
            </Stack>
          </Stack>
        </Box>

        {/* Divider */}
        <Divider sx={{ borderStyle: "dashed", borderColor: "#e0e0e0" }} />

        {/* Navigation Menu */}
        <Box sx={{ flex: 1, overflow: "auto", py: 1 }}>
          <List sx={{ px: 2 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigate("/")}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.3)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "#666" }}>
                  <Home />
                </ListItemIcon>
                <ListItemText
                  primary="首页"
                  slotProps={{
                    primary: {
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      color: "#333",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigate("/profile")}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.3)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "#666" }}>
                  <Person />
                </ListItemIcon>
                <ListItemText
                  primary="个人资料"
                  slotProps={{
                    primary: {
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      color: "#333",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigate("/projects")}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.3)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "#666" }}>
                  <Article />
                </ListItemIcon>
                <ListItemText
                  primary="项目"
                  slotProps={{
                    primary: {
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      color: "#333",
                    },
                  }}
                />
                <Badge
                  badgeContent={3}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.7rem",
                      height: 18,
                      minWidth: 18,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigate("/subscription")}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.3)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "#666" }}>
                  <Settings />
                </ListItemIcon>
                <ListItemText
                  primary="订阅"
                  slotProps={{
                    primary: {
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      color: "#333",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigate("/security")}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.3)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "#666" }}>
                  <Security />
                </ListItemIcon>
                <ListItemText
                  primary="安全"
                  slotProps={{
                    primary: {
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      color: "#333",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigate("/settings")}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.3)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "#666" }}>
                  <Settings />
                </ListItemIcon>
                <ListItemText
                  primary="账户设置"
                  slotProps={{
                    primary: {
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      color: "#333",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>

        {/* Divider */}
        <Divider sx={{ borderStyle: "dashed", borderColor: "#e0e0e0" }} />

        {/* Promotional Banner */}
        <Box sx={{ p: 3 }}>
          <Paper
            sx={{
              background:
                "linear-gradient(135deg, rgba(255, 107, 157, 0.8) 0%, rgba(196, 69, 105, 0.8) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 3,
              p: 3,
              position: "relative",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.5)",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="white"
                  sx={{ mb: 0.5 }}
                >
                  35% OFF
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                  限时优惠
                </Typography>
              </Box>
              <RocketLaunch
                sx={{
                  fontSize: 40,
                  color: "rgba(255,255,255,0.8)",
                  transform: "rotate(-15deg)",
                }}
              />
            </Stack>
          </Paper>
        </Box>

        {/* Logout Button */}
        <Box sx={{ p: 3, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogout}
            startIcon={<ExitToApp />}
            sx={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              color: "#d32f2f",
              borderRadius: 2,
              py: 1.5,
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 500,
              border: "1px solid rgba(211, 47, 47, 0.4)",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.8)",
              },
            }}
          >
            退出登录
          </Button>
        </Box>
      </Box>

      {/* Avatar Change Dialog */}
      <Dialog
        open={avatarDialogOpen}
        onClose={(event, reason) => {
          // 先移除当前焦点，避免 aria-hidden 警告
          if (document.activeElement) {
            (document.activeElement as HTMLElement).blur();
          }
          handleAvatarDialogClose();
        }}
        maxWidth="sm"
        fullWidth
        // 修复无障碍性问题：确保Dialog的焦点管理正确
        disableAutoFocus={false}
        disableEnforceFocus={false}
        disableRestoreFocus={false}
        PaperProps={{
          sx: {
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>更换头像</DialogTitle>
        <DialogContent>
          <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="预设头像" />
            <Tab label="上传图片" />
          </Tabs>

          {selectedTab === 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                选择一个预设头像
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 2,
                  maxHeight: 400,
                  overflowY: "auto",
                }}
              >
                {Array.from({ length: 50 }, (_, i) => {
                  const isSelected =
                    selectedAvatar === `peeps-avatar-alpha-${i + 1}.png`;
                  return (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                        p: 1,
                        borderRadius: 2,
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          bgcolor: "rgba(25, 118, 210, 0.04)",
                        },
                      }}
                      onClick={() =>
                        handleAvatarSelect(`peeps-avatar-alpha-${i + 1}.png`)
                      }
                    >
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                        badgeContent={
                          isSelected ? (
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                bgcolor: "#1976d2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "14px",
                                fontWeight: "bold",
                              }}
                            >
                              ✓
                            </Box>
                          ) : null
                        }
                      >
                        <Avatar
                          src={`/images/avatar/peeps-avatar-alpha-${i + 1}.png`}
                          sx={{
                            width: 80,
                            height: 80,
                            border: isSelected
                              ? "3px solid #1976d2"
                              : "2px solid transparent",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              transform: "scale(1.05)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            },
                          }}
                        />
                      </Badge>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {selectedTab === 1 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                上传一张图片作为头像
              </Typography>
              <Box
                sx={{
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "rgba(25, 118, 210, 0.04)",
                  },
                }}
                onClick={() =>
                  document.getElementById("avatar-upload")?.click()
                }
              >
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <CloudUpload
                  sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  点击上传图片
                </Typography>
                {uploadedFile && (
                  <Box sx={{ mt: 2 }}>
                    <Avatar
                      src={URL.createObjectURL(uploadedFile)}
                      sx={{
                        width: 80,
                        height: 80,
                        mx: "auto",
                        bgcolor: "transparent",
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      {uploadedFile.name}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAvatarDialogClose}>取消</Button>
          <Button
            onClick={handleSaveAvatar}
            variant="contained"
            disabled={!selectedAvatar && !uploadedFile}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}
