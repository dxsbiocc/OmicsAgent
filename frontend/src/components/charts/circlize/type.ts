// circlize 类型定义
// 参考 ggplot2 的类型结构，但针对 circlize 包的特性进行调整

import { ParameterConfig, ParameterItem } from "../ggplot2/types";

// 基础配置接口
export interface BaseConfig {
  type: string;
  arguments?: {
    [key: string]: any;
  };
}

// circlize 轨道（track）配置
export interface TrackConfig extends BaseConfig {
  type:
    | "circos.track"
    | "circos.trackHist"
    | "circos.trackPoints"
    | "circos.trackLines"
    | "circos.trackText"
    | "circos.trackPlotRegion"
    | "circos.trackHeatmap"
    | "circos.trackLinks";
  arguments?: {
    ylim?: number[];
    "track.height"?: number;
    "track.margin"?: number[];
    "bg.col"?: string | string[];
    "bg.border"?: string | string[];
    "bg.lty"?: string | string[];
    "bg.lwd"?: number | number[];
    "cell.padding"?: number[];
    [key: string]: any;
  };
}

// circlize 链接（link）配置
export interface LinkConfig extends BaseConfig {
  type: "circos.link";
  arguments?: {
    col?: string;
    lwd?: number;
    lty?: string;
    border?: string;
    rou1?: number;
    rou2?: number;
    h?: number;
    h1?: number;
    h2?: number;
    w?: number;
    w1?: number;
    w2?: number;
    directional?: number;
    "arr.length"?: number;
    "arr.width"?: number;
    "arr.type"?: string;
    "arr.col"?: string;
    "arr.lwd"?: number;
    "arr.lty"?: string;
    [key: string]: any;
  };
}

// circlize 初始化配置
export interface CircosInitializeConfig extends BaseConfig {
  type: "circos.initialize";
  arguments?: {
    x?: number[];
    "sector.width"?: number[];
    "sector.gap"?: number[];
    "start.degree"?: number;
    direction?: "clockwise" | "reverse";
    [key: string]: any;
  };
}

// circlize 基因组配置
export interface GenomicConfig extends BaseConfig {
  type: "circos.genomicInitialize";
  arguments?: {
    "sector.width"?: number[];
    "sector.gap"?: number[];
    "start.degree"?: number;
    direction?: "clockwise" | "reverse";
    plotType?: "axis" | "labels" | "both";
    [key: string]: any;
  };
}

// circlize 文本配置
export interface TextConfig extends BaseConfig {
  type: "circos.text";
  arguments?: {
    labels?: string[];
    facing?:
      | "inside"
      | "outside"
      | "reverse.clockwise"
      | "reverse.clockwise.inside"
      | "clockwise"
      | "clockwise.inside"
      | "downward"
      | "bending"
      | "bending.inside";
    niceFacing?: boolean;
    cex?: number;
    col?: string | string[];
    font?: number | number[];
    adj?: number | number[];
    [key: string]: any;
  };
}

// circlize 矩形配置
export interface RectConfig extends BaseConfig {
  type: "circos.rect";
  arguments?: {
    col?: string | string[];
    border?: string | string[];
    lwd?: number | number[];
    lty?: string | string[];
    [key: string]: any;
  };
}

// circlize 点配置
export interface PointsConfig extends BaseConfig {
  type: "circos.points";
  arguments?: {
    pch?: number | number[];
    cex?: number | number[];
    col?: string | string[];
    bg?: string | string[];
    [key: string]: any;
  };
}

// circlize 线配置
export interface LinesConfig extends BaseConfig {
  type: "circos.lines";
  arguments?: {
    col?: string | string[];
    lwd?: number | number[];
    lty?: string | string[];
    type?: "l" | "o" | "p" | "b" | "c" | "s" | "S" | "h" | "n";
    [key: string]: any;
  };
}

// circlize 热图配置
export interface HeatmapConfig extends BaseConfig {
  type: "circos.heatmap";
  arguments?: {
    col?: string | string[] | ((value: number) => string);
    "na.col"?: string;
    border?: string | string[];
    lwd?: number | number[];
    lty?: string | string[];
    cluster?: boolean;
    "clustering.method"?: string;
    "dend.side"?: "inside" | "outside";
    "dend.track.height"?: number;
    "dend.callback"?: string;
    [key: string]: any;
  };
}

// 所有轨道类型的联合类型
export type Track =
  | TrackConfig
  | LinkConfig
  | TextConfig
  | RectConfig
  | PointsConfig
  | LinesConfig
  | HeatmapConfig
  | { type: string; arguments?: { [key: string]: any } };

// circlize 完整配置
export interface CirclizeConfig {
  // 初始化配置
  initialize?: CircosInitializeConfig | GenomicConfig;
  // 轨道列表
  tracks?: Track[];
  // 全局参数
  width?: number;
  height?: number;
  // 标题
  title?: string;
  // 其他配置
  [key: string]: any;
}

// colorRamp2 配置
export interface ColorRamp2Config {
  type: "colorRamp2";
  arguments?: {
    /** 数值断点数组 */
    breaks?: number[];
    /** 对应断点的颜色数组 */
    colors?: string[];
    /** 透明度值 [0, 1]，0 表示完全不透明，1 表示完全透明 */
    transparency?: number;
    /** 颜色空间，用于颜色插值 */
    space?: "RGB" | "LAB" | "XYZ" | "sRGB" | "LUV";
    /** HCL 调色板名称 */
    hcl_palette?: string;
    /** 是否反转 hcl_palette 中的颜色 */
    reverse?: boolean;
  };
}

// 导出 ParameterConfig 和 ParameterItem 以便复用
export type { ParameterConfig, ParameterItem };
