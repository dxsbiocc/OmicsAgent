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
  TextField,
  InputAdornment,
} from "@mui/material";
import Iconify from "@/components/common/Iconify";
import { OmicsArtistLogoIcon } from "@/components/common/CustomSvgIcon";
import animStyles from "../../../styles/visual/visual-animations.module.css";
import {
  TrendingUp,
  BarChart,
  PieChart,
  ScatterPlot,
  CandlestickChart,
  Radar,
  GridOn as HeatMap,
  AccountTree,
  DeviceHub,
  Favorite,
  ThumbUp,
  Visibility,
  BookmarkBorder,
  PlayArrow,
  Create,
  Image as ImageIcon,
  Javascript,
  Close,
  Search,
} from "@mui/icons-material";
import {
  getVisualTools,
  type VisualToolInfo,
  type VisualToolGroup,
  type VisualToolsResponse,
} from "@/libs/api/visual";
import { addRandomBackgroundToTools } from "../../utils/backgroundUtils";

// 获取工具背景图片的函数
const getToolBackgroundImage = (toolSlug: string): string => {
  // 默认占位背景图
  const defaultBackgroundImage = "/images/background/others/6056984.jpg";

  // 获取实际的文件名
  const visualImagePath = `/visual/${toolSlug}.svg`;
  const visualImagePathPNG = `/visual/${toolSlug}.png`;

  // 已知存在的图片列表（基于你提供的文件）
  const knownImages = [
    "line_basic",
    "line_group", // 实际的文件名
    "line_stack",
    "line_highlight",
    "line_bump",
    "line_double",
    "line_independent",
    "bar_basic",
    "bar_group",
    "bar_waterfall",
    "bar_stack",
    "bar_break",
    "bar_polar_vertical",
    "bar_polar_horizontal",
    "bar_polar_sector",
    "bar_polar_stack",
    "bar_polar_stack_ring",
    "scatter_basic",
    "scatter_group",
    "scatter_bubble",
    "scatter_jitter",
    "scatter_single",
    "pie_basic",
    "pie_doughnut",
    "pie_half",
    "pie_nightingale",
    "pie_nest",
    "pie_combine",
    "radar_basic",
    "radar_group",
    "boxplot_basic",
    "boxplot_group",
    "heatmap_basic",
    "tree_basic",
    "tree_group",
    "sunburst_basic",
    "sunburst_advanced",
    "sunburst_round",
    "sankey_basic",
    "sankey_level",
    "graph_basic",
    "graph_force",
    "graph_cartesian",
    "graph_circular",
  ];

  const knownImagesPNG = [
    // scatter
    "scatter_paired",
    "scatter_bezier",
    "scatter_cleveland",
    "scatter_lollipop_polar",
    "scatter_lollipop_radial",
    "scatter_dumbbell",
    "scatter_dumbbell_horizontal",
    "scatter_dumbbell_region",
    "scatter_dumbbell_groups",
    "scatter_dumbbell_rect",
    "scatter_beeswarm",
    "scatter_beeswarm_group",
    "scatter_jitter_group",
    "scatter_one2many",
    "scatter_correlation",
    "scatter_contour",
    "scatter_volcano",
    "scatter_maplot",
    "scatter_rank",
    "scatter_diagonal",
    "scatter_quadrant",
    "scatter_hex",
    "scatter_marginal",
    "scatter_matrix",
    // line
    "line_survival",
    // bar
    "bar_enrichment_groups",
    "bar_opposite",
    "bar_enrichment_genes",
    "bar_enrichment_expand",
    "bar_enrichment_points",
    "bar_radial",
    "bar_radial_groups",
    "bar_butterfly",
    "bar_errorbar",
    "bar_waffle",
    "bar_percent",
    // boxplot
    "boxplot_differential_expression",
    "boxplot_round",
    "boxplot_point",
    "boxplot_violin",
    "boxplot_raincloud",
    "boxplot_raincloud_vertical",
    "boxplot_differential_two",
    "boxplot_differential_facet",
    "boxplot_bezier_point",
    "boxplot_differential_bg",
    "boxplot_polar_heatmap",
    "boxplot_polar",
    "boxplot_raincloud_differential",
    // heatmap
    "heatmap_shape",
    "heatmap_mantel",
    "heatmap_mantel_size",
    "heatmap_two_shape",
    "heatmap_signif",
    "heatmap_two",
  ];

  // 检查是否是已知存在的图片
  if (knownImages.includes(toolSlug)) {
    return visualImagePath;
  }
  if (knownImagesPNG.includes(toolSlug)) {
    return visualImagePathPNG;
  }

  // 对于其他图片，先尝试 visual 目录，如果不存在会回退到默认图片
  return defaultBackgroundImage;
};

