"use client";

import { WaffleLayer, ParameterConfig } from "../types";
import { GeomBase } from "../layers/GeomBase";

// GeomWaffle 的美学映射
export const availableWaffleAesthetics: string[] = [
  "values",
  "fill",
  "colour",
  "color",
  "alpha",
  "group",
];

// GeomWaffle 的参数配置
export const availableWaffleParams: ParameterConfig[] = [
  {
    name: "n_rows",
    type: "number",
    min: 1,
    step: 1,
    default: 10,
  },
  {
    name: "make_proportional",
    type: "boolean",
    default: false,
  },
  {
    name: "flip",
    type: "boolean",
    default: false,
  },
  {
    name: "radius",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0,
  },
  {
    name: "color",
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

interface GeomWaffleProps {
  params: WaffleLayer;
  onChange: (params: WaffleLayer) => void;
  /** 可选择的列名列表 */
  columns?: string[];
}

export const GeomWaffle: React.FC<GeomWaffleProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="华夫饼图 (geom_waffle)"
      availableAesthetics={availableWaffleAesthetics}
      availableParams={availableWaffleParams}
    />
  );
};

// Re-export WaffleLayer for convenience
export type { WaffleLayer };
