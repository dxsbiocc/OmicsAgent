"use client";

import { useCallback, useMemo } from "react";
import { Paper, Typography } from "@mui/material";
import { GuideItemConfig } from "../types";
import { DynamicParams } from "../common/DynamicParams";
import { OverrideAes } from "./OverrideAes";
import {
  getAvailableGuideParams,
  guideLegendThemeParams,
  guideAxisThemeParams,
} from "./guideParams";

interface GuideConfigProps {
  params: GuideItemConfig;
  onChange: (guide: GuideItemConfig) => void;
}

export const GuideConfigComponent: React.FC<GuideConfigProps> = ({
  params,
  onChange,
}) => {
  // 更新普通参数（排除 theme 和 override.aes）
  const updateParams = useCallback(
    (newParams: Record<string, any>) => {
      // 保留 theme 和 override.aes 参数，更新其他参数
      const currentTheme = params.arguments?.theme;
      const currentOverrideAes = params.arguments?.["override.aes"];
      onChange({
        ...params,
        arguments: {
          ...newParams,
          ...(currentTheme && { theme: currentTheme }),
          ...(currentOverrideAes && { "override.aes": currentOverrideAes }),
        },
      });
    },
    [params, onChange]
  );

  // 更新主题参数（放到 theme 对象中，格式为 {type: 'theme', arguments: {...}}）
  const updateThemeParams = useCallback(
    (newThemeParams: Record<string, any>) => {
      // 保留其他参数（包括 override.aes），只更新 theme
      const {
        theme,
        "override.aes": overrideAes,
        ...otherParams
      } = params.arguments || {};
      const hasThemeParams = Object.keys(newThemeParams).length > 0;
      onChange({
        ...params,
        arguments: {
          ...otherParams,
          ...(overrideAes && { "override.aes": overrideAes }),
          ...(hasThemeParams && {
            theme: {
              type: "theme",
              arguments: newThemeParams,
            },
          }),
        },
      });
    },
    [params, onChange]
  );

  // 更新 override.aes 参数
  const updateOverrideAes = useCallback(
    (newOverrideAes: {
      type: "list";
      arguments: Record<string, string | number>;
    }) => {
      // 保留其他参数（包括 theme），只更新 override.aes
      const {
        theme,
        "override.aes": overrideAes,
        ...otherParams
      } = params.arguments || {};
      const hasOverrideAes =
        Object.keys(newOverrideAes.arguments || {}).length > 0;
      onChange({
        ...params,
        arguments: {
          ...otherParams,
          ...(theme && { theme }),
          ...(hasOverrideAes && { "override.aes": newOverrideAes }),
        },
      });
    },
    [params, onChange]
  );

  // 构建传递给 DynamicParams 的 value 对象（普通参数，排除 theme 和 override.aes）
  const dynamicParamsValue = useMemo(() => {
    const {
      theme,
      "override.aes": overrideAes,
      ...otherParams
    } = params.arguments || {};
    return otherParams;
  }, [params]);

  // 构建传递给 DynamicParams 的 theme value 对象（从 theme.arguments 读取）
  const themeParamsValue = useMemo(() => {
    const theme = params.arguments?.theme;
    // 如果 theme 是 ThemeConfig 格式（有 type 和 arguments），返回 arguments
    if (
      theme &&
      typeof theme === "object" &&
      "type" in theme &&
      "arguments" in theme
    ) {
      return theme.arguments || {};
    }
    // 兼容旧格式：如果 theme 是普通对象，直接返回
    if (theme && typeof theme === "object" && !("type" in theme)) {
      return theme;
    }
    return {};
  }, [params]);

  // 构建传递给 OverrideAes 的 value 对象
  const overrideAesValue = useMemo(() => {
    const overrideAes = params.arguments?.["override.aes"];
    if (
      overrideAes &&
      typeof overrideAes === "object" &&
      "type" in overrideAes &&
      "arguments" in overrideAes
    ) {
      return overrideAes as {
        type: "list";
        arguments: Record<string, string | number>;
      };
    }
    return undefined;
  }, [params]);

  // 检查是否需要显示 override.aes（仅 guide_legend 和 guide_bins）
  const showOverrideAes = useMemo(() => {
    return params.type === "guide_legend" || params.type === "guide_bins";
  }, [params.type]);

  // 根据 guide 类型获取对应的参数配置
  const availableParams = useMemo(() => {
    return getAvailableGuideParams(params.type) || [];
  }, [params.type]);

  return (
    <Paper sx={{ p: 2 }} elevation={1}>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
        参数设置
      </Typography>
      <DynamicParams
        availableParams={availableParams}
        value={dynamicParamsValue}
        onChange={updateParams}
      />

      <Typography variant="subtitle2" sx={{ my: 2, fontWeight: 500 }}>
        主题参数
      </Typography>

      <DynamicParams
        availableParams={
          params.type.includes("axis") || params.type.includes("prism")
            ? guideAxisThemeParams
            : guideLegendThemeParams
        }
        value={themeParamsValue}
        onChange={updateThemeParams}
      />

      {showOverrideAes && (
        <>
          <Typography variant="subtitle2" sx={{ my: 2, fontWeight: 500 }}>
            覆盖美学映射
          </Typography>
          <OverrideAes value={overrideAesValue} onChange={updateOverrideAes} />
        </>
      )}
    </Paper>
  );
};
