import threading

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string


def _send_otp_email_thread(email, otp, purpose="Account Verification"):
    subject = f"Toy Vault - Your OTP for {purpose}"

    context = {
        "otp": otp,
        "user_email": email,
        "purpose": purpose,
        "title": f"Verify Your Request ({purpose})" if purpose != "Account Verification" else "Verify Your Account",
        "description": (
            f"Please use the verification code below to complete your {purpose.lower()} request for your Toy Vault account:"
        ),
    }

    html_message = None
    try:
        html_message = render_to_string("emails/otp_email.html", context)
    except Exception as render_err:
        print(f"Error rendering OTP email template: {render_err}", flush=True)

    plain_message = f"""
Hello,

Your verification code for {purpose} is:

{otp}

This OTP will expire in 5 minutes.

If you did not request this, please ignore this email.

Toy Vault Team
"""

    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
    except Exception as e:
        print(f"Error sending verification email: {e}", flush=True)


def send_otp_email(email, otp, purpose="Account Verification"):
    thread = threading.Thread(
        target=_send_otp_email_thread, args=(email, otp, purpose)
    )
    thread.daemon = True
    thread.start()

