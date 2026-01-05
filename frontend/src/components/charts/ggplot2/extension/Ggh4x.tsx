"use client";

// Ggh4x 扩展包的导出
// 目前主要用于 facet_wrap2 组件和 strip 组件
// facet_wrap2 组件已在 FacetConfig.tsx 中实现
// strip 组件在 StripParams.tsx 中实现

export type { FacetConfig, StripConfig } from "../types";
export {
  StripThemed,
  StripNested,
  StripSplit,
  StripVanilla,
  StripTag,
  StripRenderer,
} from "./StripParams";
