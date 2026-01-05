"use client";

import { ParameterConfig, BaseConfig, AestheticConfig } from "../types";
import { GeomBase } from "../layers/GeomBase";

// ============== Base Ggpubr Stat Layer Type ==============
export interface GgpubrStatLayer extends BaseConfig {
  type: string;
  mapping?: AestheticConfig;
  arguments?: Record<string, any>;
}

// ============== Specific Ggpubr Stat Layer Types ==============
export interface StatCorLayer extends GgpubrStatLayer {
  type: "stat_cor";
}

export interface StatChullLayer extends GgpubrStatLayer {
  type: "stat_chull";
}

export interface StatMeanLayer extends GgpubrStatLayer {
  type: "stat_mean";
}

export interface StatCentralTendencyLayer extends GgpubrStatLayer {
  type: "stat_central_tendency";
}

export interface StatCompareLayer extends GgpubrStatLayer {
  type: "stat_compare_means";
}

export interface StatPvalueManualLayer extends GgpubrStatLayer {
  type: "stat_pvalue_manual";
}

export interface StatReglineEquationLayer extends GgpubrStatLayer {
  type: "stat_regline_equation";
}

export interface StatStarsLayer extends GgpubrStatLayer {
  type: "stat_stars";
}

export interface StatBracketLayer extends GgpubrStatLayer {
  type: "stat_bracket";
}

export interface StatAnovaSummaryLayer extends GgpubrStatLayer {
  type: "stat_anova_test";
}

export interface StatKruskalTestLayer extends GgpubrStatLayer {
  type: "stat_kruskal_test";
}

export interface StatWilcoxTestLayer extends GgpubrStatLayer {
  type: "stat_wilcox_test";
}

export interface StatTTestLayer extends GgpubrStatLayer {
  type: "stat_t_test";
}

// ============== Common Aesthetic Parameters ==============
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

// ============== Aesthetics ==============
const corAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "label",
];

const chullAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

const meanAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "fill",
  "alpha",
  "group",
  "shape",
  "size",
];

const centralTendencyAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "alpha",
  "group",
  "linetype",
  "linewidth",
];

const compareMeansAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "alpha",
  "group",
  "label",
];

const pvalueManualAesthetics: string[] = [
  "x",
  "xmin",
  "xmax",
  "y.position",
  "label",
  "colour",
  "alpha",
  "group",
];

const reglineEquationAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "alpha",
  "group",
  "label",
];

const starsAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "alpha",
  "group",
  "label",
];

const bracketAesthetics: string[] = [
  "xmin",
  "xmax",
  "y.position",
  "label",
  "colour",
  "alpha",
  "group",
];

const testAesthetics: string[] = [
  "x",
  "y",
  "colour",
  "alpha",
  "group",
  "label",
];

