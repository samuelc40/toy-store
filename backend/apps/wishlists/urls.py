from django.urls import path

from .views import (
    WishlistAPIView,
    WishlistDeleteAPIView,
)


urlpatterns = [
    path("", WishlistAPIView.as_view(), name="wishlist"),
    path("<uuid:product_id>/", WishlistDeleteAPIView.as_view(), name="wishlist-remove"),
]