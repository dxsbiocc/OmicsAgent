"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  LinearProgress,
  Tooltip,
  Breadcrumbs,
  Link,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
  ListItemButton,
  Divider,
  Select,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
} from "@mui/material";
import {
  CloudQueue,
  Folder,
  FolderOpen,
  InsertDriveFile,
  Upload,
  CreateNewFolder,
  MoreVert,
  Download,
  Delete,
  Edit,
  Refresh,
  Home,
  NavigateNext,
  Image,
  Description,
  VideoFile,
  AudioFile,
  Archive,
  Code,
  PictureAsPdf,
  TableChart,
  DataObject,
  ViewModule,
  ViewList,
  Sort,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  getRootDirectories,
  getCloudDiskContents,
  uploadFile,
  createFolder,
  deleteItem,
  renameItem,
  type CloudFile,
  type RootDirectory,
} from "@/libs/api/cloud-disk";
import FolderIcon from "@/components/common/FolderIcon";

// File type icons with colors
const getFileIcon = (
  fileName: string,
  mimeType?: string,
  size: number = 40
) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  // Color mapping for different file types
  const iconColors: Record<string, string> = {
    image: "#10B981", // Gene Green
    video: "#F59E0B", // Solar Amber
    audio: "#8B5CF6", // Agent Violet
    pdf: "#F472B6", // Watercolor Pink
    document: "#3B82F6", // Data Blue
    spreadsheet: "#2DD4BF", // Bio Teal
    archive: "#64748B", // Slate-500
    code: "#F59E0B", // Solar Amber
    data: "#8B5CF6", // Agent Violet
    default: "#94A3B8", // Slate-400
  };

  let IconComponent: any;
  let color: string;

  if (mimeType?.startsWith("image/")) {
    IconComponent = Image;
    color = iconColors.image;
  } else if (mimeType?.startsWith("video/")) {
    IconComponent = VideoFile;
    color = iconColors.video;
  } else if (mimeType?.startsWith("audio/")) {
    IconComponent = AudioFile;
    color = iconColors.audio;
  } else if (mimeType === "application/pdf") {
    IconComponent = PictureAsPdf;
    color = iconColors.pdf;
  } else {
    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "svg":
        IconComponent = Image;
        color = iconColors.image;
        break;
      case "mp4":
      case "avi":
      case "mov":
      case "wmv":
        IconComponent = VideoFile;
        color = iconColors.video;
        break;
      case "mp3":
      case "wav":
      case "flac":
      case "aac":
        IconComponent = AudioFile;
        color = iconColors.audio;
        break;
      case "pdf":
        IconComponent = PictureAsPdf;
        color = iconColors.pdf;
        break;
      case "doc":
      case "docx":
        IconComponent = Description;
        color = iconColors.document;
        break;
      case "xls":
      case "xlsx":
        IconComponent = TableChart;
        color = iconColors.spreadsheet;
        break;
      case "zip":
      case "rar":
      case "7z":
        IconComponent = Archive;
        color = iconColors.archive;
        break;
      case "js":
      case "ts":
      case "py":
      case "java":
      case "cpp":
      case "c":
      case "html":
      case "css":
        IconComponent = Code;
        color = iconColors.code;
        break;
      case "json":
      case "xml":
      case "yaml":
      case "yml":
        IconComponent = DataObject;
        color = iconColors.data;
        break;
      default:
        IconComponent = InsertDriveFile;
        color = iconColors.default;
    }
  }

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 1.5,
        bgcolor: `${color}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IconComponent sx={{ fontSize: size * 0.6, color: color }} />
    </Box>
  );
};

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("zh-CN");
};

export default function CloudDiskPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [rootDirs, setRootDirs] = useState<RootDirectory[]>([]);
  const [currentRoot, setCurrentRoot] = useState<string>("uploads");
  const [currentPath, setCurrentPath] = useState<string>("");
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Layout and sort states
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "size" | "date">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  // Dialog states
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameName, setRenameName] = useState("");
  const [renamePath, setRenamePath] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    item: CloudFile | any;
  } | null>(null);

  // Selection and editing states
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    type: "file" | "folder";
    path: string;
  } | null>(null);
  const [editingItem, setEditingItem] = useState<{
    id: string;
    type: "file" | "folder";
    path: string;
    name: string;
  } | null>(null);
  const [editingName, setEditingName] = useState("");

  // Load root directories
  useEffect(() => {
    const loadRoots = async () => {
      try {
        const response = await getRootDirectories();
        setRootDirs(response.roots);
        if (response.roots.length > 0) {
          setCurrentRoot(response.roots[0].id);
        }
      } catch (err) {
        setError("加载根目录失败");
      }
    };
    loadRoots();
  }, []);

  // Load directory contents
  useEffect(() => {
    if (!currentRoot) return;

    const loadContents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getCloudDiskContents(currentRoot, currentPath);
        setFiles(response.files || []);
        setFolders(response.folders || []);
      } catch (err: any) {
        setError(err.message || "加载文件失败");
      } finally {
        setLoading(false);
      }
    };

    loadContents();
  }, [currentRoot, currentPath]);

  // Handle root directory change
  const handleRootChange = (rootId: string) => {
    setCurrentRoot(rootId);
    setCurrentPath("");
  };

  // Handle folder selection
  const handleFolderSelect = (folder: any) => {
    setSelectedItem({
      id: folder.id,
      type: "folder",
      path: folder.path,
    });
  };

  // Handle folder double click to navigate
  const handleFolderDoubleClick = (folder: any) => {
    setCurrentPath(folder.path);
    setSelectedItem(null);
  };

  // Handle folder name click to edit
  const handleFolderNameClick = (e: React.MouseEvent, folder: any) => {
    e.stopPropagation();
    if (selectedItem?.id === folder.id) {
      setEditingItem({
        id: folder.id,
        type: "folder",
        path: folder.path,
        name: folder.name,
      });
      setEditingName(folder.name);
    }
  };

  // Handle file selection
  const handleFileSelect = (file: CloudFile) => {
    setSelectedItem({
      id: file.id,
      type: "file",
      path: file.path,
    });
  };

  // Handle file name click to edit
  const handleFileNameClick = (e: React.MouseEvent, file: CloudFile) => {
    e.stopPropagation();
    if (selectedItem?.id === file.id) {
      setEditingItem({
        id: file.id,
        type: "file",
        path: file.path,
        name: file.name,
      });
      setEditingName(file.name);
    }
  };

  // Handle editing name change
  const handleEditingNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  // Handle editing name confirm
  const handleEditingNameConfirm = async () => {
    if (!editingItem || !editingName.trim()) {
      setEditingItem(null);
      setEditingName("");
      return;
    }

    // 如果名称没有改变，直接取消编辑
    if (editingName.trim() === editingItem.name) {
      setEditingItem(null);
      setEditingName("");
      return;
    }

    try {
      await renameItem(currentRoot, editingItem.path, editingName.trim());
      setEditingItem(null);
      setEditingName("");
      setSelectedItem(null);

      // Refresh file list
      const response = await getCloudDiskContents(currentRoot, currentPath);
      setFiles(response.files || []);
      setFolders(response.folders || []);
    } catch (err: any) {
      setError(err.message || "重命名失败");
    }
  };

  // Handle editing name cancel
  const handleEditingNameCancel = () => {
    setEditingItem(null);
    setEditingName("");
  };

  // Handle editing name key press
  const handleEditingNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditingNameConfirm();
    } else if (e.key === "Escape") {
      handleEditingNameCancel();
    }
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index: number) => {
    const pathSegments = currentPath.split("/").filter(Boolean);
    if (index === -1) {
      setCurrentPath("");
    } else {
      setCurrentPath(pathSegments.slice(0, index + 1).join("/"));
    }
  };

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadFile(currentRoot, file, currentPath, (progress) => {
          setUploadProgress(progress);
        });
      }

      // Refresh file list
      const response = await getCloudDiskContents(currentRoot, currentPath);
      setFiles(response.files || []);
      setFolders(response.folders || []);
    } catch (err: any) {
      setError(err.message || "文件上传失败");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle new folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await createFolder(currentRoot, newFolderName, currentPath);
      setNewFolderName("");
      setNewFolderDialogOpen(false);

      // Refresh file list
      const response = await getCloudDiskContents(currentRoot, currentPath);
      setFiles(response.files || []);
      setFolders(response.folders || []);
    } catch (err: any) {
      setError(err.message || "创建文件夹失败");
    }
  };

  // Handle context menu
  const handleContextMenu = (
    event: React.MouseEvent,
    item: CloudFile | any
  ) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      item,
    });
  };

  // Handle file operations
  const handleDownload = (file: CloudFile) => {
    if (file.url) {
      window.open(file.url, "_blank");
    }
  };

  const handleDelete = async (item: CloudFile | any) => {
    try {
      await deleteItem(currentRoot, item.path);
      setContextMenu(null);

      // Refresh file list
      const response = await getCloudDiskContents(currentRoot, currentPath);
      setFiles(response.files || []);
      setFolders(response.folders || []);
    } catch (err: any) {
      setError(err.message || "删除失败");
    }
  };

  const handleRename = (item: CloudFile | any) => {
    setRenamePath(item.path);
    setRenameName(item.name);
    setRenameDialogOpen(true);
    setContextMenu(null);
  };

  const handleRenameConfirm = async () => {
    if (!renameName.trim()) return;

    try {
      await renameItem(currentRoot, renamePath, renameName);
      setRenameDialogOpen(false);
      setRenameName("");
      setRenamePath("");

      // Refresh file list
      const response = await getCloudDiskContents(currentRoot, currentPath);
      setFiles(response.files || []);
      setFolders(response.folders || []);
    } catch (err: any) {
      setError(err.message || "重命名失败");
    }
  };

  // Check if folder is protected (cannot be deleted)
  const isProtectedFolder = (folderName: string) => {
    return rootDirs.some((dir) => dir.id === folderName);
  };

  // Sort items
  const sortedItems = [...folders, ...files].sort((a, b) => {
    let comparison = 0;

    if (sortBy === "name") {
      comparison = a.name.localeCompare(b.name, "zh-CN");
    } else if (sortBy === "size") {
      const sizeA = a.size || 0;
      const sizeB = b.size || 0;
      comparison = sizeA - sizeB;
    } else if (sortBy === "date") {
      comparison =
        new Date(a.modified_at).getTime() - new Date(b.modified_at).getTime();
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Separate sorted items back into folders and files
  const sortedFolders = sortedItems.filter((item) => item.type === "folder");
  const sortedFiles = sortedItems.filter((item) => item.type === "file");

  // Handle sort change
  const handleSortChange = (newSortBy: "name" | "size" | "date") => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
    setSortMenuAnchor(null);
  };

  // Get path segments for breadcrumbs
  const pathSegments = currentPath.split("/").filter(Boolean);

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">请先登录</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <CloudQueue sx={{ fontSize: 32, color: "primary.main" }} />
            <Typography variant="h4" fontWeight={700}>
              我的云盘
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<CreateNewFolder />}
              onClick={() => setNewFolderDialogOpen(true)}
            >
              新建文件夹
            </Button>
            <Button
              variant="contained"
              startIcon={<Upload />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              上传文件
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </Stack>
        </Stack>

        {/* Root Directory Selector */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              选择目录:
            </Typography>
            {rootDirs.map((root) => (
              <Button
                key={root.id}
                variant={currentRoot === root.id ? "contained" : "outlined"}
                onClick={() => handleRootChange(root.id)}
                startIcon={<Folder />}
              >
                {root.name}
              </Button>
            ))}
          </Stack>
        </Paper>

        {/* Breadcrumbs */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
            <Link
              component="button"
              onClick={() => handleBreadcrumbClick(-1)}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Home sx={{ mr: 0.5, fontSize: 16 }} />
              {rootDirs.find((r) => r.id === currentRoot)?.name || "我的云盘"}
            </Link>
            {pathSegments.map((segment, index) => (
              <Link
                key={index}
                component="button"
                onClick={() => handleBreadcrumbClick(index)}
              >
                {segment}
              </Link>
            ))}
          </Breadcrumbs>
        </Paper>

        {/* Upload Progress */}
        {uploading && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              正在上传文件...
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Paper>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Content */}
        <Paper
          sx={{ p: 3 }}
          onClick={(e) => {
            // 点击空白区域取消选中
            if (e.target === e.currentTarget) {
              setSelectedItem(null);
              setEditingItem(null);
            }
          }}
        >
          {/* Toolbar */}
          {!loading && (
            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              spacing={1}
              sx={{ mb: 3 }}
            >
              <Tooltip title="排序">
                <IconButton
                  onClick={(e) => setSortMenuAnchor(e.currentTarget)}
                  size="small"
                >
                  <Sort />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={sortMenuAnchor}
                open={Boolean(sortMenuAnchor)}
                onClose={() => setSortMenuAnchor(null)}
              >
                <MenuItem
                  onClick={() => handleSortChange("name")}
                  selected={sortBy === "name"}
                >
                  <ListItemIcon>
                    {sortBy === "name" && sortOrder === "asc" ? (
                      <ArrowUpward fontSize="small" />
                    ) : sortBy === "name" && sortOrder === "desc" ? (
                      <ArrowDownward fontSize="small" />
                    ) : null}
                  </ListItemIcon>
                  <ListItemText>按名称</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => handleSortChange("size")}
                  selected={sortBy === "size"}
                >
                  <ListItemIcon>
                    {sortBy === "size" && sortOrder === "asc" ? (
                      <ArrowUpward fontSize="small" />
                    ) : sortBy === "size" && sortOrder === "desc" ? (
                      <ArrowDownward fontSize="small" />
                    ) : null}
                  </ListItemIcon>
                  <ListItemText>按大小</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => handleSortChange("date")}
                  selected={sortBy === "date"}
                >
                  <ListItemIcon>
                    {sortBy === "date" && sortOrder === "asc" ? (
                      <ArrowUpward fontSize="small" />
                    ) : sortBy === "date" && sortOrder === "desc" ? (
                      <ArrowDownward fontSize="small" />
                    ) : null}
                  </ListItemIcon>
                  <ListItemText>按日期</ListItemText>
                </MenuItem>
              </Menu>
              <Divider orientation="vertical" flexItem />
              <ToggleButtonGroup
                value={layout}
                exclusive
                onChange={(_, newLayout) => {
                  if (newLayout !== null) setLayout(newLayout);
                }}
                size="small"
              >
                <ToggleButton value="grid">
                  <ViewModule />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewList />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : layout === "grid" ? (
            <Grid
              container
              spacing={2}
              columns={{ xs: 12, sm: 12, md: 12, lg: 12 }}
            >
              {/* Folders */}
              {sortedFolders.map((folder) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={folder.id}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Card
                      className="folder-card"
                      sx={{
                        cursor: "pointer",
                        height: 180,
                        width: 180,
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        border: "none",
                        boxShadow: "none",
                        bgcolor:
                          editingItem?.id === folder.id
                            ? "action.selected"
                            : "transparent",
                        overflow: "hidden",
                        "&:hover": {
                          boxShadow: 3,
                          "& .folder-action-button": {
                            opacity: 1,
                            visibility: "visible",
                          },
                          "& .folder-icon-container": {
                            transform: "scale(1.15)",
                          },
                          "& .folder-icon-container .folder-front-side": {
                            transform: "rotateX(-40deg) skewX(15deg)",
                          },
                          "& .folder-icon-container .folder-back-layer-1": {
                            transform: "rotateX(-5deg) skewX(5deg)",
                          },
                          "& .folder-icon-container .folder-back-layer-2": {
                            transform: "rotateX(-15deg) skewX(12deg)",
                          },
                        },
                      }}
                      onClick={() => handleFolderSelect(folder)}
                      onDoubleClick={() => handleFolderDoubleClick(folder)}
                    >
                      <CardContent
                        sx={{
                          p: 2,
                          pb: 1.5,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          flex: 1,
                          position: "relative",
                          width: "100%",
                          minWidth: 0,
                          overflow: "hidden",
                        }}
                      >
                        {!isProtectedFolder(folder.name) && (
                          <IconButton
                            className="folder-action-button"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContextMenu(e, folder);
                            }}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              bgcolor: "background.paper",
                              boxShadow: 1,
                              opacity: 0,
                              visibility: "hidden",
                              transition: "opacity 0.2s, visibility 0.2s",
                              "&:hover": {
                                bgcolor: "background.paper",
                              },
                            }}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        )}
                        <Box
                          className="folder-icon-container"
                          sx={{
                            mb: 1,
                            mt: 0.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "transform 0.2s ease-in-out",
                          }}
                        >
                          <FolderIcon size={64} />
                        </Box>
                        <Box
                          sx={{
                            width: "100%",
                            minWidth: 0,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          {editingItem?.id === folder.id ? (
                            <TextField
                              autoFocus
                              value={editingName}
                              onChange={handleEditingNameChange}
                              onKeyDown={handleEditingNameKeyPress}
                              onBlur={handleEditingNameConfirm}
                              onClick={(e) => e.stopPropagation()}
                              size="small"
                              sx={{
                                width: "100%",
                                maxWidth: "100%",
                                "& .MuiOutlinedInput-root": {
                                  py: 0.5,
                                  fontSize: "0.875rem",
                                },
                              }}
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              textAlign="center"
                              noWrap
                              sx={{
                                maxWidth: 150,
                                minWidth: 0,
                                cursor:
                                  selectedItem?.id === folder.id
                                    ? "text"
                                    : "default",
                                px: 1,
                                py: 0.5,
                                borderRadius: 0.5,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "block",
                                "&:hover":
                                  selectedItem?.id === folder.id
                                    ? {
                                        bgcolor: "action.hover",
                                      }
                                    : {},
                              }}
                              onClick={(e) => handleFolderNameClick(e, folder)}
                              title={folder.name}
                            >
                              {folder.name}
                            </Typography>
                          )}
                        </Box>
                        <Box
                          sx={{
                            width: "100%",
                            minWidth: 0,
                            mt: 0.5,
                            mb: 0,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            textAlign="center"
                            noWrap
                            sx={{
                              maxWidth: 150,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                            }}
                          >
                            {formatDate(folder.modified_at)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              ))}

              {/* Files */}
              {sortedFiles.map((file) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={file.id}>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Card
                      sx={{
                        cursor: "pointer",
                        height: 180,
                        width: 180,
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        border: "none",
                        boxShadow: "none",
                        bgcolor:
                          editingItem?.id === file.id
                            ? "action.selected"
                            : "transparent",
                        overflow: "hidden",
                        "&:hover": {
                          boxShadow: 3,
                          "& .file-action-button": {
                            opacity: 1,
                            visibility: "visible",
                          },
                          "& .file-icon-container": {
                            transform: "scale(1.15)",
                          },
                        },
                      }}
                      onClick={() => handleFileSelect(file)}
                      onContextMenu={(e) => handleContextMenu(e, file)}
                    >
                      <CardContent
                        sx={{
                          p: 2,
                          pb: 1.5,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          flex: 1,
                          position: "relative",
                          width: "100%",
                          minWidth: 0,
                          overflow: "hidden",
                        }}
                      >
                        <IconButton
                          className="file-action-button"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContextMenu(e, file);
                          }}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "background.paper",
                            boxShadow: 1,
                            opacity: 0,
                            visibility: "hidden",
                            transition: "opacity 0.2s, visibility 0.2s",
                            "&:hover": {
                              bgcolor: "background.paper",
                            },
                          }}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                        <Box
                          className="file-icon-container"
                          sx={{
                            mb: 1,
                            mt: 0.5,
                            transition: "transform 0.2s ease-in-out",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {getFileIcon(file.name, file.mime_type, 64)}
                        </Box>
                        <Box
                          sx={{
                            width: "100%",
                            minWidth: 0,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          {editingItem?.id === file.id ? (
                            <TextField
                              autoFocus
                              value={editingName}
                              onChange={handleEditingNameChange}
                              onKeyDown={handleEditingNameKeyPress}
                              onBlur={handleEditingNameConfirm}
                              onClick={(e) => e.stopPropagation()}
                              size="small"
                              sx={{
                                width: "100%",
                                maxWidth: "100%",
                                "& .MuiOutlinedInput-root": {
                                  py: 0.5,
                                  fontSize: "0.875rem",
                                },
                              }}
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              textAlign="center"
                              noWrap
                              sx={{
                                maxWidth: 150,
                                minWidth: 0,
                                cursor:
                                  selectedItem?.id === file.id
                                    ? "text"
                                    : "default",
                                px: 1,
                                py: 0.5,
                                borderRadius: 0.5,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "block",
                                "&:hover":
                                  selectedItem?.id === file.id
                                    ? {
                                        bgcolor: "action.hover",
                                      }
                                    : {},
                              }}
                              onClick={(e) => handleFileNameClick(e, file)}
                              title={file.name}
                            >
                              {file.name}
                            </Typography>
                          )}
                        </Box>
                        <Box
                          sx={{
                            width: "100%",
                            minWidth: 0,
                            mt: 0.5,
                            mb: 0,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            textAlign="center"
                            noWrap
                            sx={{
                              maxWidth: 150,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                            }}
                          >
                            {file.size && formatFileSize(file.size)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              ))}

              {/* Empty state */}
              {sortedFolders.length === 0 &&
                sortedFiles.length === 0 &&
                !loading && (
                  <Box sx={{ width: "100%", textAlign: "center", py: 8 }}>
                    <CloudQueue
                      sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      此文件夹为空
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      上传文件或创建文件夹开始使用
                    </Typography>
                  </Box>
                )}
            </Grid>
          ) : (
            <List>
              {/* Folders */}
              {sortedFolders.map((folder) => (
                <ListItem
                  key={folder.id}
                  disablePadding
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    bgcolor:
                      editingItem?.id === folder.id
                        ? "action.selected"
                        : selectedItem?.id === folder.id
                        ? "action.selected"
                        : "transparent",
                  }}
                  secondaryAction={
                    !isProtectedFolder(folder.name) ? (
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, folder);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    ) : null
                  }
                >
                  <ListItemButton
                    onClick={() => handleFolderSelect(folder)}
                    onDoubleClick={() => handleFolderDoubleClick(folder)}
                  >
                    <ListItemIcon sx={{ minWidth: 100, mr: 2 }}>
                      <FolderIcon size={64} />
                    </ListItemIcon>
                    {editingItem?.id === folder.id ? (
                      <TextField
                        autoFocus
                        value={editingName}
                        onChange={handleEditingNameChange}
                        onKeyDown={handleEditingNameKeyPress}
                        onBlur={handleEditingNameConfirm}
                        onClick={(e) => e.stopPropagation()}
                        size="small"
                        sx={{
                          flex: 1,
                          mr: 2,
                          "& .MuiOutlinedInput-root": {
                            py: 0.5,
                            fontSize: "0.875rem",
                          },
                        }}
                      />
                    ) : (
                      <ListItemText
                        primary={
                          <Typography
                            onClick={(e) => handleFolderNameClick(e, folder)}
                            sx={{
                              cursor:
                                selectedItem?.id === folder.id
                                  ? "text"
                                  : "default",
                            }}
                          >
                            {folder.name}
                          </Typography>
                        }
                        secondary={formatDate(folder.modified_at)}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}

              {/* Files */}
              {sortedFiles.map((file) => (
                <ListItem
                  key={file.id}
                  disablePadding
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    bgcolor:
                      editingItem?.id === file.id
                        ? "action.selected"
                        : selectedItem?.id === file.id
                        ? "action.selected"
                        : "transparent",
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, file);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  }
                  onContextMenu={(e) => handleContextMenu(e, file)}
                >
                  <ListItemButton onClick={() => handleFileSelect(file)}>
                    <ListItemIcon sx={{ minWidth: 100, mr: 2 }}>
                      {getFileIcon(file.name, file.mime_type, 64)}
                    </ListItemIcon>
                    {editingItem?.id === file.id ? (
                      <TextField
                        autoFocus
                        value={editingName}
                        onChange={handleEditingNameChange}
                        onKeyDown={handleEditingNameKeyPress}
                        onBlur={handleEditingNameConfirm}
                        onClick={(e) => e.stopPropagation()}
                        size="small"
                        sx={{
                          flex: 1,
                          mr: 2,
                          "& .MuiOutlinedInput-root": {
                            py: 0.5,
                            fontSize: "0.875rem",
                          },
                        }}
                      />
                    ) : (
                      <ListItemText
                        primary={
                          <Typography
                            onClick={(e) => handleFileNameClick(e, file)}
                            sx={{
                              cursor:
                                selectedItem?.id === file.id
                                  ? "text"
                                  : "default",
                            }}
                          >
                            {file.name}
                          </Typography>
                        }
                        secondary={
                          <>
                            {file.size && formatFileSize(file.size)} •{" "}
                            {formatDate(file.modified_at)}
                          </>
                        }
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}

              {/* Empty state */}
              {sortedFolders.length === 0 &&
                sortedFiles.length === 0 &&
                !loading && (
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <CloudQueue
                      sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      此文件夹为空
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      上传文件或创建文件夹开始使用
                    </Typography>
                  </Box>
                )}
            </List>
          )}
        </Paper>
      </Container>

      {/* New Folder Dialog */}
      <Dialog
        open={newFolderDialogOpen}
        onClose={() => setNewFolderDialogOpen(false)}
      >
        <DialogTitle>新建文件夹</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="文件夹名称"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleCreateFolder();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialogOpen(false)}>取消</Button>
          <Button onClick={handleCreateFolder} variant="contained">
            创建
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog
        open={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
      >
        <DialogTitle>重命名</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="新名称"
            fullWidth
            variant="outlined"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleRenameConfirm();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>取消</Button>
          <Button onClick={handleRenameConfirm} variant="contained">
            确定
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {contextMenu?.item?.type === "file" && (
          <MenuItem
            onClick={() =>
              contextMenu?.item && handleDownload(contextMenu.item)
            }
          >
            <ListItemIcon>
              <Download fontSize="small" />
            </ListItemIcon>
            <ListItemText>下载</ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => contextMenu?.item && handleRename(contextMenu.item)}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>重命名</ListItemText>
        </MenuItem>
        {contextMenu?.item && !isProtectedFolder(contextMenu.item.name) && (
          <MenuItem
            onClick={() => contextMenu?.item && handleDelete(contextMenu.item)}
          >
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText>删除</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}
