"use client";

import { ColLayer, ParameterConfig } from "../types";
import { linetypeOptions } from "../common/constants";
import { GeomBase } from "./GeomBase";

// GeomCol 的参数配置
export const availableColAesthetics: string[] = [
  "colour",
  "fill",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

export const availableColParams: ParameterConfig[] = [
  {
    name: "position",
    type: "position",
    options: [
      "position_dodge",
      "position_dodge2",
      "position_stack",
      "position_fill",
    ],
    default: { type: "position_dodge", arguments: {} },
  },
  {
    name: "width",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.9,
  },
  {
    name: "just",
    type: "number",
    default: 0.5,
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
    default: "mitre",
  },
  {
    name: "fill",
    type: "color",
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
    name: "linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
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

interface GeomColProps {
  params: ColLayer;
  onChange: (layer: ColLayer) => void;
  /** 可选择的列名列表 */
  columns?: string[];
}

export const GeomCol: React.FC<GeomColProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="柱状图"
      availableAesthetics={availableColAesthetics}
      availableParams={availableColParams}
    />
  );
};
