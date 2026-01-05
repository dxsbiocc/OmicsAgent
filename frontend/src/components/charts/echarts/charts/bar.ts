import { EChartsOption, ToolboxComponentOption, ECharts } from "echarts";
import toolbox from "./toolbox.json";
import predefinedColors from "@/components/common/colors.json";
import { pivotData } from "../utils";
import { echartsError } from "../utils/validation";

// Cast JSON toolbox to ECharts option to satisfy TS literal types
const toolboxOption = {
  ...toolbox,
  ...{
    feature: {
      ...toolbox.feature,
      ...{ magicType: { type: ["stack"] } },
    },
  },
} as unknown as ToolboxComponentOption;

export const BarBasic = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string
): EChartsOption => {
  return {
    toolbox: toolboxOption,
    title: {
      text: "Basic Bar",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    dataset: {
      dimensions: data[0] ? Object.keys(data[0]) : [],
      source: data,
    },
    xAxis: {
      type: "category",
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        type: "bar",
        barWidth: "60%",
        itemStyle: {
          color: "#1CC7D0",
        },
        encode: {
          x: xAxis,
          y: yAxis,
        },
      },
    ],
  };
};

export const BarWaterfall = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string
): EChartsOption => {
  const values = data.map((d) => d[yAxis]);
  const help: number[] = [];
  const positive: (string | number)[] = [];
  const negative: (string | number)[] = [];
  for (let i = 0, sum = 0; i < values.length; ++i) {
    if (i === 0) {
      help.push(0);
    } else {
      sum += values[i - 1];
      if (values[i] < 0) {
        help.push(sum + values[i]);
      } else {
        help.push(sum);
      }
    }

    if (values[i] >= 0) {
      positive.push(help[i] < 0 ? values[i] + help[i] : values[i]);
      negative.push("-");
    } else {
      positive.push("-");
      negative.push(help[i] < 0 ? -values[i] + help[i] : -values[i]);
    }
  }

  return {
    toolbox: toolboxOption,
    title: {
      text: "Waterfall Bar",
    },
    legend: {
      data: ["positive", "negative"],
      top: "5%",
      left: "60%",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params: any) {
        if (params[1].value > 0) {
          return `${params[1].name}<br/>变化: +${params[1].value}`;
        } else {
          return `${params[2].name}<br/>变化: -${params[2].value}`;
        }
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: data.map((d) => d[xAxis]),
      axisLabel: {
        interval: 0,
      },
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "placeholder",
        type: "bar",
        stack: "all",
        itemStyle: {
          borderColor: "transparent",
          color: (params: any) => {
            if (params.value > 0) {
              return "transparent";
            } else {
              return positive?.at(params.dataIndex) !== "-"
                ? "#FF6C5F"
                : "#2DDE98";
            }
          },
        },
        data: help,
      },
      {
        name: "positive",
        type: "bar",
        stack: "all",
        label: {
          show: true,
          position: "top",
          formatter: function (params: any) {
            if (help[params.dataIndex] < 0 && params.value > 0) {
              return `+${params.value - help[params.dataIndex]}`;
            } else {
              return `+${params.value}`;
            }
          },
        },
        itemStyle: {
          color: "#FF6C5F",
        },
        data: positive,
      },
      {
        name: "negative",
        type: "bar",
        stack: "all",
        label: {
          show: true,
          position: "top",
          formatter: function (params: any) {
            if (help[params.dataIndex] < 0 && params.value > 0) {
              return `-${params.value - help[params.dataIndex]}`;
            } else {
              return `-${params.value}`;
            }
          },
        },
        itemStyle: {
          color: "#2DDE98",
        },
        data: negative,
      },
    ],
  };
};

export const BarGroup = (
  data: { [key: string | number]: any }[]
): EChartsOption => {
  const columns = data[0] ? Object.keys(data[0]) : [];
  const dataArray = pivotData(data, columns[0], columns[1], columns[2]);
  const legendData = dataArray[0].slice(1);

  const series: any[] = legendData.map((column) => {
    return {
      name: column,
      type: "bar",
      label: {
        show: true,
        rotate: 90,
        position: "insideBottom",
        distance: 15,
        align: "left",
        verticalAlign: "middle",
        formatter: function (params: any) {
          return `${params.value[params.encode.y[0]]}`;
        },
        frontSize: 16,
      },
      emphasis: {
        focus: "series",
      },
    };
  });

  return {
    toolbox: toolboxOption,
    color: predefinedColors.Brand.Algolia,
    title: {
      text: "Stack Bar",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      show: true,
      data: legendData,
    },
    dataset: {
      dimensions: dataArray[0],
      source: dataArray.slice(1),
    },
    xAxis: {
      type: "category",
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
    },
    series: series as any,
  };
};

