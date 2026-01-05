"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Button,
  Avatar,
  Divider,
  TextField,
  InputAdornment,
  Pagination,
  Badge,
} from "@mui/material";
import {
  Forum,
  PostAdd,
  Search,
  Person,
  Schedule,
  Comment,
  ThumbUp,
  Visibility,
  BookmarkBorder,
  FilterList,
  Sort,
  TrendingUp,
  Science,
  Biotech,
  Timeline,
  Storage,
  BugReport,
  Psychology,
  LocalHospital,
} from "@mui/icons-material";

// Forum types
export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  post_count: number;
  last_post?: {
    title: string;
    author: string;
    time: string;
  };
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  category: string;
  created_at: string;
  updated_at: string;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
  is_pinned: boolean;
  is_locked: boolean;
}

// Forum categories
const FORUM_CATEGORIES: ForumCategory[] = [
  {
    id: "general",
    name: "综合讨论",
    description: "一般性讨论和问答",
    icon: Forum,
    color: "#2196F3",
    post_count: 156,
    last_post: {
      title: "欢迎来到OmicsAgent论坛！",
      author: "管理员",
      time: "2小时前",
    },
  },
  {
    id: "bioinformatics",
    name: "生物信息学",
    description: "生物信息学相关讨论",
    icon: Science,
    color: "#4CAF50",
    post_count: 89,
    last_post: {
      title: "RNA-seq数据分析最佳实践",
      author: "BioExpert",
      time: "1天前",
    },
  },
  {
    id: "omics",
    name: "组学分析",
    description: "基因组学、转录组学、蛋白质组学等",
    icon: Biotech,
    color: "#FF9800",
    post_count: 67,
    last_post: {
      title: "单细胞转录组分析流程",
      author: "SingleCellPro",
      time: "3天前",
    },
  },
  {
    id: "tools",
    name: "工具使用",
    description: "各种生物信息学工具的使用讨论",
    icon: Timeline,
    color: "#9C27B0",
    post_count: 134,
    last_post: {
      title: "BWA比对参数优化",
      author: "ToolMaster",
      time: "5小时前",
    },
  },
  {
    id: "databases",
    name: "数据库资源",
    description: "TCGA、GEO、HPA等数据库讨论",
    icon: Storage,
    color: "#607D8B",
    post_count: 45,
    last_post: {
      title: "TCGA数据下载和预处理",
      author: "DataHunter",
      time: "1周前",
    },
  },
  {
    id: "troubleshooting",
    name: "问题求助",
    description: "遇到问题？来这里求助",
    icon: BugReport,
    color: "#F44336",
    post_count: 78,
    last_post: {
      title: "R包安装失败求助",
      author: "Newbie",
      time: "2天前",
    },
  },
  {
    id: "career",
    name: "职业发展",
    description: "生物信息学职业规划和发展",
    icon: Psychology,
    color: "#795548",
    post_count: 23,
    last_post: {
      title: "生物信息学就业前景分析",
      author: "CareerGuide",
      time: "1周前",
    },
  },
  {
    id: "news",
    name: "行业资讯",
    description: "最新的生物信息学新闻和动态",
    icon: TrendingUp,
    color: "#3F51B5",
    post_count: 34,
    last_post: {
      title: "2024年生物信息学发展趋势",
      author: "NewsReporter",
      time: "3天前",
    },
  },
];

// Sample posts
const SAMPLE_POSTS: ForumPost[] = [
  {
    id: "1",
    title: "欢迎来到OmicsAgent论坛！",
    content:
      "欢迎大家来到OmicsAgent论坛！这里是一个专门为生物信息学研究者打造的交流平台...",
    author: {
      id: "admin",
      name: "管理员",
      avatar: "/images/avatar/admin.png",
      role: "管理员",
    },
    category: "general",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    views: 1250,
    likes: 89,
    comments: 23,
    tags: ["欢迎", "公告"],
    is_pinned: true,
    is_locked: false,
  },
  {
    id: "2",
    title: "RNA-seq数据分析最佳实践",
    content:
      "分享一些RNA-seq数据分析的经验和最佳实践，包括质量控制、比对、定量等步骤...",
    author: {
      id: "bioexpert",
      name: "BioExpert",
      avatar: "/images/avatar/bioexpert.png",
      role: "专家",
    },
    category: "bioinformatics",
    created_at: "2024-01-14T15:30:00Z",
    updated_at: "2024-01-14T15:30:00Z",
    views: 567,
    likes: 45,
    comments: 12,
    tags: ["RNA-seq", "数据分析", "最佳实践"],
    is_pinned: false,
    is_locked: false,
  },
  {
    id: "3",
    title: "单细胞转录组分析流程",
    content:
      "详细介绍单细胞转录组分析的完整流程，从数据预处理到细胞类型鉴定...",
    author: {
      id: "singlecellpro",
      name: "SingleCellPro",
      avatar: "/images/avatar/singlecellpro.png",
      role: "高级用户",
    },
    category: "omics",
    created_at: "2024-01-13T09:15:00Z",
    updated_at: "2024-01-13T09:15:00Z",
    views: 423,
    likes: 38,
    comments: 8,
    tags: ["单细胞", "转录组", "分析流程"],
    is_pinned: false,
    is_locked: false,
  },
  {
    id: "4",
    title: "BWA比对参数优化",
    content: "讨论BWA比对工具的参数优化策略，提高比对准确性和效率...",
    author: {
      id: "toolmaster",
      name: "ToolMaster",
      avatar: "/images/avatar/toolmaster.png",
      role: "专家",
    },
    category: "tools",
    created_at: "2024-01-12T14:20:00Z",
    updated_at: "2024-01-12T14:20:00Z",
    views: 298,
    likes: 25,
    comments: 6,
    tags: ["BWA", "比对", "参数优化"],
    is_pinned: false,
    is_locked: false,
  },
  {
    id: "5",
    title: "TCGA数据下载和预处理",
    content:
      "分享TCGA数据库的数据下载方法和预处理步骤，包括数据格式转换和质量控制...",
    author: {
      id: "datahunter",
      name: "DataHunter",
      avatar: "/images/avatar/datahunter.png",
      role: "高级用户",
    },
    category: "databases",
    created_at: "2024-01-11T11:45:00Z",
    updated_at: "2024-01-11T11:45:00Z",
    views: 189,
    likes: 17,
    comments: 4,
    tags: ["TCGA", "数据下载", "预处理"],
    is_pinned: false,
    is_locked: false,
  },
];

