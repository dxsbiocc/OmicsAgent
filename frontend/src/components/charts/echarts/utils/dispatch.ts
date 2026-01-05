import { ChartDataItem } from "../../types";
import { ECharts, EChartsOption } from "echarts";
import {
  LineBasic,
  LineBump,
  LineGroup,
  LineStack,
  LineHighLight,
  LineDoubleAxis,
  LineIndependent,
} from "../charts/line";
import {
  BarBasic,
  BarBreak,
  BarGroup,
  BarPolarHorizontal,
  BarPolarSector,
  BarPolarStack,
  BarPolarStackRing,
  BarPolarVertical,
  BarStack,
  BarWaterfall,
} from "../charts/bar";
import {
  ScatterBasic,
  ScatterGroup,
  ScatterBubble,
  ScatterJitter,
  ScatterSingleAxis,
  ScatterCorrelation,
} from "../charts/scatter";
import {
  PieBasic,
  PieCombine,
  PieDoughnut,
  PieHalf,
  PieNest,
  PieNightingale,
} from "../charts/pie";
import { RadarBasic, RadarGroup } from "../charts/radar";
import { echartsError } from "./validation";
import { BoxplotBasic, BoxplotGroup } from "../charts/boxplot";
import { HeatmapBasic } from "../charts/heatmap";
import { TreeBasic, TreeGroup } from "../charts/tree";
import {
  SunburstAdvanced,
  SunburstBasic,
  SunburstRound,
} from "../charts/sunburst";
import { SankeyBasic, SankeyLevel } from "../charts/sankey";
import {
  GraphBasic,
  GraphForce,
  GraphCartesian,
  GraphCircular,
} from "../charts/graph";

export interface InitialOptionParams {
  xAxis: string;
  yAxis: string;
  groupBy?: string;
  colorAxis?: string;
  sizeAxis?: string;
  chartInstance?: ECharts | null;
  // 允许动态属性，用于传递额外的图表参数（如相关性散点图的 correlation, pvalue, fitLine 等）
  [key: string]: any;
}

