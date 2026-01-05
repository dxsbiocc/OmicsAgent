"use client";

import React from "react";
import Link from "next/link";
import {
  Box,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";
import LanguageIcon from "@mui/icons-material/Language";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        mt: 8,
        bgcolor: "background.paper",
      }}
    >
      <Container sx={{ py: 6 }}>
        {/* 主要内容区域 */}
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={4}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", lg: "flex-start" }}
        >
          {/* 品牌信息 */}
          <Stack spacing={2} sx={{ minWidth: { xs: "100%", lg: "300px" } }}>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              OmicsAgent
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.6 }}
            >
              智能组学分析与可视化平台，为科研工作者提供强大的生物信息学分析工具
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <IconButton
                color="primary"
                component={Link}
                href="https://github.com"
                target="_blank"
                aria-label="GitHub"
                sx={{
                  bgcolor: "action.hover",
                  "&:hover": { bgcolor: "primary.main", color: "white" },
                }}
              >
                <GitHubIcon />
              </IconButton>
              <IconButton
                color="primary"
                component={Link}
                href="https://twitter.com"
                target="_blank"
                aria-label="Twitter"
                sx={{
                  bgcolor: "action.hover",
                  "&:hover": { bgcolor: "primary.main", color: "white" },
                }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                color="primary"
                component={Link}
                href="#wechat"
                aria-label="WeChat"
                sx={{
                  bgcolor: "action.hover",
                  "&:hover": { bgcolor: "primary.main", color: "white" },
                }}
              >
                <LanguageIcon />
              </IconButton>
            </Stack>
          </Stack>

          {/* 导航链接 */}
          <Stack spacing={2} sx={{ minWidth: { xs: "100%", lg: "200px" } }}>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              快速导航
            </Typography>
            <Stack spacing={1}>
              <Typography
                variant="body2"
                component={Link}
                href="/"
                color="text.secondary"
                sx={{
                  textDecoration: "none",
                  "&:hover": {
                    color: "primary.main",
                    textDecoration: "underline",
                  },
                }}
              >
                首页
              </Typography>
              <Typography
                variant="body2"
                component={Link}
                href="/visual"
                color="text.secondary"
                sx={{
                  textDecoration: "none",
                  "&:hover": {
                    color: "primary.main",
                    textDecoration: "underline",
                  },
                }}
              >
                可视化分析
              </Typography>
              <Typography
                variant="body2"
                component={Link}
                href="/blog"
                color="text.secondary"
                sx={{
                  textDecoration: "none",
                  "&:hover": {
                    color: "primary.main",
                    textDecoration: "underline",
                  },
                }}
              >
                技术博客
              </Typography>
              <Typography
                variant="body2"
                component={Link}
                href="/chat"
                color="text.secondary"
                sx={{
                  textDecoration: "none",
                  "&:hover": {
                    color: "primary.main",
                    textDecoration: "underline",
                  },
                }}
              >
                智能问答
              </Typography>
            </Stack>
          </Stack>

          {/* 联系信息 */}
          <Stack spacing={2} sx={{ minWidth: { xs: "100%", lg: "250px" } }}>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              联系我们
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                📧 contact@omicsagent.com
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📱 +86 400-123-4567
              </Typography>
              <Typography variant="body2" color="text.secondary">
                🏢 福建省厦门市翔安区
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ my: 4 }} />

        {/* 版权信息 */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1, sm: 2 }}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} OmicsAgent. 保留所有权利.
            </Typography>

            <Typography variant="body2" color="text.secondary">
              部分图片来自{" "}
              <Typography
                component={Link}
                href="https://www.freepik.com"
                target="_blank"
                rel="noopener noreferrer"
                color="primary.main"
                sx={{
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Freepik
              </Typography>
              ，版权归原作者所有
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            备案号：粤ICP备00000000号-1
          </Typography>
        </Stack>
        <Divider sx={{ mt: 4 }} />
      </Container>
    </Box>
  );
}
