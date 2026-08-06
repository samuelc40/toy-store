from rest_framework.exceptions import ValidationError

from apps.products.models import Product
from .models import WishlistItem


class WishlistService:

    @staticmethod
    def add_product(user, product_id):
        from apps.products.customers.services import CustomerProductService

        try:
            product = CustomerProductService.get_products().select_related("category").get(id=product_id)
        except Exception:
            try:
                product = Product.objects.select_related("category").get(id=product_id, is_active=True, blocked=False)
            except Product.DoesNotExist:
                raise ValidationError({
                    "product": "Product is unavailable."
                })

        item, created = WishlistItem.objects.get_or_create(user=user, product=product)
        item.product = product

        return item, created

    @staticmethod
    def remove_product(user, product_id):

        deleted_count, _ = WishlistItem.objects.filter(user=user, product_id=product_id).delete()

        return deleted_count > 0