/**
 * API 相关类型定义
 * 统一的 API 类型定义文件
 */

// 基础类型
export interface PaginationParams {
  skip?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ErrorResponse {
  detail: string;
  message?: string;
  status_code: number;
}

// 认证相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
  blog_count?: number;
  comment_count?: number;
  avatar_url?: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  password?: string;
  is_active?: boolean;
  is_admin?: boolean;
  is_email_verified?: boolean;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user?: User;
}

export interface UserResponse {
  user: User;
  token: Token;
}

// 博客相关类型
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  background_image: string | null;
  is_published: boolean;
  allow_comments: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  author_id: number;
  author: {
    id: number;
    username: string;
  };
  categories: Category[];
  tags: Tag[];
  view_count: number;
  like_count: number;
  comment_count: number;
}

export interface BlogPostCreate {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  background_image_url?: string;
  category_id?: number;
  category_name?: string;
  status?: string;
  featured?: boolean;
  comments_enabled?: boolean;
  tag_ids?: number[];
  tag_names?: string[];
}

export interface BlogPostUpdate {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  background_image_url?: string | null;
  category_id?: number;
  status?: string;
  featured?: boolean;
  comments_enabled?: boolean;
  tag_ids?: number[];
}

export interface BlogPostResponse {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  background_image_url: string | null;
  author_id: number | null;
  author_username: string | null;
  author_avatar_url: string | null;
  category_id: number | null;
  category_name: string | null;
  status: string;
  featured: boolean;
  comments_enabled: boolean;
  view_count: number;
  like_count: number;
  favorite_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  tags: Tag[];
  is_liked: boolean;
  is_favorited: boolean;
}

export interface BlogListParams extends PaginationParams {
  status?: string;
  featured?: boolean;
  search?: string;
  tag?: string;
  category_id?: number;
  category_slug?: string;
  sort_by?: 'created_at' | 'updated_at' | 'published_at' | 'view_count' | 'like_count';
  sort_order?: 'asc' | 'desc';
}

// 分类相关类型
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  parent_id: number | null;
  level: number;
  path: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: Category | null;
  children: Category[];
  post_count: number;
}

export interface CategoryCreate {
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  parent_id?: number | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface CategoryUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  parent_id?: number | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  children?: CategoryResponse[];
  post_count: number;
}

export interface CategoryTreeItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  level: number;
  children: CategoryTreeItem[];
  post_count: number;
}

export interface CategoryMoveRequest {
  new_parent_id: number | null;
}

export interface CategoryStats {
  total_categories: number;
  root_categories: number;
  max_depth: number;
  categories_with_posts: number;
}

export interface CategoryListParams extends PaginationParams {
  parent_id?: number | null;
  include_children?: boolean;
  include_post_count?: boolean;
}

// 标签相关类型
export interface Tag {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  post_count?: number;
}

export interface TagCreate {
  name: string;
  slug: string;
  description?: string | null;
}

export interface TagUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
}

export interface TagResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  post_count: number;
}

export interface TagStats {
  total_tags: number;
  tags_with_posts: number;
  most_used_tag: Tag | null;
  average_posts_per_tag: number;
}

export interface TagListParams extends PaginationParams {
  include_post_count?: boolean;
  min_post_count?: number;
  max_post_count?: number;
}

// 评论相关类型
export interface Comment {
  id: number;
  content: string;
  parent_id: number | null;
  target_type: string;
  target_id: number;
  author_id: number;
  author: {
    id: number;
    username: string;
  };
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  like_count: number;
  reply_count: number;
  replies?: Comment[];
  is_liked?: boolean;
}

export interface CommentCreate {
  content: string;
  parent_id?: number | null;
  target_type: string;
  target_id: number;
}

export interface CommentUpdate {
  content: string;
}

export interface CommentResponse {
  id: number;
  content: string;
  parent_id: number | null;
  target_type: string;
  target_id: number;
  author: {
    id: number;
    username: string;
  };
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  like_count: number;
  reply_count: number;
  replies: CommentResponse[];
  is_liked: boolean;
}

export interface CommentStats {
  total_comments: number;
  comments_today: number;
  comments_this_week: number;
  comments_this_month: number;
  most_active_author: {
    id: number;
    username: string;
    comment_count: number;
  } | null;
}

