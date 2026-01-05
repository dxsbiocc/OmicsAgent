import ReactECharts from "echarts-for-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { Box, CircularProgress, Tabs, Tab, IconButton } from "@mui/material";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import { useChartStore } from "@/stores/chartStore";
import { useThemeContext } from "@/contexts/ThemeContext";
import {
  TitleOptions,
  LegendOptions,
  GridOptions,
  AxisOptions,
  GlobalOptions,
  VisualMapOptions,
  RadarOptions,
  PolarOptions,
  AngleAxisOptions,
  RadiusAxisOptions,
} from "./common";
import {
  LineSeries,
  BarSeries,
  ScatterSeries,
  PieSeries,
  RadarSeries,
  BoxplotSeries,
  HeatmapSeries,
  TreeSeries,
  SunburstSeries,
  SankeySeries,
  GraphSeries,
} from "./series";

export const OptionsComponent = ({ toolName }: { toolName: string }) => {
  // Tab 状态管理
  const [activeTab, setActiveTab] = useState<string>("global");
  const [scrollTop, setScrollTop] = useState<number>(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    // 切换 Tab 时自动滚动到顶部
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  const handleScrollUp = () => {
    if (tabsRef.current) {
      const newScrollTop = Math.max(0, scrollTop - 60);
      tabsRef.current.scrollTop = newScrollTop;
      setScrollTop(newScrollTop);
    }
  };

  const handleScrollDown = () => {
    if (tabsRef.current) {
      const maxScrollTop =
        tabsRef.current.scrollHeight - tabsRef.current.clientHeight;
      const newScrollTop = Math.min(maxScrollTop, scrollTop + 60);
      tabsRef.current.scrollTop = newScrollTop;
      setScrollTop(newScrollTop);
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  // 渲染当前选中的组件
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "global":
        return <GlobalOptions />;
      case "visualMap":
        return <VisualMapOptions />;
      case "series":
        return (
          <>
            {toolName.startsWith("line") && <LineSeries seriesIndex={0} />}
            {toolName.startsWith("bar") && <BarSeries seriesIndex={0} />}
            {toolName.startsWith("scatter") && (
              <ScatterSeries seriesIndex={0} />
            )}
            {toolName.startsWith("pie") && <PieSeries seriesIndex={0} />}
            {toolName.startsWith("radar") && <RadarSeries seriesIndex={0} />}
            {toolName.startsWith("boxplot") && (
              <BoxplotSeries seriesIndex={0} />
            )}
            {toolName.startsWith("heatmap") && (
              <HeatmapSeries seriesIndex={0} />
            )}
            {toolName.startsWith("tree") && <TreeSeries seriesIndex={0} />}
            {toolName.startsWith("sunburst") && (
              <SunburstSeries seriesIndex={0} />
            )}
            {toolName.startsWith("sankey") && <SankeySeries seriesIndex={0} />}
            {toolName.startsWith("graph") && <GraphSeries seriesIndex={0} />}
          </>
        );
      case "title":
        return <TitleOptions />;
      case "legend":
        return <LegendOptions />;
      case "grid":
        return <GridOptions />;
      case "xAxis":
        return <AxisOptions axisType="xAxis" label="X 轴" />;
      case "yAxis":
        return <AxisOptions axisType="yAxis" label="Y 轴" />;
      case "polar":
        return <PolarOptions polarIndex={0} label="极坐标" />;
      case "radius":
        return <RadiusAxisOptions />;
      case "angle":
        return <AngleAxisOptions />;
      case "radar":
        return <RadarOptions axisIndex={0} label="雷达" />;
      default:
        return <GlobalOptions />;
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* 左侧 Tabs 区域 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          borderRight: 1,
          borderColor: "divider",
          width: "auto",
          height: "100%",
          flexShrink: 0,
        }}
      >
        {/* 上箭头按钮 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            padding: "4px",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <IconButton
            size="small"
            onClick={handleScrollUp}
            disabled={scrollTop <= 0}
            sx={{
              opacity: scrollTop <= 0 ? 0.3 : 1,
              transition: "opacity 0.2s",
            }}
          >
            <KeyboardArrowUp />
          </IconButton>
        </Box>

        {/* Tabs 滚动容器 */}
        <Box
          ref={tabsRef}
          onScroll={handleScroll}
          sx={{
            flex: 1,
            overflow: "auto",
            "&::-webkit-scrollbar": {
              display: "none", // 隐藏滚动条
            },
            // 兼容 Firefox
            scrollbarWidth: "none",
            // 兼容 IE 和 Edge
            msOverflowStyle: "none",
          }}
        >
          <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              width: "auto",
              "& .MuiTab-root": {
                alignItems: "center",
                textAlign: "center",
                minHeight: 60,
                minWidth: "auto",
                width: "auto",
                padding: "8px 12px",
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                fontSize: "0.9rem", // 字体大小
                fontWeight: 500,
                letterSpacing: "0.5px",
                whiteSpace: "nowrap",
                "&.Mui-selected": {
                  backgroundColor: "action.selected",
                },
              },
              "& .MuiTabs-indicator": {
                left: 0,
                right: "auto",
                width: 3,
                backgroundColor: "primary.main",
              },
            }}
          >
            <Tab key="global" label="全局参数" value="global" />
            <Tab key="visualMap" label="视觉映射" value="visualMap" />
            <Tab key="series" label="图形参数" value="series" />
            <Tab key="title" label="标题" value="title" />
            <Tab key="legend" label="图例" value="legend" />
            <Tab key="grid" label="网格" value="grid" />

            {/* 根据图表类型显示不同的坐标轴设置 */}
            {toolName.includes("polar") ? (
              [
                <Tab key="polar" label="极坐标" value="polar" />,
                <Tab key="radius" label="半径轴" value="radius" />,
                <Tab key="angle" label="角度轴" value="angle" />,
              ]
            ) : toolName.includes("radar") ? (
              <Tab key="radar" label="雷达" value="radar" />
            ) : toolName.includes("sunburst") ||
              toolName.includes("tree") ||
              toolName.includes("sankey") ? (
              []
            ) : (
              [
                <Tab key="xAxis" label="X 轴" value="xAxis" />,
                <Tab key="yAxis" label="Y 轴" value="yAxis" />,
              ]
            )}
          </Tabs>
        </Box>

        {/* 下箭头按钮 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            padding: "4px",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <IconButton
            size="small"
            onClick={handleScrollDown}
            disabled={
              tabsRef.current
                ? scrollTop >=
                  tabsRef.current.scrollHeight - tabsRef.current.clientHeight
                : false
            }
            sx={{
              opacity: tabsRef.current
                ? scrollTop >=
                  tabsRef.current.scrollHeight - tabsRef.current.clientHeight
                  ? 0.3
                  : 1
                : 1,
              transition: "opacity 0.2s",
            }}
          >
            <KeyboardArrowDown />
          </IconButton>
        </Box>
      </Box>

      {/* 右侧内容区域 */}
      <Box
        ref={contentRef}
        sx={{
          p: 1,
          flex: 1,
          height: "100%",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {renderActiveComponent()}
      </Box>
    </Box>
  );
};

