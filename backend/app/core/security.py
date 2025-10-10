from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.models.user import User
from app.db.base import get_db

# Password hashing context - 使用 Argon2 作为主要算法，bcrypt 作为后备
pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],
    deprecated="auto",
    argon2__default_rounds=3,  # Argon2 迭代次数
    argon2__memory_cost=65536,  # 内存使用量 (64MB)
    argon2__parallelism=4,  # 并行度
    argon2__hash_len=32,  # 哈希长度
    argon2__salt_len=16,  # 盐长度
)

# Argon2 实例用于直接操作
argon2_hasher = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16,
)

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


class SecurityManager:
    """Security management utilities"""

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        # 确保密码长度一致（与哈希时相同）
        if len(plain_password) > 128:
            plain_password = plain_password[:128]

        try:
            # 首先尝试使用 passlib 的 CryptContext (支持 Argon2 和 bcrypt)
            return pwd_context.verify(plain_password, hashed_password)
        except UnknownHashError:
            # 如果 passlib 无法识别哈希格式，尝试直接使用 Argon2
            try:
                argon2_hasher.verify(hashed_password, plain_password)
                return True
            except VerifyMismatchError:
                pass
            except Exception:
                pass

            # 最后的后备方案：简单 SHA256 哈希（仅用于兼容旧数据）
            import hashlib

            return (
                hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password
            )

    @staticmethod
    def get_password_hash(password: str) -> str:
        """Generate password hash using Argon2"""
        # Argon2 没有密码长度限制，但为了安全起见，我们仍然限制长度
        original_password = password
        if len(password) > 128:
            password = password[:128]

        try:
            # 使用 Argon2 生成哈希
            return argon2_hasher.hash(password)
        except Exception as e:
            # 如果 Argon2 失败，回退到 passlib
            return pwd_context.hash(password)

    @staticmethod
    def create_access_token(
        subject: Union[str, Any], expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token"""
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                minutes=settings.access_token_expire_minutes
            )

        to_encode = {"exp": expire, "sub": str(subject)}
        encoded_jwt = jwt.encode(
            to_encode, settings.secret_key, algorithm=settings.algorithm
        )
        return encoded_jwt

    @staticmethod
    def create_refresh_token(
        subject: Union[str, Any], expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT refresh token"""
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                days=7
            )  # 7 days for refresh token

        to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
        encoded_jwt = jwt.encode(
            to_encode, settings.secret_key, algorithm=settings.algorithm
        )
        return encoded_jwt

    @staticmethod
    def verify_token(token: str) -> Optional[str]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(
                token, settings.secret_key, algorithms=[settings.algorithm]
            )
            return payload.get("sub")
        except JWTError:
            return None

    @staticmethod
    def verify_refresh_token(token: str) -> Optional[str]:
        """Verify and decode JWT refresh token"""
        try:
            payload = jwt.decode(
                token, settings.secret_key, algorithms=[settings.algorithm]
            )
            if payload.get("type") != "refresh":
                return None
            return payload.get("sub")
        except JWTError:
            return None


# Global security manager instance
security = SecurityManager()


# Authentication functions
async def authenticate_user(
    db: AsyncSession, username: str, password: str
) -> Optional[User]:
    """Authenticate user with username/email and password"""
    # Try to find user by username or email
    stmt = select(User).where((User.username == username) | (User.email == username))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        return None

    if not security.verify_password(password, user.hashed_password):
        return None

    return user


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    """Get user by ID"""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """Get user by username"""
    stmt = select(User).where(User.username == username)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get user by email"""
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


# Token validation functions
def decode_token(token: str) -> dict:
    """Decode JWT token and return payload"""
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Cookie 认证函数
async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    """从HttpOnly Cookie获取当前认证用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 从Cookie获取token
    if request.headers.get("Authorization") and request.headers.get(
        "Authorization"
    ).startswith("Bearer "):
        print("Authorization header found")
        token = request.headers.get("Authorization").split(" ")[1]
    elif request.cookies.get("access_token"):
        print("Access token cookie found")
        token = request.cookies.get("access_token")
    else:
        raise credentials_exception

    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await get_user_by_id(db, user_id=int(user_id))
    if user is None:
        raise credentials_exception

    return user


# Dependency functions
async def get_current_user_from_token(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await get_user_by_id(db, user_id=int(user_id))
    if user is None:
        raise credentials_exception

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    return current_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """Get current admin user"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    return current_user


# Optional authentication (doesn't raise exception if no token)
async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, None otherwise"""
    if not token:
        return None

    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None

    user = await get_user_by_id(db, user_id=int(user_id))
    return user


# Optional authentication from cookie (doesn't raise exception if no token)
async def get_current_user_optional_from_cookie(
    request: Request, db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Get current user from cookie if authenticated, None otherwise"""
    # 从Cookie获取token
    token = None
    if request.headers.get("Authorization") and request.headers.get(
        "Authorization"
    ).startswith("Bearer "):
        token = request.headers.get("Authorization").split(" ")[1]
    elif request.cookies.get("access_token"):
        token = request.cookies.get("access_token")

    if not token:
        return None

    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None

    user = await get_user_by_id(db, user_id=int(user_id))
    return user


# Password validation
def validate_password_strength(password: str) -> bool:
    """Validate password strength"""
    if len(password) < 8:
        return False

    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)

    return has_upper and has_lower and has_digit and has_special


# Token blacklist (for logout functionality)
class TokenBlacklist:
    """Simple in-memory token blacklist"""

    _blacklisted_tokens = set()

    @classmethod
    def add_token(cls, token: str):
        """Add token to blacklist"""
        cls._blacklisted_tokens.add(token)

    @classmethod
    def is_blacklisted(cls, token: str) -> bool:
        """Check if token is blacklisted"""
        return token in cls._blacklisted_tokens

    @classmethod
    def remove_token(cls, token: str):
        """Remove token from blacklist"""
        cls._blacklisted_tokens.discard(token)


def is_token_blacklisted(token: str) -> bool:
    """Check if token is blacklisted"""
    return TokenBlacklist.is_blacklisted(token)
