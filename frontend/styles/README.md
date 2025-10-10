# 样式文件组织结构

本目录按页面功能组织样式文件，便于维护和管理。

## 目录结构

```
styles/
├── index.css                    # 全局样式入口文件
├── common/                      # 通用样式
│   ├── index.css               # 通用样式入口
│   ├── global-animations.module.css    # 全局动画样式
│   └── speeddial-animations.module.css # SpeedDial 组件样式
├── layout/                      # 布局相关样式
│   └── index.css               # 布局样式入口
├── blog/                        # 博客相关样式
│   ├── index.css               # 博客样式入口
│   └── blog-animations.module.css      # 博客动画样式
└── visual/                      # 可视化相关样式
    ├── index.css               # 可视化样式入口
    └── visual-animations.module.css    # 可视化动画样式
```

## 使用方式

### 1. 导入特定页面的样式

```typescript
// 导入博客相关样式
import blogStyles from "../styles/blog/blog-animations.module.css";

// 导入通用样式
import commonStyles from "../styles/common/speeddial-animations.module.css";
```

### 2. 导入整个分类的样式

```typescript
// 导入所有博客样式
import "../styles/blog/index.css";

// 导入所有通用样式
import "../styles/common/index.css";
```

### 3. 导入所有样式

```typescript
// 在根组件中导入所有样式
import "../styles/index.css";
```

## 样式文件命名规范

- 使用 kebab-case 命名
- 组件样式：`{component-name}-animations.module.css`
- 页面样式：`{page-name}-animations.module.css`
- 通用样式：`global-animations.module.css`

## 添加新样式

1. 确定样式所属的分类（common/layout/blog/visual）
2. 在对应目录下创建样式文件
3. 在分类的 `index.css` 中导入新样式
4. 更新组件中的导入路径
