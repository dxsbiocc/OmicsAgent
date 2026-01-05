"use client";

import { Footer } from "@/components";
import {
  Container,
  Typography,
  Stack,
  Button,
  Grid,
  Paper,
  Box,
} from "@mui/material";
import Link from "next/link";

export default function Page() {
  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        {/* Hero Content */}
        <Container
          sx={{
            position: "relative",
            py: 8,
          }}
        >
          <Stack
            spacing={4}
            sx={{
              textAlign: "center",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h2"
              fontWeight={700}
              sx={{
                background: "linear-gradient(90deg, #2DD4BF, #8B5CF6)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              欢迎来到 OmicsAgent
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: "auto", mb: 4, lineHeight: 1.6 }}
            >
              连接{" "}
              <span style={{ color: "#2DD4BF", fontWeight: 600 }}>
                生命数据
              </span>{" "}
              与{" "}
              <span style={{ color: "#8B5CF6", fontWeight: 600 }}>AI 智慧</span>
              。 自动化绘图、数据分析与报告解读。
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                href="/visual"
                sx={{
                  minWidth: "200px",
                  py: 1.5,
                  fontSize: "1.1rem",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                进入可视化
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                component={Link}
                href="/analysis"
                sx={{
                  minWidth: "200px",
                  py: 1.5,
                  fontSize: "1.1rem",
                }}
              >
                开始分析
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        sx={{
          bgcolor: "background.default",
          py: 8,
        }}
      >
        <Container>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ mb: 4, textAlign: "center" }}
          >
            核心功能
          </Typography>
          <Grid container spacing={3} alignItems="stretch">
            {[
              {
                title: "多源数据整合",
                desc: "整合 TCGA、GTEx、GEO 等公开数据，与本地分析结果无缝融合。",
                icon: "/window.svg",
              },
              {
                title: "可交互可视化",
                desc: "提供基因表达、通路富集、网络关系等多种交互式图表。",
                icon: "/globe.svg",
              },
              {
                title: "工作流自动化",
                desc: "封装 BWA、samtools 等工具，支持一键式流程式分析。",
                icon: "/next.svg",
              },
              {
                title: "智能助手",
                desc: "内置 AI 助理，支持检索、总结、报告生成与可视化建议。",
                icon: "/vercel.svg",
              },
            ].map((f) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={f.title}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: 6,
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <Stack spacing={2}>
                    <Box
                      component="img"
                      src={f.icon}
                      alt={f.title}
                      sx={{
                        width: 48,
                        height: 48,
                        alignSelf: "flex-start",
                      }}
                    />
                    <Typography variant="h6" fontWeight={700}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {f.desc}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Integrations Section */}
      <Box
        sx={{
          bgcolor: "background.default", // 使用统一的背景色
          py: 8,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "1px",
            background:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
          },
        }}
      >
        <Container>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ mb: 4, textAlign: "center" }}
          >
            已整合的工具与数据源
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {[
              "BWA",
              "samtools",
              "Nextflow",
              "Plotly",
              "MUI X",
              "Mapbox",
              "TCGA",
              "GTEx",
              "GEO",
            ].map((name) => (
              <Grid key={name}>
                <Paper
                  sx={{
                    px: 3,
                    py: 1.5,
                  }}
                  variant="outlined"
                >
                  <Typography variant="body1" fontWeight={500}>
                    {name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ pb: 1 }}>
        <Footer />
      </Box>
    </>
  );
}
