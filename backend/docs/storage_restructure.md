# 后端文件存储目录结构调整

## 概述

将原有的按文件类型分类的存储结构调整为以用户 ID 为顶层目录的个人云盘结构，每个用户拥有独立的文件存储空间。

## 目录结构变更

### 原有结构

```
uploads/
├── avatars/          # 用户头像
├── images/           # 用户图片
│   └── {user_id}/   # 按用户ID分类
├── docs/             # 文档文件
└── sheets/           # 表格文件
```

### 新结构

```
uploads/
├── {user_id}/        # 用户个人目录
│   ├── 上传/         # 用户上传的文件（固定文件夹）
│   │   ├── avatar_*.jpg
│   │   ├── image_*.png
│   │   └── document_*.pdf
│   ├── 任务/         # 系统生成的任务文件（固定文件夹）
│   │   ├── analysis_result.csv
│   │   └── report.pdf
│   └── 自定义文件夹/  # 用户创建的文件夹
│       ├── 我的项目/
│       └── 工作文档/
```

## 代码变更

### 1. 文件上传工具 (`app/utils/file_upload.py`)

#### 新增函数

- `get_user_upload_dir(user_id: int)`: 获取用户上传目录
- `get_user_avatar_dir(user_id: int)`: 获取用户头像目录
- `get_user_static_dir(user_id: int)`: 获取用户静态文件目录

#### 更新函数

- `process_avatar_image(file, user_id)`: 头像处理函数，支持用户 ID 参数
- `save_avatar_file(file, user_id)`: 保存头像文件，支持用户 ID 参数
- `get_avatar_url(user_id, filename)`: 生成头像 URL，路径格式为 `/static/{user_id}/{filename}`
- `delete_avatar_file(user_id, filename)`: 删除头像文件，支持用户 ID 参数

### 2. 图片服务 (`app/services/image.py`)

#### 新增函数

- `get_user_upload_dir(user_id: int)`: 获取用户上传目录
- `get_user_images_dir(user_id: int)`: 获取用户图片目录
- `get_user_static_dir(user_id: int)`: 获取用户静态文件目录

#### 更新函数

- `process_image_file(file, user_id)`: 图片处理函数，使用新的目录结构
- `get_image_url(user_id, filename)`: 生成图片 URL，路径格式为 `/static/{user_id}/{filename}`

### 3. 认证 API (`app/api/v1/auth.py`)

#### 更新函数

- `upload_avatar()`: 头像上传 API，传递用户 ID 参数
- `delete_avatar()`: 头像删除 API，使用新的路径检查逻辑

## 安全特性

### ✅ **用户隔离**

- 每个用户只能访问自己的文件目录
- 文件路径包含用户 ID，防止跨用户访问
- 静态文件服务需要验证用户权限

### ✅ **固定文件夹保护**

- "上传"和"任务"文件夹为系统文件夹
- 用户无法删除这些文件夹
- 确保系统功能的正常运行

### ✅ **路径安全**

- 所有文件路径都经过用户 ID 验证
- 防止路径遍历攻击
- 文件名包含用户 ID 和时间戳，确保唯一性

## 静态文件服务

### URL 格式

- 头像: `/static/{user_id}/{filename}`
- 图片: `/static/{user_id}/{filename}`
- 文档: `/static/{user_id}/{filename}`

### 访问控制

需要在静态文件服务中添加用户权限验证，确保用户只能访问自己的文件。

## 迁移说明

### 已完成的操作

1. ✅ 创建新的目录结构
2. ✅ 移动现有文件到用户目录
3. ✅ 更新后端代码支持新结构
4. ✅ 删除旧的空目录

### 需要后续处理

1. **静态文件服务配置**: 更新静态文件服务配置以支持新的 URL 格式
2. **权限验证**: 在静态文件访问时添加用户权限验证
3. **数据库更新**: 更新数据库中存储的文件路径
4. **前端适配**: 确保前端能正确处理新的文件 URL 格式

## 示例

### 用户 ID 为 1 的文件存储

```
uploads/1/
├── 上传/
│   ├── 1_20241201_143022_a1b2c3d4.jpg  # 头像
│   ├── 1_20241201_143045_e5f6g7h8.png  # 图片
│   └── 1_20241201_143102_i9j0k1l2.pdf  # 文档
├── 任务/
│   ├── analysis_result_20241201.csv
│   └── report_20241201.pdf
└── 我的项目/
    ├── README.md
    └── src/
        └── main.py
```

### 对应的静态文件 URL

- 头像: `/static/1/1_20241201_143022_a1b2c3d4.jpg`
- 图片: `/static/1/1_20241201_143045_e5f6g7h8.png`
- 文档: `/static/1/1_20241201_143102_i9j0k1l2.pdf`

## 总结

新的目录结构提供了：

- ✅ **更好的用户隔离**: 每个用户拥有独立的存储空间
- ✅ **更清晰的组织**: 固定文件夹和自定义文件夹分离
- ✅ **更强的安全性**: 用户只能访问自己的文件
- ✅ **更好的扩展性**: 支持云盘功能的完整实现
- ✅ **向后兼容**: 现有功能继续正常工作

这个结构调整为后续实现完整的云盘功能奠定了基础，用户现在可以安全地管理自己的文件，而系统也能更好地组织和保护用户数据。
