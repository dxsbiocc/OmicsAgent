"use client";

import { ParameterConfig, BaseConfig, AestheticConfig } from "../types";
import { linetypeOptions } from "../common/constants";
import { GeomBase } from "./GeomBase";

// ============== Base Stat Layer Type ==============
export interface StatLayer extends BaseConfig {
  type: string;
  mapping?: AestheticConfig;
  arguments?: Record<string, any>;
}

// ============== Specific Stat Layer Types ==============
export interface StatSummaryLayer extends StatLayer {
  type: "stat_summary";
}

export interface StatSummaryBinLayer extends StatLayer {
  type: "stat_summary_bin";
}

export interface StatSummary2dLayer extends StatLayer {
  type: "stat_summary_2d";
}

export interface StatSummaryHexLayer extends StatLayer {
  type: "stat_summary_hex";
}

export interface StatCountLayer extends StatLayer {
  type: "stat_count";
}

export interface StatBinLayer extends StatLayer {
  type: "stat_bin";
}

export interface StatBin2dLayer extends StatLayer {
  type: "stat_bin_2d";
}

export interface StatBinhexLayer extends StatLayer {
  type: "stat_binhex";
}

export interface StatDensityLayer extends StatLayer {
  type: "stat_density";
}

export interface StatDensity2dLayer extends StatLayer {
  type: "stat_density_2d";
}

export interface StatContourLayer extends StatLayer {
  type: "stat_contour";
}

export interface StatContourFilledLayer extends StatLayer {
  type: "stat_contour_filled";
}

export interface StatBoxplotLayer extends StatLayer {
  type: "stat_boxplot";
}

export interface StatYdensityLayer extends StatLayer {
  type: "stat_ydensity";
}

export interface StatEcdfLayer extends StatLayer {
  type: "stat_ecdf";
}

export interface StatQuantileLayer extends StatLayer {
  type: "stat_quantile";
}

export interface StatSmoothLayer extends StatLayer {
  type: "stat_smooth";
}

export interface StatFunctionLayer extends StatLayer {
  type: "stat_function";
}

export interface StatQqLayer extends StatLayer {
  type: "stat_qq";
}

export interface StatQqLineLayer extends StatLayer {
  type: "stat_qq_line";
}

export interface StatUniqueLayer extends StatLayer {
  type: "stat_unique";
}

export interface StatIdentityLayer extends StatLayer {
  type: "stat_identity";
}

export interface StatEllipseLayer extends StatLayer {
  type: "stat_ellipse";
}

// ============== Aesthetics ==============
const summaryAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "linetype",
  "linewidth",
  "shape",
  "size",
];

const countAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "weight",
];

const binAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "weight",
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

const density2dAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

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

