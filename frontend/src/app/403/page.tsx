/**
 * 403 禁止访问页面
 * 用户没有权限访问该资源
 */

"use client";

import { Box, Container, Typography, Button, Stack } from "@mui/material";
import { Home, ArrowBack, Security } from "@mui/icons-material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useThemeContext } from "@/contexts/ThemeContext";

export default function ForbiddenPage() {
  const router = useRouter();
  const { mode } = useThemeContext();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleContactSupport = () => {
    // 这里可以添加联系支持的功能
    console.log("联系技术支持");
  };

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
            color: "warning.main",
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            mb: 2,
          }}
        >
          403
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
            src="/icons/panda-oops.svg"
            alt="403 禁止访问熊猫插图"
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
          访问被拒绝！
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
          抱歉，您没有权限访问这个页面。
          <br />
          小熊猫正在守护着这个区域，只有获得许可的用户才能进入。
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
            startIcon={<Security />}
            onClick={handleContactSupport}
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
            联系支持
          </Button>
        </Stack>

        <Box
          sx={{
            backgroundColor:
              mode === "dark"
                ? "rgba(237, 108, 2, 0.1)"
                : "warning.50",
            borderRadius: 2,
            p: 3,
            maxWidth: 600,
            border: "1px solid",
            borderColor:
              mode === "dark"
                ? "rgba(237, 108, 2, 0.3)"
                : "warning.200",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "warning.dark",
              mb: 2,
              fontWeight: 600,
            }}
          >
            🔒 权限说明
          </Typography>
          <Stack spacing={1} alignItems="flex-start">
            <Typography variant="body2" color="text.secondary">
              • 此页面需要特定的访问权限
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 请确认您已登录并具有相应权限
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 如需访问权限，请联系管理员
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 错误代码: 403 Forbidden
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
