# Import all models to ensure they are registered with SQLAlchemy
from .user import User
from .blog import BlogPost, BlogPostTag, UserPostLike, UserPostFavorite
from .category import Category
from .tag import Tag
from .comment import Comment, UserCommentLike
from .email_verification import EmailVerification
from .image_library import ImageLibrary
from .conversation import Conversation, Message

# from .tools import Tool  # 暂时注释，tools.py为空
# from .visual import Visual  # 暂时注释，visual.py为空

__all__ = [
    "User",
    "BlogPost",
    "BlogPostTag",
    "UserPostLike",
    "UserPostFavorite",
    "Category",
    "Tag",
    "Comment",
    "UserCommentLike",
    "EmailVerification",
    "ImageLibrary",
    "Conversation",
    "Message",
    # "Tool",  # 暂时注释
    # "Visual",  # 暂时注释
]
