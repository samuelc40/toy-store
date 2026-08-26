from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from apps.offers.models import ProductOffer, CategoryOffer, ReferralOffer
from apps.products.models import Product
from apps.products.customers.serializers import CustomerProductSerializer
from apps.offers.customers.serializers import (
    CustomerProductOfferSerializer,
    CustomerCategoryOfferSerializer,
    CustomerReferralOfferSerializer,
)
from apps.offers.services import PricingService


class CustomerOffersListAPIView(APIView):
    permission_classes = []

    def get(self, request):
        now = timezone.now()

        # Active Product Offers
        prod_offers = ProductOffer.objects.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now,
            product__is_active=True,
            product__blocked=False
        ).select_related("product", "product__category")

        # Active Category Offers
        cat_offers = CategoryOffer.objects.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now,
        ).select_related("category")

        # Active Referral Offers
        ref_offer = ReferralOffer.objects.filter(is_active=True).first()

        # Products with active offers
        discounted_products = Product.objects.filter(
            is_active=True,
            blocked=False
        ).select_related("category").prefetch_related("variants")

        discounted_list = []
        for p in discounted_products:
            p_price = PricingService.calculate_product_price(p)
            if p_price["has_offer"]:
                discounted_list.append(p)

        prod_serializer = CustomerProductOfferSerializer(prod_offers, many=True, context={"request": request})
        cat_serializer = CustomerCategoryOfferSerializer(cat_offers, many=True, context={"request": request})
        ref_serializer = CustomerReferralOfferSerializer(ref_offer, context={"request": request}) if ref_offer else None
        disc_products_serializer = CustomerProductSerializer(discounted_list, many=True, context={"request": request})

        return Response({
            "success": True,
            "message": "Customer active offers fetched successfully.",
            "data": {
                "product_offers": prod_serializer.data,
                "category_offers": cat_serializer.data,
                "referral_offer": ref_serializer.data if ref_serializer else None,
                "discounted_products": disc_products_serializer.data,
            }
        }, status=status.HTTP_200_OK)
