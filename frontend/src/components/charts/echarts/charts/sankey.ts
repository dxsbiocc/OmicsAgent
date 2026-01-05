import { EChartsOption, ToolboxComponentOption, ECharts } from "echarts";
import toolbox from "./toolbox.json";
import predefinedColors from "@/components/common/colors.json";
import { calculateSankeyDepths } from "../utils/dataProcess";

const toolboxOption = toolbox as unknown as ToolboxComponentOption;

export const SankeyBasic = (
  data: { [key: string | number]: any }[],
  source: string,
  target: string,
  value: string
): EChartsOption => {
  const links = data.map((d) => ({
    source: d[source],
    target: d[target],
    value: typeof d[value] === "number" ? d[value] : Number(d[value]) || 0,
  }));

  // 将节点从字符串转换为 { name } 对象，符合 ECharts Sankey 规范
  const nodeNameSet = new Set<string>([
    ...links.map((l) => String(l.source)),
    ...links.map((l) => String(l.target)),
  ]);
  const nodes = Array.from(nodeNameSet).map((name) => ({ name }));
  return {
    toolbox: toolboxOption,
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
    },
    title: {
      text: "Sankey Basic",
      left: "center",
    },
    color: predefinedColors.Brand.Gospel,
    series: [
      {
        type: "sankey",
        left: "10%",
        right: "10%",
        emphasis: {
          focus: "adjacency",
        },
        lineStyle: {
          color: "gradient",
        },
        data: nodes as any,
        links: links,
      },
    ],
  };
};

export const SankeyLevel = (
  data: { [key: string | number]: any }[],
  source: string,
  target: string,
  value: string
): EChartsOption => {
  const links = data.map((d) => ({
    source: d[source],
    target: d[target],
    value: typeof d[value] === "number" ? d[value] : Number(d[value]) || 0,
  }));

  // 将节点从字符串转换为 { name } 对象，符合 ECharts Sankey 规范
  const nodeNameSet = new Set<string>([
    ...links.map((l) => String(l.source)),
    ...links.map((l) => String(l.target)),
  ]);
  const nodes = Array.from(nodeNameSet).map((name) => ({ name }));

  // 计算每个节点的层级(depth)
  const { maxDepth, levelsCount } = calculateSankeyDepths(links);

  const levels = Array.from({ length: levelsCount }).map((_, depth) => ({
    depth,
    itemStyle: {
      color:
        predefinedColors.Brand["Elastic Search"][
          depth % predefinedColors.Brand["Elastic Search"].length
        ],
    },
    lineStyle: {
      color: "source",
      opacity: 0.4,
    },
    label: {
      color: "#333",
    },
  }));

  return {
    toolbox: toolboxOption,
    title: {
      text: "Sankey Diagram",
    },
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
    },
    series: [
      {
        type: "sankey",
        top: "10%",
        data: nodes,
        links: links,
        emphasis: {
          focus: "adjacency",
        },
        levels,
        lineStyle: {
          curveness: 0.5,
        },
      },
    ],
  };
};
