"use client";

import { Box, Typography, Paper, CircularProgress, Alert } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState } from "react";
import { getToolDocs } from "@/libs/api/visual";

export default function DocsTab({ toolName }: { toolName: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string>("");
  const [noDocument, setNoDocument] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setMarkdown("");
        setNoDocument(false);
        if (!toolName) return;
        const resp = await getToolDocs(toolName);
        if (!cancelled) {
          if (resp.success) {
            setMarkdown(resp.markdown || "");
            // 如果没有markdown内容，也视为暂无文档
            if (!resp.markdown || resp.markdown.trim() === "") {
              setNoDocument(true);
            }
          } else {
            // 检查是否是资源不存在的错误（404或类似）
            const errorMessage = resp.message || "";
            if (
              errorMessage.includes("不存在") ||
              errorMessage.includes("not found") ||
              errorMessage.includes("404") ||
              errorMessage.includes("No documentation")
            ) {
              setNoDocument(true);
            } else {
              setError(resp.message || "未能获取文档");
            }
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          // 检查是否是404错误
          const errorMessage = e?.message || "";
          const statusCode = e?.response?.status || e?.status;
          if (
            statusCode === 404 ||
            errorMessage.includes("不存在") ||
            errorMessage.includes("not found") ||
            errorMessage.includes("404") ||
            errorMessage.includes("No documentation")
          ) {
            setNoDocument(true);
          } else {
            setError(e?.message || "获取文档失败");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toolName]);

  return (
    <Box>
      <Paper sx={{ p: 2, minHeight: 120 }}>
        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">加载中...</Typography>
          </Box>
        )}
        {!loading && error && <Alert severity="error">{error}</Alert>}
        {!loading && noDocument && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              暂无文档
            </Typography>
            <Typography variant="body2" color="text.secondary">
              正在赶来的路上
            </Typography>
          </Box>
        )}
        {!loading && !error && !noDocument && (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        )}
      </Paper>
    </Box>
  );
}
