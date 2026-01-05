"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Divider,
  useTheme,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
  alpha,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import {
  Add,
  Send,
  MoreVert,
  FlashOn,
  Download,
  Edit,
  Delete,
  Settings,
  AutoAwesome,
  Psychology,
  SmartToy,
  AttachFile,
  Close,
  InsertDriveFile,
} from "@mui/icons-material";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  OmicsHelperLogoIcon,
  OmicsArtistLogoMiniIcon,
} from "@/components/common";
import Iconify from "@/components/common/Iconify";
import {
  sendChatMessageStream,
  ChatMessage,
  ChatStreamChunk,
} from "@/libs/api/chat";
import { getAvatarUrl } from "@/utils/url";
import { NumberField } from "@/components/common/NumberField";
import {
  listConversations,
  getConversation,
  getConversationMessages,
  createConversation,
  deleteConversation,
  Conversation,
  Message as ConversationMessage,
} from "@/libs/api/conversation";
import {
  getLLMSources,
  getModelsForSource,
  updateConversationLLMConfig,
  LLMConfig,
  LLMSource,
  LLMModel,
} from "@/libs/api/llm";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface ChatHistory {
  id: number;
  title: string;
  date: string;
  group: "today" | "yesterday" | "older";
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: string;
  chart?: {
    type: string;
    filename: string;
    imageUrl?: string;
    pdfUrl?: string;
  };
  analysis?: {
    text: string;
    insights: string[];
    recommendations: string[];
    possibleAnalyses: string[];
  };
  sampleData?: Array<Record<string, any>>;
  isLoading?: boolean;
  needs_info?: boolean;
  files?: Array<{
    filename: string;
    size: number;
    content_type?: string;
    file_url?: string;
    file_path?: string;
    relative_path?: string;
  }>;
}

