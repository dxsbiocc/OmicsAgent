# EnhancedTable 动态列功能说明

## 🎯 功能概述

`EnhancedTable` 组件已升级为支持动态列结构的表格组件，能够根据后端数据或用户上传的数据自动调整列结构，不再依赖固定的数据列。

## 🔧 主要改进

### 1. 动态列检测

- **移除固定列结构**: 不再限制为 `id`, `name`, `value`, `category` 等固定列
- **自动列检测**: 根据数据自动检测所有列名
- **按字母排序**: 列名按字母顺序排列，确保一致性

### 2. 灵活的数据类型处理

- **自动类型转换**: 尝试将数据转换为数字，失败则保持字符串
- **支持任意列名**: 支持任何列名，如 `x`, `y`, `z`, `group`, `value`, `category` 等
- **动态列数**: 支持任意数量的列

### 3. 智能列名生成

- **智能命名**: 新增列时自动生成有意义的列名
  - 如果有 `x` 列但没有 `y` 列，新列命名为 `y`
  - 如果有 `x`, `y` 列但没有 `z` 列，新列命名为 `z`
  - 如果有 `value` 列但没有 `value2` 列，新列命名为 `value2`
  - 如果有 `category` 列但没有 `category2` 列，新列命名为 `category2`
  - 其他情况使用 `列N` 格式

### 4. 文件上传兼容性

- **支持任意 Excel 结构**: 不再要求特定的列名
- **自动列检测**: 从 Excel 文件第一行自动检测列名
- **灵活数据转换**: 支持任意列数和数据类型

## 📊 数据结构示例

### 后端数据格式

```typescript
// 基础坐标数据
const data1 = [
  { x: 1, y: 2, group: "A" },
  { x: 2, y: 3, group: "A" },
  { x: 3, y: 1, group: "B" },
];

// 扩展坐标数据
const data2 = [
  { x: 1, y: 2, z: 3, group: "A", value: 10 },
  { x: 2, y: 3, z: 1, group: "A", value: 20 },
  { x: 3, y: 1, z: 2, group: "B", value: 15 },
];

// 分类数据
const data3 = [
  { category: "A", count: 10, percentage: 25.5 },
  { category: "B", count: 20, percentage: 50.0 },
  { category: "C", count: 10, percentage: 24.5 },
];

// 时间序列数据
const data4 = [
  { date: "2023-01-01", value: 100, trend: "up" },
  { date: "2023-01-02", value: 105, trend: "up" },
  { date: "2023-01-03", value: 98, trend: "down" },
];
```

### Excel 文件格式

支持任意列结构的 Excel 文件，例如：

- `x`, `y`, `group`
- `x`, `y`, `z`, `group`, `value`
- `category`, `count`, `percentage`
- `date`, `value`, `trend`

## 🎨 使用方式

### 基本使用

```typescript
import EnhancedTable from '@/components/common/EnhancedTable';

// 使用后端数据
<EnhancedTable
  data={backendData}
  onDataChange={handleDataChange}
  title="数据表格"
  height={400}
/>

// 使用示例数据
<EnhancedTable
  title="示例表格"
  height={400}
/>
```

### 数据更新

```typescript
const handleDataChange = (newData: TableRow[]) => {
  console.log("数据已更新:", newData);
  // 处理数据更新逻辑
};
```

## 🔍 功能特性

### 1. 动态列检测

- ✅ 自动检测所有列名
- ✅ 按字母顺序排列
- ✅ 支持任意列数

### 2. 数据类型处理

- ✅ 自动数字/字符串转换
- ✅ 保持原始数据类型
- ✅ 处理空值和 undefined

### 3. 智能列名生成

- ✅ 基于现有列名智能命名
- ✅ 支持常见列名模式
- ✅ 回退到通用命名

### 4. 文件操作

- ✅ 导入 Excel 文件（.xlsx, .xls）
- ✅ 导出 Excel 文件
- ✅ 支持任意列结构

### 5. 表格操作

- ✅ 新增列（智能命名）
- ✅ 新增行
- ✅ 复制/粘贴
- ✅ 撤销/重做

## 🎯 使用场景

### 1. 后端数据适配

- 自动适配后端返回的任意数据结构
- 支持不同工具的示例数据格式
- 无需修改代码即可支持新数据结构

### 2. 用户数据上传

- 支持用户上传任意格式的 Excel 文件
- 自动检测列结构和数据类型
- 提供友好的错误提示

### 3. 数据编辑

- 支持手动添加列和行
- 智能列名生成
- 完整的历史记录和撤销功能

### 4. 数据导出

- 保持原始列结构
- 支持 Excel 格式导出
- 保持数据类型

## 🚀 技术实现

### 核心函数

1. **`convertToSpreadsheetData`**: 将 TableRow 数据转换为 Spreadsheet 格式
2. **`convertFromSpreadsheetData`**: 将 Spreadsheet 数据转换为 TableRow 格式
3. **`handleAddColumn`**: 智能列名生成
4. **`handleFileUpload`**: 文件上传处理

### 数据类型

```typescript
interface TableRow {
  [key: string]: any;
}

type SpreadsheetData = Array<Array<{ value: string | number } | undefined>>;
```

## ✅ 测试验证

所有功能已通过测试验证：

- ✅ 动态列检测功能
- ✅ 数据结构灵活性
- ✅ 文件上传兼容性
- ✅ 智能列名生成
- ✅ 前端集成功能

## 🎉 总结

`EnhancedTable` 组件现在完全支持动态列结构，能够：

- 根据后端数据自动调整列结构
- 支持用户上传任意格式的 Excel 文件
- 提供智能的列名生成功能
- 保持完整的数据编辑和导出功能

这使得组件更加灵活和通用，能够适应各种数据可视化场景的需求。
