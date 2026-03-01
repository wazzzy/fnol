"""
Notification tool stubs — SMS, email, push.
Replace with real providers (Twilio, SendGrid, Firebase) in production.
"""

import logging

logger = logging.getLogger(__name__)


def send_sms(to: str, message: str) -> bool:
    """Send an SMS notification (stub)."""
    logger.info(f"[SMS STUB] To: {to}\n{message}")
    return True


def send_email(to: str, subject: str, body: str) -> bool:
    """Send an email notification (stub)."""
    logger.info(f"[EMAIL STUB] To: {to} | Subject: {subject}\n{body}")
    return True


def send_push(device_token: str, title: str, body: str) -> bool:
    """Send a push notification (stub)."""
    logger.info(f"[PUSH STUB] Token: {device_token} | {title}: {body}")
    return True
