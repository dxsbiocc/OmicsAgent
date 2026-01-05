"use client";

import { useCallback, useMemo, useEffect } from "react";
import { Box, Paper, Typography, alpha, useTheme } from "@mui/material";
import { BaseDynamicParams } from "./BaseDynamicParams";
import {
  ParameterConfig,
  ParameterItem,
  ElementBlankConfig,
  ElementTextConfig,
  ElementMarkdownConfig,
  ElementRectConfig,
  ElementLineConfig,
  ElementPointConfig,
  ElementPolygonConfig,
  ElementGeomConfig,
  MarginConfig,
} from "../types";
import { getElementParams } from "./Parameters";

// Element 配置联合类型
export type ElementConfig =
  | ElementBlankConfig
  | ElementTextConfig
  | ElementMarkdownConfig
  | ElementRectConfig
  | ElementLineConfig
  | ElementPointConfig
  | ElementPolygonConfig
  | ElementGeomConfig
  | MarginConfig;

interface ElementComponentProps<T extends ElementConfig> {
  element: T;
  onChange: (element: T) => void;
}

// ElementBlank 组件
export const ElementBlank: React.FC<
  ElementComponentProps<ElementBlankConfig>
> = ({ element, onChange }) => {
  // element_blank 没有参数，直接返回空配置
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        element_blank() - No parameters needed
      </Typography>
    </Box>
  );
};

