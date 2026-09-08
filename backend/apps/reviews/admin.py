from django.contrib import admin

from .models import ProductReview


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "variant",
        "rating",
        "is_visible",
        "created_at",
    )
    list_filter = (
        "rating",
        "is_visible",
        "created_at",
    )
    search_fields = (
        "user__email",
        "user__first_name",
        "user__last_name",
        "comment",
        "variant__variant_name",
    )
    ordering = ("-created_at",)