export const EChartsComponent = ({ style }: { style: React.CSSProperties }) => {
  const { chartOption, loading, chartInstance, setChartInstance } =
    useChartStore();
  const { mode } = useThemeContext();

  const chartRef = useRef<ReactECharts>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 设置 chartInstance 到状态中
  useEffect(() => {
    const instance = chartRef.current?.getEchartsInstance();
    if (instance && instance !== chartInstance) {
      setChartInstance(instance);
    }
  }, [chartOption, chartInstance, setChartInstance]);

  // 监听ECharts容器大小变化，更新 chartInstance
  useEffect(() => {
    const container = containerRef.current;

    if (!chartInstance || !container) return;

    // 更新 chartInstance 的函数
    const updateChartInstance = () => {
      if (!chartInstance) return;

      // 触发 chartInstance 的 resize 方法，确保图表正确渲染
      chartInstance.resize();

      // 可以在这里添加其他需要响应容器大小变化的逻辑
      console.log("容器大小变化，已更新 chartInstance");
    };

    // 监听ECharts的resize事件
    chartInstance.on("resize", updateChartInstance);

    // 监听窗口resize事件
    const handleWindowResize = () => {
      // 延迟执行，确保ECharts已经响应了窗口变化
      setTimeout(() => {
        updateChartInstance();
      }, 100);
    };

    // 使用ResizeObserver监听容器大小变化（包括分割线拖拽）
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // console.log("容器尺寸变化，更新 chartInstance");
        // 延迟更新，确保ECharts已经响应了容器变化
        setTimeout(() => {
          updateChartInstance();
        }, 100);
      }
    });

    // 开始观察容器
    resizeObserver.observe(container);
    window.addEventListener("resize", handleWindowResize);

    // setTimeout(() => {
    //   initAxisBreakInteraction(chartInstance);
    // }, 1000);

    // 清理函数
    return () => {
      if (chartInstance) {
        chartInstance.off("resize", updateChartInstance);
      }
      window.removeEventListener("resize", handleWindowResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [chartInstance]);

  if (loading) {
    return (
      <Box sx={{ width: "100%", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  console.log("chartOption", chartOption);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <ReactECharts
        ref={chartRef}
        option={chartOption}
        theme={mode === "dark" ? "dark" : "light"}
        style={style}
        opts={{ renderer: "svg" }}
        notMerge={true}
        lazyUpdate={false}
        showLoading={false}
      />
    </div>
  );
};
