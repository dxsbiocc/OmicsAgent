/**
 * LLM configuration API functions
 */

import { apiRequest } from "./api";

export interface LLMConfig {
  source: string;
  model: string;
  base_url?: string;
  api_key?: string;
  temperature: number;
  max_tokens?: number;
}

export interface LLMSource {
  value: string;
  label: string;
}

export interface LLMModel {
  value: string;
  label: string;
}

/**
 * Get available LLM sources
 */
export const getLLMSources = async (): Promise<LLMSource[]> => {
  try {
    const response = await apiRequest<{ sources: LLMSource[] }>("/llm/sources", {
      method: "GET",
    });
    return response.sources;
  } catch (error) {
    console.error("Failed to get LLM sources:", error);
    throw error;
  }
};

/**
 * Get available models for a source
 */
export const getModelsForSource = async (source: string): Promise<LLMModel[]> => {
  try {
    const response = await apiRequest<{ models: LLMModel[] }>(`/llm/models/${source}`, {
      method: "GET",
    });
    return response.models;
  } catch (error) {
    console.error("Failed to get models:", error);
    throw error;
  }
};

/**
 * Update LLM configuration for a conversation
 */
export const updateConversationLLMConfig = async (
  conversationId: number,
  config: LLMConfig
): Promise<void> => {
  try {
    await apiRequest(`/conversations/${conversationId}/llm-config`, {
      method: "PATCH",
      data: config,
    });
  } catch (error) {
    console.error("Failed to update LLM config:", error);
    throw error;
  }
};

