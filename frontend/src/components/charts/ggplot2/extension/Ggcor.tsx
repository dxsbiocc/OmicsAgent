"use client";

import {
  GgcorLinkLayer,
  GgcorMarkLayer,
  GgcorNumberLayer,
  GgcorPie2Layer,
  GgcorRingLayer,
  GgcorShadeLayer,
  GgcorSquareLayer,
  GgcorStarLayer,
  GgcorAddLinkLayer,
  GgcorCrossLayer,
  ParameterConfig,
} from "../types";
import { GeomBase } from "../layers/GeomBase";
import { linetypeOptions, lineendOptions } from "../common/constants";

const fontFaceOptions = ["plain", "bold", "italic", "bold.italic"];

// ========== geom_link ==========
export const availableGgcorLinkAesthetics: string[] = [
  "x",
  "y",
  "xend",
  "yend",
  "colour",
  "color",
  "alpha",
  "linetype",
  "linewidth",
  "group",
];

export const availableGgcorLinkParams: ParameterConfig[] = [
  {
    name: "type",
    type: "select",
    options: ["upper", "lower", "full"],
  },
  {
    name: "curvature",
    type: "number",
    step: 0.1,
    default: 0.5,
  },
  {
    name: "angle",
    type: "number",
    min: 0,
    max: 180,
    step: 1,
    default: 90,
  },
  {
    name: "ncp",
    type: "number",
    min: 1,
    step: 1,
    default: 5,
  },
  {
    name: "arrow",
    type: "arrow",
  },
  {
    name: "lineend",
    type: "select",
    options: lineendOptions,
    default: "butt",
  },
  {
    name: "linejoin",
    type: "select",
    options: ["round", "mitre", "bevel"],
    default: "round",
  },
  {
    name: "linemitre",
    type: "number",
    min: 1,
    step: 1,
    default: 10,
  },
  {
    name: "linewidth",
    type: "number",
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

interface GeomGgcorLinkProps {
  params: GgcorLinkLayer;
  onChange: (params: GgcorLinkLayer) => void;
  columns?: string[];
}

export const GeomGgcorLink: React.FC<GeomGgcorLinkProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="连接 (geom_link)"
      availableAesthetics={availableGgcorLinkAesthetics}
      availableParams={availableGgcorLinkParams}
    />
  );
};

export type { GgcorLinkLayer };

// ========== geom_mark ==========
export const availableGgcorMarkAesthetics: string[] = [
  "x",
  "y",
  "fill",
  "colour",
  "color",
  "alpha",
  "size",
  "shape",
  "group",
];

export const availableGgcorMarkParams: ParameterConfig[] = [
  {
    name: "type",
    type: "select",
    options: ["upper", "lower", "full"],
  },
  {
    name: "shape",
    type: "number",
    min: 0,
    max: 25,
    step: 1,
  },
  {
    name: "size",
    type: "number",
    min: 0,
    step: 0.1,
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

interface GeomGgcorMarkProps {
  params: GgcorMarkLayer;
  onChange: (params: GgcorMarkLayer) => void;
  columns?: string[];
}

export const GeomGgcorMark: React.FC<GeomGgcorMarkProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="标记 (geom_mark)"
      availableAesthetics={availableGgcorMarkAesthetics}
      availableParams={availableGgcorMarkParams}
    />
  );
};

export type { GgcorMarkLayer };

// ========== geom_number ==========
export const availableGgcorNumberAesthetics: string[] = [
  "x",
  "y",
  "num",
  "colour",
  "color",
  "alpha",
  "size",
  "family",
  "fontface",
  "group",
];

export const availableGgcorNumberParams: ParameterConfig[] = [
  {
    name: "type",
    type: "select",
    options: ["upper", "lower", "full"],
  },
  {
    name: "num",
    type: "string",
  },
  {
    name: "digits",
    type: "number",
    min: 0,
    max: 10,
    step: 1,
    default: 2,
  },
  {
    name: "size",
    type: "number",
    min: 0,
    step: 0.1,
    default: 3.88,
  },
  {
    name: "family",
    type: "select",
    options: ["sans", "serif", "mono"],
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

interface GeomGgcorNumberProps {
  params: GgcorNumberLayer;
  onChange: (params: GgcorNumberLayer) => void;
  columns?: string[];
}

export const GeomGgcorNumber: React.FC<GeomGgcorNumberProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="数字 (geom_number)"
      availableAesthetics={availableGgcorNumberAesthetics}
      availableParams={availableGgcorNumberParams}
    />
  );
};

export type { GgcorNumberLayer };

// ========== geom_pie2 ==========
export const availableGgcorPie2Aesthetics: string[] = [
  "x",
  "y",
  "fill",
  "colour",
  "color",
  "alpha",
  "size",
  "group",
];

export const availableGgcorPie2Params: ParameterConfig[] = [
  {
    name: "type",
    type: "select",
    options: ["upper", "lower", "full"],
  },
  {
    name: "r0",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "r1",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "start",
    type: "number",
    step: 0.1,
  },
  {
    name: "end",
    type: "number",
    step: 0.1,
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

interface GeomGgcorPie2Props {
  params: GgcorPie2Layer;
  onChange: (params: GgcorPie2Layer) => void;
  columns?: string[];
}

export const GeomGgcorPie2: React.FC<GeomGgcorPie2Props> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="饼图2 (geom_pie2)"
      availableAesthetics={availableGgcorPie2Aesthetics}
      availableParams={availableGgcorPie2Params}
    />
  );
};

export type { GgcorPie2Layer };

// ========== geom_ring ==========
export const availableGgcorRingAesthetics: string[] = [
  "x",
  "y",
  "fill",
  "colour",
  "color",
  "alpha",
  "size",
  "linetype",
  "linewidth",
  "group",
];

