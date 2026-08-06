from decimal import Decimal
import re
from PIL import Image
from rest_framework import serializers
from ..models import *


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
            "image",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def validate_name(self, value):
        if not value or not isinstance(value, str):
            raise serializers.ValidationError("Category name is required.")

        name = value.strip()

        if not name:
            raise serializers.ValidationError("Category name is required.")

        if len(name) < 2:
            raise serializers.ValidationError("Category name must be at least 2 characters.")

        max_len = Category._meta.get_field("name").max_length or 255
        if len(name) > max_len:
            raise serializers.ValidationError(f"Category name cannot exceed {max_len} characters.")

        if not re.fullmatch(r"[A-Za-z0-9 &'()-]+", name):
            raise serializers.ValidationError("Category name contains invalid characters.")

        queryset = Category.objects.filter(name__iexact=name, is_active=True)
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)

        if queryset.exists():
            raise serializers.ValidationError("A category with this name already exists.")

        return name

    def validate_image(self, image):
        if not image:
            return image

        allowed_types = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ]

        content_type = getattr(image, "content_type", None)
        if content_type and content_type not in allowed_types:
            raise serializers.ValidationError("Only JPG, PNG and WebP images are allowed.")

        if getattr(image, "size", 0) > 5 * 1024 * 1024:
            raise serializers.ValidationError("Image size cannot exceed 5 MB.")

        try:
            img = Image.open(image)
            img.verify()
            if hasattr(image, "seek"):
                image.seek(0)
        except Exception:
            raise serializers.ValidationError("Please upload a valid image file.")

        return image

    def validate(self, attrs):
        if self.instance is None and not attrs.get("image"):
            raise serializers.ValidationError({
                "image": "Category image is required."
            })

        return attrs



class ProductSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True
    )

    variants_count = serializers.IntegerField(
    read_only=True
    )

    total_stock = serializers.IntegerField(
        read_only=True
    )

    lowest_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
        allow_null=True
    )

    highest_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
        allow_null=True
    )

    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [ 
            "id",
            "category",
            "category_name",
            "name",
            "description",
            "primary_image",
            "brand",
            "variants_count",
            "total_stock",
            "lowest_price",
            "highest_price",
            "blocked",
            "is_active",
            "created_at",
            "updated_at",
         ]
        
    def get_primary_image(self, obj):
        image = ProductImage.objects.filter(variant__product=obj, is_primary=True).first()
        if not image:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(image.image.url)
        return image.image.url  


    def validate_category(self, value):
        if not value.is_active:
            raise serializers.ValidationError(
                "Selected category is inactive."
            )

        return value

    def validate_name(self, value):

        return value.strip()


class ProductImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductImage
        fields = [
            "id",
            "image",
            "alt_text",
            "is_primary",
            "display_order",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "is_primary",
            "display_order",
            "created_at",
        ]


class ProductVariantSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:

        model = ProductVariant

        fields = [
            "id",
            "product_name",
            "variant_name",
            "sku",
            "price",
            "sale_price",
            "stock_quantity",
            "display_order",
            "blocked",
            "is_active",
            "images",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "product_name",
            "blocked",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def validate_variant_name(self, value):
        if not value or not isinstance(value, str):
            raise serializers.ValidationError("Variant name is required.")
        name = value.strip()
        if not name:
            raise serializers.ValidationError("Variant name is required.")
        max_len = ProductVariant._meta.get_field("variant_name").max_length or 100
        if len(name) > max_len:
            raise serializers.ValidationError(f"Variant name cannot exceed {max_len} characters.")
        return name

    def validate_sku(self, value):
        if not value or not isinstance(value, str):
            raise serializers.ValidationError("SKU is required.")
        sku = value.strip()
        if not sku:
            raise serializers.ValidationError("SKU is required.")
        max_len = ProductVariant._meta.get_field("sku").max_length or 100
        if len(sku) > max_len:
            raise serializers.ValidationError(f"SKU cannot exceed {max_len} characters.")

        queryset = ProductVariant.objects.filter(sku=sku)
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)

        if queryset.exists():
            raise serializers.ValidationError("SKU already exists.")

        return sku

    def validate_price(self, value):
        if value is None:
            raise serializers.ValidationError("Price is required.")
        if value <= Decimal("0"):
            raise serializers.ValidationError("Price must be greater than 0.")
        return value

    def validate_sale_price(self, value):
        if value is not None and value <= Decimal("0"):
            raise serializers.ValidationError("Sale price must be greater than 0.")
        return value

    def validate_stock_quantity(self, value):
        if value is None:
            raise serializers.ValidationError("Stock quantity is required.")
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value

    def validate_display_order(self, value):
        if value is None:
            return 1
        if value < 1:
            raise serializers.ValidationError("Display order must be 1 or greater.")
        return value

    def validate(self, attrs):
        # Resolve final effective price and sale_price considering partial updates
        price = attrs.get("price") if "price" in attrs else (self.instance.price if self.instance else None)
        sale_price = attrs.get("sale_price") if "sale_price" in attrs else (self.instance.sale_price if self.instance else None)

        if price is not None and price <= Decimal("0"):
            raise serializers.ValidationError({
                "price": "Price must be greater than 0."
            })

        if sale_price is not None:
            if sale_price <= Decimal("0"):
                raise serializers.ValidationError({
                    "sale_price": "Sale price must be greater than 0."
                })
            if price is not None and sale_price > price:
                raise serializers.ValidationError({
                    "sale_price": "Sale price cannot be greater than the original price."
                })

        return attrs


class AdminInventoryItemSerializer(serializers.ModelSerializer):
    product_id = serializers.CharField(source="product.id", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    category_id = serializers.CharField(source="product.category.id", read_only=True)
    category_name = serializers.CharField(source="product.category.name", read_only=True)
    brand = serializers.CharField(source="product.brand", read_only=True)
    product_is_active = serializers.BooleanField(source="product.is_active", read_only=True)
    product_blocked = serializers.BooleanField(source="product.blocked", read_only=True)
    stock_status = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "product_id",
            "product_name",
            "category_id",
            "category_name",
            "brand",
            "variant_name",
            "sku",
            "price",
            "sale_price",
            "stock_quantity",
            "stock_status",
            "is_active",
            "blocked",
            "product_is_active",
            "product_blocked",
            "image",
            "updated_at",
            "created_at",
        ]

    def get_stock_status(self, obj):
        qty = obj.stock_quantity if obj.stock_quantity is not None else 0
        if qty <= 0:
            return "OUT_OF_STOCK"
        elif qty <= 5:
            return "LOW_STOCK"
        return "IN_STOCK"

    def get_image(self, obj):
        active_images = getattr(obj, "active_images", [])
        primary_img = None
        if active_images:
            primary_img = next((img for img in active_images if img.is_primary), active_images[0])
        else:
            primary_img = obj.images.filter(is_primary=True).first() or obj.images.first()

        if primary_img and primary_img.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(primary_img.image.url)
            return primary_img.image.url
        return None


class UpdateStockSerializer(serializers.Serializer):
    stock_quantity = serializers.IntegerField(required=True, min_value=0)
    reason = serializers.CharField(required=False, allow_blank=True, max_length=255)

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock quantity cannot be negative.")
        return value