from typing import Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.models.email_verification import EmailVerification
from app.models.user import User
from app.services.email import EmailService
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("email_verification")


class EmailVerificationService:
    """Service for managing email verification"""

    @staticmethod
    async def create_verification(
        email: str, user_id: Optional[int] = None, db: AsyncSession = None
    ) -> Optional[str]:
        """Create a new email verification record and send email"""
        try:
            # Generate verification code
            verification_code = EmailService.generate_verification_code()

            # Set expiration time
            expires_at = datetime.now(timezone.utc) + timedelta(
                minutes=settings.email_verification_expire_minutes
            )

            # Create verification record
            verification = EmailVerification(
                email=email,
                verification_code=verification_code,
                user_id=user_id,
                expires_at=expires_at,
            )

            db.add(verification)
            await db.commit()
            await db.refresh(verification)

            # Get username if user_id is provided
            username = None
            if user_id:
                user_result = await db.execute(select(User).where(User.id == user_id))
                user = user_result.scalar_one_or_none()
                if user:
                    username = user.username

            # Send verification email
            email_sent = await EmailService.send_verification_email(
                email, verification_code, username
            )

            if email_sent:
                logger.info(f"Verification code created and sent to {email}")
                return verification_code
            else:
                logger.warning(
                    f"Verification code created but email not sent to {email}"
                )
                return verification_code

        except Exception as e:
            logger.error(f"Failed to create verification for {email}: {e}")
            await db.rollback()
            return None

    @staticmethod
    async def verify_code(email: str, verification_code: str, db: AsyncSession) -> bool:
        """Verify email verification code"""
        try:
            # Find verification record
            result = await db.execute(
                select(EmailVerification).where(
                    EmailVerification.email == email,
                    EmailVerification.verification_code == verification_code,
                    EmailVerification.is_used == False,
                )
            )
            verification = result.scalar_one_or_none()

            if not verification:
                logger.warning(f"Invalid verification code for {email}")
                return False

            # Check if expired
            if verification.is_expired:
                logger.warning(f"Expired verification code for {email}")
                return False

            # Mark as used
            verification.is_used = True
            await db.commit()

            logger.info(f"Email {email} verified successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to verify code for {email}: {e}")
            return False

    @staticmethod
    async def resend_verification(email: str, db: AsyncSession) -> bool:
        """Resend verification code for an email"""
        try:
            # Check if there's an unused verification for this email
            result = await db.execute(
                select(EmailVerification).where(
                    EmailVerification.email == email, EmailVerification.is_used == False
                )
            )
            existing_verification = result.scalar_one_or_none()

            if existing_verification and not existing_verification.is_expired:
                # Resend existing code
                username = None
                if existing_verification.user_id:
                    user_result = await db.execute(
                        select(User).where(User.id == existing_verification.user_id)
                    )
                    user = user_result.scalar_one_or_none()
                    if user:
                        username = user.username

                email_sent = await EmailService.send_verification_email(
                    email, existing_verification.verification_code, username
                )

                if email_sent:
                    logger.info(f"Verification code resent to {email}")
                    return True
                else:
                    logger.warning(f"Failed to resend verification email to {email}")
                    return False
            else:
                # Create new verification
                user_id = (
                    existing_verification.user_id if existing_verification else None
                )
                verification_code = await EmailVerificationService.create_verification(
                    email, user_id, db
                )
                return verification_code is not None

        except Exception as e:
            logger.error(f"Failed to resend verification for {email}: {e}")
            return False

    @staticmethod
    async def cleanup_expired_verifications(db: AsyncSession) -> int:
        """Clean up expired verification records"""
        try:
            # Delete expired verifications
            result = await db.execute(
                delete(EmailVerification).where(
                    EmailVerification.expires_at < datetime.now(timezone.utc)
                )
            )
            deleted_count = result.rowcount
            await db.commit()

            if deleted_count > 0:
                logger.info(f"Cleaned up {deleted_count} expired verification records")

            return deleted_count

        except Exception as e:
            logger.error(f"Failed to cleanup expired verifications: {e}")
            return 0

    @staticmethod
    async def get_verification_status(email: str, db: AsyncSession) -> dict:
        """Get verification status for an email"""
        try:
            # Check for active verification
            result = await db.execute(
                select(EmailVerification)
                .where(
                    EmailVerification.email == email, EmailVerification.is_used == False
                )
                .order_by(EmailVerification.created_at.desc())
            )
            verification = result.scalar_one_or_none()

            if verification:
                return {
                    "has_pending": True,
                    "is_expired": verification.is_expired,
                    "expires_at": verification.expires_at,
                    "created_at": verification.created_at,
                }
            else:
                return {
                    "has_pending": False,
                    "is_expired": False,
                    "expires_at": None,
                    "created_at": None,
                }

        except Exception as e:
            logger.error(f"Failed to get verification status for {email}: {e}")
            return {
                "has_pending": False,
                "is_expired": False,
                "expires_at": None,
                "created_at": None,
            }
