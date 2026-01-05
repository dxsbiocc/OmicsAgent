"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Stack,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tabs,
  Tab,
} from "@mui/material";
import { Add, Delete, Search } from "@mui/icons-material";
import InputAdornment from "@mui/material/InputAdornment";
import Iconify from "@/components/common/Iconify";
import { NumberField } from "@/components/common";
import { LabsConfigComponent } from "./others/LabsConfig";
import { LimsConfigComponent } from "./others/LimsConfig";
import { LayerRenderer } from "./layers/LayerRenderer";
import { ThemeConfigComponent } from "./theme/ThemeConfig";
import { ScaleConfigComponent } from "./scales/ScaleConfig";
import { GuideConfigComponent } from "./guides/GuideConfig";
import { CorrelateConfigComponent } from "./extension/CorrelateConfig";
import { QcorrplotConfigComponent } from "./extension/QcorrplotConfig";
import {
  Ggplot2Config,
  Layer,
  LabsConfig,
  LimsConfig,
  ThemeConfig,
  ScaleConfig,
  FacetConfig,
  CoordinateConfig,
  GuideItemConfig,
  BoxplotLayer,
  JitterLayer,
  PointLayer,
  ColLayer,
  LineLayer,
  RoundBoxplotLayer,
  SignifLayer,
  BezierLayer,
  AblineLayer,
  HlineLayer,
  VlineLayer,
  TextLayer,
  LabelLayer,
  AnnotateLayer,
  SegmentLayer,
  CurveLayer,
  CrossbarLayer,
  ErrorbarLayer,
  LinerangeLayer,
  PointrangeLayer,
  ErrorbarhLayer,
  CorrelateConfig,
  ShapingLayer,
  LinkETAnnotateLayer,
  CorrLayer,
  Curve2Layer,
  DoughnutLayer,
  DiagLabelLayer,
  SquareLayer,
  CoupleLayer,
  GgcorLinkLayer,
  GgcorMarkLayer,
  GgcorNumberLayer,
  GgcorPie2Layer,
  GgcorRingLayer,
  GgcorShadeLayer,
  GgcorSquareLayer,
  GgcorStarLayer,
  GgcorAddLinkLayer,
  GgcorCrossLayer,
} from "./types";
import {
  availableAestheticsTypes,
  availableLayerTypes,
  availableScaleTypes,
  availableThemeTypes,
  availableGuideTypes,
  requiredAestheticsTypes,
} from "./common/constants";
import { FacetConfigComponent, CoordinateConfigComponent } from "./others";
import { Aesthetics } from "./common/Aesthetics";
import { AestheticConfig } from "./types";
import { DraggableChip } from "./utils";
import { QuasirandomLayer } from "./extension/GeomQuasirandom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface Ggplot2ComponentProps {
  config: Ggplot2Config;
  onChange: (config: Ggplot2Config) => void;
  columns: string[]; // 列名数组
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

