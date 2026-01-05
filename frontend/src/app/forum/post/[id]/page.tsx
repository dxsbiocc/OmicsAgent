"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Avatar,
  Chip,
  IconButton,
  Button,
  Divider,
  TextField,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Badge,
  Grid,
} from "@mui/material";
import {
  ArrowBack,
  ThumbUp,
  ThumbDown,
  Comment,
  Share,
  BookmarkBorder,
  Bookmark,
  Reply,
  Edit,
  Delete,
  MoreVert,
  Person,
  Schedule,
  Visibility,
  Flag,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Types
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
    join_date: string;
    post_count: number;
  };
  category: string;
  created_at: string;
  updated_at: string;
  views: number;
  likes: number;
  dislikes: number;
  comments: Comment[];
  tags: string[];
  is_pinned: boolean;
  is_locked: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  created_at: string;
  updated_at: string;
  likes: number;
  dislikes: number;
  replies: Comment[];
  is_solution?: boolean;
}

// Sample data
const SAMPLE_POST: ForumPost = {
  id: "1",
  title: "RNA-seq数据分析最佳实践",
  content: `# RNA-seq数据分析最佳实践

## 简介
RNA-seq（RNA sequencing）是研究基因表达的重要技术。本文将分享一些RNA-seq数据分析的经验和最佳实践。

## 数据质量控制

### 1. 原始数据质量评估
在进行任何分析之前，首先需要评估原始测序数据的质量：

\`\`\`bash
# 使用FastQC进行质量评估
fastqc sample.fastq.gz

# 使用MultiQC整合多个样本的质量报告
multiqc .
\`\`\`

### 2. 质量过滤
根据质量评估结果，对原始数据进行过滤：

\`\`\`bash
# 使用Trimmomatic进行质量过滤
trimmomatic PE -threads 8 \\
  sample_R1.fastq.gz sample_R2.fastq.gz \\
  sample_R1_clean.fastq.gz sample_R1_unpaired.fastq.gz \\
  sample_R2_clean.fastq.gz sample_R2_unpaired.fastq.gz \\
  ILLUMINACLIP:TruSeq3-PE.fa:2:30:10 \\
  LEADING:3 TRAILING:3 SLIDINGWINDOW:4:15 MINLEN:36
\`\`\`

## 比对和定量

### 1. 参考基因组比对
推荐使用HISAT2进行比对：

\`\`\`bash
# 构建索引
hisat2-build reference.fa reference_index

# 进行比对
hisat2 -x reference_index \\
  -1 sample_R1_clean.fastq.gz \\
  -2 sample_R2_clean.fastq.gz \\
  -S sample.sam
\`\`\`

### 2. 基因表达定量
使用StringTie进行基因表达定量：

\`\`\`bash
# 定量
stringtie sample.sam -G annotation.gtf -o sample.gtf

# 合并所有样本的转录本
stringtie --merge -G annotation.gtf -o merged.gtf sample_list.txt

# 重新定量
stringtie sample.sam -G merged.gtf -o sample_final.gtf
\`\`\`

## 差异表达分析

### 1. 使用DESeq2
\`\`\`r
library(DESeq2)

# 读取数据
countData <- read.table("count_matrix.txt", header=TRUE, row.names=1)
colData <- read.table("sample_info.txt", header=TRUE, row.names=1)

# 创建DESeqDataSet对象
dds <- DESeqDataSetFromMatrix(countData = countData,
                              colData = colData,
                              design = ~ condition)

# 进行差异表达分析
dds <- DESeq(dds)
results <- results(dds)

# 查看结果
head(results)
\`\`\`

### 2. 结果可视化
\`\`\`r
# 火山图
library(EnhancedVolcano)
EnhancedVolcano(results,
                lab = rownames(results),
                x = 'log2FoldChange',
                y = 'pvalue')

# MA图
plotMA(results)
\`\`\`

## 功能富集分析

### 1. GO富集分析
\`\`\`r
library(clusterProfiler)
library(org.Hs.eg.db)

# 转换基因ID
gene_ids <- bitr(rownames(results), fromType="ENSEMBL", toType="ENTREZID", OrgDb="org.Hs.eg.db")

# GO富集分析
ego <- enrichGO(gene = gene_ids$ENTREZID,
                OrgDb = org.Hs.eg.db,
                ont = "BP",
                pAdjustMethod = "BH",
                pvalueCutoff = 0.05,
                qvalueCutoff = 0.05)

# 可视化
dotplot(ego)
\`\`\`

## 注意事项

1. **样本数量**: 建议每组至少3个生物学重复
2. **测序深度**: 通常需要20-30M reads per sample
3. **批次效应**: 注意控制实验批次效应
4. **统计方法**: 选择合适的统计方法进行多重比较校正

## 总结

RNA-seq数据分析是一个复杂的过程，需要仔细的质量控制和统计分析。希望这些经验对大家有帮助！

有什么问题欢迎在评论区讨论。`,
  author: {
    id: "bioexpert",
    name: "BioExpert",
    avatar: "/images/avatar/bioexpert.png",
    role: "专家",
    join_date: "2023-01-15",
    post_count: 156,
  },
  category: "bioinformatics",
  created_at: "2024-01-14T15:30:00Z",
  updated_at: "2024-01-14T15:30:00Z",
  views: 1250,
  likes: 89,
  dislikes: 2,
  comments: [
    {
      id: "1",
      content: "非常详细的教程！请问对于初学者来说，推荐从哪个工具开始学习？",
      author: {
        id: "newbie",
        name: "BioNewbie",
        avatar: "/images/avatar/newbie.png",
        role: "新手",
      },
      created_at: "2024-01-14T16:00:00Z",
      updated_at: "2024-01-14T16:00:00Z",
      likes: 12,
      dislikes: 0,
      replies: [],
    },
    {
      id: "2",
      content: "建议从FastQC和Trimmomatic开始，这两个工具相对简单，容易上手。",
      author: {
        id: "bioexpert",
        name: "BioExpert",
        avatar: "/images/avatar/bioexpert.png",
        role: "专家",
      },
      created_at: "2024-01-14T16:15:00Z",
      updated_at: "2024-01-14T16:15:00Z",
      likes: 8,
      dislikes: 0,
      replies: [],
      is_solution: true,
    },
    {
      id: "3",
      content: "感谢分享！请问在DESeq2分析中，如何选择合适的p值阈值？",
      author: {
        id: "researcher",
        name: "Researcher",
        avatar: "/images/avatar/researcher.png",
        role: "研究员",
      },
      created_at: "2024-01-14T17:00:00Z",
      updated_at: "2024-01-14T17:00:00Z",
      likes: 5,
      dislikes: 0,
      replies: [
        {
          id: "3-1",
          content: "通常使用FDR < 0.05作为阈值，但也要结合生物学意义来考虑。",
          author: {
            id: "bioexpert",
            name: "BioExpert",
            avatar: "/images/avatar/bioexpert.png",
            role: "专家",
          },
          created_at: "2024-01-14T17:10:00Z",
          updated_at: "2024-01-14T17:10:00Z",
          likes: 3,
          dislikes: 0,
          replies: [],
        },
      ],
    },
  ],
  tags: ["RNA-seq", "数据分析", "最佳实践", "DESeq2", "生物信息学"],
  is_pinned: false,
  is_locked: false,
};

