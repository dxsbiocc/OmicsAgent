import { palettesOptions, transformOptions } from "../common/constants";
import { ParameterConfig } from "../types";

// ==================== 基础参数定义 ====================

// 通用参数
const commonParams: ParameterConfig[] = [
  {
    name: "name",
    type: "string",
  },
  // Note: guide 参数在 ScaleConfig.tsx 中单独处理，使用 guides 组件
  {
    name: "na.value",
    type: "color",
    default: "grey50",
  },
];

const commonPaletteParams: ParameterConfig[] = [
  {
    name: "palette",
    type: "select",
    options: palettesOptions,
  },
];

const commonPositionXParams: ParameterConfig[] = [
  {
    name: "position",
    type: "select",
    options: ["left", "right"],
  },
];

const commonPositionYParams: ParameterConfig[] = [
  {
    name: "position",
    type: "select",
    options: ["top", "bottom"],
  },
];

// Continuous scales 通用参数
const continuousCommonParams: ParameterConfig[] = [
  ...commonParams,
  {
    name: "breaks",
    type: "numbers",
  },
  {
    name: "minor_breaks",
    type: "numbers",
  },
  {
    name: "n.breaks",
    type: "number",
  },
  {
    name: "labels",
    type: "strings",
  },
  {
    name: "limits",
    type: "pair",
  },
  {
    name: "expand",
    type: "pair",
  },
  {
    name: "transform",
    type: "select",
    options: transformOptions,
  },
];

const continuousAxisParams: ParameterConfig[] = [
  ...continuousCommonParams,
  {
    name: "sec.axis",
    type: "strings",
  },
];

// Discrete scales 通用参数
const discreteCommonParams: ParameterConfig[] = [
  ...commonParams,
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
    name: "drop",
    type: "boolean",
  },
];

// Manual scales 参数
const manualParams: ParameterConfig[] = [
  ...discreteCommonParams,
  {
    name: "values",
    type: "colors",
  },
];

// Manual scales with numbers (for shape, size, etc.)
const manualNumericParams: ParameterConfig[] = [
  ...discreteCommonParams,
  {
    name: "values",
    type: "numbers",
  },
];

// Gradient scales 通用参数
const gradientCommonParams: ParameterConfig[] = [
  ...continuousCommonParams,
  {
    name: "low",
    type: "color",
  },
  {
    name: "high",
    type: "color",
  },
];

// Gradient2 scales 参数
const gradient2Params: ParameterConfig[] = [
  ...gradientCommonParams,
  {
    name: "mid",
    type: "color",
  },
  {
    name: "midpoint",
    type: "number",
    default: 0,
  },
];

// Gradientn scales 参数
const gradientnParams: ParameterConfig[] = [
  ...continuousCommonParams,
  {
    name: "colors",
    type: "colors",
  },
  {
    name: "colours",
    type: "colors",
  },
];

// Viridis scales 参数
const viridisCommonParams: ParameterConfig[] = [
  ...commonParams,
  {
    name: "option",
    type: "select",
    options: [
      "magma",
      "inferno",
      "plasma",
      "viridis",
      "cividis",
      "rocket",
      "mako",
      "turbo",
    ],
    default: "viridis",
  },
  {
    name: "begin",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0,
  },
  {
    name: "end",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 1,
  },
  {
    name: "direction",
    type: "select",
    options: ["1", "-1"],
    default: "1",
  },
  {
    name: "na.value",
    type: "color",
  },
];

// Size continuous params
const sizeContinuousParams: ParameterConfig[] = [
  ...continuousCommonParams,
  {
    name: "range",
    type: "pair",
    default: [1, 6],
  },
];

// Size area params
const sizeAreaParams: ParameterConfig[] = [
  ...continuousCommonParams,
  {
    name: "max_size",
    type: "number",
    min: 0,
    step: 1,
    default: 6,
  },
];

// Size binned params
const sizeBinnedParams: ParameterConfig[] = [
  ...continuousCommonParams,
  {
    name: "n.breaks",
    type: "number",
    min: 1,
    step: 1,
  },
  {
    name: "range",
    type: "pair",
    default: [1, 6],
  },
];

// Alpha params
const alphaContinuousParams: ParameterConfig[] = [
  ...continuousCommonParams,
  {
    name: "range",
    type: "pair",
    default: [0.1, 1],
  },
];

// Linewidth params
const linewidthContinuousParams: ParameterConfig[] = [
  ...continuousCommonParams,
  {
    name: "range",
    type: "pair",
    default: [0.5, 3],
  },
];

