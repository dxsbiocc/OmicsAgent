import { EChartsOption, ToolboxComponentOption, ECharts } from "echarts";
import toolbox from "./toolbox.json";
import predefinedColors from "@/components/common/colors.json";
import { echartsError } from "../utils/validation";

const toolboxOption = toolbox as unknown as ToolboxComponentOption;

export const GraphBasic = (
  data: { [key: string | number]: any }[] | { [key: string | number]: any }
): EChartsOption => {
  console.log("text", data);
  try {
    // graph 数据必须是对象类型 {nodes: [], links: []}
    if (Array.isArray(data)) {
      throw new Error(
        "Graph data must be an object with 'nodes' and 'links' properties, e.g., {nodes: [], links: []}. Array format is not supported."
      );
    }

    if (!data || typeof data !== "object") {
      throw new Error(
        "Graph data is required and must be an object with 'nodes' and 'links' properties"
      );
    }

    const graph = data;

    const nodes = graph?.nodes || [];
    const links = graph?.links || [];

    // 验证 nodes 和 links 是否为数组
    if (!Array.isArray(nodes)) {
      throw new Error("nodes must be an array");
    }
    if (!Array.isArray(links)) {
      throw new Error("links must be an array");
    }

    // 验证并过滤无效的 links
    let validLinks = links;
    if (links.length > 0 && nodes.length > 0) {
      const nodeNames = new Set(nodes.map((n: any) => n?.name).filter(Boolean));
      validLinks = links.filter((link: any) => {
        if (!link || (link.source === undefined && link.target === undefined)) {
          return false;
        }
        const source = link.source;
        const target = link.target;
        // source 和 target 可以是节点名称（字符串）或节点索引（数字）
        if (typeof source === "string") {
          if (!nodeNames.has(source)) {
            console.warn(`Link source "${source}" not found in nodes`);
            return false;
          }
        } else if (typeof source === "number") {
          if (source < 0 || source >= nodes.length) {
            console.warn(`Link source index ${source} out of range`);
            return false;
          }
        }
        if (typeof target === "string") {
          if (!nodeNames.has(target)) {
            console.warn(`Link target "${target}" not found in nodes`);
            return false;
          }
        } else if (typeof target === "number") {
          if (target < 0 || target >= nodes.length) {
            console.warn(`Link target index ${target} out of range`);
            return false;
          }
        }
        return true;
      });
    }

    // 构建 categories 配置：从 nodes 的 category 字段获取
    let categories: any[] = [];

    // 检查第一个节点是否有 category 字段
    if (nodes.length > 0 && nodes[0].hasOwnProperty("category")) {
      // 提取所有唯一的 category 值
      const categoryValues = Array.from(
        new Set(
          nodes
            .map((n: any) => n.category)
            .filter((v: any) => v !== undefined && v !== null && v !== "")
        )
      ).sort((a: any, b: any) => {
        // 数字排序
        if (typeof a === "number" && typeof b === "number") {
          return a - b;
        }
        // 字符串排序
        return String(a).localeCompare(String(b));
      });

      if (categoryValues.length > 0) {
        // 为每个唯一的 category 值创建配置
        categories = categoryValues.map((cat: any) => ({
          name: String(cat),
        }));
      }
    }

    return {
      toolbox: toolboxOption,
      title: {
        text: "Basic Graph",
      },
      tooltip: {},
      animationDurationUpdate: 1500,
      animationEasingUpdate: "quinticInOut",
      series: [
        {
          type: "graph",
          layout: "none",
          symbolSize: 50,
          roam: true,
          label: {
            show: true,
          },
          edgeSymbol: ["circle", "arrow"],
          edgeSymbolSize: [4, 10],
          edgeLabel: {
            fontSize: 20,
          },
          lineStyle: {
            opacity: 0.9,
            width: 2,
            curveness: 0.1,
          },
          nodes: nodes,
          links: validLinks,
          categories: categories.length > 0 ? categories : undefined,
        },
      ],
    };
  } catch (error) {
    return echartsError(error as string);
  }
};