// ============== Parameters ==============
const statCorParams: ParameterConfig[] = [
  {
    name: "method",
    type: "select",
    options: ["pearson", "kendall", "spearman"],
    default: "pearson",
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
    name: "label.x.npc",
    type: "select",
    options: ["left", "center", "right", "middle"],
    default: "left",
  },
  {
    name: "label.y.npc",
    type: "select",
    options: ["top", "center", "bottom", "middle"],
    default: "top",
  },
  {
    name: "label.sep",
    type: "string",
    default: ", ",
  },
  {
    name: "output.type",
    type: "select",
    options: ["expression", "latex", "text"],
    default: "expression",
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
    name: "r.digits",
    type: "number",
    min: 0,
    max: 10,
    step: 1,
    default: 2,
  },
  {
    name: "p.digits",
    type: "number",
    min: 0,
    max: 10,
    step: 1,
    default: 3,
  },
  {
    name: "cor.coef.name",
    type: "select",
    options: ["r", "R", "rho", "tau"],
    default: "R",
  },
  {
    name: "r.accuracy",
    type: "number",
    min: 0,
    step: 0.001,
  },
  {
    name: "p.accuracy",
    type: "number",
    min: 0,
    step: 0.0001,
  },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const statChullParams: ParameterConfig[] = [
  ...commonAesParams,
  { name: "geom", type: "string" },
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const statMeanParams: ParameterConfig[] = [
  {
    name: "fun",
    type: "select",
    options: ["mean", "median"],
    default: "mean",
  },
  {
    name: "geom",
    type: "select",
    options: ["point", "crossbar", "errorbar", "line", "hline", "vline"],
    default: "point",
  },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const statCentralTendencyParams: ParameterConfig[] = [
  {
    name: "type",
    type: "select",
    options: ["mean", "median", "mode"],
    default: "mean",
  },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const statCompareMeansParams: ParameterConfig[] = [
  {
    name: "method",
    type: "select",
    options: ["t.test", "wilcox.test", "anova", "kruskal.test"],
    default: "wilcox.test",
  },
  {
    name: "method.args",
    type: "list",
  },
  {
    name: "ref.group",
    type: "string",
  },
  {
    name: "comparisons",
    type: "list",
  },
  {
    name: "hide.ns",
    type: "boolean",
    default: false,
  },
  {
    name: "label",
    type: "select",
    options: ["p.signif", "p.format", "p"],
    default: "p.signif",
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
    name: "label.x.npc",
    type: "select",
    options: ["left", "center", "right", "middle"],
    default: "left",
  },
  {
    name: "label.y.npc",
    type: "select",
    options: ["top", "center", "bottom", "middle"],
    default: "top",
  },
  {
    name: "step.increase",
    type: "number",
    min: 0,
    step: 0.01,
    default: 0.1,
  },
  {
    name: "tip.length",
    type: "number",
    min: 0,
    step: 0.01,
    default: 0.03,
  },
  {
    name: "bracket.size",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.3,
  },
  {
    name: "symnum.args",
    type: "list",
  },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const statPvalueManualParams: ParameterConfig[] = [
  {
    name: "label",
    type: "string",
    default: "p",
  },
  {
    name: "y.position",
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
    name: "step.increase",
    type: "number",
    min: 0,
    step: 0.01,
    default: 0,
  },
  {
    name: "step.group.by",
    type: "string",
  },
  {
    name: "tip.length",
    type: "number",
    min: 0,
    step: 0.01,
    default: 0.03,
  },
  {
    name: "bracket.size",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.3,
  },
  {
    name: "bracket.nudge.y",
    type: "number",
    step: 0.1,
    default: 0,
  },
  {
    name: "bracket.shorten",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0,
  },
  {
    name: "hide.ns",
    type: "boolean",
    default: false,
  },
  {
    name: "remove.bracket",
    type: "boolean",
    default: false,
  },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const statReglineEquationParams: ParameterConfig[] = [
  {
    name: "formula",
    type: "string",
    default: "y ~ x",
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
    name: "label.x.npc",
    type: "select",
    options: ["left", "center", "right", "middle"],
    default: "left",
  },
  {
    name: "label.y.npc",
    type: "select",
    options: ["top", "center", "bottom", "middle"],
    default: "top",
  },
  {
    name: "output.type",
    type: "select",
    options: ["expression", "latex", "text"],
    default: "expression",
  },
  {
    name: "aes.string",
    type: "boolean",
    default: false,
  },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const statStarsParams: ParameterConfig[] = [
  {
    name: "y.position",
    type: "number",
  },
  {
    name: "cutpoints",
    type: "numbers",
    default: [0, 0.0001, 0.001, 0.01, 0.05, 1],
  },
  {
    name: "symbols",
    type: "strings",
    default: ["****", "***", "**", "*", "ns"],
  },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const statBracketParams: ParameterConfig[] = [
  {
    name: "y.position",
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
    name: "label",
    type: "string",
  },
  {
    name: "step.increase",
    type: "number",
    min: 0,
    step: 0.01,
    default: 0,
  },
  {
    name: "step.group.by",
    type: "string",
  },
  {
    name: "tip.length",
    type: "number",
    min: 0,
    step: 0.01,
    default: 0.03,
  },
  {
    name: "bracket.size",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.3,
  },
  {
    name: "bracket.nudge.y",
    type: "number",
    step: 0.1,
    default: 0,
  },
  {
    name: "bracket.shorten",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0,
  },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

const statTestParams: ParameterConfig[] = [
  {
    name: "method",
    type: "string",
  },
  {
    name: "method.args",
    type: "list",
  },
  {
    name: "comparisons",
    type: "list",
  },
  {
    name: "ref.group",
    type: "string",
  },
  {
    name: "p.adjust.method",
    type: "select",
    options: [
      "holm",
      "hochberg",
      "hommel",
      "bonferroni",
      "BH",
      "BY",
      "fdr",
      "none",
    ],
    default: "holm",
  },
  {
    name: "label",
    type: "select",
    options: ["p.signif", "p.format", "p", "p.adj", "p.adj.signif"],
    default: "p.signif",
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
    name: "step.increase",
    type: "number",
    min: 0,
    step: 0.01,
    default: 0.1,
  },
  {
    name: "tip.length",
    type: "number",
    min: 0,
    step: 0.01,
    default: 0.03,
  },
  {
    name: "bracket.size",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.3,
  },
  {
    name: "hide.ns",
    type: "boolean",
    default: false,
  },
  ...commonAesParams,
  { name: "na.rm", type: "boolean", default: false },
  { name: "show.legend", type: "boolean", default: true },
  { name: "inherit.aes", type: "boolean", default: true },
];

// ============== Components ==============
interface StatCorProps {
  params: StatCorLayer;
  onChange: (layer: StatCorLayer) => void;
  columns?: string[];
}

export const StatCor: React.FC<StatCorProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="相关性统计 (stat_cor)"
    availableAesthetics={corAesthetics}
    availableParams={statCorParams}
  />
);

interface StatChullProps {
  params: StatChullLayer;
  onChange: (layer: StatChullLayer) => void;
  columns?: string[];
}

export const StatChull: React.FC<StatChullProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="凸包 (stat_chull)"
    availableAesthetics={chullAesthetics}
    availableParams={statChullParams}
  />
);

interface StatMeanProps {
  params: StatMeanLayer;
  onChange: (layer: StatMeanLayer) => void;
  columns?: string[];
}

export const StatMean: React.FC<StatMeanProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="均值点 (stat_mean)"
    availableAesthetics={meanAesthetics}
    availableParams={statMeanParams}
  />
);

interface StatCentralTendencyProps {
  params: StatCentralTendencyLayer;
  onChange: (layer: StatCentralTendencyLayer) => void;
  columns?: string[];
}

export const StatCentralTendency: React.FC<StatCentralTendencyProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="集中趋势 (stat_central_tendency)"
    availableAesthetics={centralTendencyAesthetics}
    availableParams={statCentralTendencyParams}
  />
);

interface StatCompareMeansProps {
  params: StatCompareLayer;
  onChange: (layer: StatCompareLayer) => void;
  columns?: string[];
}

export const StatCompareMeans: React.FC<StatCompareMeansProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="均值比较 (stat_compare_means)"
    availableAesthetics={compareMeansAesthetics}
    availableParams={statCompareMeansParams}
  />
);

interface StatPvalueManualProps {
  params: StatPvalueManualLayer;
  onChange: (layer: StatPvalueManualLayer) => void;
  columns?: string[];
}

export const StatPvalueManual: React.FC<StatPvalueManualProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="手动P值 (stat_pvalue_manual)"
    availableAesthetics={pvalueManualAesthetics}
    availableParams={statPvalueManualParams}
  />
);

interface StatReglineEquationProps {
  params: StatReglineEquationLayer;
  onChange: (layer: StatReglineEquationLayer) => void;
  columns?: string[];
}

export const StatReglineEquation: React.FC<StatReglineEquationProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="回归方程 (stat_regline_equation)"
    availableAesthetics={reglineEquationAesthetics}
    availableParams={statReglineEquationParams}
  />
);

interface StatStarsProps {
  params: StatStarsLayer;
  onChange: (layer: StatStarsLayer) => void;
  columns?: string[];
}

export const StatStars: React.FC<StatStarsProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="显著性星号 (stat_stars)"
    availableAesthetics={starsAesthetics}
    availableParams={statStarsParams}
  />
);

interface StatBracketProps {
  params: StatBracketLayer;
  onChange: (layer: StatBracketLayer) => void;
  columns?: string[];
}

export const StatBracket: React.FC<StatBracketProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="显著性括号 (stat_bracket)"
    availableAesthetics={bracketAesthetics}
    availableParams={statBracketParams}
  />
);

