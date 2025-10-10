"use client";

import { useState, useEffect } from "react";
import { Box, IconButton, Typography, Stack } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
}

interface CarouselProps {
  items: CarouselItem[];
  height?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function Carousel({
  items,
  height = 400,
  autoPlay = true,
  autoPlayInterval = 5000,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const interval = setInterval(() => {
      if (!isHovered) {
        nextSlide();
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, items.length, isHovered]);

  if (items.length === 0) return null;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
        borderRadius: 2,
        cursor: "pointer",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main slide */}
      <Box
        component="img"
        src={items[currentIndex].image}
        alt={items[currentIndex].title}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isHovered ? "scale(1.05)" : "scale(1)",
        }}
      />

      {/* Overlay content */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
          p: 3,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isHovered ? "translateY(0)" : "translateY(10px)",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          color="white"
          gutterBottom
          sx={{
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isHovered ? "translateY(0)" : "translateY(5px)",
          }}
        >
          {items[currentIndex].title}
        </Typography>
        <Typography
          variant="h6"
          color="rgba(255,255,255,0.9)"
          sx={{
            mb: 2,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isHovered ? "translateY(0)" : "translateY(5px)",
          }}
        >
          {items[currentIndex].description}
        </Typography>
      </Box>

      {/* Navigation buttons */}
      <IconButton
        onClick={prevSlide}
        sx={{
          position: "absolute",
          left: 16,
          top: "50%",
          transform: "translateY(-50%)",
          bgcolor: "rgba(255,255,255,0.9)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: isHovered ? 1 : 0.7,
          "&:hover": {
            bgcolor: "white",
            transform: "translateY(-50%) scale(1.1)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        }}
      >
        <ChevronLeftIcon />
      </IconButton>

      <IconButton
        onClick={nextSlide}
        sx={{
          position: "absolute",
          right: 16,
          top: "50%",
          transform: "translateY(-50%)",
          bgcolor: "rgba(255,255,255,0.9)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: isHovered ? 1 : 0.7,
          "&:hover": {
            bgcolor: "white",
            transform: "translateY(-50%) scale(1.1)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        }}
      >
        <ChevronRightIcon />
      </IconButton>

      {/* Dots indicator */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: isHovered ? 1 : 0.8,
        }}
      >
        {items.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentIndex(index)}
            sx={{
              width: index === currentIndex ? 24 : 8,
              height: 8,
              borderRadius: "4px",
              bgcolor:
                index === currentIndex ? "white" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.8)",
                transform: "scale(1.2)",
              },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