// Identity params
const identityParams: ParameterConfig[] = [...commonParams];

// Brewer params
const brewerParams: ParameterConfig[] = [
  ...discreteCommonParams,
  {
    name: "type",
    type: "select",
    options: ["seq", "div", "qual"],
    default: "seq",
  },
  {
    name: "palette",
    type: "select",
    options: [
      // Sequential
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
      // Diverging
      "BrBG",
      "PiYG",
      "PRGn",
      "PuOr",
      "RdBu",
      "RdGy",
      "RdYlBu",
      "RdYlGn",
      "Spectral",
      // Qualitative
      "Accent",
      "Dark2",
      "Paired",
      "Pastel1",
      "Pastel2",
      "Set1",
      "Set2",
      "Set3",
    ],
    default: "Blues",
  },
  {
    name: "direction",
    type: "select",
    options: ["1", "-1"],
    default: "1",
  },
];

// Distiller params (continuous brewer)
const distillerParams: ParameterConfig[] = [
  ...continuousCommonParams,
  {
    name: "type",
    type: "select",
    options: ["seq", "div"],
    default: "seq",
  },
  {
    name: "palette",
    type: "select",
    options: [
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
    default: "Blues",
  },
  {
    name: "direction",
    type: "select",
    options: ["1", "-1"],
    default: "1",
  },
];

// Steps params
const stepsParams: ParameterConfig[] = [
  ...continuousCommonParams,
  {
    name: "low",
    type: "color",
  },
  {
    name: "high",
    type: "color",
  },
  {
    name: "n.breaks",
    type: "number",
    min: 2,
    step: 1,
  },
];

// Steps2 params
const steps2Params: ParameterConfig[] = [
  ...stepsParams,
  {
    name: "mid",
    type: "color",
  },
  {
    name: "midpoint",
    type: "number",
    default: 0,
  },
];

// Stepsn params
const stepsnParams: ParameterConfig[] = [
  ...continuousCommonParams,
  {
    name: "colors",
    type: "colors",
  },
  {
    name: "n.breaks",
    type: "number",
    min: 2,
    step: 1,
  },
];

// Date/Time params
const dateParams: ParameterConfig[] = [
  ...commonParams,
  {
    name: "date_breaks",
    type: "string",
  },
  {
    name: "date_labels",
    type: "string",
  },
  {
    name: "date_minor_breaks",
    type: "string",
  },
  {
    name: "limits",
    type: "strings",
  },
  {
    name: "expand",
    type: "pair",
  },
];

const datetimeParams: ParameterConfig[] = [
  ...dateParams,
  {
    name: "timezone",
    type: "string",
  },
];

const timeParams: ParameterConfig[] = [
  ...commonParams,
  {
    name: "limits",
    type: "strings",
  },
  {
    name: "expand",
    type: "pair",
  },
];

// ==================== Scale 类型分组 ====================

// X 轴连续型 scales
const X_CONTINUOUS_SCALES = [
  "scale_x_continuous",
  "scale_x_log10",
  "scale_x_sqrt",
  "scale_x_reverse",
] as const;

// Y 轴连续型 scales
const Y_CONTINUOUS_SCALES = [
  "scale_y_continuous",
  "scale_y_log10",
  "scale_y_sqrt",
  "scale_y_reverse",
] as const;

// X/Y 离散型 scales
const XY_DISCRETE_SCALES = ["scale_x_discrete", "scale_y_discrete"] as const;

// 手动 scales (fill/color/colour)
const MANUAL_SCALES = [
  "scale_fill_manual",
  "scale_color_manual",
  "scale_colour_manual",
] as const;

// 手动数值型 scales
const MANUAL_NUMERIC_SCALES = [
  "scale_shape_manual",
  "scale_size_manual",
  "scale_linewidth_manual",
  "scale_linetype_manual",
  "scale_alpha_manual",
] as const;

// 连续型 scales (fill/color/colour)
const CONTINUOUS_SCALES = [
  "scale_fill_continuous",
  "scale_color_continuous",
  "scale_colour_continuous",
  "scale_colour_binned",
  "scale_fill_binned",
] as const;

// 离散型 scales (fill/color/colour)
const DISCRETE_SCALES = [
  "scale_fill_discrete",
  "scale_color_discrete",
  "scale_colour_discrete",
] as const;

// 渐变色 scales (fill/color/colour)
const GRADIENT_SCALES = [
  "scale_fill_gradient",
  "scale_color_gradient",
  "scale_colour_gradient",
] as const;

// 双渐变色 scales (fill/color/colour)
const GRADIENT2_SCALES = [
  "scale_fill_gradient2",
  "scale_color_gradient2",
  "scale_colour_gradient2",
] as const;

// 多渐变色 scales (fill/color/colour)
const GRADIENTN_SCALES = [
  "scale_fill_gradientn",
  "scale_color_gradientn",
  "scale_colour_gradientn",
] as const;

// Viridis C scales (fill/color/colour)
const VIRIDIS_C_SCALES = [
  "scale_fill_viridis_c",
  "scale_color_viridis_c",
  "scale_colour_viridis_c",
] as const;

// Viridis D scales (fill/color/colour)
const VIRIDIS_D_SCALES = [
  "scale_fill_viridis_d",
  "scale_color_viridis_d",
  "scale_colour_viridis_d",
] as const;

// Linetype scales
const LINETYPE_SCALES = ["scale_linetype", "scale_linetype_discrete"] as const;

// Shape scales
const SHAPE_SCALES = ["scale_shape", "scale_shape_discrete"] as const;

// Size continuous scales
const SIZE_CONTINUOUS_SCALES = [
  "scale_size",
  "scale_size_continuous",
  "scale_radius",
] as const;

// Size area scales
const SIZE_AREA_SCALES = ["scale_size_area"] as const;

// Size binned scales
const SIZE_BINNED_SCALES = [
  "scale_size_binned",
  "scale_size_binned_area",
] as const;

// Alpha scales
const ALPHA_CONTINUOUS_SCALES = [
  "scale_alpha",
  "scale_alpha_continuous",
] as const;

const ALPHA_DISCRETE_SCALES = ["scale_alpha_discrete"] as const;

const ALPHA_BINNED_SCALES = ["scale_alpha_binned"] as const;

// Linewidth scales
const LINEWIDTH_CONTINUOUS_SCALES = [
  "scale_linewidth",
  "scale_linewidth_continuous",
] as const;

const LINEWIDTH_BINNED_SCALES = ["scale_linewidth_binned"] as const;

// Identity scales
const IDENTITY_SCALES = [
  "scale_fill_identity",
  "scale_color_identity",
  "scale_colour_identity",
  "scale_size_identity",
  "scale_shape_identity",
  "scale_linetype_identity",
  "scale_alpha_identity",
  "scale_linewidth_identity",
] as const;

// Brewer scales
const BREWER_SCALES = [
  "scale_fill_brewer",
  "scale_color_brewer",
  "scale_colour_brewer",
] as const;

// Distiller scales (continuous brewer)
const DISTILLER_SCALES = [
  "scale_fill_distiller",
  "scale_color_distiller",
  "scale_colour_distiller",
] as const;

// Fermenter scales (binned brewer)
const FERMENTER_SCALES = [
  "scale_fill_fermenter",
  "scale_color_fermenter",
  "scale_colour_fermenter",
] as const;

// Steps scales
const STEPS_SCALES = [
  "scale_fill_steps",
  "scale_color_steps",
  "scale_colour_steps",
] as const;

// Steps2 scales
const STEPS2_SCALES = [
  "scale_fill_steps2",
  "scale_color_steps2",
  "scale_colour_steps2",
] as const;

// Stepsn scales
const STEPSN_SCALES = [
  "scale_fill_stepsn",
  "scale_color_stepsn",
  "scale_colour_stepsn",
] as const;

// Date/Time scales
const DATE_SCALES = ["scale_x_date", "scale_y_date"] as const;

const DATETIME_SCALES = ["scale_x_datetime", "scale_y_datetime"] as const;

const TIME_SCALES = ["scale_x_time", "scale_y_time"] as const;

// ==================== 辅助函数 ====================

/**
 * 检查 scale 类型是否在给定的数组中
 */
function isScaleType(
  scaleType: string,
  scaleArray: readonly string[]
): boolean {
  return scaleArray.includes(scaleType);
}

/**
 * 根据 scale 类型返回相应的参数配置
 */
export function getScaleParams(scaleType: string): ParameterConfig[] {
  // X 轴连续型 scales
  if (isScaleType(scaleType, X_CONTINUOUS_SCALES)) {
    return [...continuousAxisParams, ...commonPositionXParams];
  }

  // Y 轴连续型 scales
  if (isScaleType(scaleType, Y_CONTINUOUS_SCALES)) {
    return [...continuousAxisParams, ...commonPositionYParams];
  }

  // X/Y 离散型 scales
  if (isScaleType(scaleType, XY_DISCRETE_SCALES)) {
    return discreteCommonParams;
  }

  // 手动 scales (fill/color/colour)
  if (isScaleType(scaleType, MANUAL_SCALES)) {
    return manualParams;
  }

  // 手动数值型 scales
  if (isScaleType(scaleType, MANUAL_NUMERIC_SCALES)) {
    return manualNumericParams;
  }

  // Linetype scales
  if (isScaleType(scaleType, LINETYPE_SCALES)) {
    return discreteCommonParams;
  }

  // Shape scales
  if (isScaleType(scaleType, SHAPE_SCALES)) {
    return discreteCommonParams;
  }

  // Size continuous scales
  if (isScaleType(scaleType, SIZE_CONTINUOUS_SCALES)) {
    return sizeContinuousParams;
  }

  // Size area scales
  if (isScaleType(scaleType, SIZE_AREA_SCALES)) {
    return sizeAreaParams;
  }

  // Size binned scales
  if (isScaleType(scaleType, SIZE_BINNED_SCALES)) {
    return sizeBinnedParams;
  }

  // Alpha continuous scales
  if (isScaleType(scaleType, ALPHA_CONTINUOUS_SCALES)) {
    return alphaContinuousParams;
  }

  // Alpha discrete scales
  if (isScaleType(scaleType, ALPHA_DISCRETE_SCALES)) {
    return discreteCommonParams;
  }

  // Alpha binned scales
  if (isScaleType(scaleType, ALPHA_BINNED_SCALES)) {
    return alphaContinuousParams;
  }

  // Linewidth continuous scales
  if (isScaleType(scaleType, LINEWIDTH_CONTINUOUS_SCALES)) {
    return linewidthContinuousParams;
  }

  // Linewidth binned scales
  if (isScaleType(scaleType, LINEWIDTH_BINNED_SCALES)) {
    return linewidthContinuousParams;
  }

  // Identity scales
  if (isScaleType(scaleType, IDENTITY_SCALES)) {
    return identityParams;
  }

  // Brewer scales
  if (isScaleType(scaleType, BREWER_SCALES)) {
    return brewerParams;
  }

  // Distiller scales
  if (isScaleType(scaleType, DISTILLER_SCALES)) {
    return distillerParams;
  }

  // Fermenter scales
  if (isScaleType(scaleType, FERMENTER_SCALES)) {
    return distillerParams;
  }

  // Steps scales
  if (isScaleType(scaleType, STEPS_SCALES)) {
    return stepsParams;
  }

  // Steps2 scales
  if (isScaleType(scaleType, STEPS2_SCALES)) {
    return steps2Params;
  }

  // Stepsn scales
  if (isScaleType(scaleType, STEPSN_SCALES)) {
    return stepsnParams;
  }

  // Date scales
  if (isScaleType(scaleType, DATE_SCALES)) {
    return dateParams;
  }

  // Datetime scales
  if (isScaleType(scaleType, DATETIME_SCALES)) {
    return datetimeParams;
  }

  // Time scales
  if (isScaleType(scaleType, TIME_SCALES)) {
    return timeParams;
  }

  // 连续型 scales (fill/color/colour)
  if (isScaleType(scaleType, CONTINUOUS_SCALES)) {
    return [...continuousCommonParams, ...commonPaletteParams];
  }

  // 离散型 scales (fill/color/colour)
  if (isScaleType(scaleType, DISCRETE_SCALES)) {
    return [...discreteCommonParams, ...commonPaletteParams];
  }

  // 渐变色 scales (fill/color/colour)
  if (isScaleType(scaleType, GRADIENT_SCALES)) {
    return gradientCommonParams;
  }

  // 双渐变色 scales (fill/color/colour)
  if (isScaleType(scaleType, GRADIENT2_SCALES)) {
    return gradient2Params;
  }

  // 多渐变色 scales (fill/color/colour)
  if (isScaleType(scaleType, GRADIENTN_SCALES)) {
    return gradientnParams;
  }

  // Viridis C scales (fill/color/colour)
  if (isScaleType(scaleType, VIRIDIS_C_SCALES)) {
    return viridisCommonParams;
  }

  // Viridis D scales (fill/color/colour)
  if (isScaleType(scaleType, VIRIDIS_D_SCALES)) {
    return viridisCommonParams;
  }

  // 默认返回通用参数
  return commonParams;
}
