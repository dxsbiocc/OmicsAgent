/**
 * 错误处理工具函数
 * 用于处理不同类型的错误并重定向到相应的错误页面
 */

import { NextRouter } from 'next/router';

export interface ErrorHandlerOptions {
  router?: NextRouter;
  showNotification?: (message: string, type: 'error' | 'warning' | 'info') => void;
  logError?: (error: any) => void;
}

/**
 * 处理 HTTP 错误状态码
 */
export function handleHttpError(
  status: number,
  message?: string,
  options: ErrorHandlerOptions = {}
) {
  const { router, showNotification, logError } = options;

  // 记录错误
  if (logError) {
    logError({ status, message });
  }

  switch (status) {
    case 401:
      // 未授权 - 重定向到登录页
      if (showNotification) {
        showNotification('请先登录', 'warning');
      }
      if (router) {
        router.push('/auth/login');
      }
      break;

    case 403:
      // 禁止访问 - 重定向到 403 页面
      if (showNotification) {
        showNotification('没有权限访问此资源', 'error');
      }
      if (router) {
        router.push('/403');
      }
      break;

    case 404:
      // 未找到 - 重定向到 not-found 页面
      if (showNotification) {
        showNotification('请求的资源不存在', 'error');
      }
      if (router) {
        router.push('/not-found');
      }
      break;

    case 500:
      // 服务器内部错误 - 重定向到 500 页面
      if (showNotification) {
        showNotification('服务器内部错误', 'error');
      }
      if (router) {
        router.push('/500');
      }
      break;

    case 502:
    case 503:
    case 504:
      // 网关错误 - 重定向到 500 页面
      if (showNotification) {
        showNotification('服务暂时不可用', 'error');
      }
      if (router) {
        router.push('/500');
      }
      break;

    default:
      // 其他错误 - 显示通用错误消息
      if (showNotification) {
        showNotification(message || '请求失败', 'error');
      }
      break;
  }
}

/**
 * 处理网络错误
 */
export function handleNetworkError(
  error: any,
  options: ErrorHandlerOptions = {}
) {
  const { showNotification, logError } = options;

  // 记录错误
  if (logError) {
    logError(error);
  }

  if (showNotification) {
    showNotification('网络连接失败，请检查网络设置', 'error');
  }
}

/**
 * 处理应用错误
 */
export function handleAppError(
  error: Error,
  options: ErrorHandlerOptions = {}
) {
  const { showNotification, logError } = options;

  // 记录错误
  if (logError) {
    logError(error);
  }

  if (showNotification) {
    showNotification(error.message || '应用出现错误', 'error');
  }
}

/**
 * 创建错误处理函数
 */
export function createErrorHandler(options: ErrorHandlerOptions = {}) {
  return {
    handleHttpError: (status: number, message?: string) =>
      handleHttpError(status, message, options),
    handleNetworkError: (error: any) =>
      handleNetworkError(error, options),
    handleAppError: (error: Error) =>
      handleAppError(error, options),
  };
}

/**
 * 错误类型枚举
 */
export enum ErrorType {
  HTTP = 'HTTP',
  NETWORK = 'NETWORK',
  APPLICATION = 'APPLICATION',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  type: ErrorType;
  code?: number;
  message: string;
  details?: any;
  timestamp: Date;
}

/**
 * 创建错误信息对象
 */
export function createErrorInfo(
  type: ErrorType,
  message: string,
  code?: number,
  details?: any
): ErrorInfo {
  return {
    type,
    code,
    message,
    details,
    timestamp: new Date(),
  };
}

/**
 * 错误日志记录器
 */
export class ErrorLogger {
  private errors: ErrorInfo[] = [];
  private maxErrors = 100; // 最大保存错误数量

  log(error: ErrorInfo) {
    this.errors.unshift(error);
    
    // 保持错误数量在限制内
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // 在开发环境中输出到控制台
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', error);
    }
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
  }

  getErrorCount(): number {
    return this.errors.length;
  }
}

// 创建全局错误日志记录器实例
export const errorLogger = new ErrorLogger();