export const GraphForce = (
  data: { [key: string | number]: any }[] | { [key: string | number]: any }
): EChartsOption => {
  try {
    // graph 数据必须是对象类型 {nodes: [], links: []}
    if (Array.isArray(data)) {
      throw new Error(
        "Graph data must be an object with 'nodes' and 'links' properties, e.g., {nodes: [], links: []}. Array format is not supported."
      );
    }

    if (!data || typeof data !== "object") {
      throw new Error(
        "Graph data is required and must be an object with 'nodes' and 'links' properties"
      );
    }

    const graph = data;

    const nodes = graph?.nodes || [];
    const links = graph?.links || [];

    // 验证 nodes 和 links 是否为数组
    if (!Array.isArray(nodes)) {
      throw new Error("nodes must be an array");
    }
    if (!Array.isArray(links)) {
      throw new Error("links must be an array");
    }

    // 验证并过滤无效的 links
    let validLinks = links;
    if (links.length > 0 && nodes.length > 0) {
      const nodeNames = new Set(nodes.map((n: any) => n?.name).filter(Boolean));
      validLinks = links.filter((link: any) => {
        if (!link || (link.source === undefined && link.target === undefined)) {
          return false;
        }
        const source = link.source;
        const target = link.target;
        if (typeof source === "string") {
          if (!nodeNames.has(source)) return false;
        } else if (typeof source === "number") {
          if (source < 0 || source >= nodes.length) return false;
        }
        if (typeof target === "string") {
          if (!nodeNames.has(target)) return false;
        } else if (typeof target === "number") {
          if (target < 0 || target >= nodes.length) return false;
        }
        return true;
      });
    }

    // 构建 categories 配置：从 nodes 的 category 字段获取
    let categories: any[] = [];

    // 检查第一个节点是否有 category 字段
    if (nodes.length > 0 && nodes[0].hasOwnProperty("category")) {
      // 提取所有唯一的 category 值
      const categoryValues = Array.from(
        new Set(
          nodes
            .map((n: any) => n.category)
            .filter((v: any) => v !== undefined && v !== null && v !== "")
        )
      ).sort((a: any, b: any) => {
        // 数字排序
        if (typeof a === "number" && typeof b === "number") {
          return a - b;
        }
        // 字符串排序
        return String(a).localeCompare(String(b));
      });

      if (categoryValues.length > 0) {
        // 为每个唯一的 category 值创建配置
        categories = categoryValues.map((cat: any) => ({
          name: String(cat),
        }));
      }
    }

    return {
      toolbox: toolboxOption,
      title: {
        text: "Force Graph",
        subtext: "Force directed layout",
        top: "bottom",
        left: "right",
      },
      tooltip: {},
      legend:
        categories.length > 0
          ? [
              {
                data: categories.map((cat: any) => cat.name),
              },
            ]
          : undefined,
      series: [
        {
          name: "Force Graph",
          type: "graph",
          layout: "force",
          data: nodes,
          links: validLinks,
          categories: categories.length > 0 ? categories : undefined,
          roam: true,
          label: {
            position: "right",
          },
          force: {
            repulsion: 100,
          },
          zoom: 2,
        },
      ],
    };
  } catch (error) {
    return echartsError(error as string);
  }
};

