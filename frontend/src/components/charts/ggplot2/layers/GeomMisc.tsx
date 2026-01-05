"use client";

import { ParameterConfig, BaseConfig, AestheticConfig } from "../types";
import { linetypeOptions } from "../common/constants";
import { GeomBase } from "./GeomBase";

// ============== Layer Types ==============
export interface RugLayer extends BaseConfig {
  type: "geom_rug";
  mapping?: AestheticConfig;
}

export interface SmoothLayer extends BaseConfig {
  type: "geom_smooth";
  mapping?: AestheticConfig;
}

export interface DotplotLayer extends BaseConfig {
  type: "geom_dotplot";
  mapping?: AestheticConfig;
}

export interface CountLayer extends BaseConfig {
  type: "geom_count";
  mapping?: AestheticConfig;
}

export interface HistogramLayer extends BaseConfig {
  type: "geom_histogram";
  mapping?: AestheticConfig;
}

export interface FreqpolyLayer extends BaseConfig {
  type: "geom_freqpoly";
  mapping?: AestheticConfig;
}

export interface DensityLayer extends BaseConfig {
  type: "geom_density";
  mapping?: AestheticConfig;
}

export interface ViolinLayer extends BaseConfig {
  type: "geom_violin";
  mapping?: AestheticConfig;
}

export interface AreaLayer extends BaseConfig {
  type: "geom_area";
  mapping?: AestheticConfig;
}

export interface RibbonLayer extends BaseConfig {
  type: "geom_ribbon";
  mapping?: AestheticConfig;
}

export interface StepLayer extends BaseConfig {
  type: "geom_step";
  mapping?: AestheticConfig;
}

export interface PathLayer extends BaseConfig {
  type: "geom_path";
  mapping?: AestheticConfig;
}

export interface PolygonLayer extends BaseConfig {
  type: "geom_polygon";
  mapping?: AestheticConfig;
}

export interface TileLayer extends BaseConfig {
  type: "geom_tile";
  mapping?: AestheticConfig;
}

export interface RectLayer extends BaseConfig {
  type: "geom_rect";
  mapping?: AestheticConfig;
}

export interface RasterLayer extends BaseConfig {
  type: "geom_raster";
  mapping?: AestheticConfig;
}

export interface ContourLayer extends BaseConfig {
  type: "geom_contour";
  mapping?: AestheticConfig;
}

export interface ContourFilledLayer extends BaseConfig {
  type: "geom_contour_filled";
  mapping?: AestheticConfig;
}

export interface Bin2dLayer extends BaseConfig {
  type: "geom_bin_2d";
  mapping?: AestheticConfig;
}

export interface HexLayer extends BaseConfig {
  type: "geom_hex";
  mapping?: AestheticConfig;
}

export interface Density2dLayer extends BaseConfig {
  type: "geom_density_2d";
  mapping?: AestheticConfig;
}

export interface Density2dFilledLayer extends BaseConfig {
  type: "geom_density_2d_filled";
  mapping?: AestheticConfig;
}

export interface QqLayer extends BaseConfig {
  type: "geom_qq";
  mapping?: AestheticConfig;
}

export interface QqLineLayer extends BaseConfig {
  type: "geom_qq_line";
  mapping?: AestheticConfig;
}

export interface BarLayer extends BaseConfig {
  type: "geom_bar";
  mapping?: AestheticConfig;
}

// ============== Common Aesthetic Parameters ==============
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

// ============== Aesthetics ==============
const rugAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "alpha",
  "linetype",
  "linewidth",
];

const smoothAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "linetype",
  "linewidth",
  "ymin",
  "ymax",
];

const dotplotAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
];

const countAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "size",
  "shape",
];

const histogramAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "linetype",
  "linewidth",
  "weight",
];

const freqpolyAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

const densityAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "linetype",
  "linewidth",
  "weight",
];

const violinAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "linetype",
  "linewidth",
  "weight",
];

const areaAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

const ribbonAesthetics: string[] = [
  "x",
  "ymin",
  "ymax",
  "colour",
  "fill",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

const stepAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

const pathAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

const polygonAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "linetype",
  "linewidth",
  "subgroup",
];

