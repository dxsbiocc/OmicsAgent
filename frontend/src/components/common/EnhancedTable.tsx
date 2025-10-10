"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import { Upload, Download, FileUpload, Add } from "@mui/icons-material";
import Spreadsheet, { createEmptyMatrix } from "react-spreadsheet";
import * as XLSX from "xlsx";

// 表格数据类型
interface TableRow {
  id: number;
  name: string;
  value: number;
  category: string;
  isNew?: boolean;
  [key: string]: any;
}

// Spreadsheet数据类型
type SpreadsheetData = Array<Array<{ value: string | number } | undefined>>;

// 示例数据
const sampleData: TableRow[] = [
  { id: 1, name: "数据点1", value: 10, category: "A" },
  { id: 2, name: "数据点2", value: 20, category: "B" },
  { id: 3, name: "数据点3", value: 15, category: "A" },
  { id: 4, name: "数据点4", value: 25, category: "C" },
  { id: 5, name: "数据点5", value: 30, category: "B" },
];

// 将TableRow数据转换为Spreadsheet格式
const convertToSpreadsheetData = (data: TableRow[]): SpreadsheetData => {
  if (data.length === 0) {
    return [
      [
        { value: "ID" },
        { value: "名称" },
        { value: "数值" },
        { value: "分类" },
      ],
    ];
  }

  // 获取所有可能的列名
  const allKeys = new Set<string>();
  data.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (key !== "isNew") {
        allKeys.add(key);
      }
    });
  });

  // 定义基础列的顺序
  const baseColumns = ["id", "name", "value", "category"];
  const extraColumns = Array.from(allKeys).filter(
    (key) => !baseColumns.includes(key)
  );
  const orderedColumns = [...baseColumns, ...extraColumns];

  // 创建标题行
  const headerRow = orderedColumns.map((key) => {
    const headerMap: { [key: string]: string } = {
      id: "ID",
      name: "名称",
      value: "数值",
      category: "分类",
    };
    return { value: headerMap[key] || key };
  });

  // 创建数据行
  const dataRows = data.map((row) =>
    orderedColumns.map((key) => ({ value: row[key] || "" }))
  );

  return [headerRow, ...dataRows];
};

// 将Spreadsheet数据转换为TableRow格式
const convertFromSpreadsheetData = (data: SpreadsheetData): TableRow[] => {
  if (data.length <= 1) return [];

  const dataRows = data.slice(1); // 跳过标题行
  return dataRows.map((row, index) => {
    const baseRow: TableRow = {
      id: Number(row[0]?.value) || index + 1,
      name: String(row[1]?.value || ""),
      value: Number(row[2]?.value) || 0,
      category: String(row[3]?.value || "A"),
    };

    // 处理额外的列
    if (row.length > 4) {
      for (let i = 4; i < row.length; i++) {
        const header = data[0]?.[i]?.value?.toString() || `列${i + 1}`;
        baseRow[header] = row[i]?.value || "";
      }
    }

    return baseRow;
  });
};

interface EnhancedTableProps {
  data?: TableRow[];
  onDataChange?: (data: TableRow[]) => void;
  title?: string;
  height?: number | string;
}

