from django.urls import path

from apps.coupons.customers.views import (
    ApplyCouponAPIView,
    AvailableCouponsAPIView,
    RemoveCouponAPIView,
)

urlpatterns = [
    path("apply/", ApplyCouponAPIView.as_view(), name="coupon-apply"),
    path("remove/", RemoveCouponAPIView.as_view(), name="coupon-remove"),
    path("available/", AvailableCouponsAPIView.as_view(), name="coupon-available"),
]
