"use client";

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from "framer-motion";
import React, {
  Children,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "../../../styles/common/dock.css";

export type DockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
};

function DockItem({
  children,
  className = "",
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size,
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`dock-item ${className || ""}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, (child) =>
        React.isValidElement(child)
          ? cloneElement(
              child as React.ReactElement<{ isHovered?: MotionValue<number> }>,
              { isHovered }
            )
          : child
      )}
    </motion.div>
  );
}

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockLabel({ children, className = "", isHovered }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;

    const unsubscribe = isHovered.on("change", (latest) => {
      setIsVisible(latest === 1);
    });

    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`dock-label ${className}`}
          role="tooltip"
          style={{ x: "-50%" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockIcon({ children, className = "" }: DockIconProps) {
  return <div className={`dock-icon ${className}`}>{children}</div>;
}

type DockPosition = {
  x: number;
  y: number;
  orientation: "horizontal" | "vertical";
  side: "top" | "right" | "bottom" | "left";
};

export default function Dock({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 45,
  distance = 150,
  panelHeight = 51,
  dockHeight = 192,
  baseItemSize = 38,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const [dockPosition, setDockPosition] = useState<DockPosition>({
    x: 0,
    y: 0,
    orientation: "vertical",
    side: "right",
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const isDraggingRef = useRef(false);

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [magnification, dockHeight]
  );

  // 计算竖直排列时的高度（包括 padding）
  const verticalHeight = useMemo(
    () => items.length * (baseItemSize + 16) + 16 + 16, // 16px padding top + 16px padding bottom
    [items.length, baseItemSize]
  );

  // 根据排列方向计算容器高度（仅用于水平排列的hover效果）
  const horizontalHeight = useTransform(
    isHovered,
    [0, 1],
    [panelHeight, maxHeight]
  );
  const dynamicHeight = useSpring(horizontalHeight, spring);

  // 计算到三个目标位置的距离，返回最近的位置
  const getNearestPosition = (
    currentX: number,
    currentY: number,
    panelWidth: number,
    panelHeight: number,
    verticalHeight: number
  ): {
    orientation: "horizontal" | "vertical";
    side: "bottom" | "left" | "right";
    targetX: number;
    targetY: number;
  } => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const gap = 16; // 距离边缘的间距（像素）

    // 三个目标位置
    const positions = [
      {
        // 左侧竖直居中
        orientation: "vertical" as const,
        side: "left" as const,
        targetX: gap,
        targetY: windowHeight / 2 - verticalHeight / 2,
      },
      {
        // 右侧竖直居中
        orientation: "vertical" as const,
        side: "right" as const,
        targetX: windowWidth - panelHeight - gap,
        targetY: windowHeight / 2 - verticalHeight / 2,
      },
      {
        // 底部水平居中
        orientation: "horizontal" as const,
        side: "bottom" as const,
        targetX: windowWidth / 2 - panelWidth / 2,
        targetY: windowHeight - panelHeight - gap,
      },
    ];

    // 计算当前位置到每个目标位置的距离
    const distances = positions.map((pos) => {
      const dx = currentX - pos.targetX;
      const dy = currentY - pos.targetY;
      return Math.sqrt(dx * dx + dy * dy);
    });

    // 找到距离最近的位置
    const minDistanceIndex = distances.indexOf(Math.min(...distances));
    return positions[minDistanceIndex];
  };

  // 处理拖拽结束，找到最近的位置并跳转
  const handleDragEnd = () => {
    isDraggingRef.current = false;

    if (!panelRef.current || !containerRef.current) return;

    const panelRect = panelRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // 计算组件尺寸
    const panelWidth =
      panelRect.width || items.length * (baseItemSize + 16) + 32;
    const panelHeight = panelRect.height || 68;
    const verticalHeight = items.length * (baseItemSize + 16) + 16;

    // 当前位置（相对于容器）
    const currentX = panelRect.left - containerRect.left;
    const currentY = panelRect.top - containerRect.top;

    // 找到最近的位置
    const nearestPosition = getNearestPosition(
      currentX,
      currentY,
      panelWidth,
      panelHeight,
      verticalHeight
    );

    // 确保位置在视口范围内
    const effectiveWidth =
      nearestPosition.orientation === "vertical" ? panelHeight : panelWidth;
    const effectiveHeight =
      nearestPosition.orientation === "vertical" ? verticalHeight : panelHeight;
    const maxX = Math.max(0, windowWidth - effectiveWidth);
    const maxY = Math.max(0, windowHeight - effectiveHeight);

    const targetX = Math.max(0, Math.min(maxX, nearestPosition.targetX));
    const targetY = Math.max(0, Math.min(maxY, nearestPosition.targetY));

    const newPosition: DockPosition = {
      x: targetX,
      y: targetY,
      orientation: nearestPosition.orientation,
      side: nearestPosition.side,
    };

    setDockPosition(newPosition);
    x.set(targetX);
    y.set(targetY);
  };

  // 监听窗口大小变化，保持当前排列方式但重新计算位置
  useEffect(() => {
    const handleResize = () => {
      if (!panelRef.current) return;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const panelWidth =
        panelRef.current.offsetWidth || items.length * (baseItemSize + 16) + 32;
      const panelHeight = panelRef.current.offsetHeight || 68;
      const verticalHeight = items.length * (baseItemSize + 16) + 16;

      let targetX = 0;
      let targetY = 0;

      const gap = 16; // 距离边缘的间距（像素）

      // 根据当前排列方式调整位置
      if (dockPosition.orientation === "vertical") {
        if (dockPosition.side === "left") {
          targetX = gap;
        } else {
          targetX = windowWidth - panelHeight - gap;
        }
        targetY = windowHeight / 2 - verticalHeight / 2;
      } else {
        targetX = windowWidth / 2 - panelWidth / 2;
        targetY = windowHeight - panelHeight - gap;
      }

      // 边界检查
      const effectiveWidth =
        dockPosition.orientation === "vertical" ? panelHeight : panelWidth;
      const effectiveHeight =
        dockPosition.orientation === "vertical" ? verticalHeight : panelHeight;
      const maxX = Math.max(0, windowWidth - effectiveWidth);
      const maxY = Math.max(0, windowHeight - effectiveHeight);

      targetX = Math.max(0, Math.min(maxX, targetX));
      targetY = Math.max(0, Math.min(maxY, targetY));

      const newPosition: DockPosition = {
        x: targetX,
        y: targetY,
        orientation: dockPosition.orientation,
        side: dockPosition.side,
      };

      setDockPosition(newPosition);
      x.set(targetX);
      y.set(targetY);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [
    items.length,
    baseItemSize,
    x,
    y,
    dockPosition.orientation,
    dockPosition.side,
  ]);

  // 初始化位置 - 默认底部水平居中
  useEffect(() => {
    const initPosition = () => {
      if (!panelRef.current) return;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // 等待 DOM 更新后再获取宽度
      const checkPosition = () => {
        if (!panelRef.current) return;

        // 尝试获取实际宽度，如果无法获取则使用估算值
        const panelWidth =
          panelRef.current.offsetWidth ||
          items.length * (baseItemSize + 16) + 32;

        // 默认右侧竖直居中
        const gap = 16; // 距离边缘的间距（像素）
        const verticalHeight = items.length * (baseItemSize + 16) + 16;
        const initialX = windowWidth - panelHeight - gap;
        const initialY = windowHeight / 2 - verticalHeight / 2;

        // 确保位置在视口范围内（竖直排列时，宽度是 panelHeight，高度是 verticalHeight）
        const minX = 0;
        const maxX = Math.max(0, windowWidth - panelHeight);
        const minY = 0;
        const maxY = Math.max(0, windowHeight - verticalHeight);

        const finalX = Math.max(minX, Math.min(maxX, initialX));
        const finalY = Math.max(minY, Math.min(maxY, initialY));

        const initialPosition: DockPosition = {
          x: finalX,
          y: finalY,
          orientation: "vertical",
          side: "right",
        };

        setDockPosition(initialPosition);
        x.set(finalX);
        y.set(finalY);
      };

      // 使用多个 requestAnimationFrame 确保 DOM 完全渲染
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          checkPosition();
        });
      });
    };

    // 延迟初始化，确保 DOM 已渲染
    const timer = setTimeout(initPosition, 50);
    return () => clearTimeout(timer);
  }, [panelHeight, items.length, baseItemSize, x, y]);

  // 使用容器作为拖拽约束的参考点，确保组件不会移出视口
  // 容器覆盖整个屏幕，这样可以确保组件始终可见

  return (
    <motion.div
      ref={containerRef}
      style={{
        height: "100vh",
        width: "100vw",
        scrollbarWidth: "none",
        position: "fixed",
        top: 0,
        left: 0,
      }}
      className="dock-outer"
    >
      <motion.div
        ref={panelRef}
        drag
        dragMomentum={false}
        dragElastic={0.05}
        dragPropagation={false}
        onDrag={(_, info) => {
          // 在拖拽过程中实时更新位置，并限制在视口内
          const currentX = x.get() + info.delta.x;
          const currentY = y.get() + info.delta.y;

          if (!panelRef.current) return;

          const panelRect = panelRef.current.getBoundingClientRect();
          // 竖直排列时，高度应该是实际渲染高度；水平排列时，高度固定为 panelHeight
          const effectiveHeight =
            dockPosition.orientation === "vertical"
              ? panelRect.height || verticalHeight
              : panelRect.height || 68;
          const effectiveWidth =
            dockPosition.orientation === "vertical"
              ? panelRect.width || 68
              : panelRect.width || items.length * (baseItemSize + 16) + 32;

          // 限制在视口范围内
          const maxX = Math.max(0, window.innerWidth - effectiveWidth);
          const maxY = Math.max(0, window.innerHeight - effectiveHeight);

          const clampedX = Math.max(0, Math.min(maxX, currentX));
          const clampedY = Math.max(0, Math.min(maxY, currentY));

          x.set(clampedX);
          y.set(clampedY);
        }}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={handleDragEnd}
        onMouseMove={({ pageX }) => {
          if (!isDraggingRef.current) {
            isHovered.set(1);
            mouseX.set(pageX);
          }
        }}
        onMouseLeave={() => {
          if (!isDraggingRef.current) {
            isHovered.set(0);
            mouseX.set(Infinity);
          }
        }}
        className={`dock-panel ${className || ""} ${
          dockPosition.orientation === "vertical" ? "dock-vertical" : ""
        } dock-${dockPosition.side}`.trim()}
        style={{
          height:
            dockPosition.orientation === "vertical"
              ? "fit-content"
              : panelHeight,
          x,
          y,
        }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}
