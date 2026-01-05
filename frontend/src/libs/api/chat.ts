/**
 * Chat API functions for conversational interactions
 * This module provides a clean interface to the chat API without agent-specific logic
 */

import { apiRequest } from "./api";

export interface ChatMessage {
  role: "user" | "agent";
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: number;
}

export interface ChatResponse {
  message: string;
  needs_info: boolean;
  missing_params: string[];
  suggestions: string[];
  visual_request?: {
    chart_type: string;
    engine: string;
    data?: any[];
    params: Record<string, any>;
    reasoning: string;
  };
}

export interface VisualizationResult {
  success: boolean;
  message: string;
  image_url?: string;
  pdf_url?: string;
  data_url?: string;
}

export interface AnalysisResult {
  analysis: string;
  insights: string[];
  recommendations: string[];
  possible_analyses: string[];
}

export interface ChatStreamChunk {
  type:
    | "message"
    | "generating"
    | "visualization"
    | "analyzing"
    | "analysis"
    | "error";
  content?: string;
  needs_info?: boolean;
  missing_params?: string[];
  suggestions?: string[];
  success?: boolean;
  image_url?: string;
  pdf_url?: string;
  data_url?: string;
  message?: string;
  analysis?: string;
  insights?: string[];
  recommendations?: string[];
  possible_analyses?: string[];
  sample_data?: Array<Record<string, any>>;
}

/**
 * Send a message to the chat API
 */
export const sendChatMessage = async (
  message: string,
  conversationId?: number
): Promise<ChatResponse> => {
  try {
    const response = await apiRequest<ChatResponse>("/chat", {
      method: "POST",
      data: {
        message,
        conversation_id: conversationId,
      },
    });
    return response;
  } catch (error) {
    console.error("Failed to send chat message:", error);
    throw error;
  }
};

/**
 * Send a message to the chat API with streaming response
 * Note: Conversation history is read from database, not from request parameter
 */
export const sendChatMessageStream = async (
  message: string,
  conversationId: number | undefined,
  files: File[] = [],
  onChunk: (chunk: ChatStreamChunk) => void
): Promise<void> => {
  try {
    // Get API URL from config
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // 使用 HttpOnly Cookie 认证，无需手动添加 Authorization header
    // Cookie 会通过 credentials: "include" 自动发送
    let response: Response;
    
    if (files.length > 0) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append("message", message);
      if (conversationId) {
        formData.append("conversation_id", conversationId.toString());
      }
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });

      response = await fetch(`${apiUrl}/api/v1/chat/stream`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
    } else {
      // Use JSON for text-only messages
      response = await fetch(`${apiUrl}/api/v1/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
        }),
      });
    }

    if (!response.ok) {
      // 处理 401 未授权错误
      if (response.status === 401) {
        // 清除可能的无效认证信息
        if (typeof window !== "undefined") {
          // 尝试清除 localStorage 中的 token（如果有）
          localStorage.removeItem("token");
        }
        throw new Error("请先登录");
      }

      // 尝试读取错误信息
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // 如果无法解析 JSON，使用默认错误信息
      }

      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            return;
          }
          try {
            const chunk: ChatStreamChunk = JSON.parse(data);
            onChunk(chunk);
          } catch (e) {
            console.error("Failed to parse chunk:", e);
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to stream chat message:", error);
    throw error;
  }
};

/**
 * Get available visualization tools
 */
export const getAvailableTools = async (): Promise<any[]> => {
  try {
    const response = await apiRequest<{ tools: any[] }>("/chat/tools", {
      method: "GET",
    });
    return response.tools;
  } catch (error) {
    console.error("Failed to get available tools:", error);
    throw error;
  }
};