export default function EnhancedTable({
  data = sampleData,
  onDataChange,
  title = "数据表格",
  height = 400,
}: EnhancedTableProps) {
  const [rows, setRows] = useState<TableRow[]>(data);
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData>(
    convertToSpreadsheetData(data)
  );
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 历史记录状态（用于撤销/重做）
  const [history, setHistory] = useState<SpreadsheetData[]>([
    convertToSpreadsheetData(data),
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [copiedData, setCopiedData] = useState<string>("");

  // 确保组件挂载后才调用回调
  useEffect(() => {
    if (onDataChange) {
      onDataChange(rows);
    }
  }, [rows, onDataChange]);

  // 当外部数据变化时更新内部状态
  useEffect(() => {
    setRows(data);
    setSpreadsheetData(convertToSpreadsheetData(data));
  }, [data]);

  // 保存到历史记录
  const saveToHistory = useCallback(
    (data: SpreadsheetData) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(data);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  // 处理Spreadsheet数据变化
  const handleSpreadsheetChange = useCallback(
    (newData: SpreadsheetData) => {
      setSpreadsheetData(newData);
      const convertedRows = convertFromSpreadsheetData(newData);
      setRows(convertedRows);
      saveToHistory(newData);
    },
    [onDataChange, saveToHistory]
  );

  // 撤销功能
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSpreadsheetData(history[newIndex]);
      const convertedRows = convertFromSpreadsheetData(history[newIndex]);
      setRows(convertedRows);
    }
  }, [history, historyIndex]);

  // 重做功能
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSpreadsheetData(history[newIndex]);
      const convertedRows = convertFromSpreadsheetData(history[newIndex]);
      setRows(convertedRows);
    }
  }, [history, historyIndex]);

  // 复制功能
  const handleCopy = useCallback(() => {
    const selectedData = spreadsheetData
      .map((row) => row.map((cell) => cell?.value || "").join("\t"))
      .join("\n");
    setCopiedData(selectedData);
    navigator.clipboard.writeText(selectedData);
    setAlert({ type: "success", message: "数据已复制到剪贴板" });
  }, [spreadsheetData]);

  // 粘贴功能
  const handlePaste = useCallback(() => {
    if (copiedData) {
      const lines = copiedData.split("\n");
      const newData = lines.map((line) =>
        line.split("\t").map((cell) => ({ value: cell }))
      );

      // 确保新数据有足够的列
      const maxCols = Math.max(...newData.map((row) => row.length));
      const paddedData = newData.map((row) => {
        while (row.length < maxCols) {
          row.push({ value: "" });
        }
        return row;
      });

      setSpreadsheetData(paddedData);
      const convertedRows = convertFromSpreadsheetData(paddedData);
      setRows(convertedRows);
      saveToHistory(paddedData);
      setAlert({ type: "success", message: "数据已粘贴" });
    }
  }, [copiedData, saveToHistory]);

  // 新增列功能
  const handleAddColumn = useCallback(() => {
    const newData = spreadsheetData.map((row, index) => {
      const newRow = [...row];
      if (index === 0) {
        // 标题行
        newRow.push({ value: `列${row.length + 1}` });
      } else {
        // 数据行
        newRow.push({ value: "" });
      }
      return newRow;
    });

    setSpreadsheetData(newData);
    const convertedRows = convertFromSpreadsheetData(newData);
    setRows(convertedRows);
    saveToHistory(newData);
    setAlert({ type: "success", message: "新列已添加" });
  }, [spreadsheetData, saveToHistory]);

  // 新增行功能
  const handleAddRow = useCallback(() => {
    if (spreadsheetData.length === 0) return;

    const columnCount = spreadsheetData[0]?.length || 0;
    const newRow = Array(columnCount)
      .fill(null)
      .map(() => ({ value: "" }));

    const newData = [...spreadsheetData, newRow];

    setSpreadsheetData(newData);
    const convertedRows = convertFromSpreadsheetData(newData);
    setRows(convertedRows);
    saveToHistory(newData);
    setAlert({ type: "success", message: "新行已添加" });
  }, [spreadsheetData, saveToHistory]);

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查是否按下了Ctrl/Cmd键
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      if (isCtrlOrCmd) {
        switch (event.key.toLowerCase()) {
          case "z":
            if (event.shiftKey) {
              // Ctrl+Shift+Z 重做
              event.preventDefault();
              handleRedo();
            } else {
              // Ctrl+Z 撤销
              event.preventDefault();
              handleUndo();
            }
            break;
          case "y":
            // Ctrl+Y 重做
            event.preventDefault();
            handleRedo();
            break;
          case "c":
            // Ctrl+C 复制
            event.preventDefault();
            handleCopy();
            break;
          case "v":
            // Ctrl+V 粘贴
            event.preventDefault();
            handlePaste();
            break;
        }
      }
    };

    // 监听剪贴板变化
    const handleClipboardChange = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          setCopiedData(text);
        }
      } catch (error) {
        // 忽略剪贴板访问错误
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("paste", handleClipboardChange);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("paste", handleClipboardChange);
    };
  }, [handleUndo, handleRedo, handleCopy, handlePaste]);

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          setAlert({ type: "error", message: "文件为空或格式不正确" });
          return;
        }

        // 转换数据格式
        const headers = jsonData[0] as string[];
        const dataRows = jsonData.slice(1) as any[][];

        const newRows: TableRow[] = dataRows.map((row, index) => {
          const newId = Math.max(...rows.map((r) => r.id), 0) + index + 1;
          const rowData: any = { id: newId };

          headers.forEach((header, colIndex) => {
            const value = row[colIndex];
            if (
              header.toLowerCase().includes("name") ||
              header.toLowerCase().includes("名称")
            ) {
              rowData.name = value || "";
            } else if (
              header.toLowerCase().includes("value") ||
              header.toLowerCase().includes("数值")
            ) {
              rowData.value = Number(value) || 0;
            } else if (
              header.toLowerCase().includes("category") ||
              header.toLowerCase().includes("分类")
            ) {
              rowData.category = value || "A";
            } else {
              rowData[header] = value;
            }
          });

          // 确保必要字段存在
          if (!rowData.name) rowData.name = `数据点${newId}`;
          if (rowData.value === undefined) rowData.value = 0;
          if (!rowData.category) rowData.category = "A";

          return rowData;
        });

        setRows(newRows);
        setAlert({
          type: "success",
          message: `成功导入 ${newRows.length} 行数据`,
        });
        setUploadDialogOpen(false);
      } catch (error) {
        setAlert({ type: "error", message: "文件解析失败，请检查文件格式" });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 导出数据
  const handleExportData = () => {
    // 将Spreadsheet数据转换为二维数组
    const exportData = spreadsheetData.map((row) =>
      row.map((cell) => cell?.value || "")
    );

    const worksheet = XLSX.utils.aoa_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "数据表");
    XLSX.writeFile(workbook, "数据表.xlsx");
  };

  return (
    <Box>
      {/* 标题和工具栏 */}
      <Box sx={{ mb: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <Chip label={`${rows.length} 行数据`} size="small" color="primary" />
        </Stack>

        {/* 操作按钮 */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
          {/* 表格操作 */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddColumn}
              size="small"
            >
              新增列
            </Button>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddRow}
              size="small"
            >
              新增行
            </Button>
          </Stack>

          <Divider orientation="vertical" flexItem />

          {/* 文件操作 */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<FileUpload />}
              onClick={() => setUploadDialogOpen(true)}
              size="small"
            >
              导入文件
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportData}
              size="small"
            >
              导出Excel
            </Button>
          </Stack>
        </Stack>

        {/* 提示信息 */}
        {alert && (
          <Alert
            severity={alert.type}
            onClose={() => setAlert(null)}
            sx={{ mb: 2 }}
          >
            {alert.message}
          </Alert>
        )}
      </Box>

      {/* 数据表格 */}
      <Paper sx={{ height: height, width: "100%", overflow: "hidden" }}>
        <Box
          sx={{
            height: "100%",
            width: "100%",
            overflow: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f1f1f1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#c1c1c1",
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: "#a8a8a8",
              },
            },
            "& .spreadsheet-container": {
              minWidth: "100%",
              minHeight: "100%",
              "& .Spreadsheet": {
                minWidth: "100%",
                minHeight: "100%",
              },
              "& .Spreadsheet__table": {
                minWidth: "100%",
                minHeight: "100%",
                border: "1px solid #e0e0e0",
                tableLayout: "auto",
                width: "max-content",
              },
              "& .Spreadsheet__header": {
                backgroundColor: "#f5f5f5",
                fontWeight: 600,
                borderBottom: "2px solid #e0e0e0",
                position: "sticky",
                top: 0,
                zIndex: 1,
              },
              "& .Spreadsheet__cell": {
                border: "1px solid #e0e0e0",
                padding: "8px 12px",
                fontSize: "14px",
                minWidth: "120px",
                maxWidth: "200px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: "background-color 0.2s ease",
              },
              "& .Spreadsheet__cell--selected": {
                backgroundColor: "#e3f2fd",
                border: "2px solid #2196f3",
              },
              "& .Spreadsheet__cell:hover": {
                backgroundColor: "#f5f5f5",
              },
              "& .Spreadsheet__cell input": {
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "14px",
                padding: "0",
              },
            },
          }}
        >
          <Spreadsheet
            data={spreadsheetData}
            onChange={handleSpreadsheetChange}
            className="spreadsheet-container"
          />
        </Box>
      </Paper>

      {/* 文件上传对话框 */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>导入Excel文件</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            支持 .xlsx, .xls 格式文件。请确保文件包含以下列：名称、数值、分类
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <Button
            variant="contained"
            startIcon={<Upload />}
            onClick={() => fileInputRef.current?.click()}
            fullWidth
          >
            选择文件
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>取消</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
