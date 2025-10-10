/**
 * 认证页面组件
 * 包含登录和注册功能的切换
 */

"use client";

import { useState } from "react";
import { Box, Container, Paper, Tabs, Tab } from "@mui/material";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSwitchToRegister = () => {
    setActiveTab(1);
  };

  const handleSwitchToLogin = () => {
    setActiveTab(0);
  };

  const handleAuthSuccess = () => {
    // 认证成功后的处理，比如跳转到首页
    // 这个逻辑已经在 useAuth hook 中处理了
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ width: "100%", maxWidth: 500 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="认证选项"
              variant="fullWidth"
            >
              <Tab
                label="登录"
                id="auth-tab-0"
                aria-controls="auth-tabpanel-0"
              />
              <Tab
                label="注册"
                id="auth-tab-1"
                aria-controls="auth-tabpanel-1"
              />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={handleSwitchToRegister}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
}
