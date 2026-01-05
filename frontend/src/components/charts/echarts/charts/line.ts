import { EChartsOption, ToolboxComponentOption, graphic } from "echarts";
import { pivotData, json2Array } from "../utils";
import toolbox from "./toolbox.json";
import predefinedColors from "@/components/common/colors.json";

// Cast JSON toolbox to ECharts option to satisfy TS literal types
const toolboxOption = toolbox as unknown as ToolboxComponentOption;

export const LineBasic = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string
): EChartsOption => {
  return {
    toolbox: toolboxOption,
    title: {
      text: "Basic Line",
    },
    tooltip: {
      trigger: "axis",
    },
    dataset: {
      dimensions: data[0] ? Object.keys(data[0]) : [],
      source: data,
    },
    xAxis: {
      type: "category",
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        type: "line",
        smooth: true,
        areaStyle: {
          opacity: 0.3,
          color: "#1AAFD0",
        },
        encode: {
          x: xAxis,
          y: yAxis,
        },
      },
    ],
  };
};

export const LineGroup = (
  data: { [key: string | number]: any }[]
): EChartsOption => {
  // 数据包含三列： x, y, group

  const columns = Object.keys(data[0] || {});
  if (columns.length < 3) {
    return {};
  }

  const dataArray = pivotData(data, columns[0], columns[1], columns[2]);
  const legendData = dataArray[0].slice(1);

  return {
    toolbox: toolboxOption,
    title: {
      text: "Grouped Line",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      show: true,
      data: legendData,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    dataset: {
      dimensions: dataArray[0],
      source: dataArray.slice(1),
    },
    xAxis: {
      type: "category",
    },
    yAxis: {
      type: "value",
    },
    series: legendData.map((name) => ({
      type: "line",
      name: name,
    })),
  };
};

export const LineStack = (
  data: { [key: string | number]: any }[] = []
): EChartsOption => {
  const columns = Object.keys(data[0] || {});
  if (columns.length < 3) {
    return {};
  }

  const dataArray = pivotData(data, columns[0], columns[1], columns[2]);
  const legendData = dataArray[0].slice(1);

  return {
    toolbox: toolboxOption,
    title: {
      text: "Grouped Line",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      show: true,
      data: legendData,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    dataset: {
      dimensions: dataArray[0],
      source: dataArray.slice(1),
    },
    xAxis: {
      type: "category",
    },
    yAxis: {
      type: "value",
    },
    series: legendData.map((name) => ({
      type: "line",
      name: name,
      stack: "total",
      smooth: true,
      lineStyle: {
        width: 0,
      },
      areaStyle: {
        opacity: 0.8,
      },
      showSymbol: false,
      emphasis: {
        focus: "series",
      },
    })),
  };
};

export const LineHighLight = (
  data: { [key: string | number]: any }[] = []
): EChartsOption => {
  const columns = Object.keys(data[0] || {});
  if (columns.length < 2) {
    return {};
  }
  const dataArray = json2Array(data, columns);
  return {
    toolbox: toolboxOption,
    title: {
      show: true,
      text: "High Light Line",
    },
    tooltip: {
      trigger: "axis",
    },
    dataset: {
      dimensions: columns,
      source: dataArray,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      boundaryGap: [0, "30%"],
    },
    visualMap: {
      type: "piecewise",
      show: true,
      dimension: 0,
      seriesIndex: 0,
      orient: "horizontal",
      left: "center",
      pieces: [
        {
          gt: 1,
          lt: 3,
          color: "#3BE8B0",
        },
        {
          gt: 5,
          lt: 7,
          color: "#3BE8B0",
        },
      ],
    },
    series: [
      {
        type: "line",
        smooth: 0.6,
        symbol: "none",
        lineStyle: {
          color: "#30C39E",
          width: 5,
        },
        markLine: {
          symbol: ["none", "none"],
          label: { show: false },
          data: [{ xAxis: 1 }, { xAxis: 3 }, { xAxis: 5 }, { xAxis: 7 }],
          lineStyle: {
            color: "#00BCE4",
            width: 1,
          },
        },
        areaStyle: {},
      },
    ],
  };
};

export const LineBump = (
  data: { [key: string | number]: any }[] = []
): EChartsOption => {
  if (!data || data.length === 0) {
    return {};
  }

  const columns = Object.keys(data[0] || {});

  return {
    toolbox: toolboxOption,
    title: {
      text: "Bump Chart (Ranking)",
    },
    tooltip: {
      trigger: "item",
    },
    grid: {
      left: 30,
      right: 110,
      bottom: 30,
      containLabel: true,
    },
    dataset: {
      dimensions: columns,
      source: data,
    },
    xAxis: {
      type: "category",
      splitLine: {
        show: true,
      },
      axisLabel: {
        margin: 30,
        fontSize: 16,
      },
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      axisLabel: {
        margin: 30,
        fontSize: 16,
        formatter: "#{value}",
      },
      inverse: true,
      interval: 1,
      min: 1,
      max: columns.length - 1,
    },
    series: columns.slice(1).map((name) => ({
      type: "line",
      name: name,
      smooth: true,
      symbolSize: 20,
      emphasis: {
        focus: "series",
      },
      endLabel: {
        show: true,
        distance: 20,
        formatter: "{a}",
      },
      lineStyle: {
        width: 4,
      },
    })),
  };
};

export const LineDoubleAxis = (
  data: { [key: string | number]: any }[] = [],
  xAxis: string,
  y1Axis: string,
  y2Axis: string
): EChartsOption => {
  const xData = data.map((d) => d[xAxis]);
  const y1Data = data.map((d) => d[y1Axis]);
  const y2Data = data.map((d) => d[y2Axis]);

  const y1Name = y1Axis.replace(/\(.*?\)/g, "").trim();
  const y2Name = y2Axis.replace(/\(.*?\)/g, "").trim();

  return {
    toolbox: toolboxOption,
    title: {
      text: "Rainfall and Flow Relationship",
      left: "center",
    },
    grid: {
      bottom: 80,
    },
    color: predefinedColors.Brand.Aiesec,
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        animation: false,
        label: {
          backgroundColor: "#505765",
        },
      },
    },
    legend: {
      data: [y1Name, y2Name],
      left: 10,
      orient: "vertical",
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 65,
        end: 85,
      },
      {
        type: "inside",
        realtime: true,
        start: 65,
        end: 85,
      },
    ],
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        axisLine: { onZero: false },
        data: xData.map(function (str) {
          return str.replace(" ", "\n");
        }),
      },
    ],
    yAxis: [
      {
        name: y1Axis,
        type: "value",
      },
      {
        name: y2Axis,
        nameLocation: "start",
        alignTicks: true,
        type: "value",
        inverse: true,
      },
    ],
    series: [
      {
        name: y1Name,
        type: "line",
        areaStyle: {},
        lineStyle: {
          width: 1,
        },
        emphasis: {
          focus: "series",
        },
        markArea: {
          silent: true,
          itemStyle: {
            opacity: 0.3,
          },
          data: [
            [
              {
                xAxis: "2009/9/12\n7:00",
              },
              {
                xAxis: "2009/9/22\n7:00",
              },
            ],
          ],
        },
        data: y1Data,
      },
      {
        name: y2Name,
        type: "line",
        yAxisIndex: 1,
        areaStyle: {},
        lineStyle: {
          width: 1,
        },
        emphasis: {
          focus: "series",
        },
        markArea: {
          silent: true,
          itemStyle: {
            opacity: 0.3,
          },
          data: [
            [
              {
                xAxis: "2009/9/10\n7:00",
              },
              {
                xAxis: "2009/9/20\n7:00",
              },
            ],
          ],
        },
        data: y2Data,
      },
    ],
  };
};

