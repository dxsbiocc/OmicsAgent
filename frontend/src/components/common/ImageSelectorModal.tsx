"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Stack,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { imageApi } from "@/libs/api/image";
import { getFullImageUrl } from "@/utils/url";
import type { ImageResponse } from "@/types";

interface ImageSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  title?: string;
}

export const ImageSelectorModal: React.FC<ImageSelectorModalProps> = ({
  open,
  onClose,
  onSelect,
  title = "选择图片",
}) => {
  const [images, setImages] = useState<ImageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 加载图片列表
  const loadImages = async (pageNum: number = 1, search: string = "") => {
    try {
      setLoading(true);
      setError(null);

      const response = await imageApi.getUserImages({
        page: pageNum,
        page_size: 12,
        search: search || undefined,
      });

      if (pageNum === 1) {
        setImages(response.images);
      } else {
        setImages((prev) => [...prev, ...response.images]);
      }

      setHasMore(response.images.length === 12);
    } catch (err) {
      console.error("加载图片失败:", err);
      setError("加载图片失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 搜索图片
  const handleSearch = () => {
    setPage(1);
    setSelectedImageId(null);
    loadImages(1, searchTerm);
  };

  // 加载更多
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadImages(nextPage, searchTerm);
  };

  // 选择图片
  const handleSelectImage = (image: ImageResponse) => {
    setSelectedImageId(image.id);
  };

  // 确认选择
  const handleConfirm = () => {
    const selectedImage = images.find((img) => img.id === selectedImageId);
    if (selectedImage) {
      onSelect(getFullImageUrl(selectedImage.file_url));
      onClose();
    }
  };

  // 刷新列表
  const handleRefresh = () => {
    setPage(1);
    setSelectedImageId(null);
    setSearchTerm("");
    loadImages(1);
  };

  // 组件挂载时加载图片
  useEffect(() => {
    if (open) {
      loadImages();
    }
  }, [open]);

  // 重置状态
  useEffect(() => {
    if (!open) {
      setImages([]);
      setSearchTerm("");
      setSelectedImageId(null);
      setPage(1);
      setHasMore(true);
      setError(null);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: "80vh" },
      }}
    >
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* 搜索栏 */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              fullWidth
              size="small"
              placeholder="搜索图片..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              onClick={handleSearch}
              disabled={loading}
              sx={{ minWidth: 80 }}
            >
              搜索
            </Button>
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Box>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 图片网格 */}
        <Box sx={{ height: "calc(100% - 120px)", overflow: "auto" }}>
          {images.length === 0 && !loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
                color: "text.secondary",
              }}
            >
              <Typography>暂无图片</Typography>
            </Box>
          ) : (
            <Grid container spacing={2} p={2}>
              {images.map((image) => (
                <Grid
                  key={image.id}
                  sx={{
                    xs: 6,
                    sm: 4,
                    md: 3,
                  }}
                >
                  <Box
                    sx={{
                      cursor: "pointer",
                      border: selectedImageId === image.id ? 3 : 1,
                      borderColor:
                        selectedImageId === image.id
                          ? "primary.main"
                          : "divider",
                      borderRadius: 1,
                      overflow: "hidden",
                      "&:hover": {
                        borderColor: "primary.main",
                        transform: "scale(1.02)",
                        transition: "all 0.2s ease-in-out",
                      },
                    }}
                    onClick={() => handleSelectImage(image)}
                  >
                    <img
                      src={getFullImageUrl(image.file_url)}
                      alt={image.original_filename}
                      style={{
                        width: "100%",
                        height: "120px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <Box sx={{ p: 1, bgcolor: "background.paper" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          fontSize: "0.7rem",
                          color: "text.secondary",
                        }}
                      >
                        {image.original_filename}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}

          {/* 加载更多按钮 */}
          {hasMore && images.length > 0 && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : null}
              >
                {loading ? "加载中..." : "加载更多"}
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          取消
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          startIcon={<CheckIcon />}
          disabled={!selectedImageId}
        >
          选择图片
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageSelectorModal;
