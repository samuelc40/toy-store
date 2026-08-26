from django.urls import path
from apps.offers.customers.views import CustomerOffersListAPIView

urlpatterns = [
    path("", CustomerOffersListAPIView.as_view(), name="customer_offers_list"),
]
