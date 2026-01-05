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
  Paper,
} from "@mui/material";
import { NumberField } from "@/components/common";
import {
  useGeneList,
  VirtualizedGeneAutocomplete,
  CancerTypeSelect,
  CancerTypeAutocomplete,
} from "./tcga/index";

type TcgaSubTool =
  | "differential_expression"
  | "survival_analysis"
  | "gene_mutation"
  | "copy_number_variation"
  | "immune_infiltration"
  | "stem_index"
  | "pan_cancer_expression"
  | "expression_correlation"
  | "pathway_analysis";

export interface TcgaParamsProps {
  subTool: TcgaSubTool;
  values?: Record<string, any>;
  onChange?: (params: Record<string, any>) => void;
}

const DEFAULTS: Record<TcgaSubTool, Record<string, any>> = {
  differential_expression: {
    gene: "TP53",
    cancer_type: "BRCA",
    comparison: "tumor_vs_normal",
  },
  survival_analysis: {
    gene: "TP53",
    cancer_type: "BRCA",
    survival_type: "OS",
    expression_level: "median",
    high_label: "High",
    low_label: "Low",
  },
  gene_mutation: {
    gene: "TP53",
    cancer_type: "BRCA",
    mutation_type: "all",
    min_mutation_rate: 0.01,
  },
  copy_number_variation: {
    gene: "TP53",
    cancer_type: "BRCA",
    cnv_type: "both",
    min_samples: 10,
  },
  immune_infiltration: {
    gene: "TP53",
    cancer_type: "BRCA",
    immune_cell_type: "all",
    method: "CIBERSORT",
  },
  stem_index: {
    gene: "TP53",
    cancer_type: "BRCA",
    stem_index_type: "mRNAsi",
  },
  pan_cancer_expression: {
    gene: "TP53",
    cancer_types: [],
    show_normal: true,
  },
  expression_correlation: {
    gene_x: "TP53",
    gene_y: "BRCA1",
    cancer_type: "BRCA",
    method: "pearson",
    min_samples: 30,
  },
  pathway_analysis: {
    gene_set: "",
    cancer_type: "BRCA",
    pathway_database: "KEGG",
    min_genes: 5,
    max_genes: 500,
  },
};

