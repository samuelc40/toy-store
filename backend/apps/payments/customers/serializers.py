from rest_framework import serializers
from apps.payments.models import Payment


class CreateGatewayOrderSerializer(serializers.Serializer):
    address_id = serializers.UUIDField(required=True)


class VerifyPaymentSerializer(serializers.Serializer):
    razorpay_order_id = serializers.CharField(required=True, max_length=255)
    razorpay_payment_id = serializers.CharField(required=True, max_length=255)
    razorpay_signature = serializers.CharField(required=True)
    address_id = serializers.UUIDField(required=True)


class RetryPaymentSerializer(serializers.Serializer):
    address_id = serializers.UUIDField(required=True)


class PaymentDetailSerializer(serializers.ModelSerializer):
    order_number = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            "id",
            "gateway",
            "gateway_order_id",
            "gateway_payment_id",
            "amount",
            "currency",
            "status",
            "failure_reason",
            "paid_at",
            "created_at",
            "order_number",
        ]

    def get_order_number(self, obj):
        return obj.order.order_number if obj.order else ""
