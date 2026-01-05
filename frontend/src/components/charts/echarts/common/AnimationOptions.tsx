import { useCallback, useMemo } from "react";
import {
  Stack,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import LazyAccordion from "./LazyAccordion";
import { Animation as AnimationIcon } from "@mui/icons-material";

interface AnimationConfigProps {
  value: {
    animation?: boolean;
    animationDuration?: number;
    animationEasing?: string;
    animationDelay?: number;
  };
  onChange: (animation: any) => void;
  defaultExpanded?: boolean;
  disabled?: boolean;
}

const AnimationConfig: React.FC<AnimationConfigProps> = ({
  value,
  onChange,
  defaultExpanded = false,
  disabled = false,
}) => {
  const updateAnimation = useCallback(
    (key: string, newValue: any) => {
      onChange({ ...value, [key]: newValue });
    },
    [value, onChange]
  );

  const animationContent = useMemo(
    () => (
      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Switch
              checked={value.animation !== false}
              onChange={(e) => updateAnimation("animation", e.target.checked)}
            />
          }
          label="启用动画"
        />
        {value.animation !== false && (
          <>
            <Box>
              <Typography gutterBottom>动画时长 (ms)</Typography>
              <Slider
                value={value.animationDuration || 1000}
                onChange={(_, newValue) =>
                  updateAnimation("animationDuration", newValue)
                }
                min={0}
                max={5000}
                step={100}
                valueLabelDisplay="auto"
              />
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel>缓动函数</InputLabel>
              <Select
                value={value.animationEasing || "cubicOut"}
                onChange={(e) =>
                  updateAnimation("animationEasing", e.target.value)
                }
              >
                <MenuItem value="linear">线性</MenuItem>
                <MenuItem value="quadraticIn">二次缓入</MenuItem>
                <MenuItem value="quadraticOut">二次缓出</MenuItem>
                <MenuItem value="quadraticInOut">二次缓入缓出</MenuItem>
                <MenuItem value="cubicIn">三次缓入</MenuItem>
                <MenuItem value="cubicOut">三次缓出</MenuItem>
                <MenuItem value="cubicInOut">三次缓入缓出</MenuItem>
                <MenuItem value="quarticIn">四次缓入</MenuItem>
                <MenuItem value="quarticOut">四次缓出</MenuItem>
                <MenuItem value="quarticInOut">四次缓入缓出</MenuItem>
                <MenuItem value="quinticIn">五次缓入</MenuItem>
                <MenuItem value="quinticOut">五次缓出</MenuItem>
                <MenuItem value="quinticInOut">五次缓入缓出</MenuItem>
                <MenuItem value="sinusoidalIn">正弦缓入</MenuItem>
                <MenuItem value="sinusoidalOut">正弦缓出</MenuItem>
                <MenuItem value="sinusoidalInOut">正弦缓入缓出</MenuItem>
                <MenuItem value="exponentialIn">指数缓入</MenuItem>
                <MenuItem value="exponentialOut">指数缓出</MenuItem>
                <MenuItem value="exponentialInOut">指数缓入缓出</MenuItem>
                <MenuItem value="circularIn">圆形缓入</MenuItem>
                <MenuItem value="circularOut">圆形缓出</MenuItem>
                <MenuItem value="circularInOut">圆形缓入缓出</MenuItem>
                <MenuItem value="elasticIn">弹性缓入</MenuItem>
                <MenuItem value="elasticOut">弹性缓出</MenuItem>
                <MenuItem value="elasticInOut">弹性缓入缓出</MenuItem>
                <MenuItem value="backIn">回退缓入</MenuItem>
                <MenuItem value="backOut">回退缓出</MenuItem>
                <MenuItem value="backInOut">回退缓入缓出</MenuItem>
                <MenuItem value="bounceIn">弹跳缓入</MenuItem>
                <MenuItem value="bounceOut">弹跳缓出</MenuItem>
                <MenuItem value="bounceInOut">弹跳缓入缓出</MenuItem>
              </Select>
            </FormControl>
            <Box>
              <Typography gutterBottom>动画延迟 (ms)</Typography>
              <Slider
                value={value.animationDelay || 0}
                onChange={(_, newValue) =>
                  updateAnimation("animationDelay", newValue)
                }
                min={0}
                max={2000}
                step={50}
                valueLabelDisplay="auto"
              />
            </Box>
          </>
        )}
      </Stack>
    ),
    [value, updateAnimation]
  );

  return (
    <LazyAccordion
      title="动画配置"
      icon={<AnimationIcon />}
      defaultExpanded={defaultExpanded}
      disabled={disabled}
    >
      {animationContent}
    </LazyAccordion>
  );
};
