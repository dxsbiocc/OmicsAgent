import { EChartsOption, ToolboxComponentOption, SeriesOption } from "echarts";
import toolbox from "./toolbox.json";
import predefinedColors from "@/components/common/colors.json";

const toolboxOption = toolbox as unknown as ToolboxComponentOption;

export const BoxplotBasic = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string
): EChartsOption => {
  // Prepare boxplot data
  const categories = [...new Set(data.map((d) => d[xAxis]))];
  const boxData = categories.map((category) => {
    const values = data
      .filter((d) => d[xAxis] === category)
      .map((d) => d[yAxis]);
    return values;
  });

  //   const BoxplotSeriesModel = (ComponentModel as any)
  //     .getClassesByMainType("series")
  //     .find((cls: any) => cls.type === "series.boxplot");

  //   const BoxplotSeriesModelFill = function (...args: any[]) {
  //     const _this = new BoxplotSeriesModel(...args);
  //     _this.visualDrawType = "fill";
  //     return _this;
  //   };
  //   BoxplotSeriesModelFill.type = BoxplotSeriesModel.type;
  //   (ComponentModel as any).registerClass(BoxplotSeriesModelFill);

  return {
    toolbox: toolboxOption,
    title: {
      text: "Boxplot Basic",
    },
    tooltip: {
      trigger: "item",
      axisPointer: {
        type: "shadow",
      },
    },
    dataset: [
      {
        dimensions: categories,
        source: boxData,
      },
      {
        transform: {
          type: "boxplot",
          config: {
            itemNameFormatter: function (params: any) {
              return categories[params.value];
            },
          },
        },
      },
      {
        fromDatasetIndex: 1,
        fromTransformResult: 1,
      },
    ],
    grid: {
      left: "10%",
      right: "10%",
      bottom: "15%",
    },
    xAxis: {
      type: "category",
      boundaryGap: true,
      nameGap: 30,
      splitArea: {
        show: false,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: "value",
      name: yAxis,
      splitArea: {
        show: true,
      },
    },
    color: predefinedColors.Brand.Bootstrap,
    series: [
      {
        name: "boxplot",
        type: "boxplot",
        colorBy: "data",
        datasetIndex: 1,
      },
      {
        name: "outlier",
        type: "scatter",
        datasetIndex: 2,
        itemStyle: {
          color: "#000",
        },
      },
    ],
  };
};

export const BoxplotGroup = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string,
  groupAxis: string
): EChartsOption => {
  const xData = [...new Set(data.map((d) => d[xAxis]))];
  const groups = [...new Set(data.map((d) => d[groupAxis]))];
  const dataset = groups.flatMap((group, index) => {
    return [
      {
        id: group,
        dimensions: xData,
        source: xData.map((x) =>
          data
            .filter((d) => d[groupAxis] === group && d[xAxis] === x)
            .map((d) => d[yAxis])
        ),
      },
      {
        name: `boxplot ${group}`,
        fromDatasetIndex: index,
        transform: { type: "boxplot" },
      },
    ];
  });
  const series = groups.flatMap((group, index) => {
    return [
      {
        name: group,
        type: "boxplot",
        datasetIndex: index * groups.length + 1,
        itemStyle: {
          color: predefinedColors.Brand.Aiesec[index],
          borderColor: predefinedColors.Brand.Aiesec[index],
        },
      },
    ];
  });
  return {
    toolbox: toolboxOption,
    title: {
      text: `Boxplot Group by ${groupAxis}`,
    },
    tooltip: {
      trigger: "item",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: groups,
    },
    grid: {
      left: "10%",
      top: "20%",
      right: "10%",
      bottom: "15%",
    },
    dataset: dataset,
    xAxis: {
      type: "category",
      boundaryGap: true,
      nameGap: 30,
      splitArea: {
        show: true,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: "value",
      name: yAxis,
      splitArea: {
        show: false,
      },
    },
    series: series as SeriesOption[],
  };
};
