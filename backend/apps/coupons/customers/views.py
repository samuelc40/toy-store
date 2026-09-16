from decimal import Decimal

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cart.customers.services import CustomerCartService
from apps.coupons.customers.selectors import CustomerCouponSelector
from apps.coupons.customers.serializers import (
    ApplyCouponSerializer,
    CustomerCouponSerializer,
)
from apps.coupons.customers.services import CustomerCouponService
from apps.offers.services import PricingService


class ApplyCouponAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ApplyCouponSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data["code"]
        result = CustomerCouponService.apply_coupon(request.user, code)

        return Response(
            {
                "success": True,
                "message": result["message"],
                "data": result,
            },
            status=status.HTTP_200_OK,
        )


class RemoveCouponAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        result = CustomerCouponService.remove_coupon(request.user)

        return Response(
            {
                "success": True,
                "message": result["message"],
                "data": result,
            },
            status=status.HTTP_200_OK,
        )


class AvailableCouponsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart = CustomerCartService.get_or_create_cart(request.user)
        items = cart.items.all()
        subtotal = sum(
            Decimal(
                str(PricingService.calculate_variant_price(item.variant)["offer_price"])
            )
            * item.quantity
            for item in items
            if item.variant
        )

        available_coupons = CustomerCouponSelector.get_available_coupons(
            request.user, subtotal
        )
        serializer = CustomerCouponSerializer(available_coupons, many=True)

        return Response(
            {
                "success": True,
                "message": "Available coupons fetched successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
