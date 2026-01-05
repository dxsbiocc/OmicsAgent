"use client";

import { TextpathLayer, ParameterConfig } from "../types";
import { GeomBase } from "../layers/GeomBase";
import { linetypeOptions } from "../common/constants";

// Re-export TextpathLayer for convenience
export type { TextpathLayer };

const sizeUnitOptions = ["pt", "in", "cm", "mm", "pc"];
const halignOptions = ["center", "left", "right"];
const fontFamilyOptions = ["sans", "serif", "mono"];
const fontFaceOptions = ["plain", "bold", "italic", "bold.italic"];

// GeomTextpath 的美学映射
export const availableTextpathAesthetics: string[] = [
  "x",
  "y",
  "label",
  "colour",
  "color",
  "alpha",
  "size",
  "angle",
  "hjust",
  "vjust",
  "family",
  "fontface",
  "linewidth",
  "linetype",
  "group",
];

// GeomTextpath 的参数配置
export const availableTextpathParams: ParameterConfig[] = [
  {
    name: "text_only",
    type: "boolean",
    default: false,
  },
  {
    name: "gap",
    type: "boolean",
    default: false,
  },
  {
    name: "upright",
    type: "boolean",
    default: true,
  },
  {
    name: "halign",
    type: "select",
    options: halignOptions,
    default: "center",
  },
  {
    name: "offset",
    type: "number",
    step: 0.1,
  },
  {
    name: "parse",
    type: "boolean",
    default: false,
  },
  {
    name: "straight",
    type: "boolean",
    default: false,
  },
  {
    name: "padding",
    type: "number",
    min: 0,
    step: 0.01,
    default: 0.05,
  },
  {
    name: "text_smoothing",
    type: "number",
    min: 0,
    max: 100,
    step: 1,
    default: 0,
  },
  {
    name: "rich",
    type: "boolean",
    default: false,
  },
  {
    name: "remove_long",
    type: "boolean",
    default: false,
  },
  {
    name: "size",
    type: "number",
    min: 0,
    step: 0.1,
    default: 3.88,
  },
  {
    name: "size.unit",
    type: "select",
    options: sizeUnitOptions,
    default: "pt",
  },
  {
    name: "hjust",
    type: "number",
    step: 0.1,
  },
  {
    name: "vjust",
    type: "number",
    step: 0.1,
  },
  {
    name: "angle",
    type: "number",
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
  {
    name: "colour",
    type: "color",
  },
  {
    name: "color",
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
    name: "linewidth",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "linetype",
    type: "select",
    options: linetypeOptions,
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

interface GeomTextpathProps {
  params: TextpathLayer;
  onChange: (params: TextpathLayer) => void;
  /** 可选择的列名列表 */
  columns?: string[];
}

export const GeomTextpath: React.FC<GeomTextpathProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="路径文本 (geom_textpath)"
      availableAesthetics={availableTextpathAesthetics}
      availableParams={availableTextpathParams}
    />
  );
};
