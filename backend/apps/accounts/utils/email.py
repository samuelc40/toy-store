import threading
from django.core.mail import send_mail
from django.conf import settings


def _send_otp_email_thread(email, otp):
    subject = "Verify your Toy Store account"

    message = f"""
    Hello,

    Your verification code is:

    {otp}

    This OTP will expire in 5 minutes.

    If you did not request this, please ignore this email.

    Toy Store Team
    """

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Error sending verification email: {e}")


def send_otp_email(email, otp):
    thread = threading.Thread(target=_send_otp_email_thread, args=(email, otp))
    thread.daemon = True
    thread.start()