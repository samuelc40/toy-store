# accounts/managers.py

from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        if "referral_code" not in extra_fields or not extra_fields["referral_code"]:
            import random, string
            while True:
                code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
                if not self.model.objects.filter(referral_code=code).exists():
                    extra_fields["referral_code"] = code
                    break

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        return self.create_user(email, password, **extra_fields)