export default function ForumPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  // State management
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Load post data
  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setPost(SAMPLE_POST);
      } catch (err) {
        setError("加载帖子失败");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    // 使用固定的格式化选项，避免 SSR/客户端不一致
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle like
  const handleLike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    }
    setIsLiked(!isLiked);
  };

  // Handle dislike
  const handleDislike = () => {
    if (isLiked) {
      setIsLiked(false);
    }
    setIsDisliked(!isDisliked);
  };

  // Handle bookmark
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  // Handle comment submit
  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      // Here you would submit the comment to the API
      console.log("New comment:", newComment);
      setNewComment("");
      setReplyingTo(null);
    }
  };

  // Handle reply
  const handleReply = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

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
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>加载帖子中...</Typography>
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "帖子不存在"}
        </Alert>
        <Button onClick={() => router.back()}>返回</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" fontWeight={700}>
            {post.title}
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {/* Main content */}
          <Grid sx={{ xs: 12, md: 8 }}>
            {/* Post content */}
            <Paper sx={{ p: 3, mb: 3 }}>
              {/* Post header */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Avatar src={post.author.avatar} sx={{ width: 48, height: 48 }}>
                  {post.author.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {post.author.name}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={post.author.role}
                      size="small"
                      color="primary"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {post.author.post_count} 帖子
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • 加入于 {new Date(post.author.join_date).getFullYear()}
                    </Typography>
                  </Stack>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {formatTime(post.created_at)}
                </Typography>
              </Stack>

              {/* Tags */}
              <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                {post.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Stack>

              {/* Post content */}
              <Box sx={{ mb: 3 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content}
                </ReactMarkdown>
              </Box>

              {/* Post actions */}
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant={isLiked ? "contained" : "outlined"}
                  startIcon={<ThumbUp />}
                  onClick={handleLike}
                  color={isLiked ? "primary" : "inherit"}
                >
                  {post.likes + (isLiked ? 1 : 0)}
                </Button>
                <Button
                  variant={isDisliked ? "contained" : "outlined"}
                  startIcon={<ThumbDown />}
                  onClick={handleDislike}
                  color={isDisliked ? "error" : "inherit"}
                >
                  {post.dislikes + (isDisliked ? 1 : 0)}
                </Button>
                <IconButton
                  onClick={handleBookmark}
                  color={isBookmarked ? "primary" : "default"}
                >
                  {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
                <Button variant="outlined" startIcon={<Share />}>
                  分享
                </Button>
                <Button variant="outlined" startIcon={<Flag />}>
                  举报
                </Button>
              </Stack>
            </Paper>

            {/* Comments */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                评论 ({post.comments.length})
              </Typography>

              {/* Comment form */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="写下你的评论..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim()}
                  >
                    发表评论
                  </Button>
                </Stack>
              </Box>

              {/* Comments list */}
              <Stack spacing={2}>
                {post.comments.map((comment) => (
                  <Card key={comment.id} variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" spacing={2}>
                        <Avatar
                          src={comment.author.avatar}
                          sx={{ width: 32, height: 32 }}
                        >
                          {comment.author.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{ mb: 1 }}
                          >
                            <Typography variant="subtitle2" fontWeight={600}>
                              {comment.author.name}
                            </Typography>
                            <Chip label={comment.author.role} size="small" />
                            {comment.is_solution && (
                              <Chip
                                label="最佳答案"
                                size="small"
                                color="success"
                              />
                            )}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatTime(comment.created_at)}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {comment.content}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Button size="small" startIcon={<ThumbUp />}>
                              {comment.likes}
                            </Button>
                            <Button size="small" startIcon={<ThumbDown />}>
                              {comment.dislikes}
                            </Button>
                            <Button
                              size="small"
                              startIcon={<Reply />}
                              onClick={() => handleReply(comment.id)}
                            >
                              回复
                            </Button>
                          </Stack>

                          {/* Replies */}
                          {comment.replies.length > 0 && (
                            <Box sx={{ ml: 4, mt: 2 }}>
                              <Stack spacing={1}>
                                {comment.replies.map((reply) => (
                                  <Card
                                    key={reply.id}
                                    variant="outlined"
                                    sx={{ bgcolor: "background.default" }}
                                  >
                                    <CardContent sx={{ p: 2 }}>
                                      <Stack direction="row" spacing={2}>
                                        <Avatar
                                          src={reply.author.avatar}
                                          sx={{ width: 24, height: 24 }}
                                        >
                                          {reply.author.name.charAt(0)}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                          <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={1}
                                            sx={{ mb: 1 }}
                                          >
                                            <Typography
                                              variant="caption"
                                              fontWeight={600}
                                            >
                                              {reply.author.name}
                                            </Typography>
                                            <Chip
                                              label={reply.author.role}
                                              size="small"
                                            />
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              {formatTime(reply.created_at)}
                                            </Typography>
                                          </Stack>
                                          <Typography variant="body2">
                                            {reply.content}
                                          </Typography>
                                        </Box>
                                      </Stack>
                                    </CardContent>
                                  </Card>
                                ))}
                              </Stack>
                            </Box>
                          )}

                          {/* Reply form */}
                          {replyingTo === comment.id && (
                            <Box sx={{ ml: 4, mt: 2 }}>
                              <TextField
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="回复评论..."
                                sx={{ mb: 1 }}
                              />
                              <Stack
                                direction="row"
                                justifyContent="flex-end"
                                spacing={1}
                              >
                                <Button
                                  size="small"
                                  onClick={() => setReplyingTo(null)}
                                >
                                  取消
                                </Button>
                                <Button size="small" variant="contained">
                                  回复
                                </Button>
                              </Stack>
                            </Box>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid sx={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              {/* Post stats */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  帖子统计
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">浏览数</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {post.views}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">点赞数</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {post.likes}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">评论数</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {post.comments.length}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              {/* Author info */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  作者信息
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={post.author.avatar}
                    sx={{ width: 48, height: 48 }}
                  >
                    {post.author.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {post.author.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {post.author.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {post.author.post_count} 个帖子
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Related posts */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  相关帖子
                </Typography>
                <Stack spacing={1}>
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ cursor: "pointer" }}
                  >
                    • 单细胞转录组分析流程
                  </Typography>
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ cursor: "pointer" }}
                  >
                    • DESeq2使用技巧
                  </Typography>
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ cursor: "pointer" }}
                  >
                    • 生物信息学入门指南
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
