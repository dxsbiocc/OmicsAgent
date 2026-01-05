export type FontFamilyConfig = "sans" | "serif" | "mono";
export type FontFaceConfig = "plain" | "bold" | "italic" | "bold.italic";

export type LineEndConfig = "round" | "butt" | "square";
export type LineJoinConfig = "round" | "mitre" | "bevel";
export type LineTypeConfig =
  | "blank"
  | "solid"
  | "dashed"
  | "dotted"
  | "dotdash"
  | "longdash"
  | "twodash";

export interface ParameterConfig {
  /** 参数名称 */
  name: string;
  /** 参数类型 */
  type:
    | "select"
    | "number"
    | "numbers"
    | "string"
    | "strings"
    | "list"
    | "boolean"
    | "color"
    | "colors"
    | "colorRamp2"
    | "element_blank"
    | "element_line"
    | "element_text"
    | "element_rect"
    | "element_markdown"
    | "element_point"
    | "element_polygon"
    | "element_geom"
    | "margin"
    | "unit"
    | "pair"
    | "arrow"
    | "position_dodge"
    | "position_dodge2"
    | "position_jitter"
    | "position_jitterdodge"
    | "position_stack"
    | "position_fill"
    | "position_nudge"
    | "position"
    | "strip"
    | "strip_vanilla"
    | "strip_themed"
    | "strip_nested"
    | "strip_split"
    | "strip_tag"
    | "marker"
    | "grob"
    | "gpar"
    | "guide";
  /** select 类型的选项列表 */
  options?: string[] | number[];
  /** 默认值 */
  default?: any;
  /** number 类型的最小值 */
  min?: number;
  /** number 类型的最大值 */
  max?: number;
  /** number 类型的步长 */
  step?: number;
  /** 是否必需（必需参数不能删除） */
  required?: boolean;
  /** 禁用条件函数，返回 true 时禁用该参数 */
  disabled?: (allParams: ParameterItem[], currentParamName: string) => boolean;
}

// grid
export interface UnitConfig {
  type: "unit";
  arguments?: {
    x: number | number[];
    units: string | string[];
  };
}

export interface GparConfig extends BaseConfig {
  type: "gpar";
  arguments?: {
    col?: string | string[]; // 支持颜色向量
    fill?: string | string[]; // 支持颜色向量
    alpha?: number | number[]; // 支持数字向量
    lty?: string | string[]; // 支持字符串向量
    lwd?: number | number[]; // 支持数字向量
    lex?: number | number[]; // 支持数字向量
    fontsize?: number | number[]; // 支持数字向量
    cex?: number | number[]; // 支持数字向量
    fontfamily?: string | string[]; // 支持字符串向量
    fontface?: string | string[]; // 支持字符串向量
    lineheight?: number | number[]; // 支持数字向量
    font?: number | number[]; // 支持数字向量
    lineend?: string | string[]; // 支持字符串向量
    linejoin?: string | string[]; // 支持字符串向量
    linemitre?: number | number[]; // 支持数字向量
    [key: string]: any;
  };
}

export interface ArrowConfig {
  type: "arrow";
  arguments?: {
    angle: number;
    length: UnitConfig;
    ends: string;
    type: string;
  };
}

// ggplot2
export interface BaseConfig {
  type: string;
  arguments?: {
    [key: string]: any;
  };
}

export interface AestheticConfig {
  x: string;
  y: string;
  color?: string;
  fill?: string;
  alpha?: string;
  shape?: string;
  size?: string;
  group?: string;
  width?: string;
  linewidth?: string;
  linetype?: string;
  order_by?: string;
  values?: string;
  [key: string]: any;
}

export interface Ggplot2Params {
  data: string;
  mapping: AestheticConfig;
  width: number;
  height: number;
  title: string;
}

// Layers
export interface BaseLayerArguments {
  color?: string | number;
  fill?: string | number;
  alpha?: number;
  "na.rm"?: boolean;
  "show.legend"?: boolean;
  "inherit.aes"?: boolean;
  [key: string]: any;
}

export interface BoxplotLayer extends BaseConfig {
  type: "geom_boxplot";
  mapping?: AestheticConfig;
  // Outliers
  arguments?: {
    position?: PositionConfig;
    outliers?: boolean;
    "outliers.colour"?: string | number;
    "outliers.fill"?: string | number;
    "outliers.shape"?: number;
    "outliers.size"?: number;
    "outliers.stroke"?: number;
    "outliers.alpha"?: number;

    // Whisker
    "whisker.colour"?: string | number;
    "whisker.linetype"?: string;
    "whisker.linewidth"?: number;

    // Staple
    "staple.colour"?: string | number;
    "staple.linetype"?: string;
    "staple.linewidth"?: number;

    // Median
    "median.colour"?: string | number;
    "median.linetype"?: string;
    "median.linewidth"?: number;

    // Box
    "box.colour"?: string | number;
    "box.linetype"?: string;
    "box.linewidth"?: number;

    notch?: boolean;
    notchwidth?: number;
    varwidth?: boolean;
    orientation?: "horizontal" | "vertical";
    "na.rm"?: boolean;
    "show.legend"?: boolean;
    "inherit.aes"?: boolean;
    // 简化的 boxplot 参数（来自 meta.json）
    fill?: string | number;
    alpha?: number;
  };
}