// 通用的 Element 组件
const createElementComponent = <T extends ElementConfig>(
  defaultType: T["type"],
  displayName: string
) => {
  return ({ element, onChange }: ElementComponentProps<T>) => {
    const theme = useTheme();
    const currentType = (element.type || defaultType) as string;
    const isBlank = currentType === "element_blank";

    const availableParams = useMemo(() => {
      if (isBlank) return [];
      return getElementParams(currentType);
    }, [currentType, isBlank]);

    const updateParams = useCallback(
      (newParams: Record<string, any>) => {
        // 完全替换 arguments，而不是合并，这样可以确保删除的参数被移除
        onChange({
          ...element,
          arguments: newParams,
        } as T);
      },
      [element, onChange]
    );

    const dynamicParamsValue = useMemo(() => {
      if (isBlank) return {};
      const value: Record<string, any> = {};
      if (element.arguments) {
        const args = element.arguments as Record<string, any>;
        Object.keys(args).forEach((key) => {
          if (args[key] !== undefined) {
            value[key] = args[key];
          }
        });
      }
      return value;
    }, [element, isBlank]);

    return (
      <Box>
        {!isBlank && (
          <Paper
            sx={{
              p: 2,
              elevation: 1,
              backgroundColor: alpha(
                theme.palette.info.main,
                theme.palette.mode === "dark" ? 0.1 : 0.05
              ),
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
              {displayName} 参数
            </Typography>
            <BaseDynamicParams
              availableParams={availableParams}
              value={dynamicParamsValue}
              onChange={updateParams}
              nested={true}
            />
          </Paper>
        )}
        {isBlank && (
          <ElementBlank
            element={element as ElementBlankConfig}
            onChange={(updatedElement) => onChange(updatedElement as T)}
          />
        )}
      </Box>
    );
  };
};

// ElementText 组件
export const ElementText: React.FC<ElementComponentProps<ElementTextConfig>> =
  createElementComponent<ElementTextConfig>("element_text", "element_text");

// ElementMarkdown 组件
export const ElementMarkdown: React.FC<
  ElementComponentProps<ElementMarkdownConfig>
> = createElementComponent<ElementMarkdownConfig>(
  "element_markdown",
  "element_markdown"
);

// ElementRect 组件
export const ElementRect: React.FC<ElementComponentProps<ElementRectConfig>> =
  createElementComponent<ElementRectConfig>("element_rect", "element_rect");

// ElementLine 组件
export const ElementLine: React.FC<ElementComponentProps<ElementLineConfig>> =
  createElementComponent<ElementLineConfig>("element_line", "element_line");

// ElementPoint 组件
export const ElementPoint: React.FC<ElementComponentProps<ElementPointConfig>> =
  createElementComponent<ElementPointConfig>("element_point", "element_point");

// ElementPolygon 组件
export const ElementPolygon: React.FC<
  ElementComponentProps<ElementPolygonConfig>
> = createElementComponent<ElementPolygonConfig>(
  "element_polygon",
  "element_polygon"
);

// ElementGeom 组件（通常用于几何对象，参数较少）
export const ElementGeom: React.FC<ElementComponentProps<ElementGeomConfig>> =
  createElementComponent<ElementGeomConfig>("element_geom", "element_geom");

// Margin 组件
export const Margin: React.FC<ElementComponentProps<MarginConfig>> = ({
  element,
  onChange,
}) => {
  const availableParams = useMemo(() => getElementParams("margin"), []);

  const updateParams = useCallback(
    (newParams: Record<string, any>) => {
      // 完全替换 arguments，而不是合并，这样可以确保删除的参数被移除
      onChange({
        ...element,
        arguments: newParams as MarginConfig["arguments"],
      });
    },
    [element, onChange]
  );

  const dynamicParamsValue = useMemo(() => {
    const value: Record<string, any> = {};
    if (element.arguments) {
      const args = element.arguments as Record<string, any>;
      Object.keys(args).forEach((key) => {
        if (args[key] !== undefined) {
          value[key] = args[key];
        }
      });
    }
    return value;
  }, [element]);

  const theme = useTheme();

  return (
    <Box>
      <Paper
        sx={{
          p: 2,
          elevation: 1,
          backgroundColor: alpha(
            theme.palette.info.main,
            theme.palette.mode === "dark" ? 0.1 : 0.05
          ),
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
          margin 参数
        </Typography>
        <BaseDynamicParams
          availableParams={availableParams}
          value={dynamicParamsValue}
          onChange={updateParams}
          nested={true}
        />
      </Paper>
    </Box>
  );
};

// ElementRenderer 组件 - 用于在 DynamicParams 中渲染 element_* 类型
interface ElementRendererProps {
  param: ParameterItem;
  index: number;
  config: ParameterConfig;
  onUpdate: (value: any) => void;
}

/**
 * Element 类型参数渲染器
 * 处理所有 element_* 类型（element_text, element_rect, element_line, etc.）
 * 这些组件内部使用 BaseDynamicParams 来渲染原子类型参数
 */
export const ElementRenderer: React.FC<ElementRendererProps> = ({
  param,
  config,
  onUpdate,
}) => {
  // 使用 useEffect 确保当 param.value 为 undefined 时，初始化默认值
  useEffect(() => {
    if (param.value === undefined || param.value === null) {
      let defaultValue: any;
      switch (config.type) {
        case "element_blank":
          defaultValue = { type: "element_blank", arguments: {} };
          break;
        case "element_text":
          defaultValue = { type: "element_text", arguments: {} };
          break;
        case "element_markdown":
          defaultValue = { type: "element_markdown", arguments: {} };
          break;
        case "element_rect":
          defaultValue = { type: "element_rect", arguments: {} };
          break;
        case "element_line":
          defaultValue = { type: "element_line", arguments: {} };
          break;
        case "element_point":
          defaultValue = { type: "element_point", arguments: {} };
          break;
        case "element_polygon":
          defaultValue = { type: "element_polygon", arguments: {} };
          break;
        case "element_geom":
          defaultValue = { type: "element_geom", arguments: {} };
          break;
        default:
          return;
      }
      onUpdate(defaultValue);
    }
  }, [param.value, config.type, onUpdate]);

  switch (config.type) {
    case "element_blank": {
      const elementValue = param.value as ElementBlankConfig | undefined;
      const element: ElementBlankConfig =
        elementValue ||
        ({
          type: "element_blank",
          arguments: {},
        } as ElementBlankConfig);

      return (
        <ElementBlank
          element={element}
          onChange={(updatedElement) => onUpdate(updatedElement)}
        />
      );
    }

    case "element_text": {
      const elementValue = param.value as ElementTextConfig | undefined;
      if (!elementValue) {
        // 如果值还未初始化，返回 loading 或空状态
        return <Box>Loading...</Box>;
      }

      const currentType = (elementValue?.type || config.type) as string;
      const isBlank = currentType === "element_blank";

      if (isBlank) {
        const blankElement: ElementBlankConfig = {
          type: "element_blank",
          arguments: {},
        };
        return (
          <ElementBlank
            element={blankElement}
            onChange={(updatedElement) => onUpdate(updatedElement)}
          />
        );
      }

      return (
        <ElementText
          element={elementValue}
          onChange={(updatedElement) => onUpdate(updatedElement)}
        />
      );
    }

    case "element_markdown": {
      const elementValue = param.value as ElementMarkdownConfig | undefined;
      if (!elementValue) {
        return <Box>Loading...</Box>;
      }

      const currentType = (elementValue?.type || config.type) as string;
      const isBlank = currentType === "element_blank";

      if (isBlank) {
        const blankElement: ElementBlankConfig = {
          type: "element_blank",
          arguments: {},
        };
        return (
          <ElementBlank
            element={blankElement}
            onChange={(updatedElement) => onUpdate(updatedElement)}
          />
        );
      }

      return (
        <ElementMarkdown
          element={elementValue}
          onChange={(updatedElement) => onUpdate(updatedElement)}
        />
      );
    }

    case "element_rect": {
      const elementValue = param.value as ElementRectConfig | undefined;
      if (!elementValue) {
        return <Box>Loading...</Box>;
      }

      const currentType = (elementValue?.type || config.type) as string;
      const isBlank = currentType === "element_blank";

      if (isBlank) {
        const blankElement: ElementBlankConfig = {
          type: "element_blank",
          arguments: {},
        };
        return (
          <ElementBlank
            element={blankElement}
            onChange={(updatedElement) => onUpdate(updatedElement)}
          />
        );
      }

      return (
        <ElementRect
          element={elementValue}
          onChange={(updatedElement) => onUpdate(updatedElement)}
        />
      );
    }

    case "element_line": {
      const elementValue = param.value as ElementLineConfig | undefined;
      if (!elementValue) {
        return <Box>Loading...</Box>;
      }

      const currentType = (elementValue?.type || config.type) as string;
      const isBlank = currentType === "element_blank";

      if (isBlank) {
        const blankElement: ElementBlankConfig = {
          type: "element_blank",
          arguments: {},
        };
        return (
          <ElementBlank
            element={blankElement}
            onChange={(updatedElement) => onUpdate(updatedElement)}
          />
        );
      }

      return (
        <ElementLine
          element={elementValue}
          onChange={(updatedElement) => onUpdate(updatedElement)}
        />
      );
    }

    case "element_point": {
      const elementValue = param.value as ElementPointConfig | undefined;
      if (!elementValue) {
        return <Box>Loading...</Box>;
      }

      const currentType = (elementValue?.type || config.type) as string;
      const isBlank = currentType === "element_blank";

      if (isBlank) {
        const blankElement: ElementBlankConfig = {
          type: "element_blank",
          arguments: {},
        };
        return (
          <ElementBlank
            element={blankElement}
            onChange={(updatedElement) => onUpdate(updatedElement)}
          />
        );
      }

      return (
        <ElementPoint
          element={elementValue}
          onChange={(updatedElement) => onUpdate(updatedElement)}
        />
      );
    }

    case "element_polygon": {
      const elementValue = param.value as ElementPolygonConfig | undefined;
      if (!elementValue) {
        return <Box>Loading...</Box>;
      }

      const currentType = (elementValue?.type || config.type) as string;
      const isBlank = currentType === "element_blank";

      if (isBlank) {
        const blankElement: ElementBlankConfig = {
          type: "element_blank",
          arguments: {},
        };
        return (
          <ElementBlank
            element={blankElement}
            onChange={(updatedElement) => onUpdate(updatedElement)}
          />
        );
      }

      return (
        <ElementPolygon
          element={elementValue}
          onChange={(updatedElement) => onUpdate(updatedElement)}
        />
      );
    }

    case "element_geom": {
      const elementValue = param.value as ElementGeomConfig | undefined;
      if (!elementValue) {
        return <Box>Loading...</Box>;
      }

      const currentType = (elementValue?.type || config.type) as string;
      const isBlank = currentType === "element_blank";

      if (isBlank) {
        const blankElement: ElementBlankConfig = {
          type: "element_blank",
          arguments: {},
        };
        return (
          <ElementBlank
            element={blankElement}
            onChange={(updatedElement) => onUpdate(updatedElement)}
          />
        );
      }

      return (
        <ElementGeom
          element={elementValue}
          onChange={(updatedElement) => onUpdate(updatedElement)}
        />
      );
    }

    default:
      return null;
  }
};
