# 后端文件存储目录结构调整（更新版）

## 概述

将原有的按文件类型分类的存储结构调整为以用户 ID 为顶层目录的个人云盘结构，每个用户拥有独立的文件存储空间。**重要更新**：用户文件统一存储在 `uploads` 目录下，不再使用 `static` 目录存储用户文件。

## 目录结构变更

### 原有结构

```
uploads/
├── avatars/          # 用户头像
├── images/           # 用户图片
│   └── {user_id}/   # 按用户ID分类
├── docs/             # 文档文件
└── sheets/           # 表格文件

static/
├── avatars/          # 静态头像文件
└── images/           # 静态图片文件
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

static/               # 仅用于网站静态资源
├── css/              # 样式文件
├── js/               # JavaScript文件
├── images/           # 网站图片资源
└── avatars/          # 预设头像
```

## 重要变更

### ✅ **存储策略调整**

- **uploads 目录**: 存储所有用户上传的文件
- **static 目录**: 仅用于网站静态资源（CSS、JS、预设头像等）
- **用户文件**: 不再复制到 static 目录，直接存储在 uploads 目录
- **URL 格式**: 用户文件 URL 格式为 `/uploads/{user_id}/上传/{filename}`

### ✅ **代码变更**

#### 1. 文件上传工具 (`app/utils/file_upload.py`)

- **移除静态文件复制**: 头像文件不再复制到 static 目录
- **更新 URL 生成**: `get_avatar_url()` 返回 `/uploads/{user_id}/上传/{filename}`
- **简化删除逻辑**: `delete_avatar_file()` 只删除 uploads 目录中的文件

#### 2. 图片服务 (`app/services/image.py`)

- **移除静态文件复制**: 图片文件不再复制到 static 目录
- **更新 URL 生成**: `get_image_url()` 返回 `/uploads/{user_id}/上传/{filename}`
- **简化删除逻辑**: 只删除 uploads 目录中的文件

#### 3. 认证 API (`app/api/v1/auth.py`)

- **更新路径检查**: 检查 `/uploads/{user_id}/上传/` 格式的 URL
- **简化文件管理**: 不再需要管理 static 目录中的文件

## 静态文件服务

### URL 格式

- **用户文件**: `/uploads/{user_id}/上传/{filename}`
- **网站资源**: `/static/{resource_path}`

### 存储策略

- **uploads 目录**: 存储所有用户上传的文件
- **static 目录**: 仅用于网站静态资源（CSS、JS、预设头像等）
- **用户隔离**: 每个用户只能访问自己的文件目录

### 访问控制

需要在静态文件服务中添加用户权限验证，确保用户只能访问自己的文件。

## 代码变更详情

### 文件上传工具更新

```python
# 移除静态文件复制
async def process_avatar_image(file: UploadFile, user_id: int) -> str:
    # 只保存到uploads目录，不再复制到static目录
    avatar_dir = get_user_avatar_dir(user_id)
    # ... 处理逻辑 ...
    # 不再有: shutil.copy2(file_path, static_file_path)

def get_avatar_url(user_id: int, filename: str) -> str:
    return f"/uploads/{user_id}/上传/{filename}"

def delete_avatar_file(user_id: int, filename: str) -> bool:
    # 只删除uploads目录中的文件
    avatar_dir = get_user_avatar_dir(user_id)
    upload_file_path = avatar_dir / filename
    # 不再删除static目录中的文件
```

### 图片服务更新

```python
async def process_image_file(file: UploadFile, user_id: int):
    # 只保存到uploads目录，不再复制到static目录
    images_dir = get_user_images_dir(user_id)
    # ... 处理逻辑 ...
    # 不再有: shutil.copy2(file_path, static_file_path)

def get_image_url(user_id: int, filename: str) -> str:
    return f"/uploads/{user_id}/上传/{filename}"
```

### 认证 API 更新

```python
# 更新路径检查逻辑
if current_user.avatar_url and current_user.avatar_url.startswith(
    f"/uploads/{current_user.id}/上传/"
):
    # 处理用户上传的头像
```

## 迁移说明

### 已完成的操作

1. ✅ 创建新的目录结构
2. ✅ 移动现有文件到用户目录
3. ✅ 更新后端代码支持新结构
4. ✅ 移除静态文件复制逻辑
5. ✅ 更新 URL 生成函数
6. ✅ 简化文件删除逻辑

### 需要后续处理

1. **静态文件服务配置**: 更新静态文件服务配置以支持新的 URL 格式
2. **权限验证**: 在文件访问时添加用户权限验证
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

### 对应的文件 URL

- **头像**: `/uploads/1/上传/1_20241201_143022_a1b2c3d4.jpg`
- **图片**: `/uploads/1/上传/1_20241201_143045_e5f6g7h8.png`
- **文档**: `/uploads/1/上传/1_20241201_143102_i9j0k1l2.pdf`

### 网站静态资源

- **CSS**: `/static/css/main.css`
- **JS**: `/static/js/app.js`
- **预设头像**: `/static/images/avatar/default.png`

## 优势

### ✅ **存储效率**

- **避免重复**: 文件不再同时存储在 uploads 和 static 目录
- **节省空间**: 减少磁盘空间占用
- **简化管理**: 文件管理逻辑更加简单

### ✅ **安全性**

- **用户隔离**: 每个用户只能访问自己的文件
- **路径安全**: 文件路径包含用户 ID，防止跨用户访问
- **权限控制**: 更容易实现文件访问权限控制

### ✅ **维护性**

- **统一存储**: 所有用户文件统一存储在 uploads 目录
- **清晰分离**: 用户文件和网站资源明确分离
- **易于备份**: 用户数据和网站资源可以分别备份

## 总结

新的存储策略提供了：

- ✅ **更高效的存储**: 避免文件重复存储
- ✅ **更清晰的架构**: 用户文件和网站资源明确分离
- ✅ **更强的安全性**: 用户只能访问自己的文件
- ✅ **更简单的维护**: 文件管理逻辑更加简单
- ✅ **更好的扩展性**: 为云盘功能提供完整的存储支持

这个调整使存储架构更加合理，用户文件统一管理，网站资源独立存储，为后续功能扩展奠定了良好的基础。
