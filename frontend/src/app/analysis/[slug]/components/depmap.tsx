"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Stack,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  FormControlLabel,
  Typography,
  Chip,
  Autocomplete,
  Paper,
} from "@mui/material";

type DepmapSubTool =
  | "correlation"
  | "dependency"
  | "synthetic_lethality"
  | "drug_association";

export interface DepmapParamsProps {
  subTool: DepmapSubTool;
  values?: Record<string, any>;
  onChange?: (params: Record<string, any>) => void;
}

const features = {
  expression: ["TP53", "BCL2L1", "BRCA1", "BRCA2", "BRCA3", "BRCA4", "BRCA5"],
  dependency: ["BCL2L1", "BRCA1", "BRCA2", "BRCA3", "BRCA4", "BRCA5"],
  drug: [
    "imatinib",
    "lapatinib",
    "trametinib",
    "vemurafenib",
    "dabrafenib",
    "dovitinib",
    "dacomitinib",
  ],
};

const DEFAULTS: Record<DepmapSubTool, Record<string, any>> = {
  correlation: {
    featureTypeX: "expression",
    featureTypeY: "dependency",
    geneX: "TP53",
    geneY: "BCL2L1",
    method: "pearson",
    cancerType: "all",
    minSamples: 50,
    topK: 5,
  },
  dependency: {
    featureType: "dependency",
    gene: "TP53",
    dataset: "CRISPR",
    cancerType: "all",
    topN: 25,
    includeControls: false,
  },
  synthetic_lethality: {
    anchorGene: "BRCA1",
    partnerSearchSpace: "genome_wide",
    method: "rank_product",
    cancerType: "all",
    minEffectSize: 0.3,
    fdr: 0.1,
  },
  drug_association: {
    gene: "EGFR",
    drugPanel: "PRISM",
    responseMetric: "AUC",
    cancerType: "all",
    minSamples: 30,
  },
};

