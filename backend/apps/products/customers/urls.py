from django.urls import path
from .views import *

urlpatterns = [
    #products
    path("products/", ProductListAPIView.as_view(), name="customer-product-list"),
    path("products/<uuid:product_id>/", ProductDetailAPIView.as_view(), name="customer-product-detail"),

    #categories
    path("categories/", CategoryListAPIView.as_view(), name="customer-category-list"),
     path("categories/<uuid:category_id>/products/", CustomerProductsByCategoryAPIView.as_view(), name="products-by-category",
    ),
]
