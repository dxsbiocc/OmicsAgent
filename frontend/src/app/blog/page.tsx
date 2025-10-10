"use client";

import { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Button,
  Fab,
  Tooltip,
  Zoom,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import { Carousel, BlogCard, ScrollableAlert } from "../../components";
import animStyles from "../../../styles/blog/blog-animations.module.css";
import { useAuthContext } from "@/contexts/AuthContext";
import { blogApi } from "@/libs/api/blog";
import type { BlogPostResponse } from "@/types";

// Mock data for carousel
const carouselItems = [
  {
    id: "1",
    title: "组学数据分析的新趋势",
    description:
      "探索最新的生物信息学工具和方法，了解如何更好地分析基因组、转录组和蛋白质组数据。",
    image: "/images/background/others/18895874.jpg",
    link: "/blog/omics-trends",
  },
  {
    id: "2",
    title: "AI在生物医学中的应用",
    description:
      "人工智能技术如何改变生物医学研究，从药物发现到个性化医疗的突破。",
    image: "/images/background/others/18895881.jpg",
    link: "/blog/ai-biomedicine",
  },
  {
    id: "3",
    title: "可视化工具的最佳实践",
    description: "学习如何创建清晰、美观且信息丰富的科学数据可视化图表。",
    image: "/images/background/others/18895885.jpg",
    link: "/blog/visualization-best-practices",
  },
];

export default function BlogPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(6); // 每页显示6个博客卡片

  // 博客数据状态
  const [blogPosts, setBlogPosts] = useState<BlogPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApiError, setIsApiError] = useState(false); // 区分API错误和空数据

  // Snackbar 状态
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  // 加载博客数据
  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsApiError(false);
        const posts = await blogApi.getBlogPosts({
          status: "published",
          skip: 0,
          limit: 100, // 加载更多数据用于分页
        });
        setBlogPosts(posts);
        // 如果API成功但返回空数组，说明没有博客文章
        if (posts.length === 0) {
          setError("暂无博客文章");
        }
      } catch (err) {
        console.error("Failed to load blog posts:", err);
        setError("加载博客文章失败，请检查网络连接");
        setIsApiError(true);
        setBlogPosts([]); // 设置空数组，不使用模拟数据
      } finally {
        setLoading(false);
      }
    };

    loadBlogPosts();
  }, []);

  // 计算分页数据
  const totalPages = Math.ceil(blogPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = blogPosts.slice(startIndex, endIndex);

  // 处理分页变化
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 重新加载数据
  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    setIsApiError(false);

    try {
      const posts = await blogApi.getBlogPosts({
        status: "published",
        skip: 0,
        limit: 100,
      });
      setBlogPosts(posts);
      if (posts.length === 0) {
        setError("暂无博客文章");
      }
    } catch (err) {
      console.error("Failed to reload blog posts:", err);
      setError("加载博客文章失败，请检查网络连接");
      setIsApiError(true);
      setBlogPosts([]); // 设置空数组，不使用模拟数据
    } finally {
      setLoading(false);
    }
  };

  // 显示 Snackbar
  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // 关闭 Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box className={animStyles.pageEnter}>
      {/* Carousel Section */}
      <Container
        maxWidth="lg"
        className={animStyles.containerFloatIn}
        sx={{ py: 6 }}
      >
        <Carousel items={carouselItems} height={450} />
      </Container>

      {/* Filter and Search Section */}
      <Container
        maxWidth="lg"
        className={animStyles.containerFloatIn}
        sx={{ pb: 6 }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          alignItems="center"
          sx={{ minHeight: 80 }}
        >
          <TextField
            className={animStyles.textFloatIn}
            placeholder="搜索博客文章..."
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, maxWidth: 400 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: "white",
                },
              },
            }}
          />
          <FormControl
            size="small"
            className={animStyles.textFloatIn}
            sx={{ minWidth: 120 }}
          >
            <InputLabel>分类</InputLabel>
            <Select label="分类" defaultValue="">
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="genomics">基因组学</MenuItem>
              <MenuItem value="transcriptomics">转录组学</MenuItem>
              <MenuItem value="proteomics">蛋白质组学</MenuItem>
              <MenuItem value="metabolomics">代谢组学</MenuItem>
            </Select>
          </FormControl>
          <FormControl
            size="small"
            className={animStyles.textFloatIn}
            sx={{ minWidth: 120 }}
          >
            <InputLabel>排序</InputLabel>
            <Select label="排序" defaultValue="latest">
              <MenuItem value="latest">最新</MenuItem>
              <MenuItem value="popular">最热门</MenuItem>
              <MenuItem value="views">最多浏览</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Container>

      {/* Blog Posts Grid */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Typography
          className={animStyles.titleFloatIn}
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 6,
            minHeight: 60,
            display: "flex",
            alignItems: "center",
          }}
        >
          最新文章
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : isApiError ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <ScrollableAlert severity="error">{error}</ScrollableAlert>
            <Button
              variant="contained"
              onClick={handleRetry}
              disabled={loading}
            >
              {loading ? "重新加载中..." : "重新加载"}
            </Button>
          </Box>
        ) : blogPosts.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              {error || "暂无博客文章"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              还没有发布任何博客文章，请稍后再来查看
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={handleRetry}
                disabled={loading}
              >
                {loading ? "刷新中..." : "刷新"}
              </Button>
              {isAuthenticated && user?.is_admin && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push("/blog/create")}
                >
                  创建第一篇博客
                </Button>
              )}
            </Stack>
          </Box>
        ) : (
          <Grid container spacing={3} columns={{ xs: 3, sm: 4, md: 8, lg: 12 }}>
            {currentPosts.map((post, index) => (
              <Grid
                key={post.id}
                size={{ xs: 3, sm: 4, md: 4, lg: 4 }}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Box
                  className={`${animStyles.cardStagger} ${animStyles.delay100}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <BlogCard post={post} />
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {/* 分页组件 */}
        <Box
          className={animStyles.buttonFloatIn}
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 8,
            mb: 4,
            minHeight: 80,
            alignItems: "center",
          }}
        >
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": {
                fontSize: "1rem",
                fontWeight: 500,
                minHeight: 48,
                minWidth: 48,
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                },
                "&:hover": {
                  backgroundColor: "primary.light",
                  color: "white",
                },
              },
            }}
          />
        </Box>
      </Container>

      {/* 创建博客浮动按钮 */}
      <Tooltip
        title="创建新博客"
        placement="left"
        slots={{
          transition: Zoom,
        }}
        slotProps={{
          transition: {
            timeout: 200,
          },
        }}
        arrow
      >
        <Fab
          aria-label="创建博客"
          className={animStyles.fabButton}
          color="primary"
          sx={{
            position: "fixed",
            top: "50%", // 垂直居中
            right: 24,
            transform: "translateY(-50%)", // 精确居中
            // zIndex: 1500, // 进一步提高 z-index
            display: "flex !important", // 强制显示
            visibility: "visible !important", // 强制可见
            width: 64,
            height: 64,
            "&:hover": {
              transform: "translateY(-50%) scale(1.1)", // 悬停时放大
              animation: "fabPulse 0.6s ease-in-out",
            },
            "&:active": {
              transform: "translateY(-50%) scale(0.95)", // 点击时缩小
            },
          }}
          onClick={() => {
            console.log("Fab button clicked!"); // 添加调试日志

            // 身份验证检查 - 只有管理员可以创建博客
            if (!isAuthenticated) {
              router.push("/auth/login");
              return;
            }

            if (!user?.is_admin) {
              showSnackbar("只有管理员可以创建博客", "warning");
              return;
            }

            router.push("/blog/create");
          }}
        >
          <AddIcon fontSize="large" />
        </Fab>
      </Tooltip>

      {/* Snackbar 提示 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
