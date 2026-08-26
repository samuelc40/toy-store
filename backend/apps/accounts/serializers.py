import re

from rest_framework import serializers

from .models import *
from .validators import *

class RegisterSerializer(serializers.Serializer):

    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=15)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    referral_code = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=20)

    def validate_email(self, value):

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")

        return value

    def validate_phone(self, value):

        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Phone number already exists.")

        if not value.isdigit():
            raise serializers.ValidationError("Phone number should contain digits only.")

        if len(value) != 10:
            raise serializers.ValidationError("Phone number must contain 10 digits.")

        return value

    def validate_password(self, value):

        if len(value) < 8:
            raise serializers.ValidationError("Password must contain at least 8 characters.")

        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Password must contain an uppercase letter.")

        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError("Password must contain a lowercase letter.")

        if not re.search(r"\d", value):
            raise serializers.ValidationError("Password must contain a number.")

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise serializers.ValidationError("Password must contain a special character.")

        return value

    def validate_referral_code(self, value):
        if not value or str(value).strip() == "" or str(value).strip().lower() in ["none", "null", "undefined"]:
            return None
        code_clean = str(value).strip()
        referrer = User.objects.filter(referral_code__iexact=code_clean).first()
        if not referrer:
            raise serializers.ValidationError("Invalid referral code. Please check your code or leave blank.")
        return code_clean

    def validate(self, attrs):

        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        return attrs
    
    
class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True
    )


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class VerifyResetOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


class ResetPasswordSerializer(serializers.Serializer):

    reset_token = serializers.UUIDField()

    password = serializers.CharField(
        validators=[validate_password_strength],
        write_only=True
    )

    confirm_password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):

        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        return attrs
    

class ChangePasswordSerializer(serializers.Serializer):

    current_password = serializers.CharField(
        write_only=True
    )

    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password_strength]
    )

    confirm_password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):

        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        return attrs
    

class ChangeEmailSerializer(serializers.Serializer):

    new_email = serializers.EmailField()

    def validate_new_email(self, value):

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "This email is already registered."
            )

        return value


class VerifyEmailChangeSerializer(serializers.Serializer):

    new_email = serializers.EmailField()

    otp = serializers.CharField(
        max_length=6
    )


class GoogleLoginSerializer(serializers.Serializer):
    token = serializers.CharField()
    profile_image = serializers.SerializerMethodField()


class AddressSerializer(serializers.ModelSerializer):

    class Meta:

        model = Address

        fields = [
            "id",
            "address_line1",
            "address_line2",
            "landmark",
            "city",
            "state",
            "postal_code",
            "country",
            "address_type",
            "is_default",
        ]


class UpdateProfileSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False, max_length=150)
    last_name = serializers.CharField(required=False, max_length=150)
    phone = serializers.CharField(required=False, max_length=15, allow_blank=True, allow_null=True)
    profile_image = serializers.ImageField(required=False, allow_null=True)

    def validate_first_name(self, value):
        if value is not None:
            value = value.strip()
            if not value:
                raise serializers.ValidationError("First name cannot be empty.")
        return value

    def validate_last_name(self, value):
        if value is not None:
            value = value.strip()
            if not value:
                raise serializers.ValidationError("Last name cannot be empty.")
        return value

    def validate_phone(self, value):
        if value is not None:
            value = str(value).strip()

        if not value:
            return None

        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must contain exactly 10 digits.")

        request = self.context.get("request")
        current_user = request.user if request else None

        queryset = User.objects.filter(phone=value)
        if current_user:
            queryset = queryset.exclude(id=current_user.id)

        if queryset.exists():
            raise serializers.ValidationError("This phone number is already in use.")

        return value


class ProfileSerializer(serializers.ModelSerializer):

    addresses = AddressSerializer(
        many=True,
        read_only=True
    )

    class Meta:

        model = User

        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "profile_image",
            "google_profile_picture",
            "coins",
            "referral_code",
            "is_verified",
            "auth_provider",
            "created_at",
            "addresses",
        ]

