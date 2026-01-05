"use client";

import { AnnotateLayer, ParameterConfig } from "../types";
import { linetypeOptions } from "../common/constants";
import { GeomBase } from "./GeomBase";

// Annotate 支持的几何类型
export const annotateGeomTypes = [
  "text",
  "label",
  "rect",
  "segment",
  "pointrange",
  "point",
  "curve",
];

const hjustOptions = ["left", "center", "right", "inward", "outward"];
const vjustOptions = ["top", "middle", "bottom", "inward", "outward"];
const fontFamilyOptions = ["sans", "serif", "mono"];
const fontFaceOptions = ["plain", "bold", "italic", "bold.italic"];

// Annotate 的美学映射（注释通常不使用数据映射）
export const availableAnnotateAesthetics: string[] = [];

// Annotate 的参数配置
export const availableAnnotateParams: ParameterConfig[] = [
  {
    name: "geom",
    type: "select",
    options: annotateGeomTypes,
    default: "text",
    required: true,
  },
  // 位置参数
  {
    name: "x",
    type: "numbers",
    step: 0.1,
  },
  {
    name: "y",
    type: "numbers",
    step: 0.1,
  },
  {
    name: "xmin",
    type: "numbers",
    step: 0.1,
  },
  {
    name: "xmax",
    type: "numbers",
    step: 0.1,
  },
  {
    name: "ymin",
    type: "numbers",
    step: 0.1,
  },
  {
    name: "ymax",
    type: "numbers",
    step: 0.1,
  },
  {
    name: "xend",
    type: "numbers",
    step: 0.1,
  },
  {
    name: "yend",
    type: "numbers",
    step: 0.1,
  },
  // 文本参数
  {
    name: "label",
    type: "strings",
  },
  {
    name: "hjust",
    type: "numbers",
  },
  {
    name: "vjust",
    type: "numbers",
  },
  {
    name: "size",
    type: "numbers",
  },
  {
    name: "angle",
    type: "numbers",
    min: 0,
    max: 360,
    step: 1,
    default: 0,
  },
  {
    name: "family",
    type: "select",
    options: fontFamilyOptions,
    default: "sans",
  },
  {
    name: "fontface",
    type: "select",
    options: fontFaceOptions,
    default: "plain",
  },
  // 样式参数
  {
    name: "colour",
    type: "colors",
  },
  {
    name: "fill",
    type: "colors",
  },
  {
    name: "alpha",
    type: "numbers",
    min: 0,
    max: 1,
  },
  {
    name: "linewidth",
    type: "numbers",
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
    name: "na.rm",
    type: "boolean",
    default: false,
  },
];

interface AnnotateProps {
  params: AnnotateLayer;
  onChange: (layer: AnnotateLayer) => void;
  columns?: string[];
}

export const Annotate: React.FC<AnnotateProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="注释 (Annotate)"
      availableAesthetics={availableAnnotateAesthetics}
      availableParams={availableAnnotateParams}
    />
  );
};
