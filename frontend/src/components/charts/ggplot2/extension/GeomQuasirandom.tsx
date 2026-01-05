"use client";

import {
  BaseConfig,
  ParameterConfig,
  AestheticConfig,
  BaseLayerArguments,
} from "../types";
import { GeomBase } from "../layers/GeomBase";

// Type definition
export interface QuasirandomLayer extends BaseConfig {
  type: "geom_quasirandom";
  mapping?: AestheticConfig;
  arguments?: {
    width?: number;
    varwidth?: boolean;
    bandwidth?: number;
    nbins?: number;
    method?: string;
    groupOnX?: boolean;
    "dodge.width"?: number;
    orientation?: "x" | "y";
  } & BaseLayerArguments;
}

// Aesthetics
const quasirandomAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "size",
  "shape",
  "stroke",
  "group",
];

// Parameters
const quasirandomParams: ParameterConfig[] = [
  {
    name: "width",
    type: "number",
    min: 0,
    step: 0.05,
    default: 0.4,
  },
  {
    name: "varwidth",
    type: "boolean",
    default: false,
  },
  {
    name: "bandwidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "nbins",
    type: "number",
    min: 1,
    step: 1,
  },
  {
    name: "method",
    type: "select",
    options: [
      "quasirandom",
      "pseudorandom",
      "smiley",
      "maxout",
      "frowney",
      "minout",
      "tukey",
      "tukeyDense",
    ],
    default: "quasirandom",
  },
  {
    name: "groupOnX",
    type: "boolean",
  },
  {
    name: "dodge.width",
    type: "number",
    min: 0,
    step: 0.05,
    default: 0,
  },
  {
    name: "size",
    type: "number",
    min: 0,
    step: 0.5,
    default: 1.5,
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

interface GeomQuasirandomProps {
  params: QuasirandomLayer;
  onChange: (params: QuasirandomLayer) => void;
  columns?: string[];
}

export const GeomQuasirandom: React.FC<GeomQuasirandomProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="准随机散点 (Quasirandom)"
      availableAesthetics={quasirandomAesthetics}
      availableParams={quasirandomParams}
    />
  );
};
