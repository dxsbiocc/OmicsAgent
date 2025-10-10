/**
 * 随机资源工具函数
 * 用于随机选择头像、背景图片等资源
 */

// 头像相关配置
export interface AvatarConfig {
  size?: number;
  background?: string;
  color?: string;
  format?: 'png' | 'svg';
}

// 背景图片分类
export enum BackgroundCategory {
  NATURE = 'nature',
  ABSTRACT = 'abstract',
  TECHNOLOGY = 'technology',
  BUSINESS = 'business',
  EDUCATION = 'education',
  HEALTH = 'health',
  TRAVEL = 'travel',
  FOOD = 'food',
  SPORTS = 'sports',
  ART = 'art',
  OTHERS = 'others',
}

// 背景图片配置
export interface BackgroundConfig {
  category?: BackgroundCategory;
  width?: number;
  height?: number;
  quality?: 'low' | 'medium' | 'high';
}

/**
 * 生成随机头像URL
 * 使用 UI Avatars 服务生成随机头像
 */
export function getRandomAvatar(config: AvatarConfig = {}): string {
  const {
    size = 48,
    background = 'random',
    color = 'fff',
    format = 'png'
  } = config;

  // 生成随机名称
  const randomNames = [
    'User', 'Guest', 'Anonymous', 'Visitor', 'Member',
    'Admin', 'Moderator', 'Editor', 'Author', 'Reader',
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon',
    'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'
  ];
  
  const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
  
  // 生成随机背景色
  const backgrounds = [
    'random', '0D8ABC', '2ECC71', 'E74C3C', 'F39C12',
    '9B59B6', '1ABC9C', '34495E', 'E67E22', '95A5A6'
  ];
  
  const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(randomName)}&background=${randomBackground}&color=${color}&size=${size}&format=${format}`;
}

/**
 * 根据用户名生成头像URL
 * 如果用户没有设置头像，使用用户名生成
 */
export function generateAvatarFromUsername(
  username: string,
  config: AvatarConfig = {}
): string {
  const {
    size = 48,
    background = 'random',
    color = 'fff',
    format = 'png'
  } = config;

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${background}&color=${color}&size=${size}&format=${format}`;
}

/**
 * 获取随机背景图片URL
 * 从本地背景图片目录中随机选择
 */
