# 数据路径配置说明

## 概述

TCGA、DepMap、GTEx 等数据库的数据路径通过配置数据根目录（`DATA_ROOT`）自动识别，实现数据与代码的分离，提高部署灵活性。

**只需配置一个根路径，子路径会自动识别！**

## 配置方式

### 方式 1：环境变量（推荐）

在 `.env` 文件中或系统环境变量中设置：

```bash
# 设置数据根目录，子目录（tcga, depmap, gtex）会自动识别
DATA_ROOT=/mnt/external_data
```

系统会自动识别以下路径：
- `/mnt/external_data/tcga/`
- `/mnt/external_data/depmap/`
- `/mnt/external_data/gtex/`

### 方式 2：配置文件

在 `backend/app/core/config.py` 中的 `Settings` 类中设置默认值：

```python
class Settings(BaseSettings):
    # 数据根目录
    data_root: str = "/mnt/external_data"
```

## 路径优先级

配置路径的优先级（从高到低）：

1. **环境变量 `DATA_ROOT/tcga`**（最优先）
2. **配置文件中的 `data_root/tcga`**
3. **默认路径：项目根目录/data/tcga**（最后备选）

## 路径格式

支持两种路径格式：

### 绝对路径

```bash
# 示例：数据存储在外部挂载点
TCGA_DATA_DIR=/mnt/nas/tcga_data
TCGA_DATA_DIR=/data/omics/tcga
TCGA_DATA_DIR=/home/user/datasets/tcga
```

### 相对路径

```bash
# 相对于项目根目录
TCGA_DATA_DIR=data/tcga
TCGA_DATA_DIR=../external_data/tcga
TCGA_DATA_DIR=../../datasets/tcga
```

## 配置示例

### 示例 1：数据在外部存储（推荐）

```bash
# .env 文件
DATA_ROOT=/mnt/nas/omics_data
```

系统会自动识别：
- `/mnt/nas/omics_data/tcga/`
- `/mnt/nas/omics_data/depmap/`
- `/mnt/nas/omics_data/gtex/`

### 示例 2：开发环境使用相对路径

```bash
# .env 文件（开发环境）
DATA_ROOT=data
```

系统会自动识别：
- `项目根目录/data/tcga/`
- `项目根目录/data/depmap/`
- `项目根目录/data/gtex/`

### 示例 3：生产环境使用绝对路径

```bash
# .env 文件（生产环境）
DATA_ROOT=/mnt/production/omics_data
```

系统会自动识别：
- `/mnt/production/omics_data/tcga/`
- `/mnt/production/omics_data/depmap/`
- `/mnt/production/omics_data/gtex/`

## 数据目录结构

配置的数据目录应遵循以下结构：

```
{配置的数据目录}/
├── tcga/
│   ├── BRCA/
│   │   ├── rsem_gene_tpm.parquet
│   │   ├── mc3_maf.parquet
│   │   ├── clinical.parquet
│   │   └── mirna.parquet
│   ├── LIHC/
│   │   └── ...
│   └── ...
├── depmap/
│   └── ...
└── gtex/
    └── ...
```

## 验证配置

配置后，系统会在启动时检查数据目录是否存在。如果不存在，会记录警告并使用模拟数据。

查看日志确认数据路径：

```python
# 在代码中查看当前使用的数据路径
from app.core.config import settings
print(settings.get_tcga_data_dir())
```

## 注意事项

1. **路径权限**：确保应用有读取数据目录的权限
2. **路径存在性**：如果数据目录不存在，系统会自动降级使用模拟数据
3. **跨平台兼容**：使用 `Path` 对象确保 Windows/Linux/macOS 兼容
4. **环境变量优先级**：环境变量会覆盖配置文件中的设置

## Docker 部署示例

在 Docker 中挂载外部数据目录：

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - DATA_ROOT=/mnt/data
    volumes:
      - /host/path/to/data:/mnt/data:ro
```

或在 Dockerfile 中：

```dockerfile
ENV DATA_ROOT=/mnt/data
VOLUME ["/mnt/data"]
```

## 故障排查

### 问题：数据目录未找到

**症状**：日志中出现 "TCGA data directory not found"

**解决方案**：
1. 检查环境变量是否正确设置
2. 验证路径是否存在：`ls -la $TCGA_DATA_DIR`
3. 检查路径权限：确保应用用户有读取权限
4. 查看日志中的实际路径

### 问题：路径解析错误

**症状**：路径拼接不正确

**解决方案**：
- 使用绝对路径避免路径解析问题
- 检查相对路径是否正确相对于项目根目录

