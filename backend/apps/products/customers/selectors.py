from django.db.models import Prefetch, Q
from apps.products.models import Product, ProductVariant, ProductImage, Category


class CustomerProductSelector:

    @staticmethod
    def get_product_details(product_id):
        
        # Prefetch only active and unblocked variants
        variants_prefetch = Prefetch(
            "variants",
            queryset=ProductVariant.objects.filter(is_active=True, blocked=False).order_by("display_order"),
            to_attr="active_variants"
        )

        try:
            product = (
                Product.objects.select_related("category")
                .prefetch_related(variants_prefetch)
                .get(id=product_id, is_active=True, blocked=False)
            )
        except Product.DoesNotExist:
            return None

        if not product.active_variants:
            return None

        return product

    @staticmethod
    def get_related_products(product):
        # Retrieve up to 8 active, unblocked related products belonging to the same category (excluding current)
        # Reuses CustomerProductService to ensure all annotated fields (original_price, lowest_price, etc.) are populated.
        from .services import CustomerProductService
        return (
            CustomerProductService.get_products()
            .filter(category=product.category)
            .exclude(id=product.id)[:8]
        )
    

class CustomerCategorySelector:

    @staticmethod
    def get_categories():
        return (
            Category.objects.filter(is_active=True, is_blocked=False).order_by("name")
        )