interface StatAnovaTestProps {
  params: StatAnovaSummaryLayer;
  onChange: (layer: StatAnovaSummaryLayer) => void;
  columns?: string[];
}

export const StatAnovaTest: React.FC<StatAnovaTestProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="方差分析 (stat_anova_test)"
    availableAesthetics={testAesthetics}
    availableParams={statTestParams}
  />
);

interface StatKruskalTestProps {
  params: StatKruskalTestLayer;
  onChange: (layer: StatKruskalTestLayer) => void;
  columns?: string[];
}

export const StatKruskalTest: React.FC<StatKruskalTestProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="Kruskal-Wallis检验 (stat_kruskal_test)"
    availableAesthetics={testAesthetics}
    availableParams={statTestParams}
  />
);

interface StatWilcoxTestProps {
  params: StatWilcoxTestLayer;
  onChange: (layer: StatWilcoxTestLayer) => void;
  columns?: string[];
}

export const StatWilcoxTest: React.FC<StatWilcoxTestProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="Wilcoxon检验 (stat_wilcox_test)"
    availableAesthetics={testAesthetics}
    availableParams={statTestParams}
  />
);

interface StatTTestProps {
  params: StatTTestLayer;
  onChange: (layer: StatTTestLayer) => void;
  columns?: string[];
}

export const StatTTest: React.FC<StatTTestProps> = ({
  params,
  onChange,
  columns = [],
}) => (
  <GeomBase
    params={params}
    onChange={onChange}
    columns={columns}
    title="T检验 (stat_t_test)"
    availableAesthetics={testAesthetics}
    availableParams={statTestParams}
  />
);