// 智能图片组件，处理加载失败的情况
const SmartCardMedia = ({
  toolSlug,
  toolName,
}: {
  toolSlug: string;
  toolName: string;
}) => {
  const [imageSrc, setImageSrc] = useState(getToolBackgroundImage(toolSlug));
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc("/images/background/others/6056984.jpg");
    }
  };

  return (
    <CardMedia
      component="img"
      image={imageSrc}
      alt={toolName}
      onError={handleImageError}
      sx={{
        objectFit: "cover",
        height: 260,
        flexShrink: 0, // 防止被压缩
        width: "100%",
      }}
    />
  );
};

// 前端分组显示顺序：由简单到复杂（仅前端控制，后端无关）
const CATEGORY_ORDER = [
  "line",
  "scatter",
  "bar",
  "pie",
  "boxplot",
  "radar",
  "area",
  "heatmap",
  "tree",
  "graph",
  "funnel",
  "sankey",
  "parallel",
  "sunburst",
];

// 图表类型定义（从后端工具数据动态生成）
const getChartTypes = (tools: VisualToolInfo[]) => {
  const typeMap = new Map();

  tools.forEach((tool) => {
    const chartType = tool.category; // 使用分类字段
    if (!typeMap.has(chartType)) {
      const iconMap: Record<string, any> = {
        line: TrendingUp,
        bar: BarChart,
        pie: PieChart,
        scatter: ScatterPlot,
        radar: Radar,
        boxplot: CandlestickChart,
        heatmap: HeatMap,
        tree: AccountTree,
        area: TrendingUp,
        funnel: PieChart,
        sankey: ScatterPlot,
        parallel: Radar,
        sunburst: HeatMap,
        graph: DeviceHub,
      };

      const colorMap: Record<string, string> = {
        line: "#ed6ca4",
        bar: "#fbb05b",
        pie: "#acd372",
        scatter: "#7bc4e2",
        radar: "#9c27b0",
        boxplot: "#fbb05b",
        heatmap: "#ff5722",
        tree: "#795548",
        area: "#ed6ca4",
        funnel: "#acd372",
        sankey: "#7bc4e2",
        parallel: "#9c27b0",
        sunburst: "#ff5722",
        graph: "#795548",
      };

      const nameMap: Record<string, string> = {
        line: "折线图",
        scatter: "散点图",
        bar: "柱状图",
        pie: "饼图",
        radar: "雷达图",
        boxplot: "箱线图",
        heatmap: "热图",
        tree: "树状图",
        area: "面积图",
        funnel: "漏斗图",
        sankey: "桑基图",
        parallel: "平行坐标",
        sunburst: "旭日图",
        graph: "关系图",
      };

      typeMap.set(chartType, {
        id: chartType,
        name: nameMap[chartType] || chartType,
        icon: iconMap[chartType] || BarChart,
        color: colorMap[chartType] || "#666666",
        count: 1,
      });
    } else {
      typeMap.get(chartType).count++;
    }
  });

  return Array.from(typeMap.values());
};

