/**
 * 用户头像组件
 * 点击头像打开用户信息Drawer
 */

"use client";

import { useState } from "react";
import { Box, Avatar, Tooltip, IconButton, Skeleton } from "@mui/material";
import { useAuthContext } from "@/contexts/AuthContext";
import UserDrawer from "./UserDrawer";
import styles from "../../../styles/layout/avatar.module.css";

export default function UserMenu() {
  const { user, isLoading } = useAuthContext();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleButtonClick = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  if (isLoading) {
    return (
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Tooltip title={user.username} arrow>
        <IconButton
          onClick={handleButtonClick}
          className={styles.userMenuAvatar}
          sx={{
            width: 40,
            height: 40,
            p: 0,
            "&:hover": {
              "& .MuiAvatar-root": {
                transform: "scale(1.05)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            },
            border: "2px solid transparent",
            borderRadius: "50%",
            background: "",
          }}
        >
          <Avatar
            src={user.avatar_url}
            sx={{
              width: 40,
              height: 40,
              bgcolor: user.avatar_url ? "grey.100" : "primary.main",
              fontWeight: "bold",
              fontSize: "1rem",
              transition: "all 0.2s ease-in-out",
            }}
          >
            {!user.avatar_url && getInitials(user.username)}
          </Avatar>
        </IconButton>
      </Tooltip>

      <UserDrawer open={drawerOpen} onClose={handleDrawerClose} />
    </Box>
  );
}
