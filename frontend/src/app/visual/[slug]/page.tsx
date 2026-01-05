"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from "@mui/material";
import {
  ArrowBack,
  Refresh,
  Settings,
  TableChart,
  Description,
  Comment,
  Code,
  Javascript,
  Download,
} from "@mui/icons-material";
import DataTableTab from "./components/DataTableTab";
import ConfigTab from "./components/ConfigTab";
import DocsTab from "./components/DocsTab";
import CommentsTab from "./components/CommentsTab";
import { EChartsComponent } from "@/components/charts/echarts";
import { useChartStore } from "@/stores/chartStore";
import {
  getVisualToolInfo,
  runChartTool,
  type VisualToolInfo,
} from "@/libs/api/visual";
import Iconify from "@/components/common/Iconify";
import { ChartDataItem } from "@/components/charts/types";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useAuthContext } from "@/contexts/AuthContext";

export default function ToolPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const { mode } = useThemeContext();
  const theme = useTheme();

  // 从URL参数获取绘制类型，默认为py
  const chartTypeFromUrl = searchParams.get("type") as "js" | "py" | "r" | null;
  const initialChartType = chartTypeFromUrl || "js";

  const [currentTool, setCurrentTool] = useState<VisualToolInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [leftPanelWidth, setLeftPanelWidth] = useState(40); // 百分比
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [docsMarkdown, setDocsMarkdown] = useState<string>("");

  // 使用 Zustand store
  const {
    tableData,
    setTableData,
    setSelectedVariables,
    setToolName,
    dataUpdated,
    setDataUpdated,
  } = useChartStore();

  // R/Python 绘图相关状态
  const [rPythonParams, setRPythonParams] = useState<{ [key: string]: any }>(
    {}
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("error");

  // 获取登录状态
  const { isAuthenticated } = useAuthContext();

  // 显示 Snackbar
  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info" = "error"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // 图表类型和渲染状态
  const [chartType, setChartType] = useState<"js" | "py" | "r">(
    initialChartType
  );

  // 监听URL参数变化，更新图表类型
  useEffect(() => {
    const chartTypeFromUrl = searchParams.get("type") as
      | "js"
      | "py"
      | "r"
      | null;
    if (chartTypeFromUrl && chartTypeFromUrl !== chartType) {
      setChartType(chartTypeFromUrl);
    }
  }, [searchParams]);

  // 设置工具名称，触发图表类型路由
  useEffect(() => {
    if (slug) {
      setToolName(slug);
    }
  }, [slug, setToolName]);

  // 当 slug 变化时，重置相关状态
  useEffect(() => {
    setCurrentTool(null);
    setError(null);
    setDocsMarkdown("");
    setActiveTab(0);
    setTableData([]);
    setGeneratedImageUrl(null);
    setGeneratedPdfUrl(null);
    setRPythonParams({}); // 重置参数配置
  }, [slug]);

  // 获取工具数据
  useEffect(() => {
    const fetchToolsData = async () => {
      try {
        setLoading(true);

        // 从后端获取工具信息
        const tool = await getVisualToolInfo(slug);

        if (tool) {
          setCurrentTool(tool);
          // 如果工具有 ggplot2 或 heatmap 配置，初始化默认参数
          if (chartType === "r") {
            const initialParams: { [key: string]: any } = {};
            if (tool.ggplot2) {
              initialParams.ggplot2 = tool.ggplot2;
            }
            if (tool.heatmap) {
              initialParams.heatmap = tool.heatmap;
            }
            if (Object.keys(initialParams).length > 0) {
              setRPythonParams(initialParams);
            }
          }
        } else {
          setError(`工具 "${slug}" 未找到`);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch tools data:", err);
        setError("获取工具数据失败");
      } finally {
        setLoading(false);
      }
    };

    fetchToolsData();
  }, [slug, chartType]);

  // 拖拽处理
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const windowWidth = window.innerWidth;
    const newWidth = (e.clientX / windowWidth) * 100;

    // 限制宽度范围在 20% 到 80% 之间
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
        <Typography sx={{ ml: 2 }}>加载工具数据中...</Typography>
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

  if (!currentTool) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">工具不存在</Typography>
        <Button onClick={() => router.back()}>返回</Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 顶部工具栏 */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
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
            {currentTool.display_name || currentTool.name}
          </Typography>
          <Chip label={currentTool.category} size="small" color="primary" />
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            重置
          </Button>

          {/* 图表类型切换开关 */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="JavaScript">
              <span>
                <IconButton
                  size="small"
                  disabled={!currentTool?.has_js}
                  onClick={() => {
                    setChartType("js");
                    router.replace(`/visual/${slug}?type=js`);
                  }}
                  sx={{
                    borderRadius: 1.5,
                    width: 36,
                    height: 36,
                    border: 1,
                    borderColor: chartType === "js" ? "white" : "success.main",
                    color: chartType === "js" ? "white" : "success.main",
                    bgcolor:
                      chartType === "js"
                        ? "success.main"
                        : mode === "dark"
                        ? "rgba(255,255,255,0.1)"
                        : "background.paper",
                    "&:hover": {
                      bgcolor:
                        chartType === "js" ? "success.dark" : "success.light",
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
                  size="small"
                  disabled={!currentTool?.has_r}
                  onClick={() => {
                    console.log("R button clicked, setting chartType to r");
                    setChartType("r");
                    router.replace(`/visual/${slug}?type=r`);
                  }}
                  sx={{
                    borderRadius: 1.5,
                    width: 36,
                    height: 36,
                    border: 1,
                    borderColor: chartType === "r" ? "white" : "info.main",
                    color: chartType === "r" ? "white" : "info.main",
                    bgcolor:
                      chartType === "r"
                        ? "info.main"
                        : mode === "dark"
                        ? "rgba(255,255,255,0.1)"
                        : "background.paper",
                    "&:hover": {
                      bgcolor: chartType === "r" ? "info.dark" : "info.light",
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
                  size="small"
                  disabled={!currentTool?.has_python}
                  onClick={() => {
                    console.log(
                      "Python button clicked, setting chartType to py"
                    );
                    setChartType("py");
                    router.replace(`/visual/${slug}?type=py`);
                  }}
                  sx={{
                    borderRadius: 1.5,
                    width: 36,
                    height: 36,
                    border: 1,
                    borderColor: chartType === "py" ? "white" : "warning.main",
                    color: chartType === "py" ? "white" : "warning.main",
                    bgcolor:
                      chartType === "py"
                        ? "warning.main"
                        : mode === "dark"
                        ? "rgba(255,255,255,0.1)"
                        : "background.paper",
                    "&:hover": {
                      bgcolor:
                        chartType === "py" ? "warning.dark" : "warning.light",
                      color: "white",
                    },
                    "&.Mui-disabled": {
                      opacity: 0.3,
                    },
                  }}
                >
                  <Iconify icon="simple-icons:python" size={20} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Stack>
      </Paper>

      {/* 主要内容区域 */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* 左侧面板 */}
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
          }}
        >
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab icon={<TableChart />} label="数据" iconPosition="start" />
            <Tab icon={<Settings />} label="参数配置" iconPosition="start" />
            <Tab icon={<Description />} label="使用介绍" iconPosition="start" />
            <Tab icon={<Comment />} label="评论" iconPosition="start" />
          </Tabs>

          {/* Tab 内容 */}
          <Box sx={{ flex: 1, overflow: "auto", pt: 2, px: 2, pb: 0 }}>
            {activeTab === 0 && (
              <DataTableTab
                tableData={tableData}
                slug={slug}
                chartType={chartType}
                onVariableChange={setSelectedVariables}
                onDataChange={(data) => {
                  // 处理数组和对象两种格式
                  setTableData(data);
                }}
                onDrawClick={async () => {
                  // 检查登录状态
                  if (!isAuthenticated) {
                    setShowLoginDialog(true);
                    return;
                  }

                  const hasData = Array.isArray(tableData)
                    ? tableData.length > 0
                    : tableData &&
                      typeof tableData === "object" &&
                      Object.keys(tableData).length > 0;
                  if (!hasData) {
                    showSnackbar("请先加载数据", "warning");
                    return;
                  }
                  setIsDrawing(true);
                  setGeneratedImageUrl(null);
                  setGeneratedPdfUrl(null);
                  try {
                    const engine = chartType === "r" ? "r" : "python";
                    const result = await runChartTool({
                      chart_type: slug,
                      engine: engine,
                      data: tableData as any,
                      ...rPythonParams,
                    });
                    // 数据已使用，重置更新状态
                    setDataUpdated(false);
                    if (
                      result.success &&
                      result.output_files &&
                      result.output_files.length >= 2
                    ) {
                      // output_files[0] 是 PNG，output_files[1] 是 PDF
                      // 先清空 URL，强制组件重新渲染
                      setGeneratedImageUrl(null);
                      setGeneratedPdfUrl(null);
                      // 保存文件路径，避免在 setTimeout 中访问可能为 undefined 的值
                      const imagePath = result.output_files[0];
                      const pdfPath = result.output_files[1];
                      // 使用 setTimeout 确保清空后再设置新 URL，并添加时间戳防止缓存
                      setTimeout(() => {
                        const timestamp = Date.now();
                        const imageUrl = `${imagePath}?t=${timestamp}`;
                        const pdfUrl = `${pdfPath}?t=${timestamp}`;
                        setGeneratedImageUrl(imageUrl);
                        setGeneratedPdfUrl(pdfUrl);
                      }, 10);
                    } else {
                      showSnackbar(result.message || "绘图失败", "error");
                    }
                  } catch (error: any) {
                    // 如果是401错误，说明未登录
                    if (
                      error.response?.status === 401 ||
                      error.message?.includes("请先登录")
                    ) {
                      setShowLoginDialog(true);
                    } else {
                      showSnackbar(error.message || "绘图失败", "error");
                    }
                  } finally {
                    setIsDrawing(false);
                  }
                }}
                isDrawing={isDrawing}
              />
            )}

            {activeTab === 1 && (
              <ConfigTab
                chartType={chartType}
                currentTool={currentTool}
                slug={slug}
                onParametersChange={setRPythonParams}
                tableData={(() => {
                  // 获取第一个表格的数据用于 columns
                  if (Array.isArray(tableData) && tableData.length > 0) {
                    return tableData;
                  } else if (tableData && typeof tableData === "object") {
                    // 如果是对象格式（多表格），获取第一个表格的数据
                    const firstKey = Object.keys(tableData)[0];
                    const firstTable = firstKey
                      ? (tableData as Record<string, any[]>)[firstKey]
                      : [];
                    return firstTable;
                  }
                  return [];
                })()}
                initialParams={rPythonParams}
                onUpdateParams={() => {
                  // 参数更新时的回调（可选）
                  showSnackbar("参数已更新", "success");
                }}
                onDrawClick={async (includeData = false) => {
                  // 检查登录状态
                  if (!isAuthenticated) {
                    setShowLoginDialog(true);
                    return;
                  }

                  // 参数配置 Tab 的按钮
                  // 如果 includeData 为 true，说明数据有更新，需要传递数据
                  // 否则只传递参数，使用之前上传的数据
                  setIsDrawing(true);
                  setGeneratedImageUrl(null);
                  setGeneratedPdfUrl(null);
                  try {
                    const engine = chartType === "r" ? "r" : "python";
                    const requestParams: any = {
                      chart_type: slug,
                      engine: engine,
                      ...rPythonParams,
                    };

                    // 如果数据有更新，传递数据
                    const hasData = Array.isArray(tableData)
                      ? tableData.length > 0
                      : tableData &&
                        typeof tableData === "object" &&
                        Object.keys(tableData).length > 0;
                    if (includeData && hasData) {
                      requestParams.data = tableData;
                    }

                    const result = await runChartTool(requestParams);

                    // 数据已使用，重置更新状态
                    if (includeData) {
                      setDataUpdated(false);
                    }
                    if (
                      result.success &&
                      result.output_files &&
                      result.output_files.length >= 2
                    ) {
                      // output_files[0] 是 PNG，output_files[1] 是 PDF
                      // 先清空 URL，强制组件重新渲染
                      setGeneratedImageUrl(null);
                      setGeneratedPdfUrl(null);
                      // 保存文件路径，避免在 setTimeout 中访问可能为 undefined 的值
                      const imagePath = result.output_files[0];
                      const pdfPath = result.output_files[1];
                      // 使用 setTimeout 确保清空后再设置新 URL，并添加时间戳防止缓存
                      setTimeout(() => {
                        const timestamp = Date.now();
                        const imageUrl = `${imagePath}?t=${timestamp}`;
                        const pdfUrl = `${pdfPath}?t=${timestamp}`;
                        setGeneratedImageUrl(imageUrl);
                        setGeneratedPdfUrl(pdfUrl);
                      }, 10);
                    } else {
                      showSnackbar(result.message || "绘图失败", "error");
                    }
                  } catch (error: any) {
                    // 如果是401错误，说明未登录
                    if (
                      error.response?.status === 401 ||
                      error.message?.includes("请先登录")
                    ) {
                      setShowLoginDialog(true);
                    } else {
                      showSnackbar(
                        error.message || "绘图失败，请先在数据 Tab 中加载数据",
                        "error"
                      );
                    }
                  } finally {
                    setIsDrawing(false);
                  }
                }}
                isDrawing={isDrawing}
              />
            )}

            {activeTab === 2 && (
              <DocsTab toolName={currentTool?.tool || slug} />
            )}

            {activeTab === 3 && <CommentsTab toolName={currentTool?.name} />}
          </Box>
        </Paper>

        {/* 可拖拽分界线 */}
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

        {/* 右侧绘图容器 */}
        <Box
          sx={{
            flex: 1,
            minWidth: "300px",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
          }}
        >
          {/* 绘图区域标题 */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">图表预览</Typography>
            {/* PDF 下载按钮 */}
            {generatedPdfUrl && (chartType === "r" || chartType === "py") && (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<Download />}
                href={generatedPdfUrl}
                download
              >
                下载 PDF
              </Button>
            )}
          </Box>

          {/* 绘图容器 */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
            }}
          >
            <Paper
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.paper",
                border: chartType ? "1px solid" : "2px dashed",
                borderColor: "divider",
                overflow: "hidden",
              }}
            >
              {chartType ? (
                <Box sx={{ width: "100%", height: "100%" }}>
                  {chartType === "js" ? (
                    <EChartsComponent
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : chartType === "py" ? (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Python 图表将在这里显示
                      </Typography>
                    </Box>
                  ) : chartType === "r" || chartType === "py" ? (
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: "100%",
                        border: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        p: 2,
                        aspectRatio: "8 / 6",
                      }}
                    >
                      {generatedImageUrl ? (
                        <Box
                          component="img"
                          key={generatedImageUrl}
                          src={generatedImageUrl}
                          alt="Generated chart"
                          sx={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                          onError={(e) => {
                            // 如果图片加载失败，尝试重新加载
                            const target = e.target as HTMLImageElement;
                            if (target.src && !target.src.includes("?t=")) {
                              target.src = `${target.src}?t=${Date.now()}`;
                            }
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {chartType === "r" ? "R" : "Python"} chart will be
                          displayed here
                          <br />
                          Please click the{" "}
                          <b style={{ color: theme.palette.primary.main }}>
                            Draw Image
                          </b>{" "}
                          button to generate the chart.
                        </Typography>
                      )}
                    </Box>
                  ) : null}
                </Box>
              ) : (
                <Stack alignItems="center" spacing={2}>
                  <Code sx={{ fontSize: 48, color: "grey.400" }} />
                  <Typography variant="h6" color="text.secondary">
                    图表将在这里显示
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    调整参数将实时更新图表
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Chip
                      label="JavaScript 图表"
                      variant={chartType === "js" ? "filled" : "outlined"}
                      color={chartType === "js" ? "success" : "default"}
                    />
                    <Chip
                      label="Python 图表"
                      variant={chartType === "py" ? "filled" : "outlined"}
                      color={chartType === "py" ? "primary" : "default"}
                    />
                    <Chip
                      label="R 图表"
                      variant={chartType === "r" ? "filled" : "outlined"}
                      color={chartType === "r" ? "warning" : "default"}
                    />
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    当前图表类型: {chartType}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip
                      label={`当前工具: ${currentTool?.name || "未知工具"}`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={`分类: ${currentTool?.category || "未知"}`}
                      variant="outlined"
                      size="small"
                    />
                  </Stack>
                </Stack>
              )}
            </Paper>
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
            绘制图片功能需要登录后才能使用，请先登录。
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

      {/* Snackbar 提示 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
  );
}
