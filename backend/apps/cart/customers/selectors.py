from django.db.models import Prefetch
from apps.cart.models import Cart, CartItem
from apps.products.models import ProductImage


class CustomerCartSelector:

    @staticmethod
    def get_cart_for_user(user):
        
        images_prefetch = Prefetch(
            "variant__images",
            queryset=ProductImage.objects.order_by("display_order"),
            to_attr="active_images"
        )
        
        try:
            cart = (
                Cart.objects.select_related("user")
                .prefetch_related(
                    Prefetch(
                        "items",
                        queryset=CartItem.objects.select_related(
                            "variant",
                            "variant__product",
                            "variant__product__category"
                        ).prefetch_related(images_prefetch)
                    )
                )
                .get(user=user)
            )
            return cart
        except Cart.DoesNotExist:
            return None
