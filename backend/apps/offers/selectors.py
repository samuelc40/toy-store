from django.db.models import Q
from django.utils import timezone

from apps.offers.models import CategoryOffer, ProductOffer, ReferralOffer


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
        return (
            ReferralOffer.objects.filter(is_active=True)
            .filter(Q(expiry__isnull=True) | Q(expiry__gte=now))
            .order_by("-created_at")
            .first()
        )

    @staticmethod
    def get_best_active_hero_offer():
        now = timezone.now()

        # Product offers with active, unblocked product & variants
        prod_offers = list(
            ProductOffer.objects.filter(
                is_active=True,
                start_date__lte=now,
                end_date__gte=now,
                product__is_active=True,
                product__blocked=False,
                product__variants__is_active=True,
                product__variants__blocked=False,
            )
            .select_related("product", "product__category")
            .distinct()
            .order_by("-created_at")
        )

        # Category offers with active category & active, unblocked products & variants
        cat_offers = list(
            CategoryOffer.objects.filter(
                is_active=True,
                start_date__lte=now,
                end_date__gte=now,
                category__is_active=True,
                category__products__is_active=True,
                category__products__blocked=False,
                category__products__variants__is_active=True,
                category__products__variants__blocked=False,
            )
            .select_related("category")
            .distinct()
            .order_by("-created_at")
        )

        candidates = []
        for po in prod_offers:
            candidates.append(
                {"type": "PRODUCT", "offer": po, "created_at": po.created_at}
            )
        for co in cat_offers:
            candidates.append(
                {"type": "CATEGORY", "offer": co, "created_at": co.created_at}
            )

        if not candidates:
            return None

        candidates.sort(key=lambda x: x["created_at"], reverse=True)
        return candidates[0]
