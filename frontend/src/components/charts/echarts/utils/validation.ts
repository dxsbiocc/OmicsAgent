import { EChartsOption } from "echarts";
import { SymbolOption, ItemStyleOption, LineStyleOption } from "../types";

// 过滤对象中的 undefined 参数
export function filterUndefined<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  const filtered: Partial<T> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
      filtered[key] = obj[key];
    }
  }

  return filtered;
}

// 深度过滤对象中的 undefined 参数（递归处理嵌套对象）
export function deepFilterUndefined<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  const filtered: Partial<T> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
      const value = obj[key];

      if (Array.isArray(value)) {
        // 处理数组：过滤掉 undefined 元素
        const filteredArray = value.filter((item: any) => item !== undefined);
        if (filteredArray.length > 0) {
          filtered[key] = filteredArray as T[Extract<keyof T, string>];
        }
      } else if (value && typeof value === "object") {
        // 处理嵌套对象：递归过滤
        const filteredObject = deepFilterUndefined(value);
        if (Object.keys(filteredObject).length > 0) {
          filtered[key] = filteredObject as T[Extract<keyof T, string>];
        }
      } else {
        // 处理基本类型：直接赋值
        filtered[key] = value;
      }
    }
  }

  return filtered;
}

// 过滤对象中的空值（undefined, null, 空字符串, 空数组, 空对象）
export function filterEmptyValues<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  const filtered: Partial<T> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      // 检查是否为空值
      if (value === undefined || value === null || value === "") {
        continue;
      }

      if (Array.isArray(value)) {
        // 过滤空数组
        if (value.length > 0) {
          filtered[key] = value as T[Extract<keyof T, string>];
        }
      } else if (value && typeof value === "object") {
        // 过滤空对象
        if (Object.keys(value).length > 0) {
          filtered[key] = value as T[Extract<keyof T, string>];
        }
      } else {
        // 基本类型直接赋值
        filtered[key] = value;
      }
    }
  }

  return filtered;
}

// 定义 MarkPoint 数据项的类型
export interface MarkDataItem extends SymbolOption {
  name: string;
  type?: string;
  valueIndex?: number;
  coord?: number[];
  x?: number | string;
  y?: number | string;
  xAxis?: number | string;
  yAxis?: number | string;
  z2?: number;
  itemStyle?: ItemStyleOption;
  lineStyle?: LineStyleOption;
  label?: {
    show?: boolean;
    [key: string]: any;
  };
}

// 数据校验函数
export function validateDataItem(
  item: any,
  showErrorCallback?: (message: string) => void
): MarkDataItem | null {
  if (!item || typeof item !== "object") {
    const message = "数据项必须是有效的对象";
    if (showErrorCallback) {
      showErrorCallback(message);
    } else {
      alert(message);
    }
    return null;
  }

  // 校验坐标数据（如果存在）
  if (
    item.coord !== undefined &&
    item.coord !== null &&
    !Array.isArray(item.coord)
  ) {
    alert("坐标数据 (coord) 必须是数组格式");
    return null;
  }

  if (
    item.coord !== undefined &&
    item.coord !== null &&
    Array.isArray(item.coord) &&
    item.coord.length !== 2
  ) {
    alert("坐标数据 (coord) 必须是长度为2的数组");
    return null;
  }

  // 校验 coord 数组中的每个元素
  if (
    item.coord !== undefined &&
    item.coord !== null &&
    Array.isArray(item.coord) &&
    item.coord.length === 2
  ) {
    for (let i = 0; i < item.coord.length; i++) {
      const coordValue = item.coord[i];
      if (
        coordValue === undefined ||
        coordValue === null ||
        coordValue === ""
      ) {
        alert(`坐标数据 (coord) 的第${i + 1}个值不能为空`);
        return null;
      }
      if (typeof coordValue !== "number" && typeof coordValue !== "string") {
        alert(`坐标数据 (coord) 的第${i + 1}个值必须是数字或字符串`);
        return null;
      }
    }
  }

  // 校验 valueIndex（如果存在）
  if (
    item.valueIndex !== undefined &&
    (typeof item.valueIndex !== "number" ||
      item.valueIndex < 0 ||
      item.valueIndex > 1)
  ) {
    alert("坐标索引 (valueIndex) 必须是 0 或 1");
    return null;
  }

  // 校验 symbolSize（如果存在）
  if (
    item.symbolSize !== undefined &&
    (typeof item.symbolSize !== "number" || item.symbolSize < 0)
  ) {
    alert("符号大小 (symbolSize) 必须是非负数");
    return null;
  }

  // 校验 z2（如果存在）
  if (item.z2 !== undefined && typeof item.z2 !== "number") {
    alert("Z2 层级 (z2) 必须是数字");
    return null;
  }

  // 校验 name（如果存在）
  if (item.name !== undefined && typeof item.name !== "string") {
    alert("名称 (name) 必须是字符串");
    return null;
  }

  // 校验 type（如果存在）
  if (
    item.type !== undefined &&
    !["min", "max", "average", "median"].includes(item.type)
  ) {
    alert("统计类型 (type) 必须是 min、max、average 或 median 之一");
    return null;
  }

  return item as MarkDataItem;
}

