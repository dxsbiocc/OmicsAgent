/**
 * Conversation API functions for managing conversations and messages
 */

import { apiRequest } from "./api";

export interface Conversation {
  id: number;
  user_id: number;
  title: string | null;
  is_active: boolean;
  metadata?: Record<string, any> | null; // API may return this
  meta_data?: Record<string, any> | null; // Or this (FastAPI uses by_alias=True)
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface Message {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  metadata: Record<string, any> | null;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
}

export interface ConversationCreate {
  title?: string;
  metadata?: Record<string, any>;
}

export interface ConversationUpdate {
  title?: string;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

/**
 * List conversations for the current user
 */
export const listConversations = async (
  skip: number = 0,
  limit: number = 100,
  includeMessages: boolean = false
): Promise<ConversationListResponse> => {
  try {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      include_messages: includeMessages.toString(),
    });
    const response = await apiRequest<ConversationListResponse>(
      `/conversations?${params.toString()}`,
      {
        method: "GET",
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to list conversations:", error);
    throw error;
  }
};

/**
 * Get a conversation by ID
 */
export const getConversation = async (
  conversationId: number
): Promise<Conversation> => {
  try {
    const response = await apiRequest<Conversation>(
      `/conversations/${conversationId}`,
      {
        method: "GET",
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to get conversation:", error);
    throw error;
  }
};

/**
 * Create a new conversation
 */
export const createConversation = async (
  data: ConversationCreate
): Promise<Conversation> => {
  try {
    const response = await apiRequest<Conversation>("/conversations", {
      method: "POST",
      data,
    });
    return response;
  } catch (error) {
    console.error("Failed to create conversation:", error);
    throw error;
  }
};

/**
 * Update a conversation
 */
export const updateConversation = async (
  conversationId: number,
  data: ConversationUpdate
): Promise<Conversation> => {
  try {
    const response = await apiRequest<Conversation>(
      `/conversations/${conversationId}`,
      {
        method: "PATCH",
        data,
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to update conversation:", error);
    throw error;
  }
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (
  conversationId: number
): Promise<void> => {
  try {
    await apiRequest(`/conversations/${conversationId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    throw error;
  }
};

/**
 * Get messages for a conversation
 */
export const getConversationMessages = async (
  conversationId: number,
  limit?: number
): Promise<Message[]> => {
  try {
    const params = new URLSearchParams();
    if (limit) {
      params.append("limit", limit.toString());
    }
    const response = await apiRequest<Message[]>(
      `/conversations/${conversationId}/messages${
        params.toString() ? `?${params.toString()}` : ""
      }`,
      {
        method: "GET",
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to get conversation messages:", error);
    throw error;
  }
};