export default function ForumPage() {
  const router = useRouter();

  // State management
  const [categories, setCategories] =
    useState<ForumCategory[]>(FORUM_CATEGORIES);
  const [posts, setPosts] = useState<ForumPost[]>(SAMPLE_POSTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "most_commented">(
    "latest"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // Filter posts based on search and category
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === null || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      case "popular":
        return b.views - a.views;
      case "most_commented":
        return b.comments - a.comments;
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = sortedPosts.slice(
    startIndex,
    startIndex + postsPerPage
  );

  // Handle post click
  const handlePostClick = (postId: string) => {
    router.push(`/forum/post/${postId}`);
  };

  // Handle category click
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    setCurrentPage(1);
  };

  // Handle create post
  const handleCreatePost = () => {
    router.push("/forum/create");
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "刚刚";
    if (diffInHours < 24) return `${diffInHours}小时前`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}天前`;
    // 使用固定的格式化选项，避免 SSR/客户端不一致
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Typography variant="h4" fontWeight={700} color="primary">
              论坛
            </Typography>
            <Button
              variant="contained"
              startIcon={<PostAdd />}
              onClick={handleCreatePost}
              sx={{ borderRadius: 2 }}
            >
              发布新帖
            </Button>
          </Stack>

          {/* Search and filters */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <TextField
              placeholder="搜索帖子..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, maxWidth: 400 }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() =>
                setSortBy(
                  sortBy === "latest"
                    ? "popular"
                    : sortBy === "popular"
                    ? "most_commented"
                    : "latest"
                )
              }
            >
              {sortBy === "latest"
                ? "最新"
                : sortBy === "popular"
                ? "热门"
                : "最多评论"}
            </Button>
          </Stack>
        </Box>

        {/* Categories grid */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={category.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    border: selectedCategory === category.id ? 2 : 1,
                    borderColor:
                      selectedCategory === category.id
                        ? category.color
                        : "divider",
                    "&:hover": {
                      boxShadow: 3,
                      borderColor: category.color,
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.2s ease-in-out",
                    height: "100%",
                  }}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Stack alignItems="center" spacing={2} textAlign="center">
                      <category.icon
                        sx={{ color: category.color, fontSize: 32 }}
                      />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {category.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {category.description}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <Chip
                            label={`${category.post_count} 帖子`}
                            size="small"
                            variant="outlined"
                          />
                          {category.last_post && (
                            <Chip
                              label={`最新: ${category.last_post.time}`}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Posts list */}
        <Paper sx={{ p: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Typography variant="h6">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name +
                  " 帖子"
                : "最新帖子"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              共 {filteredPosts.length} 个帖子
            </Typography>
          </Stack>

          <Stack spacing={2}>
            {paginatedPosts.map((post) => (
              <Card
                key={post.id}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: 2,
                  },
                }}
                onClick={() => handlePostClick(post.id)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2}>
                    <Avatar
                      src={post.author.avatar}
                      sx={{ width: 48, height: 48 }}
                    >
                      {post.author.name.charAt(0)}
                    </Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ mb: 1 }}
                      >
                        {post.is_pinned && (
                          <Chip label="置顶" size="small" color="primary" />
                        )}
                        {post.is_locked && (
                          <Chip label="锁定" size="small" color="error" />
                        )}
                        <Typography variant="h6" fontWeight={600}>
                          {post.title}
                        </Typography>
                      </Stack>

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
                        {post.content}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        {post.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                          {post.author.name} • {post.author.role}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(post.updated_at)}
                        </Typography>
                      </Stack>
                    </Box>

                    <Stack direction="row" spacing={3} alignItems="center">
                      <Stack alignItems="center" spacing={0.5}>
                        <Visibility
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {post.views}
                        </Typography>
                      </Stack>
                      <Stack alignItems="center" spacing={0.5}>
                        <ThumbUp
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {post.likes}
                        </Typography>
                      </Stack>
                      <Stack alignItems="center" spacing={0.5}>
                        <Comment
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {post.comments}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
