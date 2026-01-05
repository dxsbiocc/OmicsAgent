# 后端图表生成系统更新

## 概述

后端图表生成系统已更新，现在支持 R 和 Python 两种绘图方式，提供更灵活和强大的图表生成能力。

## 新功能

### 1. 双引擎支持

- **R 引擎**: 使用 ggplot2 生成高质量统计图表
- **Python 引擎**: 使用 matplotlib 生成科学计算图表
- **自动选择**: 根据参数自动选择合适的引擎

### 2. 统一的 API 接口

- **新式 API**: `/api/visual/run-chart` - 支持 R 和 Python
- **传统 API**: `/api/visual/run/{tool}` - 向后兼容原有工具

### 3. 智能图表类型检测

系统会根据工具名称自动检测图表类型：

- `line` - 折线图
- `bar` - 柱状图
- `scatter` - 散点图
- `pie` - 饼图
- `area` - 面积图
- `radar` - 雷达图
- `heatmap` - 热力图
- `funnel` - 漏斗图

## API 使用示例

### 新式图表 API

```bash
POST /api/visual/run-chart
Content-Type: application/json

{
  "chart_type": "line",
  "engine": "r",
  "data": [
    {"id": 1, "name": "Point 1", "value": 10},
    {"id": 2, "name": "Point 2", "value": 20}
  ],
  "title": "My Chart",
  "width": 800,
  "height": 600
}
```

### 参数说明

- `chart_type`: 图表类型 (line, bar, scatter, pie, area, radar, heatmap, funnel)
- `engine`: 渲染引擎 ("r" 或 "python")
- `data`: 图表数据数组
- `title`: 图表标题
- `width`: 图表宽度（像素）
- `height`: 图表高度（像素）

## 目录结构

```
backend/
├── app/
│   ├── core/
│   │   └── visual_config.py    # 可视化配置管理
│   ├── services/
│   │   └── visual.py          # 更新的可视化服务
│   └── api/v1/
│       └── visual.py          # 更新的API端点
├── scripts/
│   └── visual/                # 可视化脚本目录
│       ├── line/
│       │   ├── basic/
│       │   │   ├── plot.R
│       │   │   ├── plot.py
│       │   │   └── meta.json
│       │   └── area/
│       │       ├── plot.R
│       │       ├── plot.py
│       │       └── meta.json
│       ├── bar/
│       │   ├── run.R
│       │   ├── run.py
│       │   └── meta.json
│       ├── scatter/
│       │   ├── run.R
│       │   ├── run.py
│       │   └── meta.json
│       └── pie/
│           ├── run.R
│           ├── run.py
│           └── meta.json
├── tests/
│   └── visual/
│       └── test_chart_generation.py  # 测试脚本
├── docs/
│   └── chart_system_update.md  # 系统更新文档
└── static/images/visual/      # 生成的图片存储目录
    ├── line_r/                # R生成的折线图
    ├── line_python/           # Python生成的折线图
    └── ...
```

## 技术实现

### 1. 配置管理

- `visual_config.py`: 集中管理所有配置
- 支持环境变量配置解释器路径
- 灵活的图表类型映射
- 默认参数管理

### 2. VisualService 更新

- `run_tool()`: 主入口，自动检测使用新式还是传统方式
- `_run_chart_tool()`: 新式图表工具执行逻辑
- `_run_legacy_tool()`: 传统工具执行逻辑（向后兼容）

### 3. 数据流程

1. 接收前端数据
2. 自动检测图表类型和引擎
3. 将数据转换为 CSV 格式
4. 调用相应的 R 或 Python 脚本
5. 生成 PNG 图片
6. 返回图片 URL

### 4. 错误处理

- 脚本执行超时（可配置）
- 脚本执行失败
- 输出文件未生成
- 参数验证错误

## 配置说明

### 环境变量

```bash
# R解释器配置
export R_INTERPRETER="/usr/local/bin/Rscript"
export R_LIBS_USER="/path/to/r/libs"
export R_HOME="/usr/local/lib/R"

# Python解释器配置
export PYTHON_INTERPRETER="/usr/local/bin/python3"
export PYTHONPATH="/path/to/python/libs"
```

### 图表类型映射

每种图表类型都有对应的脚本映射：

- R 脚本: `plot.R` 或 `run.R`
- Python 脚本: `plot.py` 或 `run.py`
- 默认子目录: 某些图表类型有特定的子目录

## 依赖要求

### R 环境

- R >= 4.0
- ggplot2
- jsonlite
- readr
- dplyr (用于饼图)

### Python 环境

- Python >= 3.8
- matplotlib
- pandas
- numpy
- scipy (可选，用于趋势线)

## 测试

运行测试脚本验证功能：

```bash
cd backend
python tests/visual/test_chart_generation.py
```

## 向后兼容性

- 原有的工具 API (`/api/visual/run/{tool}`) 完全兼容
- 现有的 R 脚本继续工作
- 数据库中的工具记录不受影响

## 性能优化

- 异步执行避免阻塞
- 可配置超时机制
- 临时文件自动清理
- 并发安全的文件命名

## 未来扩展

- 支持更多图表类型
- 添加图表样式主题
- 支持交互式图表
- 批量图表生成
- 图表模板系统
