/**
 * 登录表单组件
 */

"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";
import { useAuthContext } from "@/contexts/AuthContext";
import type { UserLogin } from "@/types";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginForm({
  onSuccess,
  onSwitchToRegister,
}: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuthContext();
  const [formData, setFormData] = useState<UserLogin>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<UserLogin>>(
    {}
  );

  const handleInputChange =
    (field: keyof UserLogin) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // 清除该字段的验证错误
      if (validationErrors[field]) {
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
      }

      // 清除全局错误
      if (error) {
        clearError();
      }
    };

  const validateForm = (): boolean => {
    const errors: Partial<UserLogin> = {};

    if (!formData.username.trim()) {
      errors.username = "请输入用户名";
    }

    if (!formData.password) {
      errors.password = "请输入密码";
    } else if (formData.password.length < 6) {
      errors.password = "密码至少需要6位";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      onSuccess?.();
    } catch (error) {
      // 错误已在 useAuth 中处理
      console.error("登录失败:", error);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Card sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <LoginIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            登录
          </Typography>
          <Typography variant="body2" color="text.secondary">
            欢迎回来，请登录您的账户
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="用户名"
            value={formData.username}
            onChange={handleInputChange("username")}
            error={!!validationErrors.username}
            helperText={validationErrors.username}
            margin="normal"
            autoComplete="username"
            autoFocus
            disabled={isLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "transparent",
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
                // 覆盖自动填充的样式
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                  WebkitTextFillColor: "inherit !important",
                  backgroundColor: "transparent !important",
                },
              },
            }}
          />

          <TextField
            fullWidth
            label="密码"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange("password")}
            error={!!validationErrors.password}
            helperText={validationErrors.password}
            margin="normal"
            autoComplete="current-password"
            disabled={isLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "transparent",
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
                // 覆盖自动填充的样式
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                  WebkitTextFillColor: "inherit !important",
                  backgroundColor: "transparent !important",
                },
              },
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      disabled={isLoading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "登录"
            )}
          </Button>

          {onSwitchToRegister && (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2">
                还没有账户？{" "}
                <Link
                  component="button"
                  type="button"
                  onClick={onSwitchToRegister}
                  disabled={isLoading}
                  sx={{ textDecoration: "none" }}
                >
                  立即注册
                </Link>
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
