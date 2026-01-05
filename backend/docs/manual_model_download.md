# RAG Embedding 模型手动下载指南

## 使用的模型

RAG 系统使用以下 embedding 模型（按优先级）：

1. **OpenAI Embeddings** (如果配置了 `OPENAI_API_KEY`)
   - 模型：`text-embedding-3-small`
   - 类型：API 调用，无需下载

2. **HuggingFace Embeddings** (本地模型，无需 API key)
   - 模型：`sentence-transformers/all-MiniLM-L6-v2`
   - 类型：本地模型，需要下载

## 手动下载 HuggingFace 模型

### 方法 1: 使用 huggingface-cli (推荐)

1. **安装 huggingface-cli**:
   ```bash
   pip install huggingface_hub
   ```

2. **下载模型**:
   ```bash
   # 设置缓存目录（与代码中的配置一致）
   export HF_HUB_CACHE=/path/to/your/project/backend/static/hf_cache
   
   # 或者使用默认位置
   export HF_HUB_CACHE=~/.cache/huggingface
   
   # 下载模型
   huggingface-cli download sentence-transformers/all-MiniLM-L6-v2 --local-dir $HF_HUB_CACHE/hub/models--sentence-transformers--all-MiniLM-L6-v2
   ```

### 方法 2: 使用 Python 脚本下载

运行提供的下载脚本：

```bash
cd backend
python scripts/download_rag_model.py
```

或者手动创建下载脚本：

```python
from huggingface_hub import snapshot_download
from pathlib import Path
import os

# 设置缓存目录
cache_dir = Path("static/hf_cache")
cache_dir.mkdir(parents=True, exist_ok=True)

# 设置环境变量
os.environ["HF_HUB_CACHE"] = str(cache_dir.absolute())

# 下载模型
model_id = "sentence-transformers/all-MiniLM-L6-v2"
print(f"Downloading {model_id}...")
snapshot_download(
    repo_id=model_id,
    local_dir=cache_dir / "hub" / f"models--{model_id.replace('/', '--')}",
    local_dir_use_symlinks=False,
)
print("Download complete!")
```

### 方法 3: 使用 Git LFS (适用于完整仓库下载)

1. **安装 Git LFS**:
   ```bash
   # macOS
   brew install git-lfs
   
   # Linux
   sudo apt-get install git-lfs
   ```

2. **克隆模型仓库**:
   ```bash
   # 设置缓存目录
   export HF_HUB_CACHE=/path/to/your/project/backend/static/hf_cache
   mkdir -p $HF_HUB_CACHE/hub
   
   # 克隆模型
   cd $HF_HUB_CACHE/hub
   git lfs install
   git clone https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
   
   # 重命名为正确的格式
   mv all-MiniLM-L6-v2 models--sentence-transformers--all-MiniLM-L6-v2
   ```

### 方法 4: 直接下载文件（手动方式）

1. **访问模型页面**:
   - URL: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2

2. **下载必需文件**:
   需要下载以下文件到正确的位置：
   ```
   static/hf_cache/hub/models--sentence-transformers--all-MiniLM-L6-v2/
   ├── config.json
   ├── pytorch_model.bin (或 model.safetensors)
   ├── tokenizer_config.json
   ├── vocab.txt
   ├── special_tokens_map.json
   └── 1_Pooling/
       └── config.json
   ```

3. **创建目录结构**:
   ```bash
   mkdir -p static/hf_cache/hub/models--sentence-transformers--all-MiniLM-L6-v2
   cd static/hf_cache/hub/models--sentence-transformers--all-MiniLM-L6-v2
   ```

4. **下载文件**:
   从 HuggingFace 模型页面下载所有必需文件到上述目录。

## 模型文件位置

根据代码配置，模型应该放在以下位置之一：

1. **项目目录** (如果 `static_root` 可用):
   ```
   backend/static/hf_cache/hub/models--sentence-transformers--all-MiniLM-L6-v2/
   ```

2. **用户缓存目录** (默认):
   ```
   ~/.cache/huggingface/hub/models--sentence-transformers--all-MiniLM-L6-v2/
   ```

## 验证下载

下载完成后，运行以下 Python 代码验证：

```python
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
import os

# 设置缓存目录（如果使用自定义位置）
os.environ["HF_HUB_CACHE"] = "/path/to/your/cache"

# 初始化模型
embed_model = HuggingFaceEmbedding(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    trust_remote_code=True,
)

# 测试
dim = embed_model.get_query_embedding_dimension()
print(f"Embedding dimension: {dim}")  # 应该输出 384
```

## 模型信息

- **模型名称**: `sentence-transformers/all-MiniLM-L6-v2`
- **模型大小**: 约 80MB
- **Embedding 维度**: 384
- **支持语言**: 多语言（包括中文）
- **HuggingFace 页面**: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2

## 常见问题

### 1. 下载速度慢
- 使用镜像站点（如果在中国）：
  ```bash
  export HF_ENDPOINT=https://hf-mirror.com
  ```

### 2. 网络连接问题
- 使用代理：
  ```bash
  export HTTP_PROXY=http://your-proxy:port
  export HTTPS_PROXY=http://your-proxy:port
  ```

### 3. 磁盘空间不足
- 模型需要约 100-200MB 的磁盘空间（包括缓存文件）

### 4. 权限问题
- 确保对缓存目录有写入权限：
  ```bash
  chmod -R 755 static/hf_cache
  ```

## 替代方案

如果无法下载 HuggingFace 模型，可以考虑：

1. **使用 OpenAI Embeddings** (需要 API key):
   - 在 `.env` 文件中设置 `OPENAI_API_KEY`
   - 模型会自动使用 OpenAI API，无需下载

2. **使用其他本地模型**:
   - 修改 `backend/app/agent/rag.py` 中的 `model_name`
   - 推荐模型：
     - `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (多语言)
     - `sentence-transformers/all-mpnet-base-v2` (英文，质量更高)
