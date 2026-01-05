"use client";

import {
  ParameterConfig,
  CrossbarLayer,
  ErrorbarLayer,
  LinerangeLayer,
  PointrangeLayer,
  ErrorbarhLayer,
} from "../types";
import { linetypeOptions } from "../common/constants";
import { GeomBase } from "./GeomBase";

// ============== Aesthetics ==============
const crossbarAesthetics: string[] = [
  "x",
  "ymin",
  "ymax",
  "colour",
  "fill",
  "alpha",
  "linetype",
  "linewidth",
  "group",
  "y",
  "xmin",
  "xmax",
];

const errorbarAesthetics: string[] = [
  "x",
  "ymin",
  "ymax",
  "colour",
  "alpha",
  "linetype",
  "linewidth",
  "width",
  "group",
  "y",
  "xmin",
  "xmax",
];

const linerangeAesthetics: string[] = [
  "x",
  "ymin",
  "ymax",
  "colour",
  "alpha",
  "linetype",
  "linewidth",
  "group",
  "size",
  "y",
  "xmin",
  "xmax",
];

const pointrangeAesthetics: string[] = [
  "x",
  "y",
  "ymin",
  "ymax",
  "colour",
  "fill",
  "alpha",
  "linetype",
  "linewidth",
  "size",
  "shape",
  "group",
  "y",
  "xmin",
  "xmax",
];

const errorbarhAesthetics: string[] = [
  "y",
  "xmin",
  "xmax",
  "colour",
  "alpha",
  "linetype",
  "linewidth",
  "height",
  "group",
];

// ============== Parameters ==============
const crossbarParams: ParameterConfig[] = [
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
  { name: "fatten", type: "number", min: 0, step: 0.5, default: 2.5 },
  { name: "width", type: "number", min: 0, step: 0.05, default: 0.9 },
  { name: "linewidth", type: "number", min: 0, step: 0.1, default: 0.5 },
  {
    name: "linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  { name: "colour", type: "color" },
  { name: "orientation", type: "select", options: ["x", "y"] },
  { name: "fill", type: "color" },
  { name: "alpha", type: "number", min: 0, max: 1, step: 0.01, default: 1 },
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const errorbarParams: ParameterConfig[] = [
  {
    name: "stat",
    type: "select",
    options: ["summary", "count", "identity"],
    default: "identity",
  },
  {
    name: "fun",
    type: "string",
  },
  {
    name: "fun.data",
    type: "string",
  },
  { name: "width", type: "number", min: 0, step: 0.05, default: 0.5 },
  { name: "linewidth", type: "number", min: 0, step: 0.1, default: 0.5 },
  {
    name: "linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  { name: "colour", type: "color" },
  { name: "alpha", type: "number", min: 0, max: 1, step: 0.01, default: 1 },
  { name: "orientation", type: "select", options: ["x", "y"] },
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const linerangeParams: ParameterConfig[] = [
  { name: "linewidth", type: "number", min: 0, step: 0.1, default: 0.5 },
  {
    name: "linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  { name: "colour", type: "color" },
  { name: "alpha", type: "number", min: 0, max: 1, step: 0.01, default: 1 },
  { name: "orientation", type: "select", options: ["x", "y"] },
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const pointrangeParams: ParameterConfig[] = [
  { name: "fatten", type: "number", min: 0, step: 0.5, default: 4 },
  { name: "linewidth", type: "number", min: 0, step: 0.1, default: 0.5 },
  {
    name: "linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  { name: "size", type: "number", min: 0, step: 0.5, default: 1.5 },
  { name: "shape", type: "number", min: 0, max: 25, step: 1, default: 19 },
  { name: "stroke", type: "number", min: 0, step: 0.1, default: 0.5 },
  { name: "colour", type: "color" },
  { name: "fill", type: "color" },
  { name: "alpha", type: "number", min: 0, max: 1, step: 0.01, default: 1 },
  { name: "orientation", type: "select", options: ["x", "y"] },
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const errorbarhParams: ParameterConfig[] = [
  { name: "height", type: "number", min: 0, step: 0.05, default: 0.5 },
  { name: "linewidth", type: "number", min: 0, step: 0.1, default: 0.5 },
  {
    name: "linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  { name: "colour", type: "color" },
  { name: "alpha", type: "number", min: 0, max: 1, step: 0.01, default: 1 },
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

// ============== Components ==============
interface GeomCrossbarProps {
  params: CrossbarLayer;
  onChange: (layer: CrossbarLayer) => void;
  columns?: string[];
}

export const GeomCrossbar: React.FC<GeomCrossbarProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="交叉条 (Crossbar)"
    availableAesthetics={crossbarAesthetics}
    availableParams={crossbarParams}
  />
);

interface GeomErrorbarProps {
  params: ErrorbarLayer;
  onChange: (layer: ErrorbarLayer) => void;
  columns?: string[];
}

export const GeomErrorbar: React.FC<GeomErrorbarProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="误差条 (Errorbar)"
    availableAesthetics={errorbarAesthetics}
    availableParams={errorbarParams}
  />
);

interface GeomLinerangeProps {
  params: LinerangeLayer;
  onChange: (layer: LinerangeLayer) => void;
  columns?: string[];
}

export const GeomLinerange: React.FC<GeomLinerangeProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="线段范围 (Linerange)"
    availableAesthetics={linerangeAesthetics}
    availableParams={linerangeParams}
  />
);

interface GeomPointrangeProps {
  params: PointrangeLayer;
  onChange: (layer: PointrangeLayer) => void;
  columns?: string[];
}

export const GeomPointrange: React.FC<GeomPointrangeProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="点范围 (Pointrange)"
    availableAesthetics={pointrangeAesthetics}
    availableParams={pointrangeParams}
  />
);

interface GeomErrorbarhProps {
  params: ErrorbarhLayer;
  onChange: (layer: ErrorbarhLayer) => void;
  columns?: string[];
}

export const GeomErrorbarh: React.FC<GeomErrorbarhProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="水平误差条 (Errorbarh)"
    availableAesthetics={errorbarhAesthetics}
    availableParams={errorbarhParams}
  />
);
