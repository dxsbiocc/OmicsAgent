from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class ImageLibrary(Base):
    """用户图片库模型"""

    __tablename__ = "image_library"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False, comment="存储的文件名")
    original_filename = Column(String(255), nullable=False, comment="原始文件名")
    file_path = Column(String(500), nullable=False, comment="文件存储路径")
    file_url = Column(String(500), nullable=False, comment="文件访问URL")
    file_size = Column(Integer, nullable=False, comment="文件大小(字节)")
    mime_type = Column(String(100), nullable=False, comment="MIME类型")
    width = Column(Integer, nullable=True, comment="图片宽度")
    height = Column(Integer, nullable=True, comment="图片高度")
    description = Column(Text, nullable=True, comment="图片描述")
    tags = Column(String(500), nullable=True, comment="标签(逗号分隔)")
    is_active = Column(Boolean, default=True, nullable=False, comment="是否激活")

    # 用户关联
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=False, comment="上传用户ID"
    )
    user = relationship("User", back_populates="images")

    # 时间戳
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="创建时间",
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="更新时间",
    )

    def __repr__(self):
        return f"<ImageLibrary(id={self.id}, filename='{self.filename}', user_id={self.user_id})>"