export interface JitterLayer extends BaseConfig {
  type: "geom_jitter";
  mapping?: AestheticConfig;
  arguments?: {
    width?: number;
    height?: number;
    size?: number;
    shape?: number;
    stroke?: number;
  } & BaseLayerArguments;
}

export interface PointLayer extends BaseConfig {
  type: "geom_point";
  mapping?: AestheticConfig;
  arguments?: {
    shape?: number;
    size?: number;
  } & BaseLayerArguments;
}

export interface ColLayer extends BaseConfig {
  type: "geom_col";
  mapping?: AestheticConfig;
  arguments?: {
    width?: number;
    just?: number;
    lineend?: string;
    linejoin?: string;
  } & BaseLayerArguments;
}

export interface LineLayer extends BaseConfig {
  type: "geom_line";
  mapping?: AestheticConfig;
  arguments?: {
    linetype?: string;
    linewidth?: number;
  } & BaseLayerArguments;
}

// Text layers
export interface TextLayer extends BaseConfig {
  type: "geom_text";
  mapping?: AestheticConfig;
  arguments?: {
    parse?: boolean;
    nudge_x?: number;
    nudge_y?: number;
    check_overlap?: boolean;
    size?: number;
    "size.unit"?: "pt" | "in" | "cm" | "mm" | "pc";
    hjust?: number | string;
    vjust?: number | string;
    angle?: number;
    family?: string;
    fontface?: string;
  } & BaseLayerArguments;
}

export interface LabelLayer extends BaseConfig {
  type: "geom_label";
  mapping?: AestheticConfig;
  arguments?: {
    parse?: boolean;
    nudge_x?: number;
    nudge_y?: number;
    "label.padding"?: number;
    "label.r"?: number;
    "label.size"?: number;
    size?: number;
    "size.unit"?: "pt" | "in" | "cm" | "mm" | "pc";
    hjust?: number | string;
    vjust?: number | string;
    angle?: number;
    family?: string;
    fontface?: string;
  } & BaseLayerArguments;
}

export interface TextRepelLayer extends BaseConfig {
  type: "geom_text_repel";
  mapping?: AestheticConfig;
  arguments?: {
    parse?: boolean;
    nudge_x?: number;
    nudge_y?: number;
    size?: number;
    "size.unit"?: "pt" | "in" | "cm" | "mm" | "pc";
    hjust?: number;
    vjust?: number;
    angle?: number;
    family?: string;
    fontface?: string;
    "box.padding"?: number;
    "point.padding"?: number;
    "segment.color"?: string;
    "segment.size"?: number;
    "segment.linetype"?: string;
    "segment.alpha"?: number;
    "segment.curvature"?: number;
    "segment.angle"?: number;
    "segment.ncp"?: number;
    "min.segment.length"?: number;
    arrow?: any;
    force?: number;
    force_pull?: number;
    "max.iter"?: number;
    direction?: "both" | "x" | "y";
    seed?: number;
    verbose?: boolean;
  } & BaseLayerArguments;
}

export interface LabelRepelLayer extends BaseConfig {
  type: "geom_label_repel";
  mapping?: AestheticConfig;
  arguments?: {
    parse?: boolean;
    nudge_x?: number;
    nudge_y?: number;
    "label.padding"?: number;
    "label.r"?: number;
    "label.size"?: number;
    size?: number;
    "size.unit"?: "pt" | "in" | "cm" | "mm" | "pc";
    hjust?: string;
    vjust?: string;
    angle?: number;
    family?: string;
    fontface?: string;
    "box.padding"?: number;
    "point.padding"?: number;
    "segment.color"?: string;
    "segment.size"?: number;
    "segment.linetype"?: string;
    "segment.alpha"?: number;
    "segment.curvature"?: number;
    "segment.angle"?: number;
    "segment.ncp"?: number;
    "min.segment.length"?: number;
    arrow?: any;
    force?: number;
    force_pull?: number;
    "max.iter"?: number;
    direction?: "both" | "x" | "y";
    seed?: number;
    verbose?: boolean;
  } & BaseLayerArguments;
}

export interface TextpathLayer extends BaseConfig {
  type: "geom_textpath";
  mapping?: AestheticConfig;
  arguments?: {
    text_only?: boolean;
    gap?: boolean;
    upright?: boolean;
    halign?: "center" | "left" | "right";
    offset?: number;
    parse?: boolean;
    straight?: boolean;
    padding?: number;
    text_smoothing?: number;
    rich?: boolean;
    remove_long?: boolean;
    size?: number;
    "size.unit"?: "pt" | "in" | "cm" | "mm" | "pc";
    hjust?: number | string;
    vjust?: number | string;
    angle?: number;
    family?: string;
    fontface?: string;
    colour?: string;
    color?: string;
    alpha?: number;
    linewidth?: number;
    linetype?: string;
  } & BaseLayerArguments;
}

