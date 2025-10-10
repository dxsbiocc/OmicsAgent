/**
 * API 相关类型定义
 * 扩展 axios 类型以支持自定义属性
 */

import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: Date;
    };
  }
}
