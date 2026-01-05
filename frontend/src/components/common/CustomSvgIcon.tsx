import React, { memo, useMemo } from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";

interface CustomSvgIconProps extends Omit<SvgIconProps, "children"> {
  svg: string;
  viewBox?: string;
}

/**
 * 通用 SVG 图标组件
 * 将 SVG 代码字符串转换为 React 组件，基于 MUI 的 SvgIcon
 *
 * @example
 * ```tsx
 * <CustomSvgIcon
 *   svg='<path d="M12 2L2 7v10l10 5 10-5V7l-10-5z"/>'
 *   viewBox="0 0 24 24"
 *   color="primary"
 * />
 * ```
 */
const CustomSvgIcon: React.FC<CustomSvgIconProps> = ({
  svg,
  viewBox = "0 0 24 24",
  ...props
}) => {
  // 解析 SVG 字符串并提取子元素
  const svgChildren = useMemo(() => {
    if (!svg) return null;

    // 移除外层的 <svg> 标签，只保留内部内容
    let content = svg.trim();

    // 如果包含 <svg> 标签，提取内部内容
    const svgMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    if (svgMatch) {
      content = svgMatch[1];
    }

    // 使用 dangerouslySetInnerHTML 渲染 SVG 内容
    // 注意：这需要确保 SVG 内容来自可信源
    return <g dangerouslySetInnerHTML={{ __html: content }} />;
  }, [svg]);

  return (
    <SvgIcon {...props} viewBox={viewBox}>
      {svgChildren}
    </SvgIcon>
  );
};

export const MiniLogoIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 200 200">
      <defs>
        <linearGradient id="miniLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2DD4BF" stopOpacity={1} />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity={1} />
        </linearGradient>
      </defs>
      <path
        d="M50,160 C30,160 20,130 25,100 C30,50 60,30 100,30 C140,30 170,50 175,100 C180,130 170,160 150,160 L50,160 Z"
        fill="url(#miniLogoGrad)"
      />
      <circle cx="70" cy="80" r="12" fill="#fff" />
      <circle cx="130" cy="80" r="12" fill="#fff" />
    </SvgIcon>
  );
};

export const OmicsLogoIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 200 200">
      <defs>
        <linearGradient id="bodyWhite" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={1}></stop>
          <stop offset="100%" stopColor="#F1F5F9" stopOpacity={1}></stop>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur
            stdDeviation="2.5"
            result="coloredBlur"
          ></feGaussianBlur>
          <feMerge>
            <feMergeNode in="coloredBlur"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
      </defs>

      <circle cx="50" cy="50" r="18" fill="#334155"></circle>
      <circle cx="150" cy="50" r="18" fill="#334155"></circle>

      <path
        d="M50,160 C30,160 20,130 25,100 C30,50 60,40 100,40 C140,40 170,50 175,100 C180,130 170,160 150,160 L50,160 Z"
        fill="url(#bodyWhite)"
        stroke="#e2e8f0"
        stroke-width="1"
      ></path>

      <ellipse cx="45" cy="155" rx="18" ry="12" fill="#334155"></ellipse>
      <ellipse cx="155" cy="155" rx="18" ry="12" fill="#334155"></ellipse>

      <ellipse
        cx="70"
        cy="120"
        rx="12"
        ry="10"
        fill="#334155"
        transform="rotate(-20, 70, 120)"
      ></ellipse>
      <ellipse
        cx="130"
        cy="120"
        rx="12"
        ry="10"
        fill="#334155"
        transform="rotate(20, 130, 120)"
      ></ellipse>

      <ellipse
        cx="100"
        cy="115"
        rx="35"
        ry="28"
        fill="#F8FAFC"
        opacity="0.8"
      ></ellipse>

      <ellipse
        cx="70"
        cy="85"
        rx="16"
        ry="20"
        fill="#334155"
        transform="rotate(-15, 70, 85)"
      ></ellipse>
      <ellipse
        cx="130"
        cy="85"
        rx="16"
        ry="20"
        fill="#334155"
        transform="rotate(15, 130, 85)"
      ></ellipse>

      <circle cx="72" cy="85" r="5" fill="#2DD4BF" filter="url(#glow)"></circle>
      <circle
        cx="128"
        cy="85"
        r="5"
        fill="#8B5CF6"
        filter="url(#glow)"
      ></circle>

      <path d="M94,102 Q100,106 106,102 L100,110 Z" fill="#334155"></path>
    </SvgIcon>
  );
};