export const GraphCircular = (
  data: { [key: string | number]: any }[] | { [key: string | number]: any }
): EChartsOption => {
  try {
    // graph 数据必须是对象类型 {nodes: [], links: []}
    if (Array.isArray(data)) {
      throw new Error(
        "Graph data must be an object with 'nodes' and 'links' properties, e.g., {nodes: [], links: []}. Array format is not supported."
      );
    }

    if (!data || typeof data !== "object") {
      throw new Error(
        "Graph data is required and must be an object with 'nodes' and 'links' properties"
      );
    }

    const graph = data;

    const nodes = graph?.nodes || [];
    const links = graph?.links || [];

    // 验证 nodes 和 links 是否为数组
    if (!Array.isArray(nodes)) {
      throw new Error("nodes must be an array");
    }
    if (!Array.isArray(links)) {
      throw new Error("links must be an array");
    }

    // 验证并过滤无效的 links
    let validLinks = links;
    if (links.length > 0 && nodes.length > 0) {
      const nodeNames = new Set(nodes.map((n: any) => n?.name).filter(Boolean));
      validLinks = links.filter((link: any) => {
        if (!link || (link.source === undefined && link.target === undefined)) {
          return false;
        }
        const source = link.source;
        const target = link.target;
        if (typeof source === "string") {
          if (!nodeNames.has(source)) return false;
        } else if (typeof source === "number") {
          if (source < 0 || source >= nodes.length) return false;
        }
        if (typeof target === "string") {
          if (!nodeNames.has(target)) return false;
        } else if (typeof target === "number") {
          if (target < 0 || target >= nodes.length) return false;
        }
        return true;
      });
    }

    // 构建 categories 配置：从 nodes 的 category 字段获取
    let categories: any[] = [];

    // 检查第一个节点是否有 category 字段
    if (nodes.length > 0 && nodes[0].hasOwnProperty("category")) {
      // 提取所有唯一的 category 值
      const categoryValues = Array.from(
        new Set(
          nodes
            .map((n: any) => n.category)
            .filter((v: any) => v !== undefined && v !== null && v !== "")
        )
      ).sort((a: any, b: any) => {
        // 数字排序
        if (typeof a === "number" && typeof b === "number") {
          return a - b;
        }
        // 字符串排序
        return String(a).localeCompare(String(b));
      });

      if (categoryValues.length > 0) {
        // 为每个唯一的 category 值创建配置
        categories = categoryValues.map((cat: any) => ({
          name: String(cat),
        }));
      }
    }

    nodes.forEach((node: any) => {
      node.label = {
        show: node.symbolSize > 30,
      };
    });

    return {
      toolbox: toolboxOption,
      title: {
        text: "Les Miserables",
        subtext: "Circular layout",
        top: "bottom",
        left: "right",
      },
      tooltip: {},
      legend:
        categories.length > 0
          ? [
              {
                data: categories.map((cat: any) => cat.name),
              },
            ]
          : undefined,
      series: [
        {
          name: "Circular Graph",
          type: "graph",
          layout: "circular",
          circular: {
            rotateLabel: true,
          },
          data: nodes,
          links: validLinks,
          categories: categories.length > 0 ? categories : undefined,
          roam: true,
          label: {
            position: "right",
            formatter: "{b}",
          },
          lineStyle: {
            color: "source",
            curveness: 0.3,
          },
          zoom: 1,
          animationDelayUpdate: 1500,
          animationEasingUpdate: "quinticInOut",
        },
      ],
    };
  } catch (error) {
    return echartsError(error as string);
  }
};

export const GraphCartesian = (
  data: { [key: string | number]: any }[] | { [key: string | number]: any }
): EChartsOption => {
  try {
    // graph 数据必须是对象类型 {nodes: [], links: []}
    if (Array.isArray(data)) {
      throw new Error(
        "Graph data must be an object with 'nodes' and 'links' properties, e.g., {nodes: [], links: []}. Array format is not supported."
      );
    }

    if (!data || typeof data !== "object") {
      throw new Error(
        "Graph data is required and must be an object with 'nodes' and 'links' properties"
      );
    }

    const graph = data;

    const nodes = graph?.nodes || [];
    const links = graph?.links || [];

    // 验证 nodes 和 links 是否为数组
    if (!Array.isArray(nodes)) {
      throw new Error("nodes must be an array");
    }
    if (!Array.isArray(links)) {
      throw new Error("links must be an array");
    }

    // 验证并过滤无效的 links
    let validLinks = links;
    if (links.length > 0 && nodes.length > 0) {
      const nodeNames = new Set(nodes.map((n: any) => n?.name).filter(Boolean));
      validLinks = links.filter((link: any) => {
        if (!link || (link.source === undefined && link.target === undefined)) {
          return false;
        }
        const source = link.source;
        const target = link.target;
        if (typeof source === "string") {
          if (!nodeNames.has(source)) return false;
        } else if (typeof source === "number") {
          if (source < 0 || source >= nodes.length) return false;
        }
        if (typeof target === "string") {
          if (!nodeNames.has(target)) return false;
        } else if (typeof target === "number") {
          if (target < 0 || target >= nodes.length) return false;
        }
        return true;
      });
    }

    return {
      toolbox: toolboxOption,
      title: {
        text: "Graph on Cartesian",
      },
      tooltip: {},
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: nodes.map((node: any) => node.name),
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          type: "graph",
          layout: "none",
          coordinateSystem: "cartesian2d",
          symbolSize: 40,
          label: {
            show: true,
          },
          color: predefinedColors.Brand.Algolia,
          edgeSymbol: ["circle", "arrow"],
          edgeSymbolSize: [4, 10],
          data: nodes.map((node: any) => ({
            value: node.y,
          })),
          links: validLinks,
          lineStyle: {
            color: "#2f4554",
          },
        },
      ],
    };
  } catch (error) {
    return echartsError(error as string);
  }
};
