/**
 * Cloud Disk API functions
 */

import { apiRequest } from './api';

// Types
export interface CloudFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified_at: string;
  path: string;
  mime_type?: string;
  url?: string;
}

export interface CloudFolder {
  id: string;
  name: string;
  path: string;
  files: CloudFile[];
  folders: CloudFolder[];
  created_at: string;
  modified_at: string;
}

export interface CloudDiskResponse {
  root: string;
  path: string;
  files: CloudFile[];
  folders: CloudFolder[];
}

export interface RootDirectory {
  id: string;
  name: string;
  type: 'folder';
  path: string;
  protected: boolean;
}

export interface UploadResponse {
  success: boolean;
  file: CloudFile;
  message?: string;
}

export interface FolderCreateResponse {
  success: boolean;
  folder: CloudFolder;
  message?: string;
}

export interface FileOperationResponse {
  success: boolean;
  message?: string;
}

/**
 * Get root directories
 */
export const getRootDirectories = async (): Promise<{ roots: RootDirectory[] }> => {
  try {
    const response = await apiRequest<{ roots: RootDirectory[] }>('/cloud-disk/roots');
    return response;
  } catch (error) {
    console.error('Failed to fetch root directories:', error);
    throw error;
  }
};

/**
 * Get files and folders for current path
 */
export const getCloudDiskContents = async (
  root: string,
  path: string = ''
): Promise<CloudDiskResponse> => {
  try {
    const pathParam = path ? `&path=${encodeURIComponent(path)}` : '';
    const response = await apiRequest<CloudDiskResponse>(`/cloud-disk/contents?root=${root}${pathParam}`);
    return response;
  } catch (error) {
    console.error('Failed to fetch cloud disk contents:', error);
    throw error;
  }
};

/**
 * Upload file to cloud disk
 */
