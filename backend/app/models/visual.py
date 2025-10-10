from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    JSON,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class VisualTool(Base):
    """Visual tool model - 绘图工具模型"""

    __tablename__ = "visual_tools"

    id = Column(Integer, primary_key=True, index=True)
    tool = Column(
        String(100), unique=True, nullable=False, index=True
    )  # 工具名称，如 'scatter'
    name = Column(String(255), nullable=False, index=True)  # 显示名称
    description = Column(Text, nullable=True)  # 工具描述
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # 状态和统计
    status = Column(
        String(20), default="active", nullable=False
    )  # active, inactive, deprecated
    featured = Column(Boolean, default=False, nullable=False)  # 是否推荐

    # 统计信息
    view_count = Column(Integer, default=0, nullable=False)  # 查看次数
    like_count = Column(Integer, default=0, nullable=False)  # 点赞次数
    favorite_count = Column(Integer, default=0, nullable=False)  # 收藏次数
    comment_count = Column(Integer, default=0, nullable=False)  # 评论次数
    usage_count = Column(Integer, default=0, nullable=False)  # 使用次数

    # 时间戳
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # 关系
    author = relationship("User", back_populates="visual_tools")
    category = relationship("Category", back_populates="visual_tools")
    tags = relationship(
        "Tag", secondary="visual_tool_tags", back_populates="visual_tools"
    )
    likes = relationship(
        "UserToolLike", back_populates="tool", cascade="all, delete-orphan"
    )
    favorites = relationship(
        "UserToolFavorite", back_populates="tool", cascade="all, delete-orphan"
    )
    comments = relationship(
        "VisualToolComment", back_populates="tool", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<VisualTool(id={self.id}, tool='{self.tool}', name='{self.name}')>"


class VisualToolTag(Base):
    """Visual tool tag association - 绘图工具标签关联表"""

    __tablename__ = "visual_tool_tags"

    tool_id = Column(Integer, ForeignKey("visual_tools.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True)


class UserToolLike(Base):
    """User tool like model - 用户点赞绘图工具"""

    __tablename__ = "user_tool_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tool_id = Column(Integer, ForeignKey("visual_tools.id"), nullable=False)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # 关系
    user = relationship("User", back_populates="tool_likes")
    tool = relationship("VisualTool", back_populates="likes")

    # 唯一约束
    __table_args__ = (
        UniqueConstraint("user_id", "tool_id", name="unique_user_tool_like"),
    )


class UserToolFavorite(Base):
    """User tool favorite model - 用户收藏绘图工具"""

    __tablename__ = "user_tool_favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tool_id = Column(Integer, ForeignKey("visual_tools.id"), nullable=False)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # 关系
    user = relationship("User", back_populates="tool_favorites")
    tool = relationship("VisualTool", back_populates="favorites")

    # 唯一约束
    __table_args__ = (
        UniqueConstraint("user_id", "tool_id", name="unique_user_tool_favorite"),
    )


class VisualToolComment(Base):
    """Visual tool comment model - 绘图工具评论模型"""

    __tablename__ = "visual_tool_comments"

    id = Column(Integer, primary_key=True, index=True)
    tool_id = Column(Integer, ForeignKey("visual_tools.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(
        Integer, ForeignKey("visual_tool_comments.id"), nullable=True
    )  # 回复评论的ID

    content = Column(Text, nullable=False)  # 评论内容
    status = Column(
        String(20), default="approved", nullable=False
    )  # approved, pending, rejected

    # 统计
    like_count = Column(Integer, default=0, nullable=False)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # 关系
    tool = relationship("VisualTool", back_populates="comments")
    user = relationship("User", back_populates="tool_comments")
    parent = relationship("VisualToolComment", remote_side=[id], backref="replies")
    likes = relationship(
        "VisualToolCommentLike", back_populates="comment", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<VisualToolComment(tool_id={self.tool_id}, user_id={self.user_id}, content='{self.content[:50]}...')>"


class VisualToolCommentLike(Base):
    """Visual tool comment like model - 绘图工具评论点赞模型"""

    __tablename__ = "visual_tool_comment_likes"

    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey("visual_tool_comments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # 关系
    comment = relationship("VisualToolComment", back_populates="likes")
    user = relationship("User", back_populates="comment_likes")

    # 唯一约束
    __table_args__ = (
        UniqueConstraint("comment_id", "user_id", name="unique_comment_user_like"),
    )

    def __repr__(self):
        return f"<VisualToolCommentLike(comment_id={self.comment_id}, user_id={self.user_id})>"
