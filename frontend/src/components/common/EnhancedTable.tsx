"use client";

import { useMemo, useRef, useCallback, useEffect } from "react";
import { Box, Paper, Typography, Stack, Chip, useTheme } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { useThemeContext } from "@/contexts/ThemeContext";
import {
  ModuleRegistry,
  AllCommunityModule,
  type ColDef,
  type GridReadyEvent,
  type CellValueChangedEvent,
  type FirstDataRenderedEvent,
  type GridApi,
} from "ag-grid-community";
// Register all community features to avoid error #272
ModuleRegistry.registerModules([AllCommunityModule]);
// 样式在全局 layout 中引入

interface TableRow {
  [key: string]: any;
}

interface EnhancedTableProps {
  data?: TableRow[];
  title?: string;
  height?: number | string;
  maxDisplayRows?: number;
  onDataChange?: (rows: TableRow[]) => void;
  dataTitle?: string;
}

export default function EnhancedTable({
  data = [],
  title = "数据表格",
  height = 450,
  maxDisplayRows = 1000,
  onDataChange,
  dataTitle,
}: EnhancedTableProps) {
  const { mode } = useThemeContext();
  const theme = useTheme();
  const displayData = useMemo(() => {
    // 确保数据是可变的，避免只读属性错误
    return data.slice(0, maxDisplayRows).map((row) => {
      // 深度克隆数据，确保所有属性都是可写的
      return JSON.parse(JSON.stringify(row));
    });
  }, [data, maxDisplayRows]);

  const gridRef = useRef<AgGridReact<TableRow>>(null);
  const gridApiRef = useRef<GridApi | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 检测是否为科学计数法数值（字符串或数字）
  const isScientificNotation = (value: any): boolean => {
    if (typeof value === "string") {
      // 检查字符串格式的科学计数法，如 "1.23e-5", "1.23E-5", "1.23e+5" 等
      return /^[-+]?[0-9]*\.?[0-9]+[eE][-+]?[0-9]+$/.test(value.trim());
    }
    if (typeof value === "number") {
      // 检查数字是否需要用科学计数法表示（绝对值很小或很大的数）
      return (
        (Math.abs(value) < 1e-3 && value !== 0) ||
        Math.abs(value) >= 1e10 ||
        (Math.abs(value) < 1 && value.toString().includes("e"))
      );
    }
    return false;
  };

  // 格式化科学计数法数值
  const formatScientificNotation = (value: any): string => {
    // 明确检查 null、undefined 和空字符串
    if (value === null || value === undefined || value === "") {
      return "";
    }

    // 对于数字 0，直接返回 "0"
    if (value === 0 || value === "0") {
      return "0";
    }

    // 尝试转换为数字
    let numValue: number;
    if (typeof value === "number") {
      numValue = value;
    } else if (typeof value === "string") {
      // 处理字符串格式的科学计数法，如 "1.7079e-08"
      const trimmed = value.trim();
      // 检查是否是科学计数法字符串
      if (/^[-+]?[0-9]*\.?[0-9]+[eE][-+]?[0-9]+$/.test(trimmed)) {
        numValue = parseFloat(trimmed);
      } else {
        // 尝试普通解析
        numValue = parseFloat(trimmed);
      }
    } else {
      // 其他类型，尝试转换
      numValue = Number(value);
    }

    // 如果无法转换为有效数字，返回原始值的字符串形式
    if (isNaN(numValue)) {
      return String(value);
    }

    // 如果原值是科学计数法格式（字符串或数字），使用科学计数法显示
    if (
      isScientificNotation(value) ||
      (Math.abs(numValue) < 1e-3 && numValue !== 0)
    ) {
      return numValue.toExponential();
    }

    // 对于普通数值，转换为字符串（保留适当精度）
    return String(numValue);
  };

  // 检测列是否为数值列（包含科学计数法）
  const isNumericColumn = (key: string): boolean => {
    if (displayData.length === 0) return false;
    // 检查前几行数据来判断列类型
    const sampleSize = Math.min(10, displayData.length);
    for (let i = 0; i < sampleSize; i++) {
      const value = displayData[i][key];
      // 明确检查：null、undefined 和空字符串跳过，但 0 是有效数值
      if (value === null || value === undefined || value === "") {
        continue;
      }
      // 如果是数字类型（包括 0），认为是数值列
      if (typeof value === "number") {
        return true;
      }
      // 如果是科学计数法字符串，认为是数值列
      if (typeof value === "string" && isScientificNotation(value)) {
        return true;
      }
      // 如果看起来像数字字符串，也检查
      if (
        typeof value === "string" &&
        !isNaN(parseFloat(value)) &&
        value.trim() !== ""
      ) {
        return true;
      }
    }
    return false;
  };

  const columnDefs = useMemo<ColDef[]>(() => {
    const keys = displayData.length > 0 ? Object.keys(displayData[0]) : [];
    return keys.map((key) => {
      const isNumeric = isNumericColumn(key);
      return {
        headerName: key,
        field: key,
        sortable: true,
        filter: true,
        resizable: true,
        // 如果是数值列，添加值格式化器
        ...(isNumeric && {
          valueGetter: (params: any) => {
            // 确保返回原始值，让 valueFormatter 处理格式化
            return params.data?.[params.colDef.field];
          },
          valueFormatter: (params: any) => {
            // 明确检查 null、undefined 和空字符串
            if (
              params.value === null ||
              params.value === undefined ||
              params.value === ""
            ) {
              return "";
            }
            // 确保 0 值能正确显示
            const formatted = formatScientificNotation(params.value);
            // 如果格式化后为空字符串，返回原始值（可能是特殊情况）
            return formatted || String(params.value);
          },
          // 确保排序时使用数值比较
          comparator: (valueA: any, valueB: any) => {
            const numA =
              typeof valueA === "string" ? parseFloat(valueA) : valueA;
            const numB =
              typeof valueB === "string" ? parseFloat(valueB) : valueB;
            if (isNaN(numA) && isNaN(numB)) return 0;
            if (isNaN(numA)) return 1;
            if (isNaN(numB)) return -1;
            return numA - numB;
          },
        }),
      };
    });
  }, [displayData]);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      editable: true,
    }),
    []
  );

  const autoSizeAll = useCallback(() => {
    const api = gridApiRef.current;
    if (!api) return;
    if (typeof (api as any).autoSizeAllColumns === "function") {
      (api as any).autoSizeAllColumns(false);
    } else if (typeof (api as any).sizeColumnsToFit === "function") {
      (api as any).sizeColumnsToFit();
    }
  }, []);

  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridApiRef.current = params.api;
      autoSizeAll();
    },
    [autoSizeAll]
  );

  const handleFirstDataRendered = useCallback(
    (_: FirstDataRenderedEvent) => {
      autoSizeAll();
    },
    [autoSizeAll]
  );

  const emitRows = useCallback(() => {
    if (!onDataChange || !gridRef.current) return;
    const api = gridRef.current.api;
    const newRows: TableRow[] = [];
    api.forEachNode((node) => {
      if (node.data) {
        // 深度克隆数据，确保所有属性都是可写的
        newRows.push(JSON.parse(JSON.stringify(node.data)));
      }
    });
    onDataChange(newRows);
  }, [onDataChange]);

  const handleCellValueChanged = useCallback(
    (_: CellValueChangedEvent) => {
      emitRows();
    },
    [emitRows]
  );

  // 防止滚动穿透：当表格滚动到底部或顶部时，阻止滚动事件传递到父容器
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 查找 ag-grid 的实际滚动容器
    const findScrollContainer = (): HTMLElement | null => {
      // ag-grid 的滚动容器通常是 .ag-body-viewport 或 .ag-body-vertical-scroll-viewport
      const agViewport = container.querySelector(
        ".ag-body-viewport, .ag-body-vertical-scroll-viewport"
      ) as HTMLElement;
      return agViewport || container;
    };

    const handleWheel = (e: WheelEvent) => {
      const scrollContainer = findScrollContainer();
      if (!scrollContainer) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

      // 检查是否滚动到底部
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      // 检查是否滚动到顶部
      const isAtTop = scrollTop <= 1;

      // 如果向下滚动且已到底部，或向上滚动且已在顶部，阻止默认行为
      if ((e.deltaY > 0 && isAtBottom) || (e.deltaY < 0 && isAtTop)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 监听 wheel 事件（被动监听，提高性能）
    container.addEventListener("wheel", handleWheel, { passive: false });

    // 也监听 ag-grid 容器的 wheel 事件
    const checkAndAttach = () => {
      const scrollContainer = findScrollContainer();
      if (scrollContainer && scrollContainer !== container) {
        scrollContainer.addEventListener("wheel", handleWheel, {
          passive: false,
        });
      }
    };

    // 延迟检查，等待 ag-grid 渲染完成
    const timeoutId = setTimeout(checkAndAttach, 100);

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener("wheel", handleWheel);
      const scrollContainer = findScrollContainer();
      if (scrollContainer && scrollContainer !== container) {
        scrollContainer.removeEventListener("wheel", handleWheel);
      }
    };
  }, [displayData]);

  useEffect(() => {
    autoSizeAll();
  }, [columnDefs, autoSizeAll]);

  return (
    <Box sx={{ overflow: "auto" }}>
      <Box
        sx={{
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          p: 1,
          position: "relative",
        }}
      >
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Typography variant="body1" fontWeight={600}>
            {title}
          </Typography>
        </Stack>

        {dataTitle && (
          <Typography
            variant="body1"
            align="left"
            color="text.secondary"
            sx={{ position: "absolute", left: 8, bottom: 8 }}
          >
            {dataTitle}
          </Typography>
        )}

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ position: "absolute", right: 8, bottom: 8 }}
        >
          <Chip
            label={`${displayData.length} 行数据`}
            size="small"
            color="primary"
          />
          {data.length > maxDisplayRows && (
            <Chip
              label={`共${data.length}行`}
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
        </Stack>
      </Box>

      <Paper
        sx={{
          height: height,
          width: "100%",
          overflow: "hidden",
          borderRadius: 0,
          bgcolor: "background.paper",
          overscrollBehavior: "contain", // 防止滚动链传递到父容器
        }}
      >
        <Box
          ref={containerRef}
          className={
            mode === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine"
          }
          sx={{
            height: "100%",
            width: "100%",
            overscrollBehavior: "contain", // 防止滚动链传递到父容器
            overflow: "auto", // 确保容器可滚动
          }}
        >
          <AgGridReact
            ref={gridRef}
            rowData={displayData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            theme="legacy"
            stopEditingWhenCellsLoseFocus={true}
            onGridReady={handleGridReady}
            onFirstDataRendered={handleFirstDataRendered}
            onCellValueChanged={handleCellValueChanged}
            pagination={true}
          />
        </Box>
      </Paper>
    </Box>
  );
}
