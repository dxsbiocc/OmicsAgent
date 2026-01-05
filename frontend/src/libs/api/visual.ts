/**
 * Visual tools API functions
 */

import { apiRequest } from "./api";

// Visual tool types
export interface VisualToolInfo {
  tool: string; // 工具名称，如 'line/basic'
  name: string;
  display_name: string;
  description: string;
  category: string; // 添加分类信息
  tool_name: string; // 添加工具名称（不包含分类）
  params_schema: Record<string, any>;
  defaults: Record<string, any>;
  sample_data_filename?: string;
  sample_image_url?: string;
  docs_markdown?: string;
  has_python?: boolean; // 是否存在 Python 脚本
  has_r?: boolean; // 是否存在 R 脚本
  has_js?: boolean; // 是否存在 JS 版本
  ggplot2?: Record<string, any>; // ggplot2 配置
  heatmap?: Record<string, any>; // heatmap 配置
}

// 工具分组信息
export interface VisualToolGroup {
  category: string;
  display_name: string;
  tools: VisualToolInfo[];
  tool_count: number;
}

// 工具列表响应
export interface VisualToolsResponse {
  tools: VisualToolInfo[];
  groups: VisualToolGroup[];
  total_tools: number;
  total_categories: number;
  category_stats: Record<string, number>;
}

export interface VisualRunResponse {
  success: boolean;
  message: string;
  output_files?: string[]; // 包含 PNG 和 PDF URL，第一个是 PNG，第二个是 PDF
  tool: string;
  used_params: Record<string, any>;
}

export interface VisualRunParams {
  chart_type?: string;
  engine?: string;
  subdir?: string;
  data?: any[];
  [key: string]: any;
}

// 示例数据响应
export interface SampleDataResponse {
  success: boolean;
  data: any[] | Record<string, any[]>; // 可以是数组或字典
  data_type?: "list" | "dict"; // 数据类型标识
  message?: string;
}

// 文档响应
export interface DocsResponse {
  success: boolean;
  markdown: string;
  message?: string;
}

// Meta响应
export interface MetaResponse {
  success: boolean;
  meta: {
    name: string;
    description: string;
    params: Record<string, any>;
    additional_params?: Record<string, any>;
  };
  message?: string;
}

/**
 * Get all visual tools with grouping information
 */
export const getVisualTools = async (): Promise<VisualToolsResponse> => {
  try {
    const response = await apiRequest<VisualToolsResponse>("/visual/tools");
    return response;
  } catch (error) {
    console.error("Failed to fetch visual tools:", error);
    throw error;
  }
};

/**
 * Get visual tools grouped by category
 */
export const getVisualToolsGrouped = async (): Promise<VisualToolGroup[]> => {
  try {
    const response = await apiRequest<VisualToolGroup[]>(
      "/visual/tools/grouped"
    );
    return response;
  } catch (error) {
    console.error("Failed to fetch grouped visual tools:", error);
    throw error;
  }
};

/**
 * Get tools by category
 */
export const getVisualToolsByCategory = async (
  category: string
): Promise<VisualToolInfo[]> => {
  try {
    const response = await apiRequest<VisualToolInfo[]>(
      `/visual/tools/category/${category}`
    );
    return response;
  } catch (error) {
    console.error(`Failed to fetch tools for category ${category}:`, error);
    throw error;
  }
};

/**
 * Search visual tools
 */
export const searchVisualTools = async (
  query: string
): Promise<VisualToolInfo[]> => {
  try {
    const response = await apiRequest<VisualToolInfo[]>(
      `/visual/tools/search?q=${encodeURIComponent(query)}`
    );
    return response;
  } catch (error) {
    console.error(`Failed to search tools with query "${query}":`, error);
    throw error;
  }
};

/**
 * Get tool categories
 */
export const getVisualToolCategories = async (): Promise<string[]> => {
  try {
    const response = await apiRequest<string[]>("/visual/tools/categories");
    return response;
  } catch (error) {
    console.error("Failed to fetch tool categories:", error);
    throw error;
  }
};

/**
 * Get specific visual tool info by tool name (with underscore format)
 */
export const getVisualToolInfo = async (
  tool: string
): Promise<VisualToolInfo> => {
  try {
    const response = await apiRequest<VisualToolInfo>(`/visual/tools/${tool}`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch visual tool info for ${tool}:`, error);
    throw error;
  }
};

/**
 * Run visual tool by tool name (with underscore format)
 */
export const runVisualTool = async (
  tool: string,
  params: VisualRunParams
): Promise<VisualRunResponse> => {
  try {
    const response = await apiRequest<VisualRunResponse>(
      `/visual/run/${tool}`,
      {
        method: "POST",
        data: params,
      }
    );
    return response;
  } catch (error) {
    console.error(`Failed to run visual tool ${tool}:`, error);
    throw error;
  }
};

/**
 * Run chart tool (new API)
 */
export const runChartTool = async (
  params: VisualRunParams
): Promise<VisualRunResponse> => {
  try {
    const response = await apiRequest<VisualRunResponse>("/visual/run-chart", {
      method: "POST",
      data: params,
    });
    return response;
  } catch (error) {
    console.error("Failed to run chart tool:", error);
    throw error;
  }
};

/**
 * Get sample data for a tool by tool name (with underscore format)
 */
export const getSampleData = async (
  tool: string
): Promise<SampleDataResponse> => {
  try {
    const response = await apiRequest<SampleDataResponse>(
      `/visual/tools/${tool}/sample-data`
    );
    return response;
  } catch (error) {
    console.error(`Failed to fetch sample data for ${tool}:`, error);
    throw error;
  }
};

/**
 * Get documentation for a tool by tool name (with underscore format)
 */
export const getToolDocs = async (tool: string): Promise<DocsResponse> => {
  try {
    const response = await apiRequest<DocsResponse>(
      `/visual/tools/${tool}/document`
    );
    return response;
  } catch (error) {
    console.error(`Failed to fetch docs for ${tool}:`, error);
    throw error;
  }
};

// 简化的图表生成接口
export interface SimpleChartResponse {
  success: boolean;
  message: string;
  image_url?: string;
  script_path?: string;
  data_path?: string;
}

export const generateSimpleChart = async (
  tool: string,
  parameters: { [key: string]: any },
  dataFile: File
): Promise<SimpleChartResponse> => {
  try {
    const formData = new FormData();
    formData.append("tool", tool);
    formData.append("parameters", JSON.stringify(parameters));
    formData.append("data_file", dataFile);

    const response = await fetch("/api/v1/visual-simple/generate-chart", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to generate chart for ${tool}:`, error);
    throw error;
  }
};

/**
 * Get meta.json for a tool by tool name (with underscore format)
 */
export const getToolMeta = async (tool: string): Promise<MetaResponse> => {
  try {
    const response = await apiRequest<MetaResponse>(
      `/visual/tools/${tool}/meta`
    );
    return response;
  } catch (error) {
    console.error(`Failed to fetch meta for ${tool}:`, error);
    throw error;
  }
};
