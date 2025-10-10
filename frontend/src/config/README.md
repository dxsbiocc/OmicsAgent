# 配置管理说明

## 概述

本项目使用统一的配置管理系统，将所有 URL 和常量集中管理，便于维护和部署。

## 配置文件结构

### 1. `constants.ts` - 主配置文件

包含所有应用配置常量：

- API 配置
- 应用 URL 配置
- 图片处理配置
- 分页配置
- 主题配置

### 2. `url.ts` - URL 工具函数

提供统一的 URL 处理功能：

- `getFullImageUrl()` - 获取完整图片 URL
- `getStaticUrl()` - 获取静态资源 URL
- `getImageUrl()` - 获取图片资源 URL
- `getUploadUrl()` - 获取上传文件 URL
- `getApiUrl()` - 构建 API 端点 URL

## 环境变量配置

在项目根目录创建 `.env.local` 文件：

```bash
# API基础URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# 应用基础URL（可选）
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 使用方法

### 1. 导入配置常量

```typescript
import { API_CONFIG, APP_CONFIG } from "@/config/constants";
```

### 2. 使用 URL 工具函数

```typescript
import { getFullImageUrl, getApiUrl } from "@/utils/url";

// 获取完整图片URL
const imageUrl = getFullImageUrl("/images/avatar/user.jpg");

// 构建API URL
const apiUrl = getApiUrl("/blog/posts");
```

### 3. 在组件中使用

```typescript
import { API_CONFIG } from "@/config/constants";

// 使用API配置
const apiBaseUrl = API_CONFIG.BASE_URL;
```

## 配置项说明

### API_CONFIG

- `BASE_URL` - API 基础 URL
- `V1_URL` - API 版本化 URL
- `STATIC_URL` - 静态资源 URL
- `IMAGES_URL` - 图片资源 URL
- `UPLOAD_URL` - 上传文件 URL

### APP_CONFIG

- `BASE_URL` - 应用基础 URL
- `BLOG` - 博客相关 URL
- `AUTH` - 认证相关 URL
- `PAGES` - 其他页面 URL

### IMAGE_CONFIG

- `DEFAULT_AVATAR` - 默认头像配置
- `BACKGROUND_IMAGES` - 背景图片配置
- `UPLOAD` - 图片上传配置

## 部署配置

### 开发环境

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 生产环境

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 注意事项

1. 所有环境变量必须以 `NEXT_PUBLIC_` 开头才能在客户端使用
2. 修改环境变量后需要重启开发服务器
3. 生产环境部署时确保环境变量正确设置
4. 敏感信息不要放在客户端环境变量中
