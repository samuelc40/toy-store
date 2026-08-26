from rest_framework import serializers
from apps.products.models import Product, Category, ProductVariant, ProductImage
from apps.offers.services import PricingService


class CustomerProductSerializer(serializers.ModelSerializer):

    category = serializers.CharField(
        source="category.name",
        read_only=True
    )

    lowest_price = serializers.SerializerMethodField()
    highest_price = serializers.SerializerMethodField()
    original_price = serializers.SerializerMethodField()
    variants_count = serializers.SerializerMethodField()
    total_stock = serializers.SerializerMethodField()
    available_variants = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    discount_percentage = serializers.SerializerMethodField()
    has_offer = serializers.SerializerMethodField()
    is_in_stock = serializers.SerializerMethodField()
    default_variant_id = serializers.SerializerMethodField()

    class Meta:

        model = Product

        fields = [
            "id",
            "name",
            "brand",
            "category",
            "description",
            "primary_image",
            "lowest_price",
            "highest_price",
            "original_price",
            "discount_percentage",
            "has_offer",
            "is_in_stock",
            "variants_count",
            "available_variants",
            "total_stock",
            "default_variant_id",
        ]

    def _get_pricing(self, obj):
        if not hasattr(obj, "_computed_pricing"):
            obj._computed_pricing = PricingService.calculate_product_price(obj)
        return obj._computed_pricing

    def get_lowest_price(self, obj):
        return self._get_pricing(obj)["lowest_price"]

    def get_highest_price(self, obj):
        return self._get_pricing(obj)["highest_price"]

    def get_original_price(self, obj):
        return self._get_pricing(obj)["original_price"]

    def get_discount_percentage(self, obj):
        return self._get_pricing(obj)["discount_percentage"]

    def get_has_offer(self, obj):
        return self._get_pricing(obj)["has_offer"]

    def get_variants_count(self, obj):
        val = getattr(obj, "variants_count", None)
        if val is not None:
            return val
        return obj.variants.filter(is_active=True, blocked=False).count()

    def get_total_stock(self, obj):
        val = getattr(obj, "total_stock", None)
        if val is not None:
            return val
        from django.db.models import Sum
        tot = obj.variants.filter(is_active=True, blocked=False).aggregate(total=Sum("stock_quantity"))["total"]
        return tot if tot is not None else 0

    def get_available_variants(self, obj):
        val = getattr(obj, "available_variants", None)
        if val is not None:
            return val
        return obj.variants.filter(is_active=True, blocked=False, stock_quantity__gt=0).count()

    def get_is_in_stock(self, obj):
        tot_stock = self.get_total_stock(obj)
        return tot_stock > 0

    def get_default_variant_id(self, obj):
        variant = (
            obj.variants.filter(
                is_active=True,
                blocked=False
            )
            .order_by("display_order")
            .first()
        )
        if variant:
            return str(variant.id)
        return None
    
    
    def get_primary_image(self, obj):

        image = (
            obj.variants.filter(
                is_active=True,
                blocked=False,
                images__is_primary=True
            )
            .first()
        )

        if not image:
            return None

        primary = image.images.filter(
            is_primary=True
        ).first()

        if not primary:
            return None

        request = self.context.get("request")

        return request.build_absolute_uri(
            primary.image.url
        )


class CustomerCategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
            "image",
            "products_count",
        ]

    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url
    

    
class CustomerProductByCategorySerializer(serializers.ModelSerializer):

    lowest_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    primary_image = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "brand",
            "lowest_price",
            "primary_image",
        )

    def get_primary_image(self, obj):

        image = ProductImage.objects.filter(
            variant__product=obj,
            is_primary=True
        ).first()

        if not image:
            return None

        request = self.context.get("request")
        return request.build_absolute_uri(image.image.url)


class ProductDetailImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ["id", "image", "is_primary", "display_order"]

    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url


