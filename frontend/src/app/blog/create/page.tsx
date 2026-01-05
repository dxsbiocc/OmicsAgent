"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Stack,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Autocomplete,
  Switch,
  FormControlLabel,
  Divider,
  Snackbar,
  useTheme,
} from "@mui/material";
import {
  Save as SaveIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Publish as PublishIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Comment as CommentIcon,
  CommentsDisabled as CommentOffIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import { blogApi } from "@/libs/api/blog";
import { categoriesApi } from "@/libs/api/categories";
import { tagsApi } from "@/libs/api/tags";
import { imageApi } from "@/libs/api/image";
import { useAuthContext } from "@/contexts/AuthContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import {
  ScrollableAlert,
  CropperModal,
  ImageSelectorModal,
} from "@/components";
import { getRandomBackgroundImage } from "@/utils/randomAssets";
import { getFullImageUrl } from "@/utils/url";
import { validateBlogForm, validateField } from "@/utils/validation";
import type { BlogPostCreate, CategoryResponse, TagResponse } from "@/types";

// 动态导入 MDEditor 避免 SSR 问题
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => <div>文本编辑器...</div>,
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`content-tabpanel-${index}`}
      aria-labelledby={`content-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CreateBlogPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { mode } = useThemeContext();
  const theme = useTheme();

  // 检查是否为编辑模式
  const [isEditMode, setIsEditMode] = useState(false);
  const [editBlogId, setEditBlogId] = useState<number | null>(null);

  // 字段校验状态
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // 校验单个字段
  const validateSingleField = (field: string, value: any) => {
    const result = validateField(field, value);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: result.errors,
    }));
    return result.isValid;
  };

  // 校验整个表单
  const validateForm = () => {
    setIsValidating(true);

    try {
      // 使用当前实际内容进行校验
      const currentContent = getCurrentContent();
      const formDataWithCurrentContent = {
        ...formData,
        content: currentContent,
      };

      const result = validateBlogForm(formDataWithCurrentContent);

      // 只在有错误时才更新字段错误状态
      if (!result.isValid) {
        setFieldErrors({});
        setError(result.errors.join("；"));
        return false;
      }

      // 校验通过时清理所有错误状态
      setFieldErrors({});
      setError("");
      return true;
    } finally {
      setIsValidating(false);
    }
  };

  // 表单状态
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    background_image_url: "",
    category_id: null as number | null,
    category_name: "",
    status: "draft" as "draft" | "published" | "archived",
    featured: false,
    comments_enabled: true,
    tag_ids: [] as number[],
    tag_names: [] as string[],
  });

  // UI 状态
  const [activeTab, setActiveTab] = useState(0); // 默认选择富文本编辑器
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editorMode, setEditorMode] = useState<"edit" | "preview" | "split">(
    "edit"
  );

  // Snackbar 状态
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  // 图片预览模态框状态
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewImageTitle, setPreviewImageTitle] = useState("");

  // 图片上传状态
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(
    null
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // 图片选择器状态
  const [imageSelectorOpen, setImageSelectorOpen] = useState(false);

  // 内容编辑器状态
  const [richTextContent, setRichTextContent] = useState("");
  const [importedContent, setImportedContent] = useState("");

  // 分类和标签管理状态
  const [availableCategories, setAvailableCategories] = useState<
    CategoryResponse[]
  >([]);
  const [availableTags, setAvailableTags] = useState<TagResponse[]>([]);

  // 加载分类和标签数据
  // 检查是否为编辑模式
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get("edit");
    if (editId) {
      setIsEditMode(true);
      setEditBlogId(parseInt(editId));
    }
  }, []);

  // 加载现有博客数据（编辑模式）
  useEffect(() => {
    if (isEditMode && editBlogId) {
      const loadBlogData = async () => {
        try {
          const blogData = await blogApi.getBlogPost(editBlogId);
          setFormData({
            title: blogData.title,
            slug: blogData.slug,
            content: blogData.content,
            excerpt: blogData.excerpt || "",
            background_image_url: blogData.background_image_url || "",
            category_id: blogData.category_id,
            category_name: blogData.category_name || "",
            status: blogData.status as "draft" | "published" | "archived",
            featured: blogData.featured,
            comments_enabled: blogData.comments_enabled,
            tag_ids: blogData.tags?.map((tag) => tag.id) || [],
            tag_names: blogData.tags?.map((tag) => tag.name) || [],
          });
        } catch (error) {
          console.error("加载博客数据失败:", error);
        }
      };
      loadBlogData();
    }
  }, [isEditMode, editBlogId]);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("开始加载分类和标签数据...");

        // 并行加载分类和标签数据
        const [categoriesResponse, tagsResponse] = await Promise.all([
          categoriesApi.getCategories(),
          tagsApi.getTags(),
        ]);

        console.log("分类数据:", categoriesResponse);
        console.log("标签数据:", tagsResponse);

        // 直接使用返回的数组
        const categories = categoriesResponse;
        const tags = tagsResponse;

        setAvailableCategories(categories);
        setAvailableTags(tags);

        console.log("设置后的分类数量:", categories.length);
        console.log("设置后的标签数量:", tags.length);
      } catch (error) {
        console.error("加载数据失败:", error);
        // 如果加载失败，设置为空数组
        setAvailableCategories([]);
        setAvailableTags([]);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 当用户修改内容时，清理相关的错误状态
    if (field === "content" || field === "title") {
      // 清理字段级别的错误
      setFieldErrors((prev) => ({
        ...prev,
        [field]: [],
      }));

      // 如果存在表单级别的错误，也清理掉
      if (error) {
        setError("");
      }
    }
  };

  // 使用工具函数获取随机背景图片
  const getRandomBackground = () => {
    return getRandomBackgroundImage();
  };

  // 处理背景图片上传
  const handleBackgroundImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件");
      return;
    }

    // 设置文件状态
    setBackgroundImageFile(file);

    // 创建预览URL并打开预览模态框
    const url = URL.createObjectURL(file);
    setPreviewImageUrl(url);
    setPreviewImageTitle("上传的背景图片");
    setPreviewModalOpen(true);
  };

  // 选择随机背景图片
  const handleRandomBackground = () => {
    const randomImageUrl = getRandomBackground();
    // 直接设置背景图片URL，不进入预览模态框
    handleInputChange("background_image_url", randomImageUrl);
    setSuccess("已选择随机背景图片");
  };

  // 打开图片选择器
  const handleOpenImageSelector = () => {
    setImageSelectorOpen(true);
  };

  // 关闭图片选择器
  const handleCloseImageSelector = () => {
    setImageSelectorOpen(false);
  };

  // 选择图片
  const handleSelectImage = (imageUrl: string) => {
    handleInputChange("background_image_url", imageUrl);
    setSuccess("已选择用户图片");
  };

  // 确认选择背景图片（只处理上传的文件）
  const handleConfirmBackgroundImage = async (croppedFile: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const uploadResponse = await imageApi.uploadImage(
        croppedFile, // 使用裁剪后的文件
        `博客背景图片 - ${formData.title || "未命名博客"}`,
        "blog,background",
        (progress) => setUploadProgress(progress)
      );

      if (uploadResponse.success && uploadResponse.file_url) {
        handleInputChange("background_image_url", uploadResponse.file_url);
        setSuccess("背景图片上传成功");
      } else {
        setError("背景图片上传失败");
        return;
      }

      setPreviewModalOpen(false);
      setBackgroundImageFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error("背景图片上传失败:", error);
      setError("背景图片上传失败，请重试");
    } finally {
      setIsUploading(false);
    }
  };

  // 关闭预览模态框
  const handleClosePreviewModal = () => {
    setPreviewModalOpen(false);
    // 清理预览URL
    if (previewImageUrl && previewImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewImageUrl);
    }
    // 清理上传状态
    setBackgroundImageFile(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleTagAdd = (tag: string) => {
    if (!formData.tag_names.includes(tag)) {
      handleInputChange("tag_names", [...formData.tag_names, tag]);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportedContent(content);
        handleInputChange("content", content);
        setActiveTab(2); // 切换到导入内容标签页
      };
      reader.readAsText(file);
    }
  };

  const getCurrentContent = () => {
    switch (activeTab) {
      case 0:
        return richTextContent;
      case 1:
        return importedContent;
      default:
        return "";
    }
  };

  const handleSave = async () => {
    // 第一步：校验表单内容
    console.log("开始校验博客内容...");

    if (!validateForm()) {
      console.log("博客内容校验失败，停止保存");
      return;
    }

    console.log("博客内容校验通过，开始保存...");

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // 调用后端API保存草稿（后端会自动处理背景图片）
      const postData: BlogPostCreate = {
        title: formData.title,
        slug: formData.slug,
        content: getCurrentContent(),
        excerpt: formData.excerpt,
        background_image_url: formData.background_image_url || undefined, // 让后端自动处理
        category_id: formData.category_id || undefined,
        category_name: formData.category_name,
        tag_ids: formData.tag_ids.length > 0 ? formData.tag_ids : undefined,
        tag_names:
          formData.tag_names.length > 0 ? formData.tag_names : undefined,
        comments_enabled: formData.comments_enabled,
        status: "draft",
        featured: formData.featured,
      };

      let response;
      if (isEditMode && editBlogId) {
        // 编辑模式：更新现有博客
        response = await blogApi.updateBlogPost(editBlogId, postData);
        setSuccess("博客更新成功！");
      } else {
        // 创建模式：创建新博客
        response = await blogApi.createBlogPost(postData);
        setSuccess("草稿保存成功！");
      }
      console.log("保存的博客数据:", response);
    } catch (err) {
      console.error("保存草稿失败:", err);
      setError(err instanceof Error ? err.message : "保存失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    // 第一步：校验表单内容
    console.log("开始校验博客内容...");

    if (!validateForm()) {
      console.log("博客内容校验失败，停止发布");
      return;
    }

    console.log("博客内容校验通过，开始发布...");

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // 调用后端API发布博客（后端会自动处理背景图片）
      const postData: BlogPostCreate = {
        title: formData.title,
        slug: formData.slug,
        content: getCurrentContent(),
        excerpt: formData.excerpt,
        background_image_url: formData.background_image_url || undefined, // 让后端自动处理
        category_id: formData.category_id || undefined,
        category_name: formData.category_name,
        tag_ids: formData.tag_ids.length > 0 ? formData.tag_ids : undefined,
        tag_names:
          formData.tag_names.length > 0 ? formData.tag_names : undefined,
        comments_enabled: formData.comments_enabled,
        status: "published",
        featured: formData.featured,
      };

      let response;
      if (isEditMode && editBlogId) {
        // 编辑模式：更新现有博客
        response = await blogApi.updateBlogPost(editBlogId, postData);
        setSuccess("博客更新并发布成功！");
      } else {
        // 创建模式：创建新博客
        response = await blogApi.createBlogPost(postData);
        setSuccess("博客发布成功！");
      }
      console.log("发布的博客数据:", response);

      // 发布成功后跳转到博客列表
      setTimeout(() => {
        router.push("/blog");
      }, 2000);
    } catch (err) {
      console.error("发布博客失败:", err);

      let errorMessage = "发布失败，请重试";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null) {
        // 处理对象类型的错误
        const errorObj = err as any;
        errorMessage =
          errorObj.message ||
          errorObj.detail ||
          errorObj.error ||
          JSON.stringify(errorObj);
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    setIsPreview(!isPreview);
  };

  // 显示 Snackbar
  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error" | "warning" | "info") => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);

      // 自动滚动到页面顶部
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    []
  );

  // 关闭 Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // 身份验证检查
  if (authLoading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ScrollableAlert severity="error">请先登录后再创建博客</ScrollableAlert>
        <Button
          variant="contained"
          onClick={() => router.push("/login")}
          sx={{ mt: 2 }}
        >
          前往登录
        </Button>
      </Container>
    );
  }

  if (!user?.is_admin) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ScrollableAlert severity="warning">
          只有管理员可以创建博客
        </ScrollableAlert>
        <Button
          variant="contained"
          onClick={() => router.push("/")}
          sx={{ mt: 2 }}
        >
          返回首页
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? "编辑博客" : "创建新博客"}
      </Typography>

      {error && (
        <ScrollableAlert severity="error" onClose={() => setError("")}>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
            ❌ 表单校验失败
          </Typography>
          <Typography variant="body2">{error}</Typography>
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 1, opacity: 0.8 }}
          >
            请检查并修正上述问题后重试
          </Typography>
        </ScrollableAlert>
      )}

      {success && (
        <ScrollableAlert severity="success" onClose={() => setSuccess("")}>
          {success}
        </ScrollableAlert>
      )}

      <Stack spacing={3}>
        {/* 基本信息 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              基本信息
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="博客标题"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                onBlur={() => validateSingleField("title", formData.title)}
                placeholder="请输入博客标题"
                required
                error={fieldErrors.title && fieldErrors.title.length > 0}
                helperText={fieldErrors.title?.[0]}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="简短描述"
                value={formData.excerpt}
                onChange={(e) => handleInputChange("excerpt", e.target.value)}
                onBlur={() => validateSingleField("excerpt", formData.excerpt)}
                placeholder="请输入博客的简短描述"
                error={fieldErrors.excerpt && fieldErrors.excerpt.length > 0}
                helperText={fieldErrors.excerpt?.[0]}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* 内容编辑 */}
        <Card>
          <CardContent>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
              >
                <Tab label="文本编辑器" />
                <Tab label="导入文件" />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6">文本编辑器</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant={editorMode === "edit" ? "contained" : "outlined"}
                      onClick={() => setEditorMode("edit")}
                    >
                      编辑
                    </Button>
                    <Button
                      size="small"
                      variant={
                        editorMode === "preview" ? "contained" : "outlined"
                      }
                      onClick={() => setEditorMode("preview")}
                    >
                      预览
                    </Button>
                    <Button
                      size="small"
                      variant={
                        editorMode === "split" ? "contained" : "outlined"
                      }
                      onClick={() => setEditorMode("split")}
                    >
                      分屏
                    </Button>
                  </Stack>
                </Stack>

                {/* 排版提示 */}
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "background.paper",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    💡 排版提示：
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Typography variant="caption" color="text.secondary">
                      • 使用 # 创建标题层级
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • 使用 **粗体** 和 *斜体* 强调重点
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • 使用 &gt; 创建引用块
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • 使用 - 或 1. 创建列表
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • 使用 ``` 创建代码块
                    </Typography>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    overflow: "hidden",
                    "& .w-md-editor": {
                      height: "350px !important",
                    },
                    "& .w-md-editor-text-container": {
                      height: "350px !important",
                    },
                    "& .w-md-editor-text": {
                      height: "350px !important",
                      fontSize: "16px",
                      lineHeight: "1.6",
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                    },
                    "& .w-md-editor-preview": {
                      height: "350px !important",
                      fontSize: "16px",
                      lineHeight: "1.6",
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                      padding: "20px",
                      "& h1, & h2, & h3, & h4, & h5, & h6": {
                        marginTop: "24px",
                        marginBottom: "16px",
                        fontWeight: "600",
                        lineHeight: "1.25",
                      },
                      "& h1": {
                        fontSize: "2em",
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        paddingBottom: "0.3em",
                      },
                      "& h2": {
                        fontSize: "1.5em",
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        paddingBottom: "0.3em",
                      },
                      "& h3": {
                        fontSize: "1.25em",
                      },
                      "& p": {
                        marginBottom: "16px",
                        lineHeight: "1.6",
                      },
                      "& blockquote": {
                        padding: "0 1em",
                        color: "text.secondary",
                        borderLeft: `0.25em solid ${theme.palette.divider}`,
                        margin: "0 0 16px 0",
                      },
                      "& ul, & ol": {
                        paddingLeft: "2em",
                        marginBottom: "16px",
                      },
                      "& li": {
                        marginBottom: "0.25em",
                      },
                      "& code": {
                        padding: "0.2em 0.4em",
                        margin: "0",
                        fontSize: "85%",
                        backgroundColor:
                          mode === "dark"
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(27,31,35,0.05)",
                        borderRadius: "3px",
                        fontFamily:
                          "SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace",
                      },
                      "& pre": {
                        padding: "16px",
                        overflow: "auto",
                        fontSize: "85%",
                        lineHeight: "1.45",
                        backgroundColor:
                          mode === "dark" ? "rgba(0,0,0,0.3)" : "#f6f8fa",
                        borderRadius: "6px",
                        marginBottom: "16px",
                      },
                      "& pre code": {
                        display: "inline",
                        maxWidth: "auto",
                        padding: "0",
                        margin: "0",
                        overflow: "visible",
                        lineHeight: "inherit",
                        wordWrap: "normal",
                        backgroundColor: "transparent",
                        border: "0",
                      },
                      "& table": {
                        borderSpacing: "0",
                        borderCollapse: "collapse",
                        display: "block",
                        width: "max-content",
                        maxWidth: "100%",
                        overflow: "auto",
                        marginBottom: "16px",
                      },
                      "& table th, & table td": {
                        padding: "6px 13px",
                        border: `1px solid ${theme.palette.divider}`,
                      },
                      "& table th": {
                        fontWeight: "600",
                        backgroundColor:
                          mode === "dark"
                            ? "rgba(255,255,255,0.05)"
                            : "#f6f8fa",
                      },
                      "& img": {
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: "6px",
                        margin: "16px 0",
                      },
                      "& a": {
                        color: "primary.main",
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      },
                    },
                  }}
                >
                  <MDEditor
                    value={richTextContent}
                    onChange={(value) => {
                      setRichTextContent(value || "");
                      handleInputChange("content", value || "");
                    }}
                    onBlur={() => {
                      // 失焦时校验内容
                      validateSingleField("content", richTextContent);
                    }}
                    height={350}
                    data-color-mode={mode}
                    visibleDragbar={false}
                    preview={
                      editorMode === "edit"
                        ? "edit"
                        : editorMode === "preview"
                        ? "preview"
                        : "live"
                    }
                    hideToolbar={false}
                  />
                </Box>

                {/* 内容校验错误提示 - 只在失焦时显示 */}
                {fieldErrors.content && fieldErrors.content.length > 0 && (
                  <Alert
                    severity="warning"
                    sx={{ mt: 1 }}
                    onClose={() => {
                      setFieldErrors((prev) => ({
                        ...prev,
                        content: [],
                      }));
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                      {fieldErrors.content[0]}
                    </Typography>
                  </Alert>
                )}
              </Stack>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Stack spacing={2}>
                <Typography variant="h6">导入文件</Typography>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ alignSelf: "flex-start" }}
                >
                  选择文件导入
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.txt,.html"
                  style={{ display: "none" }}
                  onChange={handleFileImport}
                />
                {importedContent && (
                  <TextField
                    fullWidth
                    multiline
                    rows={15}
                    value={importedContent}
                    onChange={(e) => {
                      setImportedContent(e.target.value);
                      handleInputChange("content", e.target.value);
                    }}
                    placeholder="导入的内容将显示在这里..."
                    sx={{ fontFamily: "monospace" }}
                  />
                )}
              </Stack>
            </TabPanel>
          </CardContent>
        </Card>

        {/* 元数据和设置 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              元数据和设置
            </Typography>
            <Stack spacing={3}>
              {/* 背景图片 */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  背景图片
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<ImageIcon />}
                    onClick={handleRandomBackground}
                    sx={{ minWidth: 140 }}
                  >
                    随机选择背景
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ImageIcon />}
                    onClick={handleOpenImageSelector}
                    sx={{ minWidth: 140 }}
                  >
                    选择我的图片
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    或拖拽图片到下方区域上传
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    mt: 2,
                    p: 3,
                    border: "2px dashed",
                    borderColor: "primary.main",
                    borderRadius: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "primary.dark",
                      backgroundColor:
                        mode === "dark"
                          ? "rgba(25, 118, 210, 0.1)"
                          : "primary.50",
                    },
                    "&.drag-over": {
                      borderColor: "primary.dark",
                      backgroundColor:
                        mode === "dark"
                          ? "rgba(25, 118, 210, 0.2)"
                          : "primary.100",
                      transform: "scale(1.02)",
                    },
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("drag-over");
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("drag-over");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("drag-over");
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      handleBackgroundImageUpload(files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Stack alignItems="center" spacing={1}>
                    <ImageIcon sx={{ fontSize: 48, color: "primary.main" }} />
                    <Typography variant="body1" color="primary.main">
                      拖拽图片到此处或点击上传
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      支持 JPG、PNG、GIF 等格式，建议尺寸 1920x1080
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      也可以点击上方"随机选择背景"按钮
                    </Typography>
                  </Stack>
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleBackgroundImageUpload(file);
                    }
                  }}
                />

                {/* 背景图片预览 */}
                {formData.background_image_url && (
                  <Box sx={{ mt: 2 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="subtitle2">
                        当前背景图片预览:
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() =>
                          handleInputChange("background_image_url", "")
                        }
                      >
                        清除背景图片
                      </Button>
                    </Stack>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 2,
                          overflow: "hidden",
                          border: "1px solid",
                          borderColor: "divider",
                          position: "relative",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          width: "fit-content",
                          maxWidth: "100%",
                        }}
                      >
                        <img
                          src={getFullImageUrl(formData.background_image_url)}
                          alt="背景图片预览"
                          style={{
                            width: "auto",
                            height: "auto",
                            maxWidth: "600px",
                            maxHeight: "400px",
                            objectFit: "contain",
                            display: "block",
                            aspectRatio: "auto",
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background:
                              "linear-gradient(transparent, rgba(0,0,0,0.7))",
                            color: "white",
                            p: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {formData.background_image_url.includes(
                              "/images/background/"
                            )
                              ? "随机选择的背景图片"
                              : formData.background_image_url.includes(
                                  "/api/v1/image/"
                                )
                              ? "用户选择的图片"
                              : "上传的背景图片"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* 分类和标签 */}
              <Stack direction="column" spacing={2}>
                <Autocomplete
                  freeSolo
                  options={
                    availableCategories?.map((category) => category.name) || []
                  }
                  value={formData.category_name}
                  onChange={(event, newValue) => {
                    handleInputChange("category_name", newValue || "");
                  }}
                  onInputChange={(event, newInputValue) => {
                    // 后端会自动处理新分类的创建
                    handleInputChange("category", newInputValue || "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="分类"
                      placeholder="+ Categories"
                      sx={{ minWidth: 200 }}
                    />
                  )}
                  sx={{ width: "30%" }}
                />

                <Autocomplete
                  multiple
                  freeSolo
                  options={availableTags?.map((tag) => tag.name) || []}
                  value={formData.tag_names}
                  onChange={(event, newValue) => {
                    handleInputChange("tag_names", newValue);
                  }}
                  onInputChange={(event, newInputValue) => {
                    if (
                      event &&
                      event.type === "keydown" &&
                      (event as any).key === "Enter"
                    ) {
                      if (
                        newInputValue.trim() &&
                        !formData.tag_names.includes(newInputValue.trim())
                      ) {
                        // 添加到已选标签
                        handleInputChange("tag_names", [
                          ...formData.tag_names,
                          newInputValue.trim(),
                        ]);
                        // 添加到可用标签列表（如果标签不存在）
                        const existingTag = availableTags?.find(
                          (tag) => tag.name === newInputValue.trim()
                        );
                        if (!existingTag) {
                          const newTag: TagResponse = {
                            id: Date.now(),
                            name: newInputValue.trim(),
                            slug: newInputValue
                              .trim()
                              .toLowerCase()
                              .replace(/\s+/g, "-"),
                            description: null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            post_count: 0,
                          };
                          setAvailableTags((prev) => [...prev, newTag]);
                        }
                      }
                    }
                  }}
                  renderValue={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { onDelete, ...otherProps } = getTagProps({
                        index,
                      });
                      return (
                        <Chip
                          variant="outlined"
                          label={option}
                          size="small"
                          color="primary"
                          onDelete={() => {
                            const newTags = formData.tag_names.filter(
                              (tag) => tag !== option
                            );
                            handleInputChange("tag_names", newTags);
                          }}
                          {...otherProps}
                          key={option}
                          sx={{
                            margin: 0.5,
                            "& .MuiChip-deleteIcon": {
                              color: "primary.main",
                              "&:hover": {
                                color: "primary.dark",
                              },
                            },
                          }}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="标签"
                      placeholder="+ Tags"
                      sx={{ minWidth: 200 }}
                    />
                  )}
                />
              </Stack>

              <Divider />

              {/* 控制选项 */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  发布设置
                </Typography>
                <Stack direction="row" spacing={4} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.status === "published"}
                        onChange={(e) =>
                          handleInputChange(
                            "status",
                            e.target.checked ? "published" : "draft"
                          )
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {formData.status === "published" ? (
                          <PublicIcon color="primary" />
                        ) : (
                          <LockIcon />
                        )}
                        <Typography variant="body1">
                          {formData.status === "published" ? "公开" : "私有"}
                        </Typography>
                      </Stack>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.comments_enabled}
                        onChange={(e) =>
                          handleInputChange(
                            "comments_enabled",
                            e.target.checked
                          )
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {formData.comments_enabled ? (
                          <CommentIcon color="primary" />
                        ) : (
                          <CommentOffIcon />
                        )}
                        <Typography variant="body1">
                          {formData.comments_enabled ? "允许评论" : "禁止评论"}
                        </Typography>
                      </Stack>
                    }
                  />
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* 预览区域 */}
        {isPreview && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                内容预览
              </Typography>
              <Paper sx={{ p: 2, minHeight: 200 }}>
                {activeTab === 0 ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: getCurrentContent() }}
                  />
                ) : (
                  <pre
                    style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
                  >
                    {getCurrentContent()}
                  </pre>
                )}
              </Paper>
            </CardContent>
          </Card>
        )}

        {/* 操作按钮 */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={
              isValidating ? <CircularProgress size={20} /> : <SaveIcon />
            }
            onClick={handleSave}
            disabled={isLoading || isValidating}
          >
            {isValidating ? "校验中..." : isLoading ? "保存中..." : "保存草稿"}
          </Button>
          <Button
            variant="contained"
            startIcon={
              isValidating ? (
                <CircularProgress size={20} />
              ) : isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <PublishIcon />
              )
            }
            onClick={handlePublish}
            disabled={isLoading || isValidating}
          >
            {isValidating ? "校验中..." : isLoading ? "发布中..." : "发布博客"}
          </Button>
        </Stack>
      </Stack>

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

      {/* 图片裁剪模态框 */}
      <CropperModal
        open={previewModalOpen}
        onClose={handleClosePreviewModal}
        onConfirm={handleConfirmBackgroundImage}
        imageUrl={previewImageUrl}
        originalFilename={backgroundImageFile?.name}
        title={previewImageTitle}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />

      {/* 图片选择器模态框 */}
      <ImageSelectorModal
        open={imageSelectorOpen}
        onClose={handleCloseImageSelector}
        onSelect={handleSelectImage}
        title="选择背景图片"
      />
    </Container>
  );
}
