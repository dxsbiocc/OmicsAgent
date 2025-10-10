/**
 * 评论相关 API 接口
 * 博客评论的增删改查、点赞、回复等功能
 */

import { apiRequest, buildQueryParams } from './api';
import type {
  Comment,
  CommentCreate,
  CommentUpdate,
  CommentResponse,
  CommentStats,
  CommentListParams,
  PaginationParams,
} from '../../types';

// 评论 API 函数
export const commentsApi = {
  /**
   * 获取评论列表
   */
  async getComments(params: CommentListParams = {}): Promise<{
    items: CommentResponse[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const queryString = buildQueryParams(params);
    return apiRequest(`/comments?${queryString}`);
  },

  /**
   * 获取单个评论
   */
  async getComment(id: number): Promise<CommentResponse> {
    return apiRequest<CommentResponse>(`/comments/${id}`);
  },

  /**
   * 创建评论
   */
  async createComment(commentData: CommentCreate): Promise<CommentResponse> {
    return apiRequest<CommentResponse>('/comments', {
      method: 'POST',
      data: commentData,
    });
  },

  /**
   * 更新评论（仅作者可更新）
   */
  async updateComment(id: number, commentData: CommentUpdate): Promise<CommentResponse> {
    return apiRequest<CommentResponse>(`/comments/${id}`, {
      method: 'PUT',
      data: commentData,
    });
  },

  /**
   * 删除评论（软删除，仅作者可删除）
   */
  async deleteComment(id: number): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/comments/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * 点赞评论
   */
  async likeComment(id: number): Promise<{ like_count: number; is_liked: boolean }> {
    return apiRequest<{ like_count: number; is_liked: boolean }>(`/comments/${id}/like`, {
      method: 'POST',
    });
  },

  /**
   * 取消点赞评论
   */
  async unlikeComment(id: number): Promise<{ like_count: number; is_liked: boolean }> {
    return apiRequest<{ like_count: number; is_liked: boolean }>(`/comments/${id}/unlike`, {
      method: 'POST',
    });
  },

  /**
   * 获取评论的回复
   */
  async getCommentReplies(
    id: number,
    params: PaginationParams = {}
  ): Promise<{
    items: CommentResponse[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const queryString = buildQueryParams(params);
    return apiRequest(`/comments/${id}/replies?${queryString}`);
  },

  /**
   * 获取目标对象的评论（如博客文章的评论）
   */
  async getTargetComments(
    targetType: string,
    targetId: number,
    params: Omit<CommentListParams, 'target_type' | 'target_id'> = {}
  ): Promise<{
    items: CommentResponse[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const queryParams = { ...params, target_type: targetType, target_id: targetId };
    const queryString = buildQueryParams(queryParams);
    return apiRequest(`/comments?${queryString}`);
  },

  /**
   * 获取评论统计信息
   */
  async getCommentStats(): Promise<CommentStats> {
    return apiRequest<CommentStats>('/comments/stats');
  },

  /**
   * 获取用户的所有评论
   */
  async getUserComments(
    userId: number,
    params: PaginationParams = {}
  ): Promise<{
    items: CommentResponse[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const queryString = buildQueryParams(params);
    return apiRequest(`/comments/user/${userId}?${queryString}`);
  },

  /**
   * 搜索评论内容
   */
  async searchComments(query: string, params: Omit<CommentListParams, 'search'> = {}): Promise<{
    items: CommentResponse[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const searchParams = { ...params, search: query };
    const queryString = buildQueryParams(searchParams);
    return apiRequest(`/comments/search?${queryString}`);
  },

  /**
   * 举报评论
   */
  async reportComment(id: number, reason: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/comments/${id}/report`, {
      method: 'POST',
      data: { reason },
    });
  },

  /**
   * 获取热门评论（按点赞数排序）
   */
  async getPopularComments(limit: number = 10): Promise<CommentResponse[]> {
    return apiRequest<CommentResponse[]>(`/comments/popular?limit=${limit}`);
  },

  /**
   * 获取最新评论
   */
  async getLatestComments(limit: number = 10): Promise<CommentResponse[]> {
    return apiRequest<CommentResponse[]>(`/comments/latest?limit=${limit}`);
  },
};