// Curve layer
export interface CurveLayer extends BaseConfig {
  type: "geom_curve";
  mapping?: AestheticConfig;
  arguments?: {
    curvature?: number;
    angle?: number;
    ncp?: number;
    linewidth?: number;
    linetype?: string;
    lineend?: string;
    arrow?: any;
    "arrow.fill"?: string;
  } & BaseLayerArguments;
}

// Segment layer
export interface SegmentLayer extends BaseConfig {
  type: "geom_segment";
  mapping?: AestheticConfig;
  arguments?: {
    linewidth?: number;
    linetype?: string;
    lineend?: string;
    linejoin?: string;
    arrow?: any;
    "arrow.fill"?: string;
  } & BaseLayerArguments;
}

// Annotate layer
export interface AnnotateLayer extends BaseConfig {
  type: "annotate";
  arguments?: {
    geom?: string;
    x?: number | number[];
    y?: number | number[];
    xmin?: number | number[];
    xmax?: number | number[];
    ymin?: number | number[];
    ymax?: number | number[];
    xend?: number | number[];
    yend?: number | number[];
    label?: string | string[];
    fill?: string | string[];
    colour?: string | string[];
    alpha?: number | number[];
    hjust?: number | number[];
    vjust?: number | number[];
    size?: number | number[];
    angle?: number | number[];
    family?: string;
    fontface?: string;
    linewidth?: number;
    linetype?: string;
    // annotation_raster 专用参数
    raster?: any;
    interpolate?: boolean;
    "na.rm"?: boolean;
    [key: string]: any;
  };
}

// Reference line layers
export interface AblineLayer extends BaseConfig {
  type: "geom_abline";
  mapping?: AestheticConfig;
  arguments?: {
    intercept?: number | number[];
    slope?: number | number[];
    linetype?: string;
    linewidth?: number;
  } & BaseLayerArguments;
}

export interface HlineLayer extends BaseConfig {
  type: "geom_hline";
  mapping?: AestheticConfig;
  arguments?: {
    yintercept?: number | number[];
    linetype?: string;
    linewidth?: number;
  } & BaseLayerArguments;
}

export interface VlineLayer extends BaseConfig {
  type: "geom_vline";
  mapping?: AestheticConfig;
  arguments?: {
    xintercept?: number | number[];
    linetype?: string;
    linewidth?: number;
  } & BaseLayerArguments;
}

// extensions geom layers
// Round Boxplot
export interface RoundBoxplotLayer extends BaseConfig {
  type: "geom_round_boxplot";
  mapping?: AestheticConfig;
  arguments?: {
    radius?: number;
  } & BoxplotLayer["arguments"];
}

// Round geometries from gground package
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

// gghalves 包的 geom_half_* 组件
export interface HalfViolinLayer extends BaseConfig {
  type: "geom_half_violin";
  mapping?: AestheticConfig;
  arguments?: {
    side?: "l" | "r" | "left" | "right";
    nudge?: number;
    draw_quantiles?: number | number[];
    trim?: boolean;
    scale?: "area" | "count" | "width";
    bw?: string;
    adjust?: number;
  } & BaseLayerArguments;
}

export interface HalfPointLayer extends BaseConfig {
  type: "geom_half_point";
  mapping?: AestheticConfig;
  arguments?: {
    side?: "l" | "r" | "left" | "right";
    nudge?: number;
    size?: number;
    shape?: number;
    stroke?: number;
    alpha?: number;
  } & BaseLayerArguments;
}

export interface HalfPointPanelLayer extends BaseConfig {
  type: "geom_half_point_panel";
  mapping?: AestheticConfig;
  arguments?: {
    side?: "l" | "r" | "left" | "right";
    nudge?: number;
    size?: number;
    shape?: number;
    stroke?: number;
    alpha?: number;
  } & BaseLayerArguments;
}

export interface HalfDotplotLayer extends BaseConfig {
  type: "geom_half_dotplot";
  mapping?: AestheticConfig;
  arguments?: {
    side?: "l" | "r" | "left" | "right";
    nudge?: number;
    binaxis?: "x" | "y";
    binwidth?: number;
    binpositions?: "all" | "bygroup";
    stackdir?: "up" | "down" | "center" | "centerwhole";
    stackratio?: number;
    dotsize?: number;
    stackgroups?: boolean;
    method?: "dotdensity" | "histodot";
    origin?: number;
    right?: boolean;
    width?: number;
    drop?: boolean;
  } & BaseLayerArguments;
}

