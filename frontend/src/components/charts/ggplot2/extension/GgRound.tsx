"use client";

import { linetypeOptions } from "../common/constants";
import {
  RoundBoxplotLayer,
  ParameterConfig,
  BaseConfig,
  AestheticConfig,
} from "../types";
import { GeomBase } from "../layers/GeomBase";

// ============== Common Parameters ==============
const commonAesParams: ParameterConfig[] = [
  { name: "colour", type: "color" },
  { name: "fill", type: "color" },
  { name: "alpha", type: "number", min: 0, max: 1, step: 0.01, default: 1 },
  { name: "size", type: "number", min: 0, step: 0.5 },
  {
    name: "linetype",
    type: "select",
    options: linetypeOptions,
  },
  { name: "linewidth", type: "number", min: 0, step: 0.1 },
];

const radiusParam: ParameterConfig = {
  name: "radius",
  type: "number",
  min: 0,
  step: 0.1,
  default: 3,
};

// ============== Layer Types ==============
export interface RoundColLayer extends BaseConfig {
  type: "geom_round_col";
  mapping?: AestheticConfig;
  arguments?: {
    radius?: number;
  } & Record<string, any>;
}

export interface RoundRectLayer extends BaseConfig {
  type: "geom_round_rect";
  mapping?: AestheticConfig;
  arguments?: {
    radius?: number;
  } & Record<string, any>;
}

export interface RoundTileLayer extends BaseConfig {
  type: "geom_round_tile";
  mapping?: AestheticConfig;
  arguments?: {
    radius?: number;
  } & Record<string, any>;
}

export interface RoundBarLayer extends BaseConfig {
  type: "geom_round_bar";
  mapping?: AestheticConfig;
  arguments?: {
    radius?: number;
  } & Record<string, any>;
}

export interface RoundCrossbarLayer extends BaseConfig {
  type: "geom_round_crossbar";
  mapping?: AestheticConfig;
  arguments?: {
    radius?: number;
  } & Record<string, any>;
}

export interface RoundHistogramLayer extends BaseConfig {
  type: "geom_round_histogram";
  mapping?: AestheticConfig;
  arguments?: {
    radius?: number;
  } & Record<string, any>;
}

export interface HalfRoundBoxplotLayer extends BaseConfig {
  type: "geom_half_round_boxplot";
  mapping?: AestheticConfig;
  arguments?: {
    radius?: number;
    side?: "left" | "right" | "top" | "bottom";
  } & Record<string, any>;
}

// ============== Aesthetics ==============
const roundColAesthetics: string[] = [
  "colour",
  "fill",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

const roundRectAesthetics: string[] = [
  "xmin",
  "xmax",
  "ymin",
  "ymax",
  "colour",
  "fill",
  "alpha",
  "linetype",
  "linewidth",
];

const roundTileAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "width",
  "height",
  "linetype",
  "linewidth",
];

const roundBarAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

const roundCrossbarAesthetics: string[] = [
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
];

const roundHistogramAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

const halfRoundBoxplotAesthetics: string[] = [
  "colour",
  "fill",
  "alpha",
  "size",
  "shape",
  "group",
  "linetype",
  "linewidth",
  "radius",
];

