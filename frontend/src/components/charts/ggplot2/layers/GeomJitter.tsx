"use client";

import { JitterLayer, ParameterConfig } from "../types";
import { GeomBase } from "./GeomBase";

// GeomJitter 的参数配置
export const availableJitterAesthetics: string[] = [
  "colour",
  "fill",
  "alpha",
  "size",
  "shape",
  "group",
];
export const availableJitterParams: ParameterConfig[] = [
  {
    name: "position",
    type: "position",
    options: ["position_jitter", "position_jitterdodge"],
    default: "position_jitter",
  },
  {
    name: "width",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.2,
  },
  {
    name: "height",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0,
  },
  {
    name: "size",
    type: "number",
    min: 0,
    step: 0.1,
    default: 2,
  },
  {
    name: "shape",
    type: "number",
    min: 0,
    max: 25,
    step: 1,
    default: 19,
  },
  {
    name: "stroke",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "alpha",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.5,
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
];

interface GeomJitterProps {
  params: JitterLayer;
  onChange: (layer: JitterLayer) => void;
  /** 可选择的列名列表 */
  columns?: string[];
}

export const GeomJitter: React.FC<GeomJitterProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="抖动点图"
      availableAesthetics={availableJitterAesthetics}
      availableParams={availableJitterParams}
    />
  );
};
