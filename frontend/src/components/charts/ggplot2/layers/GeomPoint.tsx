"use client";

import { PointLayer } from "../types";
import { ParameterConfig } from "../types";
import { GeomBase } from "./GeomBase";

interface GeomPointProps {
  params: PointLayer;
  onChange: (layer: PointLayer) => void;
  /** 可选择的列名列表 */
  columns?: string[];
}

const availableAesthetics: string[] = [
  "colour",
  "fill",
  "alpha",
  "size",
  "shape",
  "group",
];

const availableParams: ParameterConfig[] = [
  {
    name: "position",
    type: "position",
    options: [
      "position_dodge",
      "position_dodge2",
      "position_jitter",
      "position_jitterdodge",
      "position_nudge",
    ],
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
    default: 0.7,
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

export const GeomPoint: React.FC<GeomPointProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="散点图"
      availableAesthetics={availableAesthetics}
      availableParams={availableParams}
    />
  );
};
