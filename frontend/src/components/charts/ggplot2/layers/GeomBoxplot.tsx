"use client";

import { linetypeOptions } from "../common/constants";
import { BoxplotLayer, ParameterConfig } from "../types";
import { GeomBase } from "./GeomBase";

// GeomBoxplot 的参数配置
export const availableBoxplotAesthetics: string[] = [
  "colour",
  "fill",
  "alpha",
  "size",
  "shape",
  "group",
  "linetype",
  "linewidth",
];
export const availableBoxplotParams: ParameterConfig[] = [
  {
    name: "position",
    type: "position",
    options: ["position_dodge", "position_dodge2", "position_nudge"],
    default: "position_dodge2",
  },
  {
    name: "colour",
    type: "color",
  },
  {
    name: "fill",
    type: "color",
  },
  {
    name: "alpha",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 1,
  },
  {
    name: "orientation",
    type: "select",
    options: ["vertical", "horizontal"],
    default: "vertical",
  },
  {
    name: "notchwidth",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.5,
    disabled: (allParams, currentParamName) => {
      const notchParam = allParams.find((p) => p.name === "notch");
      // 如果 notch 参数不存在或值为 false，则禁用 notchwidth
      if (!notchParam) return true;
      // 确保值是布尔类型，处理字符串 "true"/"false" 的情况
      const notchValue =
        typeof notchParam.value === "boolean"
          ? notchParam.value
          : notchParam.value === true || notchParam.value === "true";
      return !notchValue;
    },
  },
  {
    name: "notch",
    type: "boolean",
    default: false,
  },
  {
    name: "varwidth",
    type: "boolean",
    default: false,
  },
  {
    name: "na.rm",
    type: "boolean",
    default: false,
  },
  {
    name: "show.legend",
    type: "boolean",
    default: true,
  },
  {
    name: "inherit.aes",
    type: "boolean",
    default: true,
  },
  // Outliers 参数
  {
    name: "outliers",
    type: "boolean",
  },
  {
    name: "outliers_colour",
    type: "color",
  },
  {
    name: "outliers.fill",
    type: "color",
  },
  {
    name: "outliers.shape",
    type: "number",
    min: 0,
    max: 25,
    step: 1,
    default: 19,
  },
  {
    name: "outliers.size",
    type: "number",
    min: 0,
    step: 0.1,
    default: 1.5,
  },
  {
    name: "outliers.stroke",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "outliers.alpha",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 1,
  },
  // Whisker 参数
  {
    name: "whisker.colour",
    type: "color",
  },
  {
    name: "whisker.linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "whisker.linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  // Staple 参数
  {
    name: "staple.colour",
    type: "color",
  },
  {
    name: "staple.linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "staple.linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  // Median 参数
  {
    name: "median.colour",
    type: "color",
  },
  {
    name: "median.linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "median.linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  // Box 参数
  {
    name: "box.colour",
    type: "color",
  },
  {
    name: "box.linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "box.linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
];

interface GeomBoxplotProps {
  params: BoxplotLayer;
  onChange: (params: BoxplotLayer) => void;
  /** 可选择的列名列表 */
  columns?: string[];
}

export const GeomBoxplot: React.FC<GeomBoxplotProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="箱线图"
      availableAesthetics={availableBoxplotAesthetics}
      availableParams={availableBoxplotParams}
    />
  );
};