export const LineIndependent = (
  data: { [key: string | number]: any }[] = [],
  xAxis: string,
  y1Axis: string,
  y2Axis: string
): EChartsOption => {
  const xData = data.map((d) => d[xAxis].replace("2009/", ""));
  const y1Data = data.map((d) => d[y1Axis]);
  const y2Data = data.map((d) => d[y2Axis]);

  const y1Name = y1Axis.replace(/\(.*?\)/g, "").trim();
  const y2Name = y2Axis.replace(/\(.*?\)/g, "").trim();

  return {
    toolbox: toolboxOption,
    title: {
      text: "Rainfall and Flow Relationship",
      left: "center",
    },
    grid: [
      {
        left: 60,
        right: 50,
        height: "35%",
      },
      {
        left: 60,
        right: 50,
        top: "55%",
        height: "35%",
      },
    ],
    color: predefinedColors.Brand.Aiesec,
    tooltip: {
      trigger: "axis",
      axisPointer: {
        animation: false,
      },
    },
    legend: {
      data: [y1Name, y2Name],
      top: "9.7%",
      left: "80%",
      orient: "vertical",
    },
    axisPointer: {
      link: [
        {
          xAxisIndex: "all",
        },
      ],
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 30,
        end: 70,
        xAxisIndex: [0, 1],
      },
      {
        type: "inside",
        realtime: true,
        start: 30,
        end: 70,
        xAxisIndex: [0, 1],
      },
    ],
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        axisLine: { onZero: false },
        data: xData,
      },
      {
        gridIndex: 1,
        type: "category",
        boundaryGap: false,
        axisLine: { onZero: false },
        data: xData,
        position: "top",
      },
    ],
    yAxis: [
      {
        name: y1Axis,
        type: "value",
      },
      {
        gridIndex: 1,
        name: y2Axis,
        type: "value",
        inverse: true,
      },
    ],
    series: [
      {
        name: y1Name,
        type: "line",
        symbolSize: 8,
        data: y1Data,
      },
      {
        name: y2Name,
        type: "line",
        xAxisIndex: 1,
        yAxisIndex: 1,
        symbolSize: 8,
        data: y2Data,
      },
    ],
  };
};
