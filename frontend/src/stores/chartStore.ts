import { create } from "zustand";
import { produce, current } from "immer";
import { EChartsOption } from "echarts";
import { ECharts } from "echarts";
import { dispatchEChartsOption } from "@/components/charts/echarts/utils";

interface ChartData {
  tableData: any[] | Record<string, any[]>;
  selectedVariables: {
    xAxis: string;
    yAxis: string;
    groupBy: string;
  };
  chartOption: EChartsOption | null;
  loading: boolean;
  toolName: string;
  chartInstance: ECharts | null;
  // 额外参数，用于特殊图表类型（如相关性散点图）
  extraParams?: Record<string, any> | undefined;
  // 追踪数据是否更新（用于判断是否需要重新上传数据）
  dataUpdated: boolean;
}

interface ChartActions {
  setTableData: (data: any[] | Record<string, any[]>) => void;
  setSelectedVariables: (
    variables: Partial<ChartData["selectedVariables"]>
  ) => void;
  setChartOption: (updater: (draft: EChartsOption | null) => void) => void;
  updateChartOption: (partialOption: Partial<EChartsOption>) => void;
  setLoading: (loading: boolean) => void;
  setToolName: (toolName: string) => void;
  setChartInstance: (instance: ECharts | null) => void;
  setExtraParams: (params?: ChartData["extraParams"]) => void;
  setDataUpdated: (updated: boolean) => void; // 设置数据更新状态
  updateChartWithDimensions: () => void;
  updateChart: () => void;
  resetChart: () => void;
}

type ChartStore = ChartData & ChartActions;