export interface HalfBoxplotLayer extends BaseConfig {
  type: "geom_half_boxplot";
  mapping?: AestheticConfig;
  arguments?: {
    side?: "l" | "r" | "left" | "right";
    nudge?: number;
    outliers?: boolean;
    notch?: boolean;
    notchwidth?: number;
    varwidth?: boolean;
    orientation?: "horizontal" | "vertical";
  } & BaseLayerArguments;
}
// Signif
export interface SignifLayer extends BaseConfig {
  type: "geom_signif";
  mapping?: AestheticConfig;
  arguments?: {
    comparisons?: string[];
    test?: string;
    "test.args"?: string;
    annotations?: string[];
    map_signif_level?: string;
    step_increase?: number;
    margin_top?: number;
    y_position?: number;
    xmin?: number;
    xmax?: number;
    tip_length?: number;
    size?: number;
    textsize?: number;
    family?: FontFamilyConfig;
    vjust?: number;
    orientation?: "x" | "y";
    extend_line?: number;
  } & BaseLayerArguments;
}

// Bezier
export interface BezierLayer extends BaseConfig {
  type: "geom_bezier";
  mapping?: AestheticConfig;
  arguments?: {
    position?: PositionConfig;
    n?: number;
    arrow?: ArrowConfig;
    lineend?: LineEndConfig;
  } & BaseLayerArguments;
}

export interface GgsurvplotLayer extends BaseConfig {
  type: "ggsurvplot";
  mapping?: AestheticConfig;
  arguments?: {
    title?: string;
    pval?: boolean;
    "break.time.by"?: number;
    censor?: boolean;
    "risk.table"?: boolean;
    legend?: [number, number];
    "legend.title"?: any;
    ggtheme?: any[];
  } & BaseLayerArguments;
}

export interface RasterLayer extends BaseConfig {
  type: "geom_raster";
  mapping?: AestheticConfig;
  arguments?: {
    hjust?: number;
    vjust?: number;
    interpolate?: boolean;
    "na.rm"?: boolean;
    "show.legend"?: boolean;
    "inherit.aes"?: boolean;
  } & BaseLayerArguments;
}

export interface AnnotationRasterLayer extends BaseConfig {
  type: "annotation_raster";
  arguments?: {
    raster?: string[];
    resolution?: number;
    direction?: "horizontal" | "vertical";
    interpolate?: boolean;
    xmin?: number;
    xmax?: number;
    ymin?: number;
    ymax?: number;
  } & BaseLayerArguments;
}

export interface WaffleLayer extends BaseConfig {
  type: "geom_waffle";
  mapping?: AestheticConfig;
  arguments?: {
    n_rows?: number;
    make_proportional?: boolean;
    flip?: boolean;
    radius?: number;
    color?: string;
    colour?: string;
  } & BaseLayerArguments;
}

// Marker 配置（用于 linkET 的 geom_shaping）
export interface MarkerConfig extends BaseConfig {
  type: "marker";
  arguments?: {
    x?:
      | "square"
      | "circle"
      | "star"
      | "heart"
      | "ellipse"
      | "cross"
      | "triangle"
      | "triangle2";
    [key: string]: any;
  };
}

// linkET 包的 geom_* 组件
export interface ShapingLayer extends BaseConfig {
  type: "geom_shaping";
  mapping?: AestheticConfig;
  arguments?: {
    marker?: MarkerConfig;
  } & BaseLayerArguments;
}

export interface LinkETAnnotateLayer extends BaseConfig {
  type: "geom_annotate";
  mapping?: AestheticConfig;
  arguments?: {
    geom?: string;
    x?: number | number[];
    y?: number | number[];
    xmin?: number | number[];
    xmax?: number | number[];
    ymin?: number | number[];
    ymax?: number | number[];
    xend?: number | number[];
    yend?: number | number[];
  } & BaseLayerArguments;
}

export interface CorrLayer extends BaseConfig {
  type: "geom_corr";
  mapping?: AestheticConfig;
  arguments?: {
    r?: number | number[];
    p?: number | number[];
    digits?: number;
    sig_level?: number | number[];
    insig?: string;
    pch?: number | string;
    "pch.col"?: string;
    "pch.cex"?: number;
    label?: string;
    "label.x"?: number;
    "label.y"?: number;
    "label.sep"?: string;
    "label.r"?: number;
    "label.p"?: number;
  } & BaseLayerArguments;
}

export interface Curve2Layer extends BaseConfig {
  type: "geom_curve2";
  mapping?: AestheticConfig;
  arguments?: {
    curvature?: number;
    angle?: number;
    ncp?: number;
    arrow?: ArrowConfig;
    lineend?: string;
    linejoin?: string;
    linemitre?: number;
  } & BaseLayerArguments;
}

export interface DoughnutLayer extends BaseConfig {
  type: "geom_doughnut";
  mapping?: AestheticConfig;
  arguments?: {
    "inner.radius"?: number;
    "outer.radius"?: number;
    start?: number;
    end?: number;
  } & BaseLayerArguments;
}

