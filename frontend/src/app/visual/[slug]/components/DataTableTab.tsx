"use client";

import {
  Box,
  Typography,
  Stack,
  Button,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Image as ImageIcon } from "@mui/icons-material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import EnhancedTable from "@/components/common/EnhancedTable";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { getSampleData } from "@/libs/api/visual";
import { useChartStore } from "@/stores/chartStore";

interface DataTableTabProps {
  tableData: any[] | Record<string, any[]>;
  slug: string;
  chartType?: "js" | "py" | "r";
  onVariableChange?: (variables: {
    xAxis: string;
    yAxis: string;
    groupBy: string;
  }) => void;
  onDataChange?: (rows: any[] | Record<string, any[]>) => void;
  onDrawClick?: () => void;
  isDrawing?: boolean;
}

export default function DataTableTab({
  tableData,
  slug,
  chartType,
  onVariableChange,
  onDataChange,
  onDrawClick,
  isDrawing = false,
}: DataTableTabProps) {
  // 使用 chartStore 来追踪数据更新
  const { setDataUpdated } = useChartStore();

  // 本地文件输入引用（用于多表格模式和单表格模式）
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // 绑定在组件内的表格数据，默认空
  const [rows, setRows] = useState<any[]>([]);

  // 多表格模式的数据状态：{ tableName: data[] }
  const [multiTableData, setMultiTableData] = useState<Record<string, any[]>>(
    {}
  );

  // 追踪数据是否已初始化（用于判断是否是用户主动更新）
  const [hasDataInitialized, setHasDataInitialized] = useState(false);

  // 判断是否使用树形视图
  const isTreeData =
    slug.toLowerCase().startsWith("tree") ||
    slug.toLowerCase().startsWith("sunburst");

  // 判断数据是否为多表格格式（对象类型，且所有值都是数组）
  const isMultiTableFormat = useCallback((data: any): boolean => {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return false;
    }
    // 检查所有值是否都是数组
    const values = Object.values(data);
    return values.length > 0 && values.every((v) => Array.isArray(v));
  }, []);

  // 判断当前数据模式
  const dataMode = useMemo(() => {
    if (Object.keys(multiTableData).length > 0) {
      return "multi";
    }
    return "single";
  }, [multiTableData]);

  const setRowsAndNotify = (next: any[]) => {
    // 确保数据是可变的，避免只读属性错误
    const mutableData = next.map((row) => JSON.parse(JSON.stringify(row)));
    setRows(mutableData);
    onDataChange?.(mutableData);
    // 如果数据已经初始化过，标记为更新
    if (hasDataInitialized) {
      setDataUpdated(true);
    } else {
      setHasDataInitialized(true);
    }
  };

  // 多表格模式下的数据更新
  const updateMultiTableData = useCallback(
    (tableName: string, newData: any[]) => {
      const mutableData = newData.map((row) => JSON.parse(JSON.stringify(row)));
      const updated = {
        ...multiTableData,
        [tableName]: mutableData,
      };
      setMultiTableData(updated);
      // 将所有表格数据合并为一个对象传递给父组件
      const combinedData = Object.keys(updated).reduce((acc, key) => {
        acc[key] = updated[key];
        return acc;
      }, {} as Record<string, any[]>);
      // 直接传递数据对象，不包装成数组
      onDataChange?.(combinedData);
      // 如果数据已经初始化过，标记为更新
      if (hasDataInitialized) {
        setDataUpdated(true);
      } else {
        setHasDataInitialized(true);
      }
    },
    [multiTableData, onDataChange, setDataUpdated, hasDataInitialized]
  );

  // 数据标题（文件名或示例数据标识）
  const [dataTitle, setDataTitle] = useState<string | undefined>(undefined);
  const [multiTableTitles, setMultiTableTitles] = useState<
    Record<string, string | undefined>
  >({});

  // 当父级提供了表格数据时，同步为本地状态
  useEffect(() => {
    // 处理对象格式的数据（如 {nodes: [], links: []}）
    if (
      !Array.isArray(tableData) &&
      tableData &&
      typeof tableData === "object"
    ) {
      if (isMultiTableFormat(tableData)) {
        const tables: Record<string, any[]> = {};
        Object.keys(tableData).forEach((key) => {
          tables[key] = Array.isArray(tableData[key]) ? tableData[key] : [];
        });
        setMultiTableData(tables);
        setRows([]);
      } else {
        // 其他对象格式，尝试作为单表格处理
        setRows([]);
        setMultiTableData({});
      }
      return;
    }

    if (Array.isArray(tableData) && tableData.length > 0) {
      // 检查 tableData 的结构：
      // 1. 如果第一个元素是数组，说明是包装格式 [[{...}, {...}]]
      // 2. 如果第一个元素是对象，说明可能是包装格式 [{...}] 或 [{a: [], b: []}]
      // 3. 如果 tableData 本身的所有元素都是对象（且不是数组），说明是直接的数据数组 [{...}, {...}]
      const firstItem = tableData[0];

      // 情况1: tableData 的第一个元素是数组，说明是包装格式 [[{...}, {...}]]
      if (Array.isArray(firstItem)) {
        const mutableData = firstItem.map((row) =>
          JSON.parse(JSON.stringify(row))
        );
        setRows(mutableData);
        setMultiTableData({});
      }
      // 情况2: tableData 的第一个元素是对象，且是多表格格式 {a: [], b: []} 或 {nodes: [], links: []}
      else if (
        firstItem &&
        typeof firstItem === "object" &&
        !Array.isArray(firstItem) &&
        isMultiTableFormat(firstItem)
      ) {
        const tables: Record<string, any[]> = {};
        Object.keys(firstItem).forEach((key) => {
          tables[key] = Array.isArray(firstItem[key]) ? firstItem[key] : [];
        });
        setMultiTableData(tables);
        setRows([]);
      }
      // 情况4: tableData 本身是数据数组 [{...}, {...}]，第一个元素是普通对象
      else if (
        firstItem &&
        typeof firstItem === "object" &&
        !Array.isArray(firstItem) &&
        // 检查 tableData 的所有元素是否都是对象（不是数组）
        tableData.every(
          (item) => typeof item === "object" && !Array.isArray(item)
        )
      ) {
        // 直接使用 tableData 作为数据数组
        const mutableData = tableData.map((row) =>
          JSON.parse(JSON.stringify(row))
        );
        setRows(mutableData);
        setMultiTableData({});
      }
      // 情况4: 其他情况，尝试作为单表格处理
      else if (
        firstItem &&
        typeof firstItem === "object" &&
        firstItem !== null
      ) {
        setRows([firstItem]);
        setMultiTableData({});
      }
    } else if (Array.isArray(tableData) && tableData.length === 0) {
      // 清空所有数据
      setRows([]);
      setMultiTableData({});
    }
  }, [tableData, isMultiTableFormat]);

  // 默认加载示例数据（仅在初始加载时，不包括用户主动清空的情况）
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (hasInitialized) return; // 已经初始化过，不再自动加载

      // 检查父组件是否已经有数据（支持数组和对象两种格式）
      const hasTableData = Array.isArray(tableData)
        ? tableData.length > 0
        : tableData &&
          typeof tableData === "object" &&
          Object.keys(tableData).length > 0;
      if (hasTableData) return; // 如果父组件已经有数据，不再自动加载示例数据

      if (rows.length > 0) return; // 如果本地已经有数据，不再自动加载
      if (Object.keys(multiTableData).length > 0) return; // 如果多表格已经有数据，不再自动加载

      try {
        const resp = await getSampleData(slug);
        if (!cancelled && resp?.success) {
          const dataType =
            resp.data_type || (Array.isArray(resp.data) ? "list" : "dict");

          if (dataType === "list") {
            // 列表类型：单表格模式
            const dataArray = Array.isArray(resp.data) ? resp.data : [];
            setRowsAndNotify(dataArray);
            setMultiTableData({});
          } else if (dataType === "dict") {
            // 字典类型：多表格模式 { a: [], b: [] } 或 {nodes: [], links: []}
            const dataDict = resp.data as Record<string, any>;
            if (isMultiTableFormat(dataDict)) {
              const tables: Record<string, any[]> = {};
              const titles: Record<string, string | undefined> = {};
              Object.keys(dataDict).forEach((key) => {
                tables[key] = Array.isArray(dataDict[key]) ? dataDict[key] : [];
                titles[key] = undefined;
              });
              setMultiTableData(tables);
              setMultiTableTitles(titles);
              setRows([]);
              // 通知父组件数据已更新，触发图表绘制
              onDataChange?.(dataDict);
              setHasDataInitialized(true);
              setHasInitialized(true);
            } else {
              // 其他情况，尝试作为单表格处理
              setRowsAndNotify([]);
            }
          } else {
            // 未知类型，尝试作为单表格处理
            setRowsAndNotify([]);
          }
          setDataTitle("示例数据");
          setHasInitialized(true); // 标记已初始化
        }
      } catch (e) {
        // 忽略加载失败
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    // 使用序列化的方式检查 tableData 是否变化，支持数组和对象两种格式
    Array.isArray(tableData) ? tableData.length : JSON.stringify(tableData),
    rows.length,
    hasInitialized,
    multiTableData,
    isMultiTableFormat,
  ]);

  // 获取表格列名
  const columns = useMemo(() => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0]);
  }, [rows]);

  // 变量选择状态
  const [selectedVariables, setSelectedVariables] = useState({
    xAxis: columns[0] || "",
    yAxis: columns[1] || "",
    groupBy: "",
  });

  // 将 JSON 数据转换为树形结构
  const treeData = useMemo(() => {
    if (!isTreeData || rows.length === 0) return rows;
    // 如果 rows 是单个对象（包含 children），直接返回
    if (
      rows.length === 1 &&
      !Array.isArray(rows[0].children) &&
      rows[0].children
    ) {
      return rows;
    }
    return rows;
  }, [rows, isTreeData]);

  // 递归计算子结构的数量
  const countChildren = (item: any): number => {
    if (!Array.isArray(item.children) || item.children.length === 0) {
      return 0;
    }
    let count = item.children.length;
    item.children.forEach((child: any) => {
      count += countChildren(child);
    });
    return count;
  };

  // 渲染树形节点
  const renderTreeItem = (item: any, index: number): any => {
    const nodeId = item.id || item.name || `node-${index}`;
    const label = item.name || item.label || JSON.stringify(item);
    const hasChildren =
      Array.isArray(item.children) && item.children.length > 0;
    const childrenCount = hasChildren ? countChildren(item) : 0;

    if (hasChildren) {
      return (
        <TreeItem
          key={nodeId}
          itemId={nodeId}
          label={
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Typography variant="body2">{label}</Typography>
              <Chip
                label={`${childrenCount}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ ml: 2 }}
              />
            </Box>
          }
        >
          {item.children.map((child: any, idx: number) =>
            renderTreeItem(child, idx)
          )}
        </TreeItem>
      );
    }

    // 显示额外的属性
    const extraInfo = Object.keys(item)
      .filter((key) => !["children", "id", "name", "label"].includes(key))
      .map((key) => `${key}: ${item[key]}`)
      .join(", ");

    return (
      <TreeItem
        key={nodeId}
        itemId={nodeId}
        label={
          <Box>
            <Typography variant="body2">{label}</Typography>
            {extraInfo && (
              <Typography variant="caption" color="text.secondary">
                {extraInfo}
              </Typography>
            )}
          </Box>
        }
      />
    );
  };

  // 处理文件上传（多表格模式）
  const handleFileUpload = useCallback(
    async (file: File, tableName: string) => {
      const text = await file.text();
      try {
        if (file.name.toLowerCase().endsWith(".json")) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            updateMultiTableData(tableName, parsed);
          } else {
            // 如果不是数组，尝试提取数组字段
            updateMultiTableData(tableName, []);
          }
          setMultiTableTitles((prev) => ({
            ...prev,
            [tableName]: file.name,
          }));
        } else {
          // CSV 解析
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length === 0) {
            updateMultiTableData(tableName, []);
          } else {
            const header = lines[0].split(",").map((h) => h.trim());
            const data = lines.slice(1).map((line) => {
              const cells = line.split(",");
              const row: Record<string, any> = {};
              header.forEach((key, idx) => {
                row[key] = (cells[idx] ?? "").trim();
              });
              return row;
            });
            updateMultiTableData(tableName, data);
          }
          setMultiTableTitles((prev) => ({
            ...prev,
            [tableName]: file.name,
          }));
        }
      } catch (err) {
        console.error(`文件解析失败 (${tableName}):`, err);
      }
    },
    [updateMultiTableData]
  );

  // 检查是否有数据（用于禁用绘制按钮）
  const hasData = useMemo(() => {
    if (dataMode === "multi") {
      return Object.values(multiTableData).some(
        (data) => Array.isArray(data) && data.length > 0
      );
    }
    return rows.length > 0;
  }, [dataMode, multiTableData, rows]);

  return (
    <Box sx={{ maxHeight: "100%", overflow: "flex-start" }}>
      <Box sx={{ mb: 2 }}>
        {/* 数据操作按钮 */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 2 }}
          justifyContent="center"
          alignItems="center"
        >
          <Button
            variant="contained"
            size="small"
            onClick={async () => {
              try {
                if (!slug) return;
                const resp = await getSampleData(slug);
                if (resp?.success) {
                  const dataType =
                    resp.data_type ||
                    (Array.isArray(resp.data) ? "list" : "dict");

                  if (dataType === "list") {
                    // 列表类型：单表格模式
                    const dataArray = Array.isArray(resp.data) ? resp.data : [];
                    setRowsAndNotify(dataArray);
                    setMultiTableData({});
                  } else if (dataType === "dict") {
                    // 字典类型：多表格模式 { a: [], b: [] } 或 {nodes: [], links: []}
                    const dataDict = resp.data as Record<string, any>;
                    if (isMultiTableFormat(dataDict)) {
                      const tables: Record<string, any[]> = {};
                      const titles: Record<string, string | undefined> = {};
                      Object.keys(dataDict).forEach((key) => {
                        tables[key] = Array.isArray(dataDict[key])
                          ? dataDict[key]
                          : [];
                        titles[key] = undefined;
                      });
                      setMultiTableData(tables);
                      setMultiTableTitles(titles);
                      setRows([]);
                      // 通知父组件数据已更新，触发图表绘制
                      onDataChange?.(dataDict);
                      setHasDataInitialized(true);
                      setHasInitialized(true);
                    } else {
                      setRowsAndNotify([]);
                    }
                  } else {
                    setRowsAndNotify([]);
                  }
                  setDataTitle("示例数据");
                  setHasInitialized(true);
                }
              } catch (e) {
                console.error("加载示例数据失败", e);
              }
            }}
          >
            示例数据
          </Button>

          {dataMode === "multi" ? (
            // 多表格模式：每个表格都有独立的上传按钮（在表格内部）
            <></>
          ) : (
            // 单表格模式：统一的上传按钮
            <>
              <input
                ref={(el) => {
                  if (el) {
                    fileInputRefs.current.set("single", el);
                  }
                }}
                type="file"
                accept=".csv,.json,application/json,text/csv"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const text = await file.text();
                  try {
                    if (file.name.toLowerCase().endsWith(".json")) {
                      const parsed = JSON.parse(text);
                      const dataType = Array.isArray(parsed) ? "list" : "dict";

                      if (dataType === "list") {
                        // 列表类型：单表格模式
                        setRowsAndNotify(parsed);
                        setMultiTableData({});
                      } else if (
                        parsed &&
                        typeof parsed === "object" &&
                        !Array.isArray(parsed) &&
                        isMultiTableFormat(parsed)
                      ) {
                        // 多表格模式：{ a: [], b: [] } 或 {nodes: [], links: []}
                        const tables: Record<string, any[]> = {};
                        const titles: Record<string, string | undefined> = {};
                        Object.keys(parsed).forEach((key) => {
                          tables[key] = Array.isArray(parsed[key])
                            ? parsed[key]
                            : [];
                          titles[key] = file.name;
                        });
                        setMultiTableData(tables);
                        setMultiTableTitles(titles);
                        setRows([]);
                      } else {
                        // 其他情况，尝试作为单表格处理
                        setRowsAndNotify([]);
                      }
                      setDataTitle(file.name);
                      setHasInitialized(true);
                    } else {
                      // 简单 CSV 解析：逗号分隔，首行表头
                      const lines = text
                        .split(/\r?\n/)
                        .filter((l) => l.trim().length > 0);
                      if (lines.length === 0) {
                        setRowsAndNotify([]);
                        setHasInitialized(true);
                      } else {
                        const header = lines[0].split(",").map((h) => h.trim());
                        const data = lines.slice(1).map((line) => {
                          const cells = line.split(",");
                          const row: Record<string, any> = {};
                          header.forEach((key, idx) => {
                            row[key] = (cells[idx] ?? "").trim();
                          });
                          return row;
                        });
                        setRowsAndNotify(data);
                        setDataTitle(file.name);
                        setHasInitialized(true);
                      }
                    }
                  } catch (err) {
                    console.error("文件解析失败", err);
                  } finally {
                    // 允许重复选择同一文件
                    const input = fileInputRefs.current.get("single");
                    if (input) input.value = "";
                  }
                }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const input = fileInputRefs.current.get("single");
                  input?.click();
                }}
              >
                上传数据
              </Button>
            </>
          )}

          <Button
            variant="text"
            size="small"
            color="error"
            onClick={() => {
              if (dataMode === "multi") {
                setMultiTableData({});
                setMultiTableTitles({});
                onDataChange?.([]);
              } else {
                setRowsAndNotify([]);
              }
              setDataTitle(undefined);
            }}
          >
            清空数据
          </Button>
        </Stack>

        {/* 数据表格 */}
        {isTreeData ? (
          <Paper
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              p: 2,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">数据预览</Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={`${treeData.length} 个节点`}
                  size="small"
                  color="primary"
                />
                {dataTitle && (
                  <Chip label={dataTitle} size="small" variant="outlined" />
                )}
              </Stack>
            </Stack>
            <Box sx={{ height: 450, overflow: "auto" }}>
              <SimpleTreeView>
                {treeData.map((item, index) => renderTreeItem(item, index))}
              </SimpleTreeView>
            </Box>
          </Paper>
        ) : dataMode === "multi" ? (
          // 多表格模式：展示多个表格
          <Stack
            spacing={3}
            sx={{
              overscrollBehavior: "contain", // 防止滚动链传递到父容器
              // 如果是 R 或 Python 模式，取消底部间距（因为绘制按钮已有间距）
              pb: chartType === "r" || chartType === "py" ? 0 : 3,
            }}
          >
            {Object.keys(multiTableData).map((tableName) => {
              const tableData = multiTableData[tableName] || [];
              const tableTitle = multiTableTitles[tableName];

              return (
                <Box key={tableName}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 1 }}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6">{tableName}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {tableTitle && (
                        <Chip
                          label={tableTitle}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      <input
                        ref={(el) => {
                          if (el) {
                            fileInputRefs.current.set(tableName, el);
                            // 设置 onChange 处理器
                            el.onchange = async (e) => {
                              const target = e.target as HTMLInputElement;
                              const file = target.files?.[0];
                              if (file) {
                                await handleFileUpload(file, tableName);
                                target.value = ""; // 允许重复选择同一文件
                              }
                            };
                          }
                        }}
                        type="file"
                        accept=".csv,.json,application/json,text/csv"
                        style={{ display: "none" }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          const input = fileInputRefs.current.get(tableName);
                          input?.click();
                        }}
                      >
                        上传数据
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        color="error"
                        onClick={() => {
                          updateMultiTableData(tableName, []);
                          setMultiTableTitles((prev) => {
                            const next = { ...prev };
                            delete next[tableName];
                            return next;
                          });
                        }}
                      >
                        清空
                      </Button>
                    </Stack>
                  </Stack>
                  <EnhancedTable
                    data={tableData}
                    title={tableName}
                    onDataChange={(newData) =>
                      updateMultiTableData(tableName, newData)
                    }
                    dataTitle={tableTitle}
                    height={350}
                  />
                </Box>
              );
            })}
          </Stack>
        ) : (
          <EnhancedTable
            data={rows}
            title="数据预览"
            onDataChange={setRowsAndNotify}
            dataTitle={dataTitle}
          />
        )}

        {/* 绘制图片按钮（仅当 chartType 为 r 或 py 时显示） */}
        {(chartType === "r" || chartType === "py") && (
          <Box
            sx={{
              mt: 2,
              py: 2,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={
                isDrawing ? <CircularProgress size={20} /> : <ImageIcon />
              }
              onClick={onDrawClick}
              disabled={isDrawing || !hasData}
              sx={{ minWidth: 200 }}
            >
              {isDrawing ? "绘制中..." : "绘制图片"}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
