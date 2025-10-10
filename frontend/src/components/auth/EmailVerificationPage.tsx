/**
 * 邮箱验证页面组件
 * 完整的邮箱验证流程页面
 */

"use client";

import { useState, useEffect } from "react";
import { Container, Box, Typography, Button, Stack } from "@mui/material";
import { ArrowBack, Home } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import EmailVerification from "./EmailVerification";

export default function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthContext();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    // 从 URL 参数或用户信息中获取邮箱
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [searchParams, user]);

  const handleVerified = () => {
    // 邮箱验证成功后的处理
    router.push("/profile?verified=true");
  };

  const handleBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            py: 4,
          }}
        >
          <Typography variant="h4" gutterBottom>
            请先登录
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            您需要先登录才能验证邮箱
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/auth/login")}
            size="large"
          >
            去登录
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        {/* 页面头部 */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h3" component="h1" gutterBottom>
            邮箱验证
          </Typography>
          <Typography variant="body1" color="text.secondary">
            为了确保账户安全，请验证您的邮箱地址
          </Typography>
        </Box>

        {/* 邮箱验证组件 */}
        <EmailVerification
          email={email}
          onVerified={handleVerified}
          onBack={handleBack}
        />

        {/* 页面底部操作 */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleBack}
            >
              返回上页
            </Button>
            <Button variant="text" startIcon={<Home />} onClick={handleGoHome}>
              回到首页
            </Button>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
