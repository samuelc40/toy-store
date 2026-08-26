from django.urls import path

from .views import *


urlpatterns = [

    path("", CouponListCreateAPIView.as_view(), name="coupon-list-create"),
    path("<uuid:coupon_id>/", CouponDetailAPIView.as_view(), name="coupon-detail"),

]