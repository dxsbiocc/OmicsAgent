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
  TextField,
  InputAdornment,
  Grid,
} from "@mui/material";
import { Add, Delete, Search } from "@mui/icons-material";
import { NumberField } from "@/components/common";
import Iconify from "@/components/common/Iconify";
import {
  CirclizeConfig,
  Track,
  CircosInitializeConfig,
  GenomicConfig,
} from "./type";
import {
  availableTrackTypes,
  availableInitializeTypes,
} from "./common/constants";
import { DynamicParams } from "../ggplot2/common/DynamicParams";
import { commonTrackParams, commonInitializeParams } from "./common/constants";
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

interface CirclizeComponentProps {
  config: CirclizeConfig;
  onChange: (config: CirclizeConfig) => void;
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
      id={`circlize-tabpanel-${index}`}
      aria-labelledby={`circlize-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

export const CirclizeComponent: React.FC<CirclizeComponentProps> = ({
  config,
  onChange,
  columns,
}) => {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);
  const [addTrackDialogOpen, setAddTrackDialogOpen] = useState(false);
  const [trackSearchQuery, setTrackSearchQuery] = useState("");
  const [addInitializeDialogOpen, setAddInitializeDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const safeConfig = useMemo(() => {
    return {
      initialize: config.initialize || undefined,
      tracks: config.tracks || [],
      width: config.width ?? 800,
      height: config.height ?? 600,
      title: config.title || "",
    };
  }, [config]);

  const updateConfig = useCallback(
    (key: string, value: any) => {
      onChange({ ...safeConfig, [key]: value } as CirclizeConfig);
    },
    [safeConfig, onChange]
  );

  // 创建新轨道
  const createTrack = useCallback((trackType: string): Track => {
    return {
      type: trackType,
      arguments: {},
    };
  }, []);

  // 处理添加轨道
  const handleAddTrack = useCallback(
    (trackType: string) => {
      const newTrack = createTrack(trackType);
      const newTracks = [...(safeConfig.tracks || []), newTrack];
      updateConfig("tracks", newTracks);
      setSelectedTrackIndex(newTracks.length - 1);
      setAddTrackDialogOpen(false);
    },
    [safeConfig.tracks, updateConfig, createTrack]
  );

  const removeTrack = useCallback(
    (index: number) => {
      const currentTracks = safeConfig.tracks || [];
      const newTracks = currentTracks.filter((_, i) => i !== index);
      updateConfig("tracks", newTracks);
      if (selectedTrackIndex >= newTracks.length) {
        setSelectedTrackIndex(Math.max(0, newTracks.length - 1));
      }
    },
    [safeConfig.tracks, updateConfig, selectedTrackIndex]
  );

  const updateTrack = useCallback(
    (index: number, track: Track) => {
      const currentTracks = safeConfig.tracks || [];
      const newTracks = [...currentTracks];
      newTracks[index] = track;
      updateConfig("tracks", newTracks);
    },
    [safeConfig.tracks, updateConfig]
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

  // 处理轨道拖拽结束
  const handleTrackDragEnd = useCallback(
    (event: DragEndEvent) => {
      handleDragEnd(event);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const currentTracks = safeConfig.tracks || [];
      const oldIndex = currentTracks.findIndex(
        (_, i) => `track-${i}` === active.id
      );
      const newIndex = currentTracks.findIndex(
        (_, i) => `track-${i}` === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newTracks = arrayMove(currentTracks, oldIndex, newIndex);
        updateConfig("tracks", newTracks);

        // 更新选中的轨道索引
        if (selectedTrackIndex === oldIndex) {
          setSelectedTrackIndex(newIndex);
        } else if (
          selectedTrackIndex > oldIndex &&
          selectedTrackIndex <= newIndex
        ) {
          setSelectedTrackIndex(selectedTrackIndex - 1);
        } else if (
          selectedTrackIndex < oldIndex &&
          selectedTrackIndex >= newIndex
        ) {
          setSelectedTrackIndex(selectedTrackIndex + 1);
        }
      }
    },
    [safeConfig.tracks, updateConfig, selectedTrackIndex, handleDragEnd]
  );

  // 处理初始化配置
  const handleAddInitialize = useCallback(
    (initializeType: string) => {
      const newInitialize: CircosInitializeConfig | GenomicConfig = {
        type: initializeType as
          | "circos.initialize"
          | "circos.genomicInitialize",
        arguments: {},
      };
      updateConfig("initialize", newInitialize);
      setAddInitializeDialogOpen(false);
    },
    [updateConfig]
  );

  const handleRemoveInitialize = useCallback(() => {
    updateConfig("initialize", undefined);
  }, [updateConfig]);

  const updateInitialize = useCallback(
    (initialize: CircosInitializeConfig | GenomicConfig) => {
      updateConfig("initialize", initialize);
    },
    [updateConfig]
  );

  // 渲染轨道配置
  const renderTrackConfig = () => {
    const currentTracks = safeConfig.tracks || [];
    if (currentTracks.length === 0) {
      return null;
    }

    const selectedTrack = currentTracks[selectedTrackIndex];
    if (!selectedTrack) return null;

    // 根据轨道类型获取对应的参数配置
    const availableParams = commonTrackParams;

    return (
      <Paper sx={{ p: 2 }} elevation={1}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
          轨道参数
        </Typography>
        <DynamicParams
          availableParams={availableParams}
          value={selectedTrack.arguments || {}}
          onChange={(args) =>
            updateTrack(selectedTrackIndex, {
              ...selectedTrack,
              arguments: args,
            })
          }
        />
      </Paper>
    );
  };

  // 渲染初始化配置
  const renderInitializeConfig = () => {
    if (!safeConfig.initialize) {
      return null;
    }

    return (
      <Paper sx={{ p: 2 }} elevation={1}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
          初始化参数
        </Typography>
        <DynamicParams
          availableParams={commonInitializeParams}
          value={safeConfig.initialize.arguments || {}}
          onChange={(args) =>
            updateInitialize({
              ...safeConfig.initialize,
              arguments: args,
            } as CircosInitializeConfig | GenomicConfig)
          }
        />
      </Paper>
    );
  };

  // 过滤轨道类型
  const filteredTrackTypes = useMemo(() => {
    if (!trackSearchQuery) return availableTrackTypes;
    const query = trackSearchQuery.toLowerCase();
    return availableTrackTypes.filter(
      (type) =>
        type.type.toLowerCase().includes(query) ||
        type.label.toLowerCase().includes(query)
    );
  }, [trackSearchQuery]);

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
            <Tab label="初始化" />
            <Tab label="轨道" />
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
          {/* 初始化配置 */}
          <TabPanel value={selectedTab} index={0}>
            <Stack spacing={2}>
              {safeConfig.initialize ? (
                <>
                  {renderInitializeConfig()}
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleRemoveInitialize}
                  >
                    删除初始化配置
                  </Button>
                </>
              ) : (
                <Paper sx={{ p: 2 }} elevation={1}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    尚未配置初始化，请先添加初始化配置
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setAddInitializeDialogOpen(true)}
                  >
                    添加初始化配置
                  </Button>
                </Paper>
              )}
            </Stack>
          </TabPanel>

          {/* 轨道配置 */}
          <TabPanel value={selectedTab} index={1}>
            <Stack spacing={2}>
              <Paper sx={{ p: 2 }} elevation={1}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  轨道配置
                </Typography>

                {safeConfig.tracks && safeConfig.tracks.length > 0 ? (
                  <>
                    {/* 轨道顺序拖拽区域 */}
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        轨道顺序（拖拽调整）
                      </Typography>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleTrackDragEnd}
                      >
                        <SortableContext
                          items={safeConfig.tracks.map((_, i) => `track-${i}`)}
                          strategy={verticalListSortingStrategy}
                        >
                          <Stack spacing={1}>
                            {safeConfig.tracks.map((track, index) => {
                              const trackTypeInfo = availableTrackTypes.find(
                                (tt) => tt.type === track.type
                              );
                              const trackLabel = trackTypeInfo
                                ? trackTypeInfo.label
                                : track.type;
                              return (
                                <DraggableChip
                                  key={`track-${index}`}
                                  id={`track-${index}`}
                                  index={index}
                                  item={track}
                                  label={trackLabel}
                                  isSelected={index === selectedTrackIndex}
                                  onClick={() => setSelectedTrackIndex(index)}
                                  icon="mdi:circle-outline"
                                />
                              );
                            })}
                          </Stack>
                        </SortableContext>
                        <DragOverlay>
                          {activeId && activeId.startsWith("track-") ? (
                            <Box
                              sx={{
                                opacity: 0.95,
                                transform: "rotate(2deg) scale(1.05)",
                                boxShadow: 6,
                              }}
                            >
                              <Paper
                                sx={{
                                  p: 1,
                                  minWidth: 200,
                                  borderRadius: 2,
                                }}
                              >
                                <Typography variant="body2">
                                  拖拽中...
                                </Typography>
                              </Paper>
                            </Box>
                          ) : null}
                        </DragOverlay>
                      </DndContext>
                    </Box>

                    {/* 轨道配置区域 */}
                    {renderTrackConfig()}

                    {/* 删除当前轨道按钮 */}
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => removeTrack(selectedTrackIndex)}
                    >
                      删除当前轨道
                    </Button>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    暂无轨道，请添加轨道
                  </Typography>
                )}

                {/* 添加轨道按钮 */}
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setAddTrackDialogOpen(true)}
                  sx={{ mt: 2 }}
                >
                  添加轨道
                </Button>
              </Paper>
            </Stack>
          </TabPanel>

          {/* 其他配置 */}
          <TabPanel value={selectedTab} index={2}>
            <Stack spacing={2}>
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

              <Paper sx={{ p: 2 }} elevation={1}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  标题
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="标题"
                  value={safeConfig.title || ""}
                  onChange={(e) => updateConfig("title", e.target.value)}
                />
              </Paper>
            </Stack>
          </TabPanel>
        </Box>

        {/* 添加轨道对话框 */}
        <Dialog
          open={addTrackDialogOpen}
          onClose={() => setAddTrackDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>添加轨道</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              size="small"
              placeholder="搜索轨道类型..."
              value={trackSearchQuery}
              onChange={(e) => setTrackSearchQuery(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Stack spacing={1}>
              {filteredTrackTypes.map((trackType) => (
                <Button
                  key={trackType.type}
                  variant="outlined"
                  fullWidth
                  onClick={() => handleAddTrack(trackType.type)}
                  startIcon={<Iconify icon="mdi:circle-outline" />}
                >
                  {trackType.label}
                </Button>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddTrackDialogOpen(false)}>取消</Button>
          </DialogActions>
        </Dialog>

        {/* 添加初始化配置对话框 */}
        <Dialog
          open={addInitializeDialogOpen}
          onClose={() => setAddInitializeDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>添加初始化配置</DialogTitle>
          <DialogContent>
            <Stack spacing={1}>
              {availableInitializeTypes.map((initType) => (
                <Button
                  key={initType.type}
                  variant="outlined"
                  fullWidth
                  onClick={() => handleAddInitialize(initType.type)}
                  startIcon={<Iconify icon="mdi:circle-outline" />}
                >
                  {initType.label}
                </Button>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddInitializeDialogOpen(false)}>
              取消
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};