export const Ggplot2Component: React.FC<Ggplot2ComponentProps> = ({
  config,
  onChange,
  columns,
}) => {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);
  const [addLayerDialogOpen, setAddLayerDialogOpen] = useState(false);
  const [layerSearchQuery, setLayerSearchQuery] = useState("");
  const [selectedScaleIndex, setSelectedScaleIndex] = useState<number>(0);
  const [addScaleDialogOpen, setAddScaleDialogOpen] = useState(false);
  const [scaleSearchQuery, setScaleSearchQuery] = useState("");
  const [addThemeDialogOpen, setAddThemeDialogOpen] = useState(false);
  const [addGuideDialogOpen, setAddGuideDialogOpen] = useState(false);
  const [selectedGuideKey, setSelectedGuideKey] = useState<string | null>(null);
  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number>(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  const safeConfig = useMemo(() => {
    return {
      mapping: config.mapping || ({} as AestheticConfig),
      layers: config.layers || undefined,
      scales: config.scales || undefined,
      guides: config.guides || undefined,
      facets: config.facets || undefined,
      coordinates: config.coordinates || undefined,
      labs: config.labs || undefined,
      lims: config.lims || undefined,
      themes: config.themes || undefined,
      correlate: config.correlate || undefined,
      qcorrplot: config.qcorrplot || undefined,
      width: config.width ?? 800,
      height: config.height ?? 600,
    };
  }, [config]);

  const updateConfig = useCallback(
    (key: string, value: any) => {
      onChange({ ...safeConfig, [key]: value } as Ggplot2Config);
    },
    [safeConfig, onChange]
  );

  const updateMapping = useCallback(
    (key: string, value: string) => {
      updateConfig("mapping", { ...safeConfig.mapping, [key]: value });
    },
    [safeConfig.mapping, updateConfig]
  );

  // 更新全局映射（用于 Aesthetics 组件）
  const updateGlobalMapping = useCallback(
    (mapping: AestheticConfig) => {
      updateConfig("mapping", mapping);
    },
    [updateConfig]
  );

  // 全局映射可用的参数列表
  const globalAvailableAesthetics = useMemo(() => availableAestheticsTypes, []);

  // 根据图层类型获取必需的映射参数
  const getRequiredAestheticsForLayer = useCallback(
    (layerType: string): string[] => {
      return requiredAestheticsTypes[
        layerType as keyof typeof requiredAestheticsTypes
      ];
    },
    []
  );

  // 根据 meta.json 中的 mapping 字段确定全局映射的必需参数
  const globalRequiredAesthetics = useMemo(() => {
    // 优先使用 config 中已定义的 mapping 字段作为必需参数
    const mapping = safeConfig.mapping || {};
    const mappingKeys = Object.keys(mapping);

    if (mappingKeys.length > 0) {
      // 如果有 mapping 定义，使用 mapping 中的键作为必需参数
      // 保持顺序：x, y 在前，其他按字母顺序
      const result: string[] = [];
      if (mappingKeys.includes("x")) result.push("x");
      if (mappingKeys.includes("y")) result.push("y");
      // 添加其他映射参数，保持原有顺序
      mappingKeys.forEach((key) => {
        if (key !== "x" && key !== "y" && !result.includes(key)) {
          result.push(key);
        }
      });
      return result;
    }

    // 如果没有 mapping 定义，回退到基于图层类型的逻辑
    const layers = safeConfig.layers || [];
    if (layers.length === 0) {
      // 如果没有图层，默认使用 x, y
      return ["x", "y"];
    }
    // 如果有图层，收集所有图层的必需参数并去重
    const requiredSet = new Set<string>();
    layers.forEach((layer) => {
      const required = getRequiredAestheticsForLayer(layer.type);
      // 检查 required 是否存在且为数组
      if (required && Array.isArray(required)) {
        required.forEach((aes) => requiredSet.add(aes));
      }
    });
    // 返回去重后的必需参数数组，保持顺序（x 在前，y 在后）
    const result: string[] = [];
    if (requiredSet.has("x")) result.push("x");
    if (requiredSet.has("y")) result.push("y");
    // 添加其他可能的必需参数
    requiredSet.forEach((aes) => {
      if (aes !== "x" && aes !== "y") {
        result.push(aes);
      }
    });
    // 如果没有收集到任何必需参数，默认返回 x, y
    return result.length > 0 ? result : ["x", "y"];
  }, [safeConfig.mapping, safeConfig.layers, getRequiredAestheticsForLayer]);

  const updateLayer = useCallback(
    (index: number, layer: Layer) => {
      const currentLayers = safeConfig.layers || [];
      const newLayers = [...currentLayers];
      newLayers[index] = layer;
      updateConfig("layers", newLayers);
    },
    [safeConfig.layers, updateConfig]
  );

  // 创建新图层
  const createLayer = useCallback((layerType: string): Layer => {
    switch (layerType) {
      case "geom_boxplot":
        return {
          type: "geom_boxplot",
          arguments: {
            fill: "steelblue",
            alpha: 0.7,
          },
        } as BoxplotLayer;
      case "geom_round_boxplot":
        return {
          type: "geom_round_boxplot",
          arguments: {
            radius: 3,
            alpha: 0.7,
          },
        } as RoundBoxplotLayer;
      case "geom_jitter":
        return {
          type: "geom_jitter",
          arguments: {
            width: 0.2,
            height: 0,
            alpha: 0.5,
          },
        } as JitterLayer;
      case "geom_point":
        return {
          type: "geom_point",
          arguments: {
            size: 2,
            alpha: 0.7,
          },
        } as PointLayer;
      case "geom_signif":
        return {
          type: "geom_signif",
          arguments: {},
        } as SignifLayer;
      case "geom_shaping":
        return {
          type: "geom_shaping",
          arguments: {},
        } as ShapingLayer;
      case "geom_annotate":
        return {
          type: "geom_annotate",
          arguments: {},
        } as LinkETAnnotateLayer;
      case "geom_corr":
        return {
          type: "geom_corr",
          arguments: {},
        } as CorrLayer;
      case "geom_curve2":
        return {
          type: "geom_curve2",
          arguments: {},
        } as Curve2Layer;
      case "geom_doughnut":
        return {
          type: "geom_doughnut",
          arguments: {},
        } as DoughnutLayer;
      case "geom_diag_label":
        return {
          type: "geom_diag_label",
          arguments: {},
        } as DiagLabelLayer;
      case "geom_square":
        return {
          type: "geom_square",
          arguments: {},
        } as SquareLayer;
      case "geom_couple":
        return {
          type: "geom_couple",
          arguments: {},
        } as CoupleLayer;
      case "geom_link":
        return {
          type: "geom_link",
          arguments: {},
        } as GgcorLinkLayer;
      case "geom_mark":
        return {
          type: "geom_mark",
          arguments: {},
        } as GgcorMarkLayer;
      case "geom_number":
        return {
          type: "geom_number",
          arguments: {},
        } as GgcorNumberLayer;
      case "geom_pie2":
        return {
          type: "geom_pie2",
          arguments: {},
        } as GgcorPie2Layer;
      case "geom_ring":
        return {
          type: "geom_ring",
          arguments: {},
        } as GgcorRingLayer;
      case "geom_shade":
        return {
          type: "geom_shade",
          arguments: {},
        } as GgcorShadeLayer;
      case "geom_star":
        return {
          type: "geom_star",
          arguments: {},
        } as GgcorStarLayer;
      case "add_link":
        return {
          type: "add_link",
          arguments: {},
        } as GgcorAddLinkLayer;
      case "geom_cross":
        return {
          type: "geom_cross",
          arguments: {},
        } as GgcorCrossLayer;
      case "geom_bezier":
        return {
          type: "geom_bezier",
          arguments: {},
        } as BezierLayer;
      case "geom_abline":
        return {
          type: "geom_abline",
          arguments: {
            intercept: 0,
            slope: 1,
            linetype: "solid",
            linewidth: 0.5,
          },
        } as AblineLayer;
      case "geom_hline":
        return {
          type: "geom_hline",
          arguments: {
            yintercept: 0,
            linetype: "solid",
            linewidth: 0.5,
          },
        } as HlineLayer;
      case "geom_vline":
        return {
          type: "geom_vline",
          arguments: {
            xintercept: 0,
            linetype: "solid",
            linewidth: 0.5,
          },
        } as VlineLayer;
      case "geom_text":
        return {
          type: "geom_text",
          arguments: {
            size: 3.88,
          },
        } as TextLayer;
      case "geom_label":
        return {
          type: "geom_label",
          arguments: {
            size: 3.88,
            fill: "white",
          },
        } as LabelLayer;
      case "annotate":
        return {
          type: "annotate",
          arguments: {
            geom: "text",
            x: 0,
            y: 0,
            label: "annotation",
          },
        } as AnnotateLayer;
      case "geom_segment":
        return {
          type: "geom_segment",
          arguments: {
            linewidth: 0.5,
          },
        } as SegmentLayer;
      case "geom_curve":
        return {
          type: "geom_curve",
          arguments: {
            curvature: 0.5,
            angle: 90,
            ncp: 5,
          },
        } as CurveLayer;
      case "geom_crossbar":
        return { type: "geom_crossbar", arguments: {} } as CrossbarLayer;
      case "geom_errorbar":
        return { type: "geom_errorbar", arguments: {} } as ErrorbarLayer;
      case "geom_linerange":
        return { type: "geom_linerange", arguments: {} } as LinerangeLayer;
      case "geom_pointrange":
        return { type: "geom_pointrange", arguments: {} } as PointrangeLayer;
      case "geom_errorbarh":
        return { type: "geom_errorbarh", arguments: {} } as ErrorbarhLayer;
      case "geom_quasirandom":
        return { type: "geom_quasirandom", arguments: {} } as QuasirandomLayer;
      default:
        return {
          type: layerType,
          arguments: {},
        };
    }
  }, []);

  // 处理添加图层
  const handleAddLayer = useCallback(
    (layerType: string) => {
      const newLayer = createLayer(layerType);
      const newLayers = [...(safeConfig.layers || []), newLayer];
      updateConfig("layers", newLayers);
      setSelectedLayerIndex(newLayers.length - 1);
      setAddLayerDialogOpen(false);
    },
    [safeConfig.layers, updateConfig, createLayer]
  );

  const removeLayer = useCallback(
    (index: number) => {
      const currentLayers = safeConfig.layers || [];
      const newLayers = currentLayers.filter((_, i) => i !== index);
      updateConfig("layers", newLayers);
      if (selectedLayerIndex >= newLayers.length) {
        setSelectedLayerIndex(Math.max(0, newLayers.length - 1));
      }
    },
    [safeConfig.layers, updateConfig, selectedLayerIndex]
  );

  // 配置拖拽传感器
  // 减少激活距离，提高响应速度
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 移动 5px 后就激活拖拽，提高响应速度
      },
    }),
    useSensor(KeyboardSensor)
  );

  // 处理拖拽开始
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // 处理拖拽结束，清除活动状态
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
  }, []);

  // 处理图层拖拽结束
  const handleLayerDragEnd = useCallback(
    (event: DragEndEvent) => {
      handleDragEnd(event);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const currentLayers = safeConfig.layers || [];
      const oldIndex = currentLayers.findIndex(
        (_, i) => `layer-${i}` === active.id
      );
      const newIndex = currentLayers.findIndex(
        (_, i) => `layer-${i}` === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newLayers = arrayMove(currentLayers, oldIndex, newIndex);
        updateConfig("layers", newLayers);

        // 更新选中的图层索引
        if (selectedLayerIndex === oldIndex) {
          setSelectedLayerIndex(newIndex);
        } else if (
          selectedLayerIndex > oldIndex &&
          selectedLayerIndex <= newIndex
        ) {
          setSelectedLayerIndex(selectedLayerIndex - 1);
        } else if (
          selectedLayerIndex < oldIndex &&
          selectedLayerIndex >= newIndex
        ) {
          setSelectedLayerIndex(selectedLayerIndex + 1);
        }
      }
    },
    [safeConfig.layers, updateConfig, selectedLayerIndex, handleDragEnd]
  );

  // 创建新标度
  const createScale = useCallback((scaleType: string): ScaleConfig => {
    return {
      type: scaleType as ScaleConfig["type"],
      arguments: {},
    };
  }, []);

  // 处理添加标度
  const handleAddScale = useCallback(
    (scaleType: string) => {
      const newScale = createScale(scaleType);
      const newScales = [...(safeConfig.scales || []), newScale];
      updateConfig("scales", newScales);
      setSelectedScaleIndex(newScales.length - 1);
      setAddScaleDialogOpen(false);
    },
    [safeConfig.scales, updateConfig, createScale]
  );

  const removeScale = useCallback(
    (index: number) => {
      const currentScales = safeConfig.scales || [];
      const newScales = currentScales.filter((_, i) => i !== index);
      updateConfig("scales", newScales);
      if (selectedScaleIndex >= newScales.length) {
        setSelectedScaleIndex(Math.max(0, newScales.length - 1));
      }
    },
    [safeConfig.scales, updateConfig, selectedScaleIndex]
  );

  // 处理标度拖拽结束
  const handleScaleDragEnd = useCallback(
    (event: DragEndEvent) => {
      handleDragEnd(event);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const currentScales = safeConfig.scales || [];
      const oldIndex = currentScales.findIndex(
        (_, i) => `scale-${i}` === active.id
      );
      const newIndex = currentScales.findIndex(
        (_, i) => `scale-${i}` === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newScales = arrayMove(currentScales, oldIndex, newIndex);
        updateConfig("scales", newScales);

        // 更新选中的标度索引
        if (selectedScaleIndex === oldIndex) {
          setSelectedScaleIndex(newIndex);
        } else if (
          selectedScaleIndex > oldIndex &&
          selectedScaleIndex <= newIndex
        ) {
          setSelectedScaleIndex(selectedScaleIndex - 1);
        } else if (
          selectedScaleIndex < oldIndex &&
          selectedScaleIndex >= newIndex
        ) {
          setSelectedScaleIndex(selectedScaleIndex + 1);
        }
      }
    },
    [safeConfig.scales, updateConfig, selectedScaleIndex, handleDragEnd]
  );

  // 渲染标度配置组件
  const renderScaleConfig = () => {
    const currentScales = safeConfig.scales || [];
    if (currentScales.length === 0) {
      return null; // 已经在外部处理了空状态
    }

    const selectedScale = currentScales[selectedScaleIndex];
    if (!selectedScale) return null;

    return (
      <ScaleConfigComponent
        params={selectedScale}
        onChange={(scale) => updateScale(selectedScaleIndex, scale)}
      />
    );
  };

  const updateLabs = useCallback(
    (labs: LabsConfig) => {
      updateConfig("labs", labs);
    },
    [updateConfig]
  );

  const updateLims = useCallback(
    (lims: LimsConfig | undefined) => {
      if (lims === undefined) {
        updateConfig("lims", undefined);
      } else {
        updateConfig("lims", lims);
      }
    },
    [updateConfig]
  );

  const updateThemes = useCallback(
    (themes: ThemeConfig[]) => {
      updateConfig("themes", themes);
    },
    [updateConfig]
  );

  const updateTheme = useCallback(
    (index: number, theme: ThemeConfig) => {
      const currentThemes = safeConfig.themes || [];
      const newThemes = [...currentThemes];
      newThemes[index] = theme;
      updateThemes(newThemes);
    },
    [safeConfig.themes, updateThemes]
  );

  // 处理主题拖拽结束
  const handleThemeDragEnd = useCallback(
    (event: DragEndEvent) => {
      handleDragEnd(event);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const currentThemes = safeConfig.themes || [];
      const oldIndex = currentThemes.findIndex(
        (_, i) => `theme-${i}` === active.id
      );
      const newIndex = currentThemes.findIndex(
        (_, i) => `theme-${i}` === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newThemes = arrayMove(currentThemes, oldIndex, newIndex);
        updateThemes(newThemes);

        // 更新选中的主题索引
        if (selectedThemeIndex === oldIndex) {
          setSelectedThemeIndex(newIndex);
        } else if (
          selectedThemeIndex > oldIndex &&
          selectedThemeIndex <= newIndex
        ) {
          setSelectedThemeIndex(selectedThemeIndex - 1);
        } else if (
          selectedThemeIndex < oldIndex &&
          selectedThemeIndex >= newIndex
        ) {
          setSelectedThemeIndex(selectedThemeIndex + 1);
        }
      }
    },
    [safeConfig.themes, updateThemes, selectedThemeIndex, handleDragEnd]
  );

  const updateScales = useCallback(
    (scales: ScaleConfig[]) => {
      updateConfig("scales", scales);
    },
    [updateConfig]
  );

  const updateScale = useCallback(
    (index: number, scale: ScaleConfig) => {
      const currentScales = safeConfig.scales || [];
      const newScales = [...currentScales];
      newScales[index] = scale;
      updateScales(newScales);
    },
    [safeConfig.scales, updateScales]
  );

  const updateFacet = useCallback(
    (facet: FacetConfig) => {
      updateConfig("facets", facet);
    },
    [updateConfig]
  );

  const updateCoordinate = useCallback(
    (coordinate: CoordinateConfig) => {
      updateConfig("coordinates", coordinate);
    },
    [updateConfig]
  );

  const updateGuides = useCallback(
    (guides: { [aesthetic: string]: GuideItemConfig }) => {
      updateConfig("guides", guides);
    },
    [updateConfig]
  );

  const updateGuide = useCallback(
    (aesthetic: string, guide: GuideItemConfig) => {
      const currentGuides = safeConfig.guides || {};
      updateGuides({ ...currentGuides, [aesthetic]: guide });
    },
    [safeConfig.guides, updateGuides]
  );

  const removeGuide = useCallback(
    (aesthetic: string) => {
      const currentGuides = safeConfig.guides || {};
      const newGuides = { ...currentGuides };
      delete newGuides[aesthetic];
      if (Object.keys(newGuides).length === 0) {
        updateConfig("guides", undefined);
      } else {
        updateGuides(newGuides);
      }
      if (selectedGuideKey === aesthetic) {
        const remainingKeys = Object.keys(newGuides);
        setSelectedGuideKey(remainingKeys.length > 0 ? remainingKeys[0] : null);
      }
    },
    [safeConfig.guides, updateGuides, updateConfig, selectedGuideKey]
  );

  // 处理添加指南
  const handleAddGuide = useCallback(
    (aesthetic: string, guideType: GuideItemConfig["type"]) => {
      const currentGuides = safeConfig.guides || {};
      // 检查该美学映射是否已存在指南
      if (currentGuides[aesthetic]) {
        return;
      }
      const newGuide: GuideItemConfig = {
        type: guideType,
        arguments: {},
      };
      updateGuides({ ...currentGuides, [aesthetic]: newGuide });
      setSelectedGuideKey(aesthetic);
      setAddGuideDialogOpen(false);
    },
    [safeConfig.guides, updateGuides]
  );

  // 创建默认分面配置
  const createFacet = useCallback((): FacetConfig => {
    return {
      type: "facet_grid",
      arguments: {},
    };
  }, []);

  // 创建默认坐标配置
  const createCoordinate = useCallback((): CoordinateConfig => {
    return {
      type: "coord_cartesian",
      arguments: {},
    };
  }, []);

  // 处理添加分面
  const handleAddFacet = useCallback(() => {
    const newFacet = createFacet();
    updateConfig("facets", newFacet);
  }, [createFacet, updateConfig]);

  // 处理添加坐标
  const handleAddCoordinate = useCallback(() => {
    const newCoordinate = createCoordinate();
    updateConfig("coordinates", newCoordinate);
  }, [createCoordinate, updateConfig]);

  // 处理删除分面
  const handleRemoveFacet = useCallback(() => {
    updateConfig("facets", undefined);
  }, [updateConfig]);

  // 获取已存在的主题类型
  const existingThemeTypes = useMemo(() => {
    const themes = safeConfig.themes || [];
    return new Set<ThemeConfig["type"]>(themes.map((theme) => theme.type));
  }, [safeConfig.themes]);

  // 获取可用的主题类型（排除已存在的）
  const availableThemeTypesToAdd = useMemo(() => {
    return availableThemeTypes.filter(
      (themeType) =>
        !existingThemeTypes.has(themeType.type as ThemeConfig["type"])
    );
  }, [availableThemeTypes, existingThemeTypes]);

  // 处理添加主题
  const handleAddTheme = useCallback(
    (themeType: ThemeConfig["type"]) => {
      const currentThemes = safeConfig.themes || [];
      // 检查该主题类型是否已存在
      if (existingThemeTypes.has(themeType)) {
        return;
      }
      const newTheme: ThemeConfig = {
        type: themeType,
        arguments: {},
      };
      updateThemes([...currentThemes, newTheme]);
      setAddThemeDialogOpen(false);
    },
    [safeConfig.themes, updateThemes, existingThemeTypes]
  );

  // 处理删除坐标
  const handleRemoveCoordinate = useCallback(() => {
    updateConfig("coordinates", undefined);
  }, [updateConfig]);

  // 渲染图层配置组件
  const renderLayerConfig = () => {
    const currentLayers = safeConfig.layers || [];
    if (currentLayers.length === 0) {
      return null;
    }

    const selectedLayer = currentLayers[selectedLayerIndex];
    if (!selectedLayer) return null;

    return (
      <LayerRenderer
        layer={selectedLayer}
        onChange={(layer) => updateLayer(selectedLayerIndex, layer)}
        columns={columns}
      />
    );
  };

  const availableColumns = columns;

  // 检查 mapping 中是否有任何有效的映射参数
  const hasMappingValues = useCallback((mapping: any): boolean => {
    if (!mapping) return false;
    // 检查所有可能的映射参数，只要有一个非空值就返回 true
    return Object.values(mapping).some(
      (value) => value !== undefined && value !== null && value !== ""
    );
  }, []);

  // 根据 mapping 参数自动创建默认图层
  useEffect(() => {
    const mapping = safeConfig.mapping;
    const layers = safeConfig.layers || [];

    // 如果设置了任何映射参数，且没有图层，自动创建默认的 geom_point 图层
    if (hasMappingValues(mapping) && layers.length === 0) {
      const defaultLayer = createLayer("geom_point");
      updateConfig("layers", [defaultLayer]);
      setSelectedLayerIndex(0);
    }
  }, [
    safeConfig.mapping,
    safeConfig.layers,
    createLayer,
    updateConfig,
    hasMappingValues,
  ]);

  return (
    <Box sx={{ height: "100%" }}>
      <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
        {/* 左侧 Tabs 区域 */}
        <Box
          sx={{
            display: "flex",
            borderRight: 1,
            borderColor: "divider",
            width: "auto",
            height: "100%",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <Tabs
            orientation="vertical"
            value={selectedTab}
            onChange={(_, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons={false}
            sx={{
              width: "auto",
              height: "100%",
              overflow: "auto",
              "&::-webkit-scrollbar": {
                display: "none", // 隐藏滚动条
              },
              "& .MuiTab-root": {
                alignItems: "center",
                textAlign: "center",
                minHeight: 60,
                minWidth: "auto",
                width: "auto",
                padding: "8px 12px",
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                fontSize: "0.9rem",
                fontWeight: 500,
                letterSpacing: "0.5px",
                whiteSpace: "nowrap",
                "&.Mui-selected": {
                  backgroundColor: "action.selected",
                },
              },
              "& .MuiTabs-indicator": {
                left: 0,
                right: "auto",
                width: 3,
                backgroundColor: "primary.main",
              },
            }}
          >
            <Tab label="映射" />
            <Tab label="图层" />
            <Tab label="标度" />
            <Tab label="分面" />
            <Tab label="坐标" />
            <Tab label="指南" />
            <Tab label="主题" />
            <Tab label="其他" />
          </Tabs>
        </Box>

        {/* 右侧内容区域 */}
        <Box
          sx={{
            p: 1,
            flex: 1,
            height: "100%",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 美学映射 */}
          <TabPanel value={selectedTab} index={0}>
            <Stack spacing={2}>
              <Paper sx={{ p: 2 }} elevation={1}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  全局美学映射
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  全局映射会应用到所有图层，除非图层有自己的映射覆盖
                </Typography>
                <Aesthetics
                  availableAesthetics={globalAvailableAesthetics}
                  availableColumns={availableColumns}
                  value={safeConfig.mapping}
                  onChange={updateGlobalMapping}
                  requiredAesthetics={globalRequiredAesthetics}
                />
              </Paper>
              {safeConfig.qcorrplot && (
                <QcorrplotConfigComponent
                  params={safeConfig.qcorrplot}
                  onChange={(qcorrplot) => updateConfig("qcorrplot", qcorrplot)}
                />
              )}
            </Stack>
          </TabPanel>

          {/* 图层配置 */}
          <TabPanel value={selectedTab} index={1}>
            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                图层配置
              </Typography>

              {safeConfig.layers && safeConfig.layers.length > 0 ? (
                <>
                  {/* 图层顺序拖拽区域 */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      图层顺序（拖拽调整）
                    </Typography>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleLayerDragEnd}
                    >
                      <SortableContext
                        items={safeConfig.layers.map((_, i) => `layer-${i}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        <Stack spacing={1}>
                          {safeConfig.layers.map((layer, index) => {
                            const layerTypeInfo = availableLayerTypes.find(
                              (lt) => lt.type === layer.type
                            );
                            const layerLabel = layerTypeInfo
                              ? layerTypeInfo.label
                              : layer.type;
                            return (
                              <DraggableChip
                                key={`layer-${index}`}
                                id={`layer-${index}`}
                                index={index}
                                item={layer}
                                label={layerLabel}
                                isSelected={index === selectedLayerIndex}
                                onClick={() => setSelectedLayerIndex(index)}
                                icon="mdi:layers"
                              />
                            );
                          })}
                        </Stack>
                      </SortableContext>
                      <DragOverlay
                        style={{
                          cursor: "grabbing",
                        }}
                        dropAnimation={{
                          duration: 200,
                          easing: "cubic-bezier(0.18, 0.67, 0.6, 1)",
                        }}
                      >
                        {activeId && activeId.startsWith("layer-")
                          ? (() => {
                              const dragIndex = parseInt(
                                activeId.replace("layer-", "")
                              );
                              const dragLayer = safeConfig.layers[dragIndex];
                              const layerTypeInfo = availableLayerTypes.find(
                                (lt) => lt.type === dragLayer?.type
                              );
                              const layerLabel = layerTypeInfo
                                ? layerTypeInfo.label
                                : dragLayer?.type || "";
                              return (
                                <Box
                                  sx={{
                                    opacity: 0.95,
                                    transform: "rotate(2deg) scale(1.05)",
                                    boxShadow: 6,
                                    width: "100%",
                                    transition: "none",
                                    borderRadius: "16px", // MUI Chip 的默认圆角半径
                                    overflow: "visible", // 允许阴影显示
                                  }}
                                >
                                  <DraggableChip
                                    id={activeId}
                                    index={dragIndex}
                                    item={dragLayer}
                                    label={layerLabel}
                                    isSelected={false}
                                    onClick={() => {}}
                                    icon="mdi:layers"
                                  />
                                </Box>
                              );
                            })()
                          : null}
                      </DragOverlay>
                    </DndContext>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>选择图层</InputLabel>
                        <Select
                          value={selectedLayerIndex}
                          onChange={(e) =>
                            setSelectedLayerIndex(Number(e.target.value))
                          }
                          label="选择图层"
                        >
                          {safeConfig.layers.map((layer, index) => (
                            <MenuItem key={index} value={index}>
                              {`图层 ${index + 1}: ${layer.type}`}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="flex-end"
                    sx={{ mb: 2 }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => setAddLayerDialogOpen(true)}
                    >
                      添加图层
                    </Button>
                    {safeConfig.layers.length > 1 && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => removeLayer(selectedLayerIndex)}
                      >
                        删除当前图层
                      </Button>
                    )}
                  </Stack>

                  {renderLayerConfig()}
                </>
              ) : (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    暂无图层，请添加图层
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => setAddLayerDialogOpen(true)}
                  >
                    添加图层
                  </Button>
                </Box>
              )}
            </Paper>
          </TabPanel>

          {/* Scales 配置 */}
          <TabPanel value={selectedTab} index={2}>
            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                标度配置
              </Typography>

              {safeConfig.scales && safeConfig.scales.length > 0 ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      标度顺序（拖拽调整）
                    </Typography>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleScaleDragEnd}
                    >
                      <SortableContext
                        items={safeConfig.scales.map((_, i) => `scale-${i}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        <Stack spacing={1}>
                          {safeConfig.scales.map((scale, index) => {
                            const scaleTypeInfo = availableScaleTypes.find(
                              (st) => st.type === scale.type
                            );
                            const scaleLabel = scaleTypeInfo
                              ? scaleTypeInfo.label
                              : scale.type;
                            return (
                              <DraggableChip
                                key={`scale-${index}`}
                                id={`scale-${index}`}
                                index={index}
                                item={scale}
                                label={scaleLabel}
                                isSelected={index === selectedScaleIndex}
                                onClick={() => setSelectedScaleIndex(index)}
                                icon="icon-park-outline:curve-adjustment"
                              />
                            );
                          })}
                        </Stack>
                      </SortableContext>
                      <DragOverlay
                        style={{
                          cursor: "grabbing",
                        }}
                        dropAnimation={{
                          duration: 200,
                          easing: "cubic-bezier(0.18, 0.67, 0.6, 1)",
                        }}
                      >
                        {activeId && activeId.startsWith("scale-")
                          ? (() => {
                              const dragIndex = parseInt(
                                activeId.replace("scale-", "")
                              );
                              const dragScale = safeConfig.scales[dragIndex];
                              const scaleTypeInfo = availableScaleTypes.find(
                                (st) => st.type === dragScale?.type
                              );
                              const scaleLabel = scaleTypeInfo
                                ? scaleTypeInfo.label
                                : dragScale?.type || "";
                              return (
                                <DraggableChip
                                  id={activeId}
                                  index={dragIndex}
                                  item={dragScale}
                                  label={scaleLabel}
                                  isSelected={true}
                                  onClick={() => {}}
                                  icon="icon-park-outline:curve-adjustment"
                                />
                              );
                            })()
                          : null}
                      </DragOverlay>
                    </DndContext>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="flex-end"
                    sx={{ mb: 2 }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Iconify icon="gridicons:add" size={24} />}
                      onClick={() => setAddScaleDialogOpen(true)}
                    >
                      添加标度
                    </Button>
                    {safeConfig.scales.length > 1 && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => removeScale(selectedScaleIndex)}
                      >
                        删除当前标度
                      </Button>
                    )}
                  </Stack>

                  {renderScaleConfig()}
                </>
              ) : (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    暂无标度，请添加标度
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="gridicons:add" size={24} />}
                    onClick={() => setAddScaleDialogOpen(true)}
                  >
                    添加标度
                  </Button>
                </Box>
              )}
            </Paper>
          </TabPanel>

          {/* Facets 配置 */}
          <TabPanel value={selectedTab} index={3}>
            {safeConfig.facets ? (
              <Box>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="flex-end"
                  sx={{ mb: 2 }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<Delete />}
                    onClick={handleRemoveFacet}
                  >
                    删除分面配置
                  </Button>
                </Stack>
                <FacetConfigComponent
                  params={safeConfig.facets}
                  onChange={updateFacet}
                  columns={availableColumns}
                />
              </Box>
            ) : (
              <Paper sx={{ p: 2 }} elevation={1}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  分面配置
                </Typography>
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    暂无分面配置，请添加分面
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="gridicons:add" size={24} />}
                    onClick={handleAddFacet}
                  >
                    添加分面
                  </Button>
                </Box>
              </Paper>
            )}
          </TabPanel>

          {/* Coordinates 配置 */}
          <TabPanel value={selectedTab} index={4}>
            {safeConfig.coordinates ? (
              <Box>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="flex-end"
                  sx={{ mb: 2 }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<Delete />}
                    onClick={handleRemoveCoordinate}
                  >
                    删除坐标配置
                  </Button>
                </Stack>
                <CoordinateConfigComponent
                  params={safeConfig.coordinates}
                  onChange={updateCoordinate}
                />
              </Box>
            ) : (
              <Paper sx={{ p: 2 }} elevation={1}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  坐标配置
                </Typography>
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    暂无坐标配置，请添加坐标系统
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="gridicons:add" size={24} />}
                    onClick={handleAddCoordinate}
                  >
                    添加坐标系统
                  </Button>
                </Box>
              </Paper>
            )}
          </TabPanel>

          {/* Guides 配置 */}
          <TabPanel value={selectedTab} index={5}>
            {safeConfig.guides && Object.keys(safeConfig.guides).length > 0 ? (
              <Stack spacing={2}>
                {Object.entries(safeConfig.guides).map(([aesthetic, guide]) => {
                  const guideTypeInfo = availableGuideTypes.find(
                    (g) => g.type === guide.type
                  );
                  const guideLabel = guideTypeInfo
                    ? guideTypeInfo.label
                    : guide.type;

                  return (
                    <Paper key={aesthetic} sx={{ p: 2 }} elevation={1}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 2 }}
                      >
                        <Typography variant="h6">
                          {aesthetic} - {guideLabel}
                        </Typography>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => removeGuide(aesthetic)}
                        >
                          删除
                        </Button>
                      </Stack>
                      <GuideConfigComponent
                        params={guide}
                        onChange={(updatedGuide) =>
                          updateGuide(aesthetic, updatedGuide)
                        }
                      />
                    </Paper>
                  );
                })}
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="gridicons:add" size={24} />}
                    onClick={() => setAddGuideDialogOpen(true)}
                  >
                    添加指南
                  </Button>
                </Box>
              </Stack>
            ) : (
              <Paper sx={{ p: 2 }} elevation={1}>
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    暂无指南配置，请添加指南
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="gridicons:add" size={24} />}
                    onClick={() => setAddGuideDialogOpen(true)}
                  >
                    添加指南
                  </Button>
                </Box>
              </Paper>
            )}
          </TabPanel>

          {/* Theme 配置 */}
          <TabPanel value={selectedTab} index={6}>
            {safeConfig.themes && safeConfig.themes.length > 0 ? (
              <Stack spacing={2}>
                {/* 主题顺序拖拽区域 */}
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    主题顺序（拖拽调整）
                  </Typography>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleThemeDragEnd}
                  >
                    <SortableContext
                      items={safeConfig.themes.map((_, i) => `theme-${i}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <Stack spacing={1}>
                        {safeConfig.themes.map((theme, index) => {
                          const themeTypeInfo = availableThemeTypes.find(
                            (t) => t.type === theme.type
                          );
                          const themeLabel = themeTypeInfo
                            ? themeTypeInfo.label
                            : theme.type;
                          return (
                            <DraggableChip
                              key={`theme-${index}`}
                              id={`theme-${index}`}
                              index={index}
                              item={theme}
                              label={themeLabel}
                              isSelected={index === selectedThemeIndex}
                              onClick={() => setSelectedThemeIndex(index)}
                              icon="mdi:palette"
                            />
                          );
                        })}
                      </Stack>
                    </SortableContext>
                    <DragOverlay
                      style={{
                        cursor: "grabbing",
                      }}
                      dropAnimation={{
                        duration: 200,
                        easing: "cubic-bezier(0.18, 0.67, 0.6, 1)",
                      }}
                    >
                      {activeId && activeId.startsWith("theme-")
                        ? (() => {
                            const dragIndex = parseInt(
                              activeId.replace("theme-", "")
                            );
                            const dragTheme = safeConfig.themes[dragIndex];
                            const themeTypeInfo = availableThemeTypes.find(
                              (t) => t.type === dragTheme?.type
                            );
                            const themeLabel = themeTypeInfo
                              ? themeTypeInfo.label
                              : dragTheme?.type || "";
                            return (
                              <Box
                                sx={{
                                  opacity: 0.95,
                                  transform: "rotate(2deg) scale(1.05)",
                                  boxShadow: 6,
                                  width: "100%",
                                  transition: "none",
                                  borderRadius: "16px", // MUI Chip 的默认圆角半径
                                  overflow: "visible", // 允许阴影显示
                                }}
                              >
                                <DraggableChip
                                  id={activeId}
                                  index={dragIndex}
                                  item={dragTheme}
                                  label={themeLabel}
                                  isSelected={false}
                                  onClick={() => {}}
                                  icon="mdi:palette"
                                />
                              </Box>
                            );
                          })()
                        : null}
                    </DragOverlay>
                  </DndContext>
                </Box>

                {safeConfig.themes.map((theme, index) => {
                  // 获取主题类型的显示名称
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
                        <Typography variant="h6">{themeLabel}</Typography>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => {
                            const newThemes = safeConfig.themes!.filter(
                              (_, i) => i !== index
                            );
                            updateThemes(newThemes);
                            if (selectedThemeIndex >= newThemes.length) {
                              setSelectedThemeIndex(
                                Math.max(0, newThemes.length - 1)
                              );
                            }
                          }}
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
                {availableThemeTypesToAdd.length > 0 && (
                  <Box sx={{ textAlign: "center", py: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Iconify icon="gridicons:add" size={24} />}
                      onClick={() => setAddThemeDialogOpen(true)}
                    >
                      添加主题
                    </Button>
                  </Box>
                )}
              </Stack>
            ) : (
              <Paper sx={{ p: 2 }} elevation={1}>
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    暂无主题配置，请添加主题
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="gridicons:add" size={24} />}
                    onClick={() => setAddThemeDialogOpen(true)}
                  >
                    添加主题
                  </Button>
                </Box>
              </Paper>
            )}
          </TabPanel>

          {/* 标签和尺寸配置 */}
          <TabPanel value={selectedTab} index={7}>
            <Stack spacing={2}>
              <CorrelateConfigComponent
                params={safeConfig.correlate}
                onChange={(correlate) => updateConfig("correlate", correlate)}
                columns={availableColumns}
              />
              <LabsConfigComponent
                params={safeConfig.labs as LabsConfig}
                onChange={updateLabs}
              />
              <LimsConfigComponent
                params={safeConfig.lims}
                onChange={updateLims}
              />
              <Paper sx={{ p: 2 }} elevation={1}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  图表尺寸
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <NumberField
                      fullWidth
                      size="small"
                      label="宽度"
                      value={safeConfig.width ?? 800}
                      onChange={(value) => updateConfig("width", value || 800)}
                      min={100}
                      step={10}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <NumberField
                      fullWidth
                      size="small"
                      label="高度"
                      value={safeConfig.height ?? 600}
                      onChange={(value) => updateConfig("height", value || 600)}
                      min={100}
                      step={10}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          </TabPanel>
        </Box>

        {/* 添加图层对话框 */}
        <Dialog
          open={addLayerDialogOpen}
          onClose={() => {
            setAddLayerDialogOpen(false);
            setLayerSearchQuery("");
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>选择几何图形类型</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              size="small"
              placeholder="搜索图层类型..."
              value={layerSearchQuery}
              onChange={(e) => setLayerSearchQuery(e.target.value)}
              sx={{ mb: 2, mt: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <List sx={{ maxHeight: 400, overflow: "auto" }}>
              {availableLayerTypes
                .filter(
                  (layerType) =>
                    layerType.label
                      .toLowerCase()
                      .includes(layerSearchQuery.toLowerCase()) ||
                    layerType.type
                      .toLowerCase()
                      .includes(layerSearchQuery.toLowerCase())
                )
                .map((layerType) => (
                  <ListItem key={layerType.type} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        handleAddLayer(layerType.type);
                        setLayerSearchQuery("");
                      }}
                    >
                      <ListItemText
                        primary={layerType.label}
                        secondary={layerType.type}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setAddLayerDialogOpen(false);
                setLayerSearchQuery("");
              }}
            >
              取消
            </Button>
          </DialogActions>
        </Dialog>

        {/* 添加标度对话框 */}
        <Dialog
          open={addScaleDialogOpen}
          onClose={() => {
            setAddScaleDialogOpen(false);
            setScaleSearchQuery("");
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>选择标度类型</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              size="small"
              placeholder="搜索标度类型..."
              value={scaleSearchQuery}
              onChange={(e) => setScaleSearchQuery(e.target.value)}
              sx={{ mb: 2, mt: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <List sx={{ maxHeight: 400, overflow: "auto" }}>
              {availableScaleTypes
                .filter(
                  (scaleType) =>
                    scaleType.label
                      .toLowerCase()
                      .includes(scaleSearchQuery.toLowerCase()) ||
                    scaleType.type
                      .toLowerCase()
                      .includes(scaleSearchQuery.toLowerCase())
                )
                .map((scaleType) => (
                  <ListItem key={scaleType.type} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        handleAddScale(scaleType.type);
                        setScaleSearchQuery("");
                      }}
                    >
                      <ListItemText
                        primary={scaleType.label}
                        secondary={scaleType.type}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddScaleDialogOpen(false)}>取消</Button>
          </DialogActions>
        </Dialog>

        {/* 添加主题对话框 */}
        <Dialog
          open={addThemeDialogOpen}
          onClose={() => setAddThemeDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>选择主题类型</DialogTitle>
          <DialogContent>
            {availableThemeTypesToAdd.length > 0 ? (
              <List>
                {availableThemeTypesToAdd.map((themeType) => (
                  <ListItem key={themeType.type} disablePadding>
                    <ListItemButton
                      onClick={() =>
                        handleAddTheme(themeType.type as ThemeConfig["type"])
                      }
                    >
                      <ListItemText
                        primary={themeType.label}
                        secondary={themeType.type}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  所有主题类型已添加
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddThemeDialogOpen(false)}>取消</Button>
          </DialogActions>
        </Dialog>

        {/* 添加指南对话框 */}
        <Dialog
          open={addGuideDialogOpen}
          onClose={() => setAddGuideDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>添加指南</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>选择美学映射</InputLabel>
                <Select
                  value={selectedGuideKey || ""}
                  onChange={(e) => setSelectedGuideKey(e.target.value)}
                  label="选择美学映射"
                >
                  {availableAestheticsTypes
                    .filter(
                      (aes) => !safeConfig.guides || !safeConfig.guides[aes]
                    )
                    .map((aes) => (
                      <MenuItem key={aes} value={aes}>
                        {aes}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">
                选择指南类型
              </Typography>
              <List>
                {availableGuideTypes.map((guideType) => (
                  <ListItem key={guideType.type} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        if (selectedGuideKey) {
                          handleAddGuide(
                            selectedGuideKey,
                            guideType.type as GuideItemConfig["type"]
                          );
                        }
                      }}
                      disabled={!selectedGuideKey}
                    >
                      <ListItemText
                        primary={guideType.label}
                        secondary={guideType.type}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddGuideDialogOpen(false)}>取消</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};
