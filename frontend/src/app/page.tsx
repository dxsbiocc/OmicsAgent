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
      <Container sx={{ py: 8 }}>
        <Stack spacing={3}>
          <Typography variant="h3" fontWeight={700}>
            欢迎来到 OmicsAgent
          </Typography>
          <Typography variant="h6" color="text.secondary">
            一个面向组学分析和可视化的智能平台。
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              href="/visual"
            >
              进入可视化
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              component={Link}
              href="/blog"
            >
              浏览博客
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Features */}
      <Container sx={{ pb: 8 }}>
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
            <Grid
              sx={{ xs: 12, sm: 6, md: 3, display: "flex", width: "350px" }}
              key={f.title}
            >
              <Paper variant="outlined" sx={{ p: 3, flex: 1 }}>
                <Stack spacing={1}>
                  <Box
                    component="img"
                    src={f.icon}
                    alt="icon"
                    sx={{ width: 40, height: 40 }}
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

      {/* Integrations */}
      <Container sx={{ pb: 8 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          已整合的工具与数据源
        </Typography>
        <Grid container spacing={2}>
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
              <Paper sx={{ px: 2, py: 1 }} variant="outlined">
                <Typography variant="body2">{name}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Container sx={{ pb: 1 }}>
        <Footer />
      </Container>
    </>
  );
}
