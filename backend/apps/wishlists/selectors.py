from django.db.models import Prefetch

from apps.products.customers.services import CustomerProductService

from .models import WishlistItem


class WishlistSelector:

    @staticmethod
    def get_user_wishlist(user):
        annotated_products = CustomerProductService.get_products().select_related(
            "category"
        )
        return (
            WishlistItem.objects.filter(
                user=user, product__is_active=True, product__blocked=False
            )
            .prefetch_related(Prefetch("product", queryset=annotated_products))
            .order_by("-created_at")
        )

    @staticmethod
    def get_item(user, product_id):
        return WishlistItem.objects.filter(user=user, product_id=product_id).first()

    @staticmethod
    def exists(user, product_id):
        return WishlistItem.objects.filter(user=user, product_id=product_id).exists()