function useParamsState(subTool: DepmapSubTool, initial?: Record<string, any>) {
  const base = useMemo(() => ({ ...DEFAULTS[subTool] }), [subTool]);
  const [params, setParams] = useState<Record<string, any>>({
    ...base,
    ...(initial || {}),
  });

  useEffect(() => {
    setParams({ ...DEFAULTS[subTool], ...(initial || {}) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTool]);

  const update = (patch: Partial<Record<string, any>>) => {
    setParams((prev) => ({ ...prev, ...patch }));
  };

  const reset = () => setParams({ ...DEFAULTS[subTool] });

  return { params, update, reset } as const;
}

export default function DepmapParamsForm({
  subTool,
  values,
  onChange,
}: DepmapParamsProps) {
  const { params, update, reset } = useParamsState(subTool, values);

  useEffect(() => {
    // Only pass parameters that belong to the current sub-tool
    const currentSubToolParams = DEFAULTS[subTool];
    const filteredParams: Record<string, any> = {};

    // Only include parameters that are defined in the current sub-tool's defaults
    Object.keys(currentSubToolParams).forEach((key) => {
      if (params[key] !== undefined) {
        filteredParams[key] = params[key];
      }
    });

    onChange?.(filteredParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, subTool]);

  const CommonHeader = (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
      <Typography variant="h6" fontWeight={600}>
        参数设置
      </Typography>
      <Chip label={subTool} size="small" color="primary" variant="outlined" />
    </Stack>
  );

  if (subTool === "correlation") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {CommonHeader}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>X 轴</InputLabel>
                <Select
                  value={params.featureTypeX ?? ""}
                  label="X 轴"
                  onChange={(e) => update({ featureTypeX: e.target.value })}
                >
                  <MenuItem value="">请选择</MenuItem>
                  <MenuItem value="expression">基因表达</MenuItem>
                  <MenuItem value="dependency">基因依赖性</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Y 轴</InputLabel>
                <Select
                  value={params.featureTypeY ?? ""}
                  label="Y 轴"
                  onChange={(e) => update({ featureTypeY: e.target.value })}
                >
                  <MenuItem value="">请选择</MenuItem>
                  <MenuItem value="dependency">基因依赖性</MenuItem>
                  <MenuItem value="expression">基因表达</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Autocomplete
                fullWidth
                disabled={!params.featureTypeX}
                value={params.geneX || null}
                onChange={(_, newValue) => update({ geneX: newValue || "" })}
                options={
                  params.featureTypeX
                    ? features[params.featureTypeX as keyof typeof features] ||
                      []
                    : []
                }
                renderInput={(p) => <TextField {...p} label="特征 X" />}
              />

              <Autocomplete
                fullWidth
                disabled={!params.featureTypeY}
                value={params.geneY || null}
                onChange={(_, newValue) => update({ geneY: newValue || "" })}
                options={
                  params.featureTypeY
                    ? features[params.featureTypeY as keyof typeof features] ||
                      []
                    : []
                }
                renderInput={(p) => <TextField {...p} label="特征 Y" />}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>相关性方法</InputLabel>
                <Select
                  value={params.method ?? "pearson"}
                  label="相关性方法"
                  onChange={(e) => update({ method: e.target.value })}
                >
                  <MenuItem value="pearson">Pearson</MenuItem>
                  <MenuItem value="spearman">Spearman</MenuItem>
                  <MenuItem value="kendall">Kendall</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Top K</InputLabel>
                <Select
                  value={params.topK ?? 5}
                  label="Top K"
                  onChange={(e) => update({ topK: Number(e.target.value) })}
                >
                  <MenuItem value="5">5</MenuItem>
                  <MenuItem value="10">10</MenuItem>
                  <MenuItem value="30">30</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </Paper>

        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            数据过滤条件
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>癌种</InputLabel>
              <Select
                value={params.cancerType ?? ""}
                label="癌种"
                onChange={(e) => update({ cancerType: e.target.value })}
              >
                <MenuItem value="">不限</MenuItem>
                <MenuItem value="all">全部</MenuItem>
                <MenuItem value="BRCA">乳腺癌</MenuItem>
                <MenuItem value="LUAD">肺腺癌</MenuItem>
                <MenuItem value="COAD">结直肠癌</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              label="最小样本数"
              value={params.minSamples}
              onChange={(e) => update({ minSamples: Number(e.target.value) })}
              inputProps={{ min: 10, max: 1000 }}
            />
          </Stack>
        </Paper>
      </Box>
    );
  }

  if (subTool === "dependency") {
    return (
      <Box>
        {CommonHeader}
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>特征类型</InputLabel>
            <Select
              value={params.featureType ?? ""}
              label="特征类型"
              onChange={(e) => update({ featureType: e.target.value })}
            >
              <MenuItem value="">请选择</MenuItem>
              <MenuItem value="dependency">基因依赖性</MenuItem>
              <MenuItem value="expression">基因表达</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="基因"
            value={params.gene}
            onChange={(e) =>
              update({ gene: e.target.value.trim().toUpperCase() })
            }
          />

          <FormControl fullWidth>
            <InputLabel>数据集</InputLabel>
            <Select
              value={params.dataset ?? ""}
              label="数据集"
              onChange={(e) => update({ dataset: e.target.value })}
            >
              <MenuItem value="">请选择</MenuItem>
              <MenuItem value="CRISPR">CRISPR</MenuItem>
              <MenuItem value="RNAi">RNAi</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>癌种</InputLabel>
            <Select
              value={params.cancerType ?? ""}
              label="癌种"
              onChange={(e) => update({ cancerType: e.target.value })}
            >
              <MenuItem value="">不限</MenuItem>
              <MenuItem value="all">全部</MenuItem>
              <MenuItem value="BRCA">乳腺癌</MenuItem>
              <MenuItem value="LUAD">肺腺癌</MenuItem>
              <MenuItem value="COAD">结直肠癌</MenuItem>
            </Select>
          </FormControl>

          <TextField
            type="number"
            label="Top N 细胞系"
            value={params.topN}
            onChange={(e) => update({ topN: Number(e.target.value) })}
            inputProps={{ min: 5, max: 500 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={!!params.includeControls}
                onChange={(e) => update({ includeControls: e.target.checked })}
              />
            }
            label="包含对照细胞系"
          />
        </Stack>
      </Box>
    );
  }

  if (subTool === "synthetic_lethality") {
    return (
      <Box>
        {CommonHeader}
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="锚定基因"
            value={params.anchorGene}
            onChange={(e) =>
              update({ anchorGene: e.target.value.trim().toUpperCase() })
            }
          />

          <FormControl fullWidth>
            <InputLabel>候选空间</InputLabel>
            <Select
              value={params.partnerSearchSpace ?? ""}
              label="候选空间"
              onChange={(e) => update({ partnerSearchSpace: e.target.value })}
            >
              <MenuItem value="">请选择</MenuItem>
              <MenuItem value="genome_wide">全基因组</MenuItem>
              <MenuItem value="cancer_genes">癌症基因</MenuItem>
              <MenuItem value="pathway">通路限定</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>方法</InputLabel>
            <Select
              value={params.method ?? ""}
              label="方法"
              onChange={(e) => update({ method: e.target.value })}
            >
              <MenuItem value="">请选择</MenuItem>
              <MenuItem value="rank_product">Rank Product</MenuItem>
              <MenuItem value="wilcoxon">Wilcoxon</MenuItem>
              <MenuItem value="bayes">Bayesian</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>癌种</InputLabel>
            <Select
              value={params.cancerType ?? ""}
              label="癌种"
              onChange={(e) => update({ cancerType: e.target.value })}
            >
              <MenuItem value="">不限</MenuItem>
              <MenuItem value="all">全部</MenuItem>
              <MenuItem value="BRCA">乳腺癌</MenuItem>
              <MenuItem value="LUAD">肺腺癌</MenuItem>
            </Select>
          </FormControl>

          <TextField
            type="number"
            label="最小效应量"
            value={params.minEffectSize}
            onChange={(e) => update({ minEffectSize: Number(e.target.value) })}
            inputProps={{ step: 0.05, min: 0, max: 5 }}
          />

          <TextField
            type="number"
            label="FDR 阈值"
            value={params.fdr}
            onChange={(e) => update({ fdr: Number(e.target.value) })}
            inputProps={{ step: 0.01, min: 0, max: 0.5 }}
          />
        </Stack>
      </Box>
    );
  }

  // drug_gene
  return (
    <Box>
      {CommonHeader}
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="基因"
          value={params.gene}
          onChange={(e) =>
            update({ gene: e.target.value.trim().toUpperCase() })
          }
        />

        <FormControl fullWidth>
          <InputLabel>药物面板</InputLabel>
          <Select
            value={params.drugPanel ?? ""}
            label="药物面板"
            onChange={(e) => update({ drugPanel: e.target.value })}
          >
            <MenuItem value="">请选择</MenuItem>
            <MenuItem value="PRISM">PRISM</MenuItem>
            <MenuItem value="GDSC">GDSC</MenuItem>
            <MenuItem value="CTRP">CTRP</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>响应指标</InputLabel>
          <Select
            value={params.responseMetric ?? ""}
            label="响应指标"
            onChange={(e) => update({ responseMetric: e.target.value })}
          >
            <MenuItem value="">请选择</MenuItem>
            <MenuItem value="AUC">AUC</MenuItem>
            <MenuItem value="IC50">IC50</MenuItem>
            <MenuItem value="EC50">EC50</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>癌种</InputLabel>
          <Select
            value={params.cancerType ?? ""}
            label="癌种"
            onChange={(e) => update({ cancerType: e.target.value })}
          >
            <MenuItem value="">不限</MenuItem>
            <MenuItem value="all">全部</MenuItem>
            <MenuItem value="BRCA">乳腺癌</MenuItem>
            <MenuItem value="LUAD">肺腺癌</MenuItem>
          </Select>
        </FormControl>

        <TextField
          type="number"
          label="最小样本数"
          value={params.minSamples}
          onChange={(e) => update({ minSamples: Number(e.target.value) })}
          inputProps={{ min: 10, max: 1000 }}
        />
      </Stack>
    </Box>
  );
}
