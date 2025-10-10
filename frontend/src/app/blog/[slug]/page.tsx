"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Stack,
  IconButton,
  Divider,
  Paper,
  Card,
  CardContent,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Comment as CommentIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";
import { blogApi } from "@/libs/api/blog";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  generateAvatarFromUsername,
  getDefaultAvatar,
} from "@/utils/randomAssets";
import { getFullImageUrl } from "@/utils/url";
import { validateComment } from "@/utils/validation";
import type { BlogPostResponse } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Element } from "react-scroll";
import TableOfContents from "@/components/blog/TableOfContents";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuthContext();

  const [blogPost, setBlogPost] = useState<BlogPostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);

  // 评论相关状态
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning"
  >("success");

  // 删除相关状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 加载博客详情 - 无需登录即可查看
  const loadBlogPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const post = await blogApi.getBlogPostBySlug(slug);
      setBlogPost(post);
      setLikesCount(post.like_count);
      setFavoritesCount(post.favorite_count);
      setCommentsCount(post.comment_count);
    } catch (err: any) {
      console.error("加载博客失败:", err);
      setError(err.message || "加载博客失败");
    } finally {
      setLoading(false);
    }
  };

  // 点赞/取消点赞
  const handleLike = async () => {
    if (!blogPost || !user) return;

    try {
      if (isLiked) {
        await blogApi.unlikeBlogPost(blogPost.id);
        setLikesCount((prev) => prev - 1);
      } else {
        await blogApi.likeBlogPost(blogPost.id);
        setLikesCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (err: any) {
      console.error("点赞操作失败:", err);
      // 如果是401错误，提示用户登录
      if (err.message === "请先登录") {
        setSnackbarMessage("请先登录后再点赞");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setSnackbarMessage("操作失败，请重试");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };

  // 收藏/取消收藏
  const handleFavorite = async () => {
    if (!blogPost || !user) return;

    try {
      if (isFavorited) {
        await blogApi.unfavoriteBlogPost(blogPost.id);
        setFavoritesCount((prev) => prev - 1);
      } else {
        await blogApi.favoriteBlogPost(blogPost.id);
        setFavoritesCount((prev) => prev + 1);
      }
      setIsFavorited(!isFavorited);
    } catch (err: any) {
      console.error("收藏操作失败:", err);
      // 如果是401错误，提示用户登录
      if (err.message === "请先登录") {
        setSnackbarMessage("请先登录后再收藏");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setSnackbarMessage("操作失败，请重试");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };

  // 提交评论
  const handleSubmitComment = async () => {
    if (!blogPost || !user) return;

    // 校验评论内容
    const validation = validateComment(newComment);
    if (!validation.isValid) {
      setCommentError(validation.errors[0]);
      return;
    }

    try {
      setSubmittingComment(true);
      await blogApi.createComment(blogPost.id, { content: newComment.trim() });
      setNewComment("");
      setCommentsCount((prev) => prev + 1);
      setSnackbarMessage("评论发表成功");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error("发表评论失败:", err);
      // 如果是401错误，提示用户登录
      if (err.message === "请先登录") {
        setSnackbarMessage("请先登录后再发表评论");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setSnackbarMessage("发表评论失败，请重试");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  // 删除博客
  const handleDeleteBlog = async () => {
    if (!blogPost || !user) return;

    try {
      setDeleting(true);
      await blogApi.deleteBlogPost(blogPost.id);
      setSnackbarMessage("博客删除成功");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);

      // 延迟跳转到博客列表页面
      setTimeout(() => {
        router.push("/blog");
      }, 1500);
    } catch (err: any) {
      console.error("删除博客失败:", err);
      setSnackbarMessage("删除博客失败，请重试");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setDeleting(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 计算字数
  const getWordCount = (content: string) => {
    return content.replace(/\s/g, "").length;
  };

  useEffect(() => {
    if (slug) {
      loadBlogPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{ py: 4, px: { xs: 2, sm: 3, md: 4, lg: 6 } }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !blogPost) {
    return (
      <Container
        maxWidth="lg"
        sx={{ py: 4, px: { xs: 2, sm: 3, md: 4, lg: 6 } }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "博客不存在"}
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,rgb(174, 236, 209) 0%,rgb(77, 198, 164) 100%)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          zIndex: 0,
        },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          px: { xs: 2, sm: 3, md: 4, lg: 6 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 4 }}>
          {/* 左侧目录 */}
          <Box
            sx={{
              width: "25%",
              minWidth: "250px",
              maxWidth: "300px",
              flexShrink: 0,
              display: { xs: "none", md: "block" },
            }}
          >
            <TableOfContents content={blogPost?.content || ""} />
          </Box>

          {/* 右侧内容 */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            {/* 背景图片和标题区域 */}
            <Paper
              elevation={0}
              sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                mb: 4,
                minHeight: "400px",
                backgroundImage: `url(${getFullImageUrl(
                  blogPost.background_image_url,
                  "/images/background/placeholder/combine2.svg"
                )})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(5px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* 遮罩层 */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  zIndex: 1,
                }}
              />

              {/* 编辑和删除按钮 - 只有管理员可见 */}
              {user && user.is_admin && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    zIndex: 3,
                    display: "flex",
                    gap: 1,
                  }}
                >
                  {/* 编辑按钮 */}
                  <IconButton
                    onClick={() =>
                      router.push(`/blog/create?edit=${blogPost?.id}`)
                    }
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      color: "primary.main",
                      "&:hover": {
                        backgroundColor: "white",
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    }}
                    size="large"
                  >
                    <EditIcon />
                  </IconButton>

                  {/* 删除按钮 */}
                  <IconButton
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      color: "error.main",
                      "&:hover": {
                        backgroundColor: "white",
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    }}
                    size="large"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}

              {/* 内容 */}
              <Box
                sx={{
                  position: "relative",
                  zIndex: 2,
                  textAlign: "center",
                  p: 4,
                }}
              >
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    mb: 2,
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {blogPost.title}
                </Typography>

                {/* 作者信息 */}
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Avatar
                    src={
                      blogPost.author_avatar_url ||
                      (blogPost.author_username
                        ? generateAvatarFromUsername(blogPost.author_username, {
                            size: 40,
                          })
                        : getDefaultAvatar({ size: 40 }))
                    }
                    sx={{ width: 40, height: 40 }}
                  >
                    {blogPost.author_username?.[0]?.toUpperCase()}
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "white",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                    }}
                  >
                    {blogPost.author_username || "匿名用户"}
                  </Typography>
                </Stack>

                {/* 元信息 */}
                <Stack
                  direction="row"
                  spacing={3}
                  justifyContent="center"
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarIcon sx={{ color: "white", fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "white",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                      }}
                    >
                      {formatDate(blogPost.created_at)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <TimeIcon sx={{ color: "white", fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "white",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                      }}
                    >
                      字数 {getWordCount(blogPost.content)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <VisibilityIcon
                      sx={{ color: "success.light", fontSize: 20 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "white",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                      }}
                    >
                      阅读 {blogPost.view_count}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Paper>

            {/* 博客内容 */}
            <Element name="blog-content">
              <Paper
                elevation={1}
                sx={{
                  p: 4,
                  mb: 4,
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => {
                      const text =
                        typeof children === "string"
                          ? children
                          : children?.toString() || "";
                      let id = text
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/^-+|-+$/g, ""); // 移除开头和结尾的连字符

                      // 确保 ID 不为空，使用固定的前缀而不是时间戳
                      if (!id) {
                        id = `heading-1`;
                      }

                      return (
                        <Typography
                          id={id}
                          variant="h4"
                          component="h1"
                          gutterBottom
                          sx={{ mt: 3, mb: 2 }}
                        >
                          {children}
                        </Typography>
                      );
                    },
                    h2: ({ children }) => {
                      const text =
                        typeof children === "string"
                          ? children
                          : children?.toString() || "";
                      let id = text
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/^-+|-+$/g, ""); // 移除开头和结尾的连字符

                      // 确保 ID 不为空
                      if (!id) {
                        id = `heading-${Math.random()
                          .toString(36)
                          .substr(2, 9)}`;
                      }

                      return (
                        <Typography
                          id={id}
                          variant="h5"
                          component="h2"
                          gutterBottom
                          sx={{ mt: 3, mb: 2 }}
                        >
                          {children}
                        </Typography>
                      );
                    },
                    h3: ({ children }) => {
                      const text =
                        typeof children === "string"
                          ? children
                          : children?.toString() || "";
                      let id = text
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/^-+|-+$/g, ""); // 移除开头和结尾的连字符

                      // 确保 ID 不为空
                      if (!id) {
                        id = `heading-${Math.random()
                          .toString(36)
                          .substr(2, 9)}`;
                      }

                      return (
                        <Typography
                          id={id}
                          variant="h6"
                          component="h3"
                          gutterBottom
                          sx={{ mt: 2, mb: 1 }}
                        >
                          {children}
                        </Typography>
                      );
                    },
                    h4: ({ children }) => {
                      const text =
                        typeof children === "string"
                          ? children
                          : children?.toString() || "";
                      let id = text
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/^-+|-+$/g, ""); // 移除开头和结尾的连字符

                      // 确保 ID 不为空
                      if (!id) {
                        id = `heading-${Math.random()
                          .toString(36)
                          .substr(2, 9)}`;
                      }

                      return (
                        <Typography
                          id={id}
                          variant="subtitle1"
                          component="h4"
                          gutterBottom
                          sx={{ mt: 2, mb: 1, fontWeight: 600 }}
                        >
                          {children}
                        </Typography>
                      );
                    },
                    h5: ({ children }) => {
                      const text =
                        typeof children === "string"
                          ? children
                          : children?.toString() || "";
                      let id = text
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/^-+|-+$/g, ""); // 移除开头和结尾的连字符

                      // 确保 ID 不为空
                      if (!id) {
                        id = `heading-${Math.random()
                          .toString(36)
                          .substr(2, 9)}`;
                      }

                      return (
                        <Typography
                          id={id}
                          variant="subtitle2"
                          component="h5"
                          gutterBottom
                          sx={{ mt: 2, mb: 1, fontWeight: 600 }}
                        >
                          {children}
                        </Typography>
                      );
                    },
                    h6: ({ children }) => {
                      const text =
                        typeof children === "string"
                          ? children
                          : children?.toString() || "";
                      let id = text
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/^-+|-+$/g, ""); // 移除开头和结尾的连字符

                      // 确保 ID 不为空
                      if (!id) {
                        id = `heading-${Math.random()
                          .toString(36)
                          .substr(2, 9)}`;
                      }

                      return (
                        <Typography
                          id={id}
                          variant="subtitle2"
                          component="h6"
                          gutterBottom
                          sx={{ mt: 2, mb: 1, fontWeight: 600 }}
                        >
                          {children}
                        </Typography>
                      );
                    },
                    p: ({ children }) => (
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ lineHeight: 1.8 }}
                      >
                        {children}
                      </Typography>
                    ),
                    code: ({ children }) => (
                      <Box
                        component="code"
                        sx={{
                          backgroundColor: "grey.100",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontFamily: "monospace",
                          fontSize: "0.9em",
                        }}
                      >
                        {children}
                      </Box>
                    ),
                    pre: ({ children }) => (
                      <Box
                        component="pre"
                        sx={{
                          backgroundColor: "grey.100",
                          p: 2,
                          borderRadius: 1,
                          overflow: "auto",
                          fontFamily: "monospace",
                          fontSize: "0.9em",
                        }}
                      >
                        {children}
                      </Box>
                    ),
                  }}
                >
                  {blogPost.content}
                </ReactMarkdown>
              </Paper>
            </Element>

            {/* 互动区域 */}
            <Paper
              elevation={1}
              sx={{
                p: 3,
                mb: 4,
                bgcolor: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Stack spacing={3} alignItems="center">
                {/* 点赞和收藏按钮 - 中间 */}
                <Stack direction="row" spacing={2}>
                  <Button
                    variant={isLiked ? "contained" : "outlined"}
                    startIcon={
                      isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />
                    }
                    onClick={handleLike}
                    disabled={!user}
                    color="error"
                    sx={{
                      "&:hover": {
                        backgroundColor: isLiked ? "error.dark" : "error.light",
                        color: "white",
                      },
                    }}
                  >
                    点赞 ({likesCount})
                  </Button>

                  <Button
                    variant={isFavorited ? "contained" : "outlined"}
                    startIcon={
                      isFavorited ? <BookmarkIcon /> : <BookmarkBorderIcon />
                    }
                    onClick={handleFavorite}
                    disabled={!user}
                    color="error"
                    sx={{
                      "&:hover": {
                        backgroundColor: isFavorited
                          ? "error.dark"
                          : "error.light",
                        color: "white",
                      },
                    }}
                  >
                    收藏 ({favoritesCount})
                  </Button>
                </Stack>

                {/* 统计数据 - 评论数、点赞数、观看数 */}
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Chip
                    icon={<VisibilityIcon />}
                    label={`${blogPost.view_count} 次阅读`}
                    variant="outlined"
                    sx={{
                      borderColor: "success.light",
                      color: "success.light",
                      "& .MuiChip-icon": {
                        color: "success.light",
                      },
                      "&:hover": {
                        backgroundColor: "success.light",
                        color: "white",
                        "& .MuiChip-icon": {
                          color: "white",
                        },
                      },
                    }}
                  />
                  <Chip
                    icon={<CommentIcon />}
                    label={`${commentsCount} 条评论`}
                    variant="outlined"
                    sx={{
                      borderColor: "secondary.light",
                      color: "secondary.light",
                      "& .MuiChip-icon": {
                        color: "secondary.light",
                      },
                      "&:hover": {
                        backgroundColor: "secondary.light",
                        color: "white",
                        "& .MuiChip-icon": {
                          color: "white",
                        },
                      },
                    }}
                  />
                  <Chip
                    icon={<FavoriteIcon />}
                    label={`${likesCount} 个赞`}
                    variant="outlined"
                    sx={{
                      borderColor: "error.light",
                      color: "error.light",
                      "& .MuiChip-icon": {
                        color: "error.light",
                      },
                      "&:hover": {
                        backgroundColor: "error.light",
                        color: "white",
                        "& .MuiChip-icon": {
                          color: "white",
                        },
                      },
                    }}
                  />
                </Stack>
              </Stack>
            </Paper>

            {/* 评论区域 */}
            {blogPost.comments_enabled && (
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  bgcolor: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Typography variant="h6" gutterBottom>
                  评论 ({commentsCount})
                </Typography>

                {/* 发表评论 */}
                {user && (
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="写下你的评论..."
                      value={newComment}
                      onChange={(e) => {
                        setNewComment(e.target.value);
                        // 清除错误信息
                        if (commentError) {
                          setCommentError("");
                        }
                      }}
                      onBlur={() => {
                        const result = validateComment(newComment);
                        if (!result.isValid) {
                          setCommentError(result.errors[0]);
                        } else {
                          setCommentError("");
                        }
                      }}
                      error={!!commentError}
                      helperText={commentError}
                      sx={{ mb: 2 }}
                    />
                    <Stack direction="row" justifyContent="flex-end">
                      <Button
                        variant="contained"
                        onClick={handleSubmitComment}
                        disabled={
                          !newComment.trim() ||
                          submittingComment ||
                          !!commentError
                        }
                        startIcon={
                          submittingComment ? (
                            <CircularProgress size={20} />
                          ) : (
                            <CommentIcon sx={{ color: "secondary.light" }} />
                          )
                        }
                      >
                        {submittingComment ? "发表中..." : "发表评论"}
                      </Button>
                    </Stack>
                  </Box>
                )}

                {/* 评论列表 */}
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ py: 4 }}
                  >
                    评论功能开发中...
                  </Typography>
                </Box>
              </Paper>
            )}

            {/* 删除确认对话框 */}
            <Dialog
              open={deleteDialogOpen}
              onClose={deleting ? undefined : () => setDeleteDialogOpen(false)}
              aria-labelledby="delete-dialog-title"
              aria-describedby="delete-dialog-description"
              disableEscapeKeyDown={deleting}
              keepMounted={false}
            >
              <DialogTitle id="delete-dialog-title">确认删除博客</DialogTitle>
              <DialogContent>
                <DialogContentText id="delete-dialog-description">
                  您确定要删除博客《{blogPost?.title}》吗？此操作不可撤销。
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleting}
                >
                  取消
                </Button>
                <Button
                  onClick={handleDeleteBlog}
                  color="error"
                  variant="contained"
                  disabled={deleting}
                  startIcon={
                    deleting ? <CircularProgress size={20} /> : <DeleteIcon />
                  }
                >
                  {deleting ? "删除中..." : "确认删除"}
                </Button>
              </DialogActions>
            </Dialog>

            {/* 消息提示 */}
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={3000}
              onClose={() => setSnackbarOpen(false)}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              disableWindowBlurListener
            >
              <Alert
                onClose={() => setSnackbarOpen(false)}
                severity={snackbarSeverity}
                sx={{ width: "100%" }}
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
