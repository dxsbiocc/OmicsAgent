/**
 * 500 服务器内部错误页面
 * 服务器遇到内部错误
 */

"use client";

import { Box, Container, Typography, Button, Stack } from "@mui/material";
import { Home, Refresh, ArrowBack, BugReport } from "@mui/icons-material";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ServerErrorPage() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleReportBug = () => {
    // 这里可以添加报告错误的功能
    console.log("报告错误");
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
            color: "error.main",
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            mb: 2,
          }}
        >
          500
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
            src="/images/plate/mushroom_8.svg"
            alt="500 服务器错误蘑菇插图"
            fill
            style={{ objectFit: "contain" }}
            priority
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
          服务器出错了！
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
          抱歉，服务器遇到了内部错误，小蘑菇正在紧急修复中。
          <br />
          请稍后再试，或者联系我们的技术支持团队。
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
            backgroundColor: "error.50",
            borderRadius: 2,
            p: 3,
            maxWidth: 600,
            border: "1px solid",
            borderColor: "error.200",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "error.dark",
              mb: 2,
              fontWeight: 600,
            }}
          >
            🚨 错误报告
          </Typography>
          <Stack spacing={1} alignItems="flex-start">
            <Typography variant="body2" color="text.secondary">
              • 服务器遇到了内部错误
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 我们的技术团队已收到通知
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 请稍后再试或联系技术支持
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 错误代码: 500 Internal Server Error
            </Typography>
          </Stack>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<BugReport />}
              onClick={handleReportBug}
              sx={{
                color: "error.main",
                borderColor: "error.main",
                "&:hover": {
                  backgroundColor: "error.50",
                  borderColor: "error.dark",
                },
              }}
            >
              报告此错误
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
