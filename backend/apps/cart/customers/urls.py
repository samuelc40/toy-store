from django.urls import path
from .views import (
    CartAPIView,
    CartItemDetailAPIView,
    CartClearAPIView,
    CartCheckoutValidateAPIView
)

urlpatterns = [
    path("", CartAPIView.as_view(), name="customer-cart"),
    path("clear/", CartClearAPIView.as_view(), name="customer-cart-clear"),
    path("validate-checkout/", CartCheckoutValidateAPIView.as_view(), name="customer-cart-validate-checkout"),
    path("<uuid:item_id>/", CartItemDetailAPIView.as_view(), name="customer-cart-item-detail"),
]
