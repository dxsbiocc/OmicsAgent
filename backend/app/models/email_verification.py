from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class EmailVerification(Base):
    """Email verification model"""

    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    verification_code = Column(String(6), nullable=False)  # 6-digit code
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_used = Column(Boolean, default=False, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="email_verifications")

    def __repr__(self):
        return f"<EmailVerification(id={self.id}, email='{self.email}', used={self.is_used})>"

    @property
    def is_expired(self) -> bool:
        """Check if verification code is expired"""
        from datetime import datetime, timezone

        return datetime.now(timezone.utc) > self.expires_at
