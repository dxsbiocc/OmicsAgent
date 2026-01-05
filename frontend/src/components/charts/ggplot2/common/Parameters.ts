import { ParameterConfig } from "../types";

// element_text 的参数配置
export const elementTextParams: ParameterConfig[] = [
  {
    name: "family",
    type: "select",
    options: [
      "sans",
      "serif",
      "mono",
      "Arial",
      "Courier New",
      "Microsoft YaHei",
    ],
  },
  {
    name: "face",
    type: "select",
    options: ["plain", "bold", "italic", "bold.italic"],
  },
  {
    name: "colour",
    type: "color",
  },
  {
    name: "size",
    type: "number",
    min: 0,
    step: 0.5,
  },
  {
    name: "hjust",
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
  },
  {
    name: "vjust",
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
  },
  {
    name: "angle",
    type: "number",
    min: -360,
    max: 360,
    step: 1,
  },
  {
    name: "lineheight",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "margin",
    type: "string",
  },
  {
    name: "color",
    type: "color",
  },
  {
    name: "debug",
    type: "boolean",
  },
  {
    name: "inherit.blank",
    type: "boolean",
  },
];

// element_markdown 的参数配置
export const elementMarkdownParams: ParameterConfig[] = [
  {
    name: "family",
    type: "select",
    options: [
      "sans",
      "serif",
      "mono",
      "Arial",
      "Courier New",
      "Microsoft YaHei",
    ],
  },
  {
    name: "face",
    type: "select",
    options: ["plain", "bold", "italic", "bold.italic"],
  },
  {
    name: "colour",
    type: "color",
  },
  {
    name: "size",
    type: "number",
    min: 0,
    step: 0.5,
  },
  {
    name: "hjust",
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
  },
  {
    name: "vjust",
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
  },
  {
    name: "angle",
    type: "number",
    min: -360,
    max: 360,
    step: 1,
  },
  {
    name: "lineheight",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "color",
    type: "color",
  },
  {
    name: "fill",
    type: "color",
  },
  {
    name: "box.colour",
    type: "color",
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
    name: "padding",
    type: "string",
  },
  {
    name: "r",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "align_widths",
    type: "boolean",
  },
  {
    name: "align_heights",
    type: "boolean",
  },
  {
    name: "rotate_margins",
    type: "boolean",
  },
  {
    name: "margin",
    type: "string",
  },
  {
    name: "debug",
    type: "boolean",
  },
  {
    name: "inherit.blank",
    type: "boolean",
  },
];

// element_rect 的参数配置
export const elementRectParams: ParameterConfig[] = [
  {
    name: "fill",
    type: "color",
  },
  {
    name: "colour",
    type: "color",
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
    name: "color",
    type: "color",
  },
  {
    name: "linejoin",
    type: "select",
    options: ["round", "mitre", "bevel"],
  },
  {
    name: "inherit.blank",
    type: "boolean",
  },
];

// element_line 的参数配置
export const elementLineParams: ParameterConfig[] = [
  {
    name: "colour",
    type: "color",
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
    name: "lineend",
    type: "select",
    options: ["round", "butt", "square"],
  },
  {
    name: "color",
    type: "color",
  },
  {
    name: "linejoin",
    type: "select",
    options: ["round", "mitre", "bevel"],
  },
  {
    name: "arrow",
    type: "arrow",
  },
  {
    name: "arrow.fill",
    type: "color",
  },
  {
    name: "inherit.blank",
    type: "boolean",
  },
];

// element_point 的参数配置
export const elementPointParams: ParameterConfig[] = [
  {
    name: "colour",
    type: "color",
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
    step: 0.5,
  },
  {
    name: "fill",
    type: "color",
  },
  {
    name: "stroke",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "color",
    type: "color",
  },
  {
    name: "inherit.blank",
    type: "boolean",
  },
];