export default function VisualPage() {
  const router = useRouter();

  // 状态管理
  const [toolsData, setToolsData] = useState<VisualToolInfo[]>([]);
  const [toolGroups, setToolGroups] = useState<VisualToolGroup[]>([]);
  const [chartTypes, setChartTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState("line");
  const [searchQuery, setSearchQuery] = useState("");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const contentScrollRef = useRef<HTMLDivElement>(null);
  // 避免滚动过程中 ScrollSpy 抢占激活态
  const isProgrammaticScrollRef = useRef(false);
  const activeCategoryRef = useRef(activeCategory);

  // 获取工具数据
  useEffect(() => {
    const fetchToolsData = async () => {
      try {
        setLoading(true);
        const response: VisualToolsResponse = await getVisualTools();

        // 添加随机背景图片
        const toolsWithBackgrounds = addRandomBackgroundToTools(response.tools);
        setToolsData(toolsWithBackgrounds);
        setToolGroups(response.groups);

        // 动态生成图表类型（基于分组信息）
        // 生成并按前端预定义顺序排序
        const dynamicChartTypes = getChartTypes(toolsWithBackgrounds);
        dynamicChartTypes.sort((a: any, b: any) => {
          const ia = CATEGORY_ORDER.indexOf(a.id);
          const ib = CATEGORY_ORDER.indexOf(b.id);
          return (
            (ia === -1 ? Number.MAX_SAFE_INTEGER : ia) -
            (ib === -1 ? Number.MAX_SAFE_INTEGER : ib)
          );
        });
        setChartTypes(dynamicChartTypes);

        // 设置默认激活分类
        if (dynamicChartTypes.length > 0) {
          setActiveCategory(dynamicChartTypes[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch tools data:", err);
        setError("获取工具数据失败");
      } finally {
        setLoading(false);
      }
    };

    fetchToolsData();
  }, []);

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

  // 按分类分组工具（使用后端分组信息）
  const groupedTools = toolGroups.reduce((acc, group) => {
    acc[group.category] = group.tools;
    return acc;
  }, {} as { [key: string]: VisualToolInfo[] });

  // Filter tools based on search query
  const filterTools = (tools: VisualToolInfo[]) => {
    if (!searchQuery.trim()) return tools;
    const query = searchQuery.toLowerCase();
    return tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tool.toLowerCase().includes(query)
    );
  };

  // 卡片跳动处理函数
  const handleBounce = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.classList.remove(animStyles.cardBounceOnce);
    // 强制重排以重启动画
    void el.offsetWidth;
    el.classList.add(animStyles.cardBounceOnce);
  };

  // 处理JavaScript图表绘制按钮点击
  const handleJavaScriptDrawClick = (toolId: string, e: React.MouseEvent) => {
    console.log("JavaScript draw button clicked:", toolId);
    e.stopPropagation();
    router.push(`/visual/${toolId}?type=js`);
  };

  // 处理Python图表绘制按钮点击
  const handlePythonDrawClick = (toolId: string, e: React.MouseEvent) => {
    console.log("Python draw button clicked:", toolId);
    e.stopPropagation();
    router.push(`/visual/${toolId}?type=py`);
  };

  // 处理R图表绘制按钮点击
  const handleRDrawClick = (toolId: string, e: React.MouseEvent) => {
    console.log("R draw button clicked:", toolId);
    e.stopPropagation();
    router.push(`/visual/${toolId}?type=r`);
  };

  // 加载状态
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>加载工具数据中...</Typography>
      </Box>
    );
  }

  // 错误状态
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          请检查网络连接或稍后重试
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "100%", overflow: "display" }}>
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
          // overflow: "auto",
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
          {/* Search Bar */}
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                placeholder="搜索绘图工具..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 24, color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery("")}
                        sx={{ color: "text.secondary" }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    "&:hover": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                      },
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "primary.main",
                        borderWidth: 2,
                      },
                    },
                  },
                }}
              />
              {/* Status Indicator */}
              <Box
                sx={(theme) => ({
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                  gap: 1,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(245, 158, 11, 0.15)"
                      : "rgba(245, 158, 11, 0.1)",
                  px: 1.5,
                  py: 1.5,
                  borderRadius: "9999px",
                  border: 1,
                  borderColor:
                    theme.palette.mode === "dark"
                      ? "rgba(245, 158, 11, 0.25)"
                      : "rgba(245, 158, 11, 0.2)",
                  height: "auto",
                  minHeight: 40,
                })}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "warning.main",
                  }}
                >
                  共 {toolsData.length} 个绘图工具
                </Typography>
                <Box
                  sx={(theme) => ({
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(245, 158, 11, 0.5)"
                        : "rgba(245, 158, 11, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  })}
                >
                  <OmicsArtistLogoIcon
                    sx={{ fontSize: 20, color: "warning.main" }}
                  />
                </Box>
              </Box>
            </Stack>
          </Box>
          {chartTypes.map((chartType, index) => {
            const tools = filterTools(groupedTools[chartType.id] || []);
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
                    color: "text.primary",
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
                  {tools.map((tool: VisualToolInfo, toolIndex: number) => (
                    <Grid
                      key={tool.tool}
                      size={{ xs: 3, sm: 4, md: 4, lg: 4 }}
                      className={animStyles.cardStagger}
                      sx={{
                        animationDelay: `${index * 50 + toolIndex * 100}ms`,
                      }}
                    >
                      <Card
                        className={`${animStyles.cardEnter} ${animStyles.cardHover}`}
                        onMouseEnter={handleBounce}
                        sx={{
                          height: 430,
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                          transition: "all 0.3s linear",
                          mx: "auto",
                          position: "relative",
                          cursor: "default",
                          zIndex: 1,
                          overflow: "hidden", // 防止内容溢出
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
                            console.log("Bookmark clicked:", tool.tool);
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
                        <SmartCardMedia
                          toolSlug={tool.tool}
                          toolName={tool.name}
                        />
                        <CardContent
                          sx={{
                            flex: "0 0 auto", // 固定高度，不伸缩
                            p: 2,
                            height: 100, // 从 120px 减少到 100px
                            minHeight: 100,
                            maxHeight: 100,
                            overflow: "hidden", // 防止内容溢出
                          }}
                        >
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
                          sx={{
                            py: 2,
                            px: 3,
                            justifyContent: "space-between",
                            flex: "0 0 auto", // 固定高度，不伸缩
                            minHeight: 80, // 从 60px 增加到 80px
                            overflow: "hidden", // 防止内容溢出
                          }}
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
                                  {Math.floor(Math.random() * 1000) + 100}
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
                                  {Math.floor(Math.random() * 500) + 50}
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
                                  {Math.floor(Math.random() * 2000) + 200}
                                </Typography>
                              </Stack>
                            </Tooltip>
                          </Stack>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Tooltip title="JavaScript">
                              <span>
                                <IconButton
                                  className={animStyles.javascriptButtonPulse}
                                  size="small"
                                  disabled={!tool.has_js}
                                  onClick={(e) =>
                                    handleJavaScriptDrawClick(tool.tool, e)
                                  }
                                  sx={{
                                    borderRadius: 1.5,
                                    width: 36,
                                    height: 36,
                                    border: 1,
                                    borderColor: "success.main",
                                    color: "success.main",
                                    "&:hover": {
                                      bgcolor: "success.light",
                                      color: "white",
                                    },
                                    "&.Mui-disabled": {
                                      opacity: 0.3,
                                    },
                                  }}
                                >
                                  <Javascript sx={{ fontSize: 48 }} />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="R">
                              <span>
                                <IconButton
                                  className={animStyles.rButtonWiggle}
                                  size="small"
                                  disabled={!tool.has_r}
                                  onClick={(e) =>
                                    handleRDrawClick(tool.tool, e)
                                  }
                                  sx={{
                                    borderRadius: 1.5,
                                    width: 36,
                                    height: 36,
                                    border: 1,
                                    borderColor: "info.main",
                                    color: "info.main",
                                    "&:hover": {
                                      bgcolor: "info.light",
                                      color: "white",
                                    },
                                    "&.Mui-disabled": {
                                      opacity: 0.3,
                                    },
                                  }}
                                >
                                  <Iconify icon="mdi:language-r" size={48} />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Python">
                              <span>
                                <IconButton
                                  className={animStyles.pythonButtonBounce}
                                  size="small"
                                  disabled={!tool.has_python}
                                  onClick={(e) =>
                                    handlePythonDrawClick(tool.tool, e)
                                  }
                                  sx={{
                                    borderRadius: 1.5,
                                    width: 36,
                                    height: 36,
                                    border: 1,
                                    borderColor: "warning.main",
                                    bgcolor: (theme) =>
                                      theme.palette.mode === "dark"
                                        ? "rgba(255,255,255,0.1)"
                                        : "background.paper",
                                    color: "warning.main",
                                    "&:hover": {
                                      bgcolor: "warning.light",
                                      color: "white",
                                    },
                                    "&.Mui-disabled": {
                                      opacity: 0.3,
                                    },
                                  }}
                                >
                                  <Iconify
                                    icon="simple-icons:python"
                                    size={20}
                                  />
                                </IconButton>
                              </span>
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
