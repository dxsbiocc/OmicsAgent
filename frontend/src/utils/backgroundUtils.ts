/**
 * Random background image utilities
 */

// 从others目录中随机选择背景图片
export const getRandomBackgroundImage = (): string => {
  const backgroundImages = [
    '6056984.jpg',
    '34916238.jpg', 
    '38091716.jpg',
    '34371593.jpg',
    '24236146.jpg',
    '24236136.jpg',
    '24236139.jpg',
    '24236140.jpg',
    '23985793.jpg',
    '23985784.jpg',
    '21612268.jpg',
    '23672615.jpg',
    '23672634.jpg',
    '21612265.jpg',
    '21612262.jpg',
    '18895897.jpg',
    '18895896.jpg',
    '18895894.jpg',
    '18895885.jpg',
    '18895890.jpg',
    '18895881.jpg',
    '18895874.jpg',
    '16330374.jpg',
    '16303861.jpg',
    '15628839.jpg',
    '15634907.jpg',
    '15441927.jpg',
    '153679861.jpg',
    '15441888.jpg',
    '15151415.jpg',
    '13568626.jpg',
    '11852424.jpg',
  ];

  const randomIndex = Math.floor(Math.random() * backgroundImages.length);
  return `/images/background/others/${backgroundImages[randomIndex]}`;
};

// 为工具数据添加随机背景图片
export const addRandomBackgroundToTools = (tools: any[]): any[] => {
  return tools.map(tool => ({
    ...tool,
    backgroundImage: tool.backgroundImage || getRandomBackgroundImage(),
  }));
};