export const BarStack = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string,
  stack: string,
  chartInstance?: ECharts | null
): EChartsOption => {
  const dataArray = pivotData(data, xAxis, yAxis, stack);
  const categories = dataArray[0].slice(1);
  const xValues = dataArray.slice(1).map((d) => d[0]);
  const totalValues = dataArray
    .slice(1)
    .map((d) => d.slice(1).reduce((acc, curr) => acc + curr, 0));
  // 计算变化区域
  const grid = {
    left: 100,
    right: 100,
    top: 50,
    bottom: 100,
  };

  let elements: any[] = [];
  if (chartInstance) {
    const width = chartInstance.getWidth()!;
    const height = chartInstance.getHeight()!;

    const gridWidth = width - grid.left - grid.right;
    const gridHeight = height - grid.top - grid.bottom;
    const categoryWidth = gridWidth / xValues.length;
    const barWidth = categoryWidth * 0.6;
    const barPadding = (categoryWidth - barWidth) / 2;
    const color = predefinedColors.Brand.Socialbro;

    for (let j = 1, jlen = xValues.length; j < jlen; ++j) {
      const leftX = grid.left + categoryWidth * j - barPadding;
      const rightX = leftX + barPadding * 2;
      let leftY = grid.top + gridHeight;
      let rightY = leftY;
      for (let i = 0, len = categories.length; i < len; ++i) {
        const points = [];
        const leftBarHeight =
          (dataArray[j][i + 1] / totalValues[j - 1]) * gridHeight;
        points.push([leftX, leftY]);
        points.push([leftX, leftY - leftBarHeight]);
        const rightBarHeight =
          (dataArray[j + 1][i + 1] / totalValues[j]) * gridHeight;
        points.push([rightX, rightY - rightBarHeight]);
        points.push([rightX, rightY]);
        points.push([leftX, leftY]);
        leftY -= leftBarHeight;
        rightY -= rightBarHeight;
        elements.push({
          type: "polygon",
          shape: {
            points,
          },
          style: {
            fill: color[i],
            opacity: 0.3,
          },
        });
      }
    }
  }

  return {
    toolbox: toolboxOption,
    title: {
      text: "Stack Bar",
    },
    legend: {
      selectedMode: false,
      top: "90%",
      left: "24%",
    },
    color: predefinedColors.Brand.Socialbro,
    grid: grid,
    xAxis: {
      type: "category",
      data: xValues,
    },
    yAxis: {
      type: "value",
    },
    series: categories.map((category, index) => {
      return {
        name: category,
        type: "bar",
        stack: "total",
        barWidth: "60%",
        label: {
          show: true,
          formatter: (params: any) => {
            return `${Math.round(params.value * 1000) / 10}%`;
          },
        },
        data: dataArray
          .slice(1)
          .map((d, i) =>
            totalValues[i] < 0 ? 0 : d[index + 1] / totalValues[i]
          ),
        emphasis: {
          focus: "series",
        },
      };
    }),
    graphic: { elements },
  };
};

export const BarBreak = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string,
  colorAxis: string
): EChartsOption => {
  const categories = [...new Set(data.map((d) => d[colorAxis]))];

  const series = categories.map((category) => {
    return {
      name: category,
      type: "bar",
      emphasis: {
        focus: "series",
      },
      data: data.filter((d) => d[colorAxis] === category).map((d) => d[yAxis]),
    };
  });
  return {
    toolbox: toolboxOption,
    title: {
      text: "Bar Chart with Axis Breaks",
      subtext: "Click the break area to expand it",
      left: "center",
      textStyle: {
        fontSize: 20,
      },
      subtextStyle: {
        color: "#175ce5",
        fontSize: 15,
        fontWeight: "bold",
      },
    },
    color: predefinedColors.Brand["Elastic Search"],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {},
    grid: {
      top: 120,
    },
    xAxis: [
      {
        type: "category",
        data: [...new Set(data.map((d) => d[xAxis]))],
      },
    ],
    yAxis: [
      {
        type: "value",
        breaks: [
          {
            start: 5000,
            end: 100000,
            gap: "1.5%",
          },
          {
            start: 105000,
            end: 3100000,
            gap: "1.5%",
          },
        ],
        breakArea: {
          show: true,
          itemStyle: {
            opacity: 1,
          },
          zigzagZ: 200,
        },
      },
    ],
    series: series as any,
  };
};