export function getRandomBackgroundImage(config: BackgroundConfig = {}): string {
  const { category = BackgroundCategory.OTHERS } = config;
  
  // 背景图片路径映射
  const backgroundPaths: Record<BackgroundCategory, string[]> = {
    [BackgroundCategory.NATURE]: [
      '/images/background/nature/1.jpg',
      '/images/background/nature/2.jpg',
      '/images/background/nature/3.jpg',
      '/images/background/nature/4.jpg',
      '/images/background/nature/5.jpg',
    ],
    [BackgroundCategory.ABSTRACT]: [
      '/images/background/abstract/1.jpg',
      '/images/background/abstract/2.jpg',
      '/images/background/abstract/3.jpg',
      '/images/background/abstract/4.jpg',
      '/images/background/abstract/5.jpg',
    ],
    [BackgroundCategory.TECHNOLOGY]: [
      '/images/background/technology/1.jpg',
      '/images/background/technology/2.jpg',
      '/images/background/technology/3.jpg',
      '/images/background/technology/4.jpg',
      '/images/background/technology/5.jpg',
    ],
    [BackgroundCategory.BUSINESS]: [
      '/images/background/business/1.jpg',
      '/images/background/business/2.jpg',
      '/images/background/business/3.jpg',
      '/images/background/business/4.jpg',
      '/images/background/business/5.jpg',
    ],
    [BackgroundCategory.EDUCATION]: [
      '/images/background/education/1.jpg',
      '/images/background/education/2.jpg',
      '/images/background/education/3.jpg',
      '/images/background/education/4.jpg',
      '/images/background/education/5.jpg',
    ],
    [BackgroundCategory.HEALTH]: [
      '/images/background/health/1.jpg',
      '/images/background/health/2.jpg',
      '/images/background/health/3.jpg',
      '/images/background/health/4.jpg',
      '/images/background/health/5.jpg',
    ],
    [BackgroundCategory.TRAVEL]: [
      '/images/background/travel/1.jpg',
      '/images/background/travel/2.jpg',
      '/images/background/travel/3.jpg',
      '/images/background/travel/4.jpg',
      '/images/background/travel/5.jpg',
    ],
    [BackgroundCategory.FOOD]: [
      '/images/background/food/1.jpg',
      '/images/background/food/2.jpg',
      '/images/background/food/3.jpg',
      '/images/background/food/4.jpg',
      '/images/background/food/5.jpg',
    ],
    [BackgroundCategory.SPORTS]: [
      '/images/background/sports/1.jpg',
      '/images/background/sports/2.jpg',
      '/images/background/sports/3.jpg',
      '/images/background/sports/4.jpg',
      '/images/background/sports/5.jpg',
    ],
    [BackgroundCategory.ART]: [
      '/images/background/art/1.jpg',
      '/images/background/art/2.jpg',
      '/images/background/art/3.jpg',
      '/images/background/art/4.jpg',
      '/images/background/art/5.jpg',
    ],
    [BackgroundCategory.OTHERS]: [
      '/images/background/others/18895874.jpg',
      '/images/background/others/18895881.jpg',
      '/images/background/others/18895888.jpg',
      '/images/background/others/18895895.jpg',
      '/images/background/others/18895902.jpg',
      '/images/background/others/18895909.jpg',
      '/images/background/others/18895916.jpg',
      '/images/background/others/18895923.jpg',
      '/images/background/others/18895930.jpg',
      '/images/background/others/18895937.jpg',
      '/images/background/others/18895944.jpg',
      '/images/background/others/18895951.jpg',
      '/images/background/others/18895958.jpg',
      '/images/background/others/18895965.jpg',
      '/images/background/others/18895972.jpg',
      '/images/background/others/18895979.jpg',
      '/images/background/others/18895986.jpg',
      '/images/background/others/18895993.jpg',
      '/images/background/others/18896000.jpg',
      '/images/background/others/18896007.jpg',
      '/images/background/others/18896014.jpg',
      '/images/background/others/18896021.jpg',
      '/images/background/others/18896028.jpg',
      '/images/background/others/18896035.jpg',
      '/images/background/others/18896042.jpg',
      '/images/background/others/18896049.jpg',
      '/images/background/others/18896056.jpg',
      '/images/background/others/18896063.jpg',
      '/images/background/others/18896070.jpg',
      '/images/background/others/18896077.jpg',
      '/images/background/others/18896084.jpg',
      '/images/background/others/18896091.jpg',
    ],
  };

  const images = backgroundPaths[category];
  const randomIndex = Math.floor(Math.random() * images.length);
  
  return images[randomIndex];
}

/**
 * 获取所有可用的背景图片
 * 返回所有分类的背景图片列表
 */
