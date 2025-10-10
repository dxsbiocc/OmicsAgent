/**
 * 用户设置页面
 * 需要认证才能访问
 */

"use client";

import { ProtectedRoute } from "@/components/auth";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Notifications,
  Security,
  Palette,
  Language,
  Storage,
} from "@mui/icons-material";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            设置
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            管理您的账户设置和偏好
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* 通知设置 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              <Notifications sx={{ mr: 1, verticalAlign: "middle" }} />
              通知设置
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  <Notifications />
                </ListItemIcon>
                <ListItemText
                  primary="邮件通知"
                  secondary="接收重要更新和消息的邮件通知"
                />
                <Switch defaultChecked />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Notifications />
                </ListItemIcon>
                <ListItemText
                  primary="推送通知"
                  secondary="在浏览器中显示推送通知"
                />
                <Switch />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* 隐私设置 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              <Security sx={{ mr: 1, verticalAlign: "middle" }} />
              隐私设置
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  <Security />
                </ListItemIcon>
                <ListItemText
                  primary="公开个人资料"
                  secondary="允许其他用户查看您的基本信息"
                />
                <Switch defaultChecked />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* 外观设置 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              <Palette sx={{ mr: 1, verticalAlign: "middle" }} />
              外观设置
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  <Palette />
                </ListItemIcon>
                <ListItemText primary="深色模式" secondary="使用深色主题" />
                <Switch />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* 其他设置 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              <Storage sx={{ mr: 1, verticalAlign: "middle" }} />
              其他设置
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  <Language />
                </ListItemIcon>
                <ListItemText primary="语言" secondary="简体中文" />
                <Button variant="outlined" size="small">
                  更改
                </Button>
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* 危险操作 */}
          <Box>
            <Typography variant="h6" gutterBottom color="error">
              危险操作
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button variant="outlined" color="error">
                修改密码
              </Button>
              <Button variant="outlined" color="error">
                删除账户
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </ProtectedRoute>
  );
}
