import { ParameterConfig } from "../types";

// 可用的 theme 参数配置
// 这些参数对应 ggplot2 theme() 函数的参数
export const themeParams: ParameterConfig[] = [
  {
    name: "line",
    type: "element_line",
  },
  {
    name: "rect",
    type: "element_rect",
  },
  {
    name: "text",
    type: "element_text",
  },
  {
    name: "title",
    type: "element_text",
  },
  {
    name: "aspect.ratio",
    type: "number",
  },
  //   axis.title
  {
    name: "axis.title",
    type: "element_text",
  },
  {
    name: "axis.title.x",
    type: "element_text",
  },
  {
    name: "axis.title.y",
    type: "element_text",
  },
  {
    name: "axis.title.x.top",
    type: "element_text",
  },
  {
    name: "axis.title.x.bottom",
    type: "element_text",
  },
  {
    name: "axis.title.y.left",
    type: "element_text",
  },
  {
    name: "axis.title.y.right",
    type: "element_text",
  },
  //   axis.text
  {
    name: "axis.text",
    type: "element_text",
  },
  {
    name: "axis.text.x",
    type: "element_text",
  },
  {
    name: "axis.text.y",
    type: "element_text",
  },
  {
    name: "axis.text.x.top",
    type: "element_text",
  },
  {
    name: "axis.text.x.bottom",
    type: "element_text",
  },
  {
    name: "axis.text.y.left",
    type: "element_text",
  },
  {
    name: "axis.text.y.right",
    type: "element_text",
  },
  {
    name: "axis.text.theta",
    type: "element_text",
  },
  {
    name: "axis.text.r",
    type: "element_text",
  },
  //   axis.ticks
  {
    name: "axis.ticks",
    type: "element_line",
  },
  {
    name: "axis.ticks.x",
    type: "element_line",
  },
  {
    name: "axis.ticks.y",
    type: "element_line",
  },
  {
    name: "axis.ticks.x.top",
    type: "element_line",
  },
  {
    name: "axis.ticks.x.bottom",
    type: "element_line",
  },
  {
    name: "axis.ticks.y.left",
    type: "element_line",
  },
  {
    name: "axis.ticks.y.right",
    type: "element_line",
  },
  {
    name: "axis.ticks.theta",
    type: "element_line",
  },
  {
    name: "axis.ticks.r",
    type: "element_line",
  },
  //   axis.minor.ticks
  {
    name: "axis.minor.ticks.x.top",
    type: "element_line",
  },
  {
    name: "axis.minor.ticks.x.bottom",
    type: "element_line",
  },
  {
    name: "axis.minor.ticks.y.left",
    type: "element_line",
  },
  {
    name: "axis.minor.ticks.y.right",
    type: "element_line",
  },
  {
    name: "axis.minor.ticks.theta",
    type: "element_line",
  },
  {
    name: "axis.minor.ticks.r",
    type: "element_line",
  },
  // axis.ticks.length
  {
    name: "axis.ticks.length",
    type: "unit",
  },
  {
    name: "axis.ticks.length.x",
    type: "unit",
  },
  {
    name: "axis.ticks.length.y",
    type: "unit",
  },
  {
    name: "axis.ticks.length.x.top",
    type: "unit",
  },
  {
    name: "axis.ticks.length.x.bottom",
    type: "unit",
  },
  {
    name: "axis.ticks.length.y.left",
    type: "unit",
  },
  {
    name: "axis.ticks.length.y.right",
    type: "unit",
  },
  {
    name: "axis.ticks.length.theta",
    type: "unit",
  },
  {
    name: "axis.ticks.length.r",
    type: "unit",
  },
  // axis.minor.ticks.length
  {
    name: "axis.minor.ticks.length",
    type: "unit",
  },
  {
    name: "axis.minor.ticks.length.x",
    type: "unit",
  },
  {
    name: "axis.minor.ticks.length.y",
    type: "unit",
  },
  {
    name: "axis.minor.ticks.length.x.top",
    type: "unit",
  },
  {
    name: "axis.minor.ticks.length.x.bottom",
    type: "unit",
  },
  {
    name: "axis.minor.ticks.length.y.left",
    type: "unit",
  },
  {
    name: "axis.minor.ticks.length.y.right",
    type: "unit",
  },
  {
    name: "axis.minor.ticks.length.theta",
    type: "unit",
  },
  {
    name: "axis.minor.ticks.length.r",
    type: "unit",
  },
  //   axis.line
  {
    name: "axis.line",
    type: "element_line",
  },
  {
    name: "axis.line.x",
    type: "element_line",
  },
  {
    name: "axis.line.y",
    type: "element_line",
  },
  {
    name: "axis.line.x.top",
    type: "element_line",
  },
  {
    name: "axis.line.x.bottom",
    type: "element_line",
  },
  {
    name: "axis.line.y.left",
    type: "element_line",
  },
  {
    name: "axis.line.y.right",
    type: "element_line",
  },
  {
    name: "axis.line.theta",
    type: "element_line",
  },
  {
    name: "axis.line.r",
    type: "element_line",
  },
  //   legend
  {
    name: "legend.background",
    type: "element_rect",
  },
  {
    name: "legend.margin",
    type: "margin",
  },
  {
    name: "legend.spacing",
    type: "unit",
  },
  {
    name: "legend.spacing.x",
    type: "unit",
  },
  {
    name: "legend.spacing.y",
    type: "unit",
  },
  {
    name: "legend.key",
    type: "element_rect",
  },
  {
    name: "legend.key.size",
    type: "unit",
  },
  {
    name: "legend.key.height",
    type: "unit",
  },
  {
    name: "legend.key.width",
    type: "unit",
  },
  {
    name: "legend.key.spacing",
    type: "unit",
  },
  {
    name: "legend.key.spacing.x",
    type: "unit",
  },
  {
    name: "legend.key.spacing.y",
    type: "unit",
  },
  {
    name: "legend.frame",
    type: "element_rect",
  },
  {
    name: "legend.ticks",
    type: "element_line",
  },
  {
    name: "legend.ticks.length",
    type: "unit",
  },
  {
    name: "legend.axis.line",
    type: "element_line",
  },
  {
    name: "legend.title",
    type: "element_text",
  },
  {
    name: "legend.title.position",
    type: "select",
    options: ["left", "right", "bottom", "top"],
  },
  {
    name: "legend.text",
    type: "element_text",
  },
  {
    name: "legend.text.position",
    type: "select",
    options: ["left", "right", "bottom", "top"],
  },
  {
    name: "legend.position",
    type: "select",
    options: ["none", "left", "right", "bottom", "top", "inside"],
  },
  {
    name: "legend.position.inside",
    type: "pair",
  },
  {
    name: "legend.direction",
    type: "select",
    options: ["horizontal", "vertical"],
  },
  {
    name: "legend.byrow",
    type: "boolean",
  },
  {
    name: "legend.justification",
    type: "select",
    options: ["left", "right", "center", "bottom", "top"],
  },
  {
    name: "legend.justification.top",
    type: "pair",
  },
  {
    name: "legend.justification.bottom",
    type: "pair",
  },
  {
    name: "legend.justification.left",
    type: "pair",
  },
  {
    name: "legend.justification.right",
    type: "pair",
  },
  {
    name: "legend.justification.inside",
    type: "pair",
  },
  {
    name: "legend.location",
    type: "select",
    options: ["panel", "plot"],
  },
  {
    name: "legend.box",
    type: "select",
    options: ["horizontal", "vertical"],
  },
  {
    name: "legend.box.just",
    type: "select",
    options: ["left", "right", "center", "centre", "bottom", "top"],
  },
  {
    name: "legend.box.margin",
    type: "margin",
  },
  {
    name: "legend.box.background",
    type: "element_rect",
  },
  {
    name: "legend.box.spacing",
    type: "unit",
  },
  //  panel
  {
    name: "panel.background",
    type: "element_rect",
  },
  {
    name: "panel.spacing",
    type: "unit",
  },
  {
    name: "panel.spacing.x",
    type: "unit",
  },
  {
    name: "panel.spacing.y",
    type: "unit",
  },
  {
    name: "panel.grid",
    type: "element_line",
  },
  {
    name: "panel.grid.major",
    type: "element_line",
  },
  {
    name: "panel.grid.minor",
    type: "element_line",
  },
  {
    name: "panel.grid.major.x",
    type: "element_line",
  },
  {
    name: "panel.grid.major.y",
    type: "element_line",
  },
  {
    name: "panel.grid.minor.x",
    type: "element_line",
  },
  {
    name: "panel.grid.minor.y",
    type: "element_line",
  },
  {
    name: "panel.ontop",
    type: "boolean",
  },
  {
    name: "panel.widths",
    type: "unit",
  },
  {
    name: "panel.heights",
    type: "unit",
  },
  //   plot.background
  {
    name: "plot.background",
    type: "element_rect",
  },
  {
    name: "plot.title",
    type: "element_text",
  },
  {
    name: "plot.title.position",
    type: "select",
    options: ["panel", "plot"],
  },
  {
    name: "plot.caption",
    type: "element_text",
  },
  {
    name: "plot.caption.position",
    type: "select",
    options: ["panel", "plot"],
  },
  {
    name: "plot.subtitle",
    type: "element_text",
  },
  {
    name: "plot.tag",
    type: "element_text",
  },
  {
    name: "plot.tag.position",
    type: "select",
    options: [
      "top",
      "bottom",
      "left",
      "right",
      "topleft",
      "bottomleft",
      "topright",
      "bottomright",
    ],
  },
  {
    name: "plot.tag.location",
    type: "select",
    options: ["panel", "plot", "margin"],
  },
  {
    name: "plot.margin",
    type: "margin",
  },
  //  strip
  {
    name: "strip.background",
    type: "element_rect",
  },
  {
    name: "strip.background.x",
    type: "element_rect",
  },
  {
    name: "strip.background.y",
    type: "element_rect",
  },
  {
    name: "strip.clip",
    type: "select",
    options: ["on", "off", "inherit"],
  },
  {
    name: "strip.placement",
    type: "select",
    options: ["inside", "outside"],
  },
  {
    name: "strip.text",
    type: "element_text",
  },
  {
    name: "strip.text.x",
    type: "element_text",
  },
  {
    name: "strip.text.y",
    type: "element_text",
  },
  {
    name: "strip.text.x.top",
    type: "element_text",
  },
  {
    name: "strip.text.x.bottom",
    type: "element_text",
  },
  {
    name: "strip.text.y.left",
    type: "element_text",
  },
  {
    name: "strip.text.y.right",
    type: "element_text",
  },
  {
    name: "strip.witch.pad.grid",
    type: "unit",
  },
  {
    name: "strip.witch.pad.wrap",
    type: "unit",
  },
  {
    name: "complete",
    type: "boolean",
  },
  {
    name: "validate",
    type: "boolean",
  },
];

