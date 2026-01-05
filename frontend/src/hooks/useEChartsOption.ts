import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { produce } from "immer";
import { EChartsOption } from "echarts";

interface UseEChartsOptionOptions {
  initialOption?: EChartsOption;
  onOptionChange?: (option: EChartsOption) => void;
}

interface UseEChartsOptionReturn {
  option: EChartsOption;
  updateOption: (updater: (draft: EChartsOption) => void) => void;
  resetOption: () => void;
  setOption: (option: EChartsOption) => void;
  // 额外的辅助方法
  mergeOption: (partialOption: Partial<EChartsOption>) => void;
  updateNestedProperty: (path: (string | number)[], value: any) => void;
  batchUpdate: (updates: { path: (string | number)[]; value: any }[]) => void;
  getNestedProperty: (path: (string | number)[]) => any;
  hasProperty: (path: (string | number)[]) => boolean;
  removeNestedProperty: (path: (string | number)[]) => void;
}

/**
 * 自定义 Hook 用于管理 ECharts 配置的深度修改
 * 使用 Immer 提供不可变的深度更新功能
 */
export const useEChartsOption = ({
  initialOption = {},
  onOptionChange,
}: UseEChartsOptionOptions = {}): UseEChartsOptionReturn => {
  const [option, setOptionState] = useState<EChartsOption>(initialOption);

  // 使用 useRef 来避免 onOptionChange 导致的循环
  const onOptionChangeRef = useRef(onOptionChange);
  onOptionChangeRef.current = onOptionChange;

  // 当 initialOption 变化时，同步更新内部状态
  useEffect(() => {
    setOptionState(initialOption);
  }, [initialOption]);

  // 通用的更新函数
  const updateOption = useCallback(
    (updater: (draft: EChartsOption) => void) => {
      setOptionState((currentOption) => {
        const newOption = produce(currentOption, updater);
        onOptionChangeRef.current?.(newOption);
        return newOption;
      });
    },
    []
  );

  // 重置配置
  const resetOption = useCallback(() => {
    setOptionState(initialOption);
    onOptionChangeRef.current?.(initialOption);
  }, [initialOption]);

  // 设置完整配置
  const setOption = useCallback((newOption: EChartsOption) => {
    setOptionState(newOption);
    onOptionChangeRef.current?.(newOption);
  }, []);

  // 深度合并配置的辅助函数
  const mergeOption = useCallback(
    (partialOption: Partial<EChartsOption>) => {
      updateOption((draft) => {
        Object.assign(draft, partialOption);
      });
    },
    [updateOption]
  );

  // 深度更新嵌套属性的辅助函数
  const updateNestedProperty = useCallback(
    (path: (string | number)[], value: any) => {
      updateOption((draft) => {
        let current: any = draft;
        for (let i = 0; i < path.length - 1; i++) {
          if (!current[path[i]]) {
            current[path[i]] = {};
          }
          current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
      });
    },
    [updateOption]
  );

  // 批量更新多个属性
  const batchUpdate = useCallback(
    (updates: Array<{ path: (string | number)[]; value: any }>) => {
      updateOption((draft) => {
        updates.forEach(({ path, value }) => {
          let current: any = draft;
          for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
              current[path[i]] = {};
            }
            current = current[path[i]];
          }
          current[path[path.length - 1]] = value;
        });
      });
    },
    [updateOption]
  );

  // 获取嵌套属性值的辅助函数
  const getNestedProperty = useCallback(
    (path: (string | number)[]) => {
      let current: any = option;
      for (const key of path) {
        if (current && typeof current === "object" && key in current) {
          current = current[key];
        } else {
          return undefined;
        }
      }
      return current;
    },
    [option]
  );

  // 检查属性是否存在的辅助函数
  const hasProperty = useCallback(
    (path: (string | number)[]) => {
      return getNestedProperty(path) !== undefined;
    },
    [getNestedProperty]
  );

  // 删除嵌套属性的辅助函数
  const removeNestedProperty = useCallback(
    (path: (string | number)[]) => {
      updateOption((draft) => {
        let current: any = draft;
        for (let i = 0; i < path.length - 1; i++) {
          if (!current[path[i]]) {
            return;
          }
          current = current[path[i]];
        }
        if (current && typeof current === "object") {
          delete current[path[path.length - 1]];
        }
      });
    },
    [updateOption]
  );

  // 使用 useMemo 优化返回值
  const returnValue = useMemo(
    () => ({
      option,
      updateOption,
      resetOption,
      setOption,
      // 额外的辅助方法
      mergeOption,
      updateNestedProperty,
      batchUpdate,
      getNestedProperty,
      hasProperty,
      removeNestedProperty,
    }),
    [
      option,
      updateOption,
      resetOption,
      setOption,
      mergeOption,
      updateNestedProperty,
      batchUpdate,
      getNestedProperty,
      hasProperty,
      removeNestedProperty,
    ]
  );

  return returnValue;
};

export default useEChartsOption;
