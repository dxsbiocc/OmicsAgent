/**
 * API 接口函数集合
 * 使用 axios 封装，提供更好的请求拦截、错误处理和响应处理
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import './types'; // 导入类型扩展
import type { PaginationParams } from '../../types';
import { handleHttpError, handleNetworkError, errorLogger, ErrorType, createErrorInfo } from '../../utils/errorHandler';
import { API_CONFIG } from '@/config/constants';

// 基础配置
const API_BASE_URL = API_CONFIG.V1_URL;

// CSRF Token 获取函数
function getCsrfToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // 从meta标签获取CSRF token
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  if (csrfMeta) {
    return csrfMeta.getAttribute('content');
  }
  
  // 从Cookie获取CSRF token
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') {
      return decodeURIComponent(value);
    }
  }
  
  return null;
}

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10秒超时
  withCredentials: true, // 启用Cookie支持
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // HttpOnly Cookie会自动发送，无需手动添加Authorization头
    // 添加CSRF token（如果需要）
    if (typeof window !== 'undefined') {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    
    // 处理 FormData：移除 Content-Type 头，让浏览器自动设置
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // 添加请求时间戳（用于调试）
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 计算请求耗时
    if (response.config.metadata?.startTime) {
      const duration = new Date().getTime() - response.config.metadata.startTime.getTime();
      console.log(`API 请求 ${response.config.method?.toUpperCase()} ${response.config.url} 耗时: ${duration}ms`);
    }
    
    return response;
  },
  (error: AxiosError) => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      console.log('error.response', error.response);
      // 记录错误到日志
      const errorInfo = createErrorInfo(
        ErrorType.HTTP,
        (data as any)?.detail || (data as any)?.message || `HTTP Error: ${status}`,
        status,
        { url: error.config?.url, method: error.config?.method }
      );
      errorLogger.log(errorInfo);
      
      // 提取错误信息
      let errorMessage = `HTTP Error: ${status}`;
      
      if (data) {
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (typeof data === 'object') {
          errorMessage = (data as any)?.detail || 
                        (data as any)?.message || 
                        (data as any)?.error || 
                        JSON.stringify(data);
        }
      }
      
      // 对于401错误，抛出特定的错误信息
      if (status === 401) {
        throw new Error('请先登录');
      }
      
      // 对于403错误，抛出特定的错误信息
      if (status === 403) {
        throw new Error('没有权限访问此资源');
      }
      
      // 对于404错误，抛出特定的错误信息
      if (status === 404) {
        throw new Error('请求的资源不存在');
      }
      
      // 对于500错误，抛出特定的错误信息
      if (status >= 500) {
        throw new Error('服务器内部错误');
      }
      
      // 其他错误
      throw new Error(errorMessage);
    } else if (error.request) {
      // 网络错误
      const errorInfo = createErrorInfo(
        ErrorType.NETWORK,
        '网络连接失败，请检查网络设置',
        undefined,
        { url: error.config?.url, method: error.config?.method }
      );
      errorLogger.log(errorInfo);
      
      handleNetworkError(error);
      throw new Error('网络连接失败，请检查网络设置');
    } else {
      // 其他错误
      const errorInfo = createErrorInfo(
        ErrorType.APPLICATION,
        error.message || '请求配置错误',
        undefined,
        { url: error.config?.url, method: error.config?.method }
      );
      errorLogger.log(errorInfo);
      
      console.error('请求配置错误:', error.message);
      throw new Error('请求配置错误');
    }
  }
);

// 通用请求函数
async function apiRequest<T>(
  endpoint: string,
  config: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const response = await apiClient.request<T>({
      url: endpoint,
      ...config,
    });
    return response.data;
  } catch (error) {
    // 错误已经在拦截器中处理，这里直接抛出
    throw error;
  }
}


// 构建查询参数
function buildQueryParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

// 文件上传函数
async function uploadFile<T>(
  endpoint: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await apiClient.post<T>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// 下载文件函数
async function downloadFile(
  endpoint: string,
  filename?: string
): Promise<void> {
  try {
    const response = await apiClient.get(endpoint, {
      responseType: 'blob',
    });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'download');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
}

// 批量请求函数
async function batchRequest<T>(
  requests: Array<() => Promise<T>>
): Promise<T[]> {
  try {
    const results = await Promise.allSettled(requests.map(request => request()));
    
    const successfulResults: T[] = [];
    const errors: Error[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulResults.push(result.value);
      } else {
        console.error(`批量请求 ${index} 失败:`, result.reason);
        errors.push(result.reason);
      }
    });
    
    if (errors.length > 0) {
      console.warn(`${errors.length} 个批量请求失败`);
    }
    
    return successfulResults;
  } catch (error) {
    throw error;
  }
}

export { 
  apiRequest, 
  buildQueryParams, 
  uploadFile, 
  downloadFile, 
  batchRequest,
  apiClient,
  type PaginationParams 
};
