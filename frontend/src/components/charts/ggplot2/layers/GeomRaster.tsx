"use client";

import { ParameterConfig, BaseConfig, AestheticConfig } from "../types";
import { GeomBase } from "./GeomBase";

// GeomRaster Layer Type
export interface RasterLayer extends BaseConfig {
  type: "geom_raster";
  mapping?: AestheticConfig;
  arguments?: {
    hjust?: number;
    vjust?: number;
    interpolate?: boolean;
    "na.rm"?: boolean;
    "show.legend"?: boolean;
    "inherit.aes"?: boolean;
  } & Record<string, any>;
}

// AnnotationRaster Layer Type
export interface AnnotationRasterLayer extends BaseConfig {
  type: "annotation_raster";
  arguments?: {
    raster?: string[]; // 颜色数组，用于生成渐变
    resolution?: number; // 渐变分辨率
    direction?: "horizontal" | "vertical"; // 渐变方向
    interpolate?: boolean;
    xmin?: number;
    xmax?: number;
    ymin?: number;
    ymax?: number;
  } & Record<string, any>;
}

// GeomRaster 的美学映射
export const availableRasterAesthetics: string[] = ["x", "y", "fill", "alpha"];

// GeomRaster 的参数配置
export const availableRasterParams: ParameterConfig[] = [
  {
    name: "hjust",
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "vjust",
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "interpolate",
    type: "boolean",
    default: false,
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

// AnnotationRaster 的参数配置
export const availableAnnotationRasterParams: ParameterConfig[] = [
  {
    name: "raster",
    type: "colors",
    default: ["#DFE1B8", "#FFFFFF", "#F3D7CE"],
  },
  {
    name: "resolution",
    type: "number",
    min: 10,
    step: 10,
    default: 1000,
  },
  {
    name: "direction",
    type: "select",
    options: ["horizontal", "vertical"],
    default: "horizontal",
  },
  {
    name: "interpolate",
    type: "boolean",
    default: false,
  },
  {
    name: "xmin",
    type: "number",
  },
  {
    name: "xmax",
    type: "number",
  },
  {
    name: "ymin",
    type: "number",
  },
  {
    name: "ymax",
    type: "number",
  },
];

interface GeomRasterProps {
  params: RasterLayer;
  onChange: (params: RasterLayer) => void;
  columns?: string[];
}

export const GeomRaster: React.FC<GeomRasterProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="栅格图 (geom_raster)"
      availableAesthetics={availableRasterAesthetics}
      availableParams={availableRasterParams}
    />
  );
};

interface AnnotationRasterProps {
  params: AnnotationRasterLayer;
  onChange: (params: AnnotationRasterLayer) => void;
  columns?: string[];
}

export const AnnotationRaster: React.FC<AnnotationRasterProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="栅格注释 (annotation_raster)"
      availableAesthetics={[]}
      availableParams={availableAnnotationRasterParams}
    />
  );
};