export interface DiagLabelLayer extends BaseConfig {
  type: "geom_diag_label";
  mapping?: AestheticConfig;
  arguments?: {
    label?: string;
    angle?: number;
    hjust?: number;
    vjust?: number;
    size?: number;
    family?: string;
    fontface?: string;
  } & BaseLayerArguments;
}

export interface SquareLayer extends BaseConfig {
  type: "geom_square";
  mapping?: AestheticConfig;
  arguments?: {
    width?: number;
    height?: number;
    radius?: number;
  } & BaseLayerArguments;
}

export interface CoupleLayer extends BaseConfig {
  type: "geom_couple";
  mapping?: AestheticConfig;
  arguments?: {
    curvature?: number | BaseConfig;
    angle?: number;
    ncp?: number;
    arrow?: ArrowConfig;
    lineend?: string;
    linejoin?: string;
    linemitre?: number;
    linewidth?: number;
    linetype?: string;
  } & BaseLayerArguments;
}

// ========== ggcor package layers ==========
export interface GgcorLinkLayer extends BaseConfig {
  type: "geom_link";
  mapping?: AestheticConfig;
  arguments?: {
    type?: "upper" | "lower" | "full";
    curvature?: number;
    angle?: number;
    ncp?: number;
    arrow?: ArrowConfig;
    lineend?: string;
    linejoin?: string;
    linemitre?: number;
    linewidth?: number;
    linetype?: string;
  } & BaseLayerArguments;
}

export interface GgcorMarkLayer extends BaseConfig {
  type: "geom_mark";
  mapping?: AestheticConfig;
  arguments?: {
    type?: "upper" | "lower" | "full";
    shape?: number;
    size?: number;
  } & BaseLayerArguments;
}

export interface GgcorNumberLayer extends BaseConfig {
  type: "geom_number";
  mapping?: AestheticConfig;
  arguments?: {
    type?: "upper" | "lower" | "full";
    num?: number | string;
    digits?: number;
    size?: number;
    family?: string;
    fontface?: string;
    colour?: string;
    color?: string;
  } & BaseLayerArguments;
}

export interface GgcorPie2Layer extends BaseConfig {
  type: "geom_pie2";
  mapping?: AestheticConfig;
  arguments?: {
    type?: "upper" | "lower" | "full";
    r0?: number;
    r1?: number;
    start?: number;
    end?: number;
  } & BaseLayerArguments;
}

export interface GgcorRingLayer extends BaseConfig {
  type: "geom_ring";
  mapping?: AestheticConfig;
  arguments?: {
    type?: "upper" | "lower" | "full";
    r0?: number;
    r1?: number;
    start?: number;
    end?: number;
  } & BaseLayerArguments;
}

export interface GgcorShadeLayer extends BaseConfig {
  type: "geom_shade";
  mapping?: AestheticConfig;
  arguments?: {
    type?: "upper" | "lower" | "full";
    r0?: number;
    r1?: number;
    start?: number;
    end?: number;
  } & BaseLayerArguments;
}

export interface GgcorSquareLayer extends BaseConfig {
  type: "geom_square";
  mapping?: AestheticConfig;
  arguments?: {
    type?: "upper" | "lower" | "full";
    width?: number;
    height?: number;
    radius?: number;
  } & BaseLayerArguments;
}

export interface GgcorStarLayer extends BaseConfig {
  type: "geom_star";
  mapping?: AestheticConfig;
  arguments?: {
    type?: "upper" | "lower" | "full";
    n?: number;
    r0?: number;
    r1?: number;
    angle?: number;
  } & BaseLayerArguments;
}

export interface GgcorAddLinkLayer extends BaseConfig {
  type: "add_link";
  mapping?: AestheticConfig;
  arguments?: {
    "diag.label"?: boolean;
    "on.left"?: boolean;
    curvature?: number | number[];
  } & BaseLayerArguments;
}

export interface GgcorCrossLayer extends BaseConfig {
  type: "geom_cross";
  mapping?: AestheticConfig;
  arguments?: {
    type?: "upper" | "lower" | "full";
    filters?: string[];
    "sig.level"?: number;
    size?: number;
    colour?: string;
    alpha?: number;
  } & BaseLayerArguments;
}

