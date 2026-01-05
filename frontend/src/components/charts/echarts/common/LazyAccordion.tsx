import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";

// 懒加载 Accordion 组件
interface LazyAccordionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  disabled?: boolean;
  expanded?: boolean;
  onChange?: (event: React.SyntheticEvent, isExpanded: boolean) => void;
}

const LazyAccordion: React.FC<LazyAccordionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = false,
  disabled = false,
  expanded: controlledExpanded,
  onChange: controlledOnChange,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [hasRendered, setHasRendered] = useState(defaultExpanded);
  const [isSticky, setIsSticky] = useState(false);
  const accordionRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // 使用受控状态或内部状态
  const expanded =
    controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleChange = useCallback(
    (event: React.SyntheticEvent, isExpanded: boolean) => {
      if (controlledOnChange) {
        // 受控模式：调用外部 onChange
        controlledOnChange(event, isExpanded);
      } else {
        // 非受控模式：使用内部状态
        setInternalExpanded(isExpanded);
      }

      if (isExpanded && !hasRendered) {
        setHasRendered(true);
      }
    },
    [controlledOnChange, hasRendered]
  );

  // 监听滚动事件，实现粘性标题栏
  useEffect(() => {
    if (!expanded || !accordionRef.current || !summaryRef.current) {
      setIsSticky(false);
      return;
    }

    const handleScroll = () => {
      if (!accordionRef.current || !summaryRef.current) return;

      const accordionRect = accordionRef.current.getBoundingClientRect();
      const summaryRect = summaryRef.current.getBoundingClientRect();

      // 当标题栏滚动到视口顶部时，启用粘性效果
      const shouldBeSticky = summaryRect.top <= 0 && accordionRect.bottom > 0;
      setIsSticky(shouldBeSticky);
    };

    // 监听窗口滚动
    window.addEventListener("scroll", handleScroll, { passive: true });

    // 初始检查
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [expanded]);

  const content = useMemo(() => {
    if (!hasRendered) {
      return null;
    }
    return children;
  }, [hasRendered, children]);

  return (
    <>
      <Accordion
        ref={accordionRef}
        expanded={expanded}
        onChange={handleChange}
        disabled={disabled}
        sx={{
          "&.Mui-disabled": {
            backgroundColor: "rgba(0, 0, 0, 0.02)",
          },
          // 当粘性时，移除默认的阴影和边框
          ...(isSticky && {
            boxShadow: "none",
            "&::before": {
              display: "none",
            },
          }),
        }}
      >
        <AccordionSummary
          ref={summaryRef}
          expandIcon={<ExpandMoreIcon />}
          sx={{
            minHeight: 48,
            "&.Mui-expanded": {
              minHeight: 48,
            },
            "& .MuiAccordionSummary-content": {
              margin: "12px 0",
              "&.Mui-expanded": {
                margin: "12px 0",
              },
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {icon}
            <Typography variant="h6">{title}</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 2, pb: 0, pr: 1 }}>
          {/* 内容区域，设置最大高度和滚动 */}
          <Box
            sx={{
              maxHeight: expanded ? "70vh" : "none",
              overflowY: expanded ? "auto" : "visible",
              overflowX: "hidden",
              // 自动隐藏滚动条
              scrollbarWidth: "none", // Firefox
              "&::-webkit-scrollbar": {
                display: "none", // Chrome, Safari, Edge
              },
              // 组件和滚动条之间的间距
              paddingRight: expanded ? "8px" : 0,
            }}
          >
            {content}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* 粘性标题栏 */}
      {isSticky && (
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            borderRadius: 0,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1,
              minHeight: 48,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {icon}
              <Typography variant="h6">{title}</Typography>
            </Box>
            <Box
              onClick={(e) => handleChange(e, false)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                cursor: "pointer",
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
                "&:active": {
                  backgroundColor: "action.selected",
                },
              }}
            >
              <ExpandMoreIcon
                sx={{
                  transform: "rotate(180deg)",
                  transition: "transform 0.2s",
                }}
              />
            </Box>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default LazyAccordion;
