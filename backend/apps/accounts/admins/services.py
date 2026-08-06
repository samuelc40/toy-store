from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage

from ..models import User


class AdminLoginService:

    @staticmethod
    def login(email, password):

        try:
            user = User.objects.get(email=email)

        except User.DoesNotExist:
            raise ValidationError({"email": "Invalid email or password."})

        if not user.check_password(password):
            raise ValidationError({"password": "Invalid email or password."})

        if not user.is_staff:
            raise ValidationError({"email": "You are not authorized to access the admin panel."})

        if not user.is_active:
            raise ValidationError({"email": "This account is inactive."})

        if user.blocked:
            raise ValidationError({"email": "This account has been blocked."})

        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": user
        }


class AdminUserService:

    @staticmethod
    def list_users(page=1, page_size=10, search=None):
        users = User.objects.filter(is_superuser=False)

        if search:
            search = search.strip()
            users = users.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )

        users = users.order_by("-created_at")

        paginator = Paginator(users, page_size)
        try:
            paginated_users = paginator.page(page)
        except EmptyPage:
            paginated_users = []

        count = paginator.count
        total_pages = paginator.num_pages
        next_page = paginated_users.has_next() if paginated_users else False
        previous_page = paginated_users.has_previous() if paginated_users else False

        return {
            "results": list(paginated_users),
            "count": count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "next": next_page,
            "previous": previous_page
        }

    @staticmethod
    def toggle_block(user_uuid, request_user):
        try:
            user = User.objects.get(id=user_uuid)
        except (User.DoesNotExist, ValidationError, ValueError):
            raise ValidationError({"detail": "User not found."})

        if str(user.id) == str(request_user.id):
            raise ValidationError({"detail": "Admin cannot block themselves."})

        if user.is_superuser:
            raise ValidationError({"detail": "Admin cannot block another superuser."})

        user.blocked = not user.blocked
        user.save()
        return user

    @staticmethod
    def delete_user(user_uuid, request_user):
        try:
            user = User.objects.get(id=user_uuid)
        except (User.DoesNotExist, ValidationError, ValueError):
            raise ValidationError({"detail": "User not found."})

        if str(user.id) == str(request_user.id):
            raise ValidationError({"detail": "Cannot delete your own account."})

        if user.is_superuser:
            raise ValidationError({"detail": "Admin cannot delete another superuser."})

        user.delete()
        return True