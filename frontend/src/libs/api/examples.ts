/**
 * API 使用示例
 * 展示如何使用封装的 API 接口
 */

import { 
  api, 
  requestWithRetry, 
  requestWithCache, 
  requestWithCancel,
  dedupeRequest,
  batchRequests,
  requestState 
} from './index';

// ===== 基础使用示例 =====

/**
 * 用户认证示例
 */
export async function authExamples() {
  try {
    // 用户注册
    const registerResult = await api.auth.register({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('注册成功:', registerResult);

    // 用户登录
    const loginResult = await api.auth.login({
      username: 'testuser',
      password: 'password123'
    });
    console.log('登录成功:', loginResult);

    // 存储认证信息
    api.auth.storeAuthData(loginResult.user, loginResult.token);

    // 获取当前用户信息
    const currentUser = await api.auth.getCurrentUser();
    console.log('当前用户:', currentUser);

    // 登出
    api.auth.logout();
  } catch (error) {
    console.error('认证操作失败:', error);
  }
}

/**
 * 博客操作示例
 */
export async function blogExamples() {
  try {
    // 获取博客列表
    const blogs = await api.blog.getBlogPosts({
      limit: 10,
      is_published: true,
      sort_by: 'created_at',
      sort_order: 'desc'
    });
    console.log('博客列表:', blogs);

    // 创建博客文章
    const newBlog = await api.blog.createBlogPost({
      title: '测试博客',
      slug: 'test-blog',
      content: '这是测试内容',
      excerpt: '测试摘要',
      is_published: false,
      allow_comments: true,
      category_ids: [1],
      tag_ids: [1, 2]
    });
    console.log('创建博客成功:', newBlog);

    // 上传背景图片
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const uploadResult = await api.blog.uploadBackgroundImage(file, (progress) => {
      console.log(`上传进度: ${progress}%`);
    });
    console.log('图片上传成功:', uploadResult);

    // 发布博客
    const publishedBlog = await api.blog.publishBlogPost(newBlog.id);
    console.log('博客发布成功:', publishedBlog);

    // 搜索博客
    const searchResults = await api.blog.searchBlogPosts('测试', {
      limit: 5
    });
    console.log('搜索结果:', searchResults);

  } catch (error) {
    console.error('博客操作失败:', error);
  }
}

/**
 * 分类和标签示例
 */
export async function categoryTagExamples() {
  try {
    // 获取分类树
    const categoryTree = await api.categories.getCategoryTree();
    console.log('分类树:', categoryTree);

    // 创建新分类
    const newCategory = await api.categories.createCategory({
      name: '技术分享',
      slug: 'tech-sharing',
      description: '技术相关文章分类'
    });
    console.log('创建分类成功:', newCategory);

    // 获取标签列表
    const tags = await api.tags.getTags({
      limit: 20,
      include_post_count: true
    });
    console.log('标签列表:', tags);

    // 创建新标签
    const newTag = await api.tags.createTag({
      name: 'React',
      slug: 'react',
      description: 'React 相关文章'
    });
    console.log('创建标签成功:', newTag);

  } catch (error) {
    console.error('分类标签操作失败:', error);
  }
}

/**
 * 评论操作示例
 */
export async function commentExamples() {
  try {
    // 获取博客评论
    const comments = await api.comments.getTargetComments('blog_post', 1, {
      limit: 10,
      include_replies: true
    });
    console.log('博客评论:', comments);

    // 创建评论
    const newComment = await api.comments.createComment({
      content: '这是一条测试评论',
      target_type: 'blog_post',
      target_id: 1
    });
    console.log('创建评论成功:', newComment);

    // 点赞评论
    const likeResult = await api.comments.likeComment(newComment.id);
    console.log('点赞结果:', likeResult);

  } catch (error) {
    console.error('评论操作失败:', error);
  }
}

// ===== 高级功能示例 =====

/**
 * 重试机制示例
 */
export async function retryExample() {
  try {
    const result = await requestWithRetry(
      () => api.blog.getBlogPosts({ limit: 5 }),
      {
        maxRetries: 3,
        retryDelay: 1000,
        retryCondition: (error) => error.message.includes('timeout')
      }
    );
    console.log('重试请求成功:', result);
  } catch (error) {
    console.error('重试请求失败:', error);
  }
}

/**
 * 缓存机制示例
 */
export async function cacheExample() {
  try {
    // 第一次请求（会发送网络请求）
    const result1 = await requestWithCache(
      () => api.blog.getPopularBlogPosts(10),
      { ttl: 300000 } // 5分钟缓存
    );
    console.log('第一次请求:', result1);

    // 第二次请求（从缓存获取）
    const result2 = await requestWithCache(
      () => api.blog.getPopularBlogPosts(10),
      { ttl: 300000 }
    );
    console.log('第二次请求（缓存）:', result2);
  } catch (error) {
    console.error('缓存请求失败:', error);
  }
}

/**
 * 请求取消示例
 */
export async function cancelExample() {
  try {
    const result = await requestWithCancel(
      'blog-list',
      (signal) => api.blog.getBlogPosts({ limit: 10 }, { signal })
    );
    console.log('取消请求成功:', result);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('请求被取消');
    } else {
      console.error('取消请求失败:', error);
    }
  }
}

/**
 * 请求去重示例
 */
export async function dedupeExample() {
  try {
    // 同时发起多个相同请求，只会发送一个
    const promises = Array(5).fill(null).map(() => 
      dedupeRequest('popular-blogs', () => api.blog.getPopularBlogPosts(10))
    );
    
    const results = await Promise.all(promises);
    console.log('去重请求结果:', results);
  } catch (error) {
    console.error('去重请求失败:', error);
  }
}

/**
 * 批量请求示例
 */
export async function batchExample() {
  try {
    const requests = [
      () => api.blog.getBlogPosts({ limit: 5 }),
      () => api.categories.getCategories({ limit: 10 }),
      () => api.tags.getTags({ limit: 10 }),
      () => api.comments.getComments({ limit: 5 })
    ];
    
    const results = await batchRequests(requests, 2); // 每批2个请求
    console.log('批量请求结果:', results);
  } catch (error) {
    console.error('批量请求失败:', error);
  }
}

/**
 * 请求状态管理示例
 */
export async function stateManagementExample() {
  const requestKey = 'user-profile';
  
  try {
    // 设置加载状态
    requestState.setLoading(requestKey, true);
    
    // 执行请求
    const user = await api.auth.getCurrentUser();
    console.log('用户信息:', user);
    
    // 清除加载状态
    requestState.setLoading(requestKey, false);
    
  } catch (error) {
    // 设置错误状态
    requestState.setError(requestKey, error as Error);
    requestState.setLoading(requestKey, false);
    
    console.error('请求失败:', error);
  }
}

/**
 * 统计导出示例
 */
export async function exportExample() {
  try {
    // 导出博客统计
    await api.statistics.exportStatistics('blogs', {
      start_date: '2024-01-01',
      end_date: '2024-12-31'
    }, 'blogs_2024.csv');
    
    console.log('统计导出成功');
  } catch (error) {
    console.error('统计导出失败:', error);
  }
}

// ===== 错误处理示例 =====

/**
 * 统一错误处理示例
 */
export async function errorHandlingExample() {
  try {
    // 这个请求会失败（假设用户未登录）
    await api.blog.createBlogPost({
      title: '测试',
      slug: 'test',
      content: '测试内容',
      excerpt: '测试摘要'
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('错误类型:', error.constructor.name);
      console.error('错误消息:', error.message);
      
      // 根据错误类型进行不同处理
      if (error.message.includes('401')) {
        console.log('需要重新登录');
        // 跳转到登录页
      } else if (error.message.includes('403')) {
        console.log('权限不足');
        // 显示权限错误提示
      } else if (error.message.includes('网络')) {
        console.log('网络连接问题');
        // 显示网络错误提示
      }
    }
  }
}
