import { ParameterConfig } from "../types";
import { themeParams } from "../theme/themeParams";

export const guideLegendThemeParams: ParameterConfig[] = themeParams.filter(
  (param) => param.name.startsWith("legend.")
);

export const guideAxisThemeParams: ParameterConfig[] = themeParams.filter(
  (param) => param.name.startsWith("axis.")
);

// guide_legend 参数配置
export const guideLegendParams: ParameterConfig[] = [
  {
    name: "title",
    type: "string",
  },
  {
    name: "position",
    type: "select",
    options: ["left", "right", "top", "bottom"],
  },
  {
    name: "direction",
    type: "select",
    options: ["horizontal", "vertical"],
  },
  {
    name: "nrow",
    type: "number",
  },
  {
    name: "ncol",
    type: "number",
  },
  {
    name: "reverse",
    type: "boolean",
    default: false,
  },
  {
    name: "order",
    type: "number",
  },
];

// guide_colorbar / guide_colourbar 参数配置
export const guideColorbarParams: ParameterConfig[] = [
  {
    name: "title",
    type: "string",
  },
  {
    name: "nbin",
    type: "number",
  },
  {
    name: "display",
    type: "select",
    options: ["raster", "rectangles", "gradient"],
  },
  {
    name: "alpha",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    name: "draw.ulim",
    type: "boolean",
    default: true,
  },
  {
    name: "draw.llim",
    type: "boolean",
    default: true,
  },
  {
    name: "angle",
    type: "number",
  },
  {
    name: "position",
    type: "select",
    options: ["left", "right", "top", "bottom", "inside"],
  },
  {
    name: "direction",
    type: "select",
    options: ["horizontal", "vertical"],
  },
  {
    name: "reverse",
    type: "boolean",
    default: false,
  },

  {
    name: "order",
    type: "number",
  },
  {
    name: "available_aes",
    type: "strings",
  },
];

// guide_axis 参数配置
export const guideAxisParams: ParameterConfig[] = [
  {
    name: "title",
    type: "string",
  },
  {
    name: "check.overlap",
    type: "boolean",
    default: false,
  },
  {
    name: "angle",
    type: "number",
  },
  {
    name: "cap",
    type: "select",
    options: ["none", "both", "start", "end"],
  },
  {
    name: "n.dodge",
    type: "number",
    default: 1,
  },
  {
    name: "order",
    type: "number",
  },
  {
    name: "position",
    type: "select",
    options: ["left", "right", "top", "bottom"],
  },
];

// guide_bins 参数配置
export const guideBinsParams: ParameterConfig[] = [
  {
    name: "title",
    type: "string",
  },
  {
    name: "angle",
    type: "number",
  },
  {
    name: "position",
    type: "select",
    options: ["left", "right", "top", "bottom"],
  },
  {
    name: "direction",
    type: "select",
    options: ["horizontal", "vertical"],
  },
  {
    name: "reverse",
    type: "boolean",
    default: false,
  },
  {
    name: "order",
    type: "number",
  },
  {
    name: "show.limits",
    type: "boolean",
  },
];

// guide_axis_logticks 参数配置
export const guideAxisLogticksParams: ParameterConfig[] = [
  {
    name: "long",
    type: "number",
  },
  {
    name: "mid",
    type: "number",
  },
  {
    name: "short",
    type: "number",
  },
  {
    name: "prescale.base",
    type: "number",
  },
  {
    name: "expanded",
    type: "boolean",
    default: true,
  },
  {
    name: "cap",
    type: "select",
    options: ["none", "both", "start", "end"],
  },
];

// guide_axis_stack 参数配置
export const guideAxisStackParams: ParameterConfig[] = [
  {
    name: "first",
    type: "string",
  },
  {
    name: "title",
    type: "string",
  },
  {
    name: "spacing",
    type: "unit",
  },
  {
    name: "order",
    type: "number",
  },
  {
    name: "position",
    type: "select",
    options: ["left", "right", "top", "bottom"],
  },
];

// guide_axis_theta 参数配置
export const guideAxisThetaParams: ParameterConfig[] = [
  {
    name: "title",
    type: "string",
  },
  {
    name: "angle",
    type: "number",
  },
  {
    name: "minor.ticks",
    type: "boolean",
    default: false,
  },
  {
    name: "cap",
    type: "select",
    options: ["none", "upper", "lower", "both"],
  },
  {
    name: "order",
    type: "number",
  },
  {
    name: "position",
    type: "select",
    options: ["left", "right", "top", "bottom"],
  },
];