const boxplotAesthetics: string[] = [
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

const ydensityAesthetics: string[] = [
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

const ecdfAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

const quantileAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "alpha",
  "group",
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

const functionAesthetics: string[] = [
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

const ellipseAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

const identityAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
];

// ============== Common Aesthetic Parameters ==============
// 这些参数可以在基本设置中直接设置，也可以通过映射设置
const commonAesParams: ParameterConfig[] = [
  { name: "colour", type: "color" },
  { name: "fill", type: "color" },
  { name: "alpha", type: "number", min: 0, max: 1, step: 0.01, default: 1 },
  { name: "size", type: "number", min: 0, step: 0.5 },
  { name: "shape", type: "number", min: 0, max: 25, step: 1 },
  {
    name: "linetype",
    type: "select",
    options: [
      "solid",
      "dashed",
      "dotted",
      "dotdash",
      "longdash",
      "twodash",
      "blank",
    ],
  },
  { name: "linewidth", type: "number", min: 0, step: 0.1 },
];

// ============== Parameters ==============
const summaryParams: ParameterConfig[] = [
  {
    name: "fun.data",
    type: "select",
    options: [
      "mean_se",
      "mean_sdl",
      "mean_cl_normal",
      "mean_cl_boot",
      "median_hilow",
    ],
  },
  { name: "fun", type: "string" },
  { name: "fun.min", type: "string" },
  { name: "fun.max", type: "string" },
  { name: "fun.args", type: "list" },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const summaryBinParams: ParameterConfig[] = [
  ...summaryParams,
  { name: "bins", type: "number", min: 1, step: 1, default: 30 },
  { name: "binwidth", type: "number", min: 0, step: 0.1 },
  {
    name: "breaks",
    type: "numbers",
  },
];

const countParams: ParameterConfig[] = [
  { name: "width", type: "number", min: 0, step: 0.1 },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const binParams: ParameterConfig[] = [
  { name: "bins", type: "number", min: 1, step: 1, default: 30 },
  { name: "binwidth", type: "number", min: 0, step: 0.1 },
  {
    name: "breaks",
    type: "numbers",
  },
  { name: "center", type: "number" },
  { name: "boundary", type: "number" },
  {
    name: "closed",
    type: "select",
    options: ["right", "left"],
    default: "right",
  },
  { name: "pad", type: "boolean", default: false },
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

const binhexParams: ParameterConfig[] = [
  { name: "bins", type: "number", min: 1, step: 1, default: 30 },
  { name: "binwidth", type: "numbers" },
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
  {
    name: "bounds",
    type: "pair",
  },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const density2dParams: ParameterConfig[] = [
  { name: "h", type: "numbers" },
  { name: "n", type: "number", min: 1, step: 1, default: 100 },
  {
    name: "contour",
    type: "boolean",
    default: true,
  },
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

const contourParams: ParameterConfig[] = [
  { name: "bins", type: "number", min: 1, step: 1 },
  { name: "binwidth", type: "number", min: 0, step: 0.1 },
  {
    name: "breaks",
    type: "numbers",
  },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const boxplotParams: ParameterConfig[] = [
  { name: "coef", type: "number", min: 0, step: 0.1, default: 1.5 },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const ydensityParams: ParameterConfig[] = [
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
  { name: "trim", type: "boolean", default: true },
  {
    name: "scale",
    type: "select",
    options: ["area", "count", "width"],
    default: "area",
  },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const ecdfParams: ParameterConfig[] = [
  { name: "n", type: "number", min: 1, step: 1 },
  { name: "pad", type: "boolean", default: true },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const quantileParams: ParameterConfig[] = [
  {
    name: "quantiles",
    type: "numbers",
    default: [0.25, 0.5, 0.75],
  },
  {
    name: "method",
    type: "select",
    options: ["rq", "rqss"],
    default: "rq",
  },
  { name: "formula", type: "string" },
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

const functionParams: ParameterConfig[] = [
  { name: "fun", type: "string", required: true },
  { name: "args", type: "list" },
  { name: "n", type: "number", min: 1, step: 1, default: 101 },
  { name: "xlim", type: "pair" },
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

const uniqueParams: ParameterConfig[] = [
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const identityParams: ParameterConfig[] = [
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const ellipseParams: ParameterConfig[] = [
  {
    name: "type",
    type: "select",
    options: ["t", "norm", "euclid"],
    default: "t",
  },
  { name: "level", type: "number", min: 0, max: 1, step: 0.01, default: 0.95 },
  { name: "segments", type: "number", min: 1, step: 1, default: 51 },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

// ============== Components ==============
interface StatSummaryProps {
  params: StatSummaryLayer;
  onChange: (layer: StatSummaryLayer) => void;
  columns?: string[];
}

export const StatSummary: React.FC<StatSummaryProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="统计汇总 (stat_summary)"
    availableAesthetics={summaryAesthetics}
    availableParams={summaryParams}
  />
);

interface StatSummaryBinProps {
  params: StatSummaryBinLayer;
  onChange: (layer: StatSummaryBinLayer) => void;
  columns?: string[];
}

export const StatSummaryBin: React.FC<StatSummaryBinProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="分箱统计汇总 (stat_summary_bin)"
    availableAesthetics={summaryAesthetics}
    availableParams={summaryBinParams}
  />
);

interface StatSummary2dProps {
  params: StatSummary2dLayer;
  onChange: (layer: StatSummary2dLayer) => void;
  columns?: string[];
}

export const StatSummary2d: React.FC<StatSummary2dProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="二维统计汇总 (stat_summary_2d)"
    availableAesthetics={summaryAesthetics}
    availableParams={summaryBinParams}
  />
);

interface StatSummaryHexProps {
  params: StatSummaryHexLayer;
  onChange: (layer: StatSummaryHexLayer) => void;
  columns?: string[];
}

export const StatSummaryHex: React.FC<StatSummaryHexProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="六边形统计汇总 (stat_summary_hex)"
    availableAesthetics={summaryAesthetics}
    availableParams={summaryBinParams}
  />
);

interface StatCountProps {
  params: StatCountLayer;
  onChange: (layer: StatCountLayer) => void;
  columns?: string[];
}

export const StatCount: React.FC<StatCountProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="计数统计 (stat_count)"
    availableAesthetics={countAesthetics}
    availableParams={countParams}
  />
);

interface StatBinProps {
  params: StatBinLayer;
  onChange: (layer: StatBinLayer) => void;
  columns?: string[];
}

export const StatBin: React.FC<StatBinProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="分箱统计 (stat_bin)"
    availableAesthetics={binAesthetics}
    availableParams={binParams}
  />
);

interface StatBin2dProps {
  params: StatBin2dLayer;
  onChange: (layer: StatBin2dLayer) => void;
  columns?: string[];
}

export const StatBin2d: React.FC<StatBin2dProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="二维分箱统计 (stat_bin_2d)"
    availableAesthetics={bin2dAesthetics}
    availableParams={bin2dParams}
  />
);

interface StatBinhexProps {
  params: StatBinhexLayer;
  onChange: (layer: StatBinhexLayer) => void;
  columns?: string[];
}

export const StatBinhex: React.FC<StatBinhexProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="六边形分箱统计 (stat_binhex)"
    availableAesthetics={bin2dAesthetics}
    availableParams={binhexParams}
  />
);

interface StatDensityProps {
  params: StatDensityLayer;
  onChange: (layer: StatDensityLayer) => void;
  columns?: string[];
}

export const StatDensity: React.FC<StatDensityProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="密度估计 (stat_density)"
    availableAesthetics={densityAesthetics}
    availableParams={densityParams}
  />
);

interface StatDensity2dProps {
  params: StatDensity2dLayer;
  onChange: (layer: StatDensity2dLayer) => void;
  columns?: string[];
}

export const StatDensity2d: React.FC<StatDensity2dProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="二维密度估计 (stat_density_2d)"
    availableAesthetics={density2dAesthetics}
    availableParams={density2dParams}
  />
);

interface StatContourProps {
  params: StatContourLayer;
  onChange: (layer: StatContourLayer) => void;
  columns?: string[];
}

export const StatContour: React.FC<StatContourProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="等高线 (stat_contour)"
    availableAesthetics={contourAesthetics}
    availableParams={contourParams}
  />
);

interface StatContourFilledProps {
  params: StatContourFilledLayer;
  onChange: (layer: StatContourFilledLayer) => void;
  columns?: string[];
}

export const StatContourFilled: React.FC<StatContourFilledProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="填充等高线 (stat_contour_filled)"
    availableAesthetics={contourAesthetics}
    availableParams={contourParams}
  />
);

interface StatBoxplotProps {
  params: StatBoxplotLayer;
  onChange: (layer: StatBoxplotLayer) => void;
  columns?: string[];
}

export const StatBoxplot: React.FC<StatBoxplotProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="箱线图统计 (stat_boxplot)"
    availableAesthetics={boxplotAesthetics}
    availableParams={boxplotParams}
  />
);

interface StatYdensityProps {
  params: StatYdensityLayer;
  onChange: (layer: StatYdensityLayer) => void;
  columns?: string[];
}

export const StatYdensity: React.FC<StatYdensityProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="Y轴密度 (stat_ydensity)"
    availableAesthetics={ydensityAesthetics}
    availableParams={ydensityParams}
  />
);

interface StatEcdfProps {
  params: StatEcdfLayer;
  onChange: (layer: StatEcdfLayer) => void;
  columns?: string[];
}

export const StatEcdf: React.FC<StatEcdfProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="经验累积分布 (stat_ecdf)"
    availableAesthetics={ecdfAesthetics}
    availableParams={ecdfParams}
  />
);

interface StatQuantileProps {
  params: StatQuantileLayer;
  onChange: (layer: StatQuantileLayer) => void;
  columns?: string[];
}

export const StatQuantile: React.FC<StatQuantileProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="分位数回归 (stat_quantile)"
    availableAesthetics={quantileAesthetics}
    availableParams={quantileParams}
  />
);

