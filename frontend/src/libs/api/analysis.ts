/**
 * Analysis tools API functions
 */

import { apiRequest } from "./api";

// Analysis tool types
export interface AnalysisToolInfo {
  tool: string; // Tool name, e.g., 'tcga_differential_expression'
  name: string;
  display_name: string;
  description: string;
  category: string; // Analysis category
  tool_name: string; // Tool name without category
  params_schema: Record<string, any>;
  defaults: Record<string, any>;
  sample_data_filename?: string;
  sample_image_url?: string;
  docs_markdown?: string;
}

// Analysis tool group
export interface AnalysisToolGroup {
  category: string;
  display_name: string;
  tools: AnalysisToolInfo[];
  tool_count: number;
}

// Analysis tools response
export interface AnalysisToolsResponse {
  tools: AnalysisToolInfo[];
  groups: AnalysisToolGroup[];
  total_tools: number;
  total_categories: number;
  category_stats: Record<string, number>;
}

export interface AnalysisRunResponse {
  success: boolean;
  message: string;
  tool: string;
  used_params: Record<string, any>;
  analysis_type?: string;
  data?: any;
  image_url?: string;
  ggplot2?: any;
}

export interface AnalysisRunParams {
  analysis_type?: string;
  data_source?: string;
  data?: any[];
  [key: string]: any;
}

// Sample data response
export interface AnalysisSampleDataResponse {
  success: boolean;
  data: any[];
  message?: string;
}

// Documentation response
export interface AnalysisDocsResponse {
  success: boolean;
  markdown: string;
  message?: string;
}

/**
 * Get all analysis tools with grouping information
 */
export const getAnalysisTools = async (): Promise<AnalysisToolsResponse> => {
  try {
    const response = await apiRequest<AnalysisToolsResponse>("/analysis/tools");
    return response;
  } catch (error) {
    console.error("Failed to fetch analysis tools:", error);
    throw error;
  }
};

/**
 * Get analysis tools grouped by category
 */
export const getAnalysisToolsGrouped = async (): Promise<
  AnalysisToolGroup[]
> => {
  try {
    const response = await apiRequest<AnalysisToolGroup[]>(
      "/analysis/tools/grouped"
    );
    return response;
  } catch (error) {
    console.error("Failed to fetch grouped analysis tools:", error);
    throw error;
  }
};

/**
 * Get tools by category
 */
export const getAnalysisToolsByCategory = async (
  category: string
): Promise<AnalysisToolInfo[]> => {
  try {
    const response = await apiRequest<AnalysisToolInfo[]>(
      `/analysis/tools/category/${category}`
    );
    return response;
  } catch (error) {
    console.error(`Failed to fetch tools for category ${category}:`, error);
    throw error;
  }
};

/**
 * Search analysis tools
 */
export const searchAnalysisTools = async (
  query: string
): Promise<AnalysisToolInfo[]> => {
  try {
    const response = await apiRequest<AnalysisToolInfo[]>(
      `/analysis/tools/search?q=${encodeURIComponent(query)}`
    );
    return response;
  } catch (error) {
    console.error(`Failed to search tools with query "${query}":`, error);
    throw error;
  }
};

/**
 * Get analysis tool categories
 */
export const getAnalysisToolCategories = async (): Promise<string[]> => {
  try {
    const response = await apiRequest<string[]>("/analysis/tools/categories");
    return response;
  } catch (error) {
    console.error("Failed to fetch analysis tool categories:", error);
    throw error;
  }
};

/**
 * Get specific analysis tool info by tool name
 */
export const getAnalysisToolInfo = async (
  tool: string
): Promise<AnalysisToolInfo> => {
  try {
    const response = await apiRequest<AnalysisToolInfo>(
      `/analysis/tools/${tool}`
    );
    return response;
  } catch (error) {
    console.error(`Failed to fetch analysis tool info for ${tool}:`, error);
    throw error;
  }
};

/**
 * Run analysis tool by tool name
 */
export const runAnalysisTool = async (
  tool: string,
  params: AnalysisRunParams
): Promise<AnalysisRunResponse> => {
  try {
    const response = await apiRequest<AnalysisRunResponse>(
      `/analysis/run/${tool}`,
      {
        method: "POST",
        data: params,
      }
    );
    return response;
  } catch (error) {
    console.error(`Failed to run analysis tool ${tool}:`, error);
    throw error;
  }
};

/**
 * Run analysis workflow
 */
export const runAnalysisWorkflow = async (
  params: AnalysisRunParams
): Promise<AnalysisRunResponse> => {
  try {
    const response = await apiRequest<AnalysisRunResponse>(
      "/analysis/run-workflow",
      {
        method: "POST",
        data: params,
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to run analysis workflow:", error);
    throw error;
  }
};

/**
 * Get sample data for an analysis tool
 */
export const getAnalysisSampleData = async (
  tool: string
): Promise<AnalysisSampleDataResponse> => {
  try {
    const response = await apiRequest<AnalysisSampleDataResponse>(
      `/analysis/tools/${tool}/sample-data`
    );
    return response;
  } catch (error) {
    console.error(`Failed to fetch sample data for ${tool}:`, error);
    throw error;
  }
};

/**
 * Get documentation for an analysis tool
 */
export const getAnalysisToolDocs = async (
  tool: string
): Promise<AnalysisDocsResponse> => {
  try {
    const response = await apiRequest<AnalysisDocsResponse>(
      `/analysis/tools/${tool}/document`
    );
    return response;
  } catch (error) {
    console.error(`Failed to fetch docs for ${tool}:`, error);
    throw error;
  }
};

/**
 * Get analysis results by job ID
 */
export const getAnalysisResults = async (
  jobId: string
): Promise<AnalysisRunResponse> => {
  try {
    const response = await apiRequest<AnalysisRunResponse>(
      `/analysis/results/${jobId}`
    );
    return response;
  } catch (error) {
    console.error(`Failed to fetch analysis results for job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Get analysis job status
 */
export const getAnalysisJobStatus = async (
  jobId: string
): Promise<{
  job_id: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  message?: string;
}> => {
  try {
    const response = await apiRequest<{
      job_id: string;
      status: "pending" | "running" | "completed" | "failed";
      progress: number;
      message?: string;
    }>(`/analysis/jobs/${jobId}/status`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch job status for ${jobId}:`, error);
    throw error;
  }
};

/**
 * Download analysis results
 */
export const downloadAnalysisResults = async (
  jobId: string,
  filename?: string
): Promise<Blob> => {
  try {
    const url = filename
      ? `/analysis/results/${jobId}/download/${filename}`
      : `/analysis/results/${jobId}/download`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download results: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error(
      `Failed to download analysis results for job ${jobId}:`,
      error
    );
    throw error;
  }
};

/**
 * Get tool meta information (including sub-tools/modules)
 */
export interface ToolMeta {
  name: string;
  title?: string;
  description: string;
  detail?: string; // Detailed description in Markdown format
  type?: string;
  category?: string;
  tools?: Array<{
    name: string;
    title?: string;
    description: string;
    category?: string;
    icon?: string;
    params?: Record<string, any>; // Parameter schema for the sub-tool
  }>;
}

export interface ToolMetaResponse {
  success: boolean;
  meta: ToolMeta;
  message?: string;
}

export const getAnalysisToolMeta = async (
  tool: string
): Promise<ToolMetaResponse> => {
  try {
    const response = await apiRequest<ToolMetaResponse>(
      `/analysis/tools/${tool}/meta`
    );
    return response;
  } catch (error) {
    console.error(`Failed to fetch tool meta for ${tool}:`, error);
    throw error;
  }
};