// element_polygon 的参数配置
export const elementPolygonParams: ParameterConfig[] = [
  {
    name: "fill",
    type: "color",
  },
  {
    name: "colour",
    type: "color",
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
    name: "color",
    type: "color",
  },
  {
    name: "linejoin",
    type: "select",
    options: ["round", "mitre", "bevel"],
  },
  {
    name: "inherit.blank",
    type: "boolean",
  },
];

// element_geom 的参数配置
export const elementGeomParams: ParameterConfig[] = [
  {
    name: "ink",
    type: "color",
  },
  {
    name: "paper",
    type: "color",
  },
  {
    name: "accent",
    type: "color",
  },
  {
    name: "linewidth",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "borderwidth",
    type: "number",
    min: 0,
    step: 0.1,
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
    name: "bordertype",
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
    name: "family",
    type: "select",
    options: [
      "sans",
      "serif",
      "mono",
      "Arial",
      "Courier New",
      "Microsoft YaHei",
    ],
  },
  {
    name: "fontsize",
    type: "number",
    min: 0,
    step: 0.5,
  },
  {
    name: "pointsize",
    type: "number",
    min: 0,
    step: 0.5,
  },
  {
    name: "pointshape",
    type: "number",
    min: 0,
    max: 25,
    step: 1,
  },
  {
    name: "colour",
    type: "color",
  },
  {
    name: "color",
    type: "color",
  },
  {
    name: "fill",
    type: "color",
  },
];

// margin 的参数配置
export const marginParams: ParameterConfig[] = [
  {
    name: "t",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "r",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "b",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "l",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "units",
    type: "select",
    options: ["pt", "in", "cm", "mm", "px", "pc"],
  },
];

// position_dodge 的参数配置
export const positionDodgeParams: ParameterConfig[] = [
  {
    name: "width",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.9,
  },
  {
    name: "preserve",
    type: "select",
    options: ["total", "single"],
    default: "total",
  },
];

// position_dodge2 的参数配置
export const positionDodge2Params: ParameterConfig[] = [
  {
    name: "width",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.9,
  },
  {
    name: "preserve",
    type: "select",
    options: ["total", "single"],
    default: "total",
  },
  {
    name: "padding",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.1,
  },
  {
    name: "reverse",
    type: "boolean",
    default: false,
  },
];

// position_jitter 的参数配置
export const positionJitterParams: ParameterConfig[] = [
  {
    name: "width",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.4,
  },
  {
    name: "height",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.4,
  },
  {
    name: "seed",
    type: "number",
    step: 1,
  },
];

// position_jitterdodge 的参数配置
export const positionJitterdodgeParams: ParameterConfig[] = [
  {
    name: "jitter.width",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.4,
  },
  {
    name: "jitter.height",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.4,
  },
  {
    name: "dodge.width",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.75,
  },
  {
    name: "seed",
    type: "number",
    step: 1,
  },
];

// position_stack 的参数配置
export const positionStackParams: ParameterConfig[] = [
  {
    name: "vjust",
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
    default: 1,
  },
  {
    name: "reverse",
    type: "boolean",
    default: false,
  },
];

// position_fill 的参数配置
export const positionFillParams: ParameterConfig[] = [
  {
    name: "vjust",
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
    default: 1,
  },
  {
    name: "reverse",
    type: "boolean",
    default: false,
  },
];

// position_nudge 的参数配置
export const positionNudgeParams: ParameterConfig[] = [
  {
    name: "x",
    type: "number",
    step: 0.1,
    default: 0,
  },
  {
    name: "y",
    type: "number",
    step: 0.1,
    default: 0,
  },
];

// 获取 element 类型的参数配置
export const getElementParams = (elementType: string): ParameterConfig[] => {
  switch (elementType) {
    case "element_text":
      return elementTextParams;
    case "element_markdown":
      return elementMarkdownParams;
    case "element_rect":
      return elementRectParams;
    case "element_line":
      return elementLineParams;
    case "element_point":
      return elementPointParams;
    case "element_polygon":
      return elementPolygonParams;
    case "element_geom":
      return elementGeomParams;
    case "margin":
      return marginParams;
    default:
      return [];
  }
};