export interface CommentListParams extends PaginationParams {
  target_type?: string;
  target_id?: number;
  parent_id?: number | null;
  include_replies?: boolean;
  sort_by?: 'created_at' | 'like_count';
  sort_order?: 'asc' | 'desc';
}

// 用户管理相关类型
export interface UserManagement {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  blog_count?: number;
  comment_count?: number;
}

export interface UserManagementResponse {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  blog_count: number;
  comment_count: number;
}

export interface UserManagementUpdate {
  username?: string;
  email?: string;
  is_active?: boolean;
  is_admin?: boolean;
}

export interface UserManagementStats {
  total_users: number;
  active_users: number;
  admin_users: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
  most_active_user: {
    id: number;
    username: string;
    blog_count: number;
    comment_count: number;
  } | null;
}

export interface UserListParams extends PaginationParams {
  is_active?: boolean;
  is_admin?: boolean;
  search?: string;
  sort_by?: 'created_at' | 'last_login_at' | 'username' | 'email';
  sort_order?: 'asc' | 'desc';
}

// 统计相关类型
export interface GeneralStats {
  total_blogs: number;
  total_users: number;
  total_comments: number;
  total_categories: number;
  total_tags: number;
  published_blogs: number;
  draft_blogs: number;
  active_users: number;
  comments_today: number;
  blogs_today: number;
  users_today: number;
}

export interface BlogStats {
  total_blogs: number;
  published_blogs: number;
  draft_blogs: number;
  blogs_this_week: number;
  blogs_this_month: number;
  blogs_this_year: number;
  average_blogs_per_day: number;
  most_popular_blog: {
    id: number;
    title: string;
    view_count: number;
  } | null;
  most_active_author: {
    id: number;
    username: string;
    blog_count: number;
  } | null;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  admin_users: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
  users_with_blogs: number;
  users_with_comments: number;
  most_active_user: {
    id: number;
    username: string;
    blog_count: number;
    comment_count: number;
  } | null;
}

export interface CommentStats {
  total_comments: number;
  comments_today: number;
  comments_this_week: number;
  comments_this_month: number;
  average_comments_per_blog: number;
  most_commented_blog: {
    id: number;
    title: string;
    comment_count: number;
  } | null;
  most_active_commenter: {
    id: number;
    username: string;
    comment_count: number;
  } | null;
}

export interface CategoryStats {
  total_categories: number;
  categories_with_posts: number;
  most_used_category: {
    id: number;
    name: string;
    post_count: number;
  } | null;
  category_distribution: Array<{
    category_id: number;
    category_name: string;
    post_count: number;
    percentage: number;
  }>;
}

export interface TagStats {
  total_tags: number;
  tags_with_posts: number;
  most_used_tag: Tag | null;
  average_posts_per_tag: number;
  tag_frequency_distribution: Array<{
    range: string;
    count: number;
  }>;
}

export interface TimeSeriesData {
  date: string;
  blogs: number;
  users: number;
  comments: number;
}

export interface DashboardData {
  general_stats: GeneralStats;
  blog_stats: BlogStats;
  user_stats: UserStats;
  comment_stats: CommentStats;
  category_stats: CategoryStats;
  tag_stats: TagStats;
  recent_activity: Array<{
    type: 'blog' | 'user' | 'comment';
    description: string;
    created_at: string;
  }>;
}

export interface DateRange {
  start_date: string;
  end_date: string;
}

// 文件上传相关类型
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mime_type: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// 请求配置类型
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
}

export interface BatchRequestConfig {
  batchSize?: number;
  delay?: number;
  stopOnError?: boolean;
}

// 图片相关类型
export interface ImageBase {
  original_filename: string;
  description?: string;
  tags?: string;
}

export interface ImageCreate extends ImageBase {
  // 创建时只需要基础信息，文件通过上传接口处理
}

export interface ImageUpdate {
  description?: string;
  tags?: string;
  is_active?: boolean;
}

export interface ImageResponse extends ImageBase {
  id: number;
  filename: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  is_active: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  image?: ImageResponse;
  file_url?: string;
}

export interface ImageListResponse {
  images: ImageResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
