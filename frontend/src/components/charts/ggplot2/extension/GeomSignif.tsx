"use client";

import { SignifLayer, ParameterConfig } from "../types";
import { GeomBase } from "../layers/GeomBase";

// GeomBoxplot 的参数配置
export const availableSignifAesthetics: string[] = [
  "colour",
  "fill",
  "alpha",
  "size",
  "shape",
  "group",
  "linetype",
  "linewidth",
];
export const availableSignifParams: ParameterConfig[] = [
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
    name: "comparisons",
    type: "string",
  },
  {
    name: "test",
    type: "select",
    options: ["wilcox.test", "t.test"],
    default: "wilcox.test",
  },
  {
    name: "test.args",
    type: "list",
  },
  {
    name: "annotations",
    type: "strings",
  },
  {
    name: "map_signif_level",
    type: "string",
  },
  {
    name: "step_increase",
    type: "numbers",
  },
  {
    name: "margin_top",
    type: "numbers",
  },
  {
    name: "y_position",
    type: "numbers",
  },
  {
    name: "xmin",
    type: "numbers",
  },
  {
    name: "xmax",
    type: "numbers",
  },
  {
    name: "tip_length",
    type: "numbers",
  },
  {
    name: "size",
    type: "number",
  },
  {
    name: "textsize",
    type: "number",
  },
  {
    name: "family",
    type: "select",
    options: ["sans", "serif", "mono"],
  },
  {
    name: "vjust",
    type: "number",
  },
  {
    name: "orientation",
    type: "select",
    options: ["x", "y"],
  },
  {
    name: "extend_line",
    type: "number",
    default: 0,
  },
];

interface GeomSignifProps {
  params: SignifLayer;
  onChange: (params: SignifLayer) => void;
  /** 可选择的列名列表 */
  columns?: string[];
}

export const GeomSignif: React.FC<GeomSignifProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="显著性检验"
      availableAesthetics={availableSignifAesthetics}
      availableParams={availableSignifParams}
    />
  );
};