interface StatSmoothProps {
  params: StatSmoothLayer;
  onChange: (layer: StatSmoothLayer) => void;
  columns?: string[];
}

export const StatSmooth: React.FC<StatSmoothProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="平滑曲线 (stat_smooth)"
    availableAesthetics={smoothAesthetics}
    availableParams={smoothParams}
  />
);

interface StatFunctionProps {
  params: StatFunctionLayer;
  onChange: (layer: StatFunctionLayer) => void;
  columns?: string[];
}

export const StatFunction: React.FC<StatFunctionProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="函数曲线 (stat_function)"
    availableAesthetics={functionAesthetics}
    availableParams={functionParams}
  />
);

interface StatQqProps {
  params: StatQqLayer;
  onChange: (layer: StatQqLayer) => void;
  columns?: string[];
}

export const StatQq: React.FC<StatQqProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="QQ图 (stat_qq)"
    availableAesthetics={qqAesthetics}
    availableParams={qqParams}
  />
);

interface StatQqLineProps {
  params: StatQqLineLayer;
  onChange: (layer: StatQqLineLayer) => void;
  columns?: string[];
}

export const StatQqLine: React.FC<StatQqLineProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="QQ图参考线 (stat_qq_line)"
    availableAesthetics={qqAesthetics}
    availableParams={qqLineParams}
  />
);

interface StatUniqueProps {
  params: StatUniqueLayer;
  onChange: (layer: StatUniqueLayer) => void;
  columns?: string[];
}

export const StatUnique: React.FC<StatUniqueProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="唯一值 (stat_unique)"
    availableAesthetics={identityAesthetics}
    availableParams={uniqueParams}
  />
);

interface StatIdentityProps {
  params: StatIdentityLayer;
  onChange: (layer: StatIdentityLayer) => void;
  columns?: string[];
}

export const StatIdentity: React.FC<StatIdentityProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="恒等变换 (stat_identity)"
    availableAesthetics={identityAesthetics}
    availableParams={identityParams}
  />
);

interface StatEllipseProps {
  params: StatEllipseLayer;
  onChange: (layer: StatEllipseLayer) => void;
  columns?: string[];
}

export const StatEllipse: React.FC<StatEllipseProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="置信椭圆 (stat_ellipse)"
    availableAesthetics={ellipseAesthetics}
    availableParams={ellipseParams}
  />
);
