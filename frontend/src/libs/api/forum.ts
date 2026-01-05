/**
 * Forum API functions
 */

import { apiRequest } from './api';

// Forum types
export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  post_count: number;
  last_post?: {
    title: string;
    author: string;
    time: string;
  };
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
    join_date: string;
    post_count: number;
  };
  category: string;
  created_at: string;
  updated_at: string;
  views: number;
  likes: number;
  dislikes: number;
  comments: Comment[];
  tags: string[];
  is_pinned: boolean;
  is_locked: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  created_at: string;
  updated_at: string;
  likes: number;
  dislikes: number;
  replies: Comment[];
  is_solution?: boolean;
}

// API Response types
export interface ForumCategoriesResponse {
  categories: ForumCategory[];
  total_categories: number;
}

export interface ForumPostsResponse {
  posts: ForumPost[];
  total_posts: number;
  current_page: number;
  total_pages: number;
}

export interface ForumPostResponse {
  post: ForumPost;
}

export interface CommentResponse {
  comment: Comment;
}

export interface CommentsResponse {
  comments: Comment[];
  total_comments: number;
  current_page: number;
  total_pages: number;
}

// Request types
export interface CreatePostRequest {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
}

export interface CreateCommentRequest {
  content: string;
  parent_id?: string; // For replies
}

export interface UpdateCommentRequest {
  content: string;
}

export interface PostSearchParams {
  query?: string;
  category?: string;
  author?: string;
  tags?: string[];
  sort_by?: 'latest' | 'popular' | 'most_commented' | 'most_liked';
  page?: number;
  limit?: number;
}

/**
 * Get all forum categories
 */
export const getForumCategories = async (): Promise<ForumCategoriesResponse> => {
  try {
    const response = await apiRequest<ForumCategoriesResponse>('/forum/categories');
    return response;
  } catch (error) {
    console.error('Failed to fetch forum categories:', error);
    throw error;
  }
};

/**
 * Get posts with optional filtering and pagination
 */
export const getForumPosts = async (params: PostSearchParams = {}): Promise<ForumPostsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.append('query', params.query);
    if (params.category) queryParams.append('category', params.category);
    if (params.author) queryParams.append('author', params.author);
    if (params.tags) queryParams.append('tags', params.tags.join(','));
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiRequest<ForumPostsResponse>(`/forum/posts?${queryParams}`);
    return response;
  } catch (error) {
    console.error('Failed to fetch forum posts:', error);
    throw error;
  }
};

/**
 * Get a specific post by ID
 */
