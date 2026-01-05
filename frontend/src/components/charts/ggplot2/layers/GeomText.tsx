"use client";

import { TextLayer, LabelLayer, ParameterConfig } from "../types";
import { GeomBase } from "./GeomBase";

const sizeUnitOptions = ["pt", "in", "cm", "mm", "pc"];
const hjustOptions = ["left", "center", "right", "inward", "outward"];
const vjustOptions = ["top", "middle", "bottom", "inward", "outward"];
const fontFamilyOptions = ["sans", "serif", "mono"];
const fontFaceOptions = ["plain", "bold", "italic", "bold.italic"];

// GeomText 的美学映射
export const availableTextAesthetics: string[] = [
  "x",
  "y",
  "label",
  "colour",
  "alpha",
  "size",
  "angle",
  "hjust",
  "vjust",
  "family",
  "fontface",
  "group",
];

// GeomText 的参数配置
export const availableTextParams: ParameterConfig[] = [
  {
    name: "parse",
    type: "boolean",
    default: false,
  },
  {
    name: "nudge_x",
    type: "numbers",
    step: 0.1,
    default: 0,
  },
  {
    name: "nudge_y",
    type: "numbers",
    step: 0.1,
    default: 0,
  },
  {
    name: "check_overlap",
    type: "boolean",
    default: false,
  },
  {
    name: "size",
    type: "numbers",
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
    type: "numbers",
  },
  {
    name: "vjust",
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

interface GeomTextProps {
  params: TextLayer;
  onChange: (layer: TextLayer) => void;
  columns?: string[];
}

export const GeomText: React.FC<GeomTextProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="文本 (Text)"
      availableAesthetics={availableTextAesthetics}
      availableParams={availableTextParams}
    />
  );
};

// GeomLabel 的美学映射
export const availableLabelAesthetics: string[] = [
  "label",
  "colour",
  "fill",
  "alpha",
  "size",
  "angle",
  "hjust",
  "vjust",
  "family",
  "fontface",
  "group",
];

// GeomLabel 的参数配置
export const availableLabelParams: ParameterConfig[] = [
  {
    name: "parse",
    type: "boolean",
    default: false,
  },
  {
    name: "nudge_x",
    type: "number",
    step: 0.1,
    default: 0,
  },
  {
    name: "nudge_y",
    type: "number",
    step: 0.1,
    default: 0,
  },
  {
    name: "label.padding",
    type: "number",
    min: 0,
    step: 0.05,
    default: 0.25,
  },
  {
    name: "label.r",
    type: "number",
    min: 0,
    step: 0.05,
    default: 0.15,
  },
  {
    name: "label.size",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.25,
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
    type: "select",
    options: hjustOptions,
    default: "center",
  },
  {
    name: "vjust",
    type: "select",
    options: vjustOptions,
    default: "middle",
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
];

interface GeomLabelProps {
  params: LabelLayer;
  onChange: (layer: LabelLayer) => void;
  columns?: string[];
}

export const GeomLabel: React.FC<GeomLabelProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="标签 (Label)"
      availableAesthetics={availableLabelAesthetics}
      availableParams={availableLabelParams}
    />
  );
};