export const useChartStore = create<ChartStore>((set, get) => ({
  // 初始状态
  tableData: [] as any[] | Record<string, any[]>,
  selectedVariables: {
    xAxis: "",
    yAxis: "",
    groupBy: "",
  },
  chartOption: null,
  loading: false,
  toolName: "",
  chartInstance: null,
  extraParams: undefined,
  dataUpdated: false,

  // Actions
  setTableData: (data) => {
    // 确保数据是可变的，避免只读属性错误
    // 支持两种数据格式：数组 [] 或对象 {}
    let mutableData: any;

    if (Array.isArray(data)) {
      // 数组格式：单表格数据
      mutableData = data.map((row) => JSON.parse(JSON.stringify(row)));
    } else if (data && typeof data === "object") {
      // 对象格式：多表格数据（如 {nodes: [], links: []}）
      mutableData = JSON.parse(JSON.stringify(data));
    } else {
      // 其他情况，设置为空数组
      mutableData = [];
    }

    set((state) => ({
      tableData: mutableData,
      selectedVariables: produce(state.selectedVariables, (draft) => {
        if (Array.isArray(mutableData)) {
          if (mutableData.length === 0) {
            // 当数据为空时，清空变量选择
            draft.xAxis = "";
            draft.yAxis = "";
            draft.groupBy = "";
          } else {
            // 当数据变化时，自动设置默认变量
            if (!draft.xAxis || !draft.yAxis) {
              const columns = Object.keys(mutableData[0] || {});
              if (columns.length >= 2) {
                draft.xAxis = draft.xAxis || columns[0];
                draft.yAxis = draft.yAxis || columns[1];
              }
            }
          }
        } else {
          // 对象格式数据，不清空变量选择
        }
      }),
    }));

    // 触发图表更新
    get().updateChart();
  },

  setSelectedVariables: (variables) => {
    const { tableData } = get();

    set((state) => ({
      selectedVariables: produce(state.selectedVariables, (draft) => {
        // 验证选择的变量是否在当前数据中有效
        if (Array.isArray(tableData) && tableData.length > 0) {
          const columns = Object.keys(tableData[0]);

          if (variables.xAxis !== undefined) {
            draft.xAxis = columns.includes(variables.xAxis)
              ? variables.xAxis
              : "";
          }
          if (variables.yAxis !== undefined) {
            draft.yAxis = columns.includes(variables.yAxis)
              ? variables.yAxis
              : "";
          }
          if (variables.groupBy !== undefined) {
            draft.groupBy = columns.includes(variables.groupBy)
              ? variables.groupBy
              : "";
          }
        } else {
          // 如果没有数据，直接更新
          if (variables.xAxis !== undefined) draft.xAxis = variables.xAxis;
          if (variables.yAxis !== undefined) draft.yAxis = variables.yAxis;
          if (variables.groupBy !== undefined)
            draft.groupBy = variables.groupBy;
        }
      }),
    }));

    // 触发图表更新
    get().updateChart();
  },

  setChartOption: (updater) => {
    set((state) => ({
      chartOption: produce(state.chartOption, updater),
    }));
  },

  updateChartOption: (partialOption) => {
    set((state) => {
      if (state.chartOption === null) {
        return { chartOption: partialOption as EChartsOption };
      }

      // 使用 immer 进行深度合并，避免只读属性问题
      return {
        chartOption: produce(state.chartOption, (draft) => {
          // 深度合并，避免直接修改只读属性
          const deepMerge = (target: any, source: any) => {
            for (const key in source) {
              if (source.hasOwnProperty(key)) {
                if (
                  typeof source[key] === "object" &&
                  source[key] !== null &&
                  !Array.isArray(source[key])
                ) {
                  if (
                    typeof target[key] === "object" &&
                    target[key] !== null &&
                    !Array.isArray(target[key])
                  ) {
                    deepMerge(target[key], source[key]);
                  } else {
                    target[key] = { ...source[key] };
                  }
                } else {
                  target[key] = source[key];
                }
              }
            }
          };

          deepMerge(draft, partialOption);
        }),
      };
    });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setToolName: (toolName) => {
    set((state) => ({
      toolName,
      chartOption: null, // 清空图表配置
      selectedVariables: produce(state.selectedVariables, (draft) => {
        // 当工具名称变化时，重置变量
        draft.xAxis = "";
        draft.yAxis = "";
        draft.groupBy = "";
      }),
    }));

    // 触发图表更新
    get().updateChart();
  },

  setChartInstance: (instance) => {
    set({ chartInstance: instance });
  },

  setExtraParams: (params) => {
    set({ extraParams: params });
  },

  setDataUpdated: (updated) => {
    set({ dataUpdated: updated });
  },

  updateChartWithDimensions: () => {
    const {
      tableData,
      selectedVariables,
      toolName,
      chartInstance,
      extraParams,
    } = get();

    if (Array.isArray(tableData) && tableData.length === 0) {
      return;
    }
    if (!Array.isArray(tableData) && Object.keys(tableData).length === 0) {
      return;
    }

    // 使用 dispatchEChartsOption 根据不同的工具类型生成不同的图表配置
    const newChartOption = dispatchEChartsOption(
      tableData,
      {
        ...selectedVariables,
        chartInstance,
        ...(extraParams || {}),
      },
      toolName,
      chartInstance
    );

    set((state) => ({
      chartOption: produce(state.chartOption, (draft) => {
        // 只更新需要根据尺寸调整的配置，避免完全重新生成
        if (draft && newChartOption) {
          // 更新grid配置以适应新尺寸
          if (newChartOption.grid) {
            Object.assign(draft.grid || {}, newChartOption.grid);
          }
          // 更新textStyle配置
          if (newChartOption.textStyle) {
            Object.assign(draft.textStyle || {}, newChartOption.textStyle);
          }
          // 更新其他可能需要根据尺寸调整的配置
          if (newChartOption.legend) {
            Object.assign(draft.legend || {}, newChartOption.legend);
          }
        }
        return draft;
      }),
    }));
  },

  updateChart: () => {
    const {
      tableData,
      selectedVariables,
      toolName,
      chartInstance,
      extraParams,
    } = get();

    // 检查数据是否为空
    const isEmpty = Array.isArray(tableData)
      ? tableData.length === 0
      : Object.keys(tableData).length === 0;

    if (isEmpty) {
      set((state) => ({
        chartOption: produce(state.chartOption, (draft) => {
          if (draft === null) {
            return {
              title: { text: "暂无数据" },
              xAxis: { type: "category" },
              yAxis: { type: "value" },
              series: [],
            } as any;
          } else {
            Object.assign(draft, {
              title: { text: "暂无数据" },
              xAxis: { type: "category" },
              yAxis: { type: "value" },
              series: [],
            });
          }
        }),
      }));
      return;
    }

    // 使用 dispatchEChartsOption 根据不同的工具类型生成不同的图表配置
    const newChartOption = dispatchEChartsOption(
      tableData,
      {
        ...selectedVariables,
        chartInstance,
        ...(extraParams || {}),
      },
      toolName,
      chartInstance
    );

    set((state) => ({
      chartOption: produce(state.chartOption, (draft) => {
        // 初始化图形时，直接使用 newChartOption 覆盖整个配置
        // 这样可以确保所有配置（包括 splitLine、axisLabel 等）都能正确应用
        return newChartOption as any;
      }),
    }));
  },

  resetChart: () => {
    set((state) => ({
      tableData: [] as any[] | Record<string, any[]>,
      selectedVariables: { xAxis: "", yAxis: "", groupBy: "" },
      chartOption: null,
      loading: false,
      toolName: "",
      chartInstance: null,
      extraParams: undefined,
      dataUpdated: false,
    }));
  },
}));