export const availableGgcorRingParams: ParameterConfig[] = [
  {
    name: "type",
    type: "select",
    options: ["upper", "lower", "full"],
  },
  {
    name: "r0",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "r1",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "start",
    type: "number",
    step: 0.1,
  },
  {
    name: "end",
    type: "number",
    step: 0.1,
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

interface GeomGgcorRingProps {
  params: GgcorRingLayer;
  onChange: (params: GgcorRingLayer) => void;
  columns?: string[];
}

export const GeomGgcorRing: React.FC<GeomGgcorRingProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="环形 (geom_ring)"
      availableAesthetics={availableGgcorRingAesthetics}
      availableParams={availableGgcorRingParams}
    />
  );
};

export type { GgcorRingLayer };

// ========== geom_shade ==========
export const availableGgcorShadeAesthetics: string[] = [
  "x",
  "y",
  "fill",
  "colour",
  "color",
  "alpha",
  "size",
  "group",
];

export const availableGgcorShadeParams: ParameterConfig[] = [
  {
    name: "type",
    type: "select",
    options: ["upper", "lower", "full"],
  },
  {
    name: "r0",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "r1",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "start",
    type: "number",
    step: 0.1,
  },
  {
    name: "end",
    type: "number",
    step: 0.1,
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

interface GeomGgcorShadeProps {
  params: GgcorShadeLayer;
  onChange: (params: GgcorShadeLayer) => void;
  columns?: string[];
}

export const GeomGgcorShade: React.FC<GeomGgcorShadeProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="阴影 (geom_shade)"
      availableAesthetics={availableGgcorShadeAesthetics}
      availableParams={availableGgcorShadeParams}
    />
  );
};

export type { GgcorShadeLayer };

// ========== geom_square ==========
export const availableGgcorSquareAesthetics: string[] = [
  "x",
  "y",
  "fill",
  "colour",
  "color",
  "alpha",
  "size",
  "linetype",
  "linewidth",
  "group",
];

export const availableGgcorSquareParams: ParameterConfig[] = [
  {
    name: "type",
    type: "select",
    options: ["upper", "lower", "full"],
  },
  {
    name: "width",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "height",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "radius",
    type: "number",
    min: 0,
    step: 0.1,
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

interface GeomGgcorSquareProps {
  params: GgcorSquareLayer;
  onChange: (params: GgcorSquareLayer) => void;
  columns?: string[];
}

export const GeomGgcorSquare: React.FC<GeomGgcorSquareProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="方形 (geom_square)"
      availableAesthetics={availableGgcorSquareAesthetics}
      availableParams={availableGgcorSquareParams}
    />
  );
};

export type { GgcorSquareLayer };

// ========== geom_star ==========
export const availableGgcorStarAesthetics: string[] = [
  "x",
  "y",
  "fill",
  "colour",
  "color",
  "alpha",
  "size",
  "group",
];

export const availableGgcorStarParams: ParameterConfig[] = [
  {
    name: "type",
    type: "select",
    options: ["upper", "lower", "full"],
  },
  {
    name: "n",
    type: "number",
    min: 3,
    step: 1,
    default: 5,
  },
  {
    name: "r0",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "r1",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "angle",
    type: "number",
    min: 0,
    max: 360,
    step: 1,
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

interface GeomGgcorStarProps {
  params: GgcorStarLayer;
  onChange: (params: GgcorStarLayer) => void;
  columns?: string[];
}

export const GeomGgcorStar: React.FC<GeomGgcorStarProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="星形 (geom_star)"
      availableAesthetics={availableGgcorStarAesthetics}
      availableParams={availableGgcorStarParams}
    />
  );
};

export type { GgcorStarLayer };

// ========== add_link ==========
export const availableGgcorAddLinkAesthetics: string[] = [
  "x",
  "y",
  "xend",
  "yend",
  "colour",
  "color",
  "alpha",
  "size",
  "linetype",
  "linewidth",
  "group",
];

export const availableGgcorAddLinkParams: ParameterConfig[] = [
  {
    name: "diag.label",
    type: "boolean",
    default: false,
  },
  {
    name: "on.left",
    type: "boolean",
    default: false,
  },
  {
    name: "curvature",
    type: "numbers",
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
    name: "linewidth",
    type: "number",
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

interface GeomGgcorAddLinkProps {
  params: GgcorAddLinkLayer;
  onChange: (params: GgcorAddLinkLayer) => void;
  columns?: string[];
}

export const GeomGgcorAddLink: React.FC<GeomGgcorAddLinkProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="添加连接 (add_link)"
      availableAesthetics={availableGgcorAddLinkAesthetics}
      availableParams={availableGgcorAddLinkParams}
    />
  );
};

export type { GgcorAddLinkLayer };

// ========== geom_cross ==========
export const availableGgcorCrossAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "color",
  "alpha",
  "size",
  "group",
];

export const availableGgcorCrossParams: ParameterConfig[] = [
  {
    name: "type",
    type: "select",
    options: ["upper", "lower", "full"],
  },
  {
    name: "filters",
    type: "strings",
  },
  {
    name: "sig.level",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.05,
  },
  {
    name: "size",
    type: "number",
    min: 0,
    step: 0.1,
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

interface GeomGgcorCrossProps {
  params: GgcorCrossLayer;
  onChange: (params: GgcorCrossLayer) => void;
  columns?: string[];
}

export const GeomGgcorCross: React.FC<GeomGgcorCrossProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="交叉 (geom_cross)"
      availableAesthetics={availableGgcorCrossAesthetics}
      availableParams={availableGgcorCrossParams}
    />
  );
};

export type { GgcorCrossLayer };