class ProductDetailVariantSerializer(serializers.ModelSerializer):
    discount_percentage = serializers.SerializerMethodField()
    offer_price = serializers.SerializerMethodField()
    has_offer = serializers.SerializerMethodField()
    offer_type = serializers.SerializerMethodField()
    offer_name = serializers.SerializerMethodField()
    offer_start = serializers.SerializerMethodField()
    offer_end = serializers.SerializerMethodField()
    is_in_stock = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()
    is_default = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "variant_name",
            "sku",
            "price",
            "sale_price",
            "offer_price",
            "discount_percentage",
            "has_offer",
            "offer_type",
            "offer_name",
            "offer_start",
            "offer_end",
            "stock_quantity",
            "is_in_stock",
            "thumbnail",
            "is_default",
            "images",
        ]

    def _get_price_info(self, obj):
        if not hasattr(obj, "_pricing_cache"):
            obj._pricing_cache = PricingService.calculate_variant_price(obj)
        return obj._pricing_cache

    def get_offer_price(self, obj):
        return self._get_price_info(obj)["offer_price"]

    def get_discount_percentage(self, obj):
        return self._get_price_info(obj)["discount_percentage"]

    def get_has_offer(self, obj):
        return self._get_price_info(obj)["has_offer"]

    def get_offer_type(self, obj):
        return self._get_price_info(obj)["offer_type"]

    def get_offer_name(self, obj):
        return self._get_price_info(obj)["offer_name"]

    def get_offer_start(self, obj):
        return self._get_price_info(obj)["offer_start"]

    def get_offer_end(self, obj):
        return self._get_price_info(obj)["offer_end"]

    def get_is_in_stock(self, obj):
        return obj.stock_quantity > 0

    def get_images(self, obj):
        variant_images = obj.images.all().order_by("display_order")
        return ProductDetailImageSerializer(
            variant_images, many=True, context=self.context
        ).data

    def get_thumbnail(self, obj):
        primary_img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if primary_img and primary_img.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(primary_img.image.url)
            return primary_img.image.url
        return None

    def get_is_default(self, obj):
        active_variants = getattr(obj.product, 'active_variants', [])
        if active_variants:
            return active_variants[0].id == obj.id
        return False


class CustomerProductDetailSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.name", read_only=True)
    breadcrumbs = serializers.SerializerMethodField()
    highlights = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    
    default_variant = serializers.SerializerMethodField()
    variants = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    offers = serializers.SerializerMethodField()
    reviews_summary = serializers.SerializerMethodField()
    related_products = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "brand",
            "category",
            "breadcrumbs",
            "highlights",
            "average_rating",
            "total_reviews",
            "default_variant",
            "variants",
            "images",
            "offers",
            "reviews_summary",
            "related_products",
        ]

    def get_breadcrumbs(self, obj):
        return ["Home", "Categories", obj.category.name, obj.name]

    def get_highlights(self, obj):
        return []

    def get_average_rating(self, obj):
        return 0.0

    def get_total_reviews(self, obj):
        return 0

    def get_default_variant(self, obj):
        active_variants = getattr(obj, "active_variants", [])
        if active_variants:
            return ProductDetailVariantSerializer(
                active_variants[0], context=self.context
            ).data
        return None

    def get_variants(self, obj):
        active_variants = getattr(obj, "active_variants", [])
        return ProductDetailVariantSerializer(
            active_variants, many=True, context=self.context
        ).data

    def get_images(self, obj):
        active_variants = getattr(obj, "active_variants", [])
        images = []
        seen_images = set()
        
        for variant in active_variants:
            variant_images = variant.images.all().order_by("display_order")
            for img in variant_images:
                if img.id not in seen_images:
                    seen_images.add(img.id)
                    images.append(img)
                    
        images.sort(key=lambda x: x.display_order)
        return ProductDetailImageSerializer(
            images, many=True, context=self.context
        ).data

    def get_offers(self, obj):
        return []

    def get_reviews_summary(self, obj):
        return {
            "average_rating": 0.0,
            "total_reviews": 0,
            "rating_breakdown": {
                "5": 0,
                "4": 0,
                "3": 0,
                "2": 0,
                "1": 0
            }
        }

    def get_related_products(self, obj):
        from .selectors import CustomerProductSelector
        related = CustomerProductSelector.get_related_products(obj)
        return CustomerProductSerializer(
            related, many=True, context=self.context
        ).data
    