export type Layer =
  | BoxplotLayer
  | JitterLayer
  | PointLayer
  | ColLayer
  | LineLayer
  | TextLayer
  | LabelLayer
  | TextRepelLayer
  | LabelRepelLayer
  | TextpathLayer
  | WaffleLayer
  | CurveLayer
  | SegmentLayer
  | AnnotateLayer
  | AblineLayer
  | HlineLayer
  | VlineLayer
  | SignifLayer
  | CrossbarLayer
  | ErrorbarLayer
  | LinerangeLayer
  | PointrangeLayer
  | ErrorbarhLayer
  | GgsurvplotLayer
  | RasterLayer
  | AnnotationRasterLayer
  | RoundColLayer
  | RoundRectLayer
  | RoundTileLayer
  | RoundBarLayer
  | RoundCrossbarLayer
  | RoundHistogramLayer
  | HalfRoundBoxplotLayer
  | HalfViolinLayer
  | HalfPointLayer
  | HalfPointPanelLayer
  | HalfDotplotLayer
  | HalfBoxplotLayer
  | ShapingLayer
  | LinkETAnnotateLayer
  | CorrLayer
  | Curve2Layer
  | DoughnutLayer
  | DiagLabelLayer
  | SquareLayer
  | CoupleLayer
  | GgcorLinkLayer
  | GgcorMarkLayer
  | GgcorNumberLayer
  | GgcorPie2Layer
  | GgcorRingLayer
  | GgcorShadeLayer
  | GgcorSquareLayer
  | GgcorStarLayer
  | GgcorAddLinkLayer
  | GgcorCrossLayer
  | { type: string; arguments?: { [key: string]: any } };

// Interval layers
export interface CrossbarLayer extends BaseConfig {
  type: "geom_crossbar";
  mapping?: AestheticConfig;
  arguments?: {
    fatten?: number;
    width?: number;
    linewidth?: number;
    linetype?: string;
  } & BaseLayerArguments;
}

export interface ErrorbarLayer extends BaseConfig {
  type: "geom_errorbar";
  mapping?: AestheticConfig;
  arguments?: {
    width?: number;
    linewidth?: number;
    linetype?: string;
  } & BaseLayerArguments;
}

export interface LinerangeLayer extends BaseConfig {
  type: "geom_linerange";
  mapping?: AestheticConfig;
  arguments?: {
    linewidth?: number;
    linetype?: string;
  } & BaseLayerArguments;
}

export interface PointrangeLayer extends BaseConfig {
  type: "geom_pointrange";
  mapping?: AestheticConfig;
  arguments?: {
    fatten?: number;
    linewidth?: number;
    linetype?: string;
    size?: number;
    shape?: number;
    stroke?: number;
  } & BaseLayerArguments;
}

export interface ErrorbarhLayer extends BaseConfig {
  type: "geom_errorbarh";
  mapping?: AestheticConfig;
  arguments?: {
    height?: number;
    linewidth?: number;
    linetype?: string;
  } & BaseLayerArguments;
}

// Labs (标签配置)
export interface LabsConfig extends BaseConfig {
  type: "labs";
  arguments?: {
    title?: string;
    x?: string;
    y?: string;
    subtitle?: string;
    caption?: string;
  };
}

// Lims (坐标轴范围配置)
export interface LimsConfig extends BaseConfig {
  type: "lims";
  arguments?: {
    x?: number[];
    y?: number[];
  };
}

// Theme 配置
export interface ThemeConfig extends BaseConfig {
  type:
    | "theme"
    | "theme_classic"
    | "theme_minimal"
    | "theme_bw"
    | "theme_dark"
    | "theme_prism"
    | "theme_void"
    | "theme_grey"
    | "theme_gray"
    | "theme_linedraw"
    | "theme_light";
}

export interface ScaleConfig extends BaseConfig {
  type:
    | "scale_x_continuous"
    | "scale_y_continuous"
    | "scale_x_discrete"
    | "scale_y_discrete"
    | "scale_x_log10"
    | "scale_y_log10"
    | "scale_x_sqrt"
    | "scale_y_sqrt"
    | "scale_x_reverse"
    | "scale_y_reverse"
    | "scale_fill_manual"
    | "scale_color_manual"
    | "scale_colour_manual"
    | "scale_fill_continuous"
    | "scale_color_continuous"
    | "scale_colour_continuous"
    | "scale_fill_discrete"
    | "scale_color_discrete"
    | "scale_colour_discrete"
    | "scale_fill_gradient"
    | "scale_color_gradient"
    | "scale_colour_gradient"
    | "scale_fill_gradient2"
    | "scale_color_gradient2"
    | "scale_colour_gradient2"
    | "scale_fill_viridis_c"
    | "scale_color_viridis_c"
    | "scale_colour_viridis_c"
    | "scale_fill_viridis_d"
    | "scale_color_viridis_d"
    | "scale_colour_viridis_d"
    | string; // 允许其他 scale 类型
}

// Guide 单项配置
export interface GuideItemConfig extends BaseConfig {
  type:
    | "guide_legend"
    | "guide_colorbar"
    | "guide_colourbar"
    | "guide_colorsteps"
    | "guide_coloursteps"
    | "guide_axis"
    | "guide_bins"
    | "guide_axis_logticks"
    | "guide_axis_stack"
    | "guide_prism_bracket"
    | "guide_prism_minor"
    | "guide_prism_offset"
    | "guide_prism_offset_minor"
    | "guide_axis_theta"
    | "guide_custom"
    | "guide_none";
}

