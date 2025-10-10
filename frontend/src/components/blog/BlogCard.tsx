"use client";

import { useRef } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Avatar,
  Stack,
  Box,
  Chip,
  Badge,
} from "@mui/material";
import Link from "next/link";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CommentIcon from "@mui/icons-material/Comment";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CategoryIcon from "@mui/icons-material/Category";
import HTMLFlipBook from "react-pageflip";
import animStyles from "../../../styles/blog/blog-animations.module.css";
import { useRouter } from "next/navigation";
import type { BlogPostResponse, Tag, Category } from "../../types";
import { getFullImageUrl } from "../../utils/url";

interface BlogCardProps {
  post: BlogPostResponse | null | undefined;
  showCategory?: boolean;
  showTags?: boolean;
  showStats?: boolean;
}

export default function BlogCard({
  post,
  showCategory = true,
  showTags = true,
  showStats = true,
}: BlogCardProps) {
  const flipBookRef = useRef<any>(null);
  const router = useRouter();

  // 检查 post 是否存在
  if (!post) {
    return (
      <Card
        sx={{
          height: 430,
          width: 360,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          博客数据加载中...
        </Typography>
      </Card>
    );
  }

  const handleFlip = (_e: any) => {
    // 检查 flipBookRef 是否存在且已初始化
    if (flipBookRef.current && flipBookRef.current.pageFlip) {
      flipBookRef.current.pageFlip().flip(0);
    }
    router.push(`/blog/${post.slug}`);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 获取作者头像
  const getAuthorAvatar = (post: BlogPostResponse | null | undefined) => {
    // 优先使用后端提供的头像URL
    if (post?.author_avatar_url) {
      return post.author_avatar_url;
    }

    // 如果没有头像，使用用户名生成默认头像
    if (post?.author_username) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        post.author_username
      )}&background=random&color=fff&size=48`;
    }

    // 默认头像
    return `https://ui-avatars.com/api/?name=User&background=random&color=fff&size=48`;
  };

  // 创建卡片内容组件
  const CardContentComponent = () => (
    <Card
      className={animStyles.cardHover}
      sx={{
        height: 430,
        width: 360,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
        transition: "all 0.3s linear",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
          "& .card-image": {
            transform: "scale(1.03)",
          },
          "& .card-title": {
            color: "primary.main",
          },
        },
      }}
      // onClick={handleFlipNext}
    >
      {/* 固定高度的图片区域 */}
      <CardMedia
        component="img"
        height="180"
        image={getFullImageUrl(
          post.background_image_url,
          "/images/background/placeholder/combine2.svg"
        )}
        alt={post.title}
        className="card-image"
        sx={{
          objectFit: "cover",
          flexShrink: 0,
          transition: "transform 0.3s linear",
        }}
      />

      {/* 固定高度的内容区域 */}
      <CardContent
        sx={{
          height: 180,
          p: 2,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        {/* 固定高度的标题区域 */}
        <Box sx={{ height: 48, mb: 1.2 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            className="card-title"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.2,
              fontSize: "1.3rem",
              transition: "color 0.3s linear",
            }}
          >
            {post.title}
          </Typography>
        </Box>

        {/* 固定高度的描述区域 */}
        <Box sx={{ height: 70, mb: 1.2 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.5,
              fontSize: "0.8rem",
            }}
          >
            {post.excerpt || "暂无摘要"}
          </Typography>
        </Box>

        {/* 固定高度的标签和分类区域 */}
        <Box sx={{ height: 28, mb: 0.5 }}>
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            sx={{ maxHeight: 28, overflow: "hidden" }}
          >
            {/* 分类标签 */}
            {showCategory && post.category_name && (
              <Chip
                icon={<CategoryIcon sx={{ fontSize: 16 }} />}
                label={post.category_name}
                size="small"
                variant="filled"
                color="primary"
                sx={{
                  fontSize: "0.75rem",
                  height: 24,
                  transition: "all 0.25s linear",
                  "& .MuiChip-label": { px: 1 },
                  "&:hover": {
                    backgroundColor: "primary.dark",
                    transform: "scale(1.02)",
                  },
                }}
              />
            )}

            {/* 标签 */}
            {showTags &&
              post.tags &&
              post.tags.slice(0, 2).map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "0.75rem",
                    height: 24,
                    transition: "all 0.25s linear",
                    "& .MuiChip-label": { px: 1 },
                    "&:hover": {
                      backgroundColor: "secondary.light",
                      color: "white",
                      transform: "scale(1.02)",
                    },
                  }}
                />
              ))}
          </Stack>
        </Box>
      </CardContent>

      {/* 固定高度的底部区域 */}
      <CardActions
        sx={{
          height: 70,
          p: 2,
          flexShrink: 0,
          alignItems: "center",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          {/* 作者信息区域 - 固定宽度 */}
          <Box
            sx={{
              width: 160,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar
                src={getAuthorAvatar(post)}
                sx={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  border: "2px solid",
                  borderColor: "primary.main",
                  transition: "all 0.3s linear",
                  "&:hover": {
                    transform: "scale(1.05)",
                    borderColor: "primary.dark",
                  },
                }}
              >
                {(post.author_username || "A")[0].toUpperCase()}
              </Avatar>
              <Box
                sx={{
                  minWidth: 100,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="caption"
                  display="block"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: 1.2,
                    mb: 1,
                  }}
                >
                  {post.author_username || "Anonymous"}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.7rem", lineHeight: 1.2 }}
                >
                  {post.published_at ? formatDate(post.published_at) : "未发布"}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* 统计数据区域 - 固定宽度 */}
          {showStats && (
            <Stack direction="row" spacing={1.2} sx={{ flexShrink: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <VisibilityIcon sx={{ fontSize: 20, color: "success.light" }} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.8rem" }}
                >
                  {post.view_count}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <CommentIcon sx={{ fontSize: 20, color: "secondary.light" }} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.8rem" }}
                >
                  {post.comment_count}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <FavoriteIcon sx={{ fontSize: 20, color: "error.light" }} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.8rem" }}
                >
                  {post.favorite_count}
                </Typography>
              </Stack>
            </Stack>
          )}
        </Stack>
      </CardActions>
    </Card>
  );

  return (
    <Link href={`/blog/${post.slug}`}>
      <HTMLFlipBook
        ref={flipBookRef}
        width={360}
        height={430}
        size="stretch"
        minWidth={360}
        maxWidth={360}
        minHeight={430}
        maxHeight={430}
        maxShadowOpacity={0.5}
        mobileScrollSupport={true}
        showCover={false}
        startPage={0}
        drawShadow={true}
        flippingTime={500}
        usePortrait={true}
        useMouseEvents={true}
        swipeDistance={30}
        clickEventForward={false}
        disableFlipByClick={false}
        startZIndex={0}
        autoSize={false}
        showPageCorners={true}
        className="blog-card-flipbook"
        onFlip={handleFlip}
        style={{
          margin: "0 auto",
          cursor: "pointer",
        }}
      >
        {/* 第2页：卡片内容（作为最后一页，点击向前翻） */}
        <div className="page">
          <CardContentComponent />
        </div>
        <div className="page">
          <CardContentComponent />
        </div>
      </HTMLFlipBook>
    </Link>
  );
}
