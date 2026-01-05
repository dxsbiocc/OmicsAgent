"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  ArrowBack,
  PostAdd,
  Tag,
  Category,
  Save,
  Preview,
} from "@mui/icons-material";

// Types
export interface CreatePostData {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

// Forum categories
const FORUM_CATEGORIES = [
  { id: "general", name: "综合讨论" },
  { id: "bioinformatics", name: "生物信息学" },
  { id: "omics", name: "组学分析" },
  { id: "tools", name: "工具使用" },
  { id: "databases", name: "数据库资源" },
  { id: "troubleshooting", name: "问题求助" },
  { id: "career", name: "职业发展" },
  { id: "news", name: "行业资讯" },
];

// Common tags
const COMMON_TAGS = [
  "RNA-seq",
  "DNA-seq",
  "单细胞",
  "转录组",
  "基因组",
  "蛋白质组",
  "代谢组",
  "生物信息学",
  "数据分析",
  "R语言",
  "Python",
  "Linux",
  "TCGA",
  "GEO",
  "HPA",
  "DESeq2",
  "edgeR",
  "limma",
  "BWA",
  "samtools",
  "GATK",
  "问题求助",
  "最佳实践",
  "教程",
];

export default function CreatePostPage() {
  const router = useRouter();

  // State management
  const [postData, setPostData] = useState<CreatePostData>({
    title: "",
    content: "",
    category: "",
    tags: [],
  });
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Handle form changes
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPostData({ ...postData, title: event.target.value });
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPostData({ ...postData, content: event.target.value });
  };

  const handleCategoryChange = (event: any) => {
    setPostData({ ...postData, category: event.target.value });
  };

  // Handle tag operations
  const handleAddTag = (tag: string) => {
    if (tag && !postData.tags.includes(tag)) {
      setPostData({ ...postData, tags: [...postData.tags, tag] });
    }
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPostData({
      ...postData,
      tags: postData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleNewTagKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTag(newTag);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!postData.title.trim()) {
      setError("请输入帖子标题");
      return;
    }
    if (!postData.content.trim()) {
      setError("请输入帖子内容");
      return;
    }
    if (!postData.category) {
      setError("请选择帖子分类");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to the new post (mock)
      router.push("/forum/post/1");
    } catch (err) {
      setError("发布帖子失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // Handle preview toggle
  const handlePreviewToggle = () => {
    setPreviewMode(!previewMode);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" fontWeight={700}>
            发布新帖
          </Typography>
        </Stack>

        <Paper sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={3}>
            {/* Title */}
            <TextField
              label="帖子标题"
              placeholder="请输入帖子标题..."
              value={postData.title}
              onChange={handleTitleChange}
              fullWidth
              variant="outlined"
              required
            />

            {/* Category */}
            <FormControl fullWidth required>
              <InputLabel>选择分类</InputLabel>
              <Select
                value={postData.category}
                onChange={handleCategoryChange}
                label="选择分类"
              >
                {FORUM_CATEGORIES.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Tags */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                标签
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                {postData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>

              {/* Add new tag */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <TextField
                  placeholder="添加标签..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleNewTagKeyPress}
                  size="small"
                  sx={{ flex: 1, maxWidth: 200 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleAddTag(newTag)}
                  disabled={!newTag.trim()}
                >
                  添加
                </Button>
              </Stack>

              {/* Common tags */}
              <Typography variant="body2" color="text.secondary" gutterBottom>
                常用标签：
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {COMMON_TAGS.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    onClick={() => handleAddTag(tag)}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Content */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle1">帖子内容</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Preview />}
                  onClick={handlePreviewToggle}
                >
                  {previewMode ? "编辑" : "预览"}
                </Button>
              </Stack>

              {previewMode ? (
                <Paper sx={{ p: 2, minHeight: 300, bgcolor: "white" }}>
                  <Typography variant="h6" gutterBottom>
                    {postData.title || "无标题"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {postData.content || "无内容"}
                  </Typography>
                </Paper>
              ) : (
                <TextField
                  placeholder="请输入帖子内容...支持Markdown格式"
                  value={postData.content}
                  onChange={handleContentChange}
                  fullWidth
                  multiline
                  rows={12}
                  variant="outlined"
                  required
                />
              )}
            </Box>

            {/* Actions */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => router.back()}
                disabled={loading}
              >
                取消
              </Button>
              <Button
                variant="contained"
                startIcon={
                  loading ? <CircularProgress size={16} /> : <PostAdd />
                }
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !postData.title.trim() ||
                  !postData.content.trim() ||
                  !postData.category
                }
              >
                {loading ? "发布中..." : "发布帖子"}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Help text */}
        <Paper
          sx={{
            p: 2,
            mt: 3,
            bgcolor: "info.light",
            color: "info.contrastText",
          }}
        >
          <Typography variant="body2">
            <strong>发帖提示：</strong>
            <br />
            • 请选择正确的分类，便于其他用户查找
            <br />
            • 添加相关标签可以提高帖子的可发现性
            <br />
            • 支持Markdown格式，可以添加代码块、链接等
            <br />• 请遵守社区规范，发布有价值的内容
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