// 验证 MarkDataItem[] 数组的函数
export function validateMarkDataArray(
  parsed: any,
  type: "point" | "line" | "area",
  showError: (message: string) => void
): boolean {
  if (type === "point") {
    // Point 类型：验证 MarkDataItem[] 数组
    if (!Array.isArray(parsed)) {
      showError("标记点 (point) 类型必须是 MarkDataItem[] 数组格式");
      return false;
    }

    if (parsed.length === 0) {
      return true;
    }

    // 验证数组中的每个 MarkDataItem
    const validatedItems: MarkDataItem[] = [];
    const validationErrors: string[] = [];

    for (let i = 0; i < parsed.length; i++) {
      const validatedItem = validateDataItem(parsed[i], showError);
      if (!validatedItem) {
        validationErrors.push(`第${i + 1}个数据项验证失败`);
      } else {
        validatedItems.push(validatedItem);
      }
    }

    if (validationErrors.length > 0) {
      showError(`数据验证失败：\n${validationErrors.join("\n")}`);
      return false;
    }

    return true;
  } else if (type === "area") {
    // Area 类型：确保数据格式正确
    if (!Array.isArray(parsed)) {
      showError("标记区域 (area) 类型必须为数组格式");
      return false;
    }

    if (parsed.length === 0) {
      return true;
    }

    const validationErrors: string[] = [];

    for (let i = 0; i < parsed.length; i++) {
      const areaGroup = parsed[i];

      // 检查每个区域组是否是数组
      if (!Array.isArray(areaGroup)) {
        validationErrors.push(`第${i + 1}个区域组必须是数组格式`);
        continue;
      }

      // 检查每个区域组是否包含两个 MarkDataItem
      if (areaGroup.length !== 2) {
        validationErrors.push(`第${i + 1}个区域组必须包含两个数据项`);
        continue;
      }

      // 验证区域组中的每个 MarkDataItem
      for (let j = 0; j < areaGroup.length; j++) {
        const validatedItem = validateDataItem(areaGroup[j], showError);
        if (!validatedItem) {
          validationErrors.push(
            `第${i + 1}个区域组的第${j + 1}个数据项验证失败`
          );
        }
      }
    }

    if (validationErrors.length > 0) {
      showError(`数据验证失败：\n${validationErrors.join("\n")}`);
      return false;
    }

    return true;
  } else {
    // Line 类型：验证 [MarkDataItem, MarkDataItem[], MarkDataItem] 混合格式
    if (!Array.isArray(parsed)) {
      showError("标记线 (line) 类型必须是数组格式");
      return false;
    }

    if (parsed.length === 0) {
      return true;
    }

    const validatedItems: MarkDataItem[] = [];
    const validationErrors: string[] = [];

    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];

      if (Array.isArray(item)) {
        // 处理 MarkDataItem[] 数组
        if (item.length === 0) {
          validationErrors.push(`第${i + 1}个数据项是空数组`);
          continue;
        }

        for (let j = 0; j < item.length; j++) {
          const validatedItem = validateDataItem(item[j], showError);
          if (!validatedItem) {
            validationErrors.push(
              `第${i + 1}个数据项的第${j + 1}个元素验证失败`
            );
          } else {
            validatedItems.push(validatedItem);
          }
        }
      } else {
        // 处理单个 MarkDataItem
        const validatedItem = validateDataItem(item, showError);
        if (!validatedItem) {
          validationErrors.push(`第${i + 1}个数据项验证失败`);
        } else {
          validatedItems.push(validatedItem);
        }
      }
    }

    if (validationErrors.length > 0) {
      showError(`数据验证失败：\n${validationErrors.join("\n")}`);
      return false;
    }

    return true;
  }
}

export function echartsError(message: string): EChartsOption {
  return {
    title: {
      show: false,
    },
    xAxis: { show: false },
    yAxis: { show: false },
    series: [],
    graphic: {
      type: "text",
      left: "center",
      top: "middle",
      style: {
        text: `⚠️ ECharts 错误\n${message}`,
        align: "center",
        fill: "#d9534f",
        fontSize: 16,
        fontWeight: "bold",
      },
    },
  };
}
