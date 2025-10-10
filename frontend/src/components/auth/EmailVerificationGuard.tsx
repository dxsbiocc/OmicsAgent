/**
 * 邮箱验证守卫组件
 * 用于保护需要验证邮箱的页面
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  Button,
} from "@mui/material";
import { Email, ArrowBack } from "@mui/icons-material";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEmailVerification } from "@/hooks/useEmailVerification";

interface EmailVerificationGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function EmailVerificationGuard({
  children,
  fallback,
  redirectTo = "/verify-email",
}: EmailVerificationGuardProps) {
  const { user, isAuthenticated } = useAuthContext();
  const { isVerified, isLoading, checkStatus } = useEmailVerification();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!isAuthenticated || !user) {
        setIsChecking(false);
        return;
      }

      try {
        await checkStatus();
      } catch (error) {
        console.error("检查邮箱验证状态失败:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkVerificationStatus();
  }, [isAuthenticated, user, checkStatus]);

  const handleGoToVerification = () => {
    router.push(`${redirectTo}?email=${encodeURIComponent(user?.email || "")}`);
  };

  const handleGoBack = () => {
    router.back();
  };

  // 如果未登录，显示登录提示
  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          gap: 2,
        }}
      >
        <Typography variant="h6">请先登录</Typography>
        <Button variant="contained" onClick={() => router.push("/auth/login")}>
          去登录
        </Button>
      </Box>
    );
  }

  // 如果正在检查状态，显示加载中
  if (isChecking || isLoading) {
    return (
      fallback || (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            gap: 2,
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            正在检查邮箱验证状态...
          </Typography>
        </Box>
      )
    );
  }

  // 如果邮箱已验证，显示子组件
  if (isVerified) {
    return <>{children}</>;
  }

  // 如果邮箱未验证，显示验证提示
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        gap: 3,
        p: 3,
      }}
    >
      <Email sx={{ fontSize: 64, color: "warning.main" }} />

      <Typography variant="h5" textAlign="center">
        邮箱验证 required
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        textAlign="center"
        maxWidth={400}
      >
        为了确保账户安全，您需要先验证邮箱地址才能访问此页面
      </Typography>

      <Alert severity="warning" sx={{ maxWidth: 500, width: "100%" }}>
        <Typography variant="body2">
          验证邮箱：<strong>{user?.email}</strong>
        </Typography>
      </Alert>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          onClick={handleGoToVerification}
          startIcon={<Email />}
        >
          验证邮箱
        </Button>
        <Button
          variant="outlined"
          onClick={handleGoBack}
          startIcon={<ArrowBack />}
        >
          返回上页
        </Button>
      </Box>
    </Box>
  );
}
