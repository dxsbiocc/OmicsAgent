"use client";

import { useEffect } from "react";
import { Box } from "@mui/material";
import { ParameterConfig, ParameterItem, MarginConfig } from "../types";
import { Margin } from "./ElementParams";

interface OthersParamsProps {
  param: ParameterItem;
  index: number;
  config: ParameterConfig;
  onUpdate: (value: any) => void;
}

/**
 * 其他复合类型参数渲染器
 * 处理 margin 类型
 * arrow 类型现在由 BaseDynamicParams 处理
 */
export const OthersParams: React.FC<OthersParamsProps> = ({
  param,
  config,
  onUpdate,
}) => {
  // 使用 useEffect 确保当 param.value 为 undefined 时，初始化默认值
  useEffect(() => {
    if (param.value === undefined || param.value === null) {
      if (config.type === "margin") {
        const defaultValue = {
          type: "margin",
          arguments: { t: 0, r: 0, b: 0, l: 0, units: "pt" },
        };
        // 使用 setTimeout 确保在下一个渲染周期更新，避免在渲染期间更新状态
        const timer = setTimeout(() => {
          onUpdate(defaultValue);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param.value, config.type]);

  switch (config.type) {
    case "margin": {
      const elementValue = param.value as MarginConfig | undefined;
      // 如果值未初始化，使用默认值
      const element: MarginConfig =
        elementValue ||
        ({
          type: "margin",
          arguments: { t: 0, r: 0, b: 0, l: 0, units: "pt" },
        } as MarginConfig);

      return (
        <Margin
          element={element}
          onChange={(updatedElement) => onUpdate(updatedElement)}
        />
      );
    }

    default:
      return null;
  }
};
