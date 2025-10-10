/**
 * 图片相关 API 接口
 * 用户图片的上传、管理等功能
 */

import { apiRequest } from './api';
import type { ImageResponse, ImageUploadResponse, ImageListResponse } from '../../types';

// 图片 API 函数
export const imageApi = {
  /**
   * 上传图片到用户图片库
   */
  async uploadImage(
    file: File,
    description?: string,
    tags?: string,
    onProgress?: (progress: number) => void
  ): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (tags) formData.append('tags', tags);

    return apiRequest<ImageUploadResponse>('/image/upload', {
      method: 'POST',
      data: formData,
      onUploadProgress: onProgress ? (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        onProgress(progress);
      } : undefined,
    });
  },

  /**
   * 获取用户的图片列表
   */
  async getUserImages(params: {
    page?: number;
    page_size?: number;
    search?: string;
    tags?: string;
  } = {}): Promise<ImageListResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.tags) queryParams.append('tags', params.tags);

    const queryString = queryParams.toString();
    return apiRequest<ImageListResponse>(`/image/?${queryString}`);
  },

  /**
   * 获取单个图片信息
   */
  async getImage(imageId: number): Promise<ImageResponse> {
    return apiRequest<ImageResponse>(`/image/${imageId}`);
  },

  /**
   * 更新图片信息
   */
  async updateImage(
    imageId: number,
    updateData: {
      description?: string;
      tags?: string;
      is_active?: boolean;
    }
  ): Promise<ImageResponse> {
    return apiRequest<ImageResponse>(`/image/${imageId}`, {
      method: 'PUT',
      data: updateData,
    });
  },

  /**
   * 删除图片
   */
  async deleteImage(imageId: number): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/image/${imageId}`, {
      method: 'DELETE',
    });
  },

  /**
   * 获取图片访问URL
   */
  async getImageUrl(imageId: number): Promise<{ url: string }> {
    return apiRequest<{ url: string }>(`/image/${imageId}/url`);
  },
};
