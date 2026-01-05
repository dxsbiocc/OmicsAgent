import { ParameterConfig } from "../types";

export const linetypeOptions = [
  "solid",
  "dashed",
  "dotted",
  "dotdash",
  "longdash",
  "twodash",
];

export const lineendOptions = ["butt", "round", "square"];

export const linejoinOptions = ["round", "mitre", "bevel"];

export const palettesMapping = {
  Div: [
    "BrBG",
    "PiYG",
    "PRGn",
    "PuOr",
    "RdBu",
    "RdGy",
    "RdYlBu",
    "RdYlGn",
    "Spectral",
  ],
  Qual: [
    "Set1",
    "Set2",
    "Set3",
    "Pastel1",
    "Pastel2",
    "Paired",
    "Dark2",
    "Accent",
  ],
  Seq: [
    "Blues",
    "BuGn",
    "BuPu",
    "GnBu",
    "Greens",
    "Greys",
    "Oranges",
    "OrRd",
    "PuBu",
    "PuBuGn",
    "PuRd",
    "Purples",
    "RdPu",
    "Reds",
    "YlGn",
    "YlGnBu",
    "YlOrBr",
    "YlOrRd",
  ],
};

export const palettesOptions = Object.values(palettesMapping).flat();

export const transformOptions = [
  "asn",
  "atanh",
  "boxcox",
  "date",
  "exp",
  "hms",
  "identity",
  "log",
  "log10",
  "log1p",
  "log2",
  "logit",
  "modulus",
  "probability",
  "probit",
  "pseudo_log",
  "reciprocal",
  "reverse",
  "sqrt",
  "time",
];

// aesthetics types
export const availableAestheticsTypes = [
  "x",
  "y",
  "colour",
  "color",
  "fill",
  "alpha",
  "shape",
  "size",
  "label",
  "group",
  "width",
  "linewidth",
  "linetype",
  "order_by",
];

export const requiredAestheticsTypes = {
  geom_boxplot: ["x", "y"],
  geom_jitter: ["x", "y"],
  geom_point: ["x", "y"],
  geom_line: ["x", "y"],
  geom_bar: ["x", "y"],
  geom_col: ["x", "y"],
  geom_histogram: ["x"],
  geom_density: ["x"],
  geom_smooth: ["x", "y"],
  geom_violin: ["x", "y"],
  geom_tile: ["x", "y"],
  geom_rect: ["x", "y"],
  geom_raster: ["x", "y"],
  geom_quasirandom: ["x", "y"],
  ggsurvplot: ["group"],
  geom_text_repel: ["x", "y", "label"],
  geom_label_repel: ["x", "y", "label"],
};

