"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
  Paper,
  Divider,
  Badge,
  Button,
} from "@mui/material";
import {
  Search,
  Add,
  ChevronLeft,
  PersonAdd,
  AttachFile,
  Mic,
  Image,
  Send,
  MoreVert,
} from "@mui/icons-material";
import { useAuthContext } from "@/contexts/AuthContext";

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  avatar?: string;
  isOnline?: boolean;
  status?: "online" | "away" | "busy";
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: string;
  type?: "text" | "image" | "file";
}

const mockChats: Chat[] = [
  {
    id: "1",
    title: "Lucian Obrien",
    lastMessage: "You: The waves crashe...",
    timestamp: "2 hours",
    unreadCount: 0,
    isOnline: true,
    status: "online",
  },
  {
    id: "2",
    title: "Deja Brady",
    lastMessage: "Sent a photo",
    timestamp: "3 hours",
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "3",
    title: "Harrison Stein",
    lastMessage: "She gazed up at the ni...",
    timestamp: "4 hours",
    unreadCount: 0,
    isOnline: true,
    status: "away",
  },
  {
    id: "4",
    title: "Reece Chung",
    lastMessage: "Thanks for the update!",
    timestamp: "5 hours",
    unreadCount: 1,
    isOnline: false,
  },
  {
    id: "5",
    title: "Lainey Davidson",
    lastMessage: "Let's meet tomorrow",
    timestamp: "6 hours",
    unreadCount: 0,
    isOnline: true,
    status: "busy",
  },
  {
    id: "6",
    title: "Cristopher Cardenas",
    lastMessage: "The project is ready",
    timestamp: "1 day",
    unreadCount: 0,
    isOnline: false,
  },
];

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Good morning! How can I help you today?",
    sender: "agent",
    timestamp: "09:30",
  },
  {
    id: "2",
    content: "I need help with my project",
    sender: "user",
    timestamp: "09:32",
  },
  {
    id: "3",
    content:
      "I'd be happy to help! What specific aspect of your project would you like assistance with?",
    sender: "agent",
    timestamp: "09:33",
  },
];