export const OmicsMiniLogoIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="90" fill="#f1f5f9"></circle>
      <circle cx="40" cy="40" r="25" fill="#334155"></circle>
      <circle cx="160" cy="40" r="25" fill="#334155"></circle>
      <ellipse
        cx="70"
        cy="90"
        rx="20"
        ry="25"
        fill="#334155"
        transform="rotate(-15, 70, 90)"
      ></ellipse>
      <ellipse
        cx="130"
        cy="90"
        rx="20"
        ry="25"
        fill="#334155"
        transform="rotate(15, 130, 90)"
      ></ellipse>
      <circle cx="72" cy="85" r="5" fill="#2DD4BF"></circle>
      <circle cx="128" cy="85" r="5" fill="#8B5CF6"></circle>
    </SvgIcon>
  );
};

export const OmicsArtistLogoIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 200 200">
      {/* Panda Base */}
      <circle cx="50" cy="50" r="18" fill="#334155" />
      <circle cx="150" cy="50" r="18" fill="#334155" />
      <path
        d="M50,160 C30,160 20,130 25,100 C30,50 60,40 100,40 C140,40 170,50 175,100 C180,130 170,160 150,160 L50,160 Z"
        fill="#F8FAFC"
        stroke="#e2e8f0"
        strokeWidth="1"
      />
      <ellipse cx="45" cy="155" rx="18" ry="12" fill="#334155" />
      <ellipse cx="155" cy="155" rx="18" ry="12" fill="#334155" />
      <ellipse
        cx="70"
        cy="85"
        rx="16"
        ry="20"
        fill="#334155"
        transform="rotate(-15, 70, 85)"
      />
      <ellipse
        cx="130"
        cy="85"
        rx="16"
        ry="20"
        fill="#334155"
        transform="rotate(15, 130, 85)"
      />
      <path d="M94,102 Q100,106 106,102 L100,110 Z" fill="#334155" />
      {/* Canvas/Palette */}
      <rect
        x="55"
        y="110"
        width="90"
        height="50"
        rx="4"
        fill="#FFF"
        stroke="#e2e8f0"
        strokeWidth="2"
        transform="rotate(-5, 100, 135)"
      />
      <g transform="rotate(-5, 100, 135)">
        <circle cx="80" cy="135" r="3" fill="#2DD4BF" opacity="0.6" />
        <circle cx="95" cy="125" r="3" fill="#F472B6" opacity="0.6" />
        <circle cx="110" cy="130" r="3" fill="#8B5CF6" opacity="0.6" />
        <circle cx="120" cy="140" r="3" fill="#F59E0B" opacity="0.6" />
      </g>
      <ellipse
        cx="55"
        cy="125"
        rx="10"
        ry="10"
        fill="#334155"
        transform="rotate(-5, 100, 135)"
      />
      <ellipse
        cx="145"
        cy="125"
        rx="10"
        ry="10"
        fill="#334155"
        transform="rotate(-5, 100, 135)"
      />
      <path
        d="M145,125 L120,135"
        stroke="#334155"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="120" cy="135" r="2" fill="#F472B6" />
      {/* Beret (Artist Hat) */}
      <path
        d="M130,50 Q160,40 170,55 Q175,70 150,65 Q130,60 130,50"
        fill="#F472B6"
        transform="rotate(10, 150, 60)"
      />
    </SvgIcon>
  );
};

export const OmicsArtistLogoMiniIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 200 200">
      {/* Panda Base */}
      <circle cx="50" cy="50" r="18" fill="#334155" />
      <circle cx="150" cy="50" r="18" fill="#334155" />
      <path
        d="M50,160 C30,160 20,130 25,100 C30,50 60,40 100,40 C140,40 170,50 175,100 C180,130 170,160 150,160 L50,160 Z"
        fill="#F8FAFC"
        stroke="#e2e8f0"
        strokeWidth="1"
      />
      <ellipse cx="45" cy="155" rx="18" ry="12" fill="#334155" />
      <ellipse cx="155" cy="155" rx="18" ry="12" fill="#334155" />
      <ellipse
        cx="70"
        cy="85"
        rx="16"
        ry="20"
        fill="#334155"
        transform="rotate(-15, 70, 85)"
      />
      <ellipse
        cx="130"
        cy="85"
        rx="16"
        ry="20"
        fill="#334155"
        transform="rotate(15, 130, 85)"
      />
      <path d="M94,102 Q100,106 106,102 L100,110 Z" fill="#334155" />
      {/* Beret (Artist Hat) */}
      <path
        d="M130,50 Q160,40 170,55 Q175,70 150,65 Q130,60 130,50"
        fill="#F472B6"
        transform="rotate(10, 150, 60)"
      />
    </SvgIcon>
  );
};

