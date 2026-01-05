"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Home, ArrowBack, Search } from "@mui/icons-material";
import { useThemeContext } from "@/contexts/ThemeContext";

export default function NotFound() {
  const router = useRouter();
  const theme = useTheme();
  const { mode } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleSearch = () => {
    router.push("/blog");
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          py: 4,
        }}
      >
        {/* 404 标题 */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "4rem", md: "6rem" },
            fontWeight: "bold",
            color: "primary.main",
            mb: 2,
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          404
        </Typography>

        {/* 蘑菇插图 */}
        <Box
          sx={{
            position: "relative",
            width: { xs: 200, md: 300 },
            height: { xs: 200, md: 300 },
            mb: 4,
            animation: "float 3s ease-in-out infinite",
            "@keyframes float": {
              "0%, 100%": {
                transform: "translateY(0px)",
              },
              "50%": {
                transform: "translateY(-10px)",
              },
            },
          }}
        >
          <Image
            src="/icons/panda-oops.svg"
            alt="404 熊猫插图"
            fill
            style={{
              objectFit: "contain",
            }}
          />
        </Box>

        {/* 错误信息 */}
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: "1.5rem", md: "2rem" },
            fontWeight: 600,
            color: "text.primary",
            mb: 2,
          }}
        >
          页面走丢了！
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: "1rem", md: "1.1rem" },
            color: "text.secondary",
            mb: 4,
            maxWidth: 500,
            lineHeight: 1.6,
          }}
        >
          看起来这个页面可能被小熊猫吃掉了，或者它正在森林里迷路。
          <br />
          别担心，让我们帮你找到正确的方向！
        </Typography>

        {/* 操作按钮 */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<Home />}
            onClick={handleGoHome}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            回到首页
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            返回上页
          </Button>

          <Button
            variant="text"
            size="large"
            startIcon={<Search />}
            onClick={handleSearch}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "action.hover",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            浏览博客
          </Button>
        </Stack>

        {/* 帮助提示 */}
        <Box
          sx={{
            backgroundColor:
              mode === "dark"
                ? "rgba(255,255,255,0.05)"
                : "background.paper",
            borderRadius: 2,
            p: 3,
            maxWidth: 600,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "text.primary",
              mb: 2,
              fontWeight: 600,
            }}
          >
            💡 需要帮助？
          </Typography>
          <Stack spacing={1} alignItems="flex-start">
            <Typography variant="body2" color="text.secondary">
              • 检查网址是否正确拼写
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 尝试使用搜索功能查找内容
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 返回首页重新导航
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • 如果问题持续存在，请联系我们
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
