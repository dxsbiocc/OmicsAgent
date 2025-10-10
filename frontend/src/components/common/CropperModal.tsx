"use client";

import React, { useState, useCallback, createRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Stack,
  Paper,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon, Check as CheckIcon } from "@mui/icons-material";
import Cropper, { ReactCropperElement } from "react-cropper";
import "../../../styles/common/cropper.css";

interface CropperModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (croppedFile: File) => void;
  imageUrl: string;
  originalFilename?: string;
  title?: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

export const CropperModal: React.FC<CropperModalProps> = ({
  open,
  onClose,
  onConfirm,
  imageUrl,
  originalFilename,
  title = "图片裁剪",
  isUploading = false,
  uploadProgress = 0,
}) => {
  const cropperRef = createRef<ReactCropperElement>();
  const [cropData, setCropData] = useState<string>("#");
  const [isCropperReady, setIsCropperReady] = useState<boolean>(false);

  // 重置状态
  const resetState = useCallback(() => {
    setCropData("#");
    setIsCropperReady(false);
  }, []);

  // 关闭时重置状态
  React.useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  // 确认选择
  const handleConfirm = () => {
    if (!isCropperReady) {
      console.error("Cropper is not ready yet");
      return;
    }

    if (cropperRef.current?.cropper) {
      const cropper = cropperRef.current.cropper;

      try {
        const canvas = cropper.getCroppedCanvas();

        if (canvas) {
          canvas.toBlob(
            (blob: Blob | null) => {
              if (blob) {
                // 生成文件名：原始文件名 + 短时间戳
                const generateFilename = () => {
                  const now = new Date();
                  const timestamp = now.getTime().toString().slice(-8); // 取时间戳后8位

                  if (originalFilename) {
                    // 提取原始文件名（不含扩展名）和扩展名
                    const lastDotIndex = originalFilename.lastIndexOf(".");
                    const nameWithoutExt =
                      lastDotIndex > 0
                        ? originalFilename.substring(0, lastDotIndex)
                        : originalFilename;
                    const extension =
                      lastDotIndex > 0
                        ? originalFilename.substring(lastDotIndex)
                        : ".jpg";

                    return `${nameWithoutExt}_${timestamp}${extension}`;
                  } else {
                    return `cropped_${timestamp}.jpg`;
                  }
                };

                const filename = generateFilename();

                // 创建 File 对象
                const file = new File([blob], filename, {
                  type: "image/jpeg",
                });
                onConfirm(file);
                onClose();
              } else {
                console.error("Failed to create blob");
              }
            },
            "image/jpeg",
            0.9
          );
        } else {
          console.error("Canvas is null or undefined");
        }
      } catch (error) {
        console.error("Error getting cropped canvas:", error);
      }
    } else {
      console.error("Cropper instance not found");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      sx={{
        minHeight: "400px",
        maxHeight: "80%",
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

      <DialogContent sx={{ pt: 2, px: 10 }}>
        <Box sx={{ flex: 1, minWidth: "50%" }}>
          <Box
            sx={{
              width: "100%",
              height: "400px",
              border: "2px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Cropper
              ref={cropperRef}
              style={{ height: "100%", width: "100%" }}
              initialAspectRatio={1}
              preview=".img-preview"
              src={imageUrl}
              viewMode={1}
              minCropBoxHeight={10}
              minCropBoxWidth={10}
              background={false}
              responsive={true}
              autoCropArea={1}
              checkOrientation={false}
              guides={true}
              ready={() => {
                setIsCropperReady(true);
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1, justifyContent: "center" }}>
        {isUploading ? (
          <Box sx={{ width: "100%", textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              正在上传图片...
            </Typography>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {uploadProgress}%
            </Typography>
          </Box>
        ) : (
          <>
            <Button onClick={onClose} variant="outlined">
              取消
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              startIcon={<CheckIcon />}
              disabled={!isCropperReady}
            >
              确认裁剪
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CropperModal;
