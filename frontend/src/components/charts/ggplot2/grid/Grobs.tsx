"use client";

import { useCallback, useMemo } from "react";
import { Paper, Typography, Box } from "@mui/material";
import { ParameterConfig } from "../types";
import { BaseDynamicParams } from "../common/BaseDynamicParams";

// ========== 公共常量 ==========
// just 选项
const justOptions = ["left", "right", "centre", "center", "bottom", "top"];

// default.units 选项
const defaultUnitsOptions = [
  "npc",
  "cm",
  "inches",
  "mm",
  "points",
  "picas",
  "bigpts",
  "native",
  "snpc",
  "lines",
  "char",
  "strwidth",
  "strheight",
  "grobwidth",
  "grobheight",
];

// 公共参数配置
const hjustParam: ParameterConfig = {
  name: "hjust",
  type: "number",
  min: 0,
  max: 1,
  step: 0.1,
};

const vjustParam: ParameterConfig = {
  name: "vjust",
  type: "number",
  min: 0,
  max: 1,
  step: 0.1,
};

const defaultUnitsParam: ParameterConfig = {
  name: "default.units",
  type: "select",
  options: defaultUnitsOptions,
};

const nameParam: ParameterConfig = {
  name: "name",
  type: "string",
};

const gpParam: ParameterConfig = {
  name: "gp",
  type: "gpar",
};

const vpParam: ParameterConfig = {
  name: "vp",
  type: "grob",
};

// ========== segmentsGrob ==========
export const segmentsGrobParams: ParameterConfig[] = [
  {
    name: "x0",
    type: "unit",
  },
  {
    name: "y0",
    type: "unit",
  },
  {
    name: "x1",
    type: "unit",
  },
  {
    name: "y1",
    type: "unit",
  },
  gpParam,
  vpParam,
];

// ========== rectGrob ==========
export const rectGrobParams: ParameterConfig[] = [
  {
    name: "x",
    type: "unit",
  },
  {
    name: "y",
    type: "unit",
  },
  {
    name: "width",
    type: "unit",
  },
  {
    name: "height",
    type: "unit",
  },
  {
    name: "just",
    type: "strings",
    options: justOptions,
  },
  hjustParam,
  vjustParam,
  defaultUnitsParam,
  nameParam,
  gpParam,
  vpParam,
];

// ========== roundrectGrob ==========
export const roundrectGrobParams: ParameterConfig[] = [
  {
    name: "x",
    type: "unit",
  },
  {
    name: "y",
    type: "unit",
  },
  {
    name: "width",
    type: "unit",
  },
  {
    name: "height",
    type: "unit",
  },
  {
    name: "r",
    type: "unit",
  },
  {
    name: "just",
    type: "strings",
    options: justOptions,
  },
  hjustParam,
  vjustParam,
  defaultUnitsParam,
  nameParam,
  gpParam,
  vpParam,
];

// ========== textGrob ==========
export const textGrobParams: ParameterConfig[] = [
  {
    name: "label",
    type: "strings",
  },
  {
    name: "x",
    type: "unit",
  },
  {
    name: "y",
    type: "unit",
  },
  {
    name: "just",
    type: "strings",
    options: justOptions,
  },
  hjustParam,
  vjustParam,
  {
    name: "rot",
    type: "number",
    min: 0,
    max: 360,
    step: 1,
  },
  {
    name: "check.overlap",
    type: "boolean",
    default: false,
  },
  defaultUnitsParam,
  nameParam,
  gpParam,
  vpParam,
];

// ========== xaxisGrob ==========
export const xaxisGrobParams: ParameterConfig[] = [
  {
    name: "at",
    type: "numbers",
  },
  {
    name: "label",
    type: "boolean",
    default: true,
  },
  {
    name: "main",
    type: "boolean",
    default: true,
  },
  gpParam,
  vpParam,
];

// ========== yaxisGrob ==========
export const yaxisGrobParams: ParameterConfig[] = [
  {
    name: "at",
    type: "numbers",
  },
  {
    name: "label",
    type: "boolean",
    default: true,
  },
  {
    name: "main",
    type: "boolean",
    default: true,
  },
  gpParam,
  vpParam,
];

// ========== pointsGrob ==========
export const pointsGrobParams: ParameterConfig[] = [
  {
    name: "x",
    type: "unit",
  },
  {
    name: "y",
    type: "unit",
  },
  {
    name: "pch",
    type: "numbers",
  },
  {
    name: "size",
    type: "unit",
  },
  defaultUnitsParam,
  nameParam,
  gpParam,
  vpParam,
];

