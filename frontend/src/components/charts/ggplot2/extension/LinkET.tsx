"use client";

import {
  ShapingLayer,
  LinkETAnnotateLayer,
  CorrLayer,
  Curve2Layer,
  DoughnutLayer,
  DiagLabelLayer,
  SquareLayer,
  CoupleLayer,
  ParameterConfig,
} from "../types";
import { GeomBase } from "../layers/GeomBase";
import { linetypeOptions, lineendOptions } from "../common/constants";

const fontFaceOptions = ["plain", "bold", "italic", "bold.italic"];

// ========== geom_shaping ==========
export const availableShapingAesthetics: string[] = [
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

export const availableShapingParams: ParameterConfig[] = [
  {
    name: "marker",
    type: "marker",
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
    name: "size",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "shape",
    type: "number",
    min: 0,
    max: 25,
    step: 1,
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

interface GeomShapingProps {
  params: ShapingLayer;
  onChange: (params: ShapingLayer) => void;
  columns?: string[];
}

export const GeomShaping: React.FC<GeomShapingProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="形状 (geom_shaping)"
      availableAesthetics={availableShapingAesthetics}
      availableParams={availableShapingParams}
    />
  );
};

export type { ShapingLayer };

// ========== geom_annotate ==========
export const availableLinkETAnnotateAesthetics: string[] = [
  "x",
  "y",
  "xmin",
  "xmax",
  "ymin",
  "ymax",
  "xend",
  "yend",
  "fill",
  "colour",
  "color",
  "alpha",
  "size",
  "group",
];

export const availableLinkETAnnotateParams: ParameterConfig[] = [
  {
    name: "geom",
    type: "select",
    options: [
      "text",
      "label",
      "rect",
      "segment",
      "point",
      "line",
      "hline",
      "vline",
      "abline",
    ],
    default: "text",
  },
  {
    name: "x",
    type: "number",
  },
  {
    name: "y",
    type: "number",
  },
  {
    name: "xmin",
    type: "number",
  },
  {
    name: "xmax",
    type: "number",
  },
  {
    name: "ymin",
    type: "number",
  },
  {
    name: "ymax",
    type: "number",
  },
  {
    name: "xend",
    type: "number",
  },
  {
    name: "yend",
    type: "number",
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
    name: "size",
    type: "number",
    min: 0,
    step: 0.1,
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

interface GeomLinkETAnnotateProps {
  params: LinkETAnnotateLayer;
  onChange: (params: LinkETAnnotateLayer) => void;
  columns?: string[];
}

export const GeomLinkETAnnotate: React.FC<GeomLinkETAnnotateProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="注释 (geom_annotate)"
      availableAesthetics={availableLinkETAnnotateAesthetics}
      availableParams={availableLinkETAnnotateParams}
    />
  );
};

export type { LinkETAnnotateLayer };

// ========== geom_corr ==========
export const availableCorrAesthetics: string[] = [
  "x",
  "y",
  "r",
  "p",
  "fill",
  "colour",
  "color",
  "alpha",
  "size",
  "group",
];

export const availableCorrParams: ParameterConfig[] = [
  {
    name: "r",
    type: "numbers",
  },
  {
    name: "p",
    type: "numbers",
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
    name: "sig_level",
    type: "numbers",
  },
  {
    name: "insig",
    type: "select",
    options: ["pch", "label", "blank", "n"],
    default: "pch",
  },
  {
    name: "pch",
    type: "number",
    min: 0,
    max: 25,
    step: 1,
    default: 4,
  },
  {
    name: "pch.col",
    type: "color",
  },
  {
    name: "pch.cex",
    type: "number",
    min: 0,
    step: 0.1,
    default: 1,
  },
  {
    name: "label",
    type: "select",
    options: ["r", "p", "r.adj", "p.adj", "r.sig", "p.sig"],
  },
  {
    name: "label.x",
    type: "number",
  },
  {
    name: "label.y",
    type: "number",
  },
  {
    name: "label.sep",
    type: "string",
    default: "~",
  },
  {
    name: "label.r",
    type: "number",
  },
  {
    name: "label.p",
    type: "number",
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
    name: "size",
    type: "number",
    min: 0,
    step: 0.1,
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

interface GeomCorrProps {
  params: CorrLayer;
  onChange: (params: CorrLayer) => void;
  columns?: string[];
}

export const GeomCorr: React.FC<GeomCorrProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="相关性 (geom_corr)"
      availableAesthetics={availableCorrAesthetics}
      availableParams={availableCorrParams}
    />
  );
};

export type { CorrLayer };

// ========== geom_curve2 ==========
export const availableCurve2Aesthetics: string[] = [
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

export const availableCurve2Params: ParameterConfig[] = [
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

interface GeomCurve2Props {
  params: Curve2Layer;
  onChange: (params: Curve2Layer) => void;
  columns?: string[];
}

export const GeomCurve2: React.FC<GeomCurve2Props> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="曲线2 (geom_curve2)"
      availableAesthetics={availableCurve2Aesthetics}
      availableParams={availableCurve2Params}
    />
  );
};

export type { Curve2Layer };

// ========== geom_doughnut ==========
export const availableDoughnutAesthetics: string[] = [
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

export const availableDoughnutParams: ParameterConfig[] = [
  {
    name: "inner.radius",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "outer.radius",
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

interface GeomDoughnutProps {
  params: DoughnutLayer;
  onChange: (params: DoughnutLayer) => void;
  columns?: string[];
}

export const GeomDoughnut: React.FC<GeomDoughnutProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="甜甜圈 (geom_doughnut)"
      availableAesthetics={availableDoughnutAesthetics}
      availableParams={availableDoughnutParams}
    />
  );
};

export type { DoughnutLayer };

// ========== geom_diag_label ==========
export const availableDiagLabelAesthetics: string[] = [
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
  "group",
];

export const availableDiagLabelParams: ParameterConfig[] = [
  {
    name: "label",
    type: "string",
  },
  {
    name: "angle",
    type: "number",
    min: 0,
    max: 360,
    step: 1,
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
    options: ["plain", "bold", "italic", "bold.italic"],
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

interface GeomDiagLabelProps {
  params: DiagLabelLayer;
  onChange: (params: DiagLabelLayer) => void;
  columns?: string[];
}

export const GeomDiagLabel: React.FC<GeomDiagLabelProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="对角线标签 (geom_diag_label)"
      availableAesthetics={availableDiagLabelAesthetics}
      availableParams={availableDiagLabelParams}
    />
  );
};

export type { DiagLabelLayer };

// ========== geom_square ==========
export const availableSquareAesthetics: string[] = [
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

export const availableSquareParams: ParameterConfig[] = [
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

interface GeomSquareProps {
  params: SquareLayer;
  onChange: (params: SquareLayer) => void;
  columns?: string[];
}

export const GeomSquare: React.FC<GeomSquareProps> = ({
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
      availableAesthetics={availableSquareAesthetics}
      availableParams={availableSquareParams}
    />
  );
};

export type { SquareLayer };

// ========== geom_couple ==========
export const availableCoupleAesthetics: string[] = [
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
  "drop",
  "label.size",
  "label.colour",
  "label.family",
  "label.fontface",
  "nudge_x",
  "offset_x",
  "offset_y",
];

export const availableCoupleParams: ParameterConfig[] = [
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
  {
    name: "drop",
    type: "boolean",
    default: false,
  },
  {
    name: "label.size",
    type: "number",
  },
  {
    name: "label.colour",
    type: "color",
  },
  {
    name: "label.family",
    type: "select",
    options: ["sans", "serif", "mono"],
    default: "sans",
  },
  {
    name: "label.fontface",
    type: "select",
    options: fontFaceOptions,
    default: "plain",
  },
  {
    name: "nudge_x",
    type: "number",
    step: 0.1,
  },
  {
    name: "offset_x",
    type: "list",
  },
  {
    name: "offset_y",
    type: "list",
  },
];

interface GeomCoupleProps {
  params: CoupleLayer;
  onChange: (params: CoupleLayer) => void;
  columns?: string[];
}

export const GeomCouple: React.FC<GeomCoupleProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="连接 (geom_couple)"
      availableAesthetics={availableCoupleAesthetics}
      availableParams={availableCoupleParams}
    />
  );
};

export type { CoupleLayer };
