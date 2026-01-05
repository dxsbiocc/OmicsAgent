"use client";

import {
  Box,
  Paper,
  Typography,
  Divider,
  TextField,
  Stack,
  Button,
  CircularProgress,
  Avatar,
  IconButton,
} from "@mui/material";
import { ThumbUp, ThumbUpOutlined, Reply } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface DiscussionProps {
  title?: string;
  comments: any[];
  loading: boolean;
  isAuthenticated: boolean;
  newComment: string;
  setNewComment: (v: string) => void;
  onSubmitComment: () => void;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  replyContent: string;
  setReplyContent: (v: string) => void;
  onSubmitReply: (parentId: number) => void;
  onToggleLike: (commentId: number, isLiked: boolean) => void;
  formatTime: (dateString: string) => string;
}

export default function Discussion({
  title = "讨论区",
  comments,
  loading,
  isAuthenticated,
  newComment,
  setNewComment,
  onSubmitComment,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  onToggleLike,
  formatTime,
}: DiscussionProps) {
  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: 2,
        transition: "all 0.3s ease-in-out",
        "&:hover": { boxShadow: 2 },
      }}
    >
      <Typography variant="h6" gutterBottom fontWeight={600}>
        {title} ({comments.length})
      </Typography>
      <Divider sx={{ mb: 3, mt: 1 }} />

      {isAuthenticated ? (
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="写下你的评论..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={onSubmitComment}
              disabled={!newComment.trim()}
            >
              发表评论
            </Button>
          </Stack>
        </Box>
      ) : (
        <Box
          sx={{ mb: 4, p: 3, bgcolor: "background.default", borderRadius: 2 }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            请先登录以发表评论
          </Typography>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : comments.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ py: 4 }}
        >
          暂无讨论，快来发表第一个评论吧！
        </Typography>
      ) : (
        <Stack spacing={3}>
          {comments.map((comment) => (
            <Box key={comment.id}>
              <Box
                sx={{
                  p: 3,
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Avatar
                    sx={{ bgcolor: "primary.main", width: 40, height: 40 }}
                  >
                    {comment.author?.username?.charAt(0)?.toUpperCase() || "U"}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {comment.author?.username || "匿名用户"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(comment.created_at)}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ mb: 2 }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {comment.content}
                  </ReactMarkdown>
                </Box>

                <Stack direction="row" spacing={2} alignItems="center">
                  <IconButton
                    size="small"
                    onClick={() => onToggleLike(comment.id, comment.is_liked)}
                    color={comment.is_liked ? "primary" : "default"}
                  >
                    {comment.is_liked ? <ThumbUp /> : <ThumbUpOutlined />}
                  </IconButton>
                  <Typography variant="body2" color="text.secondary">
                    {comment.like_count || 0}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setReplyingTo(
                        replyingTo === comment.id ? null : comment.id
                      )
                    }
                  >
                    <Reply fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" color="text.secondary">
                    回复
                  </Typography>
                </Stack>

                {replyingTo === comment.id && (
                  <Box
                    sx={{
                      mt: 2,
                      pl: 4,
                      borderLeft: 2,
                      borderColor: "primary.main",
                    }}
                  >
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="写下你的回复..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => onSubmitReply(comment.id)}
                        disabled={!replyContent.trim()}
                      >
                        回复
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent("");
                        }}
                      >
                        取消
                      </Button>
                    </Stack>
                  </Box>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <Box
                    sx={{ mt: 3, pl: 4, borderLeft: 2, borderColor: "divider" }}
                  >
                    <Stack spacing={2}>
                      {comment.replies.map((reply: any) => (
                        <Box
                          key={reply.id}
                          sx={{
                            p: 2,
                            bgcolor: "background.default",
                            borderRadius: 1,
                          }}
                        >
                          <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                            <Avatar
                              sx={{
                                bgcolor: "secondary.main",
                                width: 32,
                                height: 32,
                              }}
                            >
                              {reply.author?.username
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                {reply.author?.username || "匿名用户"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatTime(reply.created_at)}
                              </Typography>
                            </Box>
                          </Stack>
                          <Box sx={{ mb: 1 }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {reply.content}
                            </ReactMarkdown>
                          </Box>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                onToggleLike(reply.id, reply.is_liked)
                              }
                              color={reply.is_liked ? "primary" : "default"}
                            >
                              {reply.is_liked ? (
                                <ThumbUp fontSize="small" />
                              ) : (
                                <ThumbUpOutlined fontSize="small" />
                              )}
                            </IconButton>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {reply.like_count || 0}
                            </Typography>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
