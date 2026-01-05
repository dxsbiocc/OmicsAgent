import { EChartsOption, ToolboxComponentOption, SeriesOption } from "echarts";
import toolbox from "./toolbox.json";
import predefinedColors from "@/components/common/colors.json";

const toolboxOption = toolbox as unknown as ToolboxComponentOption;

export const TreeBasic = (
  data: { [key: string | number]: any }[]
): EChartsOption => {
  return {
    toolbox: toolboxOption,
    title: {
      text: "Tree Basic",
      left: "10%",
    },
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
    },
    series: [
      {
        type: "tree",
        data: data,
        top: "1%",
        left: "7%",
        bottom: "1%",
        right: "20%",
        symbolSize: 7,
        label: {
          show: true,
          position: "left",
          verticalAlign: "middle",
          align: "right",
          fontSize: 12,
        },
        itemStyle: {
          color: "#FC636B",
        },
        lineStyle: {
          color: "rgba(26, 175, 208, 0.7)",
        },
        leaves: {
          label: {
            show: true,
            position: "right",
            verticalAlign: "middle",
            align: "left",
          },
        },
        emphasis: {
          focus: "descendant",
        },
        initialTreeDepth: 2,
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750,
      },
    ],
  };
};

// 根据树的数量分配位置
const getTreePosition = (
  count: number,
  index: number
): {
  top: string;
  left: string;
  bottom: string;
  right: string;
} => {
  if (count === 1) {
    return { top: "5%", left: "5%", bottom: "5%", right: "5%" };
  } else if (count === 2) {
    const positions = [
      { top: "5%", left: "2%", bottom: "5%", right: "60%" },
      { top: "5%", left: "60%", bottom: "5%", right: "10%" },
    ];
    return positions[index % 2];
  } else if (count === 3) {
    const positions = [
      { top: "5%", left: "5%", bottom: "5%", right: "75%" },
      { top: "5%", left: "40%", bottom: "5%", right: "40%" },
      { top: "5%", left: "70%", bottom: "5%", right: "10%" },
    ];
    return positions[index % 3];
  } else if (count === 4) {
    const positions = [
      { top: "5%", left: "2%", bottom: "50%", right: "60%" },
      { top: "5%", left: "60%", bottom: "50%", right: "10%" },
      { top: "60%", left: "2%", bottom: "2%", right: "60%" },
      { top: "60%", left: "60%", bottom: "2%", right: "10%" },
    ];
    return positions[index % 4];
  } else {
    // 默认位置
    return { top: "5%", left: "5%", bottom: "5%", right: "5%" };
  }
};

export const TreeGroup = (
  data: { [key: string | number]: any }[]
): EChartsOption => {
  const count = data.length;

  return {
    toolbox: toolboxOption,
    title: {
      text: "Tree Group",
    },
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
    },
    legend: {
      top: "2%",
      left: "3%",
      orient: "vertical",
      data: data.map((item) => ({
        name: item.name,
        icon: "rectangle",
      })),
      borderColor: "#c23531",
    },
    series: data.map((item, index) => {
      const position = getTreePosition(count, index);
      return {
        type: "tree",
        name: item.name,
        data: [item],
        ...position,
        symbolSize: 7,
        layout: ["radial", "orthogonal"][index % 2] as "radial" | "orthogonal",
        label: {
          show: true,
          position: "left",
          verticalAlign: "middle",
          align: "right",
          fontSize: 9,
        },
        itemStyle: {
          color:
            predefinedColors.Brand.Aiesec[
              index % predefinedColors.Brand.Aiesec.length
            ],
        },
        leaves: {
          label: {
            show: true,
            position: "right",
            verticalAlign: "middle",
            align: "left",
          },
        },
        emphasis: {
          focus: "descendant",
        },
        initialTreeDepth: 2,
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750,
      };
    }),
  };
};
