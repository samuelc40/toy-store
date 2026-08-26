from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.coupons.models import Coupon, CouponUsage
from apps.coupons.customers.selectors import CustomerCouponSelector
from apps.cart.customers.services import CustomerCartService
from apps.cart.models import CartItem


class CustomerCouponService:

    @classmethod
    def validate_coupon_eligibility(cls, coupon: Coupon, user, cart_subtotal: Decimal):
        
        now = timezone.now()

        if not coupon or not coupon.is_active:
            raise ValidationError({"coupon": "Invalid or inactive coupon code."})

        if coupon.start_date and now < coupon.start_date:
            raise ValidationError({"coupon": "This coupon is not active yet."})

        if coupon.end_date and now > coupon.end_date:
            raise ValidationError({"coupon": "This coupon has expired."})

        if coupon.usage_limit > 0 and coupon.used_count >= coupon.usage_limit:
            raise ValidationError({"coupon": "This coupon's maximum usage limit has been reached."})

        if coupon.per_user_limit > 0:
            usage_count = CustomerCouponSelector.get_user_coupon_usage_count(coupon, user)
            if usage_count >= coupon.per_user_limit:
                raise ValidationError({"coupon": "You have already used this coupon maximum allowed times."})

        if cart_subtotal <= 0:
            raise ValidationError({"coupon": "Your cart is empty."})

        if coupon.minimum_order_amount > 0 and cart_subtotal < coupon.minimum_order_amount:
            raise ValidationError({
                "coupon": f"Minimum order amount of Rs. {coupon.minimum_order_amount:.2f} is required for coupon '{coupon.code}'."
            })

    @classmethod
    def calculate_discount(cls, coupon: Coupon, cart_subtotal: Decimal) -> Decimal:
        if not coupon or cart_subtotal <= 0:
            return Decimal("0.00")

        discount = Decimal("0.00")
        if coupon.discount_type == Coupon.DiscountType.PERCENTAGE:
            discount = (cart_subtotal * Decimal(str(coupon.discount_value))) / Decimal("100")
            if coupon.maximum_discount_amount and coupon.maximum_discount_amount > 0:
                discount = min(discount, Decimal(str(coupon.maximum_discount_amount)))
        elif coupon.discount_type == Coupon.DiscountType.FIXED:
            discount = Decimal(str(coupon.discount_value))

        discount = min(discount, cart_subtotal)
        return max(Decimal("0.00"), discount)

    @classmethod
    @transaction.atomic
    def apply_coupon(cls, user, code: str):
        cart = CustomerCartService.get_or_create_cart(user)
        cart_items = list(CartItem.objects.select_related("variant").filter(cart=cart))

        if not cart_items:
            raise ValidationError({"cart": "Cannot apply coupon to an empty cart."})

        from apps.offers.services import PricingService
        cart_summary = PricingService.calculate_cart_summary(cart)
        subtotal = cart_summary["subtotal"]

        coupon = CustomerCouponSelector.get_active_coupon_by_code(code)
        if not coupon:
            raise ValidationError({"coupon": f"Coupon code '{code}' does not exist or is invalid."})

        cls.validate_coupon_eligibility(coupon, user, subtotal)

        cart.coupon = coupon
        cart.save(update_fields=["coupon", "updated_at"])

        checkout_calc = PricingService.calculate_checkout_total(user, cart, coupon_code=coupon.code)

        return {
            "coupon_code": coupon.code,
            "discount_type": coupon.discount_type,
            "discount_value": coupon.discount_value,
            "discount_amount": checkout_calc["coupon_discount"],
            "subtotal": checkout_calc["subtotal"],
            "shipping_fee": checkout_calc["shipping_fee"],
            "total_payable": checkout_calc["final_payable"],
            "message": f"Coupon '{coupon.code}' applied successfully!",
        }

    @classmethod
    @transaction.atomic
    def remove_coupon(cls, user):
        cart = CustomerCartService.get_or_create_cart(user)
        cart.coupon = None
        cart.save(update_fields=["coupon", "updated_at"])

        from apps.offers.services import PricingService
        checkout_calc = PricingService.calculate_checkout_total(user, cart, coupon_code=None)

        return {
            "coupon_code": None,
            "discount_amount": Decimal("0.00"),
            "subtotal": checkout_calc["subtotal"],
            "shipping_fee": checkout_calc["shipping_fee"],
            "total_payable": checkout_calc["final_payable"],
            "message": "Coupon removed successfully.",
        }