// 获取 position 类型的参数配置
export const getPositionParams = (positionType: string): ParameterConfig[] => {
  switch (positionType) {
    case "position_dodge":
      return positionDodgeParams;
    case "position_dodge2":
      return positionDodge2Params;
    case "position_jitter":
      return positionJitterParams;
    case "position_jitterdodge":
      return positionJitterdodgeParams;
    case "position_stack":
      return positionStackParams;
    case "position_fill":
      return positionFillParams;
    case "position_nudge":
      return positionNudgeParams;
    default:
      return [];
  }
};

// strip_themed 的参数配置
export const stripThemedParams: ParameterConfig[] = [
  {
    name: "clip",
    type: "select",
    options: ["inherit", "on", "off"],
    default: "inherit",
  },
  {
    name: "size",
    type: "select",
    options: ["constant", "variable"],
    default: "constant",
  },
  {
    name: "text_x",
    type: "string", // 暂时使用 string，后续可以扩展为 elem_list_text 类型
  },
  {
    name: "text_y",
    type: "string", // 暂时使用 string，后续可以扩展为 elem_list_text 类型
  },
  {
    name: "background_x",
    type: "string", // 暂时使用 string，后续可以扩展为 elem_list_rect 类型
  },
  {
    name: "background_y",
    type: "string", // 暂时使用 string，后续可以扩展为 elem_list_rect 类型
  },
  {
    name: "by_layer_x",
    type: "boolean",
    default: false,
  },
  {
    name: "by_layer_y",
    type: "boolean",
    default: false,
  },
];

// strip_nested 的参数配置
export const stripNestedParams: ParameterConfig[] = [
  ...stripThemedParams,
  {
    name: "bleed",
    type: "boolean",
    default: false,
  },
];

// strip_split 的参数配置
export const stripSplitParams: ParameterConfig[] = [
  {
    name: "position",
    type: "strings", // 可以是字符串数组，如 ["top", "bottom"]
  },
  {
    name: "clip",
    type: "select",
    options: ["inherit", "on", "off"],
    default: "inherit",
  },
  {
    name: "size",
    type: "select",
    options: ["constant", "variable"],
    default: "constant",
  },
  {
    name: "bleed",
    type: "boolean",
    default: false,
  },
  {
    name: "text_x",
    type: "string",
  },
  {
    name: "text_y",
    type: "string",
  },
  {
    name: "background_x",
    type: "string",
  },
  {
    name: "background_y",
    type: "string",
  },
  {
    name: "by_layer_x",
    type: "boolean",
    default: false,
  },
  {
    name: "by_layer_y",
    type: "boolean",
    default: false,
  },
];

// strip_vanilla 的参数配置
export const stripVanillaParams: ParameterConfig[] = [
  {
    name: "clip",
    type: "select",
    options: ["inherit", "on", "off"],
    default: "inherit",
  },
  {
    name: "size",
    type: "select",
    options: ["constant", "variable"],
    default: "constant",
  },
];

// strip_tag 的参数配置
export const stripTagParams: ParameterConfig[] = [
  {
    name: "clip",
    type: "select",
    options: ["inherit", "on", "off"],
    default: "inherit",
  },
  {
    name: "order",
    type: "strings", // e.g., ["x", "y"]
  },
  {
    name: "just",
    type: "numbers", // [hjust, vjust]
  },
];

// 获取 strip 类型的参数配置
export const getStripParams = (stripType: string): ParameterConfig[] => {
  switch (stripType) {
    case "strip_themed":
      return stripThemedParams;
    case "strip_nested":
      return stripNestedParams;
    case "strip_split":
      return stripSplitParams;
    case "strip_vanilla":
      return stripVanillaParams;
    case "strip_tag":
      return stripTagParams;
    default:
      return [];
  }
};
