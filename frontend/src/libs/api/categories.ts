/**
 * 分类相关 API 接口
 * 博客分类的增删改查、层级管理等功能
 */

import { apiRequest, buildQueryParams } from './api';
import type {
  Category,
  CategoryCreate,
  CategoryUpdate,
  CategoryResponse,
  CategoryTreeItem,
  CategoryMoveRequest,
  CategoryStats,
  CategoryListParams,
  PaginationParams,
} from '../../types';

// 分类 API 函数
export const categoriesApi = {
  /**
   * 获取分类列表
   */
  async getCategories(params: CategoryListParams = {}): Promise<CategoryResponse[]> {
    const queryString = buildQueryParams(params);
    return apiRequest<CategoryResponse[]>(`/categories?${queryString}`);
  },

  /**
   * 获取分类树形结构
   */
  async getCategoryTree(): Promise<CategoryTreeItem[]> {
    return apiRequest<CategoryTreeItem[]>('/categories/tree');
  },

  /**
   * 获取单个分类
   */
  async getCategory(id: number): Promise<CategoryResponse> {
    return apiRequest<CategoryResponse>(`/categories/${id}`);
  },

  /**
   * 通过 slug 获取分类
   */
  async getCategoryBySlug(slug: string): Promise<CategoryResponse> {
    return apiRequest<CategoryResponse>(`/categories/slug/${slug}`);
  },

  /**
   * 创建分类（管理员）
   */
  async createCategory(categoryData: CategoryCreate): Promise<CategoryResponse> {
    return apiRequest<CategoryResponse>('/categories', {
      method: 'POST',
      data: categoryData,
    });
  },

  /**
   * 更新分类（管理员）
   */
  async updateCategory(id: number, categoryData: CategoryUpdate): Promise<CategoryResponse> {
    return apiRequest<CategoryResponse>(`/categories/${id}`, {
      method: 'PUT',
      data: categoryData,
    });
  },

  /**
   * 删除分类（管理员）
   */
  async deleteCategory(id: number): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * 移动分类到新的父级（管理员）
   */
  async moveCategory(id: number, moveData: CategoryMoveRequest): Promise<CategoryResponse> {
    return apiRequest<CategoryResponse>(`/categories/${id}/move`, {
      method: 'POST',
      data: moveData,
    });
  },

  /**
   * 获取分类统计信息
   */
  async getCategoryStats(): Promise<CategoryStats> {
    return apiRequest<CategoryStats>('/categories/stats');
  },

  /**
   * 获取分类下的博客文章
   */
  async getCategoryPosts(
    id: number,
    params: PaginationParams = {}
  ): Promise<{
    items: any[]; // BlogPost 类型
    total: number;
    skip: number;
    limit: number;
  }> {
    const queryString = buildQueryParams(params);
    return apiRequest(`/categories/${id}/posts?${queryString}`);
  },

  /**
   * 搜索分类
   */
  async searchCategories(query: string, params: Omit<CategoryListParams, 'search'> = {}): Promise<{
    items: CategoryResponse[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const searchParams = { ...params, search: query };
    const queryString = buildQueryParams(searchParams);
    return apiRequest(`/categories/search?${queryString}`);
  },

  /**
   * 获取根分类（没有父级的分类）
   */
  async getRootCategories(): Promise<CategoryResponse[]> {
    return apiRequest<CategoryResponse[]>('/categories/root');
  },

  /**
   * 获取分类的完整路径（从根到当前分类）
   */
  async getCategoryPath(id: number): Promise<CategoryResponse[]> {
    return apiRequest<CategoryResponse[]>(`/categories/${id}/path`);
  },
};
