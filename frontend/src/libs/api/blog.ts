/**
 * 博客相关 API 接口
 * 博客文章的增删改查、发布、草稿等功能
 */

import { apiRequest, buildQueryParams, uploadFile } from './api';
import type {
  BlogPost,
  BlogPostCreate,
  BlogPostUpdate,
  BlogPostResponse,
  BlogListParams,
} from '../../types';

// 博客 API 函数
export const blogApi = {
  /**
   * 获取博客列表
   */
  async getBlogPosts(params: BlogListParams = {}): Promise<BlogPostResponse[]> {
    const queryString = buildQueryParams(params);
    return apiRequest<BlogPostResponse[]>(`/blog/posts?${queryString}`);
  },

  /**
   * 获取单个博客文章
   */
  async getBlogPost(id: number): Promise<BlogPostResponse> {
    return apiRequest<BlogPostResponse>(`/blog/posts/${id}`);
  },

  /**
   * 通过 slug 获取博客文章
   */
  async getBlogPostBySlug(slug: string): Promise<BlogPostResponse> {
    return apiRequest<BlogPostResponse>(`/blog/posts/slug/${slug}`);
  },

  /**
   * 创建博客文章（管理员和用户通用）
   */
  async createBlogPost(postData: BlogPostCreate): Promise<BlogPostResponse> {
    return apiRequest<BlogPostResponse>('/blog/posts', {
      method: 'POST',
      data: postData,
    });
  },

  /**
   * 更新博客文章（管理员）
   */
  async updateBlogPost(id: number, postData: BlogPostUpdate): Promise<BlogPostResponse> {
    return apiRequest<BlogPostResponse>(`/blog/posts/${id}`, {
      method: 'PUT',
      data: postData,
    });
  },

  /**
   * 删除博客文章（管理员）
   */
  async deleteBlogPost(id: number): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/blog/posts/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * 发布博客文章
   */
  async publishBlogPost(id: number): Promise<BlogPostResponse> {
    return apiRequest<BlogPostResponse>(`/blog/posts/${id}/publish`, {
      method: 'POST',
    });
  },

  /**
   * 取消发布博客文章
   */
  async unpublishBlogPost(id: number): Promise<BlogPostResponse> {
    return apiRequest<BlogPostResponse>(`/blog/posts/${id}/unpublish`, {
      method: 'POST',
    });
  },

  /**
   * 增加博客文章浏览量（已废弃 - 浏览量在获取博客时自动增加）
   */
  async incrementViewCount(id: number): Promise<{ view_count: number }> {
    // 浏览量在获取博客详情时自动增加，无需单独调用
    return Promise.resolve({ view_count: 0 });
  },

  /**
   * 点赞博客文章
   */
  async likeBlogPost(id: number): Promise<{ like_count: number; is_liked: boolean }> {
    return apiRequest<{ like_count: number; is_liked: boolean }>(`/interactions/posts/${id}/like`, {
      method: 'POST',
    });
  },

  /**
   * 取消点赞博客文章
   */
  async unlikeBlogPost(id: number): Promise<{ like_count: number; is_liked: boolean }> {
    return apiRequest<{ like_count: number; is_liked: boolean }>(`/interactions/posts/${id}/like`, {
      method: 'DELETE',
    });
  },

  /**
   * 搜索博客文章
   */
  async searchBlogPosts(query: string, params: Omit<BlogListParams, 'search'> = {}): Promise<BlogPostResponse[]> {
    const searchParams = { ...params, search: query };
    const queryString = buildQueryParams(searchParams);
    return apiRequest<BlogPostResponse[]>(`/blog/posts?${queryString}`);
  },

  /**
   * 获取热门博客文章（按浏览量排序）
   */
  async getPopularBlogPosts(limit: number = 10): Promise<BlogPostResponse[]> {
    return apiRequest<BlogPostResponse[]>(`/blog/posts?limit=${limit}&sort=view_count&order=desc`);
  },

  /**
   * 获取最新博客文章（按创建时间排序）
   */
  async getLatestBlogPosts(limit: number = 10): Promise<BlogPostResponse[]> {
    return apiRequest<BlogPostResponse[]>(`/blog/posts?limit=${limit}&sort=created_at&order=desc`);
  },

  /**
   * 上传博客背景图片
   */
  async uploadBackgroundImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; filename: string }> {
    return uploadFile<{ url: string; filename: string }>(
      '/blog/upload/background',
      file,
      onProgress
    );
  },

  /**
   * 上传博客内容图片
   */
  async uploadContentImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; filename: string }> {
    return uploadFile<{ url: string; filename: string }>(
      '/blog/upload/content',
      file,
      onProgress
    );
  },

  /**
   * 根据分类获取博客文章
   */
  async getBlogPostsByCategory(
    categoryId: number,
    skip: number = 0,
    limit: number = 20
  ): Promise<BlogPostResponse[]> {
    return apiRequest<BlogPostResponse[]>(
      `/blog/posts/category/${categoryId}?skip=${skip}&limit=${limit}`
    );
  },

  /**
   * 获取分类统计信息
   */
  async getCategoryStats(categoryId: number): Promise<{
    total_posts: number;
    published_posts: number;
    draft_posts: number;
    featured_posts: number;
    total_views: number;
    total_likes: number;
    total_favorites: number;
    total_comments: number;
  }> {
    return apiRequest(`/blog/posts/category/${categoryId}/stats`);
  },

  /**
   * 更新博客文章分类
   */
  async updatePostCategory(
    postId: number,
    categoryId: number
  ): Promise<BlogPostResponse> {
    return apiRequest<BlogPostResponse>(`/blog/posts/${postId}/category`, {
      method: 'PUT',
      data: { category_id: categoryId },
    });
  },

  /**
   * 切换博客文章评论状态
   */
  async togglePostComments(
    postId: number,
    commentsEnabled: boolean
  ): Promise<BlogPostResponse> {
    return apiRequest<BlogPostResponse>(`/blog/posts/${postId}/comments`, {
      method: 'PUT',
      data: { comments_enabled: commentsEnabled },
    });
  },

  /**
   * 收藏博客文章
   */
  async favoriteBlogPost(id: number): Promise<{ favorite_count: number; is_favorited: boolean }> {
    return apiRequest<{ favorite_count: number; is_favorited: boolean }>(`/interactions/posts/${id}/favorite`, {
      method: 'POST',
    });
  },

  /**
   * 取消收藏博客文章
   */
  async unfavoriteBlogPost(id: number): Promise<{ favorite_count: number; is_favorited: boolean }> {
    return apiRequest<{ favorite_count: number; is_favorited: boolean }>(`/interactions/posts/${id}/favorite`, {
      method: 'DELETE',
    });
  },

  /**
   * 创建评论
   */
  async createComment(postId: number, commentData: { content: string }): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/comments/`, {
      method: 'POST',
      data: {
        ...commentData,
        target_type: 'blog_post',
        target_id: postId,
      },
    });
  },

  /**
   * 获取评论列表
   */
  async getComments(postId: number, skip: number = 0, limit: number = 20): Promise<{
    items: any[];
    total: number;
    skip: number;
    limit: number;
  }> {
    return apiRequest(`/comments/?target_type=blog_post&target_id=${postId}&skip=${skip}&limit=${limit}`);
  },
};
