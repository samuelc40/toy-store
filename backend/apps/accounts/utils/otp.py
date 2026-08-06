import random

from datetime import timedelta

from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone

from ..models import EmailOTP


def generate_otp():
    """
    Generate a random 6-digit OTP.
    """
    return str(random.randint(100000, 999999))


def hash_otp(otp: str):
    """
    Hash OTP before storing.
    """
    return make_password(otp)


def verify_otp(plain_otp: str, hashed_otp: str):
    """
    Compare entered OTP with stored hash.
    """
    return check_password(plain_otp, hashed_otp)


def create_otp(user, otp, expiry_minutes=10):
    """
    Invalidate previous OTPs and create a new one.
    """

    EmailOTP.objects.filter(
        user=user,
        is_used=False
    ).update(is_used=True)

    return EmailOTP.objects.create(
        user=user,
        otp_code=hash_otp(otp),
        expires_at=timezone.now() + timedelta(minutes=expiry_minutes)
    )