function AgentPageContent() {
  const { user } = useAuthContext();
  const theme = useTheme();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [leftPanelWidth, setLeftPanelWidth] = useState(20); // 左侧面板宽度百分比
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>(
    undefined
  );
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    number | null
  >(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [llmSources, setLlmSources] = useState<LLMSource[]>([]);
  const [availableModels, setAvailableModels] = useState<LLMModel[]>([]);
  const [llmConfig, setLlmConfig] = useState<LLMConfig | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelMenuAnchor, setModelMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get icon for LLM source
  const getSourceIcon = (source: string) => {
    switch (source) {
      case "DeepSeek":
        return (
          <Box
            component="img"
            src="/icons/DeepSeek.svg"
            alt="DeepSeek"
            sx={{
              width: 16,
              height: 16,
              objectFit: "contain",
            }}
          />
        );
      case "OpenAI":
        return <Iconify icon="arcticons:openai-chatgpt" size={16} />;
      case "Anthropic":
        return <Iconify icon="ri:anthropic-fill" size={16} />;
      case "Qwen":
        return (
          <Box
            component="img"
            src="/icons/qwen.avif"
            alt="Qwen"
            sx={{
              width: 16,
              height: 16,
              objectFit: "contain",
            }}
          />
        );
      case "Groq":
        return <FlashOn sx={{ fontSize: 16 }} />;
      case "Custom":
        return (
          <Box
            component="img"
            src="/icons/siliconflow.svg"
            alt="SiliconFlow"
            sx={{
              width: 16,
              height: 16,
              objectFit: "contain",
            }}
          />
        );
      default:
        return <FlashOn sx={{ fontSize: 16 }} />;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get default base URL for a source
  const getDefaultBaseUrl = (source: string): string => {
    switch (source) {
      case "Qwen":
        return "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
      case "DeepSeek":
        return "https://api.deepseek.com/v1";
      case "Custom":
        return "https://api.siliconflow.cn/v1/";
      default:
        return "";
    }
  };

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    loadLLMSources();
    // Initialize default LLM config if not set
    if (!llmConfig) {
      const defaultSource = "DeepSeek";
      const defaultBaseUrl = getDefaultBaseUrl(defaultSource);
      setLlmConfig({
        source: defaultSource,
        model: "deepseek-chat",
        base_url: defaultBaseUrl,
        temperature: 0.7,
        max_tokens: 4000,
      });
      loadModelsForSource(defaultSource);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load models when source changes (for model selection menu)
  useEffect(() => {
    if (llmConfig?.source) {
      loadModelsForSource(llmConfig.source);
    }
  }, [llmConfig?.source]);

  // Load LLM sources
  const loadLLMSources = async () => {
    try {
      const sources = await getLLMSources();
      setLlmSources(sources);
    } catch (err: any) {
      console.error("Failed to load LLM sources:", err);
    }
  };

  // Load models for a source
  const loadModelsForSource = async (source: string) => {
    try {
      setIsLoadingModels(true);
      const models = await getModelsForSource(source);
      setAvailableModels(models);
    } catch (err: any) {
      console.error("Failed to load models:", err);
      setAvailableModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      loadConversationMessages(selectedConversationId);
      setConversationId(selectedConversationId);
      // Load conversation to get LLM config
      // Only load if we're not in the middle of saving (to avoid race conditions)
      loadConversationConfig(selectedConversationId);
    } else {
      setMessages([]);
      setConversationId(undefined);
      setLlmConfig(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId]);

  // Load conversation config
  const loadConversationConfig = async (convId: number) => {
    try {
      const conversation = await getConversation(convId);
      console.log("Loading conversation config for ID:", convId);
      // FastAPI may return meta_data (by_alias=True) or metadata (by_alias=False)
      // Support both for compatibility
      const metadata = conversation.metadata || conversation.meta_data;
      console.log("Conversation metadata:", metadata);
      console.log("Conversation meta_data:", conversation.meta_data);
      if (metadata?.llm_config) {
        const loadedConfig = metadata.llm_config;
        console.log("Loaded LLM config from database:", loadedConfig);
        setLlmConfig(loadedConfig);
        // Load models for the source
        await loadModelsForSource(loadedConfig.source);
      } else {
        // Use default config based on source
        const defaultSource = "DeepSeek";
        const defaultBaseUrl = getDefaultBaseUrl(defaultSource);
        setLlmConfig({
          source: defaultSource,
          model: "deepseek-chat",
          base_url: defaultBaseUrl,
          temperature: 0.7,
          max_tokens: 4000,
          // api_key is not set, will be read from settings
        });
        await loadModelsForSource(defaultSource);
      }
    } catch (err: any) {
      console.error("Failed to load conversation config:", err);
    }
  };

  // Handle settings dialog open
  const handleOpenSettings = () => {
    if (selectedConversationId) {
      loadConversationConfig(selectedConversationId);
    } else {
      // Default config for new conversation
      const defaultSource = "DeepSeek";
      const defaultBaseUrl = getDefaultBaseUrl(defaultSource);
      setLlmConfig({
        source: defaultSource,
        model: "deepseek-chat",
        base_url: defaultBaseUrl,
        temperature: 0.7,
        max_tokens: 4000,
      });
      loadModelsForSource(defaultSource);
    }
    setSettingsDialogOpen(true);
  };

  // Handle settings dialog close
  const handleCloseSettings = () => {
    setSettingsDialogOpen(false);
    setError(null);
    setSaveSuccess(false);
  };

  // Handle LLM config save
  const handleSaveLLMConfig = async () => {
    if (!llmConfig || !llmConfig.source || !llmConfig.model) {
      setError("请选择模型供应商和模型");
      return;
    }

    try {
      setError(null);
      setSaveSuccess(false);

      // Remove api_key from config before saving (will be read from settings)
      const configToSave = {
        ...llmConfig,
        api_key: undefined, // Don't save api_key, use from settings
      };

      // Use conversationId (current active conversation) if available,
      // otherwise use selectedConversationId (selected in sidebar)
      // Priority: conversationId > selectedConversationId
      let targetConversationId = conversationId || selectedConversationId;

      // If no conversation exists, create a new one
      if (!targetConversationId) {
        const newConversation = await createConversation({
          title: "New Conversation",
          metadata: { llm_config: configToSave },
        });
        targetConversationId = newConversation.id;
        setSelectedConversationId(newConversation.id);
        setConversationId(newConversation.id);
        // Reload conversations to show the new one
        loadConversations();
      } else {
        // Update existing conversation
        console.log(
          "Updating conversation config:",
          targetConversationId,
          configToSave
        );
        await updateConversationLLMConfig(targetConversationId, configToSave);
        console.log("Conversation config updated successfully");

        // Update local state immediately for better UX (before reloading from DB)
        setLlmConfig(configToSave);

        // Ensure both states are in sync
        if (!selectedConversationId) {
          setSelectedConversationId(targetConversationId);
        }
        if (!conversationId) {
          setConversationId(targetConversationId);
        }

        // Don't reload immediately - the local state is already updated
        // Only reload if user explicitly requests it or when conversation changes
        // This prevents race conditions with the useEffect that watches selectedConversationId
        // The local state update (setLlmConfig(configToSave)) above ensures UI is correct
      }

      setSaveSuccess(true);
      // Close dialog after a short delay to show success message
      setTimeout(() => {
        setSettingsDialogOpen(false);
        setSaveSuccess(false);
      }, 500);
    } catch (err: any) {
      console.error("Failed to save LLM config:", err);
      setError(err.message || "保存模型配置失败");
      setSaveSuccess(false);
    }
  };

  // Handle source change
  const handleSourceChange = async (source: string) => {
    if (llmConfig) {
      const defaultBaseUrl = getDefaultBaseUrl(source);
      setLlmConfig({
        ...llmConfig,
        source,
        model: "",
        base_url: defaultBaseUrl,
        // Remove api_key when changing source, will be read from settings
        api_key: undefined,
      });
      await loadModelsForSource(source);
      // Set first model as default
      const models = await getModelsForSource(source);
      if (models.length > 0) {
        setLlmConfig({
          ...llmConfig,
          source,
          model: models[0].value,
          base_url: defaultBaseUrl,
          // Remove api_key when changing source, will be read from settings
          api_key: undefined,
        });
      }
    }
  };

  // Helper function to group conversations by date
  const groupConversationsByDate = (
    conversations: Conversation[]
  ): ChatHistory[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return conversations.map((conv) => {
      const convDate = new Date(conv.updated_at);
      let group: "today" | "yesterday" | "older";
      let dateStr: string;

      if (convDate >= today) {
        group = "today";
        dateStr = "Today";
      } else if (convDate >= yesterday) {
        group = "yesterday";
        dateStr = "Yesterday";
      } else {
        group = "older";
        dateStr = convDate.toLocaleDateString();
      }

      return {
        id: conv.id,
        title: conv.title || "New Conversation",
        date: dateStr,
        group,
      };
    });
  };

  // Load conversations from backend
  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const response = await listConversations(0, 100, false);
      const grouped = groupConversationsByDate(response.conversations);
      setChatHistory(grouped);
    } catch (err: any) {
      console.error("Failed to load conversations:", err);
      setError(err.message || "加载对话列表失败");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Load messages for a conversation
  const loadConversationMessages = async (convId: number) => {
    try {
      setIsLoadingMessages(true);
      const messagesData = await getConversationMessages(convId);

      // Convert backend messages to frontend message format
      const convertedMessages: Message[] = messagesData.map((msg) => {
        const frontendMsg: Message = {
          id: msg.id.toString(),
          content: msg.content,
          sender: msg.role === "user" ? "user" : "agent",
          timestamp: new Date(msg.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        // Extract visualization data from metadata
        if (msg.metadata?.visualization) {
          const viz = msg.metadata.visualization;
          frontendMsg.chart = {
            type: "generated",
            filename: viz.image_url?.split("/").pop() || "chart.png",
            imageUrl: viz.image_url,
            pdfUrl: viz.pdf_url,
          };
        }

        // Extract sample_data from metadata (for example displays)
        if (msg.metadata?.sample_data) {
          frontendMsg.sampleData = msg.metadata.sample_data;
        }

        // Extract analysis data from metadata
        if (msg.metadata?.analysis) {
          const analysis = msg.metadata.analysis;
          frontendMsg.analysis = {
            text: analysis.analysis || "",
            insights: analysis.insights || [],
            recommendations: analysis.recommendations || [],
            possibleAnalyses: analysis.possible_analyses || [],
          };
        }

        // Extract needs_info from metadata
        if (msg.metadata?.needs_info !== undefined) {
          frontendMsg.needs_info = msg.metadata.needs_info;
        }

        // Extract files from metadata
        if (msg.metadata?.files) {
          frontendMsg.files = msg.metadata.files;
        }

        return frontendMsg;
      });

      setMessages(convertedMessages);
    } catch (err: any) {
      console.error("Failed to load messages:", err);
      setError(err.message || "加载消息失败");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Handle new chat
  const handleNewChat = async () => {
    setSelectedConversationId(null);
    setMessages([]);
    setConversationId(undefined);
    setNewMessage("");
  };

  // Handle conversation selection
  const handleConversationSelect = (convId: number) => {
    setSelectedConversationId(convId);
  };

  // Handle conversation deletion - open dialog
  const handleDeleteConversation = (e: React.MouseEvent, convId: number) => {
    e.stopPropagation(); // Prevent triggering conversation selection
    setConversationToDelete(convId);
    setDeleteDialogOpen(true);
  };

  // Confirm deletion
  const handleConfirmDelete = async () => {
    if (!conversationToDelete) return;

    try {
      await deleteConversation(conversationToDelete);
      // If deleted conversation was selected, clear selection
      if (selectedConversationId === conversationToDelete) {
        setSelectedConversationId(null);
        setMessages([]);
        setConversationId(undefined);
      }
      // Reload conversations
      loadConversations();
      // Close dialog
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete conversation:", err);
      setError(err.message || "删除对话失败");
      // Close dialog even on error
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  // Cancel deletion
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && uploadedFiles.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content:
        newMessage ||
        (uploadedFiles.length > 0
          ? `已上传 ${uploadedFiles.length} 个文件`
          : ""),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const filesToSend = [...uploadedFiles];
    setNewMessage("");
    setUploadedFiles([]);
    setIsLoading(true);
    setError(null);

    // Create loading message
    const loadingMessageId = (Date.now() + 1).toString();
    const loadingMessage: Message = {
      id: loadingMessageId,
      content: "正在思考...",
      sender: "agent",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    // If no conversation ID, a new conversation will be created by the backend
    const currentConvId = conversationId;

    try {
      // Process streaming response
      // Note: Conversation history is read from database, not from request parameter
      let currentAgentMessage: Message | null = null;
      let currentImageUrl: string | null = null;

      await sendChatMessageStream(
        newMessage || "",
        currentConvId,
        filesToSend,
        (chunk: ChatStreamChunk) => {
          if (chunk.type === "message") {
            // Update or create agent message
            setMessages((prev) => {
              const existingIndex = prev.findIndex(
                (m) => m.id === loadingMessageId
              );
              if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = {
                  ...updated[existingIndex],
                  content: chunk.content || "",
                  isLoading: false,
                  needs_info: chunk.needs_info,
                };
                currentAgentMessage = updated[existingIndex];
                return updated;
              } else {
                const newMsg: Message = {
                  id: loadingMessageId,
                  content: chunk.content || "",
                  sender: "agent",
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  isLoading: false,
                };
                currentAgentMessage = newMsg;
                return [...prev, newMsg];
              }
            });
          } else if (chunk.type === "visualization") {
            // Update message with visualization
            if (chunk.image_url) {
              currentImageUrl = chunk.image_url;
              const imageUrl = chunk.image_url;
              setMessages((prev) => {
                const existingIndex = prev.findIndex(
                  (m) => m.id === loadingMessageId
                );
                if (existingIndex >= 0) {
                  const updated = [...prev];
                  updated[existingIndex] = {
                    ...updated[existingIndex],
                    chart: {
                      type: "generated",
                      filename: imageUrl.split("/").pop() || "chart.png",
                      imageUrl: imageUrl,
                      pdfUrl: chunk.pdf_url,
                    },
                    sampleData: chunk.sample_data || undefined,
                  };
                  return updated;
                }
                return prev;
              });
            }
          } else if (chunk.type === "analysis") {
            // Update message with analysis
            setMessages((prev) => {
              const existingIndex = prev.findIndex(
                (m) => m.id === loadingMessageId
              );
              if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = {
                  ...updated[existingIndex],
                  analysis: {
                    text: chunk.analysis || "",
                    insights: chunk.insights || [],
                    recommendations: chunk.recommendations || [],
                    possibleAnalyses: chunk.possible_analyses || [],
                  },
                };
                return updated;
              }
              return prev;
            });
          }
        }
      );
    } catch (err: any) {
      const errorMessage = err.message || "发送消息时出错，请重试";
      setError(errorMessage);

      // 如果是 401 错误，提示用户登录
      if (errorMessage.includes("登录") || errorMessage.includes("401")) {
        // 可以在这里添加重定向到登录页的逻辑
        console.warn("未授权，请先登录");
      }

      setMessages((prev) => {
        const existingIndex = prev.findIndex((m) => m.id === loadingMessageId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            content: errorMessage.includes("登录")
              ? "请先登录后再使用此功能。"
              : "抱歉，处理您的请求时出现了错误。请重试。",
            isLoading: false,
          };
          return updated;
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
      // Reload conversations to get the new conversation if it was created
      if (!currentConvId) {
        // Reload conversations and select the newest one
        try {
          const response = await listConversations(0, 1, false);
          if (response.conversations.length > 0) {
            const newConv = response.conversations[0];
            setConversationId(newConv.id);
            setSelectedConversationId(newConv.id);
            // Reload full conversation list
            loadConversations();
          }
        } catch (err) {
          console.error("Failed to get new conversation:", err);
          // Still reload conversations list
          loadConversations();
        }
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // 拖拽处理
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const windowWidth = window.innerWidth;
    const newWidth = (e.clientX / windowWidth) * 100;

    // 限制宽度范围在 15% 到 50% 之间
    const clampedWidth = Math.max(15, Math.min(50, newWidth));
    setLeftPanelWidth(clampedWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const todayChats = chatHistory.filter((chat) => chat.group === "today");
  const yesterdayChats = chatHistory.filter(
    (chat) => chat.group === "yesterday"
  );

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      {/* Chat Sidebar (History) */}
      <Paper
        elevation={0}
        sx={{
          width: { xs: 0, md: `${leftPanelWidth}%` },
          minWidth: { xs: 0, md: 200 },
          maxWidth: { xs: 0, md: "50%" },
          display: { xs: "none", md: "flex" },
          "&[aria-hidden='true']": {
            pointerEvents: "none",
          },
          flexDirection: "column",
          bgcolor: "background.default",
          borderRight: 1,
          borderColor: "divider",
          borderRadius: 0,
          position: "relative",
        }}
      >
        {/* New Chat Button */}
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Add />}
            onClick={handleNewChat}
            sx={{
              bgcolor: "background.paper",
              borderColor: "divider",
              color: "text.primary",
              fontWeight: 700,
              textTransform: "none",
              py: 1.5,
              boxShadow: 1,
              "&:hover": {
                boxShadow: 2,
                bgcolor: "background.paper",
              },
            }}
          >
            New Chat
          </Button>
        </Box>

        {/* Chat History */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 1,
          }}
        >
          {isLoadingConversations ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : chatHistory.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                暂无对话记录
              </Typography>
            </Box>
          ) : (
            <>
              {chatHistory.filter((chat) => chat.group === "today").length >
                0 && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      px: 2,
                      py: 1,
                      display: "block",
                      fontWeight: 700,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Today
                  </Typography>
                  {chatHistory
                    .filter((chat) => chat.group === "today")
                    .map((chat) => (
                      <Button
                        key={chat.id}
                        fullWidth
                        onClick={() => handleConversationSelect(chat.id)}
                        sx={{
                          justifyContent: "space-between",
                          px: 2,
                          py: 1.5,
                          textTransform: "none",
                          color: "text.primary",
                          bgcolor:
                            selectedConversationId === chat.id
                              ? "action.selected"
                              : "transparent",
                          "&:hover": {
                            bgcolor: "action.hover",
                            "& .delete-button": {
                              opacity: 1,
                            },
                          },
                          position: "relative",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                            textAlign: "left",
                            pr: 1,
                          }}
                        >
                          {chat.title}
                        </Typography>
                        <Box
                          className="delete-button"
                          component="div"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(e, chat.id);
                          }}
                          sx={{
                            opacity: 0,
                            transition: "opacity 0.2s",
                            color: "error.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            cursor: "pointer",
                            "&:hover": {
                              bgcolor: "error.light",
                              color: "error.dark",
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </Box>
                      </Button>
                    ))}
                </Box>
              )}

              {chatHistory.filter((chat) => chat.group === "yesterday").length >
                0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      px: 2,
                      py: 1,
                      display: "block",
                      fontWeight: 700,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Yesterday
                  </Typography>
                  {chatHistory
                    .filter((chat) => chat.group === "yesterday")
                    .map((chat) => (
                      <Button
                        key={chat.id}
                        fullWidth
                        onClick={() => handleConversationSelect(chat.id)}
                        sx={{
                          justifyContent: "space-between",
                          px: 2,
                          py: 1.5,
                          textTransform: "none",
                          color: "text.secondary",
                          bgcolor:
                            selectedConversationId === chat.id
                              ? "action.selected"
                              : "transparent",
                          "&:hover": {
                            bgcolor: "action.hover",
                            "& .delete-button": {
                              opacity: 1,
                            },
                          },
                          position: "relative",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                            textAlign: "left",
                            pr: 1,
                          }}
                        >
                          {chat.title}
                        </Typography>
                        <Box
                          className="delete-button"
                          component="div"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(e, chat.id);
                          }}
                          sx={{
                            opacity: 0,
                            transition: "opacity 0.2s",
                            color: "error.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            cursor: "pointer",
                            "&:hover": {
                              bgcolor: "error.light",
                              color: "error.dark",
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </Box>
                      </Button>
                    ))}
                </Box>
              )}

              {chatHistory.filter((chat) => chat.group === "older").length >
                0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      px: 2,
                      py: 1,
                      display: "block",
                      fontWeight: 700,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Older
                  </Typography>
                  {chatHistory
                    .filter((chat) => chat.group === "older")
                    .map((chat) => (
                      <Button
                        key={chat.id}
                        fullWidth
                        onClick={() => handleConversationSelect(chat.id)}
                        sx={{
                          justifyContent: "space-between",
                          px: 2,
                          py: 1.5,
                          textTransform: "none",
                          color: "text.secondary",
                          bgcolor:
                            selectedConversationId === chat.id
                              ? "action.selected"
                              : "transparent",
                          "&:hover": {
                            bgcolor: "action.hover",
                            "& .delete-button": {
                              opacity: 1,
                            },
                          },
                          position: "relative",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                            textAlign: "left",
                            pr: 1,
                          }}
                        >
                          {chat.title}
                        </Typography>
                        <Box
                          className="delete-button"
                          component="div"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(e, chat.id);
                          }}
                          sx={{
                            opacity: 0,
                            transition: "opacity 0.2s",
                            color: "error.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            cursor: "pointer",
                            "&:hover": {
                              bgcolor: "error.light",
                              color: "error.dark",
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </Box>
                      </Button>
                    ))}
                </Box>
              )}
            </>
          )}
        </Box>

        {/* User Info */}
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar
            src={getAvatarUrl(user?.avatar_url, user?.username, 32)}
            sx={{
              width: 32,
              height: 32,
              bgcolor: user?.avatar_url ? "grey.100" : "grey.300",
            }}
          >
            {!user?.avatar_url && (user?.username?.[0]?.toUpperCase() || "U")}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {user?.username || "Dr. User"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pro Plan
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Drag Handle */}
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          width: { xs: 0, md: 4 },
          display: { xs: "none", md: "block" },
          "&[aria-hidden='true']": {
            pointerEvents: "none",
          },
          bgcolor: "divider",
          cursor: "col-resize",
          "&:hover": {
            bgcolor: "primary.main",
          },
          transition: "background-color 0.2s",
          position: "relative",
          zIndex: 1,
        }}
      />

      {/* Chat Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
          position: "relative",
        }}
      >
        {/* Top Bar */}
        <Box
          sx={{
            height: 64,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            bgcolor: "background.paper",
            backdropFilter: "blur(8px)",
            opacity: 0.8,
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ flex: 1 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Model:
              </Typography>
              <Chip
                icon={getSourceIcon(llmConfig?.source || "DeepSeek")}
                label={
                  llmConfig
                    ? availableModels.find((m) => m.value === llmConfig.model)
                        ?.label ||
                      llmConfig.model.split("/").pop() ||
                      llmConfig.model
                    : "DeepSeek Chat"
                }
                size="small"
                onClick={(e) => {
                  if (llmConfig?.source) {
                    setModelMenuAnchor(e.currentTarget);
                  }
                }}
                sx={{
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.primary.main, 0.8)
                      : theme.palette.primary.main,
                  color: (theme) =>
                    theme.palette.mode === "dark"
                      ? theme.palette.primary.contrastText
                      : theme.palette.primary.contrastText,
                  fontWeight: 700,
                  cursor: llmConfig?.source ? "pointer" : "default",
                  "&:hover": {
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.primary.main, 0.9)
                        : theme.palette.primary.dark,
                  },
                  "& .MuiChip-icon": {
                    color: (theme) => theme.palette.primary.contrastText,
                  },
                }}
              />
              <Menu
                anchorEl={modelMenuAnchor}
                open={Boolean(modelMenuAnchor)}
                onClose={() => setModelMenuAnchor(null)}
                PaperProps={{
                  sx: {
                    maxHeight: 300,
                    width: "auto",
                    minWidth: 200,
                  },
                }}
              >
                {availableModels.length > 0 ? (
                  availableModels.map((model) => (
                    <MenuItem
                      key={model.value}
                      selected={llmConfig?.model === model.value}
                      onClick={async () => {
                        if (llmConfig) {
                          const newConfig = {
                            ...llmConfig,
                            model: model.value,
                            api_key: undefined, // Don't save api_key
                          };
                          // Update conversation config if there's an active conversation
                          const targetId =
                            conversationId || selectedConversationId;
                          if (targetId) {
                            try {
                              console.log(
                                "Updating model to:",
                                model.value,
                                "for conversation:",
                                targetId
                              );
                              console.log("Config to save:", newConfig);
                              await updateConversationLLMConfig(
                                targetId,
                                newConfig
                              );
                              // Update local state immediately for better UX
                              setLlmConfig(newConfig);
                              // Reload conversation config to ensure sync with database
                              await loadConversationConfig(targetId);
                              console.log("Model updated and config reloaded");
                            } catch (err) {
                              console.error("Failed to update model:", err);
                              // Revert local state on error
                              setLlmConfig(llmConfig);
                            }
                          } else {
                            // No active conversation, just update local state
                            setLlmConfig(newConfig);
                          }
                        }
                        setModelMenuAnchor(null);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      {getSourceIcon(llmConfig?.source || "DeepSeek")}
                      {model.label}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>暂无可用模型</MenuItem>
                )}
              </Menu>
            </Stack>
          </Stack>
          <IconButton
            size="small"
            color="default"
            onClick={handleOpenSettings}
            title="模型设置"
          >
            <MoreVert />
          </IconButton>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: { xs: 12, md: 18 },
            py: 6,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: "flex",
                justifyContent:
                  message.sender === "user" ? "flex-end" : "flex-start",
                gap: 2,
              }}
            >
              {message.sender === "agent" && (
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "primary.light",
                    border: 2,
                    borderColor: "background.paper",
                    boxShadow: 1,
                    flexShrink: 0,
                  }}
                >
                  <OmicsHelperLogoIcon sx={{ fontSize: 30 }} />
                </Avatar>
              )}

              <Box
                sx={{
                  maxWidth: { xs: "85%", md: "48rem" },
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {message.sender === "user" ? (
                  <Paper
                    elevation={2}
                    sx={{
                      bgcolor: "grey.800",
                      color: "white",
                      p: 2,
                      borderRadius: 3,
                      borderTopRightRadius: 0.5,
                    }}
                  >
                    {message.content && (
                      <Typography
                        variant="body1"
                        sx={{
                          mb:
                            message.files && message.files.length > 0 ? 1.5 : 0,
                        }}
                      >
                        {message.content}
                      </Typography>
                    )}
                    {message.files && message.files.length > 0 && (
                      <Box
                        sx={{
                          mt: message.content ? 1.5 : 0,
                          pt: message.content ? 1.5 : 0,
                          borderTop: message.content ? 1 : 0,
                          borderColor: "rgba(255,255,255,0.1)",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        {message.files.map(
                          (
                            file: {
                              filename: string;
                              size: number;
                              content_type?: string;
                              file_url?: string;
                            },
                            idx: number
                          ) => (
                            <Paper
                              key={idx}
                              elevation={2}
                              sx={{
                                position: "relative",
                                width: 200,
                                p: 1,
                                borderRadius: 1,
                                bgcolor: "rgba(255,255,255,0.15)",
                                border: 1,
                                borderColor: "rgba(255,255,255,0.2)",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1,
                                    bgcolor: "rgba(255,255,255,0.2)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <InsertDriveFile
                                    sx={{
                                      fontSize: 20,
                                      color: "white",
                                    }}
                                  />
                                </Box>
                                <Box
                                  sx={{
                                    flex: 1,
                                    minWidth: 0,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 500,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      mb: 0.25,
                                      fontSize: "0.875rem",
                                      lineHeight: 1.2,
                                      color: "white",
                                    }}
                                  >
                                    {file.filename}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: "0.75rem",
                                      lineHeight: 1.2,
                                      color: "rgba(255,255,255,0.8)",
                                    }}
                                  >
                                    {(file.size / 1024).toFixed(1)} KB
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>
                          )
                        )}
                      </Box>
                    )}
                  </Paper>
                ) : (
                  <>
                    {/* Loading state - only show thinking animation, no message bubble */}
                    {message.isLoading ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          p: 2,
                        }}
                      >
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="text.secondary">
                          正在思考...
                        </Typography>
                      </Box>
                    ) : (
                      /* Agent Message - only show when not loading */
                      message.content && (
                        <Paper
                          elevation={1}
                          sx={{
                            bgcolor: "background.paper",
                            border: 1,
                            borderColor: "divider",
                            p: 3,
                            borderRadius: 3,
                            borderTopLeftRadius: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              "& p": {
                                margin: 0,
                                marginBottom: 1.5,
                                "&:last-child": {
                                  marginBottom: 0,
                                },
                              },
                              "& ul, & ol": {
                                margin: 0,
                                marginBottom: 1.5,
                                paddingLeft: 3,
                                "&:last-child": {
                                  marginBottom: 0,
                                },
                              },
                              "& h1, & h2, & h3, & h4, & h5, & h6": {
                                marginTop: 2,
                                marginBottom: 1,
                                "&:first-child": {
                                  marginTop: 0,
                                },
                              },
                              "& code": {
                                bgcolor: "action.hover",
                                px: 0.5,
                                py: 0.25,
                                borderRadius: 0.5,
                                fontSize: "0.875em",
                                fontFamily: "monospace",
                              },
                              "& pre": {
                                bgcolor: "action.hover",
                                p: 2,
                                borderRadius: 1,
                                overflow: "auto",
                                "& code": {
                                  bgcolor: "transparent",
                                  px: 0,
                                  py: 0,
                                },
                              },
                              "& blockquote": {
                                borderLeft: 3,
                                borderColor: "divider",
                                pl: 2,
                                ml: 0,
                                fontStyle: "italic",
                                color: "text.secondary",
                              },
                              "& table": {
                                width: "100%",
                                borderCollapse: "collapse",
                                marginBottom: 1.5,
                              },
                              "& th, & td": {
                                border: 1,
                                borderColor: "divider",
                                px: 1,
                                py: 0.5,
                              },
                              "& th": {
                                bgcolor: "action.hover",
                                fontWeight: 600,
                              },
                            }}
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </Box>
                        </Paper>
                      )
                    )}

                    {message.chart && message.chart.imageUrl && (
                      <Paper
                        elevation={3}
                        sx={{
                          bgcolor: "grey.900",
                          borderRadius: 3,
                          overflow: "hidden",
                          border: 1,
                          borderColor: "grey.700",
                          position: "relative",
                          mt: 2,
                        }}
                      >
                        {/* Artist Panda Badge */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            zIndex: 10,
                            bgcolor: "rgba(0,0,0,0.5)",
                            backdropFilter: "blur(8px)",
                            color: "white",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            border: 1,
                            borderColor: "rgba(255,255,255,0.1)",
                          }}
                        >
                          <OmicsArtistLogoMiniIcon
                            sx={{ fontSize: 16, color: "white" }}
                          />
                          <Typography variant="caption" fontSize={10}>
                            Generated by Artist Panda
                          </Typography>
                        </Box>

                        {/* Chart Image */}
                        <Box
                          sx={{
                            bgcolor: "grey.800",
                            minHeight: 300,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            borderRadius: 2,
                            m: 0.5,
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={message.chart.imageUrl}
                            alt={message.chart.filename}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "600px",
                              objectFit: "contain",
                            }}
                          />
                        </Box>

                        {/* Chart Footer */}
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: "grey.900",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="caption" color="grey.400">
                            {message.chart.filename}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            {message.chart.imageUrl && (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<Download />}
                                href={message.chart.imageUrl}
                                download
                                sx={{
                                  bgcolor: "grey.700",
                                  color: "white",
                                  textTransform: "none",
                                  fontSize: 10,
                                  py: 0.5,
                                  px: 1,
                                  "&:hover": {
                                    bgcolor: "grey.600",
                                  },
                                }}
                              >
                                Download
                              </Button>
                            )}
                            {message.chart.pdfUrl && (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<Download />}
                                href={message.chart.pdfUrl}
                                download
                                sx={{
                                  bgcolor: "grey.700",
                                  color: "white",
                                  textTransform: "none",
                                  fontSize: 10,
                                  py: 0.5,
                                  px: 1,
                                  "&:hover": {
                                    bgcolor: "grey.600",
                                  },
                                }}
                              >
                                PDF
                              </Button>
                            )}
                          </Stack>
                        </Box>
                      </Paper>
                    )}

                    {/* Sample Data Table (for example displays) */}
                    {message.sampleData && message.sampleData.length > 0 && (
                      <Paper
                        elevation={1}
                        sx={{
                          bgcolor: "background.paper",
                          border: 1,
                          borderColor: "divider",
                          p: 3,
                          borderRadius: 3,
                          mt: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}
                        >
                          示例数据（前 {message.sampleData.length} 行）
                        </Typography>
                        <Box
                          sx={{
                            height: 400,
                            width: "100%",
                            "& .ag-theme-quartz": {
                              "--ag-font-family":
                                theme.typography.fontFamily || "inherit",
                              "--ag-font-size": "12px",
                            } as React.CSSProperties,
                          }}
                        >
                          <AgGridReact
                            rowData={message.sampleData}
                            columnDefs={
                              message.sampleData.length > 0
                                ? Object.keys(message.sampleData[0]).map(
                                    (key) => ({
                                      field: key,
                                      headerName: key,
                                      sortable: true,
                                      filter: true,
                                      resizable: true,
                                      flex: 1,
                                    })
                                  )
                                : []
                            }
                            defaultColDef={{
                              sortable: true,
                              filter: true,
                              resizable: true,
                            }}
                            pagination={true}
                            paginationPageSize={10}
                            domLayout="normal"
                          />
                        </Box>
                      </Paper>
                    )}

                    {message.analysis && (
                      <Paper
                        elevation={1}
                        sx={{
                          bgcolor: "background.paper",
                          border: 1,
                          borderColor: "divider",
                          p: 3,
                          borderRadius: 3,
                          mt: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ mb: 2, fontWeight: 700, color: "primary.main" }}
                        >
                          结果分析
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ mb: 3, whiteSpace: "pre-line" }}
                        >
                          {message.analysis.text}
                        </Typography>

                        {message.analysis.insights.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 1, fontWeight: 700 }}
                            >
                              关键发现
                            </Typography>
                            <List dense>
                              {message.analysis.insights.map((insight, idx) => (
                                <ListItem key={idx} sx={{ py: 0.5 }}>
                                  <ListItemText
                                    primary={insight}
                                    primaryTypographyProps={{
                                      variant: "body2",
                                    }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}

                        {message.analysis.recommendations.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 1, fontWeight: 700 }}
                            >
                              建议
                            </Typography>
                            <List dense>
                              {message.analysis.recommendations.map(
                                (rec, idx) => (
                                  <ListItem key={idx} sx={{ py: 0.5 }}>
                                    <ListItemText
                                      primary={rec}
                                      primaryTypographyProps={{
                                        variant: "body2",
                                      }}
                                    />
                                  </ListItem>
                                )
                              )}
                            </List>
                          </Box>
                        )}

                        {message.analysis.possibleAnalyses.length > 0 && (
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 1, fontWeight: 700 }}
                            >
                              后续可进行的分析
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {message.analysis.possibleAnalyses.map(
                                (analysis, idx) => (
                                  <Chip
                                    key={idx}
                                    label={analysis}
                                    size="small"
                                    sx={{
                                      bgcolor: "secondary.light",
                                      color: "secondary.dark",
                                      fontWeight: 500,
                                    }}
                                  />
                                )
                              )}
                            </Stack>
                          </Box>
                        )}
                      </Paper>
                    )}
                  </>
                )}
              </Box>

              {message.sender === "user" && (
                <Avatar
                  src={getAvatarUrl(user?.avatar_url, user?.username, 40)}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: user?.avatar_url ? "grey.100" : "grey.300",
                    border: 2,
                    borderColor: "background.paper",
                    boxShadow: 1,
                    flexShrink: 0,
                  }}
                >
                  {!user?.avatar_url &&
                    (user?.username?.[0]?.toUpperCase() || "U")}
                </Avatar>
              )}
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            px: { xs: 12, md: 18 },
            pt: 6,
            position: "relative",
          }}
        >
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "background.paper",
              zIndex: 10,
            }}
          >
            {/* Uploaded Files Display - Inside Dialog */}
            {uploadedFiles.length > 0 && (
              <Box
                sx={{
                  p: 1,
                  ml: 1,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {uploadedFiles.map((file, index) => (
                  <Paper
                    key={`${file.name}-${index}`}
                    elevation={2}
                    sx={{
                      position: "relative",
                      width: 200,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: "background.paper",
                      border: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          bgcolor: "grey.100",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <InsertDriveFile
                          sx={{
                            fontSize: 20,
                            color: "text.secondary",
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            mb: 0.25,
                            fontSize: "0.875rem",
                            lineHeight: 1.2,
                          }}
                        >
                          {file.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            fontSize: "0.75rem",
                            lineHeight: 1.2,
                          }}
                        >
                          文件
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setUploadedFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                      sx={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        width: 20,
                        height: 20,
                        bgcolor: "rgba(0, 0, 0, 0.6)",
                        color: "white",
                        "&:hover": {
                          bgcolor: "rgba(0, 0, 0, 0.8)",
                        },
                      }}
                    >
                      <Close sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            )}
            {/* Input Box */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.2,
                p: 0,
              }}
            >
              <IconButton
                component="label"
                sx={{
                  color: "text.secondary",
                  flexShrink: 0,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
                title="上传文件"
              >
                <AttachFile />
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      const fileArray = Array.from(files);
                      setUploadedFiles((prev) => [...prev, ...fileArray]);
                    }
                    // Reset input to allow selecting the same file again
                    e.target.value = "";
                  }}
                />
              </IconButton>
              <Box
                sx={{
                  position: "relative",
                  flex: 1,
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Send a message to AI agent..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "transparent",
                      borderRadius: 2,
                      pr: 10,
                      "& fieldset": {
                        border: "none",
                      },
                      "&:hover fieldset": {
                        border: "none",
                      },
                      "&.Mui-focused fieldset": {
                        border: "none",
                      },
                    },
                  }}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={
                    (!newMessage.trim() && uploadedFiles.length === 0) ||
                    isLoading
                  }
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                    "&.Mui-disabled": {
                      bgcolor: "action.disabledBackground",
                      color: "action.disabled",
                    },
                  }}
                >
                  {isLoading ? <CircularProgress size={20} /> : <Send />}
                </IconButton>
              </Box>
            </Box>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textAlign: "center",
              display: "block",
              mt: 1,
            }}
          >
            AI can make mistakes. Please verify important information.
          </Typography>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        disableEnforceFocus={true}
        disableAutoFocus={false}
      >
        <DialogTitle id="delete-dialog-title">删除对话</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            确定要删除这条对话记录吗？此操作无法撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit">
            取消
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            autoFocus
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>

      {/* LLM Settings Dialog */}
      <Dialog
        open={settingsDialogOpen}
        onClose={handleCloseSettings}
        maxWidth="sm"
        fullWidth
        aria-labelledby="settings-dialog-title"
        disableEnforceFocus={true}
        disableAutoFocus={false}
      >
        <DialogTitle id="settings-dialog-title">模型设置</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Source Selection */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                模型供应商
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={llmConfig?.source || ""}
                  onChange={(e) => handleSourceChange(e.target.value)}
                  displayEmpty
                >
                  {llmSources.map((source) => (
                    <MenuItem key={source.value} value={source.value}>
                      {source.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Model Selection */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                模型
              </Typography>
              {isLoadingModels ? (
                <CircularProgress size={24} />
              ) : (
                <FormControl fullWidth disabled={!llmConfig?.source}>
                  <Select
                    value={llmConfig?.model || ""}
                    onChange={(e) =>
                      setLlmConfig({ ...llmConfig!, model: e.target.value })
                    }
                    displayEmpty
                  >
                    {availableModels.length > 0 ? (
                      availableModels.map((model) => (
                        <MenuItem key={model.value} value={model.value}>
                          {model.label}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        请先选择供应商
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              )}
            </Box>

            {/* Base URL (for Custom, Qwen, DeepSeek sources) */}
            {(llmConfig?.source === "Custom" ||
              llmConfig?.source === "Qwen" ||
              llmConfig?.source === "DeepSeek" ||
              !llmConfig?.source) && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  API 地址
                </Typography>
                <TextField
                  fullWidth
                  placeholder={
                    llmConfig?.source
                      ? getDefaultBaseUrl(llmConfig.source)
                      : "https://api.siliconflow.cn/v1/"
                  }
                  value={llmConfig?.base_url || ""}
                  onChange={(e) =>
                    setLlmConfig({ ...llmConfig!, base_url: e.target.value })
                  }
                />
              </Box>
            )}

            {/* Temperature */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Temperature: {llmConfig?.temperature ?? 0.7}
              </Typography>
              <NumberField
                fullWidth
                min={0}
                max={2}
                step={0.1}
                value={llmConfig?.temperature ?? 0.7}
                onChange={(value) =>
                  setLlmConfig({
                    ...llmConfig!,
                    temperature: value,
                  })
                }
              />
            </Box>

            {/* Max Tokens */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                最大 Token 数
              </Typography>
              <NumberField
                fullWidth
                min={1}
                value={llmConfig?.max_tokens || 4000}
                onChange={(value) =>
                  setLlmConfig({
                    ...llmConfig!,
                    max_tokens: value || undefined,
                  })
                }
              />
            </Box>
          </Stack>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {saveSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              模型配置已保存
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings} color="inherit">
            取消
          </Button>
          <Button
            onClick={handleSaveLLMConfig}
            variant="contained"
            disabled={
              !llmConfig || !llmConfig.source || !llmConfig.model || saveSuccess
            }
          >
            {saveSuccess ? "已保存" : "保存"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function AgentPage() {
  return (
    <ProtectedRoute>
      <AgentPageContent />
    </ProtectedRoute>
  );
}
