"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import animStyles from "../../../styles/visual/visual-animations.module.css";
import {
  TrendingUp,
  BarChart,
  PieChart,
  ScatterPlot,
  Radar,
  GridOn as HeatMap,
  AccountTree,
  Favorite,
  ThumbUp,
  Visibility,
  BookmarkBorder,
  PlayArrow,
  Create,
} from "@mui/icons-material";

// 图表类型定义
const chartTypes = [
  { id: "line", name: "折线图", icon: TrendingUp, color: "#ed6ca4" },
  { id: "bar", name: "柱状图", icon: BarChart, color: "#fbb05b" },
  { id: "pie", name: "饼图", icon: PieChart, color: "#acd372" },
  { id: "scatter", name: "散点图", icon: ScatterPlot, color: "#7bc4e2" },
  { id: "radar", name: "雷达图", icon: Radar, color: "#9c27b0" },
  { id: "heatmap", name: "热图", icon: HeatMap, color: "#ff5722" },
  { id: "tree", name: "树状图", icon: AccountTree, color: "#795548" },
];

// 工具数据
const toolsData = [
  {
    id: "plotly-line",
    name: "Plotly 折线图",
    description: "交互式折线图，支持多系列数据和动态缩放",
    image: "/images/background/others/13568626.jpg",
    category: "line",
    favorites: 1234,
    likes: 856,
    usage: 2341,
    tags: ["交互式", "多系列", "动态缩放"],
  },
  {
    id: "d3-line",
    name: "D3.js 折线图",
    description: "高度自定义的折线图，支持复杂的数据可视化需求",
    image: "/images/background/others/6056984.jpg",
    category: "line",
    favorites: 987,
    likes: 654,
    usage: 1876,
    tags: ["自定义", "复杂数据", "D3.js"],
  },
  {
    id: "ggplot2-line",
    name: "ggplot2 折线图",
    description: "高度自定义的折线图，支持复杂的数据可视化需求",
    image: "/images/background/others/15151415.jpg",
    category: "line",
    favorites: 987,
    likes: 654,
    usage: 1876,
    tags: ["自定义", "复杂数据", "ggplot2"],
  },
  {
    id: "seaborn-line",
    name: "seaborn 折线图",
    description: "高度自定义的折线图，支持复杂的数据可视化需求",
    image: "/images/background/others/15441888.jpg",
    category: "line",
    favorites: 987,
    likes: 654,
    usage: 1876,
    tags: ["自定义", "复杂数据", "ggplot2"],
  },
  {
    id: "chartjs-bar",
    name: "Chart.js 柱状图",
    description: "轻量级柱状图库，易于集成和使用",
    image: "/images/background/others/15441927.jpg",
    category: "bar",
    favorites: 1456,
    likes: 923,
    usage: 3124,
    tags: ["轻量级", "易集成", "响应式"],
  },
  {
    id: "echarts-bar",
    name: "ECharts 柱状图",
    description: "功能强大的柱状图，支持3D效果和动画",
    image: "/images/background/others/15628839.jpg",
    category: "bar",
    favorites: 2134,
    likes: 1456,
    usage: 4567,
    tags: ["3D效果", "动画", "功能强大"],
  },
  {
    id: "recharts-pie",
    name: "Recharts 饼图",
    description: "React生态的饼图组件，支持多种样式",
    image: "/images/background/others/15634907.jpg",
    category: "pie",
    favorites: 876,
    likes: 543,
    usage: 1234,
    tags: ["React", "组件化", "多样式"],
  },
  {
    id: "d3-pie",
    name: "D3.js 饼图",
    description: "高度自定义的饼图，支持复杂的交互效果",
    image: "/images/background/others/6056984.jpg",
    category: "pie",
    favorites: 654,
    likes: 432,
    usage: 987,
    tags: ["自定义", "交互效果", "D3.js"],
  },
  {
    id: "plotly-scatter",
    name: "Plotly 散点图",
    description: "交互式散点图，支持3D和动画效果",
    image: "/images/background/others/6056984.jpg",
    category: "scatter",
    favorites: 1123,
    likes: 789,
    usage: 2134,
    tags: ["3D", "动画", "交互式"],
  },
  {
    id: "observable-scatter",
    name: "Observable 散点图",
    description: "基于Observable平台的散点图，支持实时数据更新",
    image: "/images/background/others/6056984.jpg",
    category: "scatter",
    favorites: 543,
    likes: 321,
    usage: 876,
    tags: ["实时更新", "Observable", "数据驱动"],
  },
  {
    id: "chartjs-radar",
    name: "Chart.js 雷达图",
    description: "多维度数据展示的雷达图，支持多系列对比",
    image: "/images/background/others/6056984.jpg",
    category: "radar",
    favorites: 432,
    likes: 287,
    usage: 654,
    tags: ["多维度", "对比", "Chart.js"],
  },
  {
    id: "d3-radar",
    name: "D3.js 雷达图",
    description: "高度自定义的雷达图，支持复杂的样式和交互",
    image: "/images/background/others/6056984.jpg",
    category: "radar",
    favorites: 321,
    likes: 198,
    usage: 543,
    tags: ["自定义", "复杂样式", "D3.js"],
  },
  {
    id: "plotly-heatmap",
    name: "Plotly 热图",
    description: "交互式热图，支持大数据集和颜色映射",
    image: "/images/background/others/6056984.jpg",
    category: "heatmap",
    favorites: 1876,
    likes: 1234,
    usage: 3456,
    tags: ["大数据", "颜色映射", "交互式"],
  },
  {
    id: "d3-heatmap",
    name: "D3.js 热图",
    description: "高度自定义的热图，支持复杂的布局和动画",
    image: "/images/background/others/6056984.jpg",
    category: "heatmap",
    favorites: 765,
    likes: 543,
    usage: 1234,
    tags: ["自定义", "复杂布局", "动画"],
  },
  {
    id: "d3-tree",
    name: "D3.js 树状图",
    description: "层次化数据展示的树状图，支持多种布局算法",
    image: "/images/background/others/6056984.jpg",
    category: "tree",
    favorites: 654,
    likes: 432,
    usage: 987,
    tags: ["层次化", "布局算法", "D3.js"],
  },
  {
    id: "vis-tree",
    name: "vis.js 树状图",
    description: "网络图库的树状图组件，支持动态布局和交互",
    image: "/images/background/others/6056984.jpg",
    category: "tree",
    favorites: 432,
    likes: 287,
    usage: 654,
    tags: ["动态布局", "交互", "vis.js"],
  },
];

