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
import animStyles from "../../../styles/visual/visual-animations.module.css";
import {
  Biotech,
  Science,
  Analytics,
  Favorite,
  ThumbUp,
  Visibility,
  BookmarkBorder,
  PlayArrow,
  Create,
  Storage,
  Timeline as Epigenomics,
  LocalDining as Metabolomics,
  Extension as Proteomics,
  BugReport as Metagenomics,
  Close,
  Search,
} from "@mui/icons-material";
import { OmicsAnalystLogoIcon } from "@/components/common/CustomSvgIcon";
import {
  getAnalysisTools,
  type AnalysisToolInfo,
  type AnalysisToolGroup,
} from "@/libs/api/analysis";

// Analysis tools response (re-export from API for compatibility)
export interface AnalysisToolsResponse {
  tools: AnalysisToolInfo[];
  groups: AnalysisToolGroup[];
  total_tools: number;
  total_categories: number;
  category_stats: Record<string, number>;
}

// Frontend category order
const CATEGORY_ORDER = [
  "db",
  "transcriptomics",
  "genomics",
  "epigenetics",
  "proteomics",
  "metabolomics",
  "metagenomics",
  "multiomics",
];

export default function AnalysisPage() {
  const router = useRouter();

  // State management
  const [toolsData, setToolsData] = useState<AnalysisToolInfo[]>([]);
  const [toolGroups, setToolGroups] = useState<AnalysisToolGroup[]>([]);
  const [analysisCategories, setAnalysisCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState("database");
  const [searchQuery, setSearchQuery] = useState("");
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const activeCategoryRef = useRef(activeCategory);

  // Category icon mapping
  const categoryIconMap: { [key: string]: any } = {
    db: Storage,
    database: Storage,
    genomics: Science,
    transcriptomics: Biotech,
    epigenetics: Epigenomics,
    proteomics: Proteomics,
    metabolomics: Metabolomics,
    metagenomics: Metagenomics,
    multiomics: Analytics,
  };

  // Category color mapping
  const categoryColorMap: { [key: string]: string } = {
    db: "#2196F3",
    database: "#2196F3",
    genomics: "#4CAF50",
    transcriptomics: "#FF9800",
    epigenetics: "#9C27B0",
    proteomics: "#607D8B",
    metabolomics: "#795548",
    metagenomics: "#3F51B5",
    multiomics: "#F44336",
  };

  // Initialize analysis tools data from API
  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tools from API
        const response = await getAnalysisTools();
        setToolsData(response.tools);
        setToolGroups(response.groups);

        // Generate analysis categories for sidebar from API response
        const dynamicCategories = response.groups.map(
          (group: AnalysisToolGroup) => ({
            id: group.category,
            name: group.display_name,
            icon: categoryIconMap[group.category] || Analytics,
            color: categoryColorMap[group.category] || "#757575",
            count: group.tool_count,
          })
        );

        // Sort by predefined order
        dynamicCategories.sort((a: any, b: any) => {
          const ia = CATEGORY_ORDER.indexOf(a.id);
          const ib = CATEGORY_ORDER.indexOf(b.id);
          return (
            (ia === -1 ? Number.MAX_SAFE_INTEGER : ia) -
            (ib === -1 ? Number.MAX_SAFE_INTEGER : ib)
          );
        });

        setAnalysisCategories(dynamicCategories);

        // Set default active category
        if (dynamicCategories.length > 0) {
          setActiveCategory(dynamicCategories[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch analysis tools:", err);
        setError("加载分析工具数据失败，请稍后重试");
        // Fallback to empty data
        setToolsData([]);
        setToolGroups([]);
        setAnalysisCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, []);

  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  // Scroll to category
  const scrollToCategory = (categoryId: string) => {
    const element = sectionRefs.current[categoryId];
    const scrollContainer = contentScrollRef.current;
    if (!element || !scrollContainer) return;

    const elementTop = element.offsetTop;
    const containerHeight = scrollContainer.clientHeight;
    const maxScrollTop = scrollContainer.scrollHeight - containerHeight;
    const titleOffset = 72;

    let targetScrollTop = elementTop - titleOffset;
    targetScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));

    isProgrammaticScrollRef.current = true;
    scrollContainer.scrollTo({ top: targetScrollTop, behavior: "smooth" });
    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 500);
  };

  // Scroll Spy
  useEffect(() => {
    const sc = contentScrollRef.current;
    if (!sc) return;

    let rafId = 0;
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (isProgrammaticScrollRef.current) return;
        const threshold = 100;
        const viewportTop = sc.scrollTop;

        let activeId = activeCategoryRef.current;

        const isAtBottom =
          sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 10;

        if (isAtBottom) {
          const lastCategory =
            analysisCategories[analysisCategories.length - 1];
          const lastElement = sectionRefs.current[lastCategory.id];
          if (lastElement) {
            activeId = lastCategory.id;
          }
        } else {
          for (let i = analysisCategories.length - 1; i >= 0; i--) {
            const category = analysisCategories[i];
            const el = sectionRefs.current[category.id];
            if (!el) continue;

            const sectionTop = el.offsetTop;
            const sectionBottom = sectionTop + el.offsetHeight;

            if (sectionTop <= viewportTop + threshold) {
              if (sectionBottom > viewportTop) {
                activeId = category.id;
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
    onScroll();
    return () => {
      sc.removeEventListener("scroll", onScroll as EventListener);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [analysisCategories]);

  // Get tool image from /tools folder based on tool name
  const getToolImage = (toolName: string): string => {
    // Extract tool name from slug (e.g., "db_depmap" -> "depmap")
    const toolSlug = toolName.split("_").slice(-1)[0].toLowerCase();

    // Map tool slugs to image file names
    const imageMap: Record<string, string> = {
      depmap: "depmap.png",
      tcga: "tcga.png",
      gtex: "gtex.png",
      geo: "geo.png",
    };

    const imageName = imageMap[toolSlug];
    if (imageName) {
      return `/tools/${imageName}`;
    }

    // Fallback to default or sample_image_url
    return "/images/background/others/6056984.jpg";
  };

  // Group tools by category
  const groupedTools = toolGroups.reduce((acc, group: AnalysisToolGroup) => {
    // Add backgroundImage to each tool
    const toolsWithImages = group.tools.map((tool: AnalysisToolInfo) => {
      const toolImage = getToolImage(tool.tool);
      return {
        ...tool,
        backgroundImage:
          toolImage !== "/images/background/others/6056984.jpg"
            ? toolImage
            : tool.sample_image_url || "/images/background/others/6056984.jpg",
      };
    });
    acc[group.category] = toolsWithImages;
    return acc;
  }, {} as { [key: string]: AnalysisToolInfo[] });

  // Filter tools based on search query
  const filterTools = (tools: AnalysisToolInfo[]) => {
    if (!searchQuery.trim()) return tools;
    const query = searchQuery.toLowerCase();
    return tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tool.toLowerCase().includes(query)
    );
  };

  // Card bounce handler
  const handleBounce = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.classList.remove(animStyles.cardBounceOnce);
    void el.offsetWidth;
    el.classList.add(animStyles.cardBounceOnce);
  };

  // Handle tool click
  const handleToolClick = (toolId: string) => {
    router.push(`/analysis/${toolId}`);
  };

  // Handle start analysis button click
  const handleAnalysisClick = (toolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/analysis/${toolId}`);
  };

  // Loading state
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
        <Typography>加载分析工具数据中...</Typography>
      </Box>
    );
  }

  // Error state
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
    <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left sidebar */}
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
          {analysisCategories.map((category, index) => (
            <Chip
              key={category.id}
              className={`${animStyles.sidebarContentStagger} ${animStyles.sidebarButtonHover}`}
              icon={
                <category.icon
                  className={animStyles.sidebarButtonIcon}
                  sx={{ color: category.color }}
                />
              }
              label={
                <div className={animStyles.sidebarButtonContent}>
                  <span className={animStyles.sidebarButtonText}>
                    {category.name}
                  </span>
                </div>
              }
              onClick={() => {
                setActiveCategory(category.id);
                scrollToCategory(category.id);
              }}
              sx={{
                justifyContent: "flex-start",
                height: 48,
                bgcolor:
                  activeCategory === category.id
                    ? "primary.light"
                    : "transparent",
                color:
                  activeCategory === category.id ? "white" : "text.primary",
                "&:hover": {
                  bgcolor:
                    activeCategory === category.id
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

      {/* Main content area */}
      <Box
        ref={contentScrollRef}
        sx={{ flex: 1, height: "100%", overflow: "auto" }}
      >
        <Container maxWidth="lg" sx={{ p: 3 }}>
          {/* Search Bar */}
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                placeholder="搜索分析工具..."
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
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(59, 130, 246, 0.1)",
                  px: 1.5,
                  py: 1.5,
                  borderRadius: "9999px",
                  border: 1,
                  borderColor:
                    theme.palette.mode === "dark"
                      ? "rgba(59, 130, 246, 0.25)"
                      : "rgba(59, 130, 246, 0.2)",
                  height: "auto",
                  minHeight: 40,
                })}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "info.main",
                  }}
                >
                  共 {toolsData.length} 个分析工具
                </Typography>
                <Box
                  sx={(theme) => ({
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(59, 130, 246, 0.5)"
                        : "rgba(59, 130, 246, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  })}
                >
                  <OmicsAnalystLogoIcon
                    sx={{ fontSize: 20, color: "info.main" }}
                  />
                </Box>
              </Box>
            </Stack>
          </Box>
          {analysisCategories.map((category, index) => {
            const tools = filterTools(groupedTools[category.id] || []);
            if (tools.length === 0) return null;

            return (
              <Box
                key={category.id}
                ref={(el) => {
                  sectionRefs.current[category.id] = el as HTMLElement;
                }}
                sx={{ mb: 6, alignItems: "center" }}
              >
                {/* Category title */}
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
                    <category.icon
                      className={animStyles.sectionTitleIcon}
                      sx={{ fontSize: 32 }}
                    />
                    <Typography
                      className={animStyles.sectionTitleText}
                      variant="h5"
                      fontWeight={700}
                    >
                      {category.name}
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

                {/* Tools grid */}
                <Grid
                  container
                  spacing={3}
                  rowSpacing={4}
                  columns={{ xs: 3, sm: 4, md: 8, lg: 12 }}
                  className={animStyles.cardsGridEnter}
                  sx={{ pointerEvents: "auto" }}
                >
                  {tools.map((tool: AnalysisToolInfo, toolIndex: number) => (
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
                        onClick={() => handleToolClick(tool.tool)}
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
                        <CardMedia
                          component="img"
                          image={
                            (tool as any).backgroundImage ||
                            tool.sample_image_url ||
                            "/images/background/others/6056984.jpg"
                          }
                          alt={tool.name}
                          sx={{
                            width: "100%",
                            height: 300,
                            objectFit: "contain",
                            display: "block",
                            objectPosition: "center",
                            // 使用平滑渲染，避免模糊
                            imageRendering: "auto",
                            // 启用硬件加速，提高渲染质量
                            backfaceVisibility: "hidden",
                            transform: "translateZ(0)",
                            // 背景色填充空白区域
                            backgroundColor: "background.default",
                            // 确保图片不会超过原始尺寸
                            maxWidth: "100%",
                            maxHeight: "100%",
                          }}
                          loading="lazy"
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
                            <Tooltip title="查看教程">
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
                            <Tooltip title="开始分析">
                              <IconButton
                                className={animStyles.drawButtonRotate}
                                size="small"
                                onClick={(e) =>
                                  handleAnalysisClick(tool.tool, e)
                                }
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
