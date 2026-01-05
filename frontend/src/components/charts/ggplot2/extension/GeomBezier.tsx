"use client";

import { BezierLayer, ParameterConfig } from "../types";
import { GeomBase } from "../layers/GeomBase";

// GeomBoxplot 的参数配置
export const availableBezierAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "alpha",
  "linetype",
  "linewidth",
  "lineend",
];
export const availableBezierParams: ParameterConfig[] = [
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
  {
    name: "n",
    type: "number",
    min: 1,
    step: 1,
    default: 100,
  },
  {
    name: "arrow",
    type: "arrow",
  },
  {
    name: "lineend",
    type: "select",
    options: ["round", "butt", "square"],
    default: "butt",
  },
];

interface GeomBezierProps {
  params: BezierLayer;
  onChange: (params: BezierLayer) => void;
  /** 可选择的列名列表 */
  columns?: string[];
}

export const GeomBezier: React.FC<GeomBezierProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="贝塞尔曲线 (Bezier)"
      availableAesthetics={availableBezierAesthetics}
      availableParams={availableBezierParams}
    />
  );
};
