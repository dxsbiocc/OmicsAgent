/**
 * 应用配置常量
 * 统一管理前端使用的各种URL和配置
 */

// 环境变量配置
const ENV = {
  // API基础URL
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  
  // 应用基础URL
  APP_BASE_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // 是否为开发环境
  IS_DEV: process.env.NODE_ENV === 'development',
  
  // 是否为生产环境
  IS_PROD: process.env.NODE_ENV === 'production',
};

// API相关URL配置
export const API_CONFIG = {
  // API基础URL
  BASE_URL: ENV.API_BASE_URL,
  
  // API版本化URL
  V1_URL: `${ENV.API_BASE_URL}/api/v1`,
  
  // 静态资源URL
  STATIC_URL: `${ENV.API_BASE_URL}/static`,
  
  // 图片资源URL
  IMAGES_URL: `${ENV.API_BASE_URL}/static/images`,
  
  // 上传文件URL
  UPLOAD_URL: `${ENV.API_BASE_URL}/static/uploads`,
};

// 应用相关URL配置
export const APP_CONFIG = {
  // 应用基础URL
  BASE_URL: ENV.APP_BASE_URL,
  
  // 博客相关URL
  BLOG: {
    LIST: '/blog',
    CREATE: '/blog/create',
    DETAIL: (slug: string) => `/blog/${slug}`,
  },
  
  // 认证相关URL
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
  },
  
  // 其他页面URL
  PAGES: {
    HOME: '/',
    ABOUT: '/about',
    CONTACT: '/contact',
  },
};

// 图片处理相关配置
export const IMAGE_CONFIG = {
  // 默认头像配置
  DEFAULT_AVATAR: {
    SIZE: 40,
    URL: '/images/avatar/default.png',
  },
  
  // 背景图片配置
  BACKGROUND_IMAGES: {
    BASE_PATH: '/images/background/',
    DEFAULT_COUNT: 32, // 默认背景图片数量
  },
  
  // 图片上传配置
  UPLOAD: {
    MAX_SIZE: 20 * 1024 * 1024, // 20MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    QUALITY: 0.9,
  },
};

// 分页配置
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// 主题配置
export const THEME_CONFIG = {
  // 颜色配置
  COLORS: {
    SUCCESS: 'success.light',
    SECONDARY: 'secondary.light', 
    ERROR: 'error.light',
    PRIMARY: 'primary.main',
  },
  
  // 动画配置
  ANIMATIONS: {
    TRANSITION_DURATION: 300,
    HOVER_SCALE: 1.05,
  },
};

// 导出环境变量（用于调试）
export const ENV_CONFIG = ENV;

// 默认导出所有配置
export default {
  API_CONFIG,
  APP_CONFIG,
  IMAGE_CONFIG,
  PAGINATION_CONFIG,
  THEME_CONFIG,
  ENV_CONFIG,
};