export const BarPolarVertical = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string
): EChartsOption => {
  const yData = data.map((d) => d[yAxis]);
  const maxY = Math.max(...yData);

  return {
    toolbox: toolboxOption,
    title: [
      {
        text: "垂直极坐标柱状图",
      },
    ],
    color: predefinedColors.Brand.Algolia,
    polar: {
      radius: [30, "80%"],
    },
    radiusAxis: {
      max: maxY * 1.2,
    },
    angleAxis: {
      type: "category",
      data: data.map((d) => d[xAxis]),
      startAngle: 70,
    },
    tooltip: {},
    series: {
      type: "bar",
      data: yData,
      colorBy: "data",
      coordinateSystem: "polar",
      showBackground: true,
      barWidth: "56%",
      label: {
        show: true,
        position: "end",
        formatter: "{b}: {c}",
      },
    },
  };
};

export const BarPolarHorizontal = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string
): EChartsOption => {
  const xData = data.map((d) => d[xAxis]);
  const yData = data.map((d) => d[yAxis]);
  const maxY = Math.max(...yData);

  return {
    toolbox: toolboxOption,
    title: [{ text: "水平极坐标柱状图" }],
    polar: {
      radius: [30, "80%"],
    },
    radiusAxis: {
      type: "category",
      axisTick: { show: false },
      axisLabel: { interval: 0 },
      data: xData,
    },
    angleAxis: {
      max: maxY * 1.2,
      startAngle: 90,
    },
    tooltip: {},
    series: {
      type: "bar",
      data: yData,
      colorBy: "data",
      coordinateSystem: "polar",
      label: {
        show: true,
        position: "middle",
        formatter: "{c}",
      },
    },
  };
};

export const BarPolarSector = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string,
  groupBy: string
): EChartsOption => {
  const categories = [...new Set(data.map((d) => d[groupBy]))];

  if (categories.length !== 2) {
    return echartsError(
      "Group by must have exactly 2 categories"
    ) as EChartsOption;
  }

  return {
    toolbox: toolboxOption,
    title: [{ text: "扇形柱状图" }],
    legend: {
      data: categories,
      left: "60%",
      top: "70%",
    },
    color: predefinedColors.Brand["Elastic Search"],
    polar: [{}, {}],
    radiusAxis: [{ polarIndex: 0 }, { polarIndex: 1 }],
    angleAxis: [
      {
        type: "category",
        polarIndex: 0,
        startAngle: 90,
        endAngle: 0,
        data: data
          .filter((d) => d[groupBy] === categories[0])
          .map((d) => d[xAxis]),
      },
      {
        type: "category",
        polarIndex: 1,
        startAngle: -90,
        endAngle: -180,
        data: data
          .filter((d) => d[groupBy] === categories[1])
          .map((d) => d[xAxis]),
      },
    ],
    series: categories.map((category, index) => {
      return {
        name: category,
        type: "bar",
        coordinateSystem: "polar",
        data: data.filter((d) => d[groupBy] === category).map((d) => d[yAxis]),
        polarIndex: index,
      };
    }),
  };
};

export const BarPolarStack = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string,
  colorAxis: string
): EChartsOption => {
  const categories = [...new Set(data.map((d) => d[colorAxis]))];

  return {
    toolbox: toolboxOption,
    title: [{ text: "堆积柱状图" }],
    legend: {
      data: categories,
    },
    // color: predefinedColors.Brand["Elastic Search"],
    polar: { radius: [30, "80%"] },
    radiusAxis: {},
    angleAxis: {
      type: "category",
      data: [...new Set(data.map((d) => d[xAxis]))],
      startAngle: 75,
    },
    series: categories.map((category) => {
      return {
        name: category,
        type: "bar",
        coordinateSystem: "polar",
        stack: "all",
        data: data
          .filter((d) => d[colorAxis] === category)
          .map((d) => d[yAxis]),
        emphasis: {
          focus: "series",
        },
      };
    }),
  };
};

export const BarPolarStackRing = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string,
  colorAxis: string
): EChartsOption => {
  const categories = [...new Set(data.map((d) => d[colorAxis]))];

  return {
    toolbox: toolboxOption,
    title: [{ text: "圆环堆积柱状图" }],
    legend: {
      data: categories,
    },
    color: predefinedColors.Brand["Elastic Search"],
    polar: { radius: [30, "80%"] },
    radiusAxis: {
      type: "category",
      data: [...new Set(data.map((d) => d[xAxis]))],
      z: 10,
      axisTick: { show: false },
      axisLabel: { interval: 0 },
    },
    angleAxis: {},
    series: categories.map((category) => {
      return {
        name: category,
        type: "bar",
        coordinateSystem: "polar",
        stack: "all",
        data: data
          .filter((d) => d[colorAxis] === category)
          .map((d) => d[yAxis]),
        emphasis: {
          focus: "series",
        },
        interval: 0,
        tickLength: 0,
      };
    }),
  };
};
