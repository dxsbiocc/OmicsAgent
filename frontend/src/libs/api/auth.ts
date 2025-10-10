/**
 * 认证相关 API 接口
 * 用户注册、登录、登出、密码修改等功能
 */

import { apiRequest, apiClient } from './api';
import type {
  User,
  UserCreate,
  UserLogin,
  UserUpdate,
  PasswordChange,
  Token,
  UserResponse,
} from '../../types';

// 头像相关类型
interface AvatarUploadResponse {
  success: boolean;
  message: string;
  avatar_url?: string;
}

interface AvatarPresetResponse {
  filename: string;
  url: string;
  display_name: string;
}

// 认证 API 函数
export const authApi = {
  /**
   * 用户注册
   */
  async register(userData: UserCreate): Promise<UserResponse> {
    const response = await apiRequest<UserResponse>('/auth/register', {
      method: 'POST',
      data: userData,
    });
    
    // HttpOnly Cookie会自动设置，无需手动存储
    
    return response;
  },

  /**
   * 用户登录
   */
  async login(loginData: UserLogin): Promise<UserResponse> {
    const response = await apiRequest<UserResponse>('/auth/login-json', {
      method: 'POST',
      data: loginData,
    });
    // HttpOnly Cookie会自动设置，无需手动存储
    
    return response;
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    return apiRequest<User>('/auth/me');
  },

  /**
   * 更新用户信息
   */
  async updateUser(userData: UserUpdate): Promise<User> {
    return apiRequest<User>('/auth/update', {
      method: 'PUT',
      data: userData,
    });
  },

  /**
   * 修改密码
   */
  async changePassword(passwordData: PasswordChange): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/change-password', {
      method: 'POST',
      data: passwordData,
    });
  },

  /**
   * 登出（调用后端API清除HttpOnly Cookie）
   */
  async logout(): Promise<void> {
    try {
      // 调用后端登出API，清除HttpOnly Cookie
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('登出API调用失败:', error);
      // 即使API调用失败，也继续执行本地清理
    }
  },

  /**
   * 检查是否已登录（通过API调用验证）
   * 注意：由于使用HttpOnly Cookie，无法在客户端检查token存在性
   * 只能通过API调用来验证认证状态
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * 获取存储的用户信息（通过API调用获取）
   */
  async getStoredUser(): Promise<User | null> {
    try {
      return await this.getCurrentUser();
    } catch (error) {
      return null;
    }
  },


  /**
   * 发送邮箱验证码
   */
  async sendVerificationEmail(email?: string): Promise<{ message: string }> {
    const storedUser = await this.getStoredUser();
    const targetEmail = email || storedUser?.email;
    if (!targetEmail) {
      throw new Error('邮箱地址不能为空');
    }
    
    return apiRequest<{ message: string }>('/auth/send-verification-email', {
      method: 'POST',
      data: { email: targetEmail },
    });
  },

  /**
   * 验证邮箱验证码
   */
  async verifyEmail(code: string): Promise<{ message: string; user: User }> {
    return apiRequest<{ message: string; user: User }>('/auth/verify-email', {
      method: 'POST',
      data: { code },
    });
  },

  /**
   * 重新发送邮箱验证码
   */
  async resendVerificationEmail(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/resend-verification-email', {
      method: 'POST',
    });
  },

  /**
   * 检查邮箱验证状态
   */
  async checkEmailVerificationStatus(): Promise<{ is_email_verified: boolean; email: string }> {
    return apiRequest<{ is_email_verified: boolean; email: string }>('/auth/email-verification-status');
  },

  /**
   * 上传头像
   */
  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiRequest<AvatarUploadResponse>('/auth/avatar/upload', {
      method: 'POST',
      data: formData,
      // 不设置Content-Type，让浏览器自动设置multipart/form-data边界
    });
  },

  /**
   * 设置预设头像
   */
  async setPresetAvatar(avatarUrl: string): Promise<AvatarUploadResponse> {
    console.log('setPresetAvatar', avatarUrl);
    return apiRequest<AvatarUploadResponse>('/auth/avatar/preset', {
      method: 'PUT',
      data: { avatar_url: avatarUrl },
    });
  },

  /**
   * 获取预设头像列表
   */
  async getPresetAvatars(): Promise<AvatarPresetResponse[]> {
    return apiRequest<AvatarPresetResponse[]>('/auth/avatar/presets');
  },

  /**
   * 删除头像
   */
  async deleteAvatar(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/avatar', {
      method: 'DELETE',
    });
  },
};