export default function VisualPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("line");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const contentScrollRef = useRef<HTMLDivElement>(null);
  // 避免滚动过程中 ScrollSpy 抢占激活态
  const isProgrammaticScrollRef = useRef(false);
  const activeCategoryRef = useRef(activeCategory);

  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  // 滚动到指定分类（将分组组件放置在顶部，确保分组标签可见）
  const scrollToCategory = (categoryId: string) => {
    const element = sectionRefs.current[categoryId];
    const scrollContainer = contentScrollRef.current;
    if (!element || !scrollContainer) return;

    const elementTop = element.offsetTop;
    const containerHeight = scrollContainer.clientHeight;
    const maxScrollTop = scrollContainer.scrollHeight - containerHeight;
    const titleOffset = 72; // 分组标签的偏移量，确保标签完全可见 (Paper padding + icon + margin)

    // 目标位置：分组顶部对齐到视口顶部，并留出标签空间
    let targetScrollTop = elementTop - titleOffset;

    // 边界保护：确保不超出滚动范围
    targetScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));

    // 锁定 ScrollSpy，防止覆盖手动激活态
    isProgrammaticScrollRef.current = true;
    scrollContainer.scrollTo({ top: targetScrollTop, behavior: "smooth" });
    // 估算平滑滚动结束时间，解锁 ScrollSpy
    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 500);
  };

  //   Scroll Spy：内容区滚动时，高亮左侧对应分组（分组顶部接近视口顶部时激活）
  useEffect(() => {
    const sc = contentScrollRef.current;
    if (!sc) return;

    let rafId = 0;
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (isProgrammaticScrollRef.current) return;
        const threshold = 100; // 激活阈值（分组顶部距离视口顶部的距离）
        const viewportTop = sc.scrollTop;

        // 找到当前视口顶部附近的分组
        let activeId = activeCategoryRef.current;

        // 检查是否滚动到最底部
        const isAtBottom =
          sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 10; // 10px 容差

        if (isAtBottom) {
          // 如果滚动到底部，激活最后一个分组
          const lastChartType = chartTypes[chartTypes.length - 1];
          const lastElement = sectionRefs.current[lastChartType.id];
          if (lastElement) {
            activeId = lastChartType.id;
          }
        } else {
          // 正常的分组检测逻辑
          for (let i = chartTypes.length - 1; i >= 0; i--) {
            const ct = chartTypes[i];
            const el = sectionRefs.current[ct.id];
            if (!el) continue;

            const sectionTop = el.offsetTop;
            const sectionBottom = sectionTop + el.offsetHeight;

            // 如果分组顶部在视口顶部附近
            if (sectionTop <= viewportTop + threshold) {
              // 如果分组底部还在视口内
              if (sectionBottom > viewportTop) {
                activeId = ct.id;
                break;
              }
            }
          }
        }

        if (activeId !== activeCategoryRef.current) {
          setActiveCategory(activeId);
        }
      });
    };

    sc.addEventListener("scroll", onScroll, { passive: true });
    // 初始化计算一次
    onScroll();
    return () => {
      sc.removeEventListener("scroll", onScroll as EventListener);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // 按分类分组工具
  const groupedTools = chartTypes.reduce((acc, chartType) => {
    acc[chartType.id] = toolsData.filter(
      (tool) => tool.category === chartType.id
    );
    return acc;
  }, {} as { [key: string]: typeof toolsData });

  // 卡片跳动处理函数
  const handleBounce = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.classList.remove(animStyles.cardBounceOnce);
    // 强制重排以重启动画
    void el.offsetWidth;
    el.classList.add(animStyles.cardBounceOnce);
  };

  // 处理工具卡片点击跳转
  const handleToolClick = (toolId: string) => {
    console.log("Card clicked:", toolId);
    router.push(`/visual/${toolId}`);
  };

  // 处理开始绘制按钮点击
  const handleDrawClick = (toolId: string, e: React.MouseEvent) => {
    console.log("Draw button clicked:", toolId);
    e.stopPropagation();
    router.push(`/visual/${toolId}`);
  };

  return (
    <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* 左侧工具栏 */}
      <Paper
        className={animStyles.sidebarSlideIn}
        sx={{
          width: 250,
          height: "100%",
          p: 3,
          borderRadius: 0,
          borderRight: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          overflow: "auto",
        }}
      >
        <Stack spacing={1}>
          {chartTypes.map((chartType, index) => (
            <Chip
              key={chartType.id}
              className={`${animStyles.sidebarContentStagger} ${animStyles.sidebarButtonHover}`}
              icon={
                <chartType.icon
                  className={animStyles.sidebarButtonIcon}
                  sx={{ color: chartType.color }}
                />
              }
              label={
                <div className={animStyles.sidebarButtonContent}>
                  <span className={animStyles.sidebarButtonText}>
                    {chartType.name}
                  </span>
                </div>
              }
              onClick={() => {
                setActiveCategory(chartType.id);
                scrollToCategory(chartType.id);
              }}
              sx={{
                justifyContent: "flex-start",
                height: 48,
                bgcolor:
                  activeCategory === chartType.id
                    ? "primary.light"
                    : "transparent",
                color:
                  activeCategory === chartType.id ? "white" : "text.primary",
                "&:hover": {
                  bgcolor:
                    activeCategory === chartType.id
                      ? "primary.main"
                      : "action.hover",
                },
                transition: "all 0.3s linear",
                "& .MuiChip-icon": { mr: 0.5 },
                animationDelay: `${200 + index * 80}ms`,
              }}
            />
          ))}
        </Stack>
      </Paper>

      {/* 右侧核心内容区 */}
      <Box
        ref={contentScrollRef}
        sx={{ flex: 1, height: "100%", overflow: "auto" }}
      >
        <Container maxWidth="lg" sx={{ p: 3 }}>
          {chartTypes.map((chartType, index) => {
            const tools = groupedTools[chartType.id];
            if (tools.length === 0) return null;

            return (
              <Box
                key={chartType.id}
                ref={(el) => {
                  sectionRefs.current[chartType.id] = el as HTMLElement;
                }}
                sx={{ mb: 6, alignItems: "center" }}
              >
                {/* 分组标题 */}
                <Box
                  className={`${animStyles.sectionTitleEnter} ${animStyles.sectionTitleHover}`}
                  sx={(theme) => ({
                    p: 2,
                    mb: 4,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}50 0%, ${theme.palette.info.main}50 100%)`,
                    color: "black",
                    borderRadius: 2,
                    minHeight: 60,
                    display: "flex",
                    alignItems: "center",
                  })}
                >
                  <Stack
                    className={animStyles.sectionTitleContent}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                  >
                    <chartType.icon
                      className={animStyles.sectionTitleIcon}
                      sx={{ fontSize: 32 }}
                    />
                    <Typography
                      className={animStyles.sectionTitleText}
                      variant="h5"
                      fontWeight={700}
                    >
                      {chartType.name}
                    </Typography>
                    <Chip
                      className={animStyles.sectionTitleChip}
                      label={`${tools.length} 个工具`}
                      size="small"
                      sx={{
                        bgcolor: "info.light",
                        color: "text.secondary",
                      }}
                    />
                  </Stack>
                </Box>

                {/* 工具卡片网格 */}
                <Grid
                  container
                  spacing={3}
                  rowSpacing={4}
                  columns={{ xs: 3, sm: 4, md: 8, lg: 12 }}
                  className={animStyles.cardsGridEnter}
                  sx={{ pointerEvents: "auto" }}
                >
                  {tools.map((tool, toolIndex) => (
                    <Grid
                      key={tool.id}
                      size={{ xs: 3, sm: 4, md: 4, lg: 4 }}
                      className={animStyles.cardStagger}
                      sx={{
                        animationDelay: `${index * 50 + toolIndex * 100}ms`,
                      }}
                    >
                      <Card
                        className={`${animStyles.cardEnter} ${animStyles.cardHover}`}
                        onMouseEnter={handleBounce}
                        onClick={() => handleToolClick(tool.id)}
                        sx={{
                          height: 430,
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                          transition: "all 0.3s linear",
                          mx: "auto",
                          position: "relative",
                          cursor: "pointer",
                          zIndex: 1,
                          "&:hover": {
                            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                          },
                        }}
                      >
                        <IconButton
                          className={animStyles.wiggleHover}
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("Bookmark clicked:", tool.id);
                          }}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            bgcolor: "background.paper",
                            boxShadow: 1,
                            transformOrigin: "50% 50%",
                            "&:hover": { bgcolor: "background.paper" },
                          }}
                          aria-label="收藏"
                        >
                          <BookmarkBorder />
                        </IconButton>
                        <CardMedia
                          component="img"
                          image={tool.image}
                          alt={tool.name}
                          sx={{ objectFit: "cover", height: 300 }}
                        />
                        <CardContent sx={{ flex: 1, p: 2, height: 100 }}>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ mb: 1 }}
                          >
                            {tool.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              mb: 2,
                            }}
                          >
                            {tool.description}
                          </Typography>
                        </CardContent>
                        <CardActions
                          sx={{ py: 2, px: 3, justifyContent: "space-between" }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Tooltip title="收藏数">
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                              >
                                <Favorite
                                  sx={{
                                    fontSize: 16,
                                    color: "error.light",
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {tool.favorites}
                                </Typography>
                              </Stack>
                            </Tooltip>
                            <Tooltip title="点赞数">
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                              >
                                <ThumbUp
                                  sx={{
                                    fontSize: 16,
                                    color: "warning.light",
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {tool.likes}
                                </Typography>
                              </Stack>
                            </Tooltip>
                            <Tooltip title="使用数">
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                              >
                                <Visibility
                                  sx={{
                                    fontSize: 16,
                                    color: "info.light",
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {tool.usage}
                                </Typography>
                              </Stack>
                            </Tooltip>
                          </Stack>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Tooltip title="查看视频">
                              <IconButton
                                className={animStyles.playButtonPulse}
                                size="small"
                                sx={{
                                  borderRadius: 1.5,
                                  width: 36,
                                  height: 36,
                                  border: 1,
                                  borderColor: "primary.main",
                                  color: "primary.main",
                                  "&:hover": {
                                    bgcolor: "primary.light",
                                    color: "white",
                                  },
                                }}
                              >
                                <PlayArrow />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="开始绘制">
                              <IconButton
                                className={animStyles.drawButtonRotate}
                                size="small"
                                onClick={(e) => handleDrawClick(tool.id, e)}
                                sx={{
                                  borderRadius: 1.5,
                                  width: 36,
                                  height: 36,
                                  bgcolor: "primary.main",
                                  color: "white",
                                  "&:hover": {
                                    bgcolor: "primary.dark",
                                  },
                                }}
                              >
                                <Create />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })}
        </Container>
      </Box>
    </Box>
  );
}
