"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  IconButton,
  Stack,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
} from "@mui/material";
import {
  ArrowBack,
  PlayArrow,
  Download,
  Refresh,
  Settings,
  TableChart,
  Description,
  Comment,
  Code,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import EnhancedTable from "../../../components/common/EnhancedTable";

// 工具数据（从主页面复制）
const toolsData = [
  {
    id: "plotly-line",
    name: "Plotly 折线图",
    description: "交互式折线图，支持多系列数据和动态缩放",
    category: "line",
    tags: ["交互式", "多系列", "动态缩放"],
  },
  {
    id: "d3-line",
    name: "D3.js 折线图",
    description: "高度自定义的折线图，支持复杂的数据可视化需求",
    category: "line",
    tags: ["自定义", "复杂数据", "D3.js"],
  },
  {
    id: "chartjs-bar",
    name: "Chart.js 柱状图",
    description: "轻量级柱状图库，易于集成和使用",
    category: "bar",
    tags: ["轻量级", "易集成", "响应式"],
  },
  {
    id: "echarts-bar",
    name: "ECharts 柱状图",
    description: "功能强大的柱状图，支持3D效果和动画",
    category: "bar",
    tags: ["3D效果", "动画", "功能强大"],
  },
  {
    id: "recharts-pie",
    name: "Recharts 饼图",
    description: "React生态的饼图组件，支持多种样式",
    category: "pie",
    tags: ["React", "组件化", "多样式"],
  },
  {
    id: "plotly-scatter",
    name: "Plotly 散点图",
    description: "交互式散点图，支持3D和动画效果",
    category: "scatter",
    tags: ["3D", "动画", "交互式"],
  },
];

// 示例表格数据
const sampleTableData = [
  { id: 1, name: "数据点1", value: 10, category: "A" },
  { id: 2, name: "数据点2", value: 20, category: "B" },
  { id: 3, name: "数据点3", value: 15, category: "A" },
  { id: 4, name: "数据点4", value: 25, category: "C" },
  { id: 5, name: "数据点5", value: 30, category: "B" },
];

// 使用介绍 Markdown 内容
const usageMarkdown = `
# Plotly 折线图使用指南

## 简介
Plotly 折线图是一个功能强大的交互式数据可视化工具，支持多系列数据和动态缩放功能。

## 基本用法

### 1. 数据准备
确保你的数据格式正确，包含以下字段：
- \`x\`: X轴数据
- \`y\`: Y轴数据
- \`name\`: 系列名称（可选）

### 2. 配置参数
- **标题**: 设置图表的标题
- **X轴标签**: X轴的显示标签
- **Y轴标签**: Y轴的显示标签
- **线条样式**: 选择线条的样式和颜色
- **点样式**: 设置数据点的显示样式

### 3. 交互功能
- **缩放**: 使用鼠标滚轮进行缩放
- **平移**: 拖拽图表进行平移
- **悬停**: 鼠标悬停查看数据详情
- **图例**: 点击图例显示/隐藏系列

## 高级功能

### 多系列数据
支持同时显示多个数据系列，每个系列可以有不同的样式和颜色。

### 动态更新
支持实时数据更新，图表会自动重新渲染。

### 导出功能
支持将图表导出为 PNG、SVG、PDF 等格式。

## 注意事项
1. 确保数据格式正确
2. 合理设置图表尺寸
3. 选择合适的颜色方案
4. 注意性能优化，避免数据量过大
`;

export default function ToolPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [leftPanelWidth, setLeftPanelWidth] = useState(40); // 百分比
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [tableData, setTableData] = useState(sampleTableData);

  // 查找当前工具
  const currentTool = toolsData.find((tool) => tool.id === slug);

  // 拖拽处理
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const windowWidth = window.innerWidth;
    const newWidth = (e.clientX / windowWidth) * 100;

    // 限制宽度范围在 20% 到 80% 之间
    const clampedWidth = Math.max(20, Math.min(80, newWidth));
    setLeftPanelWidth(clampedWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  // 处理表格数据变化
  const handleTableDataChange = (newData: any[]) => {
    setTableData(newData);
  };

  if (!currentTool) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">工具不存在</Typography>
        <Button onClick={() => router.back()}>返回</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* 顶部工具栏 */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 0,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={() => router.back()}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" fontWeight={600}>
            {currentTool.name}
          </Typography>
          <Chip label={currentTool.category} size="small" color="primary" />
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            重置
          </Button>
          <Button variant="contained" startIcon={<PlayArrow />} color="primary">
            生成图表
          </Button>
          <Button variant="outlined" startIcon={<Download />}>
            导出
          </Button>
        </Stack>
      </Paper>

      {/* 主要内容区域 */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* 左侧面板 */}
        <Paper
          elevation={0}
          sx={{
            width: `${leftPanelWidth}%`,
            minWidth: "300px",
            maxWidth: "80%",
            borderRight: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            borderRadius: 0,
          }}
        >
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab icon={<TableChart />} label="数据表格" iconPosition="start" />
            <Tab icon={<Settings />} label="参数配置" iconPosition="start" />
            <Tab icon={<Description />} label="使用介绍" iconPosition="start" />
            <Tab icon={<Comment />} label="评论" iconPosition="start" />
          </Tabs>

          {/* Tab 内容 */}
          <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
            {activeTab === 0 && (
              <Box>
                <EnhancedTable
                  data={tableData}
                  onDataChange={handleTableDataChange}
                  title="数据表格"
                />
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  参数配置
                </Typography>

                <Stack spacing={3}>
                  {/* 基本设置 */}
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      基本设置
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="图表标题"
                        defaultValue="我的图表"
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="X轴标签"
                        defaultValue="X轴"
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Y轴标签"
                        defaultValue="Y轴"
                        fullWidth
                        size="small"
                      />
                    </Stack>
                  </Paper>

                  {/* 样式设置 */}
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      样式设置
                    </Typography>
                    <Stack spacing={2}>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="显示网格线"
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="显示图例"
                      />
                      <FormControlLabel
                        control={<Switch />}
                        label="显示数据标签"
                      />
                    </Stack>
                  </Paper>

                  {/* 颜色设置 */}
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      颜色设置
                    </Typography>
                    <Stack spacing={2}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>线条颜色</InputLabel>
                        <Select defaultValue="blue" label="线条颜色">
                          <MenuItem value="blue">蓝色</MenuItem>
                          <MenuItem value="red">红色</MenuItem>
                          <MenuItem value="green">绿色</MenuItem>
                          <MenuItem value="purple">紫色</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl size="small" fullWidth>
                        <InputLabel>背景颜色</InputLabel>
                        <Select defaultValue="white" label="背景颜色">
                          <MenuItem value="white">白色</MenuItem>
                          <MenuItem value="lightgray">浅灰色</MenuItem>
                          <MenuItem value="darkgray">深灰色</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Paper>

                  {/* 尺寸设置 */}
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      尺寸设置
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography gutterBottom>宽度: 800px</Typography>
                        <Slider
                          defaultValue={800}
                          min={400}
                          max={1200}
                          step={50}
                          valueLabelDisplay="auto"
                        />
                      </Box>
                      <Box>
                        <Typography gutterBottom>高度: 600px</Typography>
                        <Slider
                          defaultValue={600}
                          min={300}
                          max={900}
                          step={50}
                          valueLabelDisplay="auto"
                        />
                      </Box>
                    </Stack>
                  </Paper>
                </Stack>
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  使用介绍
                </Typography>
                <Paper sx={{ p: 2 }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {usageMarkdown}
                  </ReactMarkdown>
                </Paper>
              </Box>
            )}
          </Box>
        </Paper>

        {/* 可拖拽分界线 */}
        <Box
          sx={{
            width: "4px",
            backgroundColor: "divider",
            cursor: "col-resize",
            "&:hover": {
              backgroundColor: "primary.main",
            },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseDown={handleMouseDown}
        >
          <Box
            sx={{
              width: "2px",
              height: "40px",
              backgroundColor: "text.secondary",
              borderRadius: "1px",
            }}
          />
        </Box>

        {/* 右侧绘图容器 */}
        <Box
          sx={{
            flex: 1,
            minWidth: "300px",
            display: "flex",
            flexDirection: "column",
            bgcolor: "grey.50",
          }}
        >
          {/* 绘图区域标题 */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6">图表预览</Typography>
          </Box>

          {/* 绘图容器 */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
            }}
          >
            <Paper
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "white",
                border: "2px dashed",
                borderColor: "grey.300",
              }}
            >
              <Stack alignItems="center" spacing={2}>
                <Code sx={{ fontSize: 48, color: "grey.400" }} />
                <Typography variant="h6" color="text.secondary">
                  图表将在这里显示
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  配置参数并点击"生成图表"按钮
                </Typography>
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
