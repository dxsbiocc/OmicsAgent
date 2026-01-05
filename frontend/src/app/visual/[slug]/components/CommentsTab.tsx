"use client";

import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { useState } from "react";

interface CommentsTabProps {
  // Add any props needed for comments functionality
  toolName?: string;
}

export default function CommentsTab({ toolName }: CommentsTabProps) {
  const [comment, setComment] = useState("");

  const handleSubmitComment = () => {
    // TODO: Implement comment submission logic
    console.log("Submitting comment:", comment);
    setComment("");
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        评论
      </Typography>

      {/* Comment Input */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          添加评论
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="请输入您的评论..."
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => setComment("")}>
            清空
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitComment}
            disabled={!comment.trim()}
          >
            提交评论
          </Button>
        </Stack>
      </Paper>

      {/* Comments List */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          评论列表
        </Typography>
        <Typography variant="body2" color="text.secondary">
          暂无评论
        </Typography>
      </Paper>
    </Box>
  );
}
