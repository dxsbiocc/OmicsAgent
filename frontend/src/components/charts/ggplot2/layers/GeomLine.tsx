"use client";

import { LineLayer, ParameterConfig } from "../types";
import { linetypeOptions } from "../common/constants";
import { GeomBase } from "./GeomBase";

// GeomLine 的参数配置
export const availableLineAesthetics: string[] = [
  "colour",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

export const availableLineParams: ParameterConfig[] = [
  {
    name: "orientation",
    type: "select",
    options: ["x", "y"],
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
    name: "linewidth",
    type: "number",
    min: 0,
  },
  {
    name: "lineend",
    type: "select",
    options: ["round", "butt", "square"],
    default: "butt",
  },
  {
    name: "linejoin",
    type: "select",
    options: ["round", "mitre", "bevel"],
    default: "round",
  },
  {
    name: "linemiter",
    type: "number",
    min: 1,
    step: 0.1,
    default: 10,
  },
  {
    name: "linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
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

interface GeomLineProps {
  params: LineLayer;
  onChange: (layer: LineLayer) => void;
  /** 可选择的列名列表 */
  columns?: string[];
}

export const GeomLine: React.FC<GeomLineProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="折线图"
      availableAesthetics={availableLineAesthetics}
      availableParams={availableLineParams}
    />
  );
};
