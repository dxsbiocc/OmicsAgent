// circlize 常量定义

import { ParameterConfig } from "../../ggplot2/types";

// 可用的轨道类型
export const availableTrackTypes = [
  { type: "circos.track", label: "基础轨道" },
  { type: "circos.trackHist", label: "直方图轨道" },
  { type: "circos.trackPoints", label: "点图轨道" },
  { type: "circos.trackLines", label: "线图轨道" },
  { type: "circos.trackText", label: "文本轨道" },
  { type: "circos.trackPlotRegion", label: "绘图区域轨道" },
  { type: "circos.trackHeatmap", label: "热图轨道" },
  { type: "circos.trackLinks", label: "链接轨道" },
  { type: "circos.link", label: "链接" },
  { type: "circos.text", label: "文本" },
  { type: "circos.rect", label: "矩形" },
  { type: "circos.points", label: "点" },
  { type: "circos.lines", label: "线" },
  { type: "circos.heatmap", label: "热图" },
];

// 可用的初始化类型
export const availableInitializeTypes = [
  { type: "circos.initialize", label: "基础初始化" },
  { type: "circos.genomicInitialize", label: "基因组初始化" },
];

// 文本朝向选项
export const textFacingOptions = [
  "inside",
  "outside",
  "reverse.clockwise",
  "reverse.clockwise.inside",
  "clockwise",
  "clockwise.inside",
  "downward",
  "bending",
  "bending.inside",
];

// 线条类型选项
export const lineTypeOptions = ["l", "o", "p", "b", "c", "s", "S", "h", "n"];

// 方向选项
export const directionOptions = ["clockwise", "reverse"];

// 绘图类型选项
export const plotTypeOptions = ["axis", "labels", "both"];

// 轨道参数的通用配置
export const commonTrackParams: ParameterConfig[] = [
  {
    name: "track.height",
    type: "number",
    default: 0.1,
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    name: "track.margin",
    type: "numbers",
    default: [0, 0],
  },
  {
    name: "bg.col",
    type: "color",
    default: "#FFFFFF",
  },
  {
    name: "bg.border",
    type: "color",
    default: "#000000",
  },
  {
    name: "bg.lty",
    type: "select",
    options: ["solid", "dashed", "dotted", "dotdash", "longdash", "twodash"],
    default: "solid",
  },
  {
    name: "bg.lwd",
    type: "number",
    default: 1,
    min: 0,
    step: 0.1,
  },
  {
    name: "cell.padding",
    type: "numbers",
    default: [0, 0, 0, 0],
  },
];

// 链接参数的通用配置
export const commonLinkParams: ParameterConfig[] = [
  {
    name: "col",
    type: "color",
    default: "#000000",
  },
  {
    name: "lwd",
    type: "number",
    default: 1,
    min: 0,
    step: 0.1,
  },
  {
    name: "lty",
    type: "select",
    options: ["solid", "dashed", "dotted", "dotdash", "longdash", "twodash"],
    default: "solid",
  },
  {
    name: "border",
    type: "color",
    default: "#000000",
  },
  {
    name: "directional",
    type: "number",
    default: 0,
    min: 0,
    max: 1,
  },
  {
    name: "arr.length",
    type: "number",
    default: 0.1,
    min: 0,
    step: 0.01,
  },
  {
    name: "arr.width",
    type: "number",
    default: 0.1,
    min: 0,
    step: 0.01,
  },
  {
    name: "arr.type",
    type: "select",
    options: ["triangle", "circle", "ellipse"],
    default: "triangle",
  },
];

// 文本参数的通用配置
export const commonTextParams: ParameterConfig[] = [
  {
    name: "facing",
    type: "select",
    options: textFacingOptions,
    default: "inside",
  },
  {
    name: "niceFacing",
    type: "boolean",
    default: false,
  },
  {
    name: "cex",
    type: "number",
    default: 1,
    min: 0,
    step: 0.1,
  },
  {
    name: "col",
    type: "color",
    default: "#000000",
  },
  {
    name: "font",
    type: "number",
    default: 1,
    min: 1,
    max: 5,
  },
];

// 初始化参数的通用配置
export const commonInitializeParams: ParameterConfig[] = [
  {
    name: "sector.width",
    type: "numbers",
    default: [],
  },
  {
    name: "sector.gap",
    type: "numbers",
    default: [],
  },
  {
    name: "start.degree",
    type: "number",
    default: 0,
    min: 0,
    max: 360,
    step: 1,
  },
  {
    name: "direction",
    type: "select",
    options: directionOptions,
    default: "clockwise",
  },
];

