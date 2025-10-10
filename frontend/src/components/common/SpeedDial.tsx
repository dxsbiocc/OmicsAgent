"use client";

import { useState, useEffect, useRef } from "react";
import { SpeedDial, SpeedDialAction, Box } from "@mui/material";
import Image from "next/image";
import speedDialStyles from "../../../styles/common/speeddial-animations.module.css";

// 4个小孩角色数据
const cartoonChildren = [
  {
    id: "yellow_hair_boy",
    name: "黄发男孩",
    baseAvatar: "/images/cartoon/yellow_hair_boy-1.svg",
    description: "活泼的黄发小男孩",
  },
  {
    id: "red_hair_boy",
    name: "红发男孩",
    baseAvatar: "/images/cartoon/red_hair_boy-1.svg",
    description: "聪明的红发小男孩",
  },
  {
    id: "black_hair_girl",
    name: "黑发女孩",
    baseAvatar: "/images/cartoon/black_hair_girl-1.svg",
    description: "可爱的黑发小女孩",
  },
  {
    id: "yellow_hair_girl",
    name: "黄发女孩",
    baseAvatar: "/images/cartoon/yellow_hair_girl-1.svg",
    description: "甜美的黄发小女孩",
  },
];

// 时辰对应的图片序号 (0-11 对应 1-12)
const getTimeBasedImageIndex = (currentTime: Date) => {
  const hour = currentTime.getHours();
  return hour % 12; // 0-11
};

