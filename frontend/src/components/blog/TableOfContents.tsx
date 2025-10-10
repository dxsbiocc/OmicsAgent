"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Paper,
  Divider,
} from "@mui/material";
import { ExpandLess, ExpandMore, List as ListIcon } from "@mui/icons-material";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { Link as ScrollLink, scroller } from "react-scroll";

interface TocItem {
  id: string;
  text: string;
  level: number;
  children?: TocItem[];
}

interface TableOfContentsProps {
  content: string;
  onItemClick?: (id: string) => void;
}

export default function TableOfContents({
  content,
  onItemClick,
}: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<string>("");
  const observer = useRef<IntersectionObserver | null>(null);

  // 使用 remark 解析 Markdown 并生成目录
  useEffect(() => {
    const generateToc = async () => {
      if (!content || content.trim() === "") {
        console.log("内容为空，跳过解析");
        setTocItems([]);
        return;
      }

      try {
        // 使用 remark 处理 Markdown
        const processor = remark().use(remarkGfm);
        const result = await processor.parse(content);

        // 从 AST 中提取标题
        const headings: TocItem[] = [];
        const stack: TocItem[] = [];
        const usedIds = new Set<string>();

        visit(result, "heading", (node: any) => {
          const level = node.depth;
          const text = node.children
            .filter((child: any) => child.type === "text")
            .map((child: any) => child.value)
            .join("")
            .trim();

          if (text) {
            let id = text
              .toLowerCase()
              .replace(/[^\w\s-]/g, "")
              .replace(/\s+/g, "-")
              .replace(/^-+|-+$/g, ""); // 移除开头和结尾的连字符

            // 确保 ID 不为空
            if (!id) {
              id = `heading-${headings.length}`;
            }

            // 确保 ID 唯一
            let uniqueId = id;
            let counter = 1;
            while (usedIds.has(uniqueId)) {
              uniqueId = `${id}-${counter}`;
              counter++;
            }
            usedIds.add(uniqueId);

            const item: TocItem = {
              id: uniqueId,
              text,
              level,
            };

            // 构建层级结构
            while (stack.length > 0 && stack[stack.length - 1].level >= level) {
              stack.pop();
            }

            if (stack.length === 0) {
              headings.push(item);
            } else {
              const parent = stack[stack.length - 1];
              if (!parent.children) {
                parent.children = [];
              }
              parent.children.push(item);
            }

            stack.push(item);
          }
        });

        // 如果 remark 解析没有找到标题，尝试使用正则表达式作为备选方案
        if (headings.length === 0) {
          const regexHeadings = parseHeadingsWithRegex(content);
          setTocItems(regexHeadings);

          // 默认展开所有项目
          const allIds = new Set<string>();
          const collectIds = (items: TocItem[]) => {
            items.forEach((item) => {
              allIds.add(item.id);
              if (item.children) {
                collectIds(item.children);
              }
            });
          };
          collectIds(regexHeadings);
          setExpandedItems(allIds);
        } else {
          setTocItems(headings);

          // 默认展开所有项目
          const allIds = new Set<string>();
          const collectIds = (items: TocItem[]) => {
            items.forEach((item) => {
              allIds.add(item.id);
              if (item.children) {
                collectIds(item.children);
              }
            });
          };
          collectIds(headings);
          setExpandedItems(allIds);
        }
      } catch (error) {
        console.error("生成目录失败:", error);
        // 如果 remark 解析失败，尝试使用正则表达式
        const regexHeadings = parseHeadingsWithRegex(content);
        setTocItems(regexHeadings);
      }
    };

    generateToc();
  }, [content]);

  // 使用正则表达式解析标题的备选方案
  const parseHeadingsWithRegex = (content: string): TocItem[] => {
    const lines = content.split("\n");
    const headings: TocItem[] = [];
    const stack: TocItem[] = [];
    const usedIds = new Set<string>();

    lines.forEach((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        let id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/^-+|-+$/g, ""); // 移除开头和结尾的连字符

        // 确保 ID 不为空
        if (!id) {
          id = `heading-${headings.length}`;
        }

        // 确保 ID 唯一
        let uniqueId = id;
        let counter = 1;
        while (usedIds.has(uniqueId)) {
          uniqueId = `${id}-${counter}`;
          counter++;
        }
        usedIds.add(uniqueId);

        const item: TocItem = {
          id: uniqueId,
          text,
          level,
        };

        // 构建层级结构
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          headings.push(item);
        } else {
          const parent = stack[stack.length - 1];
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(item);
        }

        stack.push(item);
      }
    });

    return headings;
  };

  // 监听滚动，高亮当前章节
  useEffect(() => {
    observer.current?.disconnect();
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveItem(entry.target.id);
          }
        });
      },
      { rootMargin: "-50% 0% -50% 0%" }
    );

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.current?.observe(element);
      }
    });

    return () => observer.current?.disconnect();
  }, [tocItems]);

  const handleItemClick = (id: string) => {
    console.log("点击目录项:", id);

    // 先检查目标元素是否存在
    const targetElement = document.getElementById(id);
    if (!targetElement) {
      console.warn("目标元素不存在:", id);
      onItemClick?.(id);
      return;
    }

    // 使用 react-scroll 的 scroller 进行滚动
    try {
      scroller.scrollTo(id, {
        duration: 500,
        delay: 0,
        smooth: "easeInOutQuart",
        offset: -80, // 减去 header 高度 + 额外间距
        spy: true,
        hashSpy: true,
        containerId: "blog-content", // 指定滚动容器
      });
    } catch (error) {
      console.error("滚动失败:", error);
      // 如果 react-scroll 失败，使用原生滚动作为备选
      const header =
        document.querySelector("header") ||
        document.querySelector('[role="banner"]');
      const headerHeight = header ? header.offsetHeight : 64;
      const elementPosition = targetElement.offsetTop - headerHeight - 16;

      window.scrollTo({
        top: Math.max(0, elementPosition),
        behavior: "smooth",
      });
    }

    onItemClick?.(id);
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderTocItem = (item: TocItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = activeItem === item.id;

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
          <ScrollLink
            to={item.id}
            smooth={true}
            duration={500}
            offset={-80}
            onClick={() => handleItemClick(item.id)}
            style={{
              width: "100%",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <ListItemButton
              sx={{
                borderRadius: 1,
                mb: 0.5,
                pl: depth * 2 + 1,
                pr: 1,
                backgroundColor: isActive ? "primary.light" : "transparent",
                color: isActive ? "primary.contrastText" : "text.primary",
                "&:hover": {
                  backgroundColor: isActive ? "primary.main" : "action.hover",
                  transform: "translateX(4px)",
                },
                "&:active": {
                  transform: "translateX(2px)",
                  backgroundColor: "primary.light",
                },
                py: 0.5,
                minHeight: 32,
                transition: "all 0.2s ease-in-out",
                cursor: "pointer",
              }}
            >
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: item.level === 1 ? "0.9rem" : "0.8rem",
                      fontWeight: item.level <= 2 ? 600 : 400,
                      lineHeight: 1.2,
                      color: item.level === 1 ? "primary.main" : "text.primary",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                    }}
                    title={item.text} // 添加 tooltip 显示完整文本
                  >
                    {item.text}
                  </Typography>
                }
              />
              {hasChildren && (
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(item.id);
                  }}
                  sx={{
                    ml: 1,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    minWidth: 24,
                    justifyContent: "center",
                  }}
                >
                  {isExpanded ? (
                    <ExpandLess fontSize="small" />
                  ) : (
                    <ExpandMore fontSize="small" />
                  )}
                </Box>
              )}
            </ListItemButton>
          </ScrollLink>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderTocItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  if (tocItems.length === 0) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          bgcolor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          position: "sticky",
          top: 100,
          maxHeight: "calc(100vh - 100px)",
          overflowY: "auto",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <ListIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            目录
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          暂无目录内容
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        bgcolor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        position: "sticky",
        top: 100,
        maxHeight: "calc(100vh - 50px)",
        overflowY: "auto",
        width: "100%",
        minWidth: 0, // 防止内容溢出
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <ListIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          目录
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <List dense>{tocItems.map((item) => renderTocItem(item))}</List>
    </Paper>
  );
}