export const getForumPost = async (postId: string): Promise<ForumPostResponse> => {
  try {
    const response = await apiRequest<ForumPostResponse>(`/forum/posts/${postId}`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch forum post ${postId}:`, error);
    throw error;
  }
};

/**
 * Create a new post
 */
export const createForumPost = async (postData: CreatePostRequest): Promise<ForumPostResponse> => {
  try {
    const response = await apiRequest<ForumPostResponse>('/forum/posts', {
      method: 'POST',
      data: postData,
    });
    return response;
  } catch (error) {
    console.error('Failed to create forum post:', error);
    throw error;
  }
};

/**
 * Update an existing post
 */
export const updateForumPost = async (postId: string, postData: UpdatePostRequest): Promise<ForumPostResponse> => {
  try {
    const response = await apiRequest<ForumPostResponse>(`/forum/posts/${postId}`, {
      method: 'PUT',
      data: postData,
    });
    return response;
  } catch (error) {
    console.error(`Failed to update forum post ${postId}:`, error);
    throw error;
  }
};

/**
 * Delete a post
 */
export const deleteForumPost = async (postId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiRequest<{ success: boolean; message: string }>(`/forum/posts/${postId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error(`Failed to delete forum post ${postId}:`, error);
    throw error;
  }
};

/**
 * Like/unlike a post
 */
export const togglePostLike = async (postId: string): Promise<{ success: boolean; likes: number; is_liked: boolean }> => {
  try {
    const response = await apiRequest<{ success: boolean; likes: number; is_liked: boolean }>(`/forum/posts/${postId}/like`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error(`Failed to toggle like for post ${postId}:`, error);
    throw error;
  }
};

/**
 * Dislike/undislike a post
 */
export const togglePostDislike = async (postId: string): Promise<{ success: boolean; dislikes: number; is_disliked: boolean }> => {
  try {
    const response = await apiRequest<{ success: boolean; dislikes: number; is_disliked: boolean }>(`/forum/posts/${postId}/dislike`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error(`Failed to toggle dislike for post ${postId}:`, error);
    throw error;
  }
};

/**
 * Bookmark/unbookmark a post
 */
export const togglePostBookmark = async (postId: string): Promise<{ success: boolean; is_bookmarked: boolean }> => {
  try {
    const response = await apiRequest<{ success: boolean; is_bookmarked: boolean }>(`/forum/posts/${postId}/bookmark`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error(`Failed to toggle bookmark for post ${postId}:`, error);
    throw error;
  }
};

/**
 * Get comments for a post
 */
export const getPostComments = async (postId: string, page: number = 1, limit: number = 20): Promise<CommentsResponse> => {
  try {
    const response = await apiRequest<CommentsResponse>(`/forum/posts/${postId}/comments?page=${page}&limit=${limit}`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch comments for post ${postId}:`, error);
    throw error;
  }
};

/**
 * Create a comment
 */
export const createComment = async (postId: string, commentData: CreateCommentRequest): Promise<CommentResponse> => {
  try {
    const response = await apiRequest<CommentResponse>(`/forum/posts/${postId}/comments`, {
      method: 'POST',
      data: commentData,
    });
    return response;
  } catch (error) {
    console.error(`Failed to create comment for post ${postId}:`, error);
    throw error;
  }
};

/**
 * Update a comment
 */
export const updateComment = async (commentId: string, commentData: UpdateCommentRequest): Promise<CommentResponse> => {
  try {
    const response = await apiRequest<CommentResponse>(`/forum/comments/${commentId}`, {
      method: 'PUT',
      data: commentData,
    });
    return response;
  } catch (error) {
    console.error(`Failed to update comment ${commentId}:`, error);
    throw error;
  }
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiRequest<{ success: boolean; message: string }>(`/forum/comments/${commentId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error(`Failed to delete comment ${commentId}:`, error);
    throw error;
  }
};

/**
 * Like/unlike a comment
 */
export const toggleCommentLike = async (commentId: string): Promise<{ success: boolean; likes: number; is_liked: boolean }> => {
  try {
    const response = await apiRequest<{ success: boolean; likes: number; is_liked: boolean }>(`/forum/comments/${commentId}/like`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error(`Failed to toggle like for comment ${commentId}:`, error);
    throw error;
  }
};

/**
 * Mark comment as solution
 */
export const markCommentAsSolution = async (commentId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiRequest<{ success: boolean; message: string }>(`/forum/comments/${commentId}/solution`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error(`Failed to mark comment ${commentId} as solution:`, error);
    throw error;
  }
};

/**
 * Search posts
 */
export const searchForumPosts = async (query: string, filters: Omit<PostSearchParams, 'query'> = {}): Promise<ForumPostsResponse> => {
  try {
    return await getForumPosts({ ...filters, query });
  } catch (error) {
    console.error(`Failed to search forum posts with query "${query}":`, error);
    throw error;
  }
};

/**
 * Get trending posts
 */
export const getTrendingPosts = async (limit: number = 10): Promise<ForumPostsResponse> => {
  try {
    const response = await apiRequest<ForumPostsResponse>(`/forum/posts/trending?limit=${limit}`);
    return response;
  } catch (error) {
    console.error('Failed to fetch trending posts:', error);
    throw error;
  }
};

/**
 * Get user's posts
 */
export const getUserPosts = async (userId: string, page: number = 1, limit: number = 20): Promise<ForumPostsResponse> => {
  try {
    const response = await apiRequest<ForumPostsResponse>(`/forum/users/${userId}/posts?page=${page}&limit=${limit}`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch posts for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Get user's bookmarked posts
 */
export const getUserBookmarks = async (page: number = 1, limit: number = 20): Promise<ForumPostsResponse> => {
  try {
    const response = await apiRequest<ForumPostsResponse>(`/forum/bookmarks?page=${page}&limit=${limit}`);
    return response;
  } catch (error) {
    console.error('Failed to fetch user bookmarks:', error);
    throw error;
  }
};

/**
 * Report a post
 */
export const reportPost = async (postId: string, reason: string, description?: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiRequest<{ success: boolean; message: string }>(`/forum/posts/${postId}/report`, {
      method: 'POST',
      data: { reason, description },
    });
    return response;
  } catch (error) {
    console.error(`Failed to report post ${postId}:`, error);
    throw error;
  }
};

/**
 * Report a comment
 */
export const reportComment = async (commentId: string, reason: string, description?: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiRequest<{ success: boolean; message: string }>(`/forum/comments/${commentId}/report`, {
      method: 'POST',
      data: { reason, description },
    });
    return response;
  } catch (error) {
    console.error(`Failed to report comment ${commentId}:`, error);
    throw error;
  }
};
