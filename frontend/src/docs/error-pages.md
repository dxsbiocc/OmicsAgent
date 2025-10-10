# 错误页面系统说明

## 概述

本项目实现了一套完整的错误页面系统，包括 403、404、500 错误页面，以及智能的全局错误处理机制。

## 错误页面类型

### 1. 403 禁止访问页面 (`/403`)

**用途**：当用户没有权限访问某个资源时显示

**特点**：

- 使用 `mushroom_2.svg` 作为插图
- 橙色主题（warning 颜色）
- 提供权限说明和联系支持选项
- 包含"回到首页"、"返回上页"、"联系支持"按钮

**触发场景**：

- 用户尝试访问需要特定权限的页面
- API 返回 403 状态码
- 权限验证失败

### 2. 404 页面未找到 (`not-found.tsx`)

**用途**：当请求的页面不存在时显示

**特点**：

- 使用 `mushroom_5.svg` 作为插图
- 蓝色主题（primary 颜色）
- 友好的错误提示和导航选项
- 包含帮助提示和故障排除建议

**触发场景**：

- 用户访问不存在的 URL
- 路由匹配失败
- API 返回 404 状态码
- Next.js 自动处理 404 错误

### 3. 500 服务器内部错误页面 (`/500`)

**用途**：当服务器遇到内部错误时显示

**特点**：

- 使用 `mushroom_8.svg` 作为插图
- 红色主题（error 颜色）
- 错误报告功能
- 包含"报告此错误"按钮

**触发场景**：

- 服务器内部错误
- API 返回 500 状态码
- 应用崩溃或未捕获的异常

### 4. 全局错误页面 (`error.tsx`)

**用途**：处理应用中的未捕获错误

**特点**：

- 智能识别错误类型
- 根据错误类型显示不同内容
- 自动选择相应的蘑菇插图
- 统一的错误处理逻辑

## 错误处理系统

### 错误处理工具 (`utils/errorHandler.ts`)

提供了一套完整的错误处理工具：

```typescript
// 处理 HTTP 错误
handleHttpError(status: number, message?: string, options?: ErrorHandlerOptions)

// 处理网络错误
handleNetworkError(error: any, options?: ErrorHandlerOptions)

// 处理应用错误
handleAppError(error: Error, options?: ErrorHandlerOptions)

// 创建错误处理函数
createErrorHandler(options?: ErrorHandlerOptions)
```

### 错误日志记录器

```typescript
// 全局错误日志记录器
import { errorLogger } from "@/utils/errorHandler";

// 记录错误
errorLogger.log(errorInfo);

// 获取错误列表
const errors = errorLogger.getErrors();

// 清除错误记录
errorLogger.clearErrors();
```

### API 集成

错误处理已集成到 API 拦截器中：

- 自动识别 HTTP 状态码
- 记录错误到日志系统
- 根据状态码重定向到相应错误页面
- 提供用户友好的错误消息

## 使用方法

### 1. 手动触发错误页面

```typescript
import { useRouter } from "next/navigation";

const router = useRouter();

// 跳转到 403 页面
router.push("/403");

// 跳转到 404 页面（Next.js 会自动使用 not-found.tsx）
router.push("/not-found");

// 跳转到 500 页面
router.push("/500");
```

### 2. 在 API 调用中处理错误

```typescript
import { handleHttpError } from "@/utils/errorHandler";

try {
  const response = await apiRequest("/some-endpoint");
} catch (error) {
  if (error.response) {
    handleHttpError(error.response.status, error.message);
  }
}
```

### 3. 创建自定义错误处理

```typescript
import { createErrorHandler } from "@/utils/errorHandler";

const errorHandler = createErrorHandler({
  router: router,
  showNotification: (message, type) => {
    // 显示通知
  },
  logError: (error) => {
    // 记录错误
  },
});

// 使用错误处理函数
errorHandler.handleHttpError(403, "Access denied");
```

## 测试错误页面

访问 `/test-errors` 页面可以测试所有错误页面：

- 测试 403 页面
- 测试 404 页面
- 测试 500 页面
- 触发应用错误
- 模拟 HTTP 错误

## 自定义错误页面

### 添加新的错误页面

1. 在 `app` 目录下创建新的错误页面目录（如 `/503`）
2. 创建 `page.tsx` 文件
3. 使用相应的蘑菇插图
4. 在 `errorHandler.ts` 中添加处理逻辑

### 自定义错误样式

所有错误页面都使用 Material-UI 主题，可以通过修改主题配置来自定义样式：

```typescript
// 在 theme/index.ts 中自定义错误页面颜色
const theme = createTheme({
  palette: {
    error: {
      main: "#your-error-color",
    },
    warning: {
      main: "#your-warning-color",
    },
  },
});
```

## 最佳实践

1. **错误日志记录**：始终记录错误信息以便调试
2. **用户友好**：提供清晰的错误说明和解决方案
3. **导航选项**：提供多种导航选项（首页、返回、重试）
4. **响应式设计**：确保错误页面在各种设备上都能正常显示
5. **性能优化**：使用 Next.js Image 组件优化图片加载

## 故障排除

### 常见问题

1. **错误页面不显示**：检查路由配置和文件路径
2. **图片不加载**：确认图片文件存在于 `public/images/plate/` 目录
3. **样式问题**：检查 Material-UI 主题配置
4. **API 错误不触发**：检查 API 拦截器配置

### 调试方法

1. 打开浏览器开发者工具
2. 查看 Console 标签页的错误信息
3. 检查 Network 标签页的请求状态
4. 使用 `/test-errors` 页面进行测试

## 文件结构

```
frontend/src/
├── app/
│   ├── 403/page.tsx          # 403 错误页面
│   ├── not-found.tsx         # 404 错误页面（Next.js 自动处理）
│   ├── 500/page.tsx          # 500 错误页面
│   ├── error.tsx             # 全局错误页面
│   └── test-errors/page.tsx  # 错误测试页面
├── utils/
│   └── errorHandler.ts       # 错误处理工具
└── libs/
    └── api/
        └── api.ts            # API 拦截器（已集成错误处理）
```

这套错误页面系统提供了完整的错误处理解决方案，确保用户在任何错误情况下都能获得良好的体验。
