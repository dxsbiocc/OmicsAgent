/**
 * 邮箱验证组件
 * 用于验证用户邮箱地址
 */

"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import {
  Email,
  CheckCircle,
  Error as ErrorIcon,
  Refresh,
  ArrowBack,
} from "@mui/icons-material";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface EmailVerificationProps {
  email?: string;
  onVerified?: () => void;
  onBack?: () => void;
}

export default function EmailVerification({
  email,
  onVerified,
  onBack,
}: EmailVerificationProps) {
  const { user, verifyEmail, resendVerificationEmail } = useAuthContext();
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  const userEmail = email || user?.email || "";

  // 倒计时效果
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // 检查用户是否已验证
  useEffect(() => {
    if (user?.is_email_verified) {
      setIsVerified(true);
    }
  }, [user]);

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6); // 只允许6位数字
    setVerificationCode(value);
    setError(null);
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("请输入6位验证码");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await verifyEmail(verificationCode);
      setSuccess("邮箱验证成功！");
      setIsVerified(true);
      onVerified?.();
    } catch (error: any) {
      setError(error instanceof Error ? error.message : "验证失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError(null);

    try {
      await resendVerificationEmail();
      setSuccess("验证码已重新发送到您的邮箱");
      setTimeLeft(60); // 60秒倒计时
    } catch (error: any) {
      setError(error instanceof Error ? error.message : "发送失败，请重试");
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    onBack?.();
  };

  if (isVerified) {
    return (
      <Card sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <CheckCircle
            sx={{
              fontSize: 64,
              color: "success.main",
              mb: 2,
            }}
          />
          <Typography variant="h5" gutterBottom>
            邮箱验证成功！
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            您的邮箱 {userEmail} 已成功验证
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => router.push("/")}
            sx={{ py: 1.5 }}
          >
            继续使用
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Email sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            邮箱验证
          </Typography>
          <Typography variant="body2" color="text.secondary">
            我们已向您的邮箱发送了验证码
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            验证邮箱：
          </Typography>
          <Chip
            label={userEmail}
            icon={<Email />}
            color="primary"
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="验证码"
            value={verificationCode}
            onChange={handleCodeChange}
            placeholder="请输入6位验证码"
            inputProps={{
              maxLength: 6,
              style: {
                textAlign: "center",
                fontSize: "1.2rem",
                letterSpacing: "0.5em",
              },
            }}
            disabled={isLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderWidth: 2,
                },
                "&:hover fieldset": {
                  borderWidth: 2,
                },
                "&.Mui-focused fieldset": {
                  borderWidth: 2,
                },
              },
            }}
          />
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleVerify}
          disabled={isLoading || verificationCode.length !== 6}
          sx={{ mb: 2, py: 1.5 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "验证邮箱"
          )}
        </Button>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            没有收到验证码？
          </Typography>
        </Divider>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={handleResendCode}
            disabled={isResending || timeLeft > 0}
            startIcon={
              isResending ? <CircularProgress size={16} /> : <Refresh />
            }
            sx={{ flex: 1 }}
          >
            {isResending
              ? "发送中..."
              : timeLeft > 0
              ? `重新发送 (${timeLeft}s)`
              : "重新发送"}
          </Button>

          {onBack && (
            <Button
              variant="text"
              onClick={handleBack}
              startIcon={<ArrowBack />}
              sx={{ flex: 1 }}
            >
              返回
            </Button>
          )}
        </Stack>

        <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>提示：</strong>
            <br />
            • 验证码有效期为10分钟
            <br />
            • 请检查垃圾邮件文件夹
            <br />• 如果仍未收到，请稍后重试
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
