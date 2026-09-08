import uuid

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.products.models import ProductVariant
from apps.orders.models import OrderItem


class ProductReview(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="product_reviews",
    )

    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    order_item = models.ForeignKey(
        OrderItem,
        on_delete=models.PROTECT,
        related_name="review",
    )

    rating = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5),
        ]
    )

    comment = models.TextField(
        max_length=2000,
        blank=True,
    )

    is_visible = models.BooleanField(
        default=True,
        help_text="Designates whether this review is visible publicly.",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:

        db_table = "product_reviews"
        ordering = ["-created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=["user", "variant"],
                name="unique_user_variant_review",
            ),
        ]

        indexes = [
            models.Index(
                fields=["variant", "-created_at"],
                name="idx_reviews_variant_created",
            ),
            models.Index(
                fields=["user", "-created_at"],
                name="idx_reviews_user_created",
            ),
        ]