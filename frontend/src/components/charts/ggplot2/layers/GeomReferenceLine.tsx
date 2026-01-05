"use client";

import { AblineLayer, HlineLayer, VlineLayer, ParameterConfig } from "../types";
import { linetypeOptions } from "../common/constants";
import { GeomBase } from "./GeomBase";

// GeomAbline 的参数配置
export const availableAblineAesthetics: string[] = [
  "colour",
  "alpha",
  "linetype",
  "linewidth",
];

export const availableAblineParams: ParameterConfig[] = [
  {
    name: "intercept",
    type: "numbers",
    default: 0,
  },
  {
    name: "slope",
    type: "numbers",
    default: 1,
  },
  {
    name: "linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "colour",
    type: "colors",
  },
  {
    name: "alpha",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 1,
  },
  {
    name: "na.rm",
    type: "boolean",
    default: false,
  },
  {
    name: "show.legend",
    type: "boolean",
    default: true,
  },
  {
    name: "inherit.aes",
    type: "boolean",
    default: true,
  },
];

interface GeomAblineProps {
  params: AblineLayer;
  onChange: (layer: AblineLayer) => void;
  /** 可选择的列名列表 */
  columns?: string[];
}

export const GeomAbline: React.FC<GeomAblineProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="斜线参考线 (Abline)"
      availableAesthetics={availableAblineAesthetics}
      availableParams={availableAblineParams}
    />
  );
};

// GeomHline 的参数配置
export const availableHlineAesthetics: string[] = [
  "colour",
  "alpha",
  "linetype",
  "linewidth",
];

export const availableHlineParams: ParameterConfig[] = [
  {
    name: "yintercept",
    type: "numbers",
    default: 0,
  },
  {
    name: "linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "colour",
    type: "colors",
  },
  {
    name: "alpha",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 1,
  },
  {
    name: "na.rm",
    type: "boolean",
    default: false,
  },
  {
    name: "show.legend",
    type: "boolean",
    default: true,
  },
  {
    name: "inherit.aes",
    type: "boolean",
    default: true,
  },
];

interface GeomHlineProps {
  params: HlineLayer;
  onChange: (layer: HlineLayer) => void;
  /** 可选择的列名列表 */
  columns?: string[];
}

export const GeomHline: React.FC<GeomHlineProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="水平参考线 (Hline)"
      availableAesthetics={availableHlineAesthetics}
      availableParams={availableHlineParams}
    />
  );
};

// GeomVline 的参数配置
export const availableVlineAesthetics: string[] = [
  "colour",
  "alpha",
  "linetype",
  "linewidth",
];

export const availableVlineParams: ParameterConfig[] = [
  {
    name: "xintercept",
    type: "numbers",
    default: 0,
  },
  {
    name: "linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "colour",
    type: "colors",
  },
  {
    name: "alpha",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 1,
  },
  {
    name: "na.rm",
    type: "boolean",
    default: false,
  },
  {
    name: "show.legend",
    type: "boolean",
    default: true,
  },
  {
    name: "inherit.aes",
    type: "boolean",
    default: true,
  },
];

interface GeomVlineProps {
  params: VlineLayer;
  onChange: (layer: VlineLayer) => void;
  /** 可选择的列名列表 */
  columns?: string[];
}

export const GeomVline: React.FC<GeomVlineProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="垂直参考线 (Vline)"
      availableAesthetics={availableVlineAesthetics}
      availableParams={availableVlineParams}
    />
  );
};
