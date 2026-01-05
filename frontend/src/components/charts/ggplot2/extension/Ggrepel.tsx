"use client";

import { ParameterConfig, BaseConfig, AestheticConfig } from "../types";
import { GeomBase } from "../layers/GeomBase";
import { linetypeOptions } from "../common/constants";

const sizeUnitOptions = ["pt", "in", "cm", "mm", "pc"];
const hjustOptions = ["left", "center", "right", "inward", "outward"];
const vjustOptions = ["top", "middle", "bottom", "inward", "outward"];
const fontFamilyOptions = ["sans", "serif", "mono"];
const fontFaceOptions = ["plain", "bold", "italic", "bold.italic"];

// GeomTextRepel Layer Type
export interface TextRepelLayer extends BaseConfig {
  type: "geom_text_repel";
  mapping?: AestheticConfig;
  arguments?: Record<string, any>;
}

// GeomLabelRepel Layer Type
export interface LabelRepelLayer extends BaseConfig {
  type: "geom_label_repel";
  mapping?: AestheticConfig;
  arguments?: Record<string, any>;
}

// GeomTextRepel 的美学映射
export const availableTextRepelAesthetics: string[] = [
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

// GeomTextRepel 的参数配置（继承自 geom_text + ggrepel 特定参数）
export const availableTextRepelParams: ParameterConfig[] = [
  // custom parameters
  {
    name: "top",
    type: "string",
    default: "",
  },
  {
    name: "top.k",
    type: "number",
    min: 0,
    step: 1,
    default: 10,
  },
  // Basic text parameters (from geom_text)
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
  },
  {
    name: "vjust",
    type: "number",
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
  // ggrepel specific parameters
  {
    name: "box.padding",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.25,
  },
  {
    name: "point.padding",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0,
  },
  {
    name: "segment.color",
    type: "color",
  },
  {
    name: "segment.size",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "segment.linetype",
    type: "select",
    options: linetypeOptions,
  },
  {
    name: "segment.alpha",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    name: "segment.curvature",
    type: "number",
    step: 0.1,
    default: 0,
  },
  {
    name: "segment.angle",
    type: "number",
    min: 0,
    max: 90,
    step: 1,
    default: 90,
  },
  {
    name: "segment.ncp",
    type: "number",
    min: 1,
    step: 1,
    default: 3,
  },
  {
    name: "min.segment.length",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "arrow",
    type: "arrow",
  },
  {
    name: "force",
    type: "number",
    min: 0,
    step: 0.1,
    default: 1,
  },
  {
    name: "force_pull",
    type: "number",
    min: 0,
    step: 0.1,
    default: 1,
  },
  {
    name: "max.iter",
    type: "number",
    min: 1,
    step: 1,
    default: 10000,
  },
  {
    name: "direction",
    type: "select",
    options: ["both", "x", "y"],
    default: "both",
  },
  {
    name: "seed",
    type: "number",
  },
  {
    name: "verbose",
    type: "boolean",
    default: false,
  },
];

// GeomLabelRepel 的美学映射
export const availableLabelRepelAesthetics: string[] = [
  "x",
  "y",
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

// GeomLabelRepel 的参数配置（继承自 geom_label + ggrepel 特定参数）
export const availableLabelRepelParams: ParameterConfig[] = [
  // custom parameters
  {
    name: "top",
    type: "string",
    default: "",
  },
  {
    name: "top.k",
    type: "number",
    min: 0,
    step: 1,
    default: 10,
  },
  // Basic label parameters (from geom_label)
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
  // ggrepel specific parameters (same as text_repel)
  {
    name: "box.padding",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.25,
  },
  {
    name: "point.padding",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0,
  },
  {
    name: "segment.color",
    type: "color",
  },
  {
    name: "segment.size",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "segment.linetype",
    type: "select",
    options: linetypeOptions,
  },
  {
    name: "segment.alpha",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    name: "segment.curvature",
    type: "number",
    step: 0.1,
    default: 0,
  },
  {
    name: "segment.angle",
    type: "number",
    min: 0,
    max: 90,
    step: 1,
    default: 90,
  },
  {
    name: "segment.ncp",
    type: "number",
    min: 1,
    step: 1,
    default: 3,
  },
  {
    name: "min.segment.length",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "arrow",
    type: "arrow",
  },
  {
    name: "force",
    type: "number",
    min: 0,
    step: 0.1,
    default: 1,
  },
  {
    name: "force_pull",
    type: "number",
    min: 0,
    step: 0.1,
    default: 1,
  },
  {
    name: "max.iter",
    type: "number",
    min: 1,
    step: 1,
    default: 10000,
  },
  {
    name: "direction",
    type: "select",
    options: ["both", "x", "y"],
    default: "both",
  },
  {
    name: "seed",
    type: "number",
  },
  {
    name: "verbose",
    type: "boolean",
    default: false,
  },
];

interface GeomTextRepelProps {
  params: TextRepelLayer;
  onChange: (params: TextRepelLayer) => void;
  columns?: string[];
}

export const GeomTextRepel: React.FC<GeomTextRepelProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="文本避让 (Text Repel)"
      availableAesthetics={availableTextRepelAesthetics}
      availableParams={availableTextRepelParams}
    />
  );
};

interface GeomLabelRepelProps {
  params: LabelRepelLayer;
  onChange: (params: LabelRepelLayer) => void;
  columns?: string[];
}

export const GeomLabelRepel: React.FC<GeomLabelRepelProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="标签避让 (Label Repel)"
      availableAesthetics={availableLabelRepelAesthetics}
      availableParams={availableLabelRepelParams}
    />
  );
};
