from django.utils import timezone
from django.db.models import Q
from apps.offers.models import ProductOffer, CategoryOffer, ReferralOffer


class CustomerOfferSelector:

    @staticmethod
    def get_active_product_offers_for_product(product):
        now = timezone.now()
        return ProductOffer.objects.filter(
            product=product,
            is_active=True,
            start_date__lte=now,
            end_date__gte=now,
        ).order_by("-created_at")

    @staticmethod
    def get_active_category_offers_for_category(category):
        if not category:
            return CategoryOffer.objects.none()
        now = timezone.now()
        return CategoryOffer.objects.filter(
            category=category,
            is_active=True,
            start_date__lte=now,
            end_date__gte=now,
        ).order_by("-created_at")

    @staticmethod
    def get_active_referral_offer():
        now = timezone.now()
        return ReferralOffer.objects.filter(
            is_active=True
        ).filter(
            Q(expiry__isnull=True) | Q(expiry__gte=now)
        ).order_by("-created_at").first()