// ============== Parameters ==============
// Round Col Parameters (based on geom_col)
export const availableRoundColParams: ParameterConfig[] = [
  radiusParam,
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
  ...commonAesParams,
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

// Round Rect Parameters (based on geom_rect)
export const availableRoundRectParams: ParameterConfig[] = [
  radiusParam,
  ...commonAesParams,
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

// Round Tile Parameters (based on geom_tile)
export const availableRoundTileParams: ParameterConfig[] = [
  radiusParam,
  { name: "width", type: "number", min: 0, step: 0.1 },
  { name: "height", type: "number", min: 0, step: 0.1 },
  ...commonAesParams,
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

// Round Bar Parameters (based on geom_bar)
export const availableRoundBarParams: ParameterConfig[] = [
  radiusParam,
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
  {
    name: "position",
    type: "position",
    options: ["position_stack", "position_dodge", "position_fill"],
  },
  { name: "width", type: "number", min: 0, step: 0.1 },
  ...commonAesParams,
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

// Round Crossbar Parameters (based on geom_crossbar)
export const availableRoundCrossbarParams: ParameterConfig[] = [
  radiusParam,
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
    default: { type: "position_dodge", arguments: {} },
  },
  {
    name: "fatten",
    type: "number",
    min: 0,
    step: 0.1,
    default: 2.5,
  },
  {
    name: "width",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  ...commonAesParams,
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

// Round Histogram Parameters (based on geom_histogram)
export const availableRoundHistogramParams: ParameterConfig[] = [
  radiusParam,
  { name: "bins", type: "number", min: 1, step: 1, default: 30 },
  { name: "binwidth", type: "number", min: 0, step: 0.1 },
  { name: "center", type: "number" },
  { name: "boundary", type: "number" },
  ...commonAesParams,
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

// GeomRoundBoxplot Parameters (existing, kept for compatibility)
export const availableRoundBoxplotAesthetics: string[] = [
  "colour",
  "fill",
  "alpha",
  "size",
  "shape",
  "group",
  "linetype",
  "linewidth",
  "radius",
];

export const availableRoundBoxplotParams: ParameterConfig[] = [
  {
    name: "position",
    type: "position",
    options: ["position_dodge", "position_dodge2", "position_nudge"],
    default: "position_dodge2",
  },
  radiusParam,
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
    name: "orientation",
    type: "select",
    options: ["vertical", "horizontal"],
    default: "vertical",
  },
  {
    name: "notchwidth",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.5,
    disabled: (allParams, currentParamName) => {
      const notchParam = allParams.find((p) => p.name === "notch");
      if (!notchParam) return true;
      const notchValue =
        typeof notchParam.value === "boolean"
          ? notchParam.value
          : notchParam.value === true || notchParam.value === "true";
      return !notchValue;
    },
  },
  {
    name: "notch",
    type: "boolean",
    default: false,
  },
  {
    name: "varwidth",
    type: "boolean",
    default: false,
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
    name: "outliers",
    type: "boolean",
  },
  {
    name: "outliers_colour",
    type: "color",
  },
  {
    name: "outliers.fill",
    type: "color",
  },
  {
    name: "outliers.shape",
    type: "number",
    min: 0,
    max: 25,
    step: 1,
    default: 19,
  },
  {
    name: "outliers.size",
    type: "number",
    min: 0,
    step: 0.1,
    default: 1.5,
  },
  {
    name: "outliers.stroke",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "outliers.alpha",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 1,
  },
  {
    name: "whisker.colour",
    type: "color",
  },
  {
    name: "whisker.linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "whisker.linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "staple.colour",
    type: "color",
  },
  {
    name: "staple.linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "staple.linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "median.colour",
    type: "color",
  },
  {
    name: "median.linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "median.linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "box.colour",
    type: "color",
  },
  {
    name: "box.linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "box.linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
];

// Half Round Boxplot Parameters (based on geom_round_boxplot + side)
export const availableHalfRoundBoxplotParams: ParameterConfig[] = [
  radiusParam,
  {
    name: "side",
    type: "select",
    options: ["left", "right", "top", "bottom"],
    default: "left",
  },
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
    name: "orientation",
    type: "select",
    options: ["vertical", "horizontal"],
    default: "vertical",
  },
  {
    name: "notchwidth",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.5,
    disabled: (allParams, currentParamName) => {
      const notchParam = allParams.find((p) => p.name === "notch");
      if (!notchParam) return true;
      const notchValue =
        typeof notchParam.value === "boolean"
          ? notchParam.value
          : notchParam.value === true || notchParam.value === "true";
      return !notchValue;
    },
  },
  {
    name: "notch",
    type: "boolean",
    default: false,
  },
  {
    name: "varwidth",
    type: "boolean",
    default: false,
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
    name: "outliers",
    type: "boolean",
  },
  {
    name: "outliers_colour",
    type: "color",
  },
  {
    name: "outliers.fill",
    type: "color",
  },
  {
    name: "outliers.shape",
    type: "number",
    min: 0,
    max: 25,
    step: 1,
    default: 19,
  },
  {
    name: "outliers.size",
    type: "number",
    min: 0,
    step: 0.1,
    default: 1.5,
  },
  {
    name: "outliers.stroke",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "outliers.alpha",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 1,
  },
  {
    name: "whisker.colour",
    type: "color",
  },
  {
    name: "whisker.linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "whisker.linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "staple.colour",
    type: "color",
  },
  {
    name: "staple.linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "staple.linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "median.colour",
    type: "color",
  },
  {
    name: "median.linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "median.linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "box.colour",
    type: "color",
  },
  {
    name: "box.linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "box.linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
];

// ============== Components ==============
interface GeomRoundBoxplotProps {
  params: RoundBoxplotLayer;
  onChange: (params: RoundBoxplotLayer) => void;
  columns?: string[];
}

export const GeomRoundBoxplot: React.FC<GeomRoundBoxplotProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="圆角箱线图"
      availableAesthetics={availableRoundBoxplotAesthetics}
      availableParams={availableRoundBoxplotParams}
    />
  );
};

interface GeomRoundColProps {
  params: RoundColLayer;
  onChange: (params: RoundColLayer) => void;
  columns?: string[];
}

export const GeomRoundCol: React.FC<GeomRoundColProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="圆角柱状图 (geom_round_col)"
      availableAesthetics={roundColAesthetics}
      availableParams={availableRoundColParams}
    />
  );
};

interface GeomRoundRectProps {
  params: RoundRectLayer;
  onChange: (params: RoundRectLayer) => void;
  columns?: string[];
}

export const GeomRoundRect: React.FC<GeomRoundRectProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="圆角矩形 (geom_round_rect)"
      availableAesthetics={roundRectAesthetics}
      availableParams={availableRoundRectParams}
    />
  );
};

