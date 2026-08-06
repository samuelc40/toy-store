from rest_framework import serializers
from apps.products.models import Product, Category, ProductVariant, ProductImage


class CustomerProductSerializer(serializers.ModelSerializer):

    category = serializers.CharField(
        source="category.name",
        read_only=True
    )

    lowest_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    highest_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    original_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    variants_count = serializers.IntegerField(
        read_only=True
    )

    total_stock = serializers.IntegerField(
        read_only=True
    )

    available_variants = serializers.IntegerField(
        read_only=True
    )

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
            .values_list(
                "images__image",
                flat=True
            )
            .first()
        )

        if image:

            request = self.context.get("request")

            return request.build_absolute_uri(image.url)

        return None

    def get_discount_percentage(self, obj):
        orig = getattr(obj, "original_price", None)
        lowest = getattr(obj, "lowest_price", None)
        if not orig or not lowest:
            return 0
        if lowest >= orig:
            return 0
        return round(((orig - lowest) / orig) * 100)

    def get_has_offer(self, obj):
        orig = getattr(obj, "original_price", None)
        lowest = getattr(obj, "lowest_price", None)
        if not orig or not lowest:
            return False
        return lowest < orig

    def get_is_in_stock(self, obj):
        avail = getattr(obj, "available_variants", None)
        if avail is not None:
            return avail > 0
        return obj.variants.filter(is_active=True, blocked=False, stock_quantity__gt=0).exists()
    
    
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
            "discount_percentage",
            "stock_quantity",
            "is_in_stock",
            "thumbnail",
            "is_default",
            "images",
        ]

    def get_discount_percentage(self, obj):
        if not obj.sale_price or obj.price <= 0:
            return 0
        if obj.sale_price >= obj.price:
            return 0
        return round(((obj.price - obj.sale_price) / obj.price) * 100)

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
    

