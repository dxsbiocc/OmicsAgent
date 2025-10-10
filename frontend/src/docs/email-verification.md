# 邮箱验证功能说明

## 概述

本项目实现了完整的邮箱验证功能，包括发送验证码、验证邮箱、重新发送验证码等功能，确保用户账户的安全性。

## 功能特性

### 🔐 邮箱验证功能

- **发送验证码**：向用户邮箱发送 6 位数字验证码
- **验证邮箱**：用户输入验证码完成邮箱验证
- **重新发送**：支持重新发送验证码，带倒计时限制
- **状态检查**：实时检查邮箱验证状态
- **自动跳转**：注册成功后自动跳转到验证页面

### 🛡️ 安全特性

- **验证码限制**：6 位数字验证码，10 分钟有效期
- **重发限制**：60 秒倒计时防止频繁重发
- **状态持久化**：验证状态保存在用户信息中
- **自动更新**：验证成功后自动更新用户状态

### 🎨 用户界面

- **响应式设计**：适配各种屏幕尺寸
- **实时反馈**：输入验证、错误提示、成功提示
- **倒计时显示**：重发按钮倒计时效果
- **状态指示**：清晰的验证状态显示

## 文件结构

```
frontend/src/
├── components/
│   └── auth/
│       ├── EmailVerification.tsx          # 邮箱验证组件
│       ├── EmailVerificationPage.tsx      # 邮箱验证页面
│       ├── EmailVerificationGuard.tsx     # 邮箱验证守卫
│       └── index.ts                       # 统一导出
├── hooks/
│   └── useEmailVerification.ts            # 邮箱验证 Hook
├── app/
│   └── verify-email/
│       └── page.tsx                       # 邮箱验证页面路由
└── libs/
    └── api/
        └── auth.ts                        # 邮箱验证 API 接口
```

## 使用方法

### 1. 基本邮箱验证

```tsx
import { EmailVerification } from "@/components/auth";

function MyComponent() {
  const handleVerified = () => {
    console.log("邮箱验证成功");
  };

  return (
    <EmailVerification email="user@example.com" onVerified={handleVerified} />
  );
}
```

### 2. 邮箱验证页面

```tsx
import { EmailVerificationPage } from "@/components/auth";

function MyPage() {
  return <EmailVerificationPage />;
}
```

### 3. 邮箱验证守卫

```tsx
import { EmailVerificationGuard } from "@/components/auth";

function ProtectedPage() {
  return (
    <EmailVerificationGuard>
      <div>需要验证邮箱才能访问的内容</div>
    </EmailVerificationGuard>
  );
}
```

### 4. 使用邮箱验证 Hook

```tsx
import { useEmailVerification } from "@/hooks/useEmailVerification";

function MyComponent() {
  const { isVerified, isLoading, checkStatus } = useEmailVerification();

  if (isLoading) return <div>检查中...</div>;

  return (
    <div>
      {isVerified ? "邮箱已验证" : "邮箱未验证"}
      <button onClick={checkStatus}>检查状态</button>
    </div>
  );
}
```

## API 接口

### 邮箱验证相关接口

```typescript
// 发送邮箱验证码
POST /api/v1/auth/send-verification-email
{
  "email": "user@example.com"
}

// 验证邮箱验证码
POST /api/v1/auth/verify-email
{
  "code": "123456"
}

// 重新发送验证码
POST /api/v1/auth/resend-verification-email

// 检查邮箱验证状态
GET /api/v1/auth/email-verification-status
```

### 使用 API 函数

```typescript
import { authApi } from "@/libs/api";

// 发送验证码
await authApi.sendVerificationEmail("user@example.com");

// 验证邮箱
const result = await authApi.verifyEmail("123456");

// 重新发送验证码
await authApi.resendVerificationEmail();

// 检查验证状态
const status = await authApi.checkEmailVerificationStatus();
```

## 配置说明

### 环境变量

在 `.env.local` 中配置：

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 验证流程

1. **注册后验证**：

   - 用户注册成功后自动跳转到验证页面
   - 系统自动发送验证码到用户邮箱
   - 用户输入验证码完成验证

2. **手动验证**：

   - 用户可以在个人资料页面点击"立即验证"
   - 跳转到验证页面进行验证

3. **守卫保护**：
   - 需要验证邮箱的页面使用 `EmailVerificationGuard`
   - 未验证用户会被重定向到验证页面

## 组件说明

### EmailVerification 组件

**Props:**

- `email?: string` - 要验证的邮箱地址
- `onVerified?: () => void` - 验证成功回调
- `onBack?: () => void` - 返回回调

**功能:**

- 显示验证码输入框
- 处理验证码验证
- 支持重新发送验证码
- 倒计时限制重发

### EmailVerificationPage 组件

**功能:**

- 完整的邮箱验证页面
- 自动获取用户邮箱
- 处理验证成功后的跳转
- 提供返回和首页按钮

### EmailVerificationGuard 组件

**Props:**

- `children: React.ReactNode` - 需要保护的内容
- `fallback?: React.ReactNode` - 加载中显示的内容
- `redirectTo?: string` - 重定向到的验证页面路径

**功能:**

- 检查用户登录状态
- 检查邮箱验证状态
- 未验证用户显示验证提示
- 已验证用户显示保护的内容

## 状态管理

### 用户状态

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  is_verified: boolean; // 邮箱验证状态
  is_active: boolean;
  // ... 其他字段
}
```

### 验证状态

```typescript
interface EmailVerificationState {
  isVerified: boolean; // 是否已验证
  isLoading: boolean; // 是否正在加载
  error: string | null; // 错误信息
}
```

## 最佳实践

1. **用户体验**：

   - 提供清晰的验证步骤说明
   - 显示验证码有效期和重发倒计时
   - 提供多种导航选项

2. **安全性**：

   - 验证码有效期限制
   - 重发频率限制
   - 验证状态实时检查

3. **错误处理**：

   - 友好的错误提示
   - 网络错误重试机制
   - 验证失败重新输入

4. **性能优化**：
   - 验证状态缓存
   - 避免重复 API 调用
   - 组件懒加载

## 测试页面

访问 `/verify-email` 页面可以测试邮箱验证功能：

- 输入验证码进行验证
- 测试重新发送功能
- 查看验证状态更新

## 故障排除

### 常见问题

1. **验证码收不到**：检查邮箱地址是否正确，查看垃圾邮件文件夹
2. **验证码错误**：确认输入的是 6 位数字，检查是否过期
3. **重发失败**：等待倒计时结束，检查网络连接
4. **状态不更新**：刷新页面或重新登录

### 调试方法

1. 打开浏览器开发者工具
2. 查看 Network 标签页的 API 请求
3. 查看 Console 标签页的错误信息
4. 检查用户状态和验证状态

## 注意事项

1. 确保后端 API 正常运行
2. 检查邮件服务配置
3. 验证码有效期设置合理
4. 生产环境使用 HTTPS
5. 定期清理过期的验证码

这套邮箱验证系统提供了完整的验证流程，确保用户账户的安全性和良好的用户体验。