const tileAesthetics: string[] = [
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

const rectAesthetics: string[] = [
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

const rasterAesthetics: string[] = ["x", "y", "fill", "alpha"];

const contourAesthetics: string[] = [
  "x",
  "y",
  "z",
  "colour",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

const bin2dAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "weight",
];

const hexAesthetics: string[] = ["x", "y", "colour", "fill", "alpha", "group"];

const density2dAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

const qqAesthetics: string[] = [
  "sample",
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "shape",
  "size",
];

const barAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

// ============== Parameters ==============
const rugParams: ParameterConfig[] = [
  {
    name: "sides",
    type: "select",
    options: ["bl", "tl", "tr", "br", "b", "l", "t", "r"],
    default: "bl",
  },
  { name: "outside", type: "boolean", default: false },
  { name: "length", type: "number", min: 0, step: 0.01, default: 0.03 },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const smoothParams: ParameterConfig[] = [
  {
    name: "method",
    type: "select",
    options: ["lm", "glm", "gam", "loess", "auto"],
    default: "auto",
  },
  { name: "formula", type: "string" },
  { name: "se", type: "boolean", default: true },
  { name: "level", type: "number", min: 0, max: 1, step: 0.01, default: 0.95 },
  { name: "n", type: "number", min: 1, step: 1, default: 80 },
  { name: "span", type: "number", min: 0, max: 1, step: 0.01, default: 0.75 },
  { name: "fullrange", type: "boolean", default: false },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const dotplotParams: ParameterConfig[] = [
  { name: "binwidth", type: "number", min: 0, step: 0.1 },
  {
    name: "binaxis",
    type: "select",
    options: ["x", "y"],
    default: "x",
  },
  {
    name: "method",
    type: "select",
    options: ["dotdensity", "histodot"],
    default: "dotdensity",
  },
  {
    name: "binpositions",
    type: "select",
    options: ["bygroup", "all"],
    default: "bygroup",
  },
  {
    name: "stackdir",
    type: "select",
    options: ["up", "down", "center", "centerwhole"],
    default: "up",
  },
  { name: "stackratio", type: "number", min: 0, step: 0.1, default: 1 },
  { name: "dotsize", type: "number", min: 0, step: 0.1, default: 1 },
  { name: "stackgroups", type: "boolean", default: false },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const countParams: ParameterConfig[] = [
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const histogramParams: ParameterConfig[] = [
  { name: "bins", type: "number", min: 1, step: 1, default: 30 },
  { name: "binwidth", type: "number", min: 0, step: 0.1 },
  { name: "center", type: "number" },
  { name: "boundary", type: "number" },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const freqpolyParams: ParameterConfig[] = [
  { name: "bins", type: "number", min: 1, step: 1, default: 30 },
  { name: "binwidth", type: "number", min: 0, step: 0.1 },
  { name: "center", type: "number" },
  { name: "boundary", type: "number" },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const densityParams: ParameterConfig[] = [
  {
    name: "bw",
    type: "select",
    options: ["nrd0", "nrd", "ucv", "bcv", "SJ"],
    default: "nrd0",
  },
  { name: "adjust", type: "number", min: 0, step: 0.1, default: 1 },
  {
    name: "kernel",
    type: "select",
    options: [
      "gaussian",
      "epanechnikov",
      "rectangular",
      "triangular",
      "biweight",
      "cosine",
      "optcosine",
    ],
    default: "gaussian",
  },
  { name: "n", type: "number", min: 1, step: 1, default: 512 },
  { name: "trim", type: "boolean", default: false },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const violinParams: ParameterConfig[] = [
  {
    name: "draw_quantiles",
    type: "numbers",
  },
  { name: "trim", type: "boolean", default: true },
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
  { name: "adjust", type: "number", min: 0, step: 0.1, default: 1 },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const areaParams: ParameterConfig[] = [
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const ribbonParams: ParameterConfig[] = [
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const stepParams: ParameterConfig[] = [
  {
    name: "direction",
    type: "select",
    options: ["hv", "vh", "mid"],
    default: "hv",
  },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const pathParams: ParameterConfig[] = [
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
    default: "round",
  },
  { name: "linemitre", type: "number", min: 1, step: 1, default: 10 },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const polygonParams: ParameterConfig[] = [
  {
    name: "rule",
    type: "select",
    options: ["evenodd", "winding"],
    default: "evenodd",
  },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const tileParams: ParameterConfig[] = [
  { name: "width", type: "number", min: 0, step: 0.1 },
  { name: "height", type: "number", min: 0, step: 0.1 },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const rectParams: ParameterConfig[] = [
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const rasterParams: ParameterConfig[] = [
  { name: "hjust", type: "number", min: 0, max: 1, step: 0.1, default: 0.5 },
  { name: "vjust", type: "number", min: 0, max: 1, step: 0.1, default: 0.5 },
  { name: "interpolate", type: "boolean", default: false },
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const contourParams: ParameterConfig[] = [
  { name: "bins", type: "number", min: 1, step: 1 },
  { name: "binwidth", type: "number", min: 0, step: 0.1 },
  { name: "breaks", type: "numbers" },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const bin2dParams: ParameterConfig[] = [
  { name: "bins", type: "number", min: 1, step: 1, default: 30 },
  { name: "binwidth", type: "numbers" },
  { name: "drop", type: "boolean", default: true },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const hexParams: ParameterConfig[] = [
  { name: "bins", type: "number", min: 1, step: 1, default: 30 },
  { name: "binwidth", type: "numbers" },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const density2dParams: ParameterConfig[] = [
  { name: "h", type: "numbers" },
  { name: "n", type: "number", min: 1, step: 1, default: 100 },
  { name: "contour", type: "boolean", default: true },
  {
    name: "contour_var",
    type: "select",
    options: ["density", "ndensity", "count"],
  },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const qqParams: ParameterConfig[] = [
  {
    name: "distribution",
    type: "select",
    options: ["norm", "unif", "t", "f", "chisq", "exp", "lnorm"],
    default: "norm",
  },
  { name: "dparams", type: "list" },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const qqLineParams: ParameterConfig[] = [
  {
    name: "distribution",
    type: "select",
    options: ["norm", "unif", "t", "f", "chisq", "exp", "lnorm"],
    default: "norm",
  },
  { name: "dparams", type: "list" },
  {
    name: "line.p",
    type: "pair",
    default: [0.25, 0.75],
  },
  { name: "fullrange", type: "boolean", default: false },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const barParams: ParameterConfig[] = [
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
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

// ============== Components ==============
interface GeomRugProps {
  params: RugLayer;
  onChange: (layer: RugLayer) => void;
  columns?: string[];
}

export const GeomRug: React.FC<GeomRugProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="边缘线 (geom_rug)"
    availableAesthetics={rugAesthetics}
    availableParams={rugParams}
  />
);

interface GeomSmoothProps {
  params: SmoothLayer;
  onChange: (layer: SmoothLayer) => void;
  columns?: string[];
}

export const GeomSmooth: React.FC<GeomSmoothProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="平滑曲线 (geom_smooth)"
    availableAesthetics={smoothAesthetics}
    availableParams={smoothParams}
  />
);

interface GeomDotplotProps {
  params: DotplotLayer;
  onChange: (layer: DotplotLayer) => void;
  columns?: string[];
}

export const GeomDotplot: React.FC<GeomDotplotProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="点图 (geom_dotplot)"
    availableAesthetics={dotplotAesthetics}
    availableParams={dotplotParams}
  />
);

interface GeomCountProps {
  params: CountLayer;
  onChange: (layer: CountLayer) => void;
  columns?: string[];
}

export const GeomCount: React.FC<GeomCountProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="计数点 (geom_count)"
    availableAesthetics={countAesthetics}
    availableParams={countParams}
  />
);

interface GeomHistogramProps {
  params: HistogramLayer;
  onChange: (layer: HistogramLayer) => void;
  columns?: string[];
}

export const GeomHistogram: React.FC<GeomHistogramProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="直方图 (geom_histogram)"
    availableAesthetics={histogramAesthetics}
    availableParams={histogramParams}
  />
);

interface GeomFreqpolyProps {
  params: FreqpolyLayer;
  onChange: (layer: FreqpolyLayer) => void;
  columns?: string[];
}

export const GeomFreqpoly: React.FC<GeomFreqpolyProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="频率多边形 (geom_freqpoly)"
    availableAesthetics={freqpolyAesthetics}
    availableParams={freqpolyParams}
  />
);

interface GeomDensityProps {
  params: DensityLayer;
  onChange: (layer: DensityLayer) => void;
  columns?: string[];
}

export const GeomDensity: React.FC<GeomDensityProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="密度图 (geom_density)"
    availableAesthetics={densityAesthetics}
    availableParams={densityParams}
  />
);

interface GeomViolinProps {
  params: ViolinLayer;
  onChange: (layer: ViolinLayer) => void;
  columns?: string[];
}

export const GeomViolin: React.FC<GeomViolinProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="小提琴图 (geom_violin)"
    availableAesthetics={violinAesthetics}
    availableParams={violinParams}
  />
);

interface GeomAreaProps {
  params: AreaLayer;
  onChange: (layer: AreaLayer) => void;
  columns?: string[];
}

export const GeomArea: React.FC<GeomAreaProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="面积图 (geom_area)"
    availableAesthetics={areaAesthetics}
    availableParams={areaParams}
  />
);

interface GeomRibbonProps {
  params: RibbonLayer;
  onChange: (layer: RibbonLayer) => void;
  columns?: string[];
}

export const GeomRibbon: React.FC<GeomRibbonProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="色带图 (geom_ribbon)"
    availableAesthetics={ribbonAesthetics}
    availableParams={ribbonParams}
  />
);

interface GeomStepProps {
  params: StepLayer;
  onChange: (layer: StepLayer) => void;
  columns?: string[];
}

export const GeomStep: React.FC<GeomStepProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="阶梯图 (geom_step)"
    availableAesthetics={stepAesthetics}
    availableParams={stepParams}
  />
);

interface GeomPathProps {
  params: PathLayer;
  onChange: (layer: PathLayer) => void;
  columns?: string[];
}

export const GeomPath: React.FC<GeomPathProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="路径 (geom_path)"
    availableAesthetics={pathAesthetics}
    availableParams={pathParams}
  />
);

interface GeomPolygonProps {
  params: PolygonLayer;
  onChange: (layer: PolygonLayer) => void;
  columns?: string[];
}

export const GeomPolygon: React.FC<GeomPolygonProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="多边形 (geom_polygon)"
    availableAesthetics={polygonAesthetics}
    availableParams={polygonParams}
  />
);

interface GeomTileProps {
  params: TileLayer;
  onChange: (layer: TileLayer) => void;
  columns?: string[];
}

export const GeomTile: React.FC<GeomTileProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="瓦片图 (geom_tile)"
    availableAesthetics={tileAesthetics}
    availableParams={tileParams}
  />
);

interface GeomRectProps {
  params: RectLayer;
  onChange: (layer: RectLayer) => void;
  columns?: string[];
}

export const GeomRect: React.FC<GeomRectProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="矩形 (geom_rect)"
    availableAesthetics={rectAesthetics}
    availableParams={rectParams}
  />
);

interface GeomRasterProps {
  params: RasterLayer;
  onChange: (layer: RasterLayer) => void;
  columns?: string[];
}

export const GeomRaster: React.FC<GeomRasterProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="栅格图 (geom_raster)"
    availableAesthetics={rasterAesthetics}
    availableParams={rasterParams}
  />
);

interface GeomContourProps {
  params: ContourLayer;
  onChange: (layer: ContourLayer) => void;
  columns?: string[];
}

export const GeomContour: React.FC<GeomContourProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="等高线 (geom_contour)"
    availableAesthetics={contourAesthetics}
    availableParams={contourParams}
  />
);

interface GeomContourFilledProps {
  params: ContourFilledLayer;
  onChange: (layer: ContourFilledLayer) => void;
  columns?: string[];
}

export const GeomContourFilled: React.FC<GeomContourFilledProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="填充等高线 (geom_contour_filled)"
    availableAesthetics={contourAesthetics}
    availableParams={contourParams}
  />
);

interface GeomBin2dProps {
  params: Bin2dLayer;
  onChange: (layer: Bin2dLayer) => void;
  columns?: string[];
}

export const GeomBin2d: React.FC<GeomBin2dProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="二维分箱 (geom_bin_2d)"
    availableAesthetics={bin2dAesthetics}
    availableParams={bin2dParams}
  />
);

interface GeomHexProps {
  params: HexLayer;
  onChange: (layer: HexLayer) => void;
  columns?: string[];
}

export const GeomHex: React.FC<GeomHexProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="六边形分箱 (geom_hex)"
    availableAesthetics={hexAesthetics}
    availableParams={hexParams}
  />
);

interface GeomDensity2dProps {
  params: Density2dLayer;
  onChange: (layer: Density2dLayer) => void;
  columns?: string[];
}

export const GeomDensity2d: React.FC<GeomDensity2dProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="二维密度 (geom_density_2d)"
    availableAesthetics={density2dAesthetics}
    availableParams={density2dParams}
  />
);

interface GeomDensity2dFilledProps {
  params: Density2dFilledLayer;
  onChange: (layer: Density2dFilledLayer) => void;
  columns?: string[];
}

export const GeomDensity2dFilled: React.FC<GeomDensity2dFilledProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="填充二维密度 (geom_density_2d_filled)"
    availableAesthetics={density2dAesthetics}
    availableParams={density2dParams}
  />
);

interface GeomQqProps {
  params: QqLayer;
  onChange: (layer: QqLayer) => void;
  columns?: string[];
}

export const GeomQq: React.FC<GeomQqProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="QQ图 (geom_qq)"
    availableAesthetics={qqAesthetics}
    availableParams={qqParams}
  />
);

interface GeomQqLineProps {
  params: QqLineLayer;
  onChange: (layer: QqLineLayer) => void;
  columns?: string[];
}

export const GeomQqLine: React.FC<GeomQqLineProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="QQ参考线 (geom_qq_line)"
    availableAesthetics={qqAesthetics}
    availableParams={qqLineParams}
  />
);

interface GeomBarProps {
  params: BarLayer;
  onChange: (layer: BarLayer) => void;
  columns?: string[];
}

export const GeomBar: React.FC<GeomBarProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="条形图 (geom_bar)"
    availableAesthetics={barAesthetics}
    availableParams={barParams}
  />
);
