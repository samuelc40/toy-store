from django.db.models import Q
from django.utils import timezone
from apps.offers.models import ProductOffer, CategoryOffer, ReferralOffer


class AdminOfferSelector:

    @staticmethod
    def get_product_offers(search=None, status_filter=None, sort_by="-created_at"):
        now = timezone.now()
        queryset = ProductOffer.objects.select_related("product", "product__category").all()

        if status_filter and status_filter.upper() != "ALL":
            st = status_filter.upper()
            if st == "ACTIVE":
                queryset = queryset.filter(is_active=True, start_date__lte=now, end_date__gte=now)
            elif st == "INACTIVE":
                queryset = queryset.filter(is_active=False)
            elif st == "UPCOMING":
                queryset = queryset.filter(is_active=True, start_date__gt=now)
            elif st == "EXPIRED":
                queryset = queryset.filter(end_date__lt=now)

        if search:
            clean = search.strip()
            queryset = queryset.filter(
                Q(product__name__icontains=clean) |
                Q(product__brand__icontains=clean) |
                Q(product__category__name__icontains=clean)
            ).distinct()

        return queryset.order_by(sort_by)

    @staticmethod
    def get_product_offer_by_id(offer_id):
        try:
            return ProductOffer.objects.select_related("product", "product__category").get(id=offer_id)
        except (ProductOffer.DoesNotExist, ValueError):
            return None

    @staticmethod
    def get_category_offers(search=None, status_filter=None, sort_by="-created_at"):
        now = timezone.now()
        queryset = CategoryOffer.objects.select_related("category").all()

        if status_filter and status_filter.upper() != "ALL":
            st = status_filter.upper()
            if st == "ACTIVE":
                queryset = queryset.filter(is_active=True, start_date__lte=now, end_date__gte=now)
            elif st == "INACTIVE":
                queryset = queryset.filter(is_active=False)
            elif st == "UPCOMING":
                queryset = queryset.filter(is_active=True, start_date__gt=now)
            elif st == "EXPIRED":
                queryset = queryset.filter(end_date__lt=now)

        if search:
            clean = search.strip()
            queryset = queryset.filter(category__name__icontains=clean).distinct()

        return queryset.order_by(sort_by)

    @staticmethod
    def get_category_offer_by_id(offer_id):
        try:
            return CategoryOffer.objects.select_related("category").get(id=offer_id)
        except (CategoryOffer.DoesNotExist, ValueError):
            return None

    @staticmethod
    def get_referral_config():
        config = ReferralOffer.objects.order_by("-created_at").first()
        if not config:
            config = ReferralOffer.objects.create(
                referrer_bonus=100.00,
                new_user_bonus=50.00,
                minimum_order_amount=500.00,
                is_active=True
            )
        return config

