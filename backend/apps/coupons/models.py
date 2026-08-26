import uuid

from django.conf import settings
from django.db import models

from apps.orders.models import Order


class Coupon(models.Model):

    class DiscountType(models.TextChoices):
        PERCENTAGE = "PERCENTAGE", "Percentage"
        FIXED = "FIXED", "Fixed Amount"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    minimum_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    maximum_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Only used for percentage coupons.")
    usage_limit = models.PositiveIntegerField(default=0, help_text="0 means unlimited.")
    used_count = models.PositiveIntegerField(default=0)
    per_user_limit = models.PositiveIntegerField(default=1)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "coupons"
        ordering = ["-created_at"]

    def __str__(self):
        return self.code


class CouponUsage(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name="usages")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="coupon_usages")
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="coupon_usages")
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "coupon_usages"

        constraints = [
            models.UniqueConstraint(
                fields=["coupon", "user", "order"],
                name="unique_coupon_usage"
            )
        ]

    def __str__(self):
        return f"{self.user.email} - {self.coupon.code}"