import random
import string

from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.http import Http404
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import *
from rest_framework.exceptions import ValidationError
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .utils.otp import *
from .utils.email import send_otp_email
from google.oauth2 import id_token
from google.auth.transport import requests


class RegisterService:

    @staticmethod
    def generate_referral_code():
        while True:
            code = "".join(
                random.choices(
                    string.ascii_uppercase + string.digits,
                    k=8
                )
            )

            if not User.objects.filter(referral_code=code).exists():
                return code

    @staticmethod
    def generate_otp():
        return str(random.randint(100000, 999999))

    @classmethod
    def register(cls, validated_data):
        print("register function called", flush=True)

        validated_data.pop("confirm_password")

        password = validated_data.pop("password")

        user = User.objects.create_user(password=password, referral_code=cls.generate_referral_code(), **validated_data)

        otp = cls.generate_otp()
        print(f"Generated OTP: {otp}", flush=True)

        EmailOTP.objects.create(
            user=user,
            otp_code=make_password(otp),
            # otp_code=cls.generate_otp(),
            expires_at=timezone.now() + timedelta(minutes=5)

        )

        send_otp_email(user.email, otp)

        return user
    
    
class VerifyEmailService:

    @staticmethod
    def verify(email, otp_code):

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise ValidationError({"email": "User not found."})

        if user.is_verified:
            raise ValidationError({"email": "Email is already verified."})

        email_otp = (EmailOTP.objects.filter( user=user, is_used=False).order_by("-created_at").first())

        if not email_otp:
            raise ValidationError({"otp": "OTP not found."})
        
        if timezone.now() > email_otp.expires_at:
            raise ValidationError({"otp": "OTP has expired."})

        if not check_password(otp_code, email_otp.otp_code):
            raise ValidationError({"otp": "Invalid OTP."})

        email_otp.is_used = True
        email_otp.save(update_fields=["is_used"])

        user.is_verified = True
        user.save(update_fields=["is_verified"])

        return user
    

class ResendOTPService:

    @staticmethod
    def resend(email):
        print("resend otp called", flush=True)

        try:
            user = User.objects.get(email=email)

        except User.DoesNotExist:
            raise ValidationError({
                "email": "User not found."
            })

        if user.is_verified:
            raise ValidationError({
                "email": "Email is already verified."
            })

        EmailOTP.objects.filter(
            user=user,
            is_used=False
        ).update(is_used=True)

        otp = RegisterService.generate_otp()

        print(f"Resent OTP: {otp}", flush=True)   


        EmailOTP.objects.create(
            user=user,
            otp_code=make_password(otp),
            expires_at=timezone.now() + timedelta(minutes=5)
        )
        
        send_otp_email(user.email, otp)   

        return user
    
class LoginService:

    @staticmethod
    def login(email, password):

        try:
            user = User.objects.get(email=email)

        except User.DoesNotExist:
            raise ValidationError({
                "email": "Invalid email or password."
            })

        if not user.check_password(password):
            raise ValidationError({
                "password": "Invalid email or password."
            })

        if not user.is_verified:
            raise ValidationError({
                "email": "Please verify your email first."
            })

        if not user.is_active:
            raise ValidationError({
                "email": "This account is inactive."
            })

        if user.blocked:
            raise ValidationError({
                "email": "Your account has been blocked."
            })
        
        # if is_admin and not user.is_staff:
        #     raise ValidationError({
        #         "email": "You are not authorized to access the admin panel."
        #     })

        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": user
        }
    

class LogoutService:

    @staticmethod
    def logout(refresh_token):

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()

        except TokenError:
            raise ValidationError({
                "refresh": "Invalid or expired refresh token."
            })

        return True
    

