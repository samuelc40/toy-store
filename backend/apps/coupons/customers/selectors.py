from django.utils import timezone
from apps.coupons.models import Coupon, CouponUsage


class CustomerCouponSelector:

    @staticmethod
    def get_active_coupon_by_code(code: str):
        if not code:
            return None
        clean_code = str(code).strip().upper()
        return Coupon.objects.filter(code__iexact=clean_code, is_active=True).first()

    @staticmethod
    def get_user_coupon_usage_count(coupon: Coupon, user) -> int:
        if not coupon or not user or not user.is_authenticated:
            return 0
        return CouponUsage.objects.filter(coupon=coupon, user=user).count()

    @staticmethod
    def get_available_coupons(user, cart_subtotal=0):
        now = timezone.now()
        qs = Coupon.objects.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now,
        )

        available = []
        for coupon in qs:
            if coupon.usage_limit > 0 and coupon.used_count >= coupon.usage_limit:
                continue

            user_count = CustomerCouponSelector.get_user_coupon_usage_count(coupon, user)
            if coupon.per_user_limit > 0 and user_count >= coupon.per_user_limit:
                continue

            available.append(coupon)

        return available
