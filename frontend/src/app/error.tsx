/**
 * 全局错误页面
 * 处理应用中的未捕获错误
 */

"use client";

import { useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
} from "@mui/material";
import { Home, Refresh, ArrowBack } from "@mui/icons-material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useThemeContext } from "@/contexts/ThemeContext";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();
  const { mode } = useThemeContext();
  const theme = useTheme();

  useEffect(() => {
    // 记录错误到控制台
    console.error("应用错误:", error);
  }, [error]);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    reset();
  };

  // 根据错误类型确定显示内容
  const getErrorInfo = () => {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes("403") || errorMessage.includes("forbidden")) {
      return {
        code: "403",
        title: "访问被拒绝！",
        description:
          "抱歉，您没有权限访问这个页面。小熊猫正在守护着这个区域，只有获得许可的用户才能进入。",
        image: "/icons/panda-oops.svg",
        color: "warning.main",
        bgColor: "warning.50",
        borderColor: "warning.200",
        helpTitle: "🔒 权限说明",
        helpItems: [
          "• 此页面需要特定的访问权限",
          "• 请确认您已登录并具有相应权限",
          "• 如需访问权限，请联系管理员",
          "• 错误代码: 403 Forbidden",
        ],
      };
    } else if (
      errorMessage.includes("500") ||
      errorMessage.includes("server error")
    ) {
      return {
        code: "500",
        title: "服务器出错了！",
        description:
          "抱歉，服务器遇到了内部错误，小熊猫正在紧急修复中。请稍后再试，或者联系我们的技术支持团队。",
        image: "/icons/panda-crash.svg",
        color: "error.main",
        bgColor: "error.50",
        borderColor: "error.200",
        helpTitle: "🚨 错误报告",
        helpItems: [
          "• 服务器遇到了内部错误",
          "• 我们的技术团队已收到通知",
          "• 请稍后再试或联系技术支持",
          "• 错误代码: 500 Internal Server Error",
        ],
      };
    } else {
      // 默认错误页面
      return {
        code: "错误",
        title: "出现了一些问题！",
        description:
          "抱歉，应用遇到了意外错误。小熊猫正在努力修复中，请稍后再试。",
        image: "/icons/panda-crash.svg",
        color: "error.main",
        bgColor: mode === "dark" ? "rgba(255,255,255,0.05)" : "grey.50",
        borderColor: mode === "dark" ? "rgba(255,255,255,0.1)" : "grey.200",
        helpTitle: "💡 需要帮助？",
        helpItems: [
          "• 尝试刷新页面或重新加载",
          "• 检查网络连接是否正常",
          "• 如果问题持续存在，请联系技术支持",
          `• 错误代码: ${error.digest || "未知"}`,
        ],
      };
    }
  };

  const errorInfo = getErrorInfo();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 2,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "4rem", md: "6rem" },
            fontWeight: "bold",
            color: errorInfo.color,
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            mb: 2,
          }}
        >
          {errorInfo.code}
        </Typography>

        <Box
          sx={{
            position: "relative",
            width: { xs: 150, md: 200 },
            height: { xs: 150, md: 200 },
            mb: 2,
            animation: "float 3s ease-in-out infinite",
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0px)" },
              "50%": { transform: "translateY(-10px)" },
            },
          }}
        >
          <Image
            src={errorInfo.image}
            alt={`${errorInfo.code} 错误熊猫插图`}
            fill
            style={{ objectFit: "contain" }}
          />
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: "1.2rem", md: "1.5rem" },
            fontWeight: 600,
            color: "text.primary",
            mb: 2,
          }}
        >
          {errorInfo.title}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: "0.9rem", md: "1rem" },
            color: "text.secondary",
            maxWidth: 600,
            lineHeight: 1.6,
            mb: 4,
          }}
        >
          {errorInfo.description}
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Button
            variant="contained"
            size="medium"
            startIcon={<Home />}
            onClick={handleGoHome}
            sx={{
              px: 3,
              py: 1,
              fontSize: "0.9rem",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            回到首页
          </Button>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            sx={{
              px: 3,
              py: 1,
              fontSize: "0.9rem",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            返回上页
          </Button>
          <Button
            variant="text"
            size="medium"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{
              px: 3,
              py: 1,
              fontSize: "0.9rem",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            重试
          </Button>
        </Stack>

        <Box
          sx={{
            backgroundColor:
              typeof errorInfo.bgColor === "string" &&
              errorInfo.bgColor.startsWith("rgba")
                ? errorInfo.bgColor
                : mode === "dark"
                ? "rgba(255,255,255,0.05)"
                : errorInfo.bgColor,
            borderRadius: 2,
            p: 3,
            maxWidth: 600,
            border: "1px solid",
            borderColor:
              typeof errorInfo.borderColor === "string" &&
              errorInfo.borderColor.startsWith("rgba")
                ? errorInfo.borderColor
                : mode === "dark"
                ? "rgba(255,255,255,0.1)"
                : errorInfo.borderColor,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: errorInfo.color,
              mb: 2,
              fontWeight: 600,
            }}
          >
            {errorInfo.helpTitle}
          </Typography>
          <Stack spacing={1} alignItems="flex-start">
            {errorInfo.helpItems.map((item, index) => (
              <Typography key={index} variant="body2" color="text.secondary">
                {item}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
