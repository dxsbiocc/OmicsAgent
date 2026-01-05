import { EChartsOption, ToolboxComponentOption, ECharts } from "echarts";
import toolbox from "./toolbox.json";
import predefinedColors from "@/components/common/colors.json";
import { echartsError } from "../utils/validation";

const toolboxOption = toolbox as unknown as ToolboxComponentOption;

export const MatrixBasic = (
  data: { [key: string | number]: any }[]
): EChartsOption => {
  return {
    toolbox: toolboxOption,
    title: {
      text: "Matrix Basic",
    },
  };
};
