/**
 * 用户个人资料页面
 * 需要认证才能访问
 */

"use client";

import { ProtectedRoute } from "@/components/auth";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Alert,
} from "@mui/material";
import {
  Person,
  Email,
  CalendarToday,
  AdminPanelSettings,
  Verified,
  Warning,
} from "@mui/icons-material";

export default function ProfilePage() {
  const { user } = useAuthContext();
  const router = useRouter();

  console.log(user);
  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar
              src={user.avatar_url}
              sx={{
                width: 80,
                height: 80,
                fontSize: "2rem",
                mr: 3,
                bgcolor: "primary.light",
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {user.username}
              </Typography>
              <Chip
                label={user.is_admin ? "管理员" : "普通用户"}
                color={user.is_admin ? "error" : "primary"}
                size="small"
                icon={user.is_admin ? <AdminPanelSettings /> : <Person />}
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="h6" gutterBottom>
            个人信息
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <Email />
              </ListItemIcon>
              <ListItemText
                primary="邮箱"
                secondary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span>{user.email}</span>
                    <Chip
                      label={user.is_email_verified ? "已验证" : "未验证"}
                      color={user.is_email_verified ? "success" : "warning"}
                      size="small"
                      icon={user.is_email_verified ? <Verified /> : <Warning />}
                    />
                  </Box>
                }
                slotProps={{
                  secondary: {
                    component: "div",
                  },
                }}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <CalendarToday />
              </ListItemIcon>
              <ListItemText
                primary="注册时间"
                secondary={
                  user.created_at
                    ? new Date(user.created_at).toLocaleDateString("zh-CN")
                    : "未知"
                }
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            账户状态
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            <Chip
              label={user.is_active ? "已激活" : "未激活"}
              color={user.is_active ? "success" : "default"}
              size="small"
            />
            <Chip
              label={user.is_email_verified ? "已验证" : "未验证"}
              color={user.is_email_verified ? "success" : "warning"}
              size="small"
            />
          </Box>

          {!user.is_email_verified && (
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() =>
                    router.push(
                      `/verify-email?email=${encodeURIComponent(user.email)}`
                    )
                  }
                >
                  立即验证
                </Button>
              }
            >
              您的邮箱尚未验证，请验证邮箱以确保账户安全
            </Alert>
          )}
        </Paper>
      </Container>
    </ProtectedRoute>
  );
}
