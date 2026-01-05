import {
  EChartsOption,
  ToolboxComponentOption,
  ECharts,
  SeriesOption,
} from "echarts";
import toolbox from "./toolbox.json";
import predefinedColors from "@/components/common/colors.json";
import { echartsError } from "../utils/validation";
import { width } from "@mui/system";
import ItemStyle from "../common/ItemStyle";

// Cast JSON toolbox to ECharts option to satisfy TS literal types
const toolboxOption = toolbox as unknown as ToolboxComponentOption;

export const PieBasic = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string
): EChartsOption => {
  const seriesData = data.map((item) => {
    return {
      name: item[xAxis],
      value: item[yAxis],
    };
  });
  return {
    toolbox: toolboxOption,
    title: {
      text: "Referer of a Website",
      subtext: "Fake Data",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "horizontal",
      top: "85%",
    },
    color: predefinedColors.Brand.Bootstrap,
    series: [
      {
        name: xAxis,
        type: "pie",
        radius: "50%",
        data: seriesData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
};

export const PieDoughnut = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string
): EChartsOption => {
  const pieData = data.map((item) => {
    return {
      name: item[xAxis],
      value: item[yAxis],
    };
  });
  return {
    toolbox: toolboxOption,
    title: {
      text: "Referer of a Website",
      subtext: "Fake Data",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "90%",
      left: "center",
    },
    color: predefinedColors.Brand.Socialbro,
    series: [
      {
        name: xAxis,
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: pieData,
      },
    ],
  };
};

export const PieHalf = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string
): EChartsOption => {
  const pieData = data.map((item) => {
    return {
      name: item[xAxis],
      value: item[yAxis],
    };
  });
  return {
    toolbox: toolboxOption,
    title: {
      text: "Half Pie Chart",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "10%",
      left: "center",
    },
    color: predefinedColors.Brand["Elastic Search"],
    series: [
      {
        name: xAxis,
        type: "pie",
        padAngle: 5,
        radius: ["40%", "70%"],
        center: ["50%", "70%"],
        startAngle: 180,
        endAngle: 360,
        data: pieData,
      },
    ],
  };
};

export const PieNightingale = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string
): EChartsOption => {
  const pieData = data.map((item) => {
    return {
      name: item[xAxis],
      value: item[yAxis],
    };
  });
  return {
    toolbox: toolboxOption,
    title: {
      text: "Nightingale Rose Chart",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "95%",
      left: "center",
    },
    color: predefinedColors.Brand.Yo,
    series: [
      {
        name: xAxis,
        type: "pie",
        radius: [50, 250],
        center: ["50%", "50%"],
        roseType: "area",
        itemStyle: {
          borderRadius: 8,
        },
        data: pieData,
      },
    ],
  };
};

export const PieNest = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string,
  groupAxis: string
): EChartsOption => {
  const pieData = data.map((item) => {
    return {
      name: item[xAxis],
      value: item[yAxis],
      category: item[groupAxis],
    };
  });
  const categorys = [...new Set(data.map((item) => item[groupAxis]))];
  if (categorys.length > 2) {
    return echartsError("最多支持 2 个分类");
  }
  if (categorys.length < 2) {
    return echartsError("至少需要 2 个分类");
  }

  return {
    toolbox: toolboxOption,
    color: predefinedColors.Brand.Zendesk,
    series: [
      {
        name: categorys[0],
        type: "pie",
        selectedMode: "single",
        radius: [0, "30%"],
        label: {
          position: "inner",
          fontSize: 14,
        },
        labelLine: {
          show: false,
        },
        data: pieData.filter((item) => item.category === categorys[0]),
      },
      {
        name: categorys[1],
        type: "pie",
        radius: ["45%", "60%"],
        labelLine: {
          length: 30,
        },
        label: {
          formatter: "{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ",
          backgroundColor: "#F6F8FC",
          borderColor: "#8C8D8E",
          borderWidth: 1,
          borderRadius: 4,
          rich: {
            a: {
              color: "#6E7079",
              lineHeight: 22,
              align: "center",
            },
            hr: {
              borderColor: "#8C8D8E",
              width: "100%",
              borderWidth: 1,
              height: 0,
            },
            b: {
              color: "#4C5058",
              fontSize: 14,
              fontWeight: "bold",
              lineHeight: 33,
            },
            per: {
              color: "#fff",
              backgroundColor: "#4C5058",
              padding: [3, 4],
              borderRadius: 4,
            },
          },
        },
        data: pieData.filter((item) => item.category === categorys[1]),
      },
    ],
  };
};

export const PieCombine = (
  data: { [key: string | number]: any }[],
  xAxis: string,
  yAxis: string,
  groupAxis: string,
  chartInstance?: ECharts | null
): EChartsOption => {
  const pieData = data.map((item) => {
    return {
      name: item[xAxis],
      value: item[yAxis],
      category: item[groupAxis],
    };
  });
  const categorys = [...new Set(pieData.map((item) => item.category))];
  const size = 100 / categorys.length;
  const series = categorys.map((category, index) => {
    let top = index * size;
    return {
      name: category,
      type: "pie",
      radius: ["20%", "60%"],
      top: `${top}%`,
      height: `${size}%`,
      left: "center",
      width: 400,
      ItemStyle: {
        borderColor: "#fff",
        borderWidth: 1,
      },
      label: {
        alignTo: "edge",
        formatter: "{name|{b}}\n{time|{c} 小时}",
        minMargin: 5,
        edgeDistance: 10,
        lineHeight: 15,
        rich: {
          time: {
            fontSize: 10,
            color: "#999",
          },
        },
      },
      labelLine: {
        length: 15,
        length2: 0,
        maxSurfaceAngle: 80,
      },
      labelLayout: function (params: any) {
        const isLeft =
          params.labelRect.x < (chartInstance?.getWidth() ?? 600) / 2;
        const points = params.labelLinePoints;
        // Update the end point.
        points[2][0] = isLeft
          ? params.labelRect.x
          : params.labelRect.x + params.labelRect.width;
        return {
          labelLinePoints: points,
        };
      },
      data: pieData.filter((item) => item.category === category),
    };
  });

  return {
    toolbox: toolboxOption,
    title: {
      text: "阅读书籍分布",
      left: "center",
      textStyle: {
        color: "#999",
        fontWeight: "normal",
        fontSize: 14,
      },
    },
    color: predefinedColors.Brand.Trello,
    series: series as SeriesOption[],
  };
};