export const themeCompleteParams: ParameterConfig[] = [
  {
    name: "base_size",
    type: "number",
    default: 14,
  },
  {
    name: "base_family",
    type: "string",
    default: "",
  },
  {
    name: "base_line_size",
    type: "number",
    default: 1,
  },
  {
    name: "base_rect_size",
    type: "number",
    default: 1,
  },
];

const prismPaletteOptions = [
  "autumn_leaves",
  "beer_and_ales",
  "black_and_white",
  "candy_bright",
  "candy_soft",
  "colorblind_safe",
  "colors",
  "diazo",
  "earth_tones",
  "evergreen",
  "greenwash",
  "muted_rainbow",
  "office",
  "purple_passion",
  "shades_of_gray",
  "summer",
  "the_blues",
  "winter_soft",
  "stained_glass",
  "warm_pastels",
  "flames",
  "floral",
  "inferno",
  "magma",
  "mustard_field",
  "neon",
  "pastels",
  "pearl",
  "plasma",
  "prism_dark",
  "prism_light",
  "quiet",
  "spring",
  "starry",
  "viridis",
  "waves",
  "blueprint",
  "fir",
  "ocean",
  "sunny_garden",
  "wool_muffler",
  "warm_and_sunny",
  "winter_bright",
  "all_null",
];
export const themePrismParams: ParameterConfig[] = [
  {
    name: "palette",
    type: "select",
    options: prismPaletteOptions,
  },
  {
    name: "base_size",
    type: "number",
    default: 14,
  },
  {
    name: "base_family",
    type: "string",
    default: "sans",
  },
  {
    name: "base_fontface",
    type: "select",
    options: ["plain", "bold", "italic", "bold.italic"],
  },
  {
    name: "base_line_size",
    type: "number",
    default: 1,
  },
  {
    name: "base_rect_size",
    type: "number",
    default: 1,
  },
  {
    name: "axis_text_angle",
    type: "select",
    options: [0, 45, 90, 270],
  },
  {
    name: "border",
    type: "boolean",
    default: false,
  },
];

export const getAvailableThemeParams = (theme: string) => {
  switch (theme) {
    case "theme":
      return themeParams;
    case "theme_prism":
      return themePrismParams;
    case "theme_classic":
    case "theme_minimal":
    case "theme_bw":
    case "theme_void":
    case "theme_grey":
    case "theme_gray":
    case "theme_linedraw":
    case "theme_light":
    case "theme_dark":
      return themeCompleteParams;
    default:
      return themeParams; // 默认返回 themeParams
  }
};
