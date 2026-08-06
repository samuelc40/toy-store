from rest_framework import serializers
from ..models import User


class AdminLoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "profile_image",
            "first_name",
            "last_name",
            "email",
            "phone",
            "auth_provider",
            "is_verified",
            "blocked",
            "created_at",
        ]