/**
 * 标签相关 API 接口
 * 博客标签的增删改查、搜索、统计等功能
 */

import { apiRequest, buildQueryParams } from './api';
import type {
  Tag,
  TagCreate,
  TagUpdate,
  TagResponse,
  TagStats,
  TagListParams,
  PaginationParams,
} from '../../types';

// 标签 API 函数
export const tagsApi = {
  /**
   * 获取标签列表
   */
  async getTags(params: TagListParams = {}): Promise<TagResponse[]> {
    const queryString = buildQueryParams(params);
    return apiRequest<TagResponse[]>(`/tags?${queryString}`);
  },

  /**
   * 获取单个标签
   */
  async getTag(id: number): Promise<TagResponse> {
    return apiRequest<TagResponse>(`/tags/${id}`);
  },

  /**
   * 通过 slug 获取标签
   */
  async getTagBySlug(slug: string): Promise<TagResponse> {
    return apiRequest<TagResponse>(`/tags/slug/${slug}`);
  },

  /**
   * 创建标签（管理员）
   */
  async createTag(tagData: TagCreate): Promise<TagResponse> {
    return apiRequest<TagResponse>('/tags', {
      method: 'POST',
      data: tagData,
    });
  },

  /**
   * 更新标签（管理员）
   */
  async updateTag(id: number, tagData: TagUpdate): Promise<TagResponse> {
    return apiRequest<TagResponse>(`/tags/${id}`, {
      method: 'PUT',
      data: tagData,
    });
  },

  /**
   * 删除标签（管理员）
   */
  async deleteTag(id: number): Promise<void> {
    return apiRequest<void>(`/tags/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * 搜索标签
   */
  async searchTags(query: string, limit: number = 10): Promise<TagResponse[]> {
    return apiRequest<TagResponse[]>(`/tags/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  /**
   * 获取热门标签
   */
  async getPopularTags(limit: number = 10): Promise<TagResponse[]> {
    return apiRequest<TagResponse[]>(`/tags/popular?limit=${limit}`);
  },

  /**
   * 获取标签统计信息
   */
  async getTagStats(): Promise<TagStats> {
    return apiRequest<TagStats>('/tags/stats');
  },

  /**
   * 批量创建标签
   */
  async createTags(tagsData: TagCreate[]): Promise<TagResponse[]> {
    return apiRequest<TagResponse[]>('/tags/batch', {
      method: 'POST',
      data: { tags: tagsData },
    });
  },

  /**
   * 获取或创建标签（如果不存在则创建）
   */
  async getOrCreateTags(tagNames: string[]): Promise<TagResponse[]> {
    return apiRequest<TagResponse[]>('/tags/get-or-create', {
      method: 'POST',
      data: { tag_names: tagNames },
    });
  },
};