export default function AgentPage() {
  const { user } = useAuthContext();
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [leftPanelWidth, setLeftPanelWidth] = useState(33.33); // 左侧面板宽度百分比
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    // 这里可以加载对应聊天的消息
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // 拖拽分割线处理函数
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // 限制宽度范围在 20% 到 60% 之间
    const clampedWidth = Math.min(Math.max(newLeftWidth, 20), 60);
    setLeftPanelWidth(clampedWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 添加全局鼠标事件监听器
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
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

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online":
        return "#4CAF50";
      case "away":
        return "#FF9800";
      case "busy":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "background.default",
        overflow: "hidden", // 防止整体页面滚动
        pt: 0, // 移除顶部 padding，因为 Header 可能会隐藏
      }}
    >
      {/* 左侧聊天列表 */}
      <Paper
        elevation={0}
        sx={{
          width: `${leftPanelWidth}%`,
          minWidth: "100px",
          maxWidth: "60%",
          bgcolor: "grey.50",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* 顶部用户信息 */}
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: "#4CAF50",
                    border: "2px solid white",
                  }}
                />
              }
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "primary.main",
                }}
              >
                {user?.username?.[0]?.toUpperCase() || "U"}
              </Avatar>
            </Badge>
            <Box sx={{ ml: 2, flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {user?.username || "User"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Online
              </Typography>
            </Box>
            <IconButton size="small">
              <ChevronLeft />
            </IconButton>
            <IconButton size="small">
              <PersonAdd />
            </IconButton>
          </Box>

          {/* 搜索框 */}
          <TextField
            fullWidth
            placeholder="Search contacts..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "white",
              },
            }}
          />
        </Box>

        {/* 聊天列表 */}
        <List
          sx={{
            flex: 1,
            overflow: "auto",
            p: 0,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(0,0,0,0.2)",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "rgba(0,0,0,0.3)",
            },
          }}
        >
          {filteredChats.map((chat) => (
            <ListItem
              key={chat.id}
              onClick={() => handleChatSelect(chat)}
              sx={{
                cursor: "pointer",
                bgcolor:
                  selectedChat?.id === chat.id
                    ? "primary.light"
                    : "transparent",
                "&:hover": {
                  bgcolor:
                    selectedChat?.id === chat.id
                      ? "primary.light"
                      : "action.hover",
                },
                borderBottom: "1px solid",
                borderColor: "divider",
                py: 1.5,
              }}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    chat.isOnline ? (
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: getStatusColor(chat.status),
                          border: "2px solid white",
                        }}
                      />
                    ) : null
                  }
                >
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: "secondary.main",
                    }}
                  >
                    {chat.title[0]}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" fontWeight="bold" noWrap>
                    {chat.title}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {chat.lastMessage}
                  </Typography>
                }
              />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  ml: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {chat.timestamp}
                </Typography>
                {chat.unreadCount && chat.unreadCount > 0 && (
                  <Chip
                    label={chat.unreadCount}
                    size="small"
                    color="primary"
                    sx={{ minWidth: 20, height: 20, fontSize: "0.75rem" }}
                  />
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* 可拖拽的分割线 */}
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          width: "4px",
          bgcolor: isDragging ? "primary.main" : "divider",
          cursor: "col-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          "&:hover": {
            bgcolor: "primary.main",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            width: "12px",
            height: "40px",
            bgcolor: "transparent",
            borderRadius: "6px",
            "&:hover": {
              bgcolor: "rgba(0,0,0,0.1)",
            },
          },
        }}
      >
        {/* 拖拽指示器 */}
        <Box
          sx={{
            width: "2px",
            height: "20px",
            bgcolor: "white",
            borderRadius: "1px",
            opacity: isDragging ? 1 : 0.5,
          }}
        />
      </Box>

      {/* 右侧聊天窗口 */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "white",
        }}
      >
        {selectedChat ? (
          <>
            {/* 聊天头部 */}
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    selectedChat.isOnline ? (
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: getStatusColor(selectedChat.status),
                          border: "2px solid white",
                        }}
                      />
                    ) : null
                  }
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "secondary.main",
                    }}
                  >
                    {selectedChat.title[0]}
                  </Avatar>
                </Badge>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedChat.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedChat.isOnline ? "Online" : "Offline"}
                  </Typography>
                </Box>
              </Box>
              <IconButton>
                <MoreVert />
              </IconButton>
            </Box>

            {/* 消息区域 */}
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(0,0,0,0.2)",
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "rgba(0,0,0,0.3)",
                },
              }}
            >
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: "flex",
                    justifyContent:
                      message.sender === "user" ? "flex-end" : "flex-start",
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "70%",
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor:
                        message.sender === "user" ? "primary.main" : "grey.100",
                      color:
                        message.sender === "user" ? "white" : "text.primary",
                    }}
                  >
                    <Typography variant="body2">{message.content}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.5,
                        opacity: 0.7,
                        fontSize: "0.7rem",
                      }}
                    >
                      {message.timestamp}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            {/* 消息输入区域 */}
            <Box
              sx={{
                p: 2,
                borderTop: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <IconButton size="small">
                <Image />
              </IconButton>
              <IconButton size="small">
                <AttachFile />
              </IconButton>
              <TextField
                fullWidth
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                multiline
                maxRows={4}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                  },
                }}
              />
              <IconButton size="small">
                <Mic />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                color="primary"
              >
                <Send />
              </IconButton>
            </Box>
          </>
        ) : (
          /* 空状态 */
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 4,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                bgcolor: "warning.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
                position: "relative",
              }}
            >
              <Typography variant="h2" sx={{ color: "white" }}>
                💬
              </Typography>
              {/* 装饰性元素 */}
              <Box
                sx={{
                  position: "absolute",
                  top: -10,
                  right: -10,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -5,
                  left: -5,
                  width: 15,
                  height: 15,
                  borderRadius: "50%",
                  bgcolor: "secondary.main",
                }}
              />
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Good morning!
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
            >
              Write something awesome...
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
