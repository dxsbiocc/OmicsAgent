import {
  EChartsOption,
  SeriesOption,
  ToolboxComponentOption,
  graphic,
  TitleComponentOption,
  SingleAxisComponentOption,
  MarkLineComponentOption,
} from "echarts";
import toolbox from "./toolbox.json";
import predefinedColors from "@/components/common/colors.json";
import { json2Array } from "../utils";

// Cast JSON toolbox to ECharts option to satisfy TS literal types
const toolboxOption = toolbox as unknown as ToolboxComponentOption;

export const ScatterBasic = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string
): EChartsOption => {
  return {
    toolbox: toolboxOption,
    title: {
      text: "Scatter Basic",
    },
    tooltip: {
      position: "top",
    },
    xAxis: {
      type: "value",
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        type: "scatter",
        encode: { tooltip: [0, 1] },
        symbolSize: 15,
        itemStyle: {
          color: "#1AAFD0",
          borderColor: "#555",
        },
        data: data.map((d) => [d[xAxis], d[yAxis]]),
      },
    ],
  };
};

export const ScatterGroup = (
  data: { [key: string | number]: any }[],
  colorAxis: string
): EChartsOption => {
  const dimensions = Object.keys(data[0]);
  const groups = [...new Set(data.map((d) => d[colorAxis]))];

  return {
    toolbox: toolboxOption,
    title: {
      text: "Scatter Group",
    },
    tooltip: {
      position: "top",
    },
    dataset: {
      dimensions: dimensions,
      source: json2Array(data, dimensions),
    },
    visualMap: [
      {
        type: "piecewise",
        top: "middle",
        min: 0,
        max: groups.length - 1,
        left: 10,
        splitNumber: groups.length,
        dimension: dimensions.indexOf(colorAxis),
        pieces: groups.map((item, index) => ({
          value: item,
          label: item,
          color: predefinedColors.Brand.Algolia[index],
        })),
      },
    ],
    grid: {
      left: 120,
    },
    xAxis: {},
    yAxis: {},
    series: {
      type: "scatter",
      encode: { tooltip: [0, 1] },
      symbolSize: 15,
      itemStyle: {
        borderColor: "#555",
      },
    },
  };
};

export const ScatterBubble = (
  data: { [key: string | number]: any }[],
  colorAxis: string,
  sizeAxis: string
): EChartsOption => {
  const dimensions = Object.keys(data[0]);
  const groups = [...new Set(data.map((d) => d[colorAxis]))];
  const colorNames = ["TealGrn", "SunsetDark", "Purp", "Teal", "OrYel"];

  const series = groups.map((group, index) => {
    return {
      name: group,
      type: "scatter",
      data: json2Array(
        data.filter((d) => d[colorAxis] === group),
        dimensions
      ),
      symbolSize: function (data: any) {
        const index = dimensions.indexOf(sizeAxis);
        return Math.sqrt(data[index]) / 5e2;
      },
      emphasis: {
        focus: "series",
        label: {
          show: true,
          formatter: function (param: any) {
            return (Array.isArray(param?.data) && param.data[4]) || "";
          },
          position: "top",
        },
      },
      itemStyle: {
        shadowBlur: 10,
        shadowColor:
          predefinedColors.Quantitative[
            colorNames[index] as keyof typeof predefinedColors.Quantitative
          ][5],
        shadowOffsetY: 5,
        color: new graphic.RadialGradient(0.4, 0.3, 1, [
          {
            offset: 0,
            color:
              predefinedColors.Quantitative[
                colorNames[index] as keyof typeof predefinedColors.Quantitative
              ][0],
          },
          {
            offset: 1,
            color:
              predefinedColors.Quantitative[
                colorNames[index] as keyof typeof predefinedColors.Quantitative
              ][4],
          },
        ]),
      },
    };
  });

  return {
    toolbox: toolboxOption,
    backgroundColor: new graphic.RadialGradient(0.3, 0.3, 0.8, [
      {
        offset: 0,
        color: "#f7f8fa",
      },
      {
        offset: 1,
        color: "#cdd0d5",
      },
    ]),
    title: {
      text: "Life Expectancy and GDP by Country",
      left: "5%",
      top: "3%",
    },
    legend: {
      right: "20%",
      top: "3%",
      data: ["1990", "2015"],
    },
    grid: {
      left: "8%",
      top: "10%",
    },
    xAxis: {
      splitLine: {
        lineStyle: {
          type: "dashed",
        },
      },
    },
    yAxis: {
      splitLine: {
        lineStyle: {
          type: "dashed",
        },
      },
      scale: true,
    },
    series: series as SeriesOption[],
  };
};

export const ScatterJitter = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string
): EChartsOption => {
  const categories = [...new Set(data.map((d) => d[xAxis]))];

  return {
    toolbox: toolboxOption,
    title: {
      text: "Scatter with Jittering",
    },
    grid: {
      left: 80,
      right: 50,
    },
    xAxis: {
      type: "category",
      jitter: (600 / categories.length) * 0.8,
      jitterOverlap: true,
      data: categories,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: xAxis,
        type: "scatter",
        data: json2Array(data, [xAxis, yAxis]),
        colorBy: "data",
        itemStyle: {
          opacity: 0.8,
        },
      },
    ],
  };
};

