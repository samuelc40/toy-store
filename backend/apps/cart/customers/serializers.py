from rest_framework import serializers
from apps.cart.models import Cart, CartItem
from apps.products.models import ProductVariant
from apps.offers.services import PricingService


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
    original_line_total = serializers.SerializerMethodField()
    discount = serializers.SerializerMethodField()
    offer_info = serializers.SerializerMethodField()
    is_blocked = serializers.SerializerMethodField()
    is_available = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "variant",
            "quantity",
            "line_total",
            "original_line_total",
            "discount",
            "offer_info",
            "is_blocked",
            "is_available",
        ]

    def _get_item_pricing(self, obj):
        if not hasattr(obj, "_pricing_cache"):
            if not obj.variant:
                obj._pricing_cache = None
            else:
                obj._pricing_cache = PricingService.calculate_cart_item_price(obj.variant, obj.quantity)
        return obj._pricing_cache

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
        calc = self._get_item_pricing(obj)
        return float(calc["line_total"]) if calc else 0.0

    def get_original_line_total(self, obj):
        calc = self._get_item_pricing(obj)
        return float(calc["line_original_total"]) if calc else 0.0

    def get_discount(self, obj):
        calc = self._get_item_pricing(obj)
        return float(calc["line_savings"]) if calc else 0.0

    def get_offer_info(self, obj):
        calc = self._get_item_pricing(obj)
        if calc and calc["price_info"]["has_offer"]:
            return {
                "offer_type": calc["price_info"]["offer_type"],
                "offer_name": calc["price_info"]["offer_name"],
                "discount_percentage": calc["price_info"]["discount_percentage"],
            }
        return None


from decimal import Decimal
from apps.coupons.customers.services import CustomerCouponService


class CustomerCartSummarySerializer(serializers.ModelSerializer):
    items = CustomerCartItemSerializer(many=True, read_only=True)
    cart_total = serializers.SerializerMethodField()
    mrp_total = serializers.SerializerMethodField()
    savings = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    has_blocked_items = serializers.SerializerMethodField()
    is_checkout_eligible = serializers.SerializerMethodField()
    applied_coupon = serializers.SerializerMethodField()
    coupon_discount = serializers.SerializerMethodField()
    shipping_fee = serializers.SerializerMethodField()
    grand_total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "items",
            "cart_total",
            "mrp_total",
            "savings",
            "total_items",
            "has_blocked_items",
            "is_checkout_eligible",
            "applied_coupon",
            "coupon_discount",
            "shipping_fee",
            "grand_total",
        ]

    def _get_cart_calc(self, obj):
        if not hasattr(obj, "_cart_pricing_cache"):
            user = getattr(obj, "user", None)
            coupon_code = obj.coupon.code if (obj.coupon and obj.coupon.is_active) else None
            obj._cart_pricing_cache = PricingService.calculate_checkout_total(user, obj, coupon_code=coupon_code, use_wallet=False)
        return obj._cart_pricing_cache

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
        return float(self._get_cart_calc(obj)["subtotal"])

    def get_mrp_total(self, obj):
        return float(self._get_cart_calc(obj)["mrp_total"])

    def get_savings(self, obj):
        calc = self._get_cart_calc(obj)
        return float(calc["offer_discount"] + calc["coupon_discount"])

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all() if item.variant)

    def get_applied_coupon(self, obj):
        if not obj or not obj.coupon or not obj.coupon.is_active:
            return None
        return {
            "code": obj.coupon.code,
            "description": obj.coupon.description,
            "discount_type": obj.coupon.discount_type,
            "discount_value": str(obj.coupon.discount_value),
        }

    def get_coupon_discount(self, obj):
        return float(self._get_cart_calc(obj)["coupon_discount"])

    def get_shipping_fee(self, obj):
        return float(self._get_cart_calc(obj)["shipping_fee"])

    def get_grand_total(self, obj):
        return float(self._get_cart_calc(obj)["final_payable"])