// Guides 配置：键是美学映射名称（如 fill, color, x, y 等），值是 GuideItemConfig
export interface GuideConfig {
  [aesthetic: string]: GuideItemConfig;
}

export interface FacetConfig extends BaseConfig {
  type: "facet_grid" | "facet_wrap" | "facet_wrap2";
  arguments?: {
    facets?: string | string[];
    rows?: string | string[];
    cols?: string | string[];
    strip?: any; // strip_themed, strip_nested, strip_vanilla 等配置对象
    [key: string]: any;
  };
}

export interface CoordinateConfig extends BaseConfig {
  type:
    | "coord_cartesian"
    | "coord_polar"
    | "coord_radial"
    | "coord_fixed"
    | "coord_trans"
    | "coord_map"
    | "coord_sf";
  arguments?: {
    xlim?: string | string[];
    ylim?: string | string[];
    expand?: boolean;
    clip?: "on" | "off";
    theta?: "x" | "y";
    start?: number;
    direction?: 1 | -1;
    ratio?: number;
    x?: string;
    y?: string;
    [key: string]: any;
  };
}

// linkET 的 correlate 配置
export interface CorrelateConfig {
  method?: "pearson" | "spearman" | "kendall";
  engine?: "default" | "WGCNA" | "picante" | "Hmisc" | "psych";
  [key: string]: any;
}

// linkET 的 qcorrplot 配置
export interface QcorrplotConfig extends BaseConfig {
  type: "qcorrplot";
  mapping?: AestheticConfig;
  arguments?: {
    type?: "upper" | "lower" | "full";
    drop?: boolean;
    parse?: boolean | string;
    grid_col?: string;
    grid_size?: number;
    fixed?: boolean;
    facets?: any; // facet_wrap parameters list
    facets_order?: string[];
    [key: string]: any;
  };
}

// 完整的 ggplot2 配置
export interface Ggplot2Config {
  mapping: AestheticConfig;
  layers: Layer[];
  scales?: ScaleConfig[];
  guides?: GuideConfig;
  facets?: FacetConfig;
  coordinates?: CoordinateConfig;
  labs?: LabsConfig;
  lims?: LimsConfig;
  themes?: ThemeConfig[];
  correlate?: CorrelateConfig;
  qcorrplot?: QcorrplotConfig;
  width?: number;
  height?: number;
}

// element
export interface MarginConfig {
  type: "margin";
  arguments?: {
    t: number;
    r: number;
    b: number;
    l: number;
    units: "pt" | "in" | "cm" | "mm" | "px" | "pc";
  };
}

export interface ElementBlankConfig extends BaseConfig {
  type: "element_blank";
  arguments: {};
}

export interface ElementTextConfig extends BaseConfig {
  type: "element_text";
  arguments?: {
    family: FontFamilyConfig | null;
    face: FontFaceConfig | null;
    colour: string;
    size: number;
    hjust: number;
    vjust: number;
    angle: number;
    lineheight: number;
    color: string;
    margin: MarginConfig | null;
    debug: boolean;
    "inherit.blank": boolean;
  };
}

export interface ElementMarkdownConfig extends BaseConfig {
  type: "element_markdown";
  arguments?: {
    family: FontFamilyConfig | null;
    face: FontFaceConfig | null;
    colour: string;
    size: number;
    hjust: number;
    vjust: number;
    angle: number;
    lineheight: number;
    color: string;
    fill: string;
    "box.colour": string;
    linetype: LineTypeConfig | null;
    linewidth: number;
    padding: MarginConfig | null;
    r: number;
    align_widths: boolean;
    align_heights: boolean;
    rotate_margins: boolean;
    margin: MarginConfig | null;
    debug: boolean;
    "inherit.blank": boolean;
  };
}

export interface ElementRectConfig extends BaseConfig {
  type: "element_rect";
  arguments?: {
    fill: string;
    colour: string;
    linewidth: number;
    linetype: LineTypeConfig | null;
    color: string;
    linejoin: LineJoinConfig | null;
    "inherit.blank": boolean;
  };
}

export interface ElementLineConfig extends BaseConfig {
  type: "element_line";
  arguments?: {
    colour: string;
    linewidth: number;
    linetype: LineTypeConfig | null;
    lineend: LineEndConfig | null;
    color: string;
    linejoin: LineJoinConfig | null;
    arrow: ArrowConfig | null;
    "arrow.fill": string;
    "inherit.blank": boolean;
  };
}

export interface ElementPointConfig extends BaseConfig {
  type: "element_point";
  arguments?: {
    colour: string;
    shape: number;
    size: number;
    fill: string;
    stroke: number;
    color: string;
    "inherit.blank": boolean;
  };
}

export interface ElementPolygonConfig extends BaseConfig {
  type: "element_polygon";
  arguments?: {
    fill: string;
    colour: string;
    linewidth: number;
    linetype: LineTypeConfig | null;
    color: string;
    linejoin: LineJoinConfig | null;
    "inherit.blank": boolean;
  };
}