export function dispatchEChartsOption(
  data: ChartDataItem[] | Record<string, any[]>,
  params: InitialOptionParams,
  toolName: string,
  chartInstance?: ECharts | null
): EChartsOption {
  // 处理两种数据格式：数组或对象
  let rows: Array<Record<string, any>> = [];
  let isObjectFormat = false;

  if (Array.isArray(data)) {
    rows = (data as unknown as Array<Record<string, any>>) || [];
  } else if (data && typeof data === "object") {
    // 对象格式：可能是多表格数据（如 {nodes: [], links: []}）
    isObjectFormat = true;
    // 对于 graph 图表，直接传递对象；对于其他图表，尝试转换为数组
    if (toolName.startsWith("graph") || toolName.startsWith("sankey")) {
      // graph 和 sankey 图表直接使用对象格式
      rows = [data as any];
    } else {
      // 其他图表，尝试将对象转换为数组
      rows = [];
    }
  }

  // 如果没有数据，返回空配置
  if (!isObjectFormat && rows.length === 0) {
    return {
      title: { text: "暂无数据" },
      xAxis: { type: "category" },
      yAxis: { type: "value" },
      series: [],
    };
  }

  // 获取可用的列名（仅对数组格式有效）
  const columns = rows.length > 0 ? Object.keys(rows[0] || {}) : [];
  const xAxis =
    params.xAxis && columns.includes(params.xAxis) ? params.xAxis : columns[0];
  const yAxis =
    params.yAxis && columns.includes(params.yAxis)
      ? params.yAxis
      : columns[1] || columns[0];
  const colorAxis =
    params.colorAxis && columns.includes(params.colorAxis)
      ? params.colorAxis
      : columns[2];
  const sizeAxis =
    params.sizeAxis && columns.includes(params.sizeAxis)
      ? params.sizeAxis
      : columns[3];

  try {
    switch (toolName) {
      case "line_basic":
        return LineBasic(rows, xAxis, yAxis);
      case "line_group":
        return LineGroup(rows);
      case "line_stack":
        return LineStack(rows);
      case "line_highlight":
        return LineHighLight(rows);
      case "line_bump":
        return LineBump(rows);
      case "line_double":
        return LineDoubleAxis(rows, xAxis, yAxis, colorAxis);
      case "line_independent":
        return LineIndependent(rows, xAxis, yAxis, colorAxis);
      case "bar_basic":
        return BarBasic(rows, xAxis, yAxis);
      case "bar_waterfall":
        return BarWaterfall(rows, xAxis, yAxis);
      case "bar_group":
        return BarGroup(rows);
      case "bar_stack":
        return BarStack(rows, xAxis, yAxis, colorAxis, chartInstance);
      case "bar_break":
        return BarBreak(rows, xAxis, yAxis, colorAxis);
      case "bar_polar_vertical":
        return BarPolarVertical(rows, xAxis, yAxis);
      case "bar_polar_horizontal":
        return BarPolarHorizontal(rows, xAxis, yAxis);
      case "bar_polar_sector":
        return BarPolarSector(rows, xAxis, yAxis, colorAxis);
      case "bar_polar_stack":
        return BarPolarStack(rows, xAxis, yAxis, colorAxis);
      case "bar_polar_stack_ring":
        return BarPolarStackRing(rows, xAxis, yAxis, colorAxis);
      case "scatter_basic":
        return ScatterBasic(rows, xAxis, yAxis);
      case "scatter_group":
        return ScatterGroup(rows, colorAxis);
      case "scatter_bubble":
        return ScatterBubble(rows, colorAxis, sizeAxis);
      case "scatter_jitter":
        return ScatterJitter(rows, xAxis, yAxis);
      case "scatter_single":
        return ScatterSingleAxis(rows, xAxis, yAxis, colorAxis);
      case "scatter_correlation":
        // 动态获取相关性参数，支持从 extraParams 或直接传递
        if (params?.correlation && params?.pvalue && params?.fit_line) {
          return ScatterCorrelation(
            rows,
            xAxis,
            yAxis,
            params.correlation,
            params.pvalue,
            params.fit_line
          );
        }
        // 如果没有相关性参数，回退到基础散点图
        return ScatterBasic(rows, xAxis, yAxis);
      case "pie_basic":
        return PieBasic(rows, xAxis, yAxis);
      case "pie_doughnut":
        return PieDoughnut(rows, xAxis, yAxis);
      case "pie_half":
        return PieHalf(rows, xAxis, yAxis);
      case "pie_nightingale":
        return PieNightingale(rows, xAxis, yAxis);
      case "pie_nest":
        return PieNest(rows, xAxis, yAxis, colorAxis);
      case "pie_combine":
        return PieCombine(rows, xAxis, yAxis, colorAxis, chartInstance);
      case "radar_basic":
        return RadarBasic(rows, xAxis);
      case "radar_group":
        return RadarGroup(rows, xAxis);
      case "boxplot_basic":
        return BoxplotBasic(rows, xAxis, yAxis);
      case "boxplot_group":
        return BoxplotGroup(rows, xAxis, yAxis, colorAxis);
      case "heatmap_basic":
        return HeatmapBasic(rows, xAxis);
      case "tree_basic":
        return TreeBasic(rows);
      case "tree_group":
        return TreeGroup(rows);
      case "sunburst_basic":
        return SunburstBasic(rows);
      case "sunburst_advanced":
        return SunburstAdvanced(rows);
      case "sunburst_round":
        return SunburstRound(rows);
      case "sankey_basic":
        return SankeyBasic(rows, xAxis, yAxis, colorAxis);
      case "sankey_level":
        return SankeyLevel(rows, xAxis, yAxis, colorAxis);
      case "graph_basic":
        // graph 图表：只接受对象格式 {nodes: [], links: []}
        if (!isObjectFormat) {
          throw new Error(
            "Graph data must be an object with 'nodes' and 'links' properties, e.g., {nodes: [], links: []}. Array format is not supported."
          );
        }
        return GraphBasic(data as any);
      case "graph_force":
        if (!isObjectFormat) {
          throw new Error(
            "Graph data must be an object with 'nodes' and 'links' properties, e.g., {nodes: [], links: []}. Array format is not supported."
          );
        }
        return GraphForce(data as any);
      case "graph_cartesian":
        if (!isObjectFormat) {
          throw new Error(
            "Graph data must be an object with 'nodes' and 'links' properties, e.g., {nodes: [], links: []}. Array format is not supported."
          );
        }
        return GraphCartesian(data as any);
      case "graph_circular":
        if (!isObjectFormat) {
          throw new Error(
            "Graph data must be an object with 'nodes' and 'links' properties, e.g., {nodes: [], links: []}. Array format is not supported."
          );
        }
        return GraphCircular(data as any);
      default:
        return LineBasic(rows, xAxis, yAxis);
    }
  } catch (error) {
    console.error("Error generating chart option:", error);
    return echartsError(error as string);
  }
}
