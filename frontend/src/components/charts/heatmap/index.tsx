"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Add, Delete, Search } from "@mui/icons-material";
import Iconify from "@/components/common/Iconify";
import {
  Heatmap as HeatmapGraphComponent,
  HeatmapConfig,
} from "./graph/heatmap";
import { SingleAnnotation, SingleAnnotationConfig } from "./anno";
import { HeatmapAnnotation, HeatmapAnnotationConfig } from "./graph/annotation";
import { Legend, LegendConfig } from "./graph/legend";
import {
  TransformConfigComponent,
  TransformConfig,
} from "./basic/TransformConfig";
import { DrawConfigComponent, DrawConfig } from "./basic/DrawConfig";
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
import { DraggableChip } from "../ggplot2/utils";

export interface HeatmapFullConfig {
  transform?: TransformConfig;
  heatmap?: HeatmapConfig[];
  annotation?: {
    top?: HeatmapAnnotationConfig[];
    bottom?: HeatmapAnnotationConfig[];
    left?: HeatmapAnnotationConfig[];
    right?: HeatmapAnnotationConfig[];
  };
  legend?: LegendConfig[];
  draw?: DrawConfig;
  width?: number;
  height?: number;
}

interface HeatmapComponentProps {
  config: HeatmapFullConfig;
  onChange: (config: HeatmapFullConfig) => void;
  columns: string[];
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
      id={`heatmap-config-tabpanel-${index}`}
      aria-labelledby={`heatmap-config-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

export const HeatmapComponent: React.FC<HeatmapComponentProps> = ({
  config,
  onChange,
  columns,
}) => {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [selectedHeatmapIndex, setSelectedHeatmapIndex] = useState<number>(0);
  const [addHeatmapDialogOpen, setAddHeatmapDialogOpen] = useState(false);
  const [heatmapSearchQuery, setHeatmapSearchQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const safeConfig = useMemo(() => {
    return {
      transform: config.transform || {},
      heatmap: config.heatmap || [],
      annotation: config.annotation || {},
      legend: config.legend || [],
      draw: {
        ...(config.draw || { order: "h" }),
        // 如果顶层有 width 和 height，合并到 draw 中
        width: config.width ?? config.draw?.width ?? 600,
        height: config.height ?? config.draw?.height ?? 500,
      },
      width: config.width ?? config.draw?.width ?? 600,
      height: config.height ?? config.draw?.height ?? 500,
    };
  }, [config]);

  const updateConfig = useCallback(
    (key: keyof HeatmapFullConfig, value: any) => {
      onChange({ ...safeConfig, [key]: value } as HeatmapFullConfig);
    },
    [safeConfig, onChange]
  );

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // 处理拖拽开始
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // 处理拖拽结束
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
  }, []);

  // 处理热图拖拽结束
  const handleHeatmapDragEnd = useCallback(
    (event: DragEndEvent) => {
      handleDragEnd(event);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const currentHeatmaps = safeConfig.heatmap || [];
      const oldIndex = currentHeatmaps.findIndex(
        (_, i) => `heatmap-${i}` === active.id
      );
      const newIndex = currentHeatmaps.findIndex(
        (_, i) => `heatmap-${i}` === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newHeatmaps = arrayMove(currentHeatmaps, oldIndex, newIndex);
        updateConfig("heatmap", newHeatmaps);

        // 更新选中的热图索引
        if (selectedHeatmapIndex === oldIndex) {
          setSelectedHeatmapIndex(newIndex);
        } else if (
          selectedHeatmapIndex > oldIndex &&
          selectedHeatmapIndex <= newIndex
        ) {
          setSelectedHeatmapIndex(selectedHeatmapIndex - 1);
        } else if (
          selectedHeatmapIndex < oldIndex &&
          selectedHeatmapIndex >= newIndex
        ) {
          setSelectedHeatmapIndex(selectedHeatmapIndex + 1);
        }
      }
    },
    [safeConfig.heatmap, updateConfig, selectedHeatmapIndex, handleDragEnd]
  );

  // 创建新热图
  const createHeatmap = useCallback((): HeatmapConfig => {
    return {
      type: "Heatmap",
      arguments: {
        matrix: [],
        name: "heatmap",
      },
    };
  }, []);

  // 处理添加热图
  const handleAddHeatmap = useCallback(() => {
    const newHeatmap = createHeatmap();
    const newHeatmaps = [...(safeConfig.heatmap || []), newHeatmap];
    updateConfig("heatmap", newHeatmaps);
    setSelectedHeatmapIndex(newHeatmaps.length - 1);
    setAddHeatmapDialogOpen(false);
  }, [safeConfig.heatmap, updateConfig, createHeatmap]);

  // 更新热图
  const updateHeatmap = useCallback(
    (index: number, heatmap: HeatmapConfig) => {
      const currentHeatmaps = safeConfig.heatmap || [];
      const newHeatmaps = [...currentHeatmaps];
      newHeatmaps[index] = heatmap;
      updateConfig("heatmap", newHeatmaps);
    },
    [safeConfig.heatmap, updateConfig]
  );

  // 删除热图
  const removeHeatmap = useCallback(
    (index: number) => {
      const currentHeatmaps = safeConfig.heatmap || [];
      const newHeatmaps = currentHeatmaps.filter((_, i) => i !== index);
      updateConfig("heatmap", newHeatmaps);
      if (selectedHeatmapIndex >= newHeatmaps.length) {
        setSelectedHeatmapIndex(Math.max(0, newHeatmaps.length - 1));
      }
    },
    [safeConfig.heatmap, updateConfig, selectedHeatmapIndex]
  );

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
                display: "none",
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
            <Tab label="Transform" />
            <Tab label="Heatmap" />
            <Tab label="Annotation" />
            <Tab label="Legend" />
            <Tab label="Draw" />
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
          {/* Transform 配置 */}
          <TabPanel value={selectedTab} index={0}>
            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                数据转换配置
              </Typography>
              <TransformConfigComponent
                value={safeConfig.transform}
                onChange={(transform) => updateConfig("transform", transform)}
              />
            </Paper>
          </TabPanel>

          {/* Heatmap 配置 */}
          <TabPanel value={selectedTab} index={1}>
            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                热图配置
              </Typography>

              {safeConfig.heatmap && safeConfig.heatmap.length > 0 ? (
                <>
                  {/* 热图顺序拖拽区域 */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      热图顺序（拖拽调整）
                    </Typography>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleHeatmapDragEnd}
                    >
                      <SortableContext
                        items={safeConfig.heatmap.map((_, i) => `heatmap-${i}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        <Stack spacing={1}>
                          {safeConfig.heatmap.map((heatmap, index) => {
                            const heatmapName =
                              heatmap.arguments?.name || `Heatmap ${index + 1}`;
                            return (
                              <DraggableChip
                                key={`heatmap-${index}`}
                                id={`heatmap-${index}`}
                                index={index}
                                item={heatmap}
                                label={heatmapName}
                                isSelected={index === selectedHeatmapIndex}
                                onClick={() => setSelectedHeatmapIndex(index)}
                                icon="mdi:chart-heatmap"
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
                        {activeId && activeId.startsWith("heatmap-")
                          ? (() => {
                              const dragIndex = parseInt(
                                activeId.replace("heatmap-", "")
                              );
                              const dragHeatmap = safeConfig.heatmap[dragIndex];
                              const heatmapName =
                                dragHeatmap?.arguments?.name ||
                                `Heatmap ${dragIndex + 1}`;
                              return (
                                <Box
                                  sx={{
                                    opacity: 0.95,
                                    transform: "rotate(2deg) scale(1.05)",
                                    boxShadow: 6,
                                    width: "100%",
                                    transition: "none",
                                    borderRadius: "16px",
                                    overflow: "visible",
                                  }}
                                >
                                  <DraggableChip
                                    id={activeId}
                                    index={dragIndex}
                                    item={dragHeatmap}
                                    label={heatmapName}
                                    isSelected={false}
                                    onClick={() => {}}
                                    icon="mdi:chart-heatmap"
                                  />
                                </Box>
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
                      startIcon={<Add />}
                      onClick={() => setAddHeatmapDialogOpen(true)}
                    >
                      添加热图
                    </Button>
                    {safeConfig.heatmap.length > 1 && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => removeHeatmap(selectedHeatmapIndex)}
                      >
                        删除当前热图
                      </Button>
                    )}
                  </Stack>

                  {safeConfig.heatmap[selectedHeatmapIndex] && (
                    <HeatmapGraphComponent
                      value={safeConfig.heatmap[selectedHeatmapIndex]}
                      onChange={(heatmap) =>
                        updateHeatmap(selectedHeatmapIndex, heatmap)
                      }
                    />
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    暂无热图，请添加热图
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => setAddHeatmapDialogOpen(true)}
                  >
                    添加热图
                  </Button>
                </Box>
              )}
            </Paper>
          </TabPanel>

          {/* Annotation 配置 */}
          <TabPanel value={selectedTab} index={2}>
            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                注释配置
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Top Annotation
                  </Typography>
                  <HeatmapAnnotation
                    value={
                      safeConfig.annotation?.top?.[0] || {
                        type: "HeatmapAnnotation",
                        arguments: {},
                      }
                    }
                    onChange={(annotation) => {
                      updateConfig("annotation", {
                        ...safeConfig.annotation,
                        top: [annotation],
                      });
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Bottom Annotation
                  </Typography>
                  <HeatmapAnnotation
                    value={
                      safeConfig.annotation?.bottom?.[0] || {
                        type: "HeatmapAnnotation",
                        arguments: {},
                      }
                    }
                    onChange={(annotation) => {
                      updateConfig("annotation", {
                        ...safeConfig.annotation,
                        bottom: [annotation],
                      });
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Left Annotation
                  </Typography>
                  <HeatmapAnnotation
                    value={
                      safeConfig.annotation?.left?.[0] || {
                        type: "HeatmapAnnotation",
                        arguments: {},
                      }
                    }
                    onChange={(annotation) => {
                      updateConfig("annotation", {
                        ...safeConfig.annotation,
                        left: [annotation],
                      });
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Right Annotation
                  </Typography>
                  <HeatmapAnnotation
                    value={
                      safeConfig.annotation?.right?.[0] || {
                        type: "HeatmapAnnotation",
                        arguments: {},
                      }
                    }
                    onChange={(annotation) => {
                      updateConfig("annotation", {
                        ...safeConfig.annotation,
                        right: [annotation],
                      });
                    }}
                  />
                </Box>
              </Stack>
            </Paper>
          </TabPanel>

          {/* Legend 配置 */}
          <TabPanel value={selectedTab} index={3}>
            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                图例配置
              </Typography>
              {safeConfig.legend && safeConfig.legend.length > 0 ? (
                <Stack spacing={2}>
                  {safeConfig.legend.map((legend, index) => (
                    <Box key={index}>
                      <Legend
                        value={legend}
                        onChange={(updatedLegend) => {
                          const newLegends = [...(safeConfig.legend || [])];
                          newLegends[index] = updatedLegend;
                          updateConfig("legend", newLegends);
                        }}
                      />
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => {
                      const newLegend: LegendConfig = {
                        type: "Legend",
                        arguments: {},
                      };
                      updateConfig("legend", [
                        ...(safeConfig.legend || []),
                        newLegend,
                      ]);
                    }}
                  >
                    添加图例
                  </Button>
                </Stack>
              ) : (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    暂无图例，请添加图例
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => {
                      const newLegend: LegendConfig = {
                        type: "Legend",
                        arguments: {},
                      };
                      updateConfig("legend", [newLegend]);
                    }}
                  >
                    添加图例
                  </Button>
                </Box>
              )}
            </Paper>
          </TabPanel>

          {/* Draw 配置 */}
          <TabPanel value={selectedTab} index={4}>
            <Paper sx={{ p: 2 }} elevation={1}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                绘制配置
              </Typography>
              <DrawConfigComponent
                value={safeConfig.draw}
                onChange={(draw) => {
                  // 更新 draw 配置，同时将 width 和 height 提升到顶层
                  updateConfig("draw", draw);
                  if (draw.width !== undefined) {
                    updateConfig("width", draw.width);
                  }
                  if (draw.height !== undefined) {
                    updateConfig("height", draw.height);
                  }
                }}
              />
            </Paper>
          </TabPanel>
        </Box>

        {/* 添加热图对话框 */}
        <Dialog
          open={addHeatmapDialogOpen}
          onClose={() => {
            setAddHeatmapDialogOpen(false);
            setHeatmapSearchQuery("");
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>添加热图</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              size="small"
              placeholder="搜索..."
              value={heatmapSearchQuery}
              onChange={(e) => setHeatmapSearchQuery(e.target.value)}
              sx={{ mb: 2, mt: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={handleAddHeatmap}>
                  <ListItemText primary="Heatmap" secondary="基础热图" />
                </ListItemButton>
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setAddHeatmapDialogOpen(false);
                setHeatmapSearchQuery("");
              }}
            >
              取消
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};