// 可用的图层类型
export const availableLayerTypes = [
  // boxplot
  { type: "geom_boxplot", label: "Boxplot" },
  { type: "geom_round_boxplot", label: "Round Boxplot" }, // 圆角箱线图
  { type: "geom_half_round_boxplot", label: "Half Round Boxplot" }, // 半圆角箱线图
  { type: "geom_half_boxplot", label: "Half Boxplot (gghalves)" }, // 半箱线图
  { type: "geom_violin", label: "Violin" },
  { type: "geom_half_violin", label: "Half Violin (gghalves)" }, // 半小提琴图
  // points
  { type: "geom_jitter", label: "Jitter" },
  { type: "geom_point", label: "Point" },
  { type: "geom_half_point", label: "Half Point (gghalves)" }, // 半点图
  { type: "geom_half_point_panel", label: "Half Point Panel (gghalves)" }, // 半点图（面板版本）
  { type: "geom_count", label: "Count" },
  { type: "geom_dotplot", label: "Dotplot" },
  { type: "geom_half_dotplot", label: "Half Dotplot (gghalves)" }, // 半点图
  // line
  { type: "geom_abline", label: "Abline" },
  { type: "geom_hline", label: "Hline" },
  { type: "geom_vline", label: "Vline" },
  { type: "geom_path", label: "Path" },
  { type: "geom_line", label: "Line" },
  { type: "geom_step", label: "Step" },
  { type: "geom_segment", label: "Segment" },
  { type: "geom_curve", label: "Curve" },
  // bar
  { type: "geom_bar", label: "Bar" },
  { type: "geom_col", label: "Col" },
  { type: "geom_round_bar", label: "Round Bar" },
  { type: "geom_round_col", label: "Round Col" },
  { type: "geom_waffle", label: "Waffle" },
  // heatmap
  { type: "geom_bin_2d", label: "Bin2d" },
  { type: "geom_hex", label: "Hex" },
  // histogram
  { type: "geom_histogram", label: "Histogram" },
  { type: "geom_freqpoly", label: "Freqpoly" },
  { type: "geom_round_histogram", label: "Round Histogram" },
  // surface
  { type: "geom_contour", label: "Contour" },
  { type: "geom_contour_filled", label: "Contour Filled" },
  { type: "geom_sf", label: "SF" },
  { type: "geom_sf_text", label: "SF Text" },
  { type: "geom_sf_label", label: "SF Label" },
  // density
  { type: "geom_density", label: "Density" },
  { type: "geom_density_2d", label: "Density2d" },
  { type: "geom_density_2d_filled", label: "Density2d Filled" },
  // interval
  { type: "geom_errorbar", label: "Errorbar" },
  { type: "geom_errorbarh", label: "Errorbarh" },
  { type: "geom_linerange", label: "Linerange" },
  { type: "geom_pointrange", label: "Pointrange" },
  { type: "geom_crossbar", label: "Crossbar" },
  { type: "geom_round_crossbar", label: "Round Crossbar" },
  // polygons
  { type: "geom_map", label: "Map" },
  { type: "geom_polygon", label: "Polygon" },
  // qq plot
  { type: "geom_qq", label: "QQ" },
  { type: "geom_qq_line", label: "QQ Line" },
  // ribbon
  { type: "geom_ribbon", label: "Ribbon" },
  { type: "geom_area", label: "Area" },
  // rug
  { type: "geom_rug", label: "Rug" },
  // smooth
  { type: "geom_smooth", label: "Smooth" },
  // tile
  { type: "geom_tile", label: "Tile" },
  { type: "geom_round_tile", label: "Round Tile" },
  { type: "geom_round_tile", label: "Round Tile" },
  { type: "geom_raster", label: "Raster" },
  { type: "geom_rect", label: "Rect" },
  { type: "geom_round_rect", label: "Round Rect" },
  // label
  { type: "geom_label", label: "Label" },
  { type: "geom_text", label: "Text" },
  { type: "geom_text_repel", label: "Text Repel (ggrepel)" },
  { type: "geom_label_repel", label: "Label Repel (ggrepel)" },
  { type: "annotation_raster", label: "Annotation Raster" },
  // annotate
  { type: "annotate", label: "Annotate" },

  // extensions
  { type: "geom_signif", label: "Signif" },
  { type: "geom_quasirandom", label: "Quasirandom" },
  { type: "geom_textpath", label: "Textpath (geomtextpath)" },
  // linkET extensions
  { type: "geom_shaping", label: "Shaping (linkET)" },
  { type: "geom_annotate", label: "Annotate (linkET)" },
  { type: "geom_corr", label: "Corr (linkET)" },
  { type: "geom_curve2", label: "Curve2 (linkET)" },
  { type: "geom_doughnut", label: "Doughnut (linkET)" },
  { type: "geom_diag_label", label: "Diag Label (linkET)" },
  { type: "geom_square", label: "Square (linkET)" },
  { type: "geom_couple", label: "Couple (linkET)" },
  // ggcor extensions
  { type: "geom_link", label: "Link (ggcor)" },
  { type: "geom_mark", label: "Mark (ggcor)" },
  { type: "geom_number", label: "Number (ggcor)" },
  { type: "geom_pie2", label: "Pie2 (ggcor)" },
  { type: "geom_ring", label: "Ring (ggcor)" },
  { type: "geom_shade", label: "Shade (ggcor)" },
  { type: "geom_star", label: "Star (ggcor)" },
  { type: "add_link", label: "Add Link (ggcor)" },
  { type: "geom_cross", label: "Cross (ggcor)" },

  // stat functions
  { type: "stat_summary", label: "Stat Summary" },
  { type: "stat_summary_bin", label: "Stat Summary Bin" },
  { type: "stat_summary_2d", label: "Stat Summary 2D" },
  { type: "stat_summary_hex", label: "Stat Summary Hex" },
  { type: "stat_count", label: "Stat Count" },
  { type: "stat_bin", label: "Stat Bin" },
  { type: "stat_bin_2d", label: "Stat Bin 2D" },
  { type: "stat_binhex", label: "Stat Binhex" },
  { type: "stat_density", label: "Stat Density" },
  { type: "stat_density_2d", label: "Stat Density 2D" },
  { type: "stat_contour", label: "Stat Contour" },
  { type: "stat_contour_filled", label: "Stat Contour Filled" },
  { type: "stat_boxplot", label: "Stat Boxplot" },
  { type: "stat_ydensity", label: "Stat Ydensity" },
  { type: "stat_ecdf", label: "Stat ECDF" },
  { type: "stat_quantile", label: "Stat Quantile" },
  { type: "stat_smooth", label: "Stat Smooth" },
  { type: "stat_function", label: "Stat Function" },
  { type: "stat_qq", label: "Stat QQ" },
  { type: "stat_qq_line", label: "Stat QQ Line" },
  { type: "stat_unique", label: "Stat Unique" },
  { type: "stat_identity", label: "Stat Identity" },
  { type: "stat_ellipse", label: "Stat Ellipse" },

  // ggpubr stat functions
  { type: "stat_cor", label: "Stat Cor (ggpubr)" },
  { type: "stat_chull", label: "Stat Chull (ggpubr)" },
  { type: "stat_mean", label: "Stat Mean (ggpubr)" },
  { type: "stat_central_tendency", label: "Stat Central Tendency (ggpubr)" },
  { type: "stat_compare_means", label: "Stat Compare Means (ggpubr)" },
  { type: "stat_pvalue_manual", label: "Stat Pvalue Manual (ggpubr)" },
  { type: "stat_regline_equation", label: "Stat Regline Equation (ggpubr)" },
  { type: "stat_stars", label: "Stat Stars (ggpubr)" },
  { type: "stat_bracket", label: "Stat Bracket (ggpubr)" },
  { type: "stat_anova_test", label: "Stat ANOVA Test (ggpubr)" },
  { type: "stat_kruskal_test", label: "Stat Kruskal Test (ggpubr)" },
  { type: "stat_wilcox_test", label: "Stat Wilcox Test (ggpubr)" },
  { type: "stat_t_test", label: "Stat T Test (ggpubr)" },

  // survminer
  { type: "ggsurvplot", label: "Survival Plot (survminer)" },
];

