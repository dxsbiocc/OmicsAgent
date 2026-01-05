"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import Iconify from "@/components/common/Iconify";
import {
  ParameterConfig,
  BaseConfig,
  AestheticConfig,
  ThemeConfig,
} from "../types";
import { Aesthetics } from "../common/Aesthetics";
import { DynamicParams } from "../common/DynamicParams";
import { ThemeConfigComponent } from "../theme/ThemeConfig";
import { linetypeOptions, availableThemeTypes } from "../common/constants";

// Ggsurvplot Layer Type
export interface GgsurvplotLayer extends BaseConfig {
  type: "ggsurvplot";
  mapping?: AestheticConfig;
  arguments?: Record<string, any>;
}

// Available aesthetics for ggsurvplot
export const availableGgsurvplotAesthetics: string[] = ["x", "y", "colour"];

// Available parameters for ggsurvplot - based on official documentation
// Reference: https://rpkgs.datanovia.com/survminer/reference/ggsurvplot_arguments.html
export const availableGgsurvplotParams: ParameterConfig[] = [
  // Basic parameters
  {
    name: "title",
    type: "string",
    default: "",
  },
  {
    name: "xlab",
    type: "string",
  },
  {
    name: "ylab",
    type: "string",
  },
  {
    name: "xlim",
    type: "numbers",
  },
  {
    name: "ylim",
    type: "numbers",
  },
  {
    name: "axes.offset",
    type: "boolean",
    default: true,
  },

  // Survival curve parameters
  {
    name: "fun",
    type: "select",
    options: ["event", "cumhaz", "pct"],
  },
  {
    name: "surv.scale",
    type: "select",
    options: ["default", "percent"],
    default: "default",
  },
  {
    name: "xscale",
    type: "string",
  },
  {
    name: "color",
    type: "string",
  },
  {
    name: "palette",
    type: "colors",
  },
  {
    name: "linetype",
    type: "select",
    options: ["strata", ...linetypeOptions],
  },

  // Time axis breaks
  {
    name: "break.time.by",
    type: "number",
    min: 1,
    step: 1,
  },
  {
    name: "break.x.by",
    type: "number",
    min: 1,
    step: 1,
  },
  {
    name: "break.y.by",
    type: "number",
    min: 0,
    step: 0.01,
  },

  // Confidence interval
  {
    name: "conf.int",
    type: "boolean",
    default: false,
  },
  {
    name: "conf.int.fill",
    type: "color",
  },
  {
    name: "conf.int.style",
    type: "select",
    options: ["ribbon", "step"],
    default: "ribbon",
  },
  {
    name: "conf.int.alpha",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.3,
  },

  // Censor parameters
  {
    name: "censor",
    type: "boolean",
    default: true,
  },
  {
    name: "censor.shape",
    type: "string",
    default: "+",
  },
  {
    name: "censor.size",
    type: "number",
    min: 0,
    step: 0.1,
    default: 4.5,
  },

  // P-value parameters
  {
    name: "pval",
    type: "boolean",
    default: false,
  },
  {
    name: "pval.size",
    type: "number",
    min: 0,
    step: 0.1,
    default: 5,
  },
  {
    name: "pval.coord",
    type: "numbers",
  },
  {
    name: "pval.method",
    type: "boolean",
    default: false,
  },
  {
    name: "pval.method.size",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "pval.method.coord",
    type: "numbers",
  },
  {
    name: "log.rank.weights",
    type: "select",
    options: ["1", "n", "sqrtN", "S1", "S2", "FH"],
    default: "1",
  },
  {
    name: "test.for.trend",
    type: "boolean",
    default: false,
  },

  // Legend parameters
  {
    name: "legend",
    type: "pair",
  },
  {
    name: "legend.title",
    type: "element_text",
  },
  {
    name: "legend.labs",
    type: "strings",
  },

  // Note: risk.table is handled separately with special false/none mapping
  {
    name: "risk.table.title",
    type: "string",
  },
  {
    name: "risk.table.pos",
    type: "select",
    options: ["out", "in"],
    default: "out",
  },
  {
    name: "risk.table.col",
    type: "string",
  },
  {
    name: "risk.table.fontsize",
    type: "number",
    min: 0,
    step: 0.1,
  },
  {
    name: "risk.table.y.text",
    type: "boolean",
    default: true,
  },
  {
    name: "risk.table.y.text.col",
    type: "boolean",
    default: false,
  },
  {
    name: "risk.table.height",
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
    default: 0.25,
  },

  // Cumulative events table
  {
    name: "cumevents",
    type: "boolean",
    default: false,
  },
  {
    name: "cumevents.title",
    type: "string",
  },
  {
    name: "cumevents.col",
    type: "string",
  },
  {
    name: "cumevents.y.text",
    type: "boolean",
    default: true,
  },
  {
    name: "cumevents.y.text.col",
    type: "boolean",
    default: false,
  },
  {
    name: "cumevents.height",
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
    default: 0.25,
  },

  // Cumulative censor table
  {
    name: "cumcensor",
    type: "boolean",
    default: false,
  },
  {
    name: "cumcensor.title",
    type: "string",
  },
  {
    name: "cumcensor.col",
    type: "string",
  },
  {
    name: "cumcensor.y.text",
    type: "boolean",
    default: true,
  },
  {
    name: "cumcensor.y.text.col",
    type: "boolean",
    default: false,
  },
  {
    name: "cumcensor.height",
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
    default: 0.25,
  },

  // Censor plot
  {
    name: "ncensor.plot",
    type: "boolean",
    default: false,
  },
  {
    name: "ncensor.plot.title",
    type: "string",
  },
  {
    name: "ncensor.plot.height",
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
  },

  // Tables general parameters
  {
    name: "tables.height",
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
    default: 0.25,
  },
  {
    name: "tables.y.text",
    type: "boolean",
    default: true,
  },
  {
    name: "tables.y.text.col",
    type: "boolean",
    default: false,
  },
  {
    name: "tables.col",
    type: "string",
    default: "black",
  },
  {
    name: "tables.theme",
    type: "list",
    default: [],
  },
  {
    name: "fontsize",
    type: "number",
    min: 0,
    step: 0.1,
  },

  // Plot layout
  {
    name: "surv.plot.height",
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
    default: 0.75,
  },
  {
    name: "surv.median.line",
    type: "select",
    options: ["none", "hv", "h", "v"],
    default: "none",
  },

  // Grouping and faceting
  {
    name: "group.by",
    type: "strings",
  },
  {
    name: "facet.by",
    type: "strings",
  },
  {
    name: "add.all",
    type: "boolean",
    default: false,
  },
  {
    name: "combine",
    type: "boolean",
    default: false,
  },

  // Note: ggtheme is handled separately, not in DynamicParams
];

