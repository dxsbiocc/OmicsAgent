import aiosmtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from datetime import datetime, timezone, timedelta
import random
import string

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("email")


class EmailService:
    """Service for sending emails"""

    @staticmethod
    def generate_verification_code(length: int = 6) -> str:
        """Generate a random verification code"""
        return "".join(random.choices(string.digits, k=length))

    @staticmethod
    async def send_verification_email(
        to_email: str, verification_code: str, username: Optional[str] = None
    ) -> bool:
        """Send email verification code"""
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
            msg["To"] = to_email
            msg["Subject"] = "Email Verification - OmicsAgent"

            # Create HTML content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Email Verification</title>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    .header {{
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }}
                    .content {{
                        background: #f9f9f9;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }}
                    .verification-code {{
                        background: #667eea;
                        color: white;
                        font-size: 32px;
                        font-weight: bold;
                        padding: 20px;
                        text-align: center;
                        border-radius: 8px;
                        margin: 20px 0;
                        letter-spacing: 5px;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 30px;
                        color: #666;
                        font-size: 14px;
                    }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🔐 Email Verification</h1>
                    <p>Welcome to OmicsAgent!</p>
                </div>
                <div class="content">
                    <h2>Hello{f' {username}' if username else ''}!</h2>
                    <p>Thank you for registering with OmicsAgent. To complete your registration, please verify your email address using the code below:</p>
                    
                    <div class="verification-code">
                        {verification_code}
                    </div>
                    
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>This code will expire in {settings.email_verification_expire_minutes} minutes</li>
                        <li>If you didn't request this verification, please ignore this email</li>
                        <li>For security reasons, do not share this code with anyone</li>
                    </ul>
                    
                    <p>If you have any questions, please contact our support team.</p>
                </div>
                <div class="footer">
                    <p>© 2025 OmicsAgent. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                </div>
            </body>
            </html>
            """

            # Create plain text content
            text_content = f"""
Email Verification - OmicsAgent

Hello{f' {username}' if username else ''}!

Thank you for registering with OmicsAgent. To complete your registration, please verify your email address using the code below:

Verification Code: {verification_code}

Important:
- This code will expire in {settings.email_verification_expire_minutes} minutes
- If you didn't request this verification, please ignore this email
- For security reasons, do not share this code with anyone

If you have any questions, please contact our support team.

© 2025 OmicsAgent. All rights reserved.
This is an automated message, please do not reply.
            """

            # Attach parts
            msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            # Send email
            if not settings.smtp_username or not settings.smtp_password:
                logger.warning("SMTP credentials not configured, skipping email send")
                return False

            await aiosmtplib.send(
                msg,
                hostname=settings.smtp_host,
                port=settings.smtp_port,
                username=settings.smtp_username,
                password=settings.smtp_password,
                use_tls=True,
            )

            logger.info(f"Verification email sent to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send verification email to {to_email}: {e}")
            return False

    @staticmethod
    async def send_welcome_email(to_email: str, username: str) -> bool:
        """Send welcome email after successful verification"""
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
            msg["To"] = to_email
            msg["Subject"] = "Welcome to OmicsAgent!"

            # Create HTML content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Welcome to OmicsAgent</title>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    .header {{
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }}
                    .content {{
                        background: #f9f9f9;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }}
                    .welcome {{
                        font-size: 24px;
                        color: #667eea;
                        margin-bottom: 20px;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 30px;
                        color: #666;
                        font-size: 14px;
                    }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎉 Welcome to OmicsAgent!</h1>
                </div>
                <div class="content">
                    <div class="welcome">Hello {username}!</div>
                    <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
                    
                    <p>You can now:</p>
                    <ul>
                        <li>Access all features of OmicsAgent</li>
                        <li>Create and manage your profile</li>
                        <li>Connect with other users</li>
                        <li>Explore our blog and resources</li>
                    </ul>
                    
                    <p>Thank you for joining our community!</p>
                </div>
                <div class="footer">
                    <p>© 2025 OmicsAgent. All rights reserved.</p>
                </div>
            </body>
            </html>
            """

            # Create plain text content
            text_content = f"""
Welcome to OmicsAgent!

Hello {username}!

Congratulations! Your email has been successfully verified and your account is now active.

You can now:
- Access all features of OmicsAgent
- Create and manage your profile
- Connect with other users
- Explore our blog and resources

Thank you for joining our community!

© 2025 OmicsAgent. All rights reserved.
            """

            # Attach parts
            msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            # Send email
            if not settings.smtp_username or not settings.smtp_password:
                logger.warning("SMTP credentials not configured, skipping email send")
                return False

            await aiosmtplib.send(
                msg,
                hostname=settings.smtp_host,
                port=settings.smtp_port,
                username=settings.smtp_username,
                password=settings.smtp_password,
                use_tls=True,
            )

            logger.info(f"Welcome email sent to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send welcome email to {to_email}: {e}")
            return False
