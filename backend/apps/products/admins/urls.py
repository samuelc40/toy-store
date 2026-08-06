from django.urls import path
from .views import *

urlpatterns = [
    #Categories
    path("categories/", AdminCategoryListCreateAPIView.as_view(), name="admin-category-list-create"),
    path("categories/<uuid:uuid>/", AdminCategoryDetailAPIView.as_view(), name="admin-category-detail"),

    #Products
    path("",ProductListCreateAPIView.as_view(), name="product-list-create"),
    path("<uuid:product_id>/", ProductDetailAPIView.as_view()),
    path("<uuid:product_id>/block/", ProductBlockAPIView.as_view()),

    #Product Variants
    path("<uuid:product_id>/variants/", ProductVariantListCreateAPIView.as_view(), name="variant-list-create"),
    path("variants/<uuid:variant_id>/", ProductVariantDetailAPIView.as_view(), name="variant-detail"),
    path("variants/<uuid:variant_id>/block/", ProductVariantBlockAPIView.as_view(), name="variant-block"),

    #Product images
    path("variants/<uuid:variant_id>/images/", ProductImageUploadAPIView.as_view(), name="product-image-upload"),

    #Inventory Management
    path("inventory/", AdminInventoryListAPIView.as_view(), name="admin-inventory-list"),
    path("inventory/summary/", AdminInventorySummaryAPIView.as_view(), name="admin-inventory-summary"),
    path("inventory/variants/<uuid:variant_id>/stock/", AdminUpdateStockAPIView.as_view(), name="admin-inventory-update-stock"),
]
