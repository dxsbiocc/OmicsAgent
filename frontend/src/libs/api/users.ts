/**
 * 用户相关 API 接口
 * 用户管理、用户信息查询等功能（管理员功能）
 */

import { apiRequest, buildQueryParams } from './api';
import type {
  UserManagement,
  UserManagementResponse,
  UserManagementUpdate,
  UserManagementStats,
  UserListParams,
  PaginationParams,
} from '../../types';

// 用户 API 函数
export const usersApi = {
  /**
   * 获取用户列表（管理员）
   */
  async getUsers(params: UserListParams = {}): Promise<{
    items: UserManagementResponse[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const queryString = buildQueryParams(params);
    return apiRequest(`/users?${queryString}`);
  },

  /**
   * 获取单个用户（管理员）
   */
  async getUser(id: number): Promise<UserManagementResponse> {
    return apiRequest<UserManagementResponse>(`/users/${id}`);
  },

  /**
   * 更新用户信息（管理员）
   */
  async updateUser(id: number, userData: UserManagementUpdate): Promise<UserManagementResponse> {
    return apiRequest<UserManagementResponse>(`/users/${id}`, {
      method: 'PUT',
      data: userData,
    });
  },

  /**
   * 删除用户（管理员）
   */
  async deleteUser(id: number): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * 激活/停用用户（管理员）
   */
  async toggleUserStatus(id: number, isActive: boolean): Promise<UserManagementResponse> {
    return apiRequest<UserManagementResponse>(`/users/${id}/status`, {
      method: 'POST',
      data: { is_active: isActive },
    });
  },

  /**
   * 设置/取消管理员权限（管理员）
   */
  async toggleAdminStatus(id: number, isAdmin: boolean): Promise<UserManagementResponse> {
    return apiRequest<UserManagementResponse>(`/users/${id}/admin`, {
      method: 'POST',
      data: { is_admin: isAdmin },
    });
  },

  /**
   * 获取用户统计信息（管理员）
   */
  async getUserStats(): Promise<UserManagementStats> {
    return apiRequest<UserManagementStats>('/users/stats');
  },

  /**
   * 搜索用户（管理员）
   */
  async searchUsers(query: string, params: Omit<UserListParams, 'search'> = {}): Promise<{
    items: UserManagementResponse[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const searchParams = { ...params, search: query };
    const queryString = buildQueryParams(searchParams);
    return apiRequest(`/users/search?${queryString}`);
  },

  /**
   * 获取用户的博客文章
   */
  async getUserBlogs(
    id: number,
    params: PaginationParams = {}
  ): Promise<{
    items: any[]; // BlogPost 类型
    total: number;
    skip: number;
    limit: number;
  }> {
    const queryString = buildQueryParams(params);
    return apiRequest(`/users/${id}/blogs?${queryString}`);
  },

  /**
   * 获取用户的评论
   */
  async getUserComments(
    id: number,
    params: PaginationParams = {}
  ): Promise<{
    items: any[]; // Comment 类型
    total: number;
    skip: number;
    limit: number;
  }> {
    const queryString = buildQueryParams(params);
    return apiRequest(`/users/${id}/comments?${queryString}`);
  },

  /**
   * 获取活跃用户（按博客和评论数量排序）
   */
  async getActiveUsers(limit: number = 10): Promise<UserManagementResponse[]> {
    return apiRequest<UserManagementResponse[]>(`/users/active?limit=${limit}`);
  },

  /**
   * 获取最近注册的用户
   */
  async getRecentUsers(limit: number = 10): Promise<UserManagementResponse[]> {
    return apiRequest<UserManagementResponse[]>(`/users/recent?limit=${limit}`);
  },

  /**
   * 重置用户密码（管理员）
   */
  async resetUserPassword(id: number, newPassword: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/users/${id}/reset-password`, {
      method: 'POST',
      data: { new_password: newPassword },
    });
  },

  /**
   * 获取用户活动日志（管理员）
   */
  async getUserActivityLog(
    id: number,
    params: PaginationParams = {}
  ): Promise<{
    items: Array<{
      id: number;
      action: string;
      description: string;
      created_at: string;
      ip_address: string | null;
    }>;
    total: number;
    skip: number;
    limit: number;
  }> {
    const queryString = buildQueryParams(params);
    return apiRequest(`/users/${id}/activity?${queryString}`);
  },
};