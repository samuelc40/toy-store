from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.payments.customers.serializers import (
    CreateGatewayOrderSerializer,
    VerifyPaymentSerializer,
    RetryPaymentSerializer,
    PaymentDetailSerializer,
)
from apps.payments.customers.services import CustomerPaymentService
from apps.payments.customers.selectors import CustomerPaymentSelector


class CreateGatewayOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateGatewayOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = CustomerPaymentService.create_razorpay_order(
            user=request.user,
            address_id=serializer.validated_data["address_id"],
        )

        return Response({
            "success": True,
            "message": "Razorpay order created successfully.",
            "data": data,
        }, status=status.HTTP_200_OK)


class VerifyPaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = CustomerPaymentService.verify_and_complete_payment(
            user=request.user,
            razorpay_order_id=serializer.validated_data["razorpay_order_id"],
            razorpay_payment_id=serializer.validated_data["razorpay_payment_id"],
            razorpay_signature=serializer.validated_data["razorpay_signature"],
            address_id=serializer.validated_data["address_id"],
        )

        return Response({
            "success": True,
            "message": "Payment verified and order placed successfully!",
            "data": result,
        }, status=status.HTTP_200_OK)


class RetryPaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RetryPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = CustomerPaymentService.retry_payment(
            user=request.user,
            address_id=serializer.validated_data["address_id"],
        )

        return Response({
            "success": True,
            "message": "New payment order created for retry.",
            "data": data,
        }, status=status.HTTP_200_OK)


class PaymentDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, payment_id):
        payment = CustomerPaymentSelector.get_payment_by_id(request.user, payment_id)
        if not payment:
            return Response({
                "success": False,
                "message": "Payment record not found.",
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = PaymentDetailSerializer(payment)
        return Response({
            "success": True,
            "data": serializer.data,
        }, status=status.HTTP_200_OK)