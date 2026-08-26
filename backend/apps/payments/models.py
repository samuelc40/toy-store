import uuid
from django.db import models
from django.conf import settings
from apps.orders.models import Order


class Payment(models.Model):

    class Gateway(models.TextChoices):
        COD = "COD", "Cash On Delivery"
        RAZORPAY = "RAZORPAY", "Razorpay"
        PAYPAL = "PAYPAL", "PayPal"
        STRIPE = "STRIPE", "Stripe"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"
        CANCELLED = "CANCELLED", "Cancelled"
        REFUNDED = "REFUNDED", "Refunded"
        PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED", "Partially Refunded"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name="payments")
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name="payments")
    gateway = models.CharField(max_length=20, choices=Gateway.choices, default=Gateway.RAZORPAY)
    gateway_order_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    gateway_payment_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    gateway_signature = models.TextField(blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="INR")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    gateway_response = models.JSONField(blank=True, null=True)
    failure_reason = models.TextField(blank=True, null=True)
    paid_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payments"
        ordering = ["-created_at"]

    def __str__(self):
        order_info = self.order.order_number if self.order else f"No Order ({self.gateway_order_id or self.id})"
        return f"{self.gateway} - {order_info} - {self.status}"