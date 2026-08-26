from django.urls import path
from apps.offers.admins.views import (
    AdminProductOfferListCreateAPIView,
    AdminProductOfferDetailAPIView,
    AdminCategoryOfferListCreateAPIView,
    AdminCategoryOfferDetailAPIView,
    AdminReferralOfferConfigAPIView,
)

urlpatterns = [
    # Product Offers
    path("products/", AdminProductOfferListCreateAPIView.as_view(), name="admin_product_offers_list_create"),
    path("products/<uuid:offer_id>/", AdminProductOfferDetailAPIView.as_view(), name="admin_product_offers_detail"),

    # Category Offers
    path("categories/", AdminCategoryOfferListCreateAPIView.as_view(), name="admin_category_offers_list_create"),
    path("categories/<uuid:offer_id>/", AdminCategoryOfferDetailAPIView.as_view(), name="admin_category_offers_detail"),

    # Referral Offer Config
    path("referral-config/", AdminReferralOfferConfigAPIView.as_view(), name="admin_referral_offer_config"),
]

