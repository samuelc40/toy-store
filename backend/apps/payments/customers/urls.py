from django.urls import path
from apps.payments.customers.views import (
    CreateGatewayOrderAPIView,
    VerifyPaymentAPIView,
    RetryPaymentAPIView,
    PaymentDetailAPIView,
)
from apps.payments.webhooks import RazorpayWebhookAPIView

urlpatterns = [
    path("create-order/", CreateGatewayOrderAPIView.as_view(), name="create-payment-order"),
    path("verify/", VerifyPaymentAPIView.as_view(), name="verify-payment"),
    path("retry/", RetryPaymentAPIView.as_view(), name="retry-payment"),
    path("webhook/", RazorpayWebhookAPIView.as_view(), name="payment-webhook"),
    path("<uuid:payment_id>/", PaymentDetailAPIView.as_view(), name="payment-detail"),
]