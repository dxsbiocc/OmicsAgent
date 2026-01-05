/**
 * API 接口统一导出
 * 按功能模块组织，确保相互隔离
 */

// 基础 API 工具
export { 
  apiRequest, 
  buildQueryParams, 
  uploadFile, 
  downloadFile, 
  batchRequest,
  apiClient,
  type PaginationParams 
} from './api';

// API 工具函数
export * from './utils';

// 认证相关 API
export { authApi } from './auth';

// 博客相关 API
export { blogApi } from './blog';

// 分类相关 API
export { categoriesApi } from './categories';

// 标签相关 API
export { tagsApi } from './tags';

// 评论相关 API
export { commentsApi } from './comments';

// 用户相关 API
export { usersApi } from './users';

// 统计相关 API
export { statisticsApi } from './statistics';

// 可视化相关 API
export * from './visual';

// 分析相关 API
export * from './analysis';

// 论坛相关 API
export * from './forum';

// 云盘相关 API
export * from './cloud-disk';

// 统一 API 对象，方便使用
import { authApi } from './auth';
import { blogApi } from './blog';
import { categoriesApi } from './categories';
import { tagsApi } from './tags';
import { commentsApi } from './comments';
import { usersApi } from './users';
import { statisticsApi } from './statistics';

export const api = {
  auth: authApi,
  blog: blogApi,
  categories: categoriesApi,
  tags: tagsApi,
  comments: commentsApi,
  users: usersApi,
  statistics: statisticsApi,
};

// 默认导出
export default api;