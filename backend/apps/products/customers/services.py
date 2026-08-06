import uuid
from django.db.models import ( Count, Sum, Min, Max, Q)
from django.db.models.functions import Coalesce
from django.db.models import Value
from apps.products.models import Product, Category
from rest_framework.exceptions import ValidationError


class CustomerProductService:

    @staticmethod
    def get_products():

        return (
            Product.objects.filter(
                is_active=True,
                blocked=False,
            )
            .annotate(
                variants_count=Count(
                    "variants",
                    filter=Q(
                        variants__is_active=True,
                        variants__blocked=False
                    )

                ),

                total_stock=Coalesce(
                    Sum(
                        "variants__stock_quantity",
                        filter=Q(
                            variants__is_active=True,
                            variants__blocked=False
                        )
                    ),

                    Value(0)

                ),

                lowest_price = Min(
                    Coalesce(
                        "variants__sale_price",
                        "variants__price"
                    ),
                    filter=Q(
                        variants__is_active=True,
                        variants__blocked=False
                    )
                ),

                highest_price = Max(
                    Coalesce(
                        "variants__sale_price",
                        "variants__price"
                    ),
                    filter=Q(
                        variants__is_active=True,
                        variants__blocked=False)
                ),

                original_price = Max("variants__price", filter=Q(
                        variants__blocked=False,
                        variants__is_active=True)
                ),

                available_variants=Count(
                    "variants",
                    filter=Q(
                        variants__blocked=False,
                        variants__is_active=True,
                        variants__stock_quantity__gt=0
                    )
                )

            )

            .filter(
                variants_count__gt=0
            )

        )
    
    @staticmethod
    def apply_search(
        queryset,
        search
    ):

        if not search:
            return queryset

        return queryset.filter(
            Q(name__icontains=search)|Q(brand__icontains=search)|Q(category__name__icontains=search)
        )
    
    @staticmethod
    def filter_category(
        queryset,
        category
    ):
        if not category:
            return queryset

        cat_str = str(category).strip()

        # 1. Try parsing as UUID (since Category PK is a UUIDField)
        try:
            category_uuid = uuid.UUID(cat_str)
            return queryset.filter(category_id=category_uuid)
        except (ValueError, TypeError, AttributeError):
            pass

        # 2. Try numeric ID
        if cat_str.isdigit():
            return queryset.filter(category_id=int(cat_str))

        # 3. Try Category Name or slugified name
        clean_name = cat_str.replace('-', ' ')
        return queryset.filter(
            Q(category__name__icontains=clean_name) |
            Q(category__name__iexact=clean_name) |
            Q(category__name__icontains=cat_str) |
            Q(category__name__iexact=cat_str)
        )
    
    @staticmethod
    def filter_brand(

        queryset,
        brand
    ):

        if brand:
            queryset = queryset.filter(
                brand__iexact=brand
            )

        return queryset
    
    @staticmethod
    def filter_price(
        queryset,
        min_price,
        max_price
    ):

        if min_price:
            queryset = queryset.filter(
                lowest_price__gte=min_price
            )

        if max_price:
            queryset = queryset.filter(
                lowest_price__lte=max_price
            )

        return queryset
    
    @staticmethod
    def apply_sort(
        queryset,
        sort
    ):
        SORTING = {
            "newest": "-created_at",
            "price_low": "lowest_price",
            "price_high": "-lowest_price",
            "a_z": "name",
            "z_a": "-name",
        }

        return queryset.order_by(

            SORTING.get(
                sort,
                "-created_at"
            )

        )
    


class CustomerCategoryService:

    @staticmethod
    def get_categories():
        return (
            Category.objects.filter(
                is_active=True,
                products__is_active=True,
                products__blocked=False,
                products__variants__is_active=True,
                products__variants__blocked=False
            )
            .annotate(
                products_count=Count(
                    "products",
                    filter=Q(
                        products__is_active=True,
                        products__blocked=False,
                        products__variants__is_active=True,
                        products__variants__blocked=False
                    ),
                    distinct=True
                )
            )
            .filter(products_count__gt=0)
            .only("id", "name", "description", "image")
            .distinct()
        )
    
    @staticmethod
    def get_products_by_category(category_id):

        try:
            category = Category.objects.get(
                id=category_id,
                is_active=True
            )

        except Category.DoesNotExist:
            raise ValidationError({
                "detail": "Category not found."
            })

        products = (
            Product.objects.filter(
                category=category,
                is_active=True,
                blocked=False
            )
            .annotate(
                lowest_price=Min("variants__sale_price")
            )
            .prefetch_related(
                "variants__images"
            )
            .order_by("-created_at")
        )

        return products
    
