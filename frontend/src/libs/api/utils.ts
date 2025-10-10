/**
 * API 工具函数
 * 提供常用的 API 辅助功能
 */

// 注意：这里不直接导入 apiClient 以避免循环依赖
// 如果需要使用 apiClient，可以通过参数传入

// 请求重试配置
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition?: (error: any) => boolean;
}

// 默认重试配置
const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error) => {
    // 只对网络错误或 5xx 错误进行重试
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  },
};

/**
 * 带重试机制的请求函数
 */
export async function requestWithRetry<T>(
  requestFn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...defaultRetryConfig, ...config };
  let lastError: any;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // 检查是否应该重试
      if (attempt === retryConfig.maxRetries || !retryConfig.retryCondition!(error)) {
        throw error;
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, retryConfig.retryDelay * Math.pow(2, attempt)));
    }
  }
  
  throw lastError;
}

/**
 * 请求缓存配置
 */
interface CacheConfig {
  ttl: number; // 缓存时间（毫秒）
  key?: string; // 自定义缓存键
}

const cache = new Map<string, { data: any; timestamp: number }>();

/**
 * 带缓存的请求函数
 */
export async function requestWithCache<T>(
  requestFn: () => Promise<T>,
  config: CacheConfig
): Promise<T> {
  const cacheKey = config.key || requestFn.toString();
  const cached = cache.get(cacheKey);
  
  // 检查缓存是否有效
  if (cached && Date.now() - cached.timestamp < config.ttl) {
    return cached.data;
  }
  
  // 执行请求并缓存结果
  const data = await requestFn();
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}

/**
 * 清除缓存
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/**
 * 请求取消控制器
 */
class RequestController {
  private controllers = new Map<string, AbortController>();

  /**
   * 创建新的请求控制器
   */
  create(key: string): AbortController {
    // 取消之前的请求
    this.cancel(key);
    
    const controller = new AbortController();
    this.controllers.set(key, controller);
    return controller;
  }

  /**
   * 取消指定请求
   */
  cancel(key: string): void {
    const controller = this.controllers.get(key);
    if (controller) {
      controller.abort();
      this.controllers.delete(key);
    }
  }

  /**
   * 取消所有请求
   */
  cancelAll(): void {
    this.controllers.forEach(controller => controller.abort());
    this.controllers.clear();
  }
}

export const requestController = new RequestController();

/**
 * 带取消功能的请求函数
 */
export async function requestWithCancel<T>(
  key: string,
  requestFn: (signal: AbortSignal) => Promise<T>
): Promise<T> {
  const controller = requestController.create(key);
  
  try {
    return await requestFn(controller.signal);
  } finally {
    requestController.cancel(key);
  }
}

/**
 * 请求去重
 */
const pendingRequests = new Map<string, Promise<any>>();

/**
 * 去重请求函数（相同请求只发送一次）
 */
export async function dedupeRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  // 如果请求正在进行中，返回相同的 Promise
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }
  
  // 创建新请求
  const request = requestFn().finally(() => {
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, request);
  return request;
}

/**
 * 批量请求优化
 */
export async function batchRequests<T>(
  requests: Array<() => Promise<T>>,
  batchSize: number = 5
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(request => request()));
    
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('批量请求失败:', result.reason);
      }
    });
  }
  
  return results;
}

/**
 * 请求状态管理
 */
export class RequestState {
  private loading = new Set<string>();
  private errors = new Map<string, Error>();

  /**
   * 设置请求状态
   */
  setLoading(key: string, isLoading: boolean): void {
    if (isLoading) {
      this.loading.add(key);
    } else {
      this.loading.delete(key);
    }
  }

  /**
   * 检查是否正在加载
   */
  isLoading(key: string): boolean {
    return this.loading.has(key);
  }

  /**
   * 设置错误
   */
  setError(key: string, error: Error): void {
    this.errors.set(key, error);
  }

  /**
   * 获取错误
   */
  getError(key: string): Error | undefined {
    return this.errors.get(key);
  }

  /**
   * 清除错误
   */
  clearError(key: string): void {
    this.errors.delete(key);
  }

  /**
   * 清除所有状态
   */
  clear(): void {
    this.loading.clear();
    this.errors.clear();
  }
}

export const requestState = new RequestState();

/**
 * 请求日志记录
 */
export function logRequest(
  method: string,
  url: string,
  duration: number,
  status?: number,
  error?: Error
): void {
  const logData = {
    method: method.toUpperCase(),
    url,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    status,
    error: error?.message,
  };
  
  if (error || (status && status >= 400)) {
    console.error('API 请求失败:', logData);
  } else {
    console.log('API 请求成功:', logData);
  }
}
