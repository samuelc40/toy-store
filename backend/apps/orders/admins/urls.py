from django.urls import path
from apps.orders.admins.views import (
    AdminOrderListAPIView,
    AdminOrderDetailAPIView,
    AdminUpdateOrderStatusAPIView,
)

urlpatterns = [
    path("", AdminOrderListAPIView.as_view(), name="admin_order_list"),
    path("<uuid:order_id>/", AdminOrderDetailAPIView.as_view(), name="admin_order_detail"),
    path("<uuid:order_id>/status/", AdminUpdateOrderStatusAPIView.as_view(), name="admin_update_order_status"),
]
