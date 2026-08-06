from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import *
from .admins.views import *

urlpatterns = [

    path("register/", RegisterAPIView.as_view(), name="register"),
    path("verify-email/", VerifyEmailAPIView.as_view(), name="verify-email"),
    path("resend-otp/", ResendOTPAPIView.as_view(), name="resend-otp"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("refresh-token/", CookieTokenRefreshView.as_view(), name="refresh-token"),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
    path("forgot-password/", ForgotPasswordAPIView.as_view(), name="forgot-password"),
    path("verify-reset-otp/", VerifyResetOTPAPIView.as_view(), name="verify-reset-otp"),
    path("reset-password/", ResetPasswordAPIView.as_view(), name="reset-password",),
    path("change-password/", ChangePasswordAPIView.as_view(), name="change-password"),
    path("change-email/", ChangeEmailAPIView.as_view(), name="change-email"),
    path("verify-email-change/", VerifyEmailChangeAPIView.as_view(), name="verify-email-change"),
    path("users/me/", ProfileAPIView.as_view(), name="me"),
    path("addresses/", AddressListCreateAPIView.as_view(), name="address-list-create"),
    path("addresses/<uuid:uuid>/", AddressDetailAPIView.as_view(), name="address-detail"),
    path("addresses/<uuid:uuid>/default/", DefaultAddressAPIView.as_view(), name="address-default"),

    # Google Authentication
    path("google/", GoogleLoginAPIView.as_view(), name="google-login"),

    #Admin

    path("admin/login/", AdminLoginAPIView.as_view(), name="admin-login"),



]