interface GgsurvplotProps {
  params: GgsurvplotLayer;
  onChange: (params: GgsurvplotLayer) => void;
  columns?: string[];
}

export const Ggsurvplot: React.FC<GgsurvplotProps> = ({
  params,
  onChange,
  columns = [],
}) => {
  const safeParams = useMemo(() => {
    return {
      type: "ggsurvplot" as const,
      mapping: params.mapping || { x: "", y: "", group: "" },
      arguments: params.arguments || {},
    };
  }, [params]);

  const updateMapping = useCallback(
    (mapping: AestheticConfig) => {
      onChange({
        ...safeParams,
        mapping,
      });
    },
    [safeParams, onChange]
  );

  const updateArguments = useCallback(
    (newArguments: Record<string, any>) => {
      onChange({
        ...safeParams,
        arguments: {
          ...safeParams.arguments,
          ...newArguments,
        },
      });
    },
    [safeParams, onChange]
  );

  // Handle ggtheme separately
  const ggtheme = safeParams.arguments?.ggtheme || [];
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);
  const [addThemeDialogOpen, setAddThemeDialogOpen] = useState(false);
  const [themeToAdd, setThemeToAdd] = useState<string>("");

  const updateGgtheme = useCallback(
    (newThemes: ThemeConfig[]) => {
      updateArguments({ ggtheme: newThemes });
    },
    [updateArguments]
  );

  const updateTheme = useCallback(
    (index: number, updatedTheme: ThemeConfig) => {
      const newThemes = [...ggtheme];
      newThemes[index] = updatedTheme;
      updateGgtheme(newThemes);
    },
    [ggtheme, updateGgtheme]
  );

  const addTheme = useCallback(() => {
    if (!themeToAdd) return;
    const newTheme: ThemeConfig = {
      type: themeToAdd as ThemeConfig["type"],
      arguments: {},
    };
    updateGgtheme([...ggtheme, newTheme]);
    setThemeToAdd("");
    setAddThemeDialogOpen(false);
    setSelectedThemeIndex(ggtheme.length);
  }, [themeToAdd, ggtheme, updateGgtheme]);

  const removeTheme = useCallback(
    (index: number) => {
      const newThemes = ggtheme.filter(
        (_: ThemeConfig, i: number) => i !== index
      );
      updateGgtheme(newThemes);
      if (selectedThemeIndex >= newThemes.length) {
        setSelectedThemeIndex(Math.max(0, newThemes.length - 1));
      }
    },
    [ggtheme, updateGgtheme, selectedThemeIndex]
  );

  // Filter out already added theme types
  const availableThemeTypesToAdd = useMemo(() => {
    const existingTypes = new Set(ggtheme.map((t: ThemeConfig) => t.type));
    return availableThemeTypes.filter(
      (t: { type: string; label: string }) => !existingTypes.has(t.type)
    );
  }, [ggtheme]);

  // Get arguments without ggtheme and risk.table for DynamicParams
  const argumentsWithoutSpecial = useMemo(() => {
    const args = { ...safeParams.arguments };
    delete args.ggtheme;
    delete args["risk.table"];
    return args;
  }, [safeParams.arguments]);

  // Handle risk.table with special false/none mapping
  const riskTableValue = safeParams.arguments?.["risk.table"];
  // Convert false to "none" for display, and keep other values as is
  const riskTableDisplayValue = useMemo(() => {
    if (riskTableValue === false || riskTableValue === "none") {
      return "none";
    }
    return riskTableValue || "none";
  }, [riskTableValue]);

  const handleRiskTableChange = useCallback(
    (value: string) => {
      // Convert "none" to false, keep other values as strings
      const actualValue = value === "none" ? false : value;
      updateArguments({ "risk.table": actualValue });
    },
    [updateArguments]
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        生存分析曲线 (ggsurvplot)
      </Typography>

      <Stack spacing={2}>
        {/* Mapping */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            映射 (Mapping)
          </Typography>
          <Aesthetics
            value={safeParams.mapping || { x: "", y: "", group: "" }}
            onChange={updateMapping}
            availableColumns={columns}
            availableAesthetics={availableGgsurvplotAesthetics}
            requiredAesthetics={[]}
          />
        </Box>

        {/* Risk Table - Special handling with false/none mapping */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            风险表 (risk.table)
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>风险表类型</InputLabel>
            <Select
              value={riskTableDisplayValue}
              label="风险表类型"
              onChange={(e) => handleRiskTableChange(e.target.value)}
            >
              <MenuItem value="none">None (False)</MenuItem>
              <MenuItem value="absolute">Absolute</MenuItem>
              <MenuItem value="percentage">Percentage</MenuItem>
              <MenuItem value="abs_pct">Absolute & Percentage</MenuItem>
              <MenuItem value="nrisk_cumcensor">
                Number at Risk & Cumulative Censor
              </MenuItem>
              <MenuItem value="nrisk_cumevents">
                Number at Risk & Cumulative Events
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Dynamic Parameters (excluding ggtheme and risk.table) */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            参数配置
          </Typography>
          <DynamicParams
            availableParams={availableGgsurvplotParams}
            value={argumentsWithoutSpecial}
            onChange={updateArguments}
          />
        </Box>

        {/* GGTheme - Nested Theme List */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            主题设置 (ggtheme)
          </Typography>
          <Stack spacing={2}>
            {ggtheme.length > 0 && (
              <Stack spacing={1}>
                {ggtheme.map((theme: ThemeConfig, index: number) => {
                  const themeTypeInfo = availableThemeTypes.find(
                    (t) => t.type === theme.type
                  );
                  const themeLabel = themeTypeInfo
                    ? themeTypeInfo.label
                    : theme.type;

                  return (
                    <Paper key={index} sx={{ p: 2 }} elevation={1}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 2 }}
                      >
                        <Typography variant="subtitle1">
                          {themeLabel}
                        </Typography>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => removeTheme(index)}
                        >
                          删除
                        </Button>
                      </Stack>
                      <ThemeConfigComponent
                        params={theme}
                        onChange={(updatedTheme) =>
                          updateTheme(index, updatedTheme)
                        }
                      />
                    </Paper>
                  );
                })}
              </Stack>
            )}

            {availableThemeTypesToAdd.length > 0 && (
              <Box>
                {!addThemeDialogOpen ? (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="gridicons:add" size={24} />}
                    onClick={() => setAddThemeDialogOpen(true)}
                    fullWidth
                  >
                    添加主题
                  </Button>
                ) : (
                  <Paper sx={{ p: 2 }} elevation={1}>
                    <Stack spacing={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>选择主题类型</InputLabel>
                        <Select
                          value={themeToAdd}
                          label="选择主题类型"
                          onChange={(e) => setThemeToAdd(e.target.value)}
                        >
                          {availableThemeTypesToAdd.map((themeType) => (
                            <MenuItem
                              key={themeType.type}
                              value={themeType.type}
                            >
                              {themeType.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={addTheme}
                          disabled={!themeToAdd}
                          fullWidth
                        >
                          添加
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setAddThemeDialogOpen(false);
                            setThemeToAdd("");
                          }}
                          fullWidth
                        >
                          取消
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                )}
              </Box>
            )}

            {ggtheme.length === 0 && availableThemeTypesToAdd.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                所有可用的主题类型都已添加
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};