function useParamsState(subTool: TcgaSubTool, initial?: Record<string, any>) {
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

export default function TcgaParamsForm({
  subTool,
  values,
  onChange,
}: TcgaParamsProps) {
  const { params, update } = useParamsState(subTool, values);
  const { geneList, loading: genesLoading } = useGeneList();

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
        查询参数
      </Typography>
      <Chip label={subTool} size="small" color="primary" variant="outlined" />
    </Stack>
  );

  // Differential Expression Analysis
  if (subTool === "differential_expression") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {CommonHeader}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Stack spacing={2}>
            <VirtualizedGeneAutocomplete
              value={params.gene || null}
              onChange={(newValue) => update({ gene: newValue || "" })}
              label="基因"
              geneList={geneList}
              loading={genesLoading}
              maxDisplayOptions={100}
              minSearchLength={geneList.length > 1000 ? 2 : 0}
            />

            <CancerTypeSelect
              value={params.cancer_type ?? ""}
              onChange={(value) => update({ cancer_type: value })}
            />

            <FormControl fullWidth>
              <InputLabel>分组</InputLabel>
              <Select
                value={params.comparison ?? ""}
                label="分组"
                onChange={(e) => update({ comparison: e.target.value })}
              >
                <MenuItem value="tumor_vs_normal">Tumor vs Normal</MenuItem>
                <MenuItem value="paired_tumor_vs_normal">
                  Paired Tumor vs Normal
                </MenuItem>
                <MenuItem value="pathologic_stage">Pathologic Stage</MenuItem>
                <MenuItem value="pathologic_t">Pathologic T</MenuItem>
                <MenuItem value="pathologic_n">Pathologic N</MenuItem>
                <MenuItem value="pathologic_m">Pathologic M</MenuItem>
                <MenuItem value="pathologic_grade">Pathologic Grade</MenuItem>
                <MenuItem value="gender">Gender</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Survival Analysis
  if (subTool === "survival_analysis") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {CommonHeader}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Stack spacing={2}>
            <VirtualizedGeneAutocomplete
              value={params.gene || null}
              onChange={(newValue) => update({ gene: newValue || "" })}
              label="基因"
              geneList={geneList}
              loading={genesLoading}
              maxDisplayOptions={100}
              minSearchLength={geneList.length > 1000 ? 2 : 0}
            />

            <CancerTypeSelect
              value={params.cancer_type ?? ""}
              onChange={(value) => update({ cancer_type: value })}
            />

            <FormControl fullWidth>
              <InputLabel>生存类型</InputLabel>
              <Select
                value={params.survival_type ?? ""}
                label="生存类型"
                onChange={(e) => update({ survival_type: e.target.value })}
              >
                <MenuItem value="OS">Overall Survival (OS)</MenuItem>
                <MenuItem value="DFS">Disease-Free Survival (DFS)</MenuItem>
                <MenuItem value="PFS">Progression-Free Survival (PFS)</MenuItem>
                <MenuItem value="DSS">Disease-Specific Survival (DSS)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>表达水平分组</InputLabel>
              <Select
                value={params.expression_level ?? ""}
                label="表达水平分组"
                onChange={(e) => update({ expression_level: e.target.value })}
              >
                <MenuItem value="mean">Mean</MenuItem>
                <MenuItem value="quartile_q1">Quartile Q1 (25%)</MenuItem>
                <MenuItem value="median">Median (50%)</MenuItem>
                <MenuItem value="quartile_q3">Quartile Q3 (75%)</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>

            {/* 当选择自定义阈值时，显示数值输入框 */}
            {params.expression_level === "custom" && (
              <NumberField
                fullWidth
                label="自定义阈值"
                value={params.expression_level_value ?? 0}
                onChange={(value) =>
                  update({ expression_level_value: value ?? 0 })
                }
                min={0}
                step={0.1}
              />
            )}

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="高表达组标签"
                value={params.high_label}
                onChange={(e) => update({ high_label: e.target.value })}
              />
              <TextField
                fullWidth
                label="低表达组标签"
                value={params.low_label}
                onChange={(e) => update({ low_label: e.target.value })}
              />
            </Stack>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Gene Mutation Analysis
  if (subTool === "gene_mutation") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {CommonHeader}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Stack spacing={2}>
            <VirtualizedGeneAutocomplete
              value={params.gene || null}
              onChange={(newValue) => update({ gene: newValue || "" })}
              label="基因"
              geneList={geneList}
              loading={genesLoading}
              maxDisplayOptions={100}
              minSearchLength={geneList.length > 1000 ? 2 : 0}
            />

            <CancerTypeSelect
              value={params.cancer_type ?? ""}
              onChange={(value) => update({ cancer_type: value })}
            />

            <FormControl fullWidth>
              <InputLabel>突变类型</InputLabel>
              <Select
                value={params.mutation_type ?? ""}
                label="突变类型"
                onChange={(e) => update({ mutation_type: e.target.value })}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="missense">Missense</MenuItem>
                <MenuItem value="nonsense">Nonsense</MenuItem>
                <MenuItem value="frameshift">Frameshift</MenuItem>
                <MenuItem value="splice">Splice Site</MenuItem>
                <MenuItem value="truncating">Truncating</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              label="最小突变率"
              value={params.min_mutation_rate}
              onChange={(e) =>
                update({ min_mutation_rate: Number(e.target.value) })
              }
              inputProps={{ step: 0.01, min: 0, max: 1 }}
            />
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Copy Number Variation Analysis
  if (subTool === "copy_number_variation") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {CommonHeader}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Stack spacing={2}>
            <VirtualizedGeneAutocomplete
              value={params.gene || null}
              onChange={(newValue) => update({ gene: newValue || "" })}
              label="基因"
              geneList={geneList}
              loading={genesLoading}
              maxDisplayOptions={100}
              minSearchLength={geneList.length > 1000 ? 2 : 0}
            />

            <CancerTypeSelect
              value={params.cancer_type ?? ""}
              onChange={(value) => update({ cancer_type: value })}
            />

            <FormControl fullWidth>
              <InputLabel>CNV 类型</InputLabel>
              <Select
                value={params.cnv_type ?? ""}
                label="CNV 类型"
                onChange={(e) => update({ cnv_type: e.target.value })}
              >
                <MenuItem value="both">Both</MenuItem>
                <MenuItem value="amplification">Amplification</MenuItem>
                <MenuItem value="deletion">Deletion</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              label="最小样本数"
              value={params.min_samples}
              onChange={(e) => update({ min_samples: Number(e.target.value) })}
              inputProps={{ min: 1 }}
            />
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Immune Infiltration Analysis
  if (subTool === "immune_infiltration") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {CommonHeader}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Stack spacing={2}>
            <VirtualizedGeneAutocomplete
              value={params.gene || null}
              onChange={(newValue) => update({ gene: newValue || "" })}
              label="基因"
              geneList={geneList}
              loading={genesLoading}
              maxDisplayOptions={100}
              minSearchLength={geneList.length > 1000 ? 2 : 0}
            />

            <CancerTypeSelect
              value={params.cancer_type ?? ""}
              onChange={(value) => update({ cancer_type: value })}
            />

            <FormControl fullWidth>
              <InputLabel>免疫细胞类型</InputLabel>
              <Select
                value={params.immune_cell_type ?? ""}
                label="免疫细胞类型"
                onChange={(e) => update({ immune_cell_type: e.target.value })}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="CD8_T_cells">CD8+ T Cells</MenuItem>
                <MenuItem value="CD4_T_cells">CD4+ T Cells</MenuItem>
                <MenuItem value="B_cells">B Cells</MenuItem>
                <MenuItem value="NK_cells">NK Cells</MenuItem>
                <MenuItem value="Macrophages">Macrophages</MenuItem>
                <MenuItem value="Dendritic_cells">Dendritic Cells</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>计算方法</InputLabel>
              <Select
                value={params.method ?? ""}
                label="计算方法"
                onChange={(e) => update({ method: e.target.value })}
              >
                <MenuItem value="CIBERSORT">CIBERSORT</MenuItem>
                <MenuItem value="TIMER">TIMER</MenuItem>
                <MenuItem value="EPIC">EPIC</MenuItem>
                <MenuItem value="xCell">xCell</MenuItem>
                <MenuItem value="MCPcounter">MCPcounter</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Stem Index Analysis
  if (subTool === "stem_index") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {CommonHeader}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Stack spacing={2}>
            <VirtualizedGeneAutocomplete
              value={params.gene || null}
              onChange={(newValue) => update({ gene: newValue || "" })}
              label="基因"
              geneList={geneList}
              loading={genesLoading}
              maxDisplayOptions={100}
              minSearchLength={geneList.length > 1000 ? 2 : 0}
            />

            <CancerTypeSelect
              value={params.cancer_type ?? ""}
              onChange={(value) => update({ cancer_type: value })}
            />

            <FormControl fullWidth>
              <InputLabel>干性指数类型</InputLabel>
              <Select
                value={params.stem_index_type ?? ""}
                label="干性指数类型"
                onChange={(e) => update({ stem_index_type: e.target.value })}
              >
                <MenuItem value="mRNAsi">mRNAsi</MenuItem>
                <MenuItem value="mDNAsi">mDNAsi</MenuItem>
                <MenuItem value="EREG-mRNAsi">EREG-mRNAsi</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Pan-Cancer Expression Analysis
  if (subTool === "pan_cancer_expression") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {CommonHeader}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Stack spacing={2}>
            <VirtualizedGeneAutocomplete
              value={params.gene || null}
              onChange={(newValue) => update({ gene: newValue || "" })}
              label="基因"
              geneList={geneList}
              loading={genesLoading}
              maxDisplayOptions={100}
              minSearchLength={geneList.length > 1000 ? 2 : 0}
            />

            <CancerTypeAutocomplete
              value={params.cancer_types || []}
              onChange={(value) => update({ cancer_types: value })}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={!!params.show_normal}
                  onChange={(e) => update({ show_normal: e.target.checked })}
                />
              }
              label="显示正常组织"
            />
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Expression Correlation Analysis
  if (subTool === "expression_correlation") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {CommonHeader}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <VirtualizedGeneAutocomplete
                value={params.gene_x || null}
                onChange={(newValue) => update({ gene_x: newValue || "" })}
                label="基因 X"
                geneList={geneList}
                loading={genesLoading}
                maxDisplayOptions={100}
                minSearchLength={geneList.length > 1000 ? 2 : 0}
              />

              <VirtualizedGeneAutocomplete
                value={params.gene_y || null}
                onChange={(newValue) => update({ gene_y: newValue || "" })}
                label="基因 Y"
                geneList={geneList}
                loading={genesLoading}
                maxDisplayOptions={100}
                minSearchLength={geneList.length > 1000 ? 2 : 0}
              />
            </Stack>

            <CancerTypeSelect
              value={params.cancer_type ?? ""}
              onChange={(value) => update({ cancer_type: value })}
            />

            <FormControl fullWidth>
              <InputLabel>相关性方法</InputLabel>
              <Select
                value={params.method ?? ""}
                label="相关性方法"
                onChange={(e) => update({ method: e.target.value })}
              >
                <MenuItem value="pearson">Pearson</MenuItem>
                <MenuItem value="spearman">Spearman</MenuItem>
                <MenuItem value="kendall">Kendall</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              label="最小样本数"
              value={params.min_samples}
              onChange={(e) => update({ min_samples: Number(e.target.value) })}
              inputProps={{ min: 10 }}
            />
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Pathway Analysis
  if (subTool === "pathway_analysis") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {CommonHeader}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="基因集合（用逗号分隔）"
              value={params.gene_set}
              onChange={(e) => update({ gene_set: e.target.value })}
              placeholder="例如: TP53,BRCA1,BRCA2,EGFR"
              multiline
              rows={3}
            />

            <CancerTypeSelect
              value={params.cancer_type ?? ""}
              onChange={(value) => update({ cancer_type: value })}
            />

            <FormControl fullWidth>
              <InputLabel>通路数据库</InputLabel>
              <Select
                value={params.pathway_database ?? ""}
                label="通路数据库"
                onChange={(e) => update({ pathway_database: e.target.value })}
              >
                <MenuItem value="KEGG">KEGG</MenuItem>
                <MenuItem value="GO">Gene Ontology</MenuItem>
                <MenuItem value="Reactome">Reactome</MenuItem>
                <MenuItem value="MSigDB">MSigDB</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                type="number"
                label="最小基因数"
                value={params.min_genes}
                onChange={(e) => update({ min_genes: Number(e.target.value) })}
                inputProps={{ min: 1 }}
              />
              <TextField
                fullWidth
                type="number"
                label="最大基因数"
                value={params.max_genes}
                onChange={(e) => update({ max_genes: Number(e.target.value) })}
                inputProps={{ min: 1 }}
              />
            </Stack>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Default fallback
  return (
    <Box>
      {CommonHeader}
      <Typography variant="body1" color="text.secondary">
        未知的分析类型: {subTool}
      </Typography>
    </Box>
  );
}
