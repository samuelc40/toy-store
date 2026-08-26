from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError

from .services import CustomerCartService
from .selectors import CustomerCartSelector
from .serializers import CustomerCartSummarySerializer


class CartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart = CustomerCartService.get_or_create_cart(request.user)
        optimized_cart = CustomerCartSelector.get_cart_for_user(request.user)
        cart_to_serialize = optimized_cart if optimized_cart else cart

        serializer = CustomerCartSummarySerializer(cart_to_serialize, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        variant_id = request.data.get("variant_id")
        quantity = request.data.get("quantity", 1)

        if not variant_id:
            return Response(
                {"success": False, "message": "Variant ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quantity = int(quantity)
        except (ValueError, TypeError):
            return Response(
                {"success": False, "message": "Quantity must be an integer."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            CustomerCartService.add_item_to_cart(request.user, variant_id, quantity)
        except ValidationError as e:
            message = e.messages[0] if hasattr(e, "messages") else str(e)
            return Response(
                {"success": False, "message": message},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Return updated cart
        optimized_cart = CustomerCartSelector.get_cart_for_user(request.user)
        serializer = CustomerCartSummarySerializer(optimized_cart, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CartItemDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        quantity = request.data.get("quantity")
        action = request.data.get("action")

        try:
            CustomerCartService.update_cart_item(
                request.user, item_id, quantity=quantity, action=action
            )
        except ValidationError as e:
            message = e.messages[0] if hasattr(e, "messages") else str(e)
            return Response(
                {"success": False, "message": message},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Return updated cart
        optimized_cart = CustomerCartSelector.get_cart_for_user(request.user)
        serializer = CustomerCartSummarySerializer(optimized_cart, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, item_id):
        try:
            CustomerCartService.remove_cart_item(request.user, item_id)
        except ValidationError as e:
            message = e.messages[0] if hasattr(e, "messages") else str(e)
            return Response(
                {"success": False, "message": message},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Return updated cart
        optimized_cart = CustomerCartSelector.get_cart_for_user(request.user)
        serializer = CustomerCartSummarySerializer(optimized_cart, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CartClearAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        CustomerCartService.clear_cart(request.user)
        # Return empty cart summary
        cart = CustomerCartService.get_or_create_cart(request.user)
        serializer = CustomerCartSummarySerializer(cart, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CartCheckoutValidateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            CustomerCartService.validate_checkout_eligibility(request.user)
            return Response(
                {"success": True, "message": "Cart is eligible for checkout.", "is_checkout_eligible": True},
                status=status.HTTP_200_OK
            )
        except ValidationError as e:
            message = e.messages[0] if hasattr(e, "messages") else str(e)
            return Response(
                {"success": False, "message": message, "is_checkout_eligible": False},
                status=status.HTTP_400_BAD_REQUEST
            )