interface GeomRoundTileProps {
  params: RoundTileLayer;
  onChange: (params: RoundTileLayer) => void;
  columns?: string[];
}

export const GeomRoundTile: React.FC<GeomRoundTileProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="圆角瓦片 (geom_round_tile)"
      availableAesthetics={roundTileAesthetics}
      availableParams={availableRoundTileParams}
    />
  );
};

interface GeomRoundBarProps {
  params: RoundBarLayer;
  onChange: (params: RoundBarLayer) => void;
  columns?: string[];
}

export const GeomRoundBar: React.FC<GeomRoundBarProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="圆角条形图 (geom_round_bar)"
      availableAesthetics={roundBarAesthetics}
      availableParams={availableRoundBarParams}
    />
  );
};

interface GeomRoundCrossbarProps {
  params: RoundCrossbarLayer;
  onChange: (params: RoundCrossbarLayer) => void;
  columns?: string[];
}

export const GeomRoundCrossbar: React.FC<GeomRoundCrossbarProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="圆角交叉条 (geom_round_crossbar)"
      availableAesthetics={roundCrossbarAesthetics}
      availableParams={availableRoundCrossbarParams}
    />
  );
};

interface GeomRoundHistogramProps {
  params: RoundHistogramLayer;
  onChange: (params: RoundHistogramLayer) => void;
  columns?: string[];
}

export const GeomRoundHistogram: React.FC<GeomRoundHistogramProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="圆角直方图 (geom_round_histogram)"
      availableAesthetics={roundHistogramAesthetics}
      availableParams={availableRoundHistogramParams}
    />
  );
};

interface GeomHalfRoundBoxplotProps {
  params: HalfRoundBoxplotLayer;
  onChange: (params: HalfRoundBoxplotLayer) => void;
  columns?: string[];
}

export const GeomHalfRoundBoxplot: React.FC<GeomHalfRoundBoxplotProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="半圆角箱线图 (geom_half_round_boxplot)"
      availableAesthetics={halfRoundBoxplotAesthetics}
      availableParams={availableHalfRoundBoxplotParams}
    />
  );
};
