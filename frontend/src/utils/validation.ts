/**
 * 表单校验工具函数
 * 提供统一的输入内容校验功能
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id: number | null;
  category_name: string;
  tag_ids: number[];
  tag_names: string[];
}

/**
 * 校验博客表单数据
 * @param formData 表单数据
 * @returns 校验结果
 */
export const validateBlogForm = (formData: BlogFormData): ValidationResult => {
  const errors: string[] = [];

  // 校验标题
  if (!formData.title || formData.title.trim() === "") {
    errors.push("标题不能为空");
  } else if (formData.title.trim().length < 2) {
    errors.push("标题至少需要2个字符");
  } else if (formData.title.trim().length > 200) {
    errors.push("标题不能超过200个字符");
  }

  // 校验内容
  if (!formData.content || formData.content.trim() === "") {
    errors.push("内容不能为空");
  } else {
    // 对于Markdown内容，移除Markdown语法标记后计算纯文本长度
    const plainText = formData.content
      .replace(/```[\s\S]*?```/g, '') // 移除代码块
      .replace(/`[^`]*`/g, '') // 移除行内代码
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 移除链接，保留文本
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // 移除图片，保留alt文本
      .replace(/#{1,6}\s*/g, '') // 移除标题标记
      .replace(/\*\*([^*]*)\*\*/g, '$1') // 移除粗体标记
      .replace(/\*([^*]*)\*/g, '$1') // 移除斜体标记
      .replace(/~~([^~]*)~~/g, '$1') // 移除删除线标记
      .replace(/^\s*[-*+]\s+/gm, '') // 移除列表标记
      .replace(/^\s*\d+\.\s+/gm, '') // 移除有序列表标记
      .replace(/^\s*>\s*/gm, '') // 移除引用标记
      .replace(/\n+/g, ' ') // 将换行符替换为空格
      .trim();
    
    if (plainText.length < 10) {
      errors.push("内容至少需要10个字符（不包括格式标记）");
    } else if (formData.content.length > 50000) {
      errors.push("内容不能超过50000个字符");
    }
  }

  // 校验摘要（可选，但如果填写了需要校验）
  if (formData.excerpt && formData.excerpt.trim() !== "") {
    if (formData.excerpt.trim().length > 500) {
      errors.push("摘要不能超过500个字符");
    }
  }

  // 校验分类
  if (!formData.category_id && (!formData.category_name || formData.category_name.trim() === "")) {
    errors.push("请选择或创建一个分类");
  }

  // 校验标签（至少需要一个标签）
  if (formData.tag_ids.length === 0 && formData.tag_names.length === 0) {
    errors.push("请至少添加一个标签");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 校验单个字段
 * @param field 字段名
 * @param value 字段值
 * @returns 校验结果
 */
export const validateField = (field: string, value: any): ValidationResult => {
  const errors: string[] = [];

  switch (field) {
    case "title":
      if (!value || value.trim() === "") {
        errors.push("标题不能为空");
      } else if (value.trim().length < 2) {
        errors.push("标题至少需要2个字符");
      } else if (value.trim().length > 200) {
        errors.push("标题不能超过200个字符");
      }
      break;

    case "content":
      if (!value || value.trim() === "") {
        errors.push("内容不能为空");
      } else {
        // 对于Markdown内容，移除Markdown语法标记后计算纯文本长度
        const plainText = value
          .replace(/```[\s\S]*?```/g, '') // 移除代码块
          .replace(/`[^`]*`/g, '') // 移除行内代码
          .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 移除链接，保留文本
          .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // 移除图片，保留alt文本
          .replace(/#{1,6}\s*/g, '') // 移除标题标记
          .replace(/\*\*([^*]*)\*\*/g, '$1') // 移除粗体标记
          .replace(/\*([^*]*)\*/g, '$1') // 移除斜体标记
          .replace(/~~([^~]*)~~/g, '$1') // 移除删除线标记
          .replace(/^\s*[-*+]\s+/gm, '') // 移除列表标记
          .replace(/^\s*\d+\.\s+/gm, '') // 移除有序列表标记
          .replace(/^\s*>\s*/gm, '') // 移除引用标记
          .replace(/\n+/g, ' ') // 将换行符替换为空格
          .trim();
        
        if (plainText.length < 10) {
          errors.push("内容至少需要10个字符（不包括格式标记）");
        } else if (value.length > 50000) {
          errors.push("内容不能超过50000个字符");
        }
      }
      break;

    case "excerpt":
      if (value && value.trim() !== "" && value.trim().length > 500) {
        errors.push("摘要不能超过500个字符");
      }
      break;

    case "category":
      if (!value) {
        errors.push("请选择分类");
      }
      break;

    case "tags":
      if (!value || value.length === 0) {
        errors.push("请至少添加一个标签");
      }
      break;

    default:
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 校验评论内容
 * @param content 评论内容
 * @returns 校验结果
 */
export const validateComment = (content: string): ValidationResult => {
  const errors: string[] = [];

  if (!content || content.trim() === "") {
    errors.push("评论内容不能为空");
  } else if (content.trim().length < 2) {
    errors.push("评论至少需要2个字符");
  } else if (content.trim().length > 1000) {
    errors.push("评论不能超过1000个字符");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 校验搜索关键词
 * @param keyword 搜索关键词
 * @returns 校验结果
 */
export const validateSearchKeyword = (keyword: string): ValidationResult => {
  const errors: string[] = [];

  if (!keyword || keyword.trim() === "") {
    errors.push("搜索关键词不能为空");
  } else if (keyword.trim().length < 1) {
    errors.push("搜索关键词至少需要1个字符");
  } else if (keyword.trim().length > 100) {
    errors.push("搜索关键词不能超过100个字符");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 校验用户名
 * @param username 用户名
 * @returns 校验结果
 */
export const validateUsername = (username: string): ValidationResult => {
  const errors: string[] = [];

  if (!username || username.trim() === "") {
    errors.push("用户名不能为空");
  } else if (username.trim().length < 2) {
    errors.push("用户名至少需要2个字符");
  } else if (username.trim().length > 20) {
    errors.push("用户名不能超过20个字符");
  } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username.trim())) {
    errors.push("用户名只能包含字母、数字、下划线和中文");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 校验邮箱
 * @param email 邮箱地址
 * @returns 校验结果
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];

  if (!email || email.trim() === "") {
    errors.push("邮箱不能为空");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push("请输入有效的邮箱地址");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 校验密码
 * @param password 密码
 * @returns 校验结果
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (!password || password === "") {
    errors.push("密码不能为空");
  } else if (password.length < 6) {
    errors.push("密码至少需要6个字符");
  } else if (password.length > 50) {
    errors.push("密码不能超过50个字符");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