export interface ElementGeomConfig extends BaseConfig {
  type: "element_geom";
  arguments?: {
    ink: string;
    paper: string;
    accent: string;
    linewidth: number;
    borderwidth: number;
    linetype: LineTypeConfig | null;
    bordertype: LineTypeConfig | null;
    family: FontFamilyConfig | null;
    fontsize: number;
    pointsize: number;
    pointshape: number;
    colour: string;
    color: string;
    fill: string;
  };
}

// Position 配置
export interface PositionDodgeConfig extends BaseConfig {
  type: "position_dodge";
  arguments?: {
    width?: number;
    preserve?: "total" | "single";
  };
}

export interface PositionDodge2Config extends BaseConfig {
  type: "position_dodge2";
  arguments?: {
    width?: number;
    preserve?: "total" | "single";
    padding?: number;
    reverse?: boolean;
  };
}

export interface PositionJitterConfig extends BaseConfig {
  type: "position_jitter";
  arguments?: {
    width?: number;
    height?: number;
    seed?: number;
  };
}

export interface PositionJitterdodgeConfig extends BaseConfig {
  type: "position_jitterdodge";
  arguments?: {
    "jitter.width"?: number;
    "jitter.height"?: number;
    "dodge.width"?: number;
    seed?: number;
  };
}

export interface PositionStackConfig extends BaseConfig {
  type: "position_stack";
  arguments?: {
    vjust?: number;
    reverse?: boolean;
  };
}

export interface PositionFillConfig extends BaseConfig {
  type: "position_fill";
  arguments?: {
    vjust?: number;
    reverse?: boolean;
  };
}

export interface PositionNudgeConfig extends BaseConfig {
  type: "position_nudge";
  arguments?: {
    x?: number;
    y?: number;
  };
}

export type PositionConfig = GenericPositionConfig;

// 通用的 Position 配置（用于 position 类型参数，可以选择不同的 position_* 类型）
export interface GenericPositionConfig extends BaseConfig {
  type:
    | "position_dodge"
    | "position_dodge2"
    | "position_jitter"
    | "position_jitterdodge"
    | "position_stack"
    | "position_fill"
    | "position_nudge";
  arguments?: {
    [key: string]: any;
  };
}

// Strip 配置类型（ggh4x 包）
export type StripConfig =
  | StripThemedConfig
  | StripNestedConfig
  | StripSplitConfig
  | StripVanillaConfig
  | StripTagConfig;

// 通用的 Strip 配置（用于 strip 类型参数，可以选择不同的 strip_* 类型）
export interface GenericStripConfig extends BaseConfig {
  type:
    | "strip_vanilla"
    | "strip_themed"
    | "strip_nested"
    | "strip_split"
    | "strip_tag";
  arguments?: {
    [key: string]: any;
  };
}

export interface StripThemedConfig extends BaseConfig {
  type: "strip_themed";
  arguments?: {
    clip?: "inherit" | "on" | "off";
    size?: "constant" | "variable";
    text_x?: any; // elem_list_text 配置对象
    text_y?: any; // elem_list_text 配置对象
    background_x?: any; // elem_list_rect 配置对象
    background_y?: any; // elem_list_rect 配置对象
    by_layer_x?: boolean;
    by_layer_y?: boolean;
  };
}

export interface StripNestedConfig extends BaseConfig {
  type: "strip_nested";
  arguments?: {
    clip?: "inherit" | "on" | "off";
    size?: "constant" | "variable";
    text_x?: any; // elem_list_text 配置对象
    text_y?: any; // elem_list_text 配置对象
    background_x?: any; // elem_list_rect 配置对象
    background_y?: any; // elem_list_rect 配置对象
    by_layer_x?: boolean;
    by_layer_y?: boolean;
    bleed?: boolean;
  };
}

export interface StripSplitConfig extends BaseConfig {
  type: "strip_split";
  arguments?: {
    position?: string | string[]; // "top" | "bottom" | "left" | "right"
    clip?: "inherit" | "on" | "off";
    size?: "constant" | "variable";
    bleed?: boolean;
    text_x?: any; // elem_list_text 配置对象
    text_y?: any; // elem_list_text 配置对象
    background_x?: any; // elem_list_rect 配置对象
    background_y?: any; // elem_list_rect 配置对象
    by_layer_x?: boolean;
    by_layer_y?: boolean;
  };
}

export interface StripVanillaConfig extends BaseConfig {
  type: "strip_vanilla";
  arguments?: {
    clip?: "inherit" | "on" | "off";
    size?: "constant" | "variable";
  };
}

export interface StripTagConfig extends BaseConfig {
  type: "strip_tag";
  arguments?: {
    clip?: "inherit" | "on" | "off";
    order?: string | string[]; // e.g., ["x", "y"]
    just?: number[]; // [hjust, vjust]
  };
}

// DynamicParams
export interface ParameterItem {
  name: string;
  value: any;
}
