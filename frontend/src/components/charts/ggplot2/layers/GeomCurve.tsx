"use client";

import { CurveLayer, ParameterConfig } from "../types";
import { linetypeOptions, lineendOptions } from "../common/constants";
import { GeomBase } from "./GeomBase";

// GeomCurve 的美学映射
export const availableCurveAesthetics: string[] = [
  "x",
  "y",
  "xend",
  "yend",
  "colour",
  "alpha",
  "linetype",
  "linewidth",
  "group",
];

// GeomCurve 的参数配置
export const availableCurveParams: ParameterConfig[] = [
  {
    name: "curvature",
    type: "number",
    step: 0.1,
    default: 0.5,
  },
  {
    name: "angle",
    type: "number",
    min: 0,
    max: 180,
    step: 1,
    default: 90,
  },
  {
    name: "ncp",
    type: "number",
    min: 1,
    step: 1,
    default: 5,
  },
  {
    name: "linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "lineend",
    type: "select",
    options: lineendOptions,
    default: "butt",
  },
  {
    name: "colour",
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
    name: "arrow",
    type: "arrow",
  },
  {
    name: "arrow.fill",
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

interface GeomCurveProps {
  params: CurveLayer;
  onChange: (layer: CurveLayer) => void;
  columns?: string[];
}

export const GeomCurve: React.FC<GeomCurveProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="曲线 (Curve)"
      availableAesthetics={availableCurveAesthetics}
      availableParams={availableCurveParams}
    />
  );
};