export function getAllBackgroundImages(): Record<BackgroundCategory, string[]> {
  const backgroundPaths: Record<BackgroundCategory, string[]> = {
    [BackgroundCategory.NATURE]: [
      '/images/background/nature/1.jpg',
      '/images/background/nature/2.jpg',
      '/images/background/nature/3.jpg',
      '/images/background/nature/4.jpg',
      '/images/background/nature/5.jpg',
    ],
    [BackgroundCategory.ABSTRACT]: [
      '/images/background/abstract/1.jpg',
      '/images/background/abstract/2.jpg',
      '/images/background/abstract/3.jpg',
      '/images/background/abstract/4.jpg',
      '/images/background/abstract/5.jpg',
    ],
    [BackgroundCategory.TECHNOLOGY]: [
      '/images/background/technology/1.jpg',
      '/images/background/technology/2.jpg',
      '/images/background/technology/3.jpg',
      '/images/background/technology/4.jpg',
      '/images/background/technology/5.jpg',
    ],
    [BackgroundCategory.BUSINESS]: [
      '/images/background/business/1.jpg',
      '/images/background/business/2.jpg',
      '/images/background/business/3.jpg',
      '/images/background/business/4.jpg',
      '/images/background/business/5.jpg',
    ],
    [BackgroundCategory.EDUCATION]: [
      '/images/background/education/1.jpg',
      '/images/background/education/2.jpg',
      '/images/background/education/3.jpg',
      '/images/background/education/4.jpg',
      '/images/background/education/5.jpg',
    ],
    [BackgroundCategory.HEALTH]: [
      '/images/background/health/1.jpg',
      '/images/background/health/2.jpg',
      '/images/background/health/3.jpg',
      '/images/background/health/4.jpg',
      '/images/background/health/5.jpg',
    ],
    [BackgroundCategory.TRAVEL]: [
      '/images/background/travel/1.jpg',
      '/images/background/travel/2.jpg',
      '/images/background/travel/3.jpg',
      '/images/background/travel/4.jpg',
      '/images/background/travel/5.jpg',
    ],
    [BackgroundCategory.FOOD]: [
      '/images/background/food/1.jpg',
      '/images/background/food/2.jpg',
      '/images/background/food/3.jpg',
      '/images/background/food/4.jpg',
      '/images/background/food/5.jpg',
    ],
    [BackgroundCategory.SPORTS]: [
      '/images/background/sports/1.jpg',
      '/images/background/sports/2.jpg',
      '/images/background/sports/3.jpg',
      '/images/background/sports/4.jpg',
      '/images/background/sports/5.jpg',
    ],
    [BackgroundCategory.ART]: [
      '/images/background/art/1.jpg',
      '/images/background/art/2.jpg',
      '/images/background/art/3.jpg',
      '/images/background/art/4.jpg',
      '/images/background/art/5.jpg',
    ],
    [BackgroundCategory.OTHERS]: [
      '/images/background/others/18895874.jpg',
      '/images/background/others/18895881.jpg',
      '/images/background/others/18895888.jpg',
      '/images/background/others/18895895.jpg',
      '/images/background/others/18895902.jpg',
      '/images/background/others/18895909.jpg',
      '/images/background/others/18895916.jpg',
      '/images/background/others/18895923.jpg',
      '/images/background/others/18895930.jpg',
      '/images/background/others/18895937.jpg',
      '/images/background/others/18895944.jpg',
      '/images/background/others/18895951.jpg',
      '/images/background/others/18895958.jpg',
      '/images/background/others/18895965.jpg',
      '/images/background/others/18895972.jpg',
      '/images/background/others/18895979.jpg',
      '/images/background/others/18895986.jpg',
      '/images/background/others/18895993.jpg',
      '/images/background/others/18896000.jpg',
      '/images/background/others/18896007.jpg',
      '/images/background/others/18896014.jpg',
      '/images/background/others/18896021.jpg',
      '/images/background/others/18896028.jpg',
      '/images/background/others/18896035.jpg',
      '/images/background/others/18896042.jpg',
      '/images/background/others/18896049.jpg',
      '/images/background/others/18896056.jpg',
      '/images/background/others/18896063.jpg',
      '/images/background/others/18896070.jpg',
      '/images/background/others/18896077.jpg',
      '/images/background/others/18896084.jpg',
      '/images/background/others/18896091.jpg',
    ],
  };

  return backgroundPaths;
}

/**
 * 根据分类获取背景图片数量
 */
export function getBackgroundImageCount(category: BackgroundCategory): number {
  const allImages = getAllBackgroundImages();
  return allImages[category].length;
}

/**
 * 获取随机背景图片分类
 */
export function getRandomBackgroundCategory(): BackgroundCategory {
  const categories = Object.values(BackgroundCategory);
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
}

/**
 * 生成随机颜色
 * 用于头像背景色等场景
 */
export function getRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
    '#A9DFBF', '#F9E79F', '#D5A6BD', '#AED6F1', '#A3E4D7'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * 生成随机渐变色
 * 用于背景等场景
 */
export function getRandomGradient(): string {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
  ];
  
  return gradients[Math.floor(Math.random() * gradients.length)];
}

/**
 * 检查图片URL是否有效
 * 用于验证随机生成的图片URL
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 获取默认头像
 * 当用户没有设置头像时的默认头像
 */
export function getDefaultAvatar(config: AvatarConfig = {}): string {
  const {
    size = 48,
    background = 'f0f0f0',
    color = '666',
    format = 'png'
  } = config;

  return `https://ui-avatars.com/api/?name=User&background=${background}&color=${color}&size=${size}&format=${format}`;
}

/**
 * 获取默认背景图片
 * 当没有背景图片时的默认背景
 */
export function getDefaultBackground(): string {
  return '/images/background/placeholder/combine1.svg';
}