export const ScatterSingleAxis = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string,
  colorAxis: string
): EChartsOption => {
  const categories = [...new Set(data.map((d) => d[colorAxis]))];
  const title: TitleComponentOption[] = [];
  const singleAxis: SingleAxisComponentOption[] = [];
  const series: SeriesOption[] = [];
  categories.forEach((category, index) => {
    title.push({
      text: category,
      textBaseline: "middle",
      top: ((index + 1) * 90) / categories.length + "%",
    });

    singleAxis.push({
      type: "category",
      left: 50,
      right: 50,
      top: (index * 90) / categories.length + 5 + "%",
      boundaryGap: false,
      data: [...new Set(data.map((d) => d[xAxis]))],
      height: 100 / categories.length - 10 + "%",
      axisLabel: {
        interval: 2,
      },
    });

    series.push({
      name: category,
      singleAxisIndex: index,
      coordinateSystem: "singleAxis",
      type: "scatter",
      data: json2Array(
        data.filter((d) => d[colorAxis] === category),
        [xAxis, yAxis]
      ),
      symbolSize: function (data: any) {
        return data[1] * 4;
      },
    });
  });
  return {
    toolbox: toolboxOption,
    color: predefinedColors.Brand.Algolia,
    tooltip: {
      position: "top",
      formatter: function (params: any) {
        return params.name + ": " + params.value[1];
      },
    },
    title: title,
    singleAxis: singleAxis,
    series: series as SeriesOption[],
  };
};

export const ScatterCorrelation = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string,
  correlation: number,
  pvalue: number,
  fitLine: number[][]
): EChartsOption => {
  // 格式化 p 值为科学计数法
  const formatPValue = (p: number): string => {
    if (p === 0) return "0";
    if (p >= 0.001) return p.toFixed(3);
    // 使用科学计数法
    const exponent = Math.floor(Math.log10(Math.abs(p)));
    const coefficient = p / Math.pow(10, exponent);
    return `${coefficient.toFixed(2)}e${exponent}`;
  };

  // 验证 fitLine 格式：应该是 [[x1, y1], [x2, y2]]
  let markLineData: any[] = [];
  if (Array.isArray(fitLine) && fitLine.length >= 2) {
    const point1 = fitLine[0];
    const point2 = fitLine[1];
    if (
      Array.isArray(point1) &&
      Array.isArray(point2) &&
      point1.length >= 2 &&
      point2.length >= 2
    ) {
      // ECharts markLine.data 格式：[[{ coord: [x1, y1] }, { coord: [x2, y2] }]]
      markLineData = [
        [
          { coord: [Number(point1[0]), Number(point1[1])], symbol: "none" },
          { coord: [Number(point2[0]), Number(point2[1])], symbol: "none" },
        ],
      ];
    }
  }

  const pValueFormatted = formatPValue(pvalue);
  const markLine = {
    animation: false,
    lineStyle: {
      type: "solid",
      color: "#ee6666",
      width: 2,
    },
    tooltip: {
      formatter: `correlation: ${correlation.toFixed(
        3
      )}, pvalue: ${pValueFormatted}`,
    },
    data: markLineData,
  };

  return {
    toolbox: toolboxOption,
    title: {
      text: `${xAxis} vs ${yAxis} 表达相关性`,
      subtext: `r = ${correlation.toFixed(3)}, p = ${formatPValue(pvalue)}`,
      left: "center",
    },
    tooltip: {
      position: "top",
      formatter: (params: any) => {
        if (params.seriesName === "correlation scatter") {
          return `${xAxis}: ${params.value[0].toFixed(
            2
          )}<br/>${yAxis}: ${params.value[1].toFixed(2)}`;
        }
        return "";
      },
    },
    grid: {
      left: "5%",
      right: "5%",
      bottom: "5%",
      top: "5%",
    },
    xAxis: {
      type: "value",
      name: `${xAxis} 表达量 (TPM)`,
      nameLocation: "middle",
      nameGap: 30,
      splitLine: {
        lineStyle: {
          type: "dashed",
        },
      },
    },
    yAxis: {
      type: "value",
      name: `${yAxis} 表达量 (TPM)`,
      nameLocation: "middle",
      nameGap: 50,
      splitLine: {
        lineStyle: {
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "correlation scatter",
        type: "scatter",
        data: data.map((d) => [d[xAxis], d[yAxis]]),
        symbolSize: 8,
        itemStyle: {
          color: "#5470c6",
          opacity: 0.6,
        },
        emphasis: {
          itemStyle: {
            color: "#91cc75",
            borderColor: "#333",
            borderWidth: 2,
          },
        },
        markLine: markLine as MarkLineComponentOption,
      },
    ],
  };
};
