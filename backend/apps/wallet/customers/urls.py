from django.urls import path
from apps.wallet.customers.views import CustomerWalletDetailAPIView, CustomerWalletTransactionsAPIView

urlpatterns = [
    path("", CustomerWalletDetailAPIView.as_view(), name="customer_wallet_detail"),
    path("transactions/", CustomerWalletTransactionsAPIView.as_view(), name="customer_wallet_transactions"),
]