// guide_custom 参数配置
export const guideCustomParams: ParameterConfig[] = [
  {
    name: "grob",
    type: "grob",
  },
  {
    name: "width",
    type: "unit",
  },
  {
    name: "height",
    type: "unit",
  },
  {
    name: "title",
    type: "string",
  },
  {
    name: "position",
    type: "select",
    options: ["left", "right", "top", "bottom", "inside"],
  },
  {
    name: "order",
    type: "number",
  },
];

// guide_none 参数配置
export const guideNoneParams: ParameterConfig[] = [
  {
    name: "title",
    type: "string",
  },
  {
    name: "position",
    type: "select",
    options: ["left", "right", "top", "bottom"],
  },
];

// guide_prism_bracket 参数配置
export const guidePrismBracketParams: ParameterConfig[] = [
  {
    name: "title",
    type: "string",
  },
  {
    name: "check.overlap",
    type: "boolean",
    default: false,
  },
  {
    name: "angle",
    type: "number",
  },
  {
    name: "n.dodge",
    type: "number",
    default: 1,
  },
  {
    name: "order",
    type: "number",
  },
  {
    name: "position",
    type: "select",
    options: ["left", "right", "top", "bottom"],
  },
  {
    name: "width",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    name: "outside",
    type: "boolean",
    default: true,
  },
];

// guide_prism_minor 参数配置
export const guidePrismMinorParams: ParameterConfig[] = [
  {
    name: "title",
    type: "string",
  },
  {
    name: "check.overlap",
    type: "boolean",
    default: false,
  },
  {
    name: "angle",
    type: "number",
  },
  {
    name: "n.dodge",
    type: "number",
    default: 1,
  },
  {
    name: "order",
    type: "number",
  },
  {
    name: "position",
    type: "select",
    options: ["left", "right", "top", "bottom"],
  },
];

// guide_prism_offset 参数配置
export const guidePrismOffsetParams: ParameterConfig[] = [
  {
    name: "title",
    type: "string",
  },
  {
    name: "check.overlap",
    type: "boolean",
    default: false,
  },
  {
    name: "angle",
    type: "number",
  },
  {
    name: "n.dodge",
    type: "number",
    default: 1,
  },
  {
    name: "order",
    type: "number",
  },
  {
    name: "position",
    type: "select",
    options: ["left", "right", "top", "bottom"],
  },
];

// guide_prism_offset_minor 参数配置（结合 offset 和 minor 的功能）
export const guidePrismOffsetMinorParams: ParameterConfig[] = [
  {
    name: "title",
    type: "string",
  },
  {
    name: "check.overlap",
    type: "boolean",
    default: false,
  },
  {
    name: "angle",
    type: "number",
  },
  {
    name: "n.dodge",
    type: "number",
    default: 1,
  },
  {
    name: "order",
    type: "number",
  },
  {
    name: "position",
    type: "select",
    options: ["left", "right", "top", "bottom"],
  },
];

/**
 * 根据 guide 类型返回相应的参数配置
 */
export const getAvailableGuideParams = (
  guideType: string
): ParameterConfig[] => {
  switch (guideType) {
    case "guide_legend":
      return guideLegendParams;
    case "guide_colorbar":
    case "guide_colourbar":
      return guideColorbarParams;
    case "guide_axis":
      return guideAxisParams;
    case "guide_bins":
      return guideBinsParams;
    case "guide_axis_logticks":
      return guideAxisLogticksParams;
    case "guide_axis_stack":
      return guideAxisStackParams;
    case "guide_axis_theta":
      return guideAxisThetaParams;
    case "guide_custom":
      return guideCustomParams;
    case "guide_none":
      return guideNoneParams;
    case "guide_prism_bracket":
      return guidePrismBracketParams;
    case "guide_prism_minor":
      return guidePrismMinorParams;
    case "guide_prism_offset":
      return guidePrismOffsetParams;
    case "guide_prism_offset_minor":
      return guidePrismOffsetMinorParams;
    default:
      return guideLegendParams; // 默认返回 guide_legend 参数
  }
};
