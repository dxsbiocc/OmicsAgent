"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  IconButton,
  Stack,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  useTheme,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
  GridReadyEvent,
  FirstDataRenderedEvent,
  GridApi,
} from "ag-grid-community";
// Register all community features to avoid error #272
ModuleRegistry.registerModules([AllCommunityModule]);
import {
  ArrowBack,
  PlayArrow,
  Download,
  Refresh,
  Settings,
  Code,
  Science,
  Analytics,
  CheckCircle,
  Error,
  Visibility,
  Favorite,
  FavoriteBorder,
  Share,
} from "@mui/icons-material";
import {
  getAnalysisToolInfo,
  getAnalysisToolMeta,
  downloadAnalysisResults,
  runAnalysisTool,
  type AnalysisToolInfo,
  type AnalysisRunResponse,
  type ToolMeta,
} from "../../../libs/api/analysis";
import { useThemeContext } from "@/contexts/ThemeContext";
import animStyles from "../../../../styles/visual/visual-animations.module.css";
import Iconify from "@/components/common/Iconify";
import { commentsApi } from "../../../libs/api/comments";
import { useAuthContext } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Discussion from "@/components/common/Discussion";
import ParamsComponent from "./components/paramsComponent";
import { Ggplot2Component } from "@/components/charts/ggplot2/ggplot2";
import { Ggplot2Config } from "@/components/charts/ggplot2/types";

// Sample table data for analysis tools
const sampleAnalysisData = [
  {
    id: 1,
    gene: "BRCA1",
    expression: 2.5,
    p_value: 0.001,
    log_fc: 1.2,
    tissue: "Breast",
  },
  {
    id: 2,
    gene: "TP53",
    expression: 3.1,
    p_value: 0.0005,
    log_fc: -0.8,
    tissue: "Lung",
  },
  {
    id: 3,
    gene: "EGFR",
    expression: 4.2,
    p_value: 0.002,
    log_fc: 2.1,
    tissue: "Brain",
  },
  {
    id: 4,
    gene: "MYC",
    expression: 1.8,
    p_value: 0.01,
    log_fc: 0.5,
    tissue: "Liver",
  },
  {
    id: 5,
    gene: "KRAS",
    expression: 2.9,
    p_value: 0.003,
    log_fc: -1.1,
    tissue: "Colon",
  },
];

// Helper function to convert meta.json params to params_schema format
function convertMetaParamsToSchema(params: Record<string, any>) {
  const schema: Record<string, any> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null) {
      schema[key] = {
        type: value.type || "string",
        description: value.description,
        ...(value.options && { enum: value.options }),
        ...(value.default !== undefined && { default: value.default }),
      };
    }
  });
  return schema;
}

// Helper function to extract defaults from meta.json params
function extractDefaultsFromMetaParams(params: Record<string, any>) {
  const defaults: Record<string, any> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (
      typeof value === "object" &&
      value !== null &&
      value.default !== undefined
    ) {
      defaults[key] = value.default;
    }
  });
  return defaults;
}

