# 认证功能集成说明

## 概述

本项目已成功集成了完整的用户认证系统，包括登录、注册、用户状态管理等功能，并与后端 API 完全链接。

## 功能特性

### 🔐 认证功能

- **用户注册**：支持用户名、邮箱、密码注册
- **用户登录**：支持用户名/密码登录
- **自动登录**：注册成功后自动登录
- **状态持久化**：登录状态保存在 localStorage
- **自动登出**：Token 过期时自动登出

### 🛡️ 安全特性

- **Token 管理**：JWT Token 自动添加到请求头
- **请求拦截**：自动处理认证失败和重定向
- **受保护路由**：需要认证的页面自动重定向到登录页
- **密码验证**：前端密码强度验证

### 🎨 用户界面

- **响应式设计**：适配各种屏幕尺寸
- **Material-UI**：现代化的 UI 组件
- **表单验证**：实时输入验证和错误提示
- **加载状态**：登录/注册过程中的加载指示器

## 文件结构

```
frontend/src/
├── hooks/
│   └── useAuth.ts                 # 认证 Hook
├── contexts/
│   └── AuthContext.tsx           # 认证上下文
├── components/
│   └── auth/
│       ├── LoginForm.tsx         # 登录表单
│       ├── RegisterForm.tsx      # 注册表单
│       ├── AuthPage.tsx          # 认证页面
│       ├── ProtectedRoute.tsx    # 受保护路由
│       └── index.ts              # 统一导出
├── app/
│   ├── auth/
│   │   ├── login/page.tsx        # 登录页面
│   │   └── register/page.tsx     # 注册页面
│   ├── profile/page.tsx          # 个人资料页面
│   ├── settings/page.tsx         # 设置页面
│   └── layout.tsx                # 根布局（包含 AuthProvider）
└── libs/
    └── api/
        └── auth.ts               # 认证 API 接口
```

## 使用方法

### 1. 在组件中使用认证状态

```tsx
import { useAuthContext } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthContext();

  if (!isAuthenticated) {
    return <div>请先登录</div>;
  }

  return <div>欢迎，{user.username}！</div>;
}
```

### 2. 创建受保护的页面

```tsx
import { ProtectedRoute } from "@/components/auth";

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>这是受保护的内容</div>
    </ProtectedRoute>
  );
}
```

### 3. 在 Header 中显示用户菜单

Header 组件已自动集成用户菜单，根据登录状态显示：

- 未登录：显示"登录"按钮
- 已登录：显示用户头像和下拉菜单

## API 接口

### 认证相关接口

```typescript
// 用户注册
POST /api/v1/auth/register
{
  "username": "string",
  "email": "string",
  "password": "string"
}

// 用户登录
POST /api/v1/auth/login
{
  "username": "string",
  "password": "string"
}

// 获取当前用户信息
GET /api/v1/auth/me

// 更新用户信息
PUT /api/v1/auth/update
{
  "username": "string",
  "email": "string"
}

// 修改密码
POST /api/v1/auth/change-password
{
  "old_password": "string",
  "new_password": "string"
}
```

## 配置说明

### 环境变量

在 `.env.local` 中配置：

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 认证流程

1. **注册流程**：

   - 用户填写注册表单
   - 前端验证输入数据
   - 调用注册 API
   - 注册成功后自动登录
   - 存储用户信息和 Token
   - 跳转到首页

2. **登录流程**：

   - 用户填写登录表单
   - 调用登录 API
   - 存储用户信息和 Token
   - 跳转到首页

3. **自动认证**：
   - 页面加载时检查本地存储的 Token
   - 验证 Token 有效性
   - 无效时清除本地存储并重定向到登录页

## 安全考虑

1. **Token 存储**：使用 localStorage 存储 Token
2. **请求拦截**：自动在请求头中添加 Authorization
3. **错误处理**：统一处理认证失败和网络错误
4. **自动登出**：Token 过期时自动清除状态
5. **密码验证**：前端密码强度验证

## 测试页面

- `/auth/login` - 登录页面
- `/auth/register` - 注册页面
- `/profile` - 个人资料页面（需要认证）
- `/settings` - 设置页面（需要认证）

## 注意事项

1. 确保后端 API 正常运行
2. 检查 CORS 配置
3. Token 过期时间设置合理
4. 生产环境使用 HTTPS
5. 定期更新依赖包

## 故障排除

### 常见问题

1. **登录失败**：检查用户名/密码是否正确
2. **注册失败**：检查用户名是否已存在，邮箱格式是否正确
3. **Token 过期**：重新登录即可
4. **网络错误**：检查后端服务是否正常运行

### 调试方法

1. 打开浏览器开发者工具
2. 查看 Network 标签页的请求
3. 查看 Console 标签页的错误信息
4. 检查 localStorage 中的用户数据
