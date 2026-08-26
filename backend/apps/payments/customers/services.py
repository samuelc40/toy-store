import uuid
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.accounts.models import Address
from apps.cart.customers.services import CustomerCartService
from apps.cart.models import CartItem
from apps.coupons.customers.services import CustomerCouponService
from apps.orders.customers.services import CustomerCheckoutService
from apps.orders.models import Order
from apps.payments.models import Payment
from apps.payments.customers.selectors import CustomerPaymentSelector
from apps.payments.utils import (
    get_razorpay_client,
    get_razorpay_key_id,
    verify_razorpay_signature,
)


class CustomerPaymentService:

    @classmethod
    def calculate_checkout_totals(cls, user):
        
        cart = CustomerCartService.get_or_create_cart(user)
        items = list(CartItem.objects.select_related("variant", "variant__product").filter(cart=cart))

        if not items:
            raise ValidationError({"cart": "Your cart is empty."})

        subtotal = Decimal("0.00")
        for item in items:
            variant = item.variant
            if not variant or not variant.is_active or getattr(variant, "blocked", False):
                raise ValidationError({"cart": f"Variant '{variant.variant_name if variant else 'Item'}' is unavailable."})

            product = getattr(variant, "product", None)
            if not product or not product.is_active or getattr(product, "blocked", False):
                raise ValidationError({"cart": f"Product '{product.name if product else 'Item'}' is unavailable."})

            if item.quantity > variant.stock_quantity:
                raise ValidationError({
                    "stock": f"Insufficient stock for '{product.name} ({variant.variant_name})'. Only {variant.stock_quantity} left."
                })

            unit_price = variant.sale_price if variant.sale_price else variant.price
            subtotal += Decimal(str(unit_price)) * item.quantity

        applied_coupon = cart.coupon
        coupon_discount = Decimal("0.00")
        if applied_coupon and applied_coupon.is_active:
            CustomerCouponService.validate_coupon_eligibility(applied_coupon, user, subtotal)
            coupon_discount = CustomerCouponService.calculate_discount(applied_coupon, subtotal)

        SHIPPING_THRESHOLD = Decimal("999.00")
        SHIPPING_COST = Decimal("1.00")
        shipping_fee = Decimal("0.00") if (subtotal >= SHIPPING_THRESHOLD or subtotal == Decimal("0.00")) else SHIPPING_COST
        grand_total = max(Decimal("0.00"), (subtotal - coupon_discount) + shipping_fee)

        return {
            "cart": cart,
            "items": items,
            "subtotal": subtotal,
            "coupon_discount": coupon_discount,
            "shipping_fee": shipping_fee,
            "grand_total": grand_total,
        }

    @classmethod
    @transaction.atomic
    def create_razorpay_order(cls, user, address_id):
        
        contact_phone = str(user.phone).strip() if user.phone else ""
        if not contact_phone or not contact_phone.isdigit() or len(contact_phone) != 10:
            raise ValidationError({"phone": "A valid 10-digit contact phone number is required before proceeding to payment."})

        if not address_id:
            raise ValidationError({"address_id": "Please select a delivery address."})

        if not Address.objects.filter(id=address_id, user=user).exists():
            raise ValidationError({"address_id": "Selected delivery address was not found."})

        CustomerCartService.validate_checkout_eligibility(user)
        totals = cls.calculate_checkout_totals(user)
        grand_total = totals["grand_total"]

        if grand_total <= Decimal("0.00"):
            raise ValidationError({"amount": "Order total must be greater than zero."})

        amount_in_paise = int(grand_total * 100)
        rzp_order_id = None

        client = get_razorpay_client()
        if client:
            try:
                rzp_order = client.order.create({
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "payment_capture": 1,
                    "notes": {
                        "user_id": str(user.id),
                        "user_email": user.email,
                    }
                })
                rzp_order_id = rzp_order.get("id")
            except Exception as e:
                pass

        if not rzp_order_id:
            rzp_order_id = f"order_{uuid.uuid4().hex[:14]}"

        payment = Payment.objects.create(
            user=user,
            gateway=Payment.Gateway.RAZORPAY,
            gateway_order_id=rzp_order_id,
            amount=grand_total,
            currency="INR",
            status=Payment.Status.PENDING,
        )

        return {
            "key": get_razorpay_key_id(),
            "razorpay_order_id": rzp_order_id,
            "payment_id": str(payment.id),
            "amount": amount_in_paise,
            "currency": "INR",
            "subtotal": totals["subtotal"],
            "coupon_discount": totals["coupon_discount"],
            "shipping_fee": totals["shipping_fee"],
            "grand_total": grand_total,
        }

    @classmethod
    @transaction.atomic
    def verify_and_complete_payment(cls, user, razorpay_order_id, razorpay_payment_id, razorpay_signature, address_id):

        verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature)

        existing_successful_payment = Payment.objects.filter(
            gateway_payment_id=razorpay_payment_id,
            status=Payment.Status.SUCCESS
        ).select_related("order").first()

        if existing_successful_payment and existing_successful_payment.order:
            return {
                "order_id": str(existing_successful_payment.order.id),
                "order_number": existing_successful_payment.order.order_number,
                "payment_id": existing_successful_payment.gateway_payment_id,
                "already_processed": True,
            }

        payment = CustomerPaymentSelector.get_payment_by_gateway_order_id(razorpay_order_id)
        if not payment:
            payment = Payment.objects.filter(user=user, status=Payment.Status.PENDING).first()

        order = CustomerCheckoutService.place_order(
            user=user,
            address_id=address_id,
            payment_method=Order.PaymentMethod.RAZORPAY,
        )

        if payment:
            payment.order = order
            payment.gateway_payment_id = razorpay_payment_id
            payment.gateway_signature = razorpay_signature
            payment.status = Payment.Status.SUCCESS
            payment.paid_at = timezone.now()
            payment.save()
        else:
            Payment.objects.create(
                user=user,
                order=order,
                gateway=Payment.Gateway.RAZORPAY,
                gateway_order_id=razorpay_order_id,
                gateway_payment_id=razorpay_payment_id,
                gateway_signature=razorpay_signature,
                amount=order.total_amount,
                currency="INR",
                status=Payment.Status.SUCCESS,
                paid_at=timezone.now(),
            )

        return {
            "order_id": str(order.id),
            "order_number": order.order_number,
            "payment_id": razorpay_payment_id,
            "already_processed": False,
        }

    @classmethod
    @transaction.atomic
    def retry_payment(cls, user, address_id):
        
        return cls.create_razorpay_order(user, address_id)