"""
Transactional email via Resend.

In development (no RESEND_API_KEY configured) emails are not sent; the
payload is logged to the console so flows can be exercised locally.
"""

import logging
from typing import Optional

import httpx

from src.core.config import settings

logger = logging.getLogger("oja.email")

RESEND_API_BASE = "https://api.resend.com/emails"


def send_email(
    to: str,
    subject: str,
    html: str,
    text: Optional[str] = None,
) -> None:
    """
    Send a transaction email to a single recipient.

    Args:
        to: Recipient email address
        subject: Email subject line
        html: HTML body
        text: Optional plain-text body
    """
    payload = {
        "from": settings.RESEND_FROM,
        "to": [to],
        "subject": subject,
        "html": html,
    }
    if text:
        payload["text"] = text

    if not settings.RESEND_API_KEY or settings.RESEND_API_KEY == "N/A":
        # Development fallback: log the email instead of sending.
        logger.warning(
            "RESEND_API_KEY not configured - email NOT sent. Payload: %s",
            payload,
        )
        return

    try:
        response = httpx.post(
            RESEND_API_BASE,
            headers={
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=15.0,
        )
        response.raise_for_status()
    except httpx.HTTPError as exc:
        logger.error("Failed to send email to %s: %s", to, exc)
        raise RuntimeError("Failed to send email") from exc


def send_login_code_email(to: str, code: str, store_name: str) -> None:
    """Email the one-time sign-in / membership code for a storefront."""
    send_email(
        to=to,
        subject=f"Your {store_name} sign-in code",
        html=(
            f"<p>Hi,</p>"
            f"<p>Your one-time sign-in code for <strong>{store_name}</strong> is:</p>"
            f"<h1 style='letter-spacing:6px'>{code}</h1>"
            f"<p>This code expires in 10 minutes. If you didn't request it, "
            f"you can safely ignore this email.</p>"
        ),
        text=f"Your {store_name} sign-in code is {code}. It expires in 10 minutes.",
    )


def send_password_reset_email(to: str, code: str) -> None:
    """Email a dashboard password reset code."""
    send_email(
        to=to,
        subject="Reset your Oja password",
        html=(
            "<p>Hi,</p>"
            "<p>We received a request to reset your Oja password. "
            "Use this code to set a new one:</p>"
            f"<h1 style='letter-spacing:6px'>{code}</h1>"
            "<p>This code expires in 30 minutes. "
            "If you didn't request it, you can safely ignore this email.</p>"
        ),
        text=f"Your Oja password reset code is {code}. It expires in 30 minutes.",
    )


def send_order_confirmation_email(
    to: str,
    store_name: str,
    order_number: str,
    total: str,
) -> None:
    """Email an order confirmation after a successful payment."""
    send_email(
        to=to,
        subject=f"Order {order_number} confirmed - {store_name}",
        html=(
            f"<p>Thanks for shopping at <strong>{store_name}</strong>!</p>"
            f"<p>Your order <strong>{order_number}</strong> has been confirmed.</p>"
            f"<p>Total paid: <strong>{total}</strong></p>"
        ),
        text=f"Order {order_number} confirmed at {store_name}. Total paid: {total}.",
    )