// 可用的标度类型
export const availableScaleTypes = [
  // Position scales - X
  { type: "scale_x_continuous", label: "X Continuous" },
  { type: "scale_x_discrete", label: "X Discrete" },
  { type: "scale_x_log10", label: "X Log10" },
  { type: "scale_x_sqrt", label: "X Sqrt" },
  { type: "scale_x_reverse", label: "X Reverse" },
  { type: "scale_x_date", label: "X Date" },
  { type: "scale_x_datetime", label: "X Datetime" },
  { type: "scale_x_time", label: "X Time" },
  // Position scales - Y
  { type: "scale_y_continuous", label: "Y Continuous" },
  { type: "scale_y_discrete", label: "Y Discrete" },
  { type: "scale_y_log10", label: "Y Log10" },
  { type: "scale_y_sqrt", label: "Y Sqrt" },
  { type: "scale_y_reverse", label: "Y Reverse" },
  { type: "scale_y_date", label: "Y Date" },
  { type: "scale_y_datetime", label: "Y Datetime" },
  { type: "scale_y_time", label: "Y Time" },
  // Fill scales
  { type: "scale_fill_manual", label: "Fill Manual" },
  { type: "scale_fill_continuous", label: "Fill Continuous" },
  { type: "scale_fill_discrete", label: "Fill Discrete" },
  { type: "scale_fill_gradient", label: "Fill Gradient" },
  { type: "scale_fill_gradient2", label: "Fill Gradient2" },
  { type: "scale_fill_gradientn", label: "Fill GradientN" },
  { type: "scale_fill_viridis_c", label: "Fill Viridis C" },
  { type: "scale_fill_viridis_d", label: "Fill Viridis D" },
  { type: "scale_fill_brewer", label: "Fill Brewer" },
  { type: "scale_fill_distiller", label: "Fill Distiller" },
  { type: "scale_fill_fermenter", label: "Fill Fermenter" },
  { type: "scale_fill_steps", label: "Fill Steps" },
  { type: "scale_fill_steps2", label: "Fill Steps2" },
  { type: "scale_fill_stepsn", label: "Fill StepsN" },
  { type: "scale_fill_binned", label: "Fill Binned" },
  { type: "scale_fill_identity", label: "Fill Identity" },
  // Color scales (American spelling)
  { type: "scale_color_manual", label: "Color Manual" },
  { type: "scale_color_continuous", label: "Color Continuous" },
  { type: "scale_color_discrete", label: "Color Discrete" },
  { type: "scale_color_gradient", label: "Color Gradient" },
  { type: "scale_color_gradient2", label: "Color Gradient2" },
  { type: "scale_color_gradientn", label: "Color GradientN" },
  { type: "scale_color_viridis_c", label: "Color Viridis C" },
  { type: "scale_color_viridis_d", label: "Color Viridis D" },
  { type: "scale_color_brewer", label: "Color Brewer" },
  { type: "scale_color_distiller", label: "Color Distiller" },
  { type: "scale_color_fermenter", label: "Color Fermenter" },
  { type: "scale_color_steps", label: "Color Steps" },
  { type: "scale_color_steps2", label: "Color Steps2" },
  { type: "scale_color_stepsn", label: "Color StepsN" },
  { type: "scale_color_binned", label: "Color Binned" },
  { type: "scale_color_identity", label: "Color Identity" },
  // Colour scales (British spelling)
  { type: "scale_colour_manual", label: "Colour Manual" },
  { type: "scale_colour_continuous", label: "Colour Continuous" },
  { type: "scale_colour_discrete", label: "Colour Discrete" },
  { type: "scale_colour_gradient", label: "Colour Gradient" },
  { type: "scale_colour_gradient2", label: "Colour Gradient2" },
  { type: "scale_colour_gradientn", label: "Colour GradientN" },
  { type: "scale_colour_viridis_c", label: "Colour Viridis C" },
  { type: "scale_colour_viridis_d", label: "Colour Viridis D" },
  { type: "scale_colour_brewer", label: "Colour Brewer" },
  { type: "scale_colour_distiller", label: "Colour Distiller" },
  { type: "scale_colour_fermenter", label: "Colour Fermenter" },
  { type: "scale_colour_steps", label: "Colour Steps" },
  { type: "scale_colour_steps2", label: "Colour Steps2" },
  { type: "scale_colour_stepsn", label: "Colour StepsN" },
  { type: "scale_colour_binned", label: "Colour Binned" },
  { type: "scale_colour_identity", label: "Colour Identity" },
  // Size scales
  { type: "scale_size", label: "Size" },
  { type: "scale_size_continuous", label: "Size Continuous" },
  { type: "scale_size_binned", label: "Size Binned" },
  { type: "scale_size_area", label: "Size Area" },
  { type: "scale_size_binned_area", label: "Size Binned Area" },
  { type: "scale_size_manual", label: "Size Manual" },
  { type: "scale_size_identity", label: "Size Identity" },
  { type: "scale_radius", label: "Radius" },
  // Alpha scales
  { type: "scale_alpha", label: "Alpha" },
  { type: "scale_alpha_continuous", label: "Alpha Continuous" },
  { type: "scale_alpha_discrete", label: "Alpha Discrete" },
  { type: "scale_alpha_binned", label: "Alpha Binned" },
  { type: "scale_alpha_manual", label: "Alpha Manual" },
  { type: "scale_alpha_identity", label: "Alpha Identity" },
  // Shape scales
  { type: "scale_shape", label: "Shape" },
  { type: "scale_shape_discrete", label: "Shape Discrete" },
  { type: "scale_shape_manual", label: "Shape Manual" },
  { type: "scale_shape_identity", label: "Shape Identity" },
  // Linetype scales
  { type: "scale_linetype", label: "Linetype" },
  { type: "scale_linetype_discrete", label: "Linetype Discrete" },
  { type: "scale_linetype_manual", label: "Linetype Manual" },
  { type: "scale_linetype_identity", label: "Linetype Identity" },
  // Linewidth scales
  { type: "scale_linewidth", label: "Linewidth" },
  { type: "scale_linewidth_continuous", label: "Linewidth Continuous" },
  { type: "scale_linewidth_binned", label: "Linewidth Binned" },
  { type: "scale_linewidth_manual", label: "Linewidth Manual" },
  { type: "scale_linewidth_identity", label: "Linewidth Identity" },
];

