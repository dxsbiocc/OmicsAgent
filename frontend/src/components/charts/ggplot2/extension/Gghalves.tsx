"use client";

import {
  HalfViolinLayer,
  HalfPointLayer,
  HalfPointPanelLayer,
  HalfDotplotLayer,
  HalfBoxplotLayer,
  ParameterConfig,
} from "../types";
import { GeomBase } from "../layers/GeomBase";

// ========== geom_half_violin ==========
export const availableHalfViolinAesthetics: string[] = [
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

export const availableHalfViolinParams: ParameterConfig[] = [
  {
    name: "side",
    type: "select",
    options: ["l", "r", "left", "right"],
    default: "l",
  },
  {
    name: "nudge",
    type: "number",
    step: 0.1,
    default: 0,
  },
  {
    name: "draw_quantiles",
    type: "numbers",
  },
  {
    name: "trim",
    type: "boolean",
    default: true,
  },
  {
    name: "scale",
    type: "select",
    options: ["area", "count", "width"],
    default: "area",
  },
  {
    name: "bw",
    type: "select",
    options: ["nrd0", "nrd", "ucv", "bcv", "SJ"],
    default: "nrd0",
  },
  {
    name: "adjust",
    type: "number",
    min: 0,
    step: 0.1,
    default: 1,
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
    name: "linetype",
    type: "select",
    options: [
      "blank",
      "solid",
      "dashed",
      "dotted",
      "dotdash",
      "longdash",
      "twodash",
    ],
  },
  {
    name: "linewidth",
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

interface GeomHalfViolinProps {
  params: HalfViolinLayer;
  onChange: (params: HalfViolinLayer) => void;
  columns?: string[];
}

export const GeomHalfViolin: React.FC<GeomHalfViolinProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="半小提琴图 (geom_half_violin)"
      availableAesthetics={availableHalfViolinAesthetics}
      availableParams={availableHalfViolinParams}
    />
  );
};

export type { HalfViolinLayer };

// ========== geom_half_point ==========
export const availableHalfPointAesthetics: string[] = [
  "x",
  "y",
  "fill",
  "colour",
  "color",
  "alpha",
  "size",
  "shape",
  "stroke",
  "group",
];

export const availableHalfPointParams: ParameterConfig[] = [
  {
    name: "side",
    type: "select",
    options: ["l", "r", "left", "right"],
    default: "l",
  },
  {
    name: "nudge",
    type: "number",
    step: 0.1,
    default: 0,
  },
  {
    name: "size",
    type: "number",
    min: 0,
    step: 0.1,
    default: 2,
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
    name: "stroke",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
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
    name: "colour",
    type: "color",
  },
  {
    name: "fill",
    type: "color",
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

interface GeomHalfPointProps {
  params: HalfPointLayer;
  onChange: (params: HalfPointLayer) => void;
  columns?: string[];
}

export const GeomHalfPoint: React.FC<GeomHalfPointProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="半点图 (geom_half_point)"
      availableAesthetics={availableHalfPointAesthetics}
      availableParams={availableHalfPointParams}
    />
  );
};

export type { HalfPointLayer };

// ========== geom_half_point_panel ==========
export const availableHalfPointPanelAesthetics: string[] = [
  "x",
  "y",
  "fill",
  "colour",
  "color",
  "alpha",
  "size",
  "shape",
  "stroke",
  "group",
];

export const availableHalfPointPanelParams: ParameterConfig[] = [
  {
    name: "side",
    type: "select",
    options: ["l", "r", "left", "right"],
    default: "l",
  },
  {
    name: "nudge",
    type: "number",
    step: 0.1,
    default: 0,
  },
  {
    name: "size",
    type: "number",
    min: 0,
    step: 0.1,
    default: 2,
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
    name: "stroke",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
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
    name: "colour",
    type: "color",
  },
  {
    name: "fill",
    type: "color",
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

interface GeomHalfPointPanelProps {
  params: HalfPointPanelLayer;
  onChange: (params: HalfPointPanelLayer) => void;
  columns?: string[];
}

export const GeomHalfPointPanel: React.FC<GeomHalfPointPanelProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="半点图面板 (geom_half_point_panel)"
      availableAesthetics={availableHalfPointPanelAesthetics}
      availableParams={availableHalfPointPanelParams}
    />
  );
};

export type { HalfPointPanelLayer };

// ========== geom_half_dotplot ==========
export const availableHalfDotplotAesthetics: string[] = [
  "x",
  "y",
  "fill",
  "colour",
  "color",
  "alpha",
  "size",
  "shape",
  "stroke",
  "group",
];

export const availableHalfDotplotParams: ParameterConfig[] = [
  {
    name: "side",
    type: "select",
    options: ["l", "r", "left", "right"],
    default: "l",
  },
  {
    name: "nudge",
    type: "number",
    step: 0.1,
    default: 0,
  },
  {
    name: "binaxis",
    type: "select",
    options: ["x", "y"],
    default: "x",
  },
  {
    name: "binwidth",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "binpositions",
    type: "select",
    options: ["all", "bygroup"],
    default: "all",
  },
  {
    name: "stackdir",
    type: "select",
    options: ["up", "down", "center", "centerwhole"],
    default: "up",
  },
  {
    name: "stackratio",
    type: "number",
    min: 0,
    step: 0.1,
    default: 1,
  },
  {
    name: "dotsize",
    type: "number",
    min: 0,
    step: 0.1,
    default: 1,
  },
  {
    name: "stackgroups",
    type: "boolean",
    default: false,
  },
  {
    name: "method",
    type: "select",
    options: ["dotdensity", "histodot"],
    default: "dotdensity",
  },
  {
    name: "origin",
    type: "number",
  },
  {
    name: "right",
    type: "boolean",
    default: true,
  },
  {
    name: "width",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "drop",
    type: "boolean",
    default: false,
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

interface GeomHalfDotplotProps {
  params: HalfDotplotLayer;
  onChange: (params: HalfDotplotLayer) => void;
  columns?: string[];
}

export const GeomHalfDotplot: React.FC<GeomHalfDotplotProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="半点图 (geom_half_dotplot)"
      availableAesthetics={availableHalfDotplotAesthetics}
      availableParams={availableHalfDotplotParams}
    />
  );
};

export type { HalfDotplotLayer };

// ========== geom_half_boxplot ==========
export const availableHalfBoxplotAesthetics: string[] = [
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

export const availableHalfBoxplotParams: ParameterConfig[] = [
  {
    name: "side",
    type: "select",
    options: ["l", "r", "left", "right"],
    default: "l",
  },
  {
    name: "nudge",
    type: "number",
    step: 0.1,
    default: 0,
  },
  {
    name: "outliers",
    type: "boolean",
    default: true,
  },
  {
    name: "notch",
    type: "boolean",
    default: false,
  },
  {
    name: "notchwidth",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.5,
  },
  {
    name: "varwidth",
    type: "boolean",
    default: false,
  },
  {
    name: "orientation",
    type: "select",
    options: ["vertical", "horizontal"],
    default: "vertical",
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
    name: "linetype",
    type: "select",
    options: [
      "blank",
      "solid",
      "dashed",
      "dotted",
      "dotdash",
      "longdash",
      "twodash",
    ],
  },
  {
    name: "linewidth",
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

interface GeomHalfBoxplotProps {
  params: HalfBoxplotLayer;
  onChange: (params: HalfBoxplotLayer) => void;
  columns?: string[];
}

export const GeomHalfBoxplot: React.FC<GeomHalfBoxplotProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="半箱线图 (geom_half_boxplot)"
      availableAesthetics={availableHalfBoxplotAesthetics}
      availableParams={availableHalfBoxplotParams}
    />
  );
};

export type { HalfBoxplotLayer };
