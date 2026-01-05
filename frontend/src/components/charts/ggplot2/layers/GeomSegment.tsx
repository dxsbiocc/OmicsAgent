"use client";

import { SegmentLayer, ParameterConfig } from "../types";
import {
  linetypeOptions,
  lineendOptions,
  linejoinOptions,
} from "../common/constants";
import { GeomBase } from "./GeomBase";

// GeomSegment 的美学映射
export const availableSegmentAesthetics: string[] = [
  "x",
  "y",
  "xend",
  "yend",
  "colour",
  "alpha",
  "linetype",
  "linewidth",
  "group",
];

// GeomSegment 的参数配置
export const availableSegmentParams: ParameterConfig[] = [
  {
    name: "linewidth",
    type: "number",
    min: 0,
    step: 0.1,
    default: 0.5,
  },
  {
    name: "linetype",
    type: "select",
    options: linetypeOptions,
    default: "solid",
  },
  {
    name: "lineend",
    type: "select",
    options: lineendOptions,
    default: "butt",
  },
  {
    name: "linejoin",
    type: "select",
    options: linejoinOptions,
    default: "round",
  },
  {
    name: "colour",
    type: "color",
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
    name: "arrow",
    type: "arrow",
  },
  {
    name: "arrow.fill",
    type: "color",
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

interface GeomSegmentProps {
  params: SegmentLayer;
  onChange: (layer: SegmentLayer) => void;
  columns?: string[];
}

export const GeomSegment: React.FC<GeomSegmentProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  return (
    <GeomBase
      params={params}
      onChange={onChange}
      columns={columns}
      title="线段 (Segment)"
      availableAesthetics={availableSegmentAesthetics}
      availableParams={availableSegmentParams}
    />
  );
};

