import uuid
from django.db import models
from apps.products.models import Product, Category


class DiscountType(models.TextChoices):
    PERCENTAGE = "PERCENTAGE", "Percentage"
    FLAT = "FLAT", "Flat"


class ProductOffer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="offers")
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "product_offers"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.product.name} - {self.discount_value} ({self.discount_type})"


class CategoryOffer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="offers")
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "category_offers"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.category.name} - {self.discount_value} ({self.discount_type})"


class ReferralOffer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referrer_bonus = models.DecimalField(max_digits=10, decimal_places=2)
    new_user_bonus = models.DecimalField(max_digits=10, decimal_places=2)
    minimum_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_usage = models.PositiveIntegerField(default=1)
    expiry = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "referral_offers"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Referral Offer #{str(self.id)[:8]} (Referrer: Rs. {self.referrer_bonus}, User: Rs. {self.new_user_bonus})"


class ReferralRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referrer = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="referral_records_sent")
    referred_user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="referral_records_received")
    reward_claimed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "referral_records"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Referral: {self.referrer.email} -> {self.referred_user.email} (Claimed: {self.reward_claimed})"