export const OmicsAnalystLogoIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 200 200">
      {/* Panda Base */}
      <circle cx="50" cy="50" r="18" fill="#334155" />
      <circle cx="150" cy="50" r="18" fill="#334155" />
      <path
        d="M50,160 C30,160 20,130 25,100 C30,50 60,40 100,40 C140,40 170,50 175,100 C180,130 170,160 150,160 L50,160 Z"
        fill="#F8FAFC"
        stroke="#e2e8f0"
        strokeWidth="1"
      />
      <ellipse cx="45" cy="155" rx="18" ry="12" fill="#334155" />
      <ellipse cx="155" cy="155" rx="18" ry="12" fill="#334155" />
      <ellipse
        cx="70"
        cy="85"
        rx="16"
        ry="20"
        fill="#334155"
        transform="rotate(-15, 70, 85)"
      />
      <ellipse
        cx="130"
        cy="85"
        rx="16"
        ry="20"
        fill="#334155"
        transform="rotate(15, 130, 85)"
      />
      <path d="M94,102 Q100,106 106,102 L100,110 Z" fill="#334155" />
      {/* Magnifying Glass (Search Icon) */}
      <circle
        cx="130"
        cy="90"
        r="25"
        stroke="#334155"
        strokeWidth="4"
        fill="rgba(255,255,255,0.3)"
      />
      <line
        x1="110"
        y1="110"
        x2="80"
        y2="140"
        stroke="#334155"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="130" cy="90" r="10" fill="#2DD4BF" opacity="0.5" />
    </SvgIcon>
  );
};

export const OmicsScholarLogoIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 200 200">
      <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z" />
    </SvgIcon>
  );
};

export const OmicsHelperLogoIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 200 200">
      {/* Panda Base */}
      <circle cx="50" cy="50" r="18" fill="#334155" />
      <circle cx="150" cy="50" r="18" fill="#334155" />
      <path
        d="M50,160 C30,160 20,130 25,100 C30,50 60,40 100,40 C140,40 170,50 175,100 C180,130 170,160 150,160 L50,160 Z"
        fill="#F8FAFC"
        stroke="#e2e8f0"
        strokeWidth="1"
      />
      <ellipse cx="45" cy="155" rx="18" ry="12" fill="#334155" />
      <ellipse cx="155" cy="155" rx="18" ry="12" fill="#334155" />
      <ellipse
        cx="70"
        cy="85"
        rx="16"
        ry="20"
        fill="#334155"
        transform="rotate(-15, 70, 85)"
      />
      <ellipse
        cx="130"
        cy="85"
        rx="16"
        ry="20"
        fill="#334155"
        transform="rotate(15, 130, 85)"
      />
      <path d="M94,102 Q100,106 106,102 L100,110 Z" fill="#334155" />
      {/* Headset */}
      <ellipse
        cx="160"
        cy="100"
        rx="12"
        ry="10"
        fill="#334155"
        transform="rotate(-40, 160, 100)"
      />
      <path
        d="M40,90 Q40,30 100,30 Q160,30 160,90"
        fill="none"
        stroke="#334155"
        strokeWidth="3"
      />
      <rect x="35" y="80" width="10" height="20" rx="2" fill="#334155" />
      <path d="M40,100 L70,110" stroke="#334155" strokeWidth="2" />
      <circle cx="70" cy="110" r="3" fill="#334155" />
      <path
        d="M90,115 Q100,120 110,115"
        fill="none"
        stroke="#334155"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </SvgIcon>
  );
};

export const OmicsCoderLogoIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 200 200">
      <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z" />
    </SvgIcon>
  );
};

export const OmicsTeamLogoIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 200 200">
      <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z" />
    </SvgIcon>
  );
};

export const OmicsOopsLogoIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 200 200">
      <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z" />
    </SvgIcon>
  );
};

export const OmicsCrashLogoIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 200 200">
      <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z" />
    </SvgIcon>
  );
};

export default memo(CustomSvgIcon);
