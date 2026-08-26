from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.offers.models import DiscountType, ReferralRecord
from apps.offers.selectors import CustomerOfferSelector
from apps.wallet.customers.services import WalletService
from apps.wallet.models import WalletTransaction


class PricingService:

    @classmethod
    def get_best_offer_for_product(cls, product, base_price=None):
        if not product or not product.is_active or product.blocked:
            return None

        base_val = Decimal(str(base_price)) if base_price is not None else Decimal("0.00")

        product_offers = CustomerOfferSelector.get_active_product_offers_for_product(product)
        category_offers = CustomerOfferSelector.get_active_category_offers_for_category(product.category)

        best_offer = None
        max_discount = Decimal("0.00")

        # Evaluate Product Offers
        for p_offer in product_offers:
            if p_offer.discount_type == DiscountType.PERCENTAGE:
                disc = (base_val * Decimal(str(p_offer.discount_value))) / Decimal("100.00")
            else:
                disc = Decimal(str(p_offer.discount_value))

            if disc > max_discount:
                max_discount = disc
                best_offer = {
                    "offer_id": str(p_offer.id),
                    "offer_name": f"{product.name} Special Offer",
                    "offer_type": "PRODUCT",
                    "discount_type": p_offer.discount_type,
                    "discount_value": Decimal(str(p_offer.discount_value)),
                    "discount_amount": disc,
                    "start_date": p_offer.start_date,
                    "end_date": p_offer.end_date,
                }

        # Evaluate Category Offers (COMPARE - NEVER STACK)
        for c_offer in category_offers:
            if c_offer.discount_type == DiscountType.PERCENTAGE:
                disc = (base_val * Decimal(str(c_offer.discount_value))) / Decimal("100.00")
            else:
                disc = Decimal(str(c_offer.discount_value))

            # Strictly pick the larger discount
            if disc > max_discount:
                max_discount = disc
                best_offer = {
                    "offer_id": str(c_offer.id),
                    "offer_name": f"{product.category.name} Category Offer",
                    "offer_type": "CATEGORY",
                    "discount_type": c_offer.discount_type,
                    "discount_value": Decimal(str(c_offer.discount_value)),
                    "discount_amount": disc,
                    "start_date": c_offer.start_date,
                    "end_date": c_offer.end_date,
                }

        return best_offer

    @classmethod
    def calculate_variant_price(cls, variant):
        if not variant:
            return {
                "original_price": Decimal("0.00"),
                "base_price": Decimal("0.00"),
                "offer_price": Decimal("0.00"),
                "discount_amount": Decimal("0.00"),
                "discount_percentage": 0,
                "has_offer": False,
                "offer_type": None,
                "offer_name": None,
                "offer_start": None,
                "offer_end": None,
            }

        original_price = Decimal(str(variant.price))
        base_price = Decimal(str(variant.sale_price)) if (variant.sale_price and variant.sale_price > 0) else original_price

        best_offer = cls.get_best_offer_for_product(variant.product, base_price=base_price)

        if best_offer:
            disc_type = best_offer["discount_type"]
            disc_val = best_offer["discount_value"]

            if disc_type == DiscountType.PERCENTAGE:
                disc_amount = (base_price * disc_val) / Decimal("100.00")
            else:
                disc_amount = min(disc_val, base_price)

            disc_amount = round(disc_amount, 2)
            offer_price = max(Decimal("0.00"), base_price - disc_amount)
            
            # Compute total discount percentage relative to original MRP
            if original_price > 0:
                disc_percentage = round(((original_price - offer_price) / original_price) * 100)
            else:
                disc_percentage = 0

            return {
                "original_price": original_price,
                "base_price": base_price,
                "offer_price": offer_price,
                "discount_amount": disc_amount,
                "discount_percentage": disc_percentage,
                "has_offer": True,
                "offer_type": best_offer["offer_type"],
                "offer_name": best_offer["offer_name"],
                "offer_start": best_offer["start_date"],
                "offer_end": best_offer["end_date"],
            }
        else:
            # Fallback to standard variant sale_price if present
            if original_price > 0 and base_price < original_price:
                disc_percentage = round(((original_price - base_price) / original_price) * 100)
            else:
                disc_percentage = 0

            return {
                "original_price": original_price,
                "base_price": base_price,
                "offer_price": base_price,
                "discount_amount": Decimal("0.00"),
                "discount_percentage": disc_percentage,
                "has_offer": False,
                "offer_type": None,
                "offer_name": None,
                "offer_start": None,
                "offer_end": None,
            }

    @classmethod
    def calculate_product_price(cls, product):
        active_variants = product.variants.filter(is_active=True, blocked=False)
        if not active_variants.exists():
            return {
                "lowest_price": Decimal("0.00"),
                "highest_price": Decimal("0.00"),
                "original_price": Decimal("0.00"),
                "discount_percentage": 0,
                "has_offer": False,
            }

        calculated = [cls.calculate_variant_price(v) for v in active_variants]
        offer_prices = [c["offer_price"] for c in calculated]
        orig_prices = [c["original_price"] for c in calculated]

        lowest_offer = min(offer_prices)
        highest_offer = max(offer_prices)
        lowest_orig = min(orig_prices)

        has_any_offer = any(c["has_offer"] for c in calculated)
        disc_percentages = [c["discount_percentage"] for c in calculated]
        max_disc_pct = max(disc_percentages) if disc_percentages else 0

        return {
            "lowest_price": lowest_offer,
            "highest_price": highest_offer,
            "original_price": lowest_orig,
            "discount_percentage": max_disc_pct,
            "has_offer": has_any_offer,
        }

    @classmethod
    def calculate_cart_item_price(cls, variant, quantity):
        qty = int(quantity)
        price_info = cls.calculate_variant_price(variant)
        
        unit_offer_price = price_info["offer_price"]
        unit_original_price = price_info["original_price"]
        
        line_total = round(unit_offer_price * qty, 2)
        line_original_total = round(unit_original_price * qty, 2)
        line_savings = max(Decimal("0.00"), line_original_total - line_total)

        return {
            "variant_id": str(variant.id),
            "unit_original_price": unit_original_price,
            "unit_offer_price": unit_offer_price,
            "quantity": qty,
            "line_total": line_total,
            "line_original_total": line_original_total,
            "line_savings": line_savings,
            "price_info": price_info,
        }

    @classmethod
    def calculate_cart_summary(cls, cart):
        from apps.cart.models import CartItem

        cart_items = CartItem.objects.select_related("variant", "variant__product", "variant__product__category").filter(cart=cart)

        mrp_total = Decimal("0.00")
        subtotal = Decimal("0.00")
        items_payload = []

        for item in cart_items:
            if not item.variant:
                continue
            item_calc = cls.calculate_cart_item_price(item.variant, item.quantity)
            mrp_total += item_calc["line_original_total"]
            subtotal += item_calc["line_total"]
            items_payload.append({
                "cart_item_id": str(item.id),
                "variant": item.variant,
                "quantity": item.quantity,
                "price_info": item_calc["price_info"],
                "line_total": item_calc["line_total"],
                "line_original_total": item_calc["line_original_total"],
            })

        offer_discount_total = max(Decimal("0.00"), mrp_total - subtotal)

        return {
            "mrp_total": mrp_total,
            "subtotal": subtotal,
            "offer_discount_total": offer_discount_total,
            "items": items_payload,
        }

    @classmethod
    def calculate_checkout_total(cls, user, cart, coupon_code=None, use_wallet=False):
        cart_summary = cls.calculate_cart_summary(cart)

        mrp_total = cart_summary["mrp_total"]
        subtotal = cart_summary["subtotal"]
        offer_discount = cart_summary["offer_discount_total"]

        # Coupon calculation (calculated strictly AFTER offer discounts)
        coupon_discount = Decimal("0.00")
        applied_coupon = None

        if coupon_code:
            from apps.coupons.customers.selectors import CustomerCouponSelector
            from apps.coupons.customers.services import CustomerCouponService
            try:
                coupon = CustomerCouponSelector.get_active_coupon_by_code(coupon_code)
                if coupon:
                    CustomerCouponService.validate_coupon_eligibility(coupon, user, subtotal)
                    coupon_discount = CustomerCouponService.calculate_discount(coupon, subtotal)
                    applied_coupon = coupon
            except Exception as coupon_err:
                print(f"Coupon calculation note: {coupon_err}", flush=True)
                pass

        payable_after_coupon = max(Decimal("0.00"), subtotal - coupon_discount)

        # Shipping fee
        shipping_fee = Decimal("0.00") if payable_after_coupon >= Decimal("500.00") else Decimal("50.00")
        if payable_after_coupon == Decimal("0.00"):
            shipping_fee = Decimal("0.00")

        total_with_shipping = payable_after_coupon + shipping_fee

        # Wallet deduction
        wallet_balance = Decimal("0.00")
        wallet_deduction = Decimal("0.00")

        if use_wallet and user and user.is_authenticated:
            wallet = WalletService.get_or_create_wallet(user)
            wallet_balance = Decimal(str(wallet.balance))
            wallet_deduction = min(wallet_balance, total_with_shipping)

        final_payable = max(Decimal("0.00"), total_with_shipping - wallet_deduction)

        return {
            "mrp_total": mrp_total,
            "offer_discount": offer_discount,
            "subtotal": subtotal,
            "coupon_discount": coupon_discount,
            "coupon_code": coupon_code if coupon_discount > 0 else None,
            "payable_after_coupon": payable_after_coupon,
            "shipping_fee": shipping_fee,
            "total_with_shipping": total_with_shipping,
            "wallet_balance": wallet_balance,
            "wallet_deduction": wallet_deduction,
            "final_payable": final_payable,
            "items": cart_summary["items"],
        }

    @classmethod
    @transaction.atomic
    def process_referral_reward(cls, user, order=None):
        if not user or not user.is_authenticated:
            return False

        from apps.accounts.models import User
        user = User.objects.select_for_update().get(id=user.id)

        if user.referral_reward_claimed:
            return False

        referrer = user.referred_by
        if not referrer:
            return False

        active_ref_offer = CustomerOfferSelector.get_active_referral_offer()
        if not active_ref_offer:
            return False

        if order and order.total_amount < active_ref_offer.minimum_order_amount:
            return False

        # Credit Referrer Wallet
        if active_ref_offer.referrer_bonus > Decimal("0.00"):
            WalletService.credit(
                user=referrer,
                amount=active_ref_offer.referrer_bonus,
                reason=WalletTransaction.TransactionReason.REFERRAL,
                description=f"Referral bonus reward for inviting {user.email}",
            )

        # Credit New User Wallet
        if active_ref_offer.new_user_bonus > Decimal("0.00"):
            WalletService.credit(
                user=user,
                amount=active_ref_offer.new_user_bonus,
                reason=WalletTransaction.TransactionReason.REFERRAL,
                description=f"Welcome bonus for joining via referral code of {referrer.email}",
            )

        user.referral_reward_claimed = True
        user.save(update_fields=["referral_reward_claimed", "updated_at"])

        ReferralRecord.objects.create(
            referrer=referrer,
            referred_user=user,
            reward_claimed=True,
        )
        return True