// 可用的标度参数配置
export const availableScaleParams: ParameterConfig[] = [
  {
    name: "name",
    type: "string",
  },
  {
    name: "breaks",
    type: "strings",
  },
  {
    name: "labels",
    type: "strings",
  },
  {
    name: "limits",
    type: "strings",
  },
  {
    name: "expand",
    type: "numbers",
  },
  {
    name: "na.value",
    type: "color",
  },
  {
    name: "trans",
    type: "select",
    options: ["identity", "log", "log10", "sqrt", "reverse"],
  },
  {
    name: "position",
    type: "select",
    options: ["left", "right", "top", "bottom"],
  },
  {
    name: "values",
    type: "colors",
  },
  {
    name: "guide",
    type: "string",
  },
];

// 可用的坐标系统类型（已移除弃用的 coord_flip, coord_radial, coord_quickmap）
export const availableCoordinateTypes = [
  { type: "coord_cartesian", label: "Cartesian" },
  { type: "coord_polar", label: "Polar" },
  { type: "coord_fixed", label: "Fixed" },
  { type: "coord_trans", label: "Trans" },
  { type: "coord_map", label: "Map" },
  { type: "coord_sf", label: "SF" },
];

// 可用的主题类型
export const availableThemeTypes = [
  { type: "theme", label: "自定义主题" },
  { type: "theme_classic", label: "经典主题" },
  { type: "theme_minimal", label: "极简主题" },
  { type: "theme_bw", label: "黑白主题" },
  { type: "theme_dark", label: "暗色主题" },
  { type: "theme_prism", label: "Prism 风格主题" },
  { type: "theme_void", label: "空白主题" },
  { type: "theme_grey", label: "灰色主题" },
  { type: "theme_gray", label: "灰色主题" },
  { type: "theme_linedraw", label: "线框主题" },
  { type: "theme_light", label: "浅色主题" },
];

// 可用的指南类型
export const availableGuideTypes = [
  { type: "guide_legend", label: "图例" },
  { type: "guide_colorbar", label: "颜色条" },
  { type: "guide_colourbar", label: "颜色条" },
  { type: "guide_axis", label: "坐标轴" },
  { type: "guide_bins", label: "分箱" },
  { type: "guide_axis_logticks", label: "坐标轴对数刻度" },
  { type: "guide_axis_stack", label: "坐标轴堆叠" },
  { type: "guide_axis_theta", label: "坐标轴角度" },
  { type: "guide_custom", label: "自定义" },
  { type: "guide_none", label: "置空" },
  { type: "guide_prism_bracket", label: "Prism 中括号 (ggprism)" },
  { type: "guide_prism_minor", label: "Prism 次要刻度 (ggprism)" },
  { type: "guide_prism_offset", label: "Prism 偏移 (ggprism)" },
  { type: "guide_prism_offset_minor", label: "Prism 偏移次要刻度 (ggprism)" },
];
