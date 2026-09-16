from django.urls import path

from .views import (
    AdminBlockUserAPIView,
    AdminLoginAPIView,
    AdminUserDeleteAPIView,
    AdminUserListAPIView,
)

urlpatterns = [
    path("login/", AdminLoginAPIView.as_view(), name="admin-login"),
    path("users/", AdminUserListAPIView.as_view(), name="admin-users-list"),
    path(
        "users/<uuid:uuid>/block/",
        AdminBlockUserAPIView.as_view(),
        name="admin-users-block",
    ),
    path(
        "users/<uuid:uuid>/",
        AdminUserDeleteAPIView.as_view(),
        name="admin-users-delete",
    ),
]