class ForgotPasswordService:

    @staticmethod
    def send_otp(email):

        try:
            user = User.objects.get(email=email)

        except User.DoesNotExist:
            raise ValidationError({
                "email": "No account found with this email."
            })

        if not user.is_verified:
            raise ValidationError({
                "email": "Please verify your email first."
            })

        if not user.is_active:
            raise ValidationError({
                "email": "This account is inactive."
            })

        if user.blocked:
            raise ValidationError({
                "email": "Your account has been blocked."
            })

        EmailOTP.objects.filter(
            user=user,
            is_used=False
        ).update(is_used=True)

        otp = generate_otp()

        print(f"Reset Password OTP : {otp}")   

        EmailOTP.objects.create(
            user=user,
            otp_code=make_password(otp),
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        send_otp_email(user.email, otp)

        return user
    

class VerifyResetOTPService:

    @staticmethod
    def verify(email, otp):

        try:
            user = User.objects.get(email=email)

        except User.DoesNotExist:
            raise ValidationError({
                "email": "User not found."
            })

        email_otp = (
            EmailOTP.objects
            .filter(
                user=user,
                is_used=False
            )
            .order_by("-created_at")
            .first()
        )

        if not email_otp:
            raise ValidationError({
                "otp": "OTP not found."
            })

        if timezone.now() > email_otp.expires_at:
            raise ValidationError({
                "otp": "OTP has expired."
            })

        if not verify_otp(
            otp,
            email_otp.otp_code
        ):
            raise ValidationError({
                "otp": "Invalid OTP."
            })

        email_otp.is_used = True
        email_otp.save(update_fields=["is_used"])

        PasswordResetToken.objects.filter(
            user=user,
            is_used=False
        ).delete()

        reset_token = PasswordResetToken.objects.create(
            user=user,
            expires_at=timezone.now() + timedelta(minutes=15)
        )

        return str(reset_token.token)
    

class ResetPasswordService:

    @staticmethod
    def reset(reset_token, password):

        try:
            token = PasswordResetToken.objects.get(
                token=reset_token,
                is_used=False
            )

        except PasswordResetToken.DoesNotExist:
            raise ValidationError({
                "reset_token": "Invalid reset token."
            })

        if timezone.now() > token.expires_at:
            raise ValidationError({
                "reset_token": "Reset token has expired."
            })

        user = token.user

        if user.check_password(password):
            raise ValidationError({
                "password": "New password cannot be the same as the current password."
            })

        user.set_password(password)
        user.save()

        token.is_used = True
        token.save(update_fields=["is_used"])

        return user
    

class ChangePasswordService:

    @staticmethod
    def change_password(user, current_password, new_password):

        if not user.check_password(current_password):
            raise ValidationError({
                "current_password": "Current password is incorrect."
            })

        if user.check_password(new_password):
            raise ValidationError({
                "new_password": "New password cannot be the same as the current password."
            })

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return user


class ChangeEmailService:

    @staticmethod
    def send_otp(user, new_email):

        if user.email == new_email:
            raise ValidationError({
                "new_email": "This is already your current email."
            })

        EmailChangeRequest.objects.filter(
            user=user,
            is_used=False
        ).delete()

        otp = generate_otp()

        print(f"Email Change OTP : {otp}")   

        EmailChangeRequest.objects.create(
            user=user,
            new_email=new_email,
            otp_code=hash_otp(otp),
            expires_at=timezone.now() + timedelta(minutes=5)
        )

        return True
    

class VerifyEmailChangeService:

    @staticmethod
    def verify(user, new_email, otp):

        if User.objects.filter(email=new_email).exclude(id=user.id).exists():
            raise ValidationError({
                "new_email": "This email is already registered."
            })

        email_request = (
            EmailChangeRequest.objects
            .filter(
                user=user,
                new_email=new_email,
                is_used=False
            )
            .order_by("-created_at")
            .first()
        )

        if not email_request:
            raise ValidationError({
                "otp": "No pending email change request found."
            })

        if timezone.now() > email_request.expires_at:
            raise ValidationError({
                "otp": "OTP has expired."
            })

        if not verify_otp(
            otp,
            email_request.otp_code
        ):
            raise ValidationError({
                "otp": "Invalid OTP."
            })

        user.email = new_email
        user.is_verified = True
        user.save(update_fields=["email", "is_verified"])

        email_request.is_used = True
        email_request.save(update_fields=["is_used"])

        return user
    

class GoogleLoginService:

    @staticmethod
    def login(token):

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

        except Exception:
            raise ValidationError({
                "google": "Invalid Google token."
            })

        google_id = idinfo["sub"]

        email = idinfo["email"]

        first_name = idinfo.get("given_name", "")

        last_name = idinfo.get("family_name", "")

        profile_image = idinfo.get("picture", "")

        verified = idinfo.get("email_verified", False)

        if not verified:
            raise ValidationError({
                "google": "Google email is not verified."
            })

        user = User.objects.filter(email=email).first()

        if not user:
            from django.utils.crypto import get_random_string
            user = User.objects.create_user(
                email=email,
                first_name=first_name,
                last_name=last_name,
                is_verified=True,
                auth_provider="google",
                google_id=google_id,
                google_profile_picture=profile_image if profile_image else None,
                password=get_random_string(32),
            )

        else:
            if user.blocked:
                raise ValidationError({
                    "google": "Your account has been blocked."
                })
            updated = False
            if not user.google_id:
                user.google_id = google_id
                user.auth_provider = "google"
                user.is_verified = True
                updated = True
            
            if profile_image and user.google_profile_picture != profile_image:
                user.google_profile_picture = profile_image
                updated = True
                
            if updated:
                user.save()

        refresh = RefreshToken.for_user(user)

        return {
            "user": user,
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }
    

class ProfileService:

    @staticmethod
    def get_profile(user):

        return user


class AddressService:

    @staticmethod
    def list_addresses(user):
        return Address.objects.filter(user=user).order_by("-is_default", "-created_at")

    @staticmethod
    @transaction.atomic
    def create_address(user, data):
        if Address.objects.filter(user=user).count() == 0:
            data["is_default"] = True
        elif data.get("is_default") is True:
            Address.objects.filter(user=user, is_default=True).update(is_default=False)

        address = Address.objects.create(user=user, **data)
        return address

    @staticmethod
    @transaction.atomic
    def update_address(user, address_id, data):
        try:
            address = Address.objects.get(user=user, id=address_id)
        except (Address.DoesNotExist, DjangoValidationError, ValueError):
            raise Http404("Address not found.")

        is_default = data.get("is_default")
        if is_default is True and not address.is_default:
            Address.objects.filter(user=user, is_default=True).update(is_default=False)

        for key, value in data.items():
            setattr(address, key, value)
        address.save()
        return address

    @staticmethod
    @transaction.atomic
    def delete_address(user, address_id):
        try:
            address = Address.objects.get(user=user, id=address_id)
        except (Address.DoesNotExist, DjangoValidationError, ValueError):
            raise Http404("Address not found.")

        was_default = address.is_default
        address.delete()

        if was_default:
            newest_remaining = Address.objects.filter(user=user).order_by("-created_at").first()
            if newest_remaining:
                newest_remaining.is_default = True
                newest_remaining.save()

    @staticmethod
    @transaction.atomic
    def set_default_address(user, address_id):
        try:
            address = Address.objects.get(user=user, id=address_id)
        except (Address.DoesNotExist, DjangoValidationError, ValueError):
            raise Http404("Address not found.")

        if not address.is_default:
            Address.objects.filter(user=user, is_default=True).update(is_default=False)
            address.is_default = True
            address.save()
        return address


class UpdateProfileService:

    @staticmethod
    def update_profile(user, validated_data):
        first_name = validated_data.get("first_name")
        last_name = validated_data.get("last_name")
        phone = validated_data.get("phone")
        profile_image = validated_data.get("profile_image")

        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if phone is not None:
            user.phone = phone
        if profile_image:
            user.profile_image = profile_image

        user.save()
        return user