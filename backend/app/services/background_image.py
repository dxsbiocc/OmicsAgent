"""
Background Image Service
处理博客背景图片的随机选择和管理
"""

import random
from typing import Optional
from app.core.logging import get_logger

logger = get_logger("background_image")


class BackgroundImageService:
    """背景图片服务"""

    # 默认背景图片列表（与前端保持一致）
    DEFAULT_BACKGROUND_IMAGES = [
        "11852424.jpg",
        "13568626.jpg",
        "15151415.jpg",
        "153679861.jpg",
        "15441888.jpg",
        "15441927.jpg",
        "15628839.jpg",
        "15634907.jpg",
        "16303861.jpg",
        "16330374.jpg",
        "18895874.jpg",
        "18895881.jpg",
        "18895885.jpg",
        "18895890.jpg",
        "18895894.jpg",
        "18895896.jpg",
        "18895897.jpg",
        "21612262.jpg",
        "21612265.jpg",
        "21612268.jpg",
        "23672615.jpg",
        "23672634.jpg",
        "23985784.jpg",
        "23985793.jpg",
        "24236136.jpg",
        "24236139.jpg",
        "24236140.jpg",
        "24236146.jpg",
        "34371593.jpg",
        "34916238.jpg",
        "38091716.jpg",
        "6056984.jpg",
    ]

    @staticmethod
    def get_random_background_image() -> str:
        """
        随机选择一个默认背景图片

        Returns:
            str: 随机背景图片的URL路径
        """
        random_index = random.randint(
            0, len(BackgroundImageService.DEFAULT_BACKGROUND_IMAGES) - 1
        )
        selected_image = BackgroundImageService.DEFAULT_BACKGROUND_IMAGES[random_index]
        image_url = f"/images/background/{selected_image}"

        logger.info(f"随机选择背景图片: {selected_image}")
        return image_url

    @staticmethod
    def get_background_image_url(provided_url: Optional[str] = None) -> str:
        """
        获取背景图片URL，如果没有提供则随机选择一个

        Args:
            provided_url: 用户提供的背景图片URL

        Returns:
            str: 背景图片URL
        """
        if provided_url and provided_url.strip():
            logger.info(f"使用用户提供的背景图片: {provided_url}")
            return provided_url.strip()
        else:
            random_url = BackgroundImageService.get_random_background_image()
            logger.info(f"未提供背景图片，使用随机选择: {random_url}")
            return random_url

    @staticmethod
    def get_all_background_images() -> list[str]:
        """
        获取所有可用的背景图片列表

        Returns:
            list[str]: 所有背景图片的URL列表
        """
        return [
            f"/images/background/{image}"
            for image in BackgroundImageService.DEFAULT_BACKGROUND_IMAGES
        ]

    @staticmethod
    def is_default_background_image(image_url: str) -> bool:
        """
        检查给定的图片URL是否为默认背景图片

        Args:
            image_url: 要检查的图片URL

        Returns:
            bool: 是否为默认背景图片
        """
        if not image_url:
            return False

        # 提取文件名
        filename = image_url.split("/")[-1]
        return filename in BackgroundImageService.DEFAULT_BACKGROUND_IMAGES
