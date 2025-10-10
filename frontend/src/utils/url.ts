/**
 * URL处理工具函数
 * 提供统一的URL构建和处理功能
 */

import { API_CONFIG } from '@/config/constants';

/**
 * 获取完整的图片URL
 * @param imageUrl 图片URL（相对或绝对路径）
 * @param fallbackUrl 当图片为空时的默认图片URL
 * @returns 完整的图片URL
 */
export const getFullImageUrl = (
  imageUrl: string | null | undefined,
  fallbackUrl?: string
): string => {
  if (!imageUrl) {
    // 如果提供了fallbackUrl，使用它；否则返回空字符串
    return fallbackUrl || '';
  }
  
  // 如果是绝对URL（以http开头），直接返回
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // 如果是以 /images/ 开头的路径，使用前端链接
  if (imageUrl.startsWith('/images/')) {
    return imageUrl; // 前端可以直接访问 /images/ 路径
  }
  
  // 如果是其他相对路径，拼接API基础URL
  return `${API_CONFIG.BASE_URL}${imageUrl}`;
};

/**
 * 获取静态资源URL
 * @param path 资源路径
 * @returns 完整的静态资源URL
 */
export const getStaticUrl = (path: string): string => {
  if (!path) return '';
  
  // 如果已经是完整URL，直接返回
  if (path.startsWith('http')) {
    return path;
  }
  
  // 确保路径以/开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${API_CONFIG.STATIC_URL}${normalizedPath}`;
};

/**
 * 获取图片资源URL
 * @param path 图片路径
 * @returns 完整的图片URL
 */
export const getImageUrl = (path: string): string => {
  if (!path) return '';
  
  // 如果已经是完整URL，直接返回
  if (path.startsWith('http')) {
    return path;
  }
  
  // 确保路径以/开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${API_CONFIG.IMAGES_URL}${normalizedPath}`;
};

/**
 * 获取上传文件URL
 * @param path 文件路径
 * @returns 完整的上传文件URL
 */
export const getUploadUrl = (path: string): string => {
  if (!path) return '';
  
  // 如果已经是完整URL，直接返回
  if (path.startsWith('http')) {
    return path;
  }
  
  // 确保路径以/开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${API_CONFIG.UPLOAD_URL}${normalizedPath}`;
};

/**
 * 构建API端点URL
 * @param endpoint API端点路径
 * @returns 完整的API URL
 */
export const getApiUrl = (endpoint: string): string => {
  if (!endpoint) return '';
  
  // 如果已经是完整URL，直接返回
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // 确保端点以/开头
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${API_CONFIG.V1_URL}${normalizedEndpoint}`;
};

/**
 * 检查URL是否为外部链接
 * @param url URL字符串
 * @returns 是否为外部链接
 */
export const isExternalUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
    return urlObj.hostname !== currentHost;
  } catch {
    return false;
  }
};

/**
 * 获取博客详情页面URL
 * @param slug 博客slug
 * @returns 博客详情页面URL
 */
export const getBlogDetailUrl = (slug: string): string => {
  return `/blog/${slug}`;
};

/**
 * 获取用户头像URL
 * @param avatarUrl 头像URL
 * @param username 用户名（用于生成默认头像）
 * @param size 头像大小
 * @returns 头像URL
 */
export const getAvatarUrl = (
  avatarUrl?: string | null,
  username?: string,
  size: number = 40
): string => {
  if (avatarUrl) {
    return getFullImageUrl(avatarUrl);
  }
  
  // 如果有用户名，生成基于用户名的头像
  if (username) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&size=${size}&background=random`;
  }
  
  // 返回默认头像
  return getImageUrl('/avatar/default.png');
};

/**
 * 获取随机背景图片URL
 * @param imageName 图片文件名
 * @returns 背景图片URL
 */
export const getBackgroundImageUrl = (imageName: string): string => {
  return getImageUrl(`/background/${imageName}`);
};
