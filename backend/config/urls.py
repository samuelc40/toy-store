"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),

    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/admin/", include("apps.accounts.admins.urls")),
    path("api/v1/admin/products/", include("apps.products.admins.urls")),
    path("api/v1/admin/orders/", include("apps.orders.admins.urls")),
    path("api/v1/admin/coupons/",include("apps.coupons.admins.urls")),
    path("api/v1/admin/offers/", include("apps.offers.admins.urls")),



    path("api/v1/customers/", include("apps.products.customers.urls")),
    path("api/v1/customers/cart/", include("apps.cart.customers.urls")),
    path("api/v1/customers/wishlist/", include("apps.wishlists.urls")),
    path("api/v1/customers/coupons/", include("apps.coupons.customers.urls")),
    path("api/v1/customers/offers/", include("apps.offers.customers.urls")),
    path("api/v1/customers/wallet/", include("apps.wallet.customers.urls")),
    path("api/v1/customers/", include("apps.orders.customers.urls")),
    path("api/v1/customers/payments/", include("apps.payments.customers.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
