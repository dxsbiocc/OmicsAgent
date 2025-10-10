/**
 * 注册表单组件
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
  LinearProgress,
  Chip,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  PersonAdd as RegisterIcon,
} from "@mui/icons-material";
import { useAuthContext } from "@/contexts/AuthContext";
import type { UserCreate } from "@/types";

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterForm({
  onSuccess,
  onSwitchToLogin,
}: RegisterFormProps) {
  const { register, isLoading, error, clearError } = useAuthContext();
  const [formData, setFormData] = useState<UserCreate>({
    username: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Partial<UserCreate & { confirmPassword: string }>
  >({});

  const handleInputChange =
    (field: keyof UserCreate) =>
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

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setConfirmPassword(value);

    // 清除确认密码的验证错误
    if (validationErrors.confirmPassword) {
      setValidationErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<UserCreate & { confirmPassword: string }> = {};

    // 用户名验证
    if (!formData.username.trim()) {
      errors.username = "请输入用户名";
    } else if (formData.username.length < 3) {
      errors.username = "用户名至少需要3位";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = "用户名只能包含字母、数字和下划线";
    }

    // 邮箱验证
    if (!formData.email.trim()) {
      errors.email = "请输入邮箱";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "请输入有效的邮箱地址";
    }

    // 密码验证
    if (!formData.password) {
      errors.password = "请输入密码";
    } else if (formData.password.length < 8) {
      errors.password = "密码至少需要8位";
    } else if (formData.password.length > 128) {
      errors.password = "密码不能超过128位";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])/.test(
        formData.password
      )
    ) {
      errors.password = "密码必须包含大小写字母、数字和特殊字符";
    }

    // 确认密码验证
    if (!confirmPassword) {
      errors.confirmPassword = "请确认密码";
    } else if (formData.password !== confirmPassword) {
      errors.confirmPassword = "两次输入的密码不一致";
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
      await register(formData);
      // 注册成功后跳转到邮箱验证页面
      window.location.href = `/verify-email?email=${encodeURIComponent(
        formData.email
      )}`;
    } catch (error) {
      // 错误已在 useAuth 中处理
      console.error("注册失败:", error);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  // 计算密码强度
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
    };

    Object.values(checks).forEach((check) => {
      if (check) score += 20;
    });

    return { score, checks };
  };

  const passwordStrength = calculatePasswordStrength(formData.password);
  const getStrengthColor = (score: number) => {
    if (score < 40) return "error";
    if (score < 80) return "warning";
    return "success";
  };

  const getStrengthText = (score: number) => {
    if (score < 40) return "弱";
    if (score < 80) return "中等";
    return "强";
  };

  return (
    <Card sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <RegisterIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            注册
          </Typography>
          <Typography variant="body2" color="text.secondary">
            创建新账户，开始您的旅程
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
            helperText={
              validationErrors.username || "3-20位，只能包含字母、数字和下划线"
            }
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
                "& input:-webkit-autofill:hover": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                  backgroundColor: "transparent !important",
                },
                "& input:-webkit-autofill:focus": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                  backgroundColor: "transparent !important",
                },
                "& input:-webkit-autofill:active": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                  backgroundColor: "transparent !important",
                },
              },
            }}
          />

          <TextField
            fullWidth
            label="邮箱"
            type="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            margin="normal"
            autoComplete="email"
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
                "& input:-webkit-autofill:hover": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                  backgroundColor: "transparent !important",
                },
                "& input:-webkit-autofill:focus": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                  backgroundColor: "transparent !important",
                },
                "& input:-webkit-autofill:active": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
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
            helperText={
              validationErrors.password ||
              "8-128位，必须包含大小写字母、数字和特殊字符"
            }
            margin="normal"
            autoComplete="new-password"
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
                "& input:-webkit-autofill:hover": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                  backgroundColor: "transparent !important",
                },
                "& input:-webkit-autofill:focus": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                  backgroundColor: "transparent !important",
                },
                "& input:-webkit-autofill:active": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                  backgroundColor: "transparent !important",
                },
              },
            }}
            InputProps={{
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
            }}
          />

          {/* 密码强度指示器 */}
          {formData.password && (
            <Box sx={{ mt: 1, mb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  密码强度
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    label={getStrengthText(passwordStrength.score)}
                    size="small"
                    color={getStrengthColor(passwordStrength.score) as any}
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {formData.password.length}/128
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={passwordStrength.score}
                color={getStrengthColor(passwordStrength.score) as any}
                sx={{ height: 6, borderRadius: 3 }}
              />
              <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {Object.entries(passwordStrength.checks).map(
                  ([key, passed]) => (
                    <Chip
                      key={key}
                      label={
                        key === "length"
                          ? "8位以上"
                          : key === "lowercase"
                          ? "小写字母"
                          : key === "uppercase"
                          ? "大写字母"
                          : key === "number"
                          ? "数字"
                          : key === "special"
                          ? "特殊字符"
                          : key
                      }
                      size="small"
                      color={passed ? "success" : "default"}
                      variant={passed ? "filled" : "outlined"}
                      sx={{ fontSize: "0.7rem", height: 20 }}
                    />
                  )
                )}
              </Box>
            </Box>
          )}

          <TextField
            fullWidth
            label="确认密码"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            error={!!validationErrors.confirmPassword}
            helperText={validationErrors.confirmPassword}
            margin="normal"
            autoComplete="new-password"
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
                "& input:-webkit-autofill:hover": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                  backgroundColor: "transparent !important",
                },
                "& input:-webkit-autofill:focus": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                  backgroundColor: "transparent !important",
                },
                "& input:-webkit-autofill:active": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                  backgroundColor: "transparent !important",
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleToggleConfirmPasswordVisibility}
                    edge="end"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
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
              "注册"
            )}
          </Button>

          {onSwitchToLogin && (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2">
                已有账户？{" "}
                <Link
                  component="button"
                  type="button"
                  onClick={onSwitchToLogin}
                  disabled={isLoading}
                  sx={{ textDecoration: "none" }}
                >
                  立即登录
                </Link>
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
