"use client";

import React from "react";
import { Box, BoxProps } from "@mui/material";

interface FolderIconProps extends BoxProps {
  size?: number;
  animated?: boolean;
}

const FolderIcon: React.FC<FolderIconProps> = ({
  size = 48,
  animated = false,
  sx,
  ...props
}) => {
  const folderWidth = size * 1.5;
  const folderHeight = size;
  const tipWidth = size;
  const tipHeight = size * 0.25;

  return (
    <Box
      className="folder-icon-container"
      sx={{
        position: "relative",
        width: folderWidth,
        height: folderHeight * 1.2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...(animated && {
          animation: "float 2.5s infinite ease-in-out",
          "@keyframes float": {
            "0%": {
              transform: "translateY(0px)",
            },
            "50%": {
              transform: "translateY(-8px)",
            },
            "100%": {
              transform: "translateY(0px)",
            },
          },
        }),
        "&:hover .folder-front-side": {
          transform: "rotateX(-40deg) skewX(15deg)",
        },
        "&:hover .folder-back-layer-1": {
          transform: "rotateX(-5deg) skewX(5deg)",
        },
        "&:hover .folder-back-layer-2": {
          transform: "rotateX(-15deg) skewX(12deg)",
        },
        ...sx,
      }}
      {...props}
    >
      {/* Back side layers */}
      <Box
        className="folder-back-layer-1"
        sx={{
          position: "absolute",
          width: folderWidth,
          height: folderHeight,
          background: "linear-gradient(135deg, #ffe563, #ffc663)",
          borderRadius: "10px",
          opacity: 0.5,
          transformOrigin: "bottom center",
          transition: "transform 350ms",
          zIndex: 0,
        }}
      />
      <Box
        className="folder-back-layer-2"
        sx={{
          position: "absolute",
          width: folderWidth,
          height: folderHeight,
          background: "linear-gradient(135deg, #ffe563, #ffc663)",
          borderRadius: "10px",
          opacity: 0.5,
          transformOrigin: "bottom center",
          transition: "transform 350ms",
          zIndex: 0,
        }}
      />

      {/* Front side */}
      <Box
        className="folder-front-side"
        sx={{
          position: "relative",
          zIndex: 1,
          transformOrigin: "bottom center",
          transition: "transform 350ms",
        }}
      >
        {/* Tip */}
        <Box
          className="folder-tip"
          sx={{
            background: "linear-gradient(135deg, #ff9a56, #ff6f56)",
            width: tipWidth,
            height: tipHeight,
            borderRadius: "12px 12px 0 0",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
            position: "absolute",
            top: -tipHeight * 0.5,
            left: (folderWidth - tipWidth) / 2,
            zIndex: 2,
          }}
        />
        {/* Cover */}
        <Box
          className="folder-cover"
          sx={{
            background: "linear-gradient(135deg, #ffe563, #ffc663)",
            width: folderWidth,
            height: folderHeight,
            boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
            borderRadius: "10px",
          }}
        />
      </Box>
    </Box>
  );
};

export default FolderIcon;

