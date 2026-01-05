// Chart data types and interfaces

export interface DataItem {
  [key: string]: number | string | boolean;
}
export interface ChartData {
  data: DataItem[];
  columns: string[];
}

export interface ChartDataItem {
  id?: number;
  name: string;
  value: number;
  category?: string;
  [key: string]: any;
}

export interface ChartConfig {
  title?: string;
  width?: number;
  height?: number;
  colors?: string[];
  theme?: "light" | "dark";
}

export interface ChartStyle {
  value: string;
  label: string;
  icon: string;
  description: string;
}

export interface ChartOption {
  title?: any;
  tooltip?: any;
  legend?: any;
  xAxis?: any;
  yAxis?: any;
  series?: any[];
  [key: string]: any;
}

// 简化的图表类型，只支持4种基本类型
export type ChartType = "line" | "bar" | "scatter" | "pie";
export type ChartTools =
  | "line_base"
  | "line_group"
  | "line_stack"
  | "line_bump";
export type ChartEngine = "echarts" | "static";
export type StaticEngine = "r" | "matplotlib";
