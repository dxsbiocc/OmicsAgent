import React, { useMemo, useCallback, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  TextField,
  Paper,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
} from "@mui/material";
import TextStyle from "./TextStyle";
import LineStyle from "./LineStyle";
import {
  MarkAreaComponentOption,
  MarkLineComponentOption,
  MarkPointComponentOption,
} from "echarts";
import MarkData from "./MarkDataPoint";
import ColorPicker from "@/components/common/ColorPicker";
import ItemStyle from "./ItemStyle";

// 符号类型选项
const SYMBOL_OPTIONS = [
  { value: "circle", label: "圆形" },
  { value: "rect", label: "矩形" },
  { value: "roundRect", label: "圆角矩形" },
  { value: "triangle", label: "三角形" },
  { value: "diamond", label: "菱形" },
  { value: "pin", label: "大头针" },
  { value: "arrow", label: "箭头" },
  { value: "none", label: "无" },
];

interface MarkPointProps {
  value?: MarkPointComponentOption;
  onChange?: (value: MarkPointComponentOption) => void;
}
const MarkPoint: React.FC<MarkPointProps> = ({ value, onChange }) => {
  const [isEnabled, setIsEnabled] = useState(() => {
    return !!(value && Object.keys(value).length > 0);
  });

  const safeValue = useMemo(() => {
    if (!value) return {};
    const symbolOffset = value?.symbolOffset;
    const normalizedOffset = Array.isArray(symbolOffset)
      ? symbolOffset
      : typeof symbolOffset === "number"
      ? [symbolOffset, symbolOffset]
      : [0, 0];

    return {
      symbol: value?.symbol || "pin",
      symbolSize: value?.symbolSize || 50,
      symbolRotate: value?.symbolRotate || 0,
      symbolOffset: normalizedOffset as [number, number],
      label: value?.label || { show: false },
      itemStyle: value?.itemStyle || undefined,
      data: value?.data || [],
      z: value?.z || 5,
    };
  }, [value]);

  const updatePoint = useCallback(
    (key: string, newValue: any) => {
      const updated = { ...safeValue, [key]: newValue };
      onChange?.(updated as MarkPointComponentOption);
    },
    [safeValue, onChange]
  );

  const handleToggle = useCallback(() => {
    if (isEnabled) {
      // 关闭时清空数据
      onChange?.({} as MarkPointComponentOption);
    } else {
      // 开启时使用默认数据
      onChange?.(safeValue as MarkPointComponentOption);
    }
    setIsEnabled(!isEnabled);
  }, [isEnabled, onChange, safeValue]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <FormControlLabel
          control={<Switch checked={isEnabled} onChange={handleToggle} />}
          label="启用标记点"
        />
      </Box>

      {isEnabled && (
        <Box>
          <MarkData
            value={safeValue.data as any | any[]}
            onChange={(data) => updatePoint("data", data)}
            label="标记点数据"
            type="point"
          />

          <Stack direction="column" spacing={2} sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              标记点设置
            </Typography>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>标记类型</InputLabel>
                <Select
                  value={
                    Array.isArray(safeValue.symbol)
                      ? safeValue.symbol[0]
                      : safeValue.symbol
                  }
                  onChange={(e) => {
                    updatePoint("symbol", e.target.value);
                  }}
                  size="small"
                  label="标记点"
                >
                  {SYMBOL_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="标记大小"
                type="number"
                fullWidth
                value={
                  Array.isArray(safeValue.symbolSize)
                    ? safeValue.symbolSize[0]
                    : safeValue.symbolSize
                }
                onChange={(e) => {
                  const numVal = parseFloat(e.target.value) || 0;
                  const newSize = Array.isArray(safeValue.symbolSize)
                    ? [numVal, safeValue.symbolSize[1]]
                    : [numVal, numVal];
                  updatePoint("symbolSize", newSize);
                }}
                inputProps={{ min: 0, max: 50, step: 1 }}
                size="small"
              />

              <TextField
                label="标记旋转"
                type="number"
                fullWidth
                value={safeValue.symbolRotate}
                onChange={(e) =>
                  updatePoint("symbolRotate", parseFloat(e.target.value) || 0)
                }
                inputProps={{ min: 0, max: 360, step: 1 }}
                size="small"
              />
            </Stack>
            {/* 偏移量 */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="x轴偏移"
                type="number"
                fullWidth
                value={(safeValue.symbolOffset?.[0] as number) || 0}
                onChange={(e) => {
                  const xOffset = parseFloat(e.target.value) || 0;
                  updatePoint("symbolOffset", [
                    xOffset,
                    safeValue.symbolOffset?.[1] || 0,
                  ]);
                }}
                inputProps={{ min: -100, max: 100, step: 1 }}
                size="small"
              />

              <TextField
                label="y轴偏移"
                type="number"
                fullWidth
                value={(safeValue.symbolOffset?.[1] as number) || 0}
                onChange={(e) => {
                  const yOffset = parseFloat(e.target.value) || 0;
                  updatePoint("symbolOffset", [
                    safeValue.symbolOffset?.[0] || 0,
                    yOffset,
                  ]);
                }}
                inputProps={{ min: -100, max: 100, step: 1 }}
                size="small"
              />
            </Stack>

            <ItemStyle
              value={safeValue.itemStyle as any}
              onChange={(itemStyle) => updatePoint("itemStyle", itemStyle)}
              label="标记点样式"
            />

            {/* 文本样式 */}
            <FormControlLabel
              control={
                <Switch
                  checked={safeValue.label?.show}
                  onChange={(e) =>
                    updatePoint("label", {
                      ...safeValue.label,
                      show: e.target.checked,
                    })
                  }
                />
              }
              label="显示标签"
            />
            {safeValue.label?.show && (
              <TextStyle
                value={safeValue.label as any}
                onChange={(label: any) =>
                  updatePoint("label", {
                    ...label,
                    show: safeValue.label?.show,
                  })
                }
                isLabel={true}
                isMarkLine={true}
                label=""
              />
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

interface MarkLineProps {
  value?: MarkLineComponentOption;
  onChange?: (value: MarkLineComponentOption) => void;
}

const MarkLine: React.FC<MarkLineProps> = ({ value, onChange }) => {
  const [isEnabled, setIsEnabled] = useState(() => {
    return !!(value && Object.keys(value).length > 0);
  });

  // 安全获取值，提供默认值
  const safeValue = useMemo(() => {
    if (!value) return {};
    return {
      symbol: value?.symbol || ["circle", "arrow"],
      symbolSize: value?.symbolSize || [8, 8],
      symbolOffset: value?.symbolOffset || [
        [0, 0],
        [0, 0],
      ],
      precision: value?.precision || 2,
      z: value?.z || 5,
      label: value?.label || { show: false },
      lineStyle: value?.lineStyle || undefined,
      data: value?.data || [],
    };
  }, [value]);

  // 更新样式的回调函数
  const updateStyle = useCallback(
    (key: string, newValue: any) => {
      const updated = { ...safeValue, [key]: newValue };
      onChange?.(updated as MarkLineComponentOption);
    },
    [safeValue, onChange]
  );

  const handleToggle = useCallback(() => {
    if (isEnabled) {
      // 关闭时清空数据
      onChange?.({} as MarkLineComponentOption);
    } else {
      // 开启时使用默认数据
      onChange?.(safeValue as MarkLineComponentOption);
    }
    setIsEnabled(!isEnabled);
  }, [isEnabled, onChange, safeValue]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <FormControlLabel
          control={<Switch checked={isEnabled} onChange={handleToggle} />}
          label="启用标记线"
        />
      </Box>

      {isEnabled && (
        <Stack direction="column" spacing={2}>
          {/* 数据编辑区域 */}
          <MarkData
            value={safeValue.data as any | any[]}
            onChange={(data) => updateStyle("data", data)}
            label="标记线数据"
            type="line"
          />

          {/* 样式配置区域 */}
          <Box sx={{ flex: 1 }}>
            <Stack spacing={3}>
              {/* 符号配置 */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  标记设置
                </Typography>

                {/* 两行两列布局 */}
                <Stack direction="column" spacing={2}>
                  {/* 第一行：起点标记和起点大小 */}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>起点标记</InputLabel>
                      <Select
                        value={
                          Array.isArray(safeValue.symbol)
                            ? safeValue.symbol[0]
                            : safeValue.symbol
                        }
                        onChange={(e) => {
                          const newSymbol = Array.isArray(safeValue.symbol)
                            ? [e.target.value, safeValue.symbol[1]]
                            : [e.target.value, e.target.value];
                          updateStyle("symbol", newSymbol);
                        }}
                        size="small"
                        label="起点标记"
                      >
                        {SYMBOL_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="起点标记大小"
                      type="number"
                      fullWidth
                      value={
                        Array.isArray(safeValue.symbolSize)
                          ? safeValue.symbolSize[0]
                          : safeValue.symbolSize
                      }
                      onChange={(e) => {
                        const numVal = parseFloat(e.target.value) || 0;
                        const newSize = Array.isArray(safeValue.symbolSize)
                          ? [numVal, safeValue.symbolSize[1]]
                          : [numVal, numVal];
                        updateStyle("symbolSize", newSize);
                      }}
                      inputProps={{ min: 0, max: 50, step: 1 }}
                      size="small"
                    />
                  </Box>

                  {/* 第二行：终点标记和终点大小 */}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>终点标记</InputLabel>
                      <Select
                        value={
                          Array.isArray(safeValue.symbol)
                            ? safeValue.symbol[1]
                            : safeValue.symbol
                        }
                        onChange={(e) => {
                          const newSymbol = Array.isArray(safeValue.symbol)
                            ? [safeValue.symbol[0], e.target.value]
                            : [e.target.value, e.target.value];
                          updateStyle("symbol", newSymbol);
                        }}
                        size="small"
                        label="终点标记"
                      >
                        {SYMBOL_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="终点标记大小"
                      type="number"
                      fullWidth
                      value={
                        Array.isArray(safeValue.symbolSize)
                          ? safeValue.symbolSize[1]
                          : safeValue.symbolSize
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        const numVal = parseFloat(e.target.value) || 0;
                        const newSize = Array.isArray(safeValue.symbolSize)
                          ? [safeValue.symbolSize[0], numVal]
                          : [numVal, numVal];
                        updateStyle("symbolSize", newSize);
                      }}
                      inputProps={{ min: 0, max: 50, step: 1 }}
                      size="small"
                    />
                  </Box>
                </Stack>

                {/* 其他设置 */}
                <Typography variant="subtitle2" sx={{ my: 2 }}>
                  其他设置
                </Typography>

                <Stack direction="row" spacing={2}>
                  <Box sx={{ flex: 1, minWidth: "200px" }}>
                    <TextField
                      label="数值精度"
                      type="number"
                      fullWidth
                      value={safeValue.precision}
                      onChange={(e) =>
                        updateStyle(
                          "precision",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      inputProps={{ min: 0, max: 10, step: 1 }}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: "200px" }}>
                    <TextField
                      label="z 值"
                      type="number"
                      fullWidth
                      value={safeValue.z}
                      onChange={(e) =>
                        updateStyle("z", parseFloat(e.target.value) || 0)
                      }
                      inputProps={{ min: 0, max: 100, step: 1 }}
                      size="small"
                    />
                  </Box>
                </Stack>
              </Paper>
              {/* 文本样式 */}
              <FormControlLabel
                control={
                  <Switch
                    checked={safeValue.label?.show}
                    onChange={(e) =>
                      updateStyle("label", {
                        ...safeValue.label,
                        show: e.target.checked,
                      })
                    }
                  />
                }
                label="统一文本样式"
              />
              {safeValue.label?.show && (
                <TextStyle
                  value={safeValue.label as any}
                  onChange={(label: any) =>
                    updateStyle("label", {
                      ...label,
                      show: safeValue.label?.show,
                    })
                  }
                  isLabel={true}
                  isMarkLine={true}
                  label="标记文本"
                />
              )}

              {/* 线条样式 */}
              <FormControlLabel
                control={
                  <Switch
                    checked={!!safeValue.lineStyle}
                    onChange={(e) =>
                      updateStyle("lineStyle", e.target.checked ? {} : null)
                    }
                  />
                }
                label="统一线条样式"
              />
              {safeValue.lineStyle && (
                <LineStyle
                  value={safeValue.lineStyle as any}
                  onChange={(lineStyle: any) =>
                    updateStyle("lineStyle", lineStyle)
                  }
                  label="标记线"
                />
              )}
            </Stack>
          </Box>
        </Stack>
      )}
    </Box>
  );
};

interface MarkAreaProps {
  value?: MarkAreaComponentOption;
  onChange?: (value: MarkAreaComponentOption) => void;
}

const MarkArea: React.FC<MarkAreaProps> = ({ value, onChange }) => {
  const [isEnabled, setIsEnabled] = useState(() => {
    return !!(value && Object.keys(value).length > 0);
  });

  // 安全获取值，提供默认值
  const safeValue = useMemo(() => {
    if (!value) return {};
    return {
      label: value?.label || undefined,
      itemStyle: value?.itemStyle || undefined,
      data: value?.data || undefined,
    };
  }, [value]);

  // 更新样式的回调函数
  const updateArea = useCallback(
    (key: string, newValue: any) => {
      const updated = { ...safeValue, [key]: newValue };
      onChange?.(updated as MarkAreaComponentOption);
    },
    [safeValue, onChange]
  );

  const handleToggle = useCallback(() => {
    if (isEnabled) {
      // 关闭时清空数据
      onChange?.({} as MarkAreaComponentOption);
    } else {
      // 开启时使用默认数据
      onChange?.(safeValue as MarkAreaComponentOption);
    }
    setIsEnabled(!isEnabled);
  }, [isEnabled, onChange, safeValue]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <FormControlLabel
          control={<Switch checked={isEnabled} onChange={handleToggle} />}
          label="启用标记区域"
        />
      </Box>

      {isEnabled && (
        <Stack direction="column" spacing={2}>
          {/* 数据编辑区域 */}
          <MarkData
            value={safeValue.data as any | any[]}
            onChange={(data) => updateArea("data", data)}
            label="标记区域数据"
            type="area"
          />

          {/* 样式配置区域 */}
          <Box sx={{ flex: 1 }}>
            <Stack spacing={3}>
              {/* 文本样式 */}
              <FormControlLabel
                control={
                  <Switch
                    checked={safeValue.label?.show}
                    onChange={(e) =>
                      updateArea("label", {
                        ...safeValue.label,
                        show: e.target.checked,
                      })
                    }
                  />
                }
                label="标签样式"
              />
              {safeValue.label?.show && (
                <TextStyle
                  value={safeValue.label as any}
                  onChange={(label: any) =>
                    updateArea("label", {
                      ...label,
                      show: safeValue.label?.show,
                    })
                  }
                  isLabel={true}
                  label="区域标记文本"
                />
              )}

              {/* item 样式 */}
              <FormControlLabel
                control={
                  <Switch
                    checked={!!safeValue.itemStyle}
                    onChange={(e) =>
                      updateArea("itemStyle", e.target.checked ? {} : null)
                    }
                  />
                }
                label="区域样式"
              />
              {safeValue.itemStyle && (
                <ItemStyle
                  value={safeValue.itemStyle as any}
                  onChange={(itemStyle) => updateArea("itemStyle", itemStyle)}
                  label="区域样式"
                />
              )}
            </Stack>
          </Box>
        </Stack>
      )}
    </Box>
  );
};

interface MarkDataComponentProps {
  markPoint?: MarkPointComponentOption;
  markLine?: MarkLineComponentOption;
  markArea?: MarkAreaComponentOption;
  onChangePoint?: (value: MarkPointComponentOption) => void;
  onChangeLine?: (value: MarkLineComponentOption) => void;
  onChangeArea?: (value: MarkAreaComponentOption) => void;
}

const MarkDataComponent: React.FC<MarkDataComponentProps> = ({
  markPoint,
  markLine,
  markArea,
  onChangePoint,
  onChangeLine,
  onChangeArea,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Paper sx={{ p: 2 }} elevation={3}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="标记配置标签"
        >
          <Tab label="标记点" sx={{ fontWeight: "bold" }} />
          <Tab label="标记线" sx={{ fontWeight: "bold" }} />
          <Tab label="标记区域" sx={{ fontWeight: "bold" }} />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <MarkPoint value={markPoint} onChange={onChangePoint} />
        )}
        {activeTab === 1 && (
          <MarkLine value={markLine} onChange={onChangeLine} />
        )}
        {activeTab === 2 && (
          <MarkArea value={markArea} onChange={onChangeArea} />
        )}
      </Box>
    </Paper>
  );
};

export default MarkDataComponent;