export default function AnalysisToolPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { mode } = useThemeContext();

  // State management
  const [toolMeta, setToolMeta] = useState<ToolMeta | null>(null);
  const [currentTool, setCurrentTool] = useState<AnalysisToolInfo | null>(null);
  const [subTools, setSubTools] = useState<any[]>([]);
  const [selectedSubTool, setSelectedSubTool] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [leftPanelWidth, setLeftPanelWidth] = useState(40);
  const [isDragging, setIsDragging] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [paramsResetKey, setParamsResetKey] = useState(0);
  const [leftPanelTab, setLeftPanelTab] = useState(0); // 0: 查询参数, 1: 图表参数

  // ag-grid 引用
  const gridRef = useRef<AgGridReact>(null);
  const gridApiRef = useRef<GridApi | null>(null);

  // 保存分析结果的状态（用于 Tab 切换时保持数据）
  const [resultTableData, setResultTableData] = useState<any[]>([]);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [ggplot2Config, setGgplot2Config] = useState<Ggplot2Config | null>(
    null
  );

  // Analysis state
  const [analysisParameters, setAnalysisParameters] = useState<{
    [key: string]: any;
  }>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<AnalysisRunResponse | null>(null);
  const [jobStatus, setJobStatus] = useState<{
    status: "pending" | "running" | "completed" | "failed";
    progress: number;
    message?: string;
  } | null>(null);

  // Mock stats
  const [toolStats, setToolStats] = useState({
    views: 1234,
    favorites: 56,
    usage: 234,
  });
  const [isFavorited, setIsFavorited] = useState(false);

  // Discussion state
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const { isAuthenticated } = useAuthContext();

  // Login dialog state
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Ref for Tabs container to scroll to selected tab
  const tabsRef = useRef<HTMLDivElement>(null);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!slug) return;
      try {
        setLoadingComments(true);
        // Use tool slug as target_id (convert to hash number for now)
        // In production, you might want to use a proper tool ID
        const targetId = slug.split("_").join("").length; // Simple hash
        const result = await commentsApi.getTargetComments(
          "analysis_tool",
          targetId,
          {
            include_replies: true,
            sort_by: "created_at",
            sort_order: "desc",
          }
        );
        setComments(result.items || []);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [slug]);

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !isAuthenticated) return;
    try {
      const targetId = slug.split("_").join("").length;
      const result = await commentsApi.createComment({
        content: newComment.trim(),
        target_type: "analysis_tool",
        target_id: targetId,
        parent_id: null,
      });
      setComments([result, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to create comment:", error);
      alert("发表评论失败，请稍后再试");
    }
  };

  // Handle reply submission
  const handleReplySubmit = async (parentId: number) => {
    if (!replyContent.trim() || !isAuthenticated) return;
    try {
      const targetId = slug.split("_").join("").length;
      const result = await commentsApi.createComment({
        content: replyContent.trim(),
        target_type: "analysis_tool",
        target_id: targetId,
        parent_id: parentId,
      });
      // Refresh comments to get updated reply count
      const updated = await commentsApi.getTargetComments(
        "analysis_tool",
        targetId,
        {
          include_replies: true,
          sort_by: "created_at",
          sort_order: "desc",
        }
      );
      setComments(updated.items || []);
      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Failed to create reply:", error);
      alert("回复失败，请稍后再试");
    }
  };

  // Handle like toggle
  const handleLikeToggle = async (commentId: number, isLiked: boolean) => {
    if (!isAuthenticated) {
      alert("请先登录");
      return;
    }
    try {
      if (isLiked) {
        await commentsApi.unlikeComment(commentId);
      } else {
        await commentsApi.likeComment(commentId);
      }
      // Refresh comments
      const targetId = slug.split("_").join("").length;
      const updated = await commentsApi.getTargetComments(
        "analysis_tool",
        targetId,
        {
          include_replies: true,
          sort_by: "created_at",
          sort_order: "desc",
        }
      );
      setComments(updated.items || []);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get tool meta and sub-tools
  useEffect(() => {
    const fetchToolData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get tool meta first
        try {
          const metaResponse = await getAnalysisToolMeta(slug);
          if (metaResponse.success && metaResponse.meta) {
            setToolMeta(metaResponse.meta);
            // Extract sub-tools from meta
            if (metaResponse.meta.tools && metaResponse.meta.tools.length > 0) {
              setSubTools(metaResponse.meta.tools);
            } else {
              // If no sub-tools in meta, treat the tool itself as a single sub-tool
              setSubTools([
                {
                  name: metaResponse.meta.name,
                  title: metaResponse.meta.title || metaResponse.meta.name,
                  description: metaResponse.meta.description,
                  category: metaResponse.meta.category,
                },
              ]);
            }
          }
        } catch (metaError) {
          console.warn("Failed to fetch tool meta, using fallback:", metaError);
          // Fallback: treat slug as a single tool
          const fallbackSubTool = {
            name: slug,
            title: slug
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            description: `Analysis tool for ${slug}`,
            category: slug.split("_")[0] || "general",
          };
          setSubTools([fallbackSubTool]);
        }

        // Get tool info
        try {
          const toolInfo = await getAnalysisToolInfo(slug);
          setCurrentTool(toolInfo);
          setTableData(sampleAnalysisData);
        } catch (toolInfoError) {
          console.warn(
            "Failed to fetch tool info, using fallback:",
            toolInfoError
          );
          // Create mock tool info
          const mockTool: AnalysisToolInfo = {
            tool: slug,
            name: slug
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            display_name: slug
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            description:
              toolMeta?.description ||
              `Advanced ${slug.replace(/_/g, " ")} analysis tool`,
            category: slug.split("_")[0] || "general",
            tool_name: slug,
            params_schema: {
              method: {
                type: "string",
                enum: ["deseq2", "edgeR", "limma"],
                default: "deseq2",
              },
              p_value_threshold: {
                type: "number",
                minimum: 0,
                maximum: 1,
                default: 0.05,
              },
              log_fc_threshold: { type: "number", minimum: 0, default: 1.0 },
              normalization: {
                type: "string",
                enum: ["tmm", "quantile", "none"],
                default: "tmm",
              },
            },
            defaults: {
              method: "deseq2",
              p_value_threshold: 0.05,
              log_fc_threshold: 1.0,
              normalization: "tmm",
            },
            sample_image_url: "/images/background/others/6056984.jpg",
          };
          setCurrentTool(mockTool);
          setTableData(sampleAnalysisData);
        }
      } catch (err) {
        console.error("Failed to fetch tool data:", err);
        setError("获取工具数据失败");
      } finally {
        setLoading(false);
      }
    };

    fetchToolData();
  }, [slug]);

  // Drag handling
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const windowWidth = window.innerWidth;
    const newWidth = (e.clientX / windowWidth) * 100;
    const clampedWidth = Math.max(20, Math.min(80, newWidth));
    setLeftPanelWidth(clampedWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  // Handle parameter changes
  const handleParametersChange = useCallback(
    (params: { [key: string]: any }) => {
      setAnalysisParameters(params);
    },
    []
  );

  // Handle query data execution (查询 Tab)
  const handleQueryData = useCallback(
    async (params: { [key: string]: any }) => {
      if (!currentTool) return;

      // 检查登录状态
      if (!isAuthenticated) {
        setShowLoginDialog(true);
        return;
      }

      setIsAnalyzing(true);
      setJobStatus({
        status: "pending",
        progress: 0,
        message: "查询数据中...",
      });

      try {
        const analysisParams = {
          ...params,
          sub_tool: selectedSubTool || undefined,
          query_data: true, // 标记为查询数据
        };

        setJobStatus({
          status: "running",
          progress: 30,
          message: "处理数据...",
        });

        const resp = await runAnalysisTool(currentTool.tool, analysisParams);

        if (resp.success) {
          // 保存表格数据
          const resultData = resp.data;
          let tableDataArray: any[] = [];

          if (Array.isArray(resultData)) {
            tableDataArray = resultData;
          } else if (resultData && typeof resultData === "object") {
            // 如果返回的是对象，尝试提取 data 字段
            if (Array.isArray(resultData.data)) {
              tableDataArray = resultData.data;
            } else if (typeof resultData.data === "string") {
              try {
                tableDataArray = JSON.parse(resultData.data);
              } catch (e) {
                console.error("Failed to parse data:", e);
              }
            }
          }

          setResultTableData(tableDataArray);
          setTableData(tableDataArray);

          // 如果没有数据，清空图片和配置
          if (tableDataArray.length === 0) {
            setResultImageUrl(null);
            setGgplot2Config(null);
          } else {
            // 提取并保存 ggplot2 配置
            if (resp.ggplot2) {
              setGgplot2Config(resp.ggplot2);
            }

            // 保存图片 URL
            if (resp.image_url) {
              // 添加时间戳防止缓存
              const timestamp = Date.now();
              setResultImageUrl(`${resp.image_url}?t=${timestamp}`);
            }
          }

          setAnalysisResult(resp);
          setJobStatus({
            status: "completed",
            progress: 100,
            message: resp.message || "查询完成！",
          });
        } else {
          setJobStatus({
            status: "failed",
            progress: 0,
            message: resp.message || "查询失败",
          });
          setAnalysisResult(resp);
        }
        setIsAnalyzing(false);
      } catch (err: unknown) {
        // 检查是否是401错误（未登录）
        const isUnauthorized =
          (err as any)?.response?.status === 401 ||
          (err as any)?.message?.includes("请先登录") ||
          (err as any)?.message?.includes("Unauthorized");

        if (isUnauthorized) {
          setShowLoginDialog(true);
          setIsAnalyzing(false);
          return;
        }

        const errorMessage =
          err instanceof Error ? (err as Error).message : "查询失败";
        setJobStatus({
          status: "failed",
          progress: 0,
          message: errorMessage,
        });
        setAnalysisResult({
          success: false,
          message: errorMessage,
          tool: currentTool.tool,
          used_params: params,
          analysis_type: currentTool.category,
        });
        setIsAnalyzing(false);
      }
    },
    [currentTool, selectedSubTool, isAuthenticated]
  );

  // 防抖定时器引用
  const updateChartTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle ggplot2 config update (图表参数 Tab) - 使用防抖
  const handleUpdateChart = useCallback(
    async (config: Ggplot2Config) => {
      if (!currentTool || !selectedSubTool) return;

      // 先更新本地配置状态（立即更新，不等待 API）
      setGgplot2Config(config);

      // 清除之前的定时器
      if (updateChartTimerRef.current) {
        clearTimeout(updateChartTimerRef.current);
      }

      // 设置新的防抖定时器（1秒后执行）
      updateChartTimerRef.current = setTimeout(async () => {
        setIsAnalyzing(true);
        setJobStatus({
          status: "pending",
          progress: 0,
          message: "更新图表中...",
        });

        try {
          const analysisParams = {
            sub_tool: selectedSubTool,
            query_data: false, // 标记为不查询数据，只更新图表
            ggplot2: config,
          };

          setJobStatus({
            status: "running",
            progress: 50,
            message: "生成图表...",
          });

          const resp = await runAnalysisTool(currentTool.tool, analysisParams);

          if (resp.success) {
            // 更新图片 URL
            if (resp.image_url) {
              const timestamp = Date.now();
              setResultImageUrl(`${resp.image_url}?t=${timestamp}`);
            }

            // 更新分析结果，但保持表格数据不变
            setAnalysisResult({
              ...resp,
              data: resultTableData, // 保持原有表格数据
            });

            setJobStatus({
              status: "completed",
              progress: 100,
              message: resp.message || "图表更新完成！",
            });
          } else {
            setJobStatus({
              status: "failed",
              progress: 0,
              message: resp.message || "图表更新失败",
            });
          }
          setIsAnalyzing(false);
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? (err as Error).message : "图表更新失败";
          setJobStatus({
            status: "failed",
            progress: 0,
            message: errorMessage,
          });
          setIsAnalyzing(false);
        }
      }, 1000); // 1秒防抖
    },
    [currentTool, selectedSubTool, resultTableData]
  );

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (updateChartTimerRef.current) {
        clearTimeout(updateChartTimerRef.current);
      }
    };
  }, []);

  // Handle result download
  const handleDownloadResults = useCallback(async () => {
    if (!analysisResult) return;

    try {
      // Mock download
      const blob = new Blob(["Mock analysis results"], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentTool?.tool}_results.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download results:", error);
    }
  }, [analysisResult, currentTool]);

  // Handle sub-tool selection
  const handleSubToolSelect = useCallback((subToolName: string) => {
    setSelectedSubTool(subToolName);
    setAnalysisResult(null);
    setJobStatus(null);
    setIsAnalyzing(false);
    // 重置结果数据
    setResultTableData([]);
    setResultImageUrl(null);
    setGgplot2Config(null);
    setTableData([]);
  }, []);

  // Show analysis interface with tabs for selected sub-tool
  const selectedSubToolInfo = useMemo(() => {
    if (subTools.length > 0 && selectedSubTool) {
      return subTools.find((st) => st.name === selectedSubTool) || subTools[0];
    }
    return null;
  }, [subTools, selectedSubTool]);

  // Build tool info for selected sub-tool based on meta.json and parent tool info
  useEffect(() => {
    if (selectedSubTool && selectedSubToolInfo && currentTool) {
      // Check if we already have the correct tool_name to avoid infinite loop
      if (currentTool.tool_name === selectedSubTool) {
        return;
      }

      // Build sub-tool tool info from meta.json and parent tool info
      const subToolInfo: AnalysisToolInfo = {
        ...currentTool,
        tool_name: selectedSubTool,
        name: selectedSubToolInfo.title || selectedSubToolInfo.name,
        display_name: selectedSubToolInfo.title || selectedSubToolInfo.name,
        description: selectedSubToolInfo.description || currentTool.description,
        // If meta.json has params for this sub-tool, use them; otherwise use parent tool's params_schema
        params_schema: selectedSubToolInfo.params
          ? convertMetaParamsToSchema(selectedSubToolInfo.params)
          : currentTool.params_schema,
        defaults: selectedSubToolInfo.params
          ? extractDefaultsFromMetaParams(selectedSubToolInfo.params)
          : currentTool.defaults,
      };
      setCurrentTool(subToolInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubTool, selectedSubToolInfo]);

  // Scroll to selected tab when selectedSubTool changes
  useEffect(() => {
    if (selectedSubTool && tabsRef.current) {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        const tabsContainer = tabsRef.current;
        if (tabsContainer) {
          const scrollContainer = tabsContainer.querySelector(
            ".MuiTabs-scroller"
          ) as HTMLElement;
          if (scrollContainer) {
            const selectedIndex = subTools.findIndex(
              (st) => st.name === selectedSubTool
            );
            const tabElements =
              scrollContainer.querySelectorAll(".MuiTab-root");
            if (tabElements[selectedIndex]) {
              const selectedTab = tabElements[selectedIndex] as HTMLElement;
              const containerRect = scrollContainer.getBoundingClientRect();
              const tabRect = selectedTab.getBoundingClientRect();

              // Check if tab is not fully visible
              const isTabVisible =
                tabRect.left >= containerRect.left &&
                tabRect.right <= containerRect.right;

              if (!isTabVisible) {
                // Scroll to make the tab visible
                selectedTab.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                  inline: "center",
                });
              }
            }
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [selectedSubTool, subTools]);

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
        <Typography sx={{ ml: 2 }}>加载分析工具数据中...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => router.back()}>返回</Button>
      </Box>
    );
  }

  // If no sub-tools or tool meta, show error
  if (!subTools || subTools.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">工具不存在或没有可用功能</Typography>
        <Button onClick={() => router.back()}>返回</Button>
      </Box>
    );
  }

  // If no sub-tool is selected, show overview page with sub-tool cards
  if (!selectedSubTool) {
    return (
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Top toolbar */}
        <Paper
          elevation={1}
          sx={{
            p: 2,
            px: { xs: 3, md: 5, lg: 6 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 0,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={() => router.back()}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" fontWeight={600}>
              {toolMeta?.title || toolMeta?.name || slug.replace(/_/g, " ")}
            </Typography>
            {toolMeta?.category && (
              <Chip label={toolMeta.category} size="small" color="primary" />
            )}
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton onClick={() => setIsFavorited(!isFavorited)}>
              {isFavorited ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
            <IconButton>
              <Share />
            </IconButton>
          </Stack>
        </Paper>

        {/* Main content */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            px: { xs: 4, md: 8, lg: 12, xl: 16 },
            py: 4,
          }}
        >
          {/* Tool description */}
          <Paper
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 2,
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                boxShadow: 4,
              },
            }}
            className={animStyles.cardEnter}
          >
            <Typography variant="h4" gutterBottom>
              {toolMeta?.title || toolMeta?.name || slug.replace(/_/g, " ")}
            </Typography>
            <Box
              sx={{
                color: "text.secondary",
                "& p": {
                  marginBottom: 2,
                  lineHeight: 1.8,
                },
                "& h1, & h2, & h3, & h4, & h5, & h6": {
                  marginTop: 2,
                  marginBottom: 1,
                  fontWeight: 600,
                  color: "text.primary",
                },
                "& ul, & ol": {
                  paddingLeft: 3,
                  marginBottom: 2,
                },
                "& li": {
                  marginBottom: 0.5,
                },
                "& code": {
                  backgroundColor:
                    mode === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.05)",
                  padding: "2px 6px",
                  borderRadius: 1,
                  fontSize: "0.9em",
                  fontFamily: "monospace",
                },
                "& pre": {
                  backgroundColor:
                    mode === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)",
                  padding: 2,
                  borderRadius: 1,
                  overflow: "auto",
                  marginBottom: 2,
                },
                "& pre code": {
                  backgroundColor: "transparent",
                  padding: 0,
                },
                "& blockquote": {
                  borderLeft: 3,
                  borderColor: "primary.main",
                  paddingLeft: 2,
                  marginLeft: 0,
                  marginBottom: 2,
                  fontStyle: "italic",
                },
                "& a": {
                  color: "primary.main",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                },
                "& table": {
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: 2,
                },
                "& th, & td": {
                  border: 1,
                  borderColor: "divider",
                  padding: 1,
                },
                "& th": {
                  backgroundColor:
                    mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.05)",
                  fontWeight: 600,
                },
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {toolMeta?.detail ||
                  toolMeta?.description ||
                  currentTool?.description ||
                  "分析工具描述"}
              </ReactMarkdown>
            </Box>

            {/* Tool stats */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Visibility color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {toolStats.views} 次浏览
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Favorite color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {toolStats.favorites} 次收藏
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Analytics color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {toolStats.usage} 次使用
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Paper>

          {/* Sub-tools/modules cards */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ mb: 3, color: "text.primary" }}
              className={animStyles.sectionTitleEnter}
            >
              功能模块
            </Typography>
            <Grid container spacing={3}>
              {subTools.map((subTool, index) => (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4 }}
                  key={subTool.name || index}
                >
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      borderRadius: 2,
                      transition:
                        "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                      },
                    }}
                    className={`${animStyles.cardStagger}`}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                    onClick={() => handleSubToolSelect(subTool.name)}
                  >
                    <CardContent sx={{ flex: 1, p: 3 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={{ mb: 2 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "primary.light",
                            width: 48,
                            height: 48,
                            transition: "all 0.3s ease-in-out",
                          }}
                        >
                          {subTool.icon ? (
                            <Iconify icon={subTool.icon} />
                          ) : (
                            <Science />
                          )}
                        </Avatar>
                        <Typography variant="h6" fontWeight={600}>
                          {subTool.title || subTool.name}
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.875rem",
                          "& p": {
                            marginBottom: 1,
                            lineHeight: 1.6,
                          },
                          "& h1, & h2, & h3, & h4, & h5, & h6": {
                            marginTop: 1,
                            marginBottom: 0.5,
                            fontWeight: 600,
                            color: "text.primary",
                            fontSize: "1em",
                          },
                          "& ul, & ol": {
                            paddingLeft: 2,
                            marginBottom: 1,
                          },
                          "& li": {
                            marginBottom: 0.25,
                          },
                          "& code": {
                            backgroundColor:
                              mode === "dark"
                                ? "rgba(255,255,255,0.1)"
                                : "rgba(0,0,0,0.05)",
                            padding: "1px 4px",
                            borderRadius: 0.5,
                            fontSize: "0.85em",
                            fontFamily: "monospace",
                          },
                          "& a": {
                            color: "primary.main",
                            textDecoration: "none",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          },
                        }}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {subTool.description || ""}
                        </ReactMarkdown>
                      </Box>
                    </CardContent>
                    <CardActions
                      sx={{
                        p: 2,
                        pt: 0,
                        justifyContent: "flex-end",
                        alignItems: "flex-end",
                      }}
                    >
                      <Button
                        size="medium"
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubToolSelect(subTool.name);
                        }}
                        sx={{
                          transition: "all 0.3s ease-in-out",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                      >
                        开始分析
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Discussion area */}
          <Discussion
            title="讨论区"
            comments={comments}
            loading={loadingComments}
            isAuthenticated={isAuthenticated}
            newComment={newComment}
            setNewComment={setNewComment}
            onSubmitComment={handleCommentSubmit}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            onSubmitReply={handleReplySubmit}
            onToggleLike={handleLikeToggle}
            formatTime={formatTime}
          />
        </Box>
      </Box>
    );
  }

  // Show analysis interface with tabs for selected sub-tool
  // At this point, selectedSubTool must exist (checked above)
  const currentSelectedSubToolInfo =
    selectedSubToolInfo || (subTools.length > 0 ? subTools[0] : null);

  if (!currentSelectedSubToolInfo) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">工具信息不存在</Typography>
        <Button onClick={() => router.back()}>返回</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top toolbar with Tabs */}
      <Paper
        elevation={1}
        sx={{
          p: 0,
          borderRadius: 0,
          borderBottom: 1,
          borderColor: "divider",
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Box
          sx={{
            px: { xs: 3, md: 6, lg: 8 },
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Left fixed: Back button */}
          <IconButton onClick={() => setSelectedSubTool(null)}>
            <ArrowBack />
          </IconButton>

          {/* Center scrollable Tabs */}
          <Box
            ref={tabsRef}
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minWidth: 0, // Allow flexbox to shrink
              overflow: "hidden",
            }}
          >
            {subTools.length > 1 && (
              <Tabs
                value={subTools.findIndex((st) => st.name === selectedSubTool)}
                onChange={(_, newValue) => {
                  const newSubTool = subTools[newValue];
                  if (newSubTool) {
                    handleSubToolSelect(newSubTool.name);
                  }
                }}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  minHeight: "auto",
                  width: "80%", // Fixed percentage width
                  maxWidth: "80%",
                  "& .MuiTabs-scrollButtons": {
                    "&.Mui-disabled": {
                      opacity: 0.3,
                    },
                  },
                }}
              >
                {subTools.map((subTool) => (
                  <Tab
                    key={subTool.title || subTool.name}
                    label={subTool.title || subTool.name}
                    icon={
                      subTool.icon ? (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Iconify icon={subTool.icon} size={24} />
                        </Box>
                      ) : (
                        <Science />
                      )
                    }
                    iconPosition="start"
                    sx={{
                      minHeight: "48px",
                      py: 1,
                      minWidth: "auto",
                      px: 2,
                    }}
                  />
                ))}
              </Tabs>
            )}
          </Box>

          {/* Right fixed: Action buttons */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexShrink: 0, // Prevent shrinking
            }}
          >
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                setAnalysisResult(null);
                setJobStatus(null);
                setIsAnalyzing(false);
              }}
            >
              重置
            </Button>
            {analysisResult && (
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownloadResults}
              >
                下载结果
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Main content area */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left panel - Parameter configuration */}
        <Paper
          elevation={0}
          sx={{
            width: `${leftPanelWidth}%`,
            minWidth: "300px",
            maxWidth: "100%",
            borderRight: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            borderRadius: 0,
            transition: "all 0.3s ease-in-out",
          }}
          className={animStyles.sidebarSlideIn}
        >
          {/* Tabs */}
          <Tabs
            value={leftPanelTab}
            onChange={(_, newValue) => setLeftPanelTab(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab
              icon={<Settings />}
              label="查询参数"
              iconPosition="start"
              sx={{ minHeight: 72 }}
            />
            <Tab
              icon={<Settings />}
              label="图表参数"
              iconPosition="start"
              sx={{ minHeight: 72 }}
              disabled={!ggplot2Config}
            />
          </Tabs>

          {/* Tab content */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              p: { xs: 2, md: 2 },
              px: { xs: 2, md: 2.5 },
            }}
          >
            {leftPanelTab === 0 && currentTool && (
              <>
                <ParamsComponent
                  key={`${slug}-${selectedSubTool || "main"}-${paramsResetKey}`}
                  subTool={selectedSubTool as any}
                  values={analysisParameters}
                  onChange={handleParametersChange}
                />
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  sx={{ mt: 3 }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => {
                      setAnalysisResult(null);
                      setJobStatus(null);
                      setIsAnalyzing(false);
                      setAnalysisParameters({});
                      setParamsResetKey((k) => k + 1);
                      setResultTableData([]);
                      setResultImageUrl(null);
                      setGgplot2Config(null);
                      setTableData([]);
                    }}
                  >
                    重置
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={() => handleQueryData(analysisParameters)}
                    disabled={isAnalyzing}
                  >
                    查询数据
                  </Button>
                </Stack>

                {/* 分析结果数据表格 */}
                {resultTableData.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      查询结果数据
                    </Typography>
                    <Paper sx={{ p: 1 }}>
                      {(() => {
                        try {
                          const tableData = resultTableData;

                          if (tableData.length === 0) {
                            return (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                暂无数据
                              </Typography>
                            );
                          }

                          // 获取所有列名并生成 ag-grid 列定义
                          const columns = Object.keys(tableData[0] || {});
                          if (columns.length === 0) {
                            return (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                暂无列数据
                              </Typography>
                            );
                          }
                          // 检测是否为科学计数法数值
                          const isScientificNotation = (
                            value: any
                          ): boolean => {
                            if (typeof value === "string") {
                              return /^[-+]?[0-9]*\.?[0-9]+[eE][-+]?[0-9]+$/.test(
                                value.trim()
                              );
                            }
                            if (typeof value === "number") {
                              return (
                                (Math.abs(value) < 1e-3 && value !== 0) ||
                                Math.abs(value) >= 1e10 ||
                                (Math.abs(value) < 1 &&
                                  value.toString().includes("e"))
                              );
                            }
                            return false;
                          };

                          // 格式化科学计数法数值
                          const formatScientificNotation = (
                            value: any
                          ): string => {
                            // 明确检查 null、undefined 和空字符串
                            if (
                              value === null ||
                              value === undefined ||
                              value === ""
                            ) {
                              return "";
                            }
                            // 对于数字 0，直接返回 "0"
                            if (value === 0 || value === "0") {
                              return "0";
                            }

                            // 尝试转换为数字
                            let numValue: number;
                            if (typeof value === "number") {
                              numValue = value;
                            } else if (typeof value === "string") {
                              // 处理字符串格式的科学计数法，如 "1.7079e-08"
                              const trimmed = value.trim();
                              // 检查是否是科学计数法字符串
                              if (
                                /^[-+]?[0-9]*\.?[0-9]+[eE][-+]?[0-9]+$/.test(
                                  trimmed
                                )
                              ) {
                                numValue = parseFloat(trimmed);
                              } else {
                                // 尝试普通解析
                                numValue = parseFloat(trimmed);
                              }
                            } else {
                              // 其他类型，尝试转换
                              numValue = Number(value);
                            }

                            // 如果无法转换为有效数字，返回原始值的字符串形式
                            if (isNaN(numValue)) {
                              return String(value);
                            }

                            // 如果原值是科学计数法格式（字符串或数字），使用科学计数法显示
                            if (
                              isScientificNotation(value) ||
                              (Math.abs(numValue) < 1e-3 && numValue !== 0)
                            ) {
                              return numValue.toExponential();
                            }

                            // 对于普通数值，转换为字符串（保留适当精度）
                            return String(numValue);
                          };

                          // 检测列是否为数值列
                          const isNumericColumn = (col: string): boolean => {
                            if (tableData.length === 0) return false;
                            const sampleSize = Math.min(10, tableData.length);
                            for (let i = 0; i < sampleSize; i++) {
                              const value = tableData[i][col];
                              // 明确检查：null、undefined 和空字符串跳过，但 0 是有效数值
                              if (
                                value === null ||
                                value === undefined ||
                                value === ""
                              ) {
                                continue;
                              }
                              // 如果是数字类型（包括 0），认为是数值列
                              if (typeof value === "number") {
                                return true;
                              }
                              // 如果是科学计数法字符串，认为是数值列
                              if (
                                typeof value === "string" &&
                                isScientificNotation(value)
                              ) {
                                return true;
                              }
                              // 如果看起来像数字字符串，也检查
                              if (
                                typeof value === "string" &&
                                !isNaN(parseFloat(value)) &&
                                value.trim() !== ""
                              ) {
                                return true;
                              }
                            }
                            return false;
                          };

                          const columnDefs: ColDef[] = columns.map((col) => {
                            const isNumeric = isNumericColumn(col);
                            return {
                              headerName: col,
                              field: col,
                              sortable: true,
                              filter: true,
                              resizable: true,
                              ...(isNumeric && {
                                valueGetter: (params: any) => {
                                  // 确保返回原始值，让 valueFormatter 处理格式化
                                  return params.data?.[params.colDef.field];
                                },
                                valueFormatter: (params: any) => {
                                  // 明确检查 null、undefined 和空字符串
                                  if (
                                    params.value === null ||
                                    params.value === undefined ||
                                    params.value === ""
                                  ) {
                                    return "";
                                  }
                                  // 确保 0 值能正确显示
                                  const formatted = formatScientificNotation(
                                    params.value
                                  );
                                  // 如果格式化后为空字符串，返回原始值（可能是特殊情况）
                                  return formatted || String(params.value);
                                },
                                comparator: (valueA: any, valueB: any) => {
                                  const numA =
                                    typeof valueA === "string"
                                      ? parseFloat(valueA)
                                      : valueA;
                                  const numB =
                                    typeof valueB === "string"
                                      ? parseFloat(valueB)
                                      : valueB;
                                  if (isNaN(numA) && isNaN(numB)) return 0;
                                  if (isNaN(numA)) return 1;
                                  if (isNaN(numB)) return -1;
                                  return numA - numB;
                                },
                              }),
                            };
                          });

                          const defaultColDef: ColDef = {
                            sortable: true,
                            filter: true,
                            resizable: true,
                          };

                          const autoSizeAll = () => {
                            const api = gridApiRef.current;
                            if (!api) return;
                            if (
                              typeof (api as any).autoSizeAllColumns ===
                              "function"
                            ) {
                              (api as any).autoSizeAllColumns(false);
                            } else if (
                              typeof (api as any).sizeColumnsToFit ===
                              "function"
                            ) {
                              (api as any).sizeColumnsToFit();
                            }
                          };

                          const handleGridReady = (params: GridReadyEvent) => {
                            gridApiRef.current = params.api;
                            autoSizeAll();
                          };

                          const handleFirstDataRendered = (
                            _: FirstDataRenderedEvent
                          ) => {
                            autoSizeAll();
                          };

                          return (
                            <Paper
                              sx={{
                                height: "600px",
                                width: "100%",
                                overflow: "hidden",
                                borderRadius: 0,
                                bgcolor: "background.paper",
                              }}
                            >
                              <Box
                                className={
                                  mode === "dark"
                                    ? "ag-theme-alpine-dark"
                                    : "ag-theme-alpine"
                                }
                                sx={{
                                  height: "100%",
                                  width: "100%",
                                  "& .ag-paging-panel": {
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexWrap: "nowrap",
                                    gap: "4px",
                                    padding: "8px 12px",
                                    minHeight: "48px",
                                    "& > *": {
                                      flexShrink: 1,
                                      minWidth: 0,
                                    },
                                    "& .ag-paging-row-summary-panel": {
                                      whiteSpace: "nowrap",
                                      flexShrink: 1,
                                      minWidth: 0,
                                      marginRight: "4px",
                                      fontSize: "12px",
                                    },
                                    "& .ag-paging-page-summary-panel": {
                                      whiteSpace: "nowrap",
                                      flexShrink: 1,
                                      minWidth: 0,
                                      margin: "0 4px",
                                      fontSize: "12px",
                                    },
                                    "& .ag-paging-page-size": {
                                      whiteSpace: "nowrap",
                                      flexShrink: 1,
                                      minWidth: 0,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      "& .ag-paging-page-size-label": {
                                        whiteSpace: "nowrap",
                                        fontSize: "12px",
                                        marginRight: "4px",
                                      },
                                      "& select": {
                                        minWidth: "50px",
                                        maxWidth: "80px",
                                        fontSize: "12px",
                                        padding: "2px 4px",
                                      },
                                    },
                                    "& .ag-paging-button": {
                                      flexShrink: 0,
                                      minWidth: "20px",
                                      padding: "2px 4px",
                                      margin: "0 1px",
                                    },
                                    "& .ag-paging-button-group": {
                                      display: "flex",
                                      gap: "2px",
                                      "& .ag-paging-button": {
                                        margin: 0,
                                      },
                                    },
                                  },
                                }}
                              >
                                <AgGridReact
                                  ref={gridRef}
                                  rowData={tableData}
                                  columnDefs={columnDefs}
                                  defaultColDef={defaultColDef}
                                  theme="legacy"
                                  stopEditingWhenCellsLoseFocus={true}
                                  onGridReady={handleGridReady}
                                  onFirstDataRendered={handleFirstDataRendered}
                                  pagination={true}
                                  paginationPageSize={20}
                                  paginationPageSizeSelector={[10, 20, 50, 100]}
                                />
                              </Box>
                            </Paper>
                          );
                        } catch (e) {
                          return (
                            <Typography variant="body2" color="error">
                              数据解析失败: {String(e)}
                            </Typography>
                          );
                        }
                      })()}
                    </Paper>
                  </Box>
                )}
              </>
            )}

            {leftPanelTab === 1 && ggplot2Config && (
              <Box
                sx={{
                  height: "100%",
                  overflow: "auto",
                }}
              >
                <Ggplot2Component
                  config={ggplot2Config}
                  onChange={handleUpdateChart}
                  columns={
                    resultTableData.length > 0
                      ? Object.keys(resultTableData[0])
                      : []
                  }
                />
              </Box>
            )}
          </Box>
        </Paper>

        {/* Draggable divider */}
        <Box
          sx={{
            width: "4px",
            backgroundColor: "divider",
            cursor: "col-resize",
            "&:hover": {
              backgroundColor: "primary.main",
            },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseDown={handleMouseDown}
        >
          <Box
            sx={{
              width: "2px",
              height: "40px",
              backgroundColor: "text.secondary",
              borderRadius: "1px",
            }}
          />
        </Box>

        {/* Right analysis container */}
        <Box
          sx={{
            flex: 1,
            minWidth: "300px",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
          }}
        >
          {/* Analysis container */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 1, md: 1.5, lg: 2 },
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.paper",
                border: analysisResult ? "1px solid" : "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: analysisResult ? 2 : 1,
                },
              }}
              className={animStyles.containerFloatIn}
            >
              {isAnalyzing ? (
                <Stack alignItems="center" spacing={3}>
                  <Science
                    sx={{
                      fontSize: 64,
                      color: "primary.main",
                      animation: "pulse 2s ease-in-out infinite",
                      "@keyframes pulse": {
                        "0%, 100%": { opacity: 1 },
                        "50%": { opacity: 0.6 },
                      },
                    }}
                  />
                  <Typography variant="h6" color="primary" fontWeight={600}>
                    分析进行中...
                  </Typography>
                  {jobStatus && (
                    <Box sx={{ width: "100%", maxWidth: 400, px: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={jobStatus.progress}
                        sx={{
                          mb: 2,
                          height: 8,
                          borderRadius: 4,
                        }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                      >
                        {jobStatus.progress.toFixed(0)}% - {jobStatus.message}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              ) : resultImageUrl && resultTableData.length > 0 ? (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: { xs: 1, sm: 1.5, md: 2 },
                  }}
                >
                  <Stack
                    spacing={1}
                    alignItems="center"
                    sx={{ width: "100%", height: "100%" }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      sx={{ mb: 1 }}
                    >
                      <CheckCircle
                        sx={{
                          fontSize: 24,
                          color: "success.main",
                        }}
                      />
                      <Typography
                        variant="subtitle1"
                        color="success.main"
                        fontWeight={600}
                      >
                        {analysisResult?.success ? "分析完成" : "图表已生成"}
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        p: 2,
                        aspectRatio: "8 / 6",
                      }}
                    >
                      <Box
                        component="img"
                        src={resultImageUrl}
                        alt="Analysis Chart"
                        sx={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                        onError={(e) => {
                          console.error(
                            "Failed to load image:",
                            resultImageUrl
                          );
                          const target = e.target as HTMLImageElement;
                          if (target.src && !target.src.includes("?t=")) {
                            target.src = `${target.src}?t=${Date.now()}`;
                          }
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>
              ) : analysisResult &&
                analysisResult.success &&
                resultTableData.length === 0 ? (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: { xs: 2, sm: 3, md: 4 },
                  }}
                >
                  <Stack alignItems="center" spacing={3}>
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        bgcolor: "action.hover",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h1"
                        sx={{
                          fontSize: 48,
                          color: "text.secondary",
                          opacity: 0.5,
                        }}
                      >
                        📊
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      没有检索到数据
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                      sx={{ maxWidth: 400 }}
                    >
                      请调整查询参数后重新检索，或检查数据源是否包含符合条件的记录
                    </Typography>
                  </Stack>
                </Box>
              ) : analysisResult && !analysisResult.success ? (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    p: { xs: 2, sm: 3, md: 4 },
                    overflow: "auto",
                  }}
                >
                  <Stack alignItems="center" spacing={3}>
                    <Error
                      sx={{
                        fontSize: 64,
                        color: "error.main",
                      }}
                    />
                    <Typography
                      variant="h5"
                      color="error.main"
                      fontWeight={600}
                    >
                      分析失败
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {analysisResult.message}
                    </Typography>
                  </Stack>
                </Box>
              ) : (
                <Stack
                  alignItems="center"
                  spacing={3}
                  sx={{ p: { xs: 2, sm: 3, md: 4 } }}
                >
                  <Code
                    sx={{
                      fontSize: 64,
                      color: "grey.400",
                      opacity: 0.6,
                    }}
                  />
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    分析结果将在这里显示
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    配置参数并开始分析
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ mt: 3 }}
                    flexWrap="wrap"
                    justifyContent="center"
                  >
                    <Chip
                      icon={<Science />}
                      label={`当前工具: ${currentTool?.name || "未知工具"}`}
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                    <Chip
                      label={`分类: ${currentTool?.category || "未知"}`}
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </Stack>
                </Stack>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 登录提示对话框 */}
      <Dialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        aria-labelledby="login-dialog-title"
        aria-describedby="login-dialog-description"
      >
        <DialogTitle id="login-dialog-title">需要登录</DialogTitle>
        <DialogContent>
          <DialogContentText id="login-dialog-description">
            查询数据功能需要登录后才能使用，请先登录。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLoginDialog(false)}>取消</Button>
          <Button
            onClick={() => {
              setShowLoginDialog(false);
              router.push("/auth/login");
            }}
            variant="contained"
            autoFocus
          >
            前往登录
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