export default function SpeedDialComponent() {
  const [open, setOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState(cartoonChildren[0]);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // 拖拽相关状态
  const minMargin = 16; // 与边缘的最小间距（px）
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const pointerIdRef = useRef<number | null>(null);
  const dragStartedRef = useRef<boolean>(false);

  // 初始化时间（仅在客户端）
  useEffect(() => {
    setCurrentTime(new Date());
  }, []);

  // 每分钟更新一次时间，确保时辰变化时图片能更新
  useEffect(() => {
    if (!currentTime) return;

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 每分钟更新一次

    return () => clearInterval(timer);
  }, [currentTime]);

  // 初始化到右下角位置（仅在客户端）
  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const el = wrapperRef.current;
      const elWidth = el?.offsetWidth ?? 72;
      const elHeight = el?.offsetHeight ?? 72;
      const x = Math.max(minMargin, width - elWidth - minMargin);
      const y = Math.max(minMargin, height - elHeight - minMargin);
      setPosition({ x, y });
    };
    init();
    // 延迟再测一次，确保渲染后尺寸正确
    const t = setTimeout(init, 100);
    return () => clearTimeout(t);
  }, []);

  // 在窗口大小变化时，保持组件在可视范围内（仅在客户端）
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const el = wrapperRef.current;
      const elWidth = el?.offsetWidth ?? 72;
      const elHeight = el?.offsetHeight ?? 72;
      setPosition((prev) => ({
        x: Math.min(Math.max(prev.x, minMargin), width - elWidth - minMargin),
        y: Math.min(Math.max(prev.y, minMargin), height - elHeight - minMargin),
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 拖拽处理（Pointer Events）
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      const el = wrapperRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const elWidth = el?.offsetWidth ?? 72;
      const elHeight = el?.offsetHeight ?? 72;
      const nextX = clientX - dragOffsetRef.current.dx;
      const nextY = clientY - dragOffsetRef.current.dy;
      const clampedX = Math.min(
        Math.max(nextX, minMargin),
        width - elWidth - minMargin
      );
      const clampedY = Math.min(
        Math.max(nextY, minMargin),
        height - elHeight - minMargin
      );
      setPosition({ x: clampedX, y: clampedY });
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      dragStartedRef.current = false;
      try {
        if (pointerIdRef.current !== null && wrapperRef.current) {
          wrapperRef.current.releasePointerCapture(pointerIdRef.current);
        }
      } catch {}
      pointerIdRef.current = null;
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("pointermove", onPointerMove, { passive: false });
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
      window.addEventListener("pointerleave", onPointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", onPointerMove as any);
      window.removeEventListener("pointerup", onPointerUp as any);
      window.removeEventListener("pointercancel", onPointerUp as any);
      window.removeEventListener("pointerleave", onPointerUp as any);
    };
  }, [isDragging, minMargin]);

  const onPointerDown = (e: React.PointerEvent) => {
    // 检查是否点击在 SpeedDial 主按钮上
    const target = e.target as HTMLElement;
    const isMainButton =
      target.closest(".MuiFab-primary") &&
      !target.closest(".MuiSpeedDialAction-fab");

    if (isMainButton) {
      const rect = wrapperRef.current?.getBoundingClientRect();
      const dx = e.clientX - (rect?.left ?? 0);
      const dy = e.clientY - (rect?.top ?? 0);
      dragOffsetRef.current = { dx, dy };
      pointerIdRef.current = e.pointerId;
      dragStartedRef.current = true;
      setIsDragging(true);
      setOpen(false); // 拖拽时关闭 SpeedDial
      try {
        wrapperRef.current?.setPointerCapture(e.pointerId);
      } catch {}
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleOpen = () => {
    if (isDragging) return; // 拖拽时不打开
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChildSelect = (child: (typeof cartoonChildren)[0]) => {
    console.log("Child selected:", child.name);
    setSelectedChild(child);
    setOpen(false);
  };

  // 根据时辰获取当前应该显示的图片
  const getCurrentTimeBasedAvatar = (child: (typeof cartoonChildren)[0]) => {
    if (!currentTime) return child.baseAvatar; // 如果时间未初始化，返回基础图片

    const timeIndex = getTimeBasedImageIndex(currentTime);
    // 根据小孩类型和时辰生成对应的图片路径
    if (child.id === "yellow_hair_boy") {
      return `/images/cartoon/yellow_hair_boy-${timeIndex + 1}.svg`;
    } else if (child.id === "red_hair_boy") {
      return `/images/cartoon/red_hair_boy-${timeIndex + 1}.svg`;
    } else if (child.id === "black_hair_girl") {
      return `/images/cartoon/black_hair_girl-${timeIndex + 1}.svg`;
    } else if (child.id === "yellow_hair_girl") {
      return `/images/cartoon/yellow_hair_girl-${timeIndex + 1}.svg`;
    }
    return child.baseAvatar; // 默认返回基础图片
  };

  // 获取小孩对应的动画类名
  const getChildAnimationClass = (childId: string) => {
    switch (childId) {
      case "yellow_hair_boy":
        return speedDialStyles.yellowHairBoy;
      case "red_hair_boy":
        return speedDialStyles.redHairBoy;
      case "black_hair_girl":
        return speedDialStyles.blackHairGirl;
      case "yellow_hair_girl":
        return speedDialStyles.yellowHairGirl;
      default:
        return "";
    }
  };

  return (
    <Box
      ref={wrapperRef}
      className={speedDialStyles.speedDialContainer}
      sx={{
        position: "fixed",
        left: position.x,
        top: position.y,
        right: "auto",
        bottom: "auto",
        zIndex: 1300,
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onPointerDown={onPointerDown}
    >
      {/* Speed Dial 主按钮 - 显示选中的小孩 */}
      <SpeedDial
        className={`${speedDialStyles.speedDialMain} ${speedDialStyles.mainButton}`}
        ariaLabel="选择小孩"
        icon={
          <Box
            className={getChildAnimationClass(selectedChild.id)}
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={getCurrentTimeBasedAvatar(selectedChild)}
              alt={selectedChild.name}
              width={72}
              height={72}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              priority
              loading="eager"
            />
          </Box>
        }
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction="up"
        sx={{
          "& .MuiFab-primary": {
            width: 72,
            height: 72,
            backgroundColor: "transparent !important",
            "&:hover": {
              backgroundColor: "transparent !important",
            },
            "&:active": {
              backgroundColor: "transparent !important",
            },
            "&:focus": {
              backgroundColor: "transparent !important",
            },
            boxShadow: "none !important",
            padding: 0,
          },
        }}
      >
        {cartoonChildren
          .filter((child) => child.id !== selectedChild.id)
          .map((child, index) => (
            <SpeedDialAction
              key={child.id}
              icon={
                <Box
                  className={`${getChildAnimationClass(child.id)}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    src={getCurrentTimeBasedAvatar(child)}
                    alt={child.name}
                    width={64}
                    height={64}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      pointerEvents: "none", // 让点击事件穿透到父元素
                    }}
                    loading="lazy"
                  />
                </Box>
              }
              slotProps={{
                tooltip: {
                  title: child.description,
                },
              }}
              onClick={() => handleChildSelect(child)}
              sx={{
                "& .MuiFab-root": {
                  width: 64,
                  height: 64,
                  backgroundColor: "transparent !important",
                  boxShadow: "none !important",
                  padding: 0,
                  "&:hover": {
                    backgroundColor: "transparent !important",
                  },
                  "&:active": {
                    backgroundColor: "transparent !important",
                  },
                  "&:focus": {
                    backgroundColor: "transparent !important",
                  },
                },
                "& .MuiFab-primary": {
                  backgroundColor: "transparent !important",
                  boxShadow: "none !important",
                  "&:hover": {
                    backgroundColor: "transparent !important",
                  },
                  "&:active": {
                    backgroundColor: "transparent !important",
                  },
                  "&:focus": {
                    backgroundColor: "transparent !important",
                  },
                },
              }}
            />
          ))}
      </SpeedDial>
    </Box>
  );
}
