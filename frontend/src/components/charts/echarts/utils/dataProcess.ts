/**
 * 将长格式数据转换为宽格式（数据透视）
 * @param data 原始数据
 * @param rowKey 作为行标识的字段
 * @param valueKey 作为值的字段
 * @param columnKey 作为列名的字段
 */
export function pivotData(
  data: any[],
  rowKey: string,
  valueKey: string,
  columnKey: string
): any[][] {
  if (!data || data.length === 0) return [];

  // 获取所有唯一的行值和列值
  const rowValues = [...new Set(data.map((item) => item[rowKey]))];
  const columnValues = [...new Set(data.map((item) => item[columnKey]))];

  const result: any[][] = [];

  // 创建表头
  const header = [rowKey, ...columnValues];
  result.push(header);

  // 创建查找映射，提高性能
  const valueMap = new Map();
  data.forEach((item) => {
    const key = `${item[rowKey]}_${item[columnKey]}`;
    valueMap.set(key, item[valueKey]);
  });

  // 填充数据
  rowValues.forEach((rowValue) => {
    const row: any[] = [rowValue];

    columnValues.forEach((columnValue) => {
      const key = `${rowValue}_${columnValue}`;
      const value = valueMap.get(key);
      row.push(value !== undefined ? value : 0);
    });

    result.push(row);
  });

  return result;
}

/**
 * 将任意对象数组转换为二维数组
 * @param data - 输入的对象数组
 * @param keys - 要提取的键名数组（按顺序）
 * @returns 二维数组，每一行对应 keys 的顺序
 */
export function json2Array<T extends Record<string, any>>(
  data: T[],
  keys: (keyof T)[]
): any[][] {
  return data.map((item) => keys.map((key) => item[key]));
}

/**
 * 计算数据深度
 * @param data - 输入的数据
 * @param depth - 初始深度，默认为1
 * @returns 数据深度
 */
export function calculateDataDepth(data: any, depth = 1): number {
  if (!data || !Array.isArray(data)) return depth;

  let maxDepth = depth;
  for (const item of data) {
    if (
      item &&
      item.children &&
      Array.isArray(item.children) &&
      item.children.length > 0
    ) {
      const childDepth = calculateDataDepth(item.children, depth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
  }
  return maxDepth;
}

/**
 * 根据桑基图 links 计算每个节点的层级（depth）以及最大层数
 * @param links - 形如 { source, target } 的边数组，source/target 可为任意可序列化为字符串的值
 * @returns { nodeDepth: Record<string, number>, maxDepth: number, levelsCount: number }
 */
export function calculateSankeyDepths(
  links: Array<{ source: any; target: any }>
): {
  nodeDepth: Record<string, number>;
  maxDepth: number;
  levelsCount: number;
} {
  if (!Array.isArray(links) || links.length === 0) {
    return { nodeDepth: {}, maxDepth: 0, levelsCount: 1 };
  }

  const nodeDepthMap = new Map<string, number>();
  const allNodes = new Set<string>();
  const targets = new Set<string>();

  links.forEach((l) => {
    const s = String(l.source);
    const t = String(l.target);
    allNodes.add(s);
    allNodes.add(t);
    targets.add(t);
  });

  const sourceNodes = Array.from(allNodes).filter((n) => !targets.has(n));
  Array.from(allNodes).forEach((n) => nodeDepthMap.set(n, 0));
  sourceNodes.forEach((n) => nodeDepthMap.set(n, 0));

  let maxDepth = 0;
  const forward = (node: string) => {
    const currentDepth = nodeDepthMap.get(node) || 0;
    maxDepth = Math.max(maxDepth, currentDepth);
    for (const l of links) {
      if (String(l.source) === node) {
        const t = String(l.target);
        const nextDepth = currentDepth + 1;
        if ((nodeDepthMap.get(t) || 0) < nextDepth) {
          nodeDepthMap.set(t, nextDepth);
          maxDepth = Math.max(maxDepth, nextDepth);
        }
        forward(t);
      }
    }
  };
  sourceNodes.forEach((n) => forward(n));

  const nodeDepth: Record<string, number> = {};
  nodeDepthMap.forEach((v, k) => (nodeDepth[k] = v));

  return { nodeDepth, maxDepth, levelsCount: Math.max(1, maxDepth + 1) };
}
