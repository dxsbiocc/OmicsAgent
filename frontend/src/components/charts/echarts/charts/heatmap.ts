import { EChartsOption, SeriesOption, ToolboxComponentOption } from "echarts";
import toolbox from "./toolbox.json";
import predefinedColors from "@/components/common/colors.json";
import { pivotData } from "../utils";
import { echartsError } from "../utils/validation";

const toolboxOption = toolbox as unknown as ToolboxComponentOption;

export const HeatmapBasic = (
  data: { [key: string | number]: any }[],
  xAxis: string
): EChartsOption => {
  const xData = [...new Set(data.map((d) => d[xAxis]))];
  const yData = Object.keys(data[0]).filter((key) => key !== xAxis);

  // Convert to heatmap data format: [x, y, value][]
  const heatmapData = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const xValue = row[xAxis];
    for (const yKey of yData) {
      const yValue = yKey;
      const value = row[yKey];
      heatmapData.push([xValue, yValue, value]);
    }
  }

  return {
    toolbox: toolboxOption,
    tooltip: {
      position: "top",
    },
    grid: {
      height: "50%",
      top: "10%",
    },
    xAxis: {
      type: "category",
      data: xData,
      splitArea: {
        show: true,
      },
    },
    yAxis: {
      type: "category",
      data: yData,
      splitArea: {
        show: true,
      },
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: "15%",
      inRange: {
        color: predefinedColors.Quantitative.BluGrn,
      },
    },
    series: [
      {
        name: "Punch Card",
        type: "heatmap",
        data: heatmapData,
        label: {
          show: true,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ] as SeriesOption[],
  };
};
