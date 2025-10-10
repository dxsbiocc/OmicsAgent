/**
 * 统计相关 API 接口
 * 网站统计数据、分析报告等功能
 */

import { apiRequest, buildQueryParams, downloadFile } from './api';
import type {
  GeneralStats,
  BlogStats,
  UserStats,
  CommentStats,
  CategoryStats,
  TagStats,
  TimeSeriesData,
  DashboardData,
  DateRange,
} from '../../types';

// 统计 API 函数
export const statisticsApi = {
  /**
   * 获取仪表板数据（管理员）
   */
  async getDashboardData(): Promise<DashboardData> {
    return apiRequest<DashboardData>('/statistics/dashboard');
  },

  /**
   * 获取总体统计信息
   */
  async getGeneralStats(): Promise<GeneralStats> {
    return apiRequest<GeneralStats>('/statistics/general');
  },

  /**
   * 获取博客统计信息
   */
  async getBlogStats(): Promise<BlogStats> {
    return apiRequest<BlogStats>('/statistics/blogs');
  },

  /**
   * 获取用户统计信息
   */
  async getUserStats(): Promise<UserStats> {
    return apiRequest<UserStats>('/statistics/users');
  },

  /**
   * 获取评论统计信息
   */
  async getCommentStats(): Promise<CommentStats> {
    return apiRequest<CommentStats>('/statistics/comments');
  },

  /**
   * 获取分类统计信息
   */
  async getCategoryStats(): Promise<CategoryStats> {
    return apiRequest<CategoryStats>('/statistics/categories');
  },

  /**
   * 获取标签统计信息
   */
  async getTagStats(): Promise<TagStats> {
    return apiRequest<TagStats>('/statistics/tags');
  },

  /**
   * 获取时间序列数据
   */
  async getTimeSeriesData(
    dateRange: DateRange,
    metric: 'blogs' | 'users' | 'comments' | 'all' = 'all'
  ): Promise<TimeSeriesData[]> {
    const queryString = buildQueryParams({
      start_date: dateRange.start_date,
      end_date: dateRange.end_date,
      metric,
    });
    return apiRequest<TimeSeriesData[]>(`/statistics/timeseries?${queryString}`);
  },

  /**
   * 获取热门内容统计
   */
  async getPopularContent(limit: number = 10): Promise<{
    popular_blogs: Array<{
      id: number;
      title: string;
      view_count: number;
      like_count: number;
      comment_count: number;
    }>;
    popular_categories: Array<{
      id: number;
      name: string;
      post_count: number;
    }>;
    popular_tags: Array<{
      id: number;
      name: string;
      post_count: number;
    }>;
  }> {
    return apiRequest(`/statistics/popular?limit=${limit}`);
  },

  /**
   * 获取活跃度统计
   */
  async getActivityStats(days: number = 30): Promise<{
    daily_activity: Array<{
      date: string;
      blogs: number;
      users: number;
      comments: number;
    }>;
    weekly_activity: Array<{
      week: string;
      blogs: number;
      users: number;
      comments: number;
    }>;
    monthly_activity: Array<{
      month: string;
      blogs: number;
      users: number;
      comments: number;
    }>;
  }> {
    return apiRequest(`/statistics/activity?days=${days}`);
  },

  /**
   * 获取增长趋势统计
   */
  async getGrowthTrends(): Promise<{
    blog_growth: {
      current_period: number;
      previous_period: number;
      growth_rate: number;
    };
    user_growth: {
      current_period: number;
      previous_period: number;
      growth_rate: number;
    };
    comment_growth: {
      current_period: number;
      previous_period: number;
      growth_rate: number;
    };
  }> {
    return apiRequest('/statistics/growth-trends');
  },

  /**
   * 导出统计数据（CSV格式）
   */
  async exportStatistics(
    type: 'blogs' | 'users' | 'comments' | 'all',
    dateRange?: DateRange,
    filename?: string
  ): Promise<void> {
    const queryString = buildQueryParams({
      type,
      ...(dateRange && {
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      }),
    });
    
    const finalFilename = filename || `statistics_${type}_${new Date().toISOString().split('T')[0]}.csv`;
    
    return downloadFile(`/statistics/export?${queryString}`, finalFilename);
  },
};
