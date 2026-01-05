import { EChartsOption, ToolboxComponentOption, SeriesOption } from "echarts";
import toolbox from "./toolbox.json";
import predefinedColors from "@/components/common/colors.json";
import { calculateDataDepth } from "../utils/dataProcess";

const toolboxOption = toolbox as unknown as ToolboxComponentOption;

/**
 * 根据深度自动计算每个层的半径
 * @param depth 数据层数（不包括下钻层）
 * @param maxRadius 最大半径，默认 "90%"
 * @param minRadius 最内层半径，默认 "10%"
 * @param outerBandWidth 最外层环带厚度，默认 "5%"
 * @returns 每层的半径配置数组（包含 levels[0] 的下钻层）
 */
const calculateLevelRadius = (
  depth: number,
  maxRadius: string = "90%",
  minRadius: string = "10%",
  outerBandWidth: string = "5%"
): { radius?: [string, string] }[] => {
  // 解析百分比字符串
  const parsePercent = (str: string): number => {
    return parseFloat(str.replace("%", ""));
  };

  const max = parsePercent(maxRadius);
  const min = parsePercent(minRadius);
  const outerWidth = parsePercent(outerBandWidth);
  const availableRange = Math.max(0, max - min);

  // levels[0] 是下钻返回层，使用中心区域 0% 到 minRadius
  const levels: { radius?: [string, string] }[] = [
    {
      radius: ["0%", minRadius],
    },
  ];

  if (depth <= 0) return levels;

  if (depth === 1) {
    // 只有一层数据时，最外层厚度固定为 outerBandWidth
    const inner = Math.max(min, max - outerWidth);
    levels.push({ radius: [`${inner.toFixed(1)}%`, `${max.toFixed(1)}%`] });
    return levels;
  }

  // 多层数据时：前 (depth - 1) 层均分 [min, max - outerWidth]，最后一层厚度为 outerWidth
  const allocMax = Math.max(min, max - outerWidth);
  const innerLayersRange = Math.max(0, allocMax - min);
  const layerWidth = innerLayersRange / (depth - 1);

  for (let i = 1; i <= depth; i++) {
    if (i < depth) {
      const innerRadius = min + (i - 1) * layerWidth;
      const outerRadius = min + i * layerWidth;
      levels.push({
        radius: [`${innerRadius.toFixed(1)}%`, `${outerRadius.toFixed(1)}%`],
      });
    } else {
      const innerRadius = Math.max(min, max - outerWidth);
      levels.push({
        radius: [`${innerRadius.toFixed(1)}%`, `${max.toFixed(1)}%`],
      });
    }
  }

  return levels;
};

export const SunburstBasic = (
  data: { [key: string | number]: any }[]
): EChartsOption => {
  return {
    toolbox: toolboxOption,
    title: {
      text: "Sunburst Basic",
      top: "90%",
    },
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
    },
    color: predefinedColors.Brand["Elastic Search"],
    series: [
      {
        type: "sunburst",
        data: data,
        radius: ["5%", "90%"],
        label: {
          rotate: "radial",
          fontSize: 12,
        },
      },
    ],
  };
};

export const SunburstAdvanced = (
  data: { [key: string | number]: any }[]
): EChartsOption => {
  const depth = calculateDataDepth(data);
  const radiusLevels = calculateLevelRadius(depth, "80%", "10%");

  return {
    toolbox: toolboxOption,
    series: [
      {
        type: "sunburst",
        data: data,
        radius: [0, "80%"],
        sort: undefined,
        emphasis: {
          focus: "ancestor",
        },
        levels: radiusLevels.map((level, index) => {
          const config: any = {
            ...level,
          };

          // 为最外层添加特殊样式
          if (index === depth) {
            config.itemStyle = {
              borderWidth: 3,
            };
            config.label = {
              position: "outside",
              padding: 2,
              silent: false,
            };
          } else if (index === 0) {
            // 下钻层不显示标签
            config.label = {
              show: false,
            };
          } else if (index === 1) {
            // 第一层（除下钻层外的第一层数据）设置旋转为切向
            config.label = {
              rotate: "tangential",
            };
          }

          return config;
        }),
      },
    ],
  };
};

export const SunburstRound = (
  data: { [key: string | number]: any }[]
): EChartsOption => {
  return {
    toolbox: toolboxOption,
    visualMap: {
      type: "continuous",
      min: 0,
      max: 10,
      calculable: true,
      inRange: {
        color: predefinedColors.Quantitative.Magenta,
      },
    },
    series: [
      {
        type: "sunburst",
        data: data,
        radius: ["10%", "90%"],
        itemStyle: {
          borderRadius: 8,
          borderWidth: 2,
        },
        label: {
          rotate: "radial",
          fontSize: 12,
        },
      },
    ],
  };
};