// ========== linesGrob ==========
export const linesGrobParams: ParameterConfig[] = [
  {
    name: "x",
    type: "unit",
  },
  {
    name: "y",
    type: "unit",
  },
  defaultUnitsParam,
  {
    name: "arrow",
    type: "arrow",
  },
  nameParam,
  gpParam,
  vpParam,
];

// 通用 Grob 组件接口
interface GrobComponentProps {
  params: any;
  onChange: (params: any) => void;
  title: string;
  availableParams: ParameterConfig[];
}

// 通用 Grob 组件
const GrobComponent: React.FC<GrobComponentProps> = ({
  params,
  onChange,
  title,
  availableParams,
}) => {
  const updateParams = useCallback(
    (newParams: Record<string, any>) => {
      onChange({
        ...params,
        arguments: {
          ...params.arguments,
          ...newParams,
        },
      });
    },
    [params, onChange]
  );

  const dynamicParamsValue = useMemo(() => {
    return params?.arguments || {};
  }, [params?.arguments]);

  // 处理 vp (viewport) 参数 - 暂时也使用 grob 类型
  const vpValue = dynamicParamsValue.vp;
  const handleVpChange = useCallback(
    (vp: any) => {
      updateParams({ vp: vp || undefined });
    },
    [updateParams]
  );

  return (
    <Paper sx={{ p: 2 }} elevation={1}>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
        {title}
      </Typography>
      <BaseDynamicParams
        availableParams={availableParams.filter((p) => p.name !== "vp")}
        value={dynamicParamsValue}
        onChange={updateParams}
      />

      {/* vp (viewport) 参数 */}
      {availableParams.some((p) => p.name === "vp") && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            vp (视口)
          </Typography>
          {/* TODO: 实现 viewport 组件 */}
        </Box>
      )}
    </Paper>
  );
};

// 导出各个 Grob 组件
export const SegmentsGrob: React.FC<{
  params: any;
  onChange: (params: any) => void;
}> = ({ params, onChange }) => (
  <GrobComponent
    params={params}
    onChange={onChange}
    title="线段 (segmentsGrob)"
    availableParams={segmentsGrobParams}
  />
);

export const RectGrob: React.FC<{
  params: any;
  onChange: (params: any) => void;
}> = ({ params, onChange }) => (
  <GrobComponent
    params={params}
    onChange={onChange}
    title="矩形 (rectGrob)"
    availableParams={rectGrobParams}
  />
);

export const RoundrectGrob: React.FC<{
  params: any;
  onChange: (params: any) => void;
}> = ({ params, onChange }) => (
  <GrobComponent
    params={params}
    onChange={onChange}
    title="圆角矩形 (roundrectGrob)"
    availableParams={roundrectGrobParams}
  />
);

export const TextGrob: React.FC<{
  params: any;
  onChange: (params: any) => void;
}> = ({ params, onChange }) => (
  <GrobComponent
    params={params}
    onChange={onChange}
    title="文本 (textGrob)"
    availableParams={textGrobParams}
  />
);

export const XaxisGrob: React.FC<{
  params: any;
  onChange: (params: any) => void;
}> = ({ params, onChange }) => (
  <GrobComponent
    params={params}
    onChange={onChange}
    title="X轴 (xaxisGrob)"
    availableParams={xaxisGrobParams}
  />
);

export const YaxisGrob: React.FC<{
  params: any;
  onChange: (params: any) => void;
}> = ({ params, onChange }) => (
  <GrobComponent
    params={params}
    onChange={onChange}
    title="Y轴 (yaxisGrob)"
    availableParams={yaxisGrobParams}
  />
);

export const PointsGrob: React.FC<{
  params: any;
  onChange: (params: any) => void;
}> = ({ params, onChange }) => (
  <GrobComponent
    params={params}
    onChange={onChange}
    title="点 (pointsGrob)"
    availableParams={pointsGrobParams}
  />
);

export const LinesGrob: React.FC<{
  params: any;
  onChange: (params: any) => void;
}> = ({ params, onChange }) => (
  <GrobComponent
    params={params}
    onChange={onChange}
    title="线 (linesGrob)"
    availableParams={linesGrobParams}
  />
);
