import toolbox from "./toolbox.json";
import predefinedColors from "@/components/common/colors.json";
import {
  EChartsOption,
  RadarComponentOption,
  SeriesOption,
  ToolboxComponentOption,
} from "echarts";

const toolboxOption = toolbox as unknown as ToolboxComponentOption;

/**
 * 根据雷达图数量自动分配中心点位置
 * @param count 雷达图数量
 * @returns 中心点位置数组
 */
const getRadarCenterPositions = (count: number): string[][] => {
  // 直接定义所有可能的中心点位置组合
  const positionMap: { [key: number]: string[][] } = {
    1: [["50%", "50%"]],

    2: [
      ["25%", "50%"],
      ["75%", "50%"],
    ],

    3: [
      ["25%", "30%"],
      ["75%", "30%"],
      ["50%", "70%"],
    ],

    4: [
      ["25%", "30%"],
      ["75%", "30%"],
      ["25%", "70%"],
      ["75%", "70%"],
    ],

    5: [
      ["20%", "25%"],
      ["50%", "25%"],
      ["80%", "25%"],
      ["35%", "75%"],
      ["65%", "75%"],
    ],

    6: [
      ["20%", "30%"],
      ["50%", "30%"],
      ["80%", "30%"],
      ["20%", "70%"],
      ["50%", "70%"],
      ["80%", "70%"],
    ],

    7: [
      ["20%", "20%"],
      ["50%", "20%"],
      ["80%", "20%"],
      ["20%", "50%"],
      ["50%", "50%"],
      ["80%", "50%"],
      ["50%", "80%"],
    ],

    8: [
      ["20%", "20%"],
      ["50%", "20%"],
      ["80%", "20%"],
      ["20%", "50%"],
      ["50%", "50%"],
      ["80%", "50%"],
      ["35%", "80%"],
      ["65%", "80%"],
    ],

    9: [
      ["20%", "20%"],
      ["50%", "20%"],
      ["80%", "20%"],
      ["20%", "50%"],
      ["50%", "50%"],
      ["80%", "50%"],
      ["20%", "80%"],
      ["50%", "80%"],
      ["80%", "80%"],
    ],
  };

  // 限制在1-9个之间
  const validCount = Math.max(1, Math.min(count, 9));
  return positionMap[validCount] || positionMap[9];
};

export const RadarBasic = (
  data: { [key: string | number]: any }[],
  xAxis: string
): EChartsOption => {
  const columns = Object.keys(data[0]).slice(1);

  const dataArray = columns.map((key) => data.map((item) => item[key]));

  return {
    toolbox: toolboxOption,
    title: { text: "Radar Basic" },
    legend: { data: columns },
    tooltip: {
      trigger: "item",
    },
    color: predefinedColors.Brand.Aiesec,
    radar: {
      indicator: data.map((item) => {
        return {
          name: item[xAxis],
          value: Math.max(
            ...Object.values(item).filter((value) => typeof value === "number")
          ),
        };
      }),
      splitArea: {
        show: true,
        areaStyle: {
          color: ["#F9ECCA", "#C0F1E0"],
        },
      },
    },

    series: [
      {
        type: "radar",
        data: dataArray.map((item, index) => ({
          value: item,
          name: columns[index],
        })),
      },
    ],
  };
};

export const RadarGroup = (
  data: { [key: string | number]: any }[],
  xAxis: string
): EChartsOption => {
  const columns = Object.keys(data[0]).slice(1);

  // 获取自动分配的中心点位置
  const centerPositions = getRadarCenterPositions(columns.length);

  // 为每个数据项创建雷达图配置
  const radarData = columns.map((_, index) => {
    return {
      indicator: data.map((indicatorItem) => {
        return {
          name: indicatorItem[xAxis],
          max:
            Math.max(
              ...Object.values(indicatorItem).filter(
                (value) => typeof value === "number"
              )
            ) * 1.2,
        };
      }),
      shape: "circle",
      center: centerPositions[index] || ["50%", "50%"], // 使用自动分配的位置
      radius: "25%", // 调整半径以适应多雷达图布局
    };
  });

  const series = columns.map((column, index) => {
    return {
      type: "radar",
      radarIndex: index, // 指定使用哪个雷达图配置
      tooltip: {
        trigger: "item",
      },
      areaStyle: {
        opacity: 0.3,
      },
      data: [
        {
          name: column,
          value: data.map((item) => item[column]),
        },
      ],
    };
  });

  return {
    toolbox: toolboxOption,
    title: {
      text: "Multiple Radar",
    },
    tooltip: {
      trigger: "axis",
    },
    color: predefinedColors.Brand.Algolia,
    legend: {
      left: "center",
      data: columns,
    },
    radar: radarData as RadarComponentOption[],
    series: series as SeriesOption[],
  };
};
