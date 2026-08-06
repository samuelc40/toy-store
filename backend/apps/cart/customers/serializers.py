from rest_framework import serializers
from apps.cart.models import Cart, CartItem
from apps.products.models import ProductVariant


class CartItemVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    product_id = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    is_in_stock = serializers.SerializerMethodField()
    is_blocked = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            "id",
            "product_id",
            "variant_name",
            "sku",
            "price",
            "sale_price",
            "stock_quantity",
            "is_in_stock",
            "is_blocked",
            "is_available",
            "product_name",
            "category",
            "image",
        ]

    def get_product_name(self, obj):
        if obj and getattr(obj, "product", None):
            return obj.product.name
        return ""

    def get_product_id(self, obj):
        if obj and getattr(obj, "product", None):
            return str(obj.product.id)
        return ""

    def get_category(self, obj):
        if obj and getattr(obj, "product", None) and getattr(obj.product, "category", None):
            return obj.product.category.name
        return ""

    def get_is_in_stock(self, obj):
        if not obj:
            return False
        return obj.stock_quantity > 0 and not self.get_is_blocked(obj)

    def get_is_blocked(self, obj):
        if not obj:
            return True
        v_blocked = getattr(obj, "blocked", False) or not getattr(obj, "is_active", True)
        product = getattr(obj, "product", None)
        p_blocked = False
        if product:
            p_blocked = getattr(product, "blocked", False) or not getattr(product, "is_active", True)
        return v_blocked or p_blocked

    def get_is_available(self, obj):
        return not self.get_is_blocked(obj)

    def get_image(self, obj):
        if not obj:
            return None
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


class CustomerCartItemSerializer(serializers.ModelSerializer):
    variant = CartItemVariantSerializer(read_only=True)
    line_total = serializers.SerializerMethodField()
    discount = serializers.SerializerMethodField()
    is_blocked = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "variant", "quantity", "line_total", "discount", "is_blocked", "is_available"]

    def get_is_blocked(self, obj):
        if not obj.variant:
            return True
        v = obj.variant
        v_blocked = getattr(v, "blocked", False) or not getattr(v, "is_active", True)
        product = getattr(v, "product", None)
        p_blocked = False
        if product:
            p_blocked = getattr(product, "blocked", False) or not getattr(product, "is_active", True)
        return v_blocked or p_blocked

    def get_is_available(self, obj):
        return not self.get_is_blocked(obj)

    def get_line_total(self, obj):
        if not obj.variant:
            return 0.0
        price = obj.variant.sale_price if obj.variant.sale_price else obj.variant.price
        return obj.quantity * price

    def get_discount(self, obj):
        if not obj.variant:
            return 0.0
        if obj.variant.sale_price:
            return obj.quantity * (obj.variant.price - obj.variant.sale_price)
        return 0.0


class CustomerCartSummarySerializer(serializers.ModelSerializer):
    items = CustomerCartItemSerializer(many=True, read_only=True)
    cart_total = serializers.SerializerMethodField()
    savings = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    has_blocked_items = serializers.SerializerMethodField()
    is_checkout_eligible = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "items", "cart_total", "savings", "total_items", "has_blocked_items", "is_checkout_eligible"]

    def get_has_blocked_items(self, obj):
        for item in obj.items.all():
            v = item.variant
            if not v:
                return True
            if getattr(v, "blocked", False) or not getattr(v, "is_active", True):
                return True
            p = getattr(v, "product", None)
            if p and (getattr(p, "blocked", False) or not getattr(p, "is_active", True)):
                return True
        return False

    def get_is_checkout_eligible(self, obj):
        items_list = obj.items.all()
        if not items_list.exists():
            return False
        return not self.get_has_blocked_items(obj)

    def get_cart_total(self, obj):
        return sum(
            ((item.variant.sale_price if item.variant.sale_price else item.variant.price) * item.quantity)
            for item in obj.items.all()
            if item.variant
        )

    def get_savings(self, obj):
        return sum(
            ((item.variant.price - item.variant.sale_price) * item.quantity)
            for item in obj.items.all()
            if item.variant and item.variant.sale_price
        )

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all() if item.variant)