export const uploadFile = async (
  root: string,
  file: File, 
  path: string = '',
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('root', root);
    formData.append('file', file);
    if (path) {
      formData.append('path', path);
    }

    const response = await apiRequest<UploadResponse>('/cloud-disk/upload', {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response;
  } catch (error) {
    console.error('Failed to upload file:', error);
    throw error;
  }
};

/**
 * Create new folder
 */
export const createFolder = async (
  root: string,
  name: string,
  path: string = ''
): Promise<FolderCreateResponse> => {
  try {
    const formData = new FormData();
    formData.append('root', root);
    formData.append('name', name);
    if (path) {
      formData.append('path', path);
    }

    const response = await apiRequest<FolderCreateResponse>('/cloud-disk/folders', {
      method: 'POST',
      data: formData,
    });
    return response;
  } catch (error) {
    console.error('Failed to create folder:', error);
    throw error;
  }
};

/**
 * Delete file or folder
 */
export const deleteItem = async (
  root: string,
  path: string
): Promise<FileOperationResponse> => {
  try {
    const response = await apiRequest<FileOperationResponse>(
      `/cloud-disk/items?root=${root}&path=${encodeURIComponent(path)}`,
      {
        method: 'DELETE',
      }
    );
    return response;
  } catch (error) {
    console.error('Failed to delete item:', error);
    throw error;
  }
};

/**
 * Rename file or folder
 */
export const renameItem = async (
  root: string,
  path: string,
  newName: string
): Promise<{ success: boolean; message?: string; item: CloudFile | CloudFolder }> => {
  try {
    const formData = new FormData();
    formData.append('root', root);
    formData.append('path', path);
    formData.append('new_name', newName);

    const response = await apiRequest<{ success: boolean; message?: string; item: CloudFile | CloudFolder }>(
      '/cloud-disk/items/rename',
      {
        method: 'PATCH',
        data: formData,
      }
    );
    return response;
  } catch (error) {
    console.error('Failed to rename item:', error);
    throw error;
  }
};

/**
 * Move file or folder
 */
export const moveItem = async (
  itemId: string,
  itemType: 'file' | 'folder',
  targetPath: string[]
): Promise<FileOperationResponse> => {
  try {
    const response = await apiRequest<FileOperationResponse>(`/cloud-disk/${itemType}s/${itemId}/move`, {
      method: 'PUT',
      data: { target_path: targetPath.join('/') },
    });
    return response;
  } catch (error) {
    console.error(`Failed to move ${itemType}:`, error);
    throw error;
  }
};

/**
 * Copy file or folder
 */
export const copyItem = async (
  itemId: string,
  itemType: 'file' | 'folder',
  targetPath: string[]
): Promise<FileOperationResponse> => {
  try {
    const response = await apiRequest<FileOperationResponse>(`/cloud-disk/${itemType}s/${itemId}/copy`, {
      method: 'POST',
      data: { target_path: targetPath.join('/') },
    });
    return response;
  } catch (error) {
    console.error(`Failed to copy ${itemType}:`, error);
    throw error;
  }
};

/**
 * Download file
 */
export const downloadFile = async (fileId: string): Promise<Blob> => {
  try {
    const response = await fetch(`/api/cloud-disk/files/${fileId}/download`);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    return await response.blob();
  } catch (error) {
    console.error('Failed to download file:', error);
    throw error;
  }
};

/**
 * Get file preview URL
 */
export const getFilePreviewUrl = (fileId: string): string => {
  return `/api/cloud-disk/files/${fileId}/preview`;
};

/**
 * Get file download URL
 */
export const getFileDownloadUrl = (fileId: string): string => {
  return `/api/cloud-disk/files/${fileId}/download`;
};

/**
 * Search files and folders
 */
export const searchCloudDisk = async (query: string, path: string[] = []): Promise<CloudDiskResponse> => {
  try {
    const pathParam = path.length > 0 ? `&path=${path.join('/')}` : '';
    const response = await apiRequest<CloudDiskResponse>(`/cloud-disk/search?q=${encodeURIComponent(query)}${pathParam}`);
    return response;
  } catch (error) {
    console.error('Failed to search cloud disk:', error);
    throw error;
  }
};

/**
 * Get storage usage statistics
 */
export const getStorageStats = async (): Promise<{
  total_size: number;
  used_size: number;
  available_size: number;
  usage_percentage: number;
}> => {
  try {
    const response = await apiRequest<{
      total_size: number;
      used_size: number;
      available_size: number;
      usage_percentage: number;
    }>('/cloud-disk/storage-stats');
    return response;
  } catch (error) {
    console.error('Failed to fetch storage stats:', error);
    throw error;
  }
};

/**
 * Get recent files
 */
export const getRecentFiles = async (limit: number = 10): Promise<CloudFile[]> => {
  try {
    const response = await apiRequest<CloudFile[]>(`/cloud-disk/recent?limit=${limit}`);
    return response;
  } catch (error) {
    console.error('Failed to fetch recent files:', error);
    throw error;
  }
};

/**
 * Get shared files
 */
export const getSharedFiles = async (): Promise<CloudFile[]> => {
  try {
    const response = await apiRequest<CloudFile[]>('/cloud-disk/shared');
    return response;
  } catch (error) {
    console.error('Failed to fetch shared files:', error);
    throw error;
  }
};

/**
 * Share file or folder
 */
export const shareItem = async (
  itemId: string,
  itemType: 'file' | 'folder',
  permissions: {
    can_view: boolean;
    can_download: boolean;
    can_edit: boolean;
  },
  expires_at?: string
): Promise<{
  success: boolean;
  share_url: string;
  share_id: string;
  message?: string;
}> => {
  try {
    const response = await apiRequest<{
      success: boolean;
      share_url: string;
      share_id: string;
      message?: string;
    }>(`/cloud-disk/${itemType}s/${itemId}/share`, {
      method: 'POST',
      data: {
        permissions,
        expires_at,
      },
    });
    return response;
  } catch (error) {
    console.error(`Failed to share ${itemType}:`, error);
    throw error;
  }
};

/**
 * Get file metadata
 */
export const getFileMetadata = async (fileId: string): Promise<{
  id: string;
  name: string;
  size: number;
  mime_type: string;
  created_at: string;
  modified_at: string;
  path: string;
  checksum: string;
}> => {
  try {
    const response = await apiRequest<{
      id: string;
      name: string;
      size: number;
      mime_type: string;
      created_at: string;
      modified_at: string;
      path: string;
      checksum: string;
    }>(`/cloud-disk/files/${fileId}/metadata`);
    return response;
  } catch (error) {
    console.error('Failed to fetch file metadata:', error);
    throw error;
  }
};
