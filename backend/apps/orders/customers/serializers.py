from rest_framework import serializers
from apps.accounts.serializers import AddressSerializer
from apps.cart.customers.serializers import CustomerCartSummarySerializer
from apps.orders.models import Order, OrderItem, OrderReturnRequest


class PlaceOrderRequestSerializer(serializers.Serializer):
    address_id = serializers.UUIDField(required=True)
    payment_method = serializers.CharField(required=False, default="COD")


class CheckoutResponseSerializer(serializers.Serializer):
    addresses = AddressSerializer(many=True, read_only=True)
    selected_address_id = serializers.CharField(allow_null=True, read_only=True)
    cart = CustomerCartSummarySerializer(read_only=True)


class CancelOrderSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500)


class ReturnOrderRequestSerializer(serializers.Serializer):
    reason = serializers.CharField(required=True, max_length=100)
    description = serializers.CharField(required=False, allow_blank=True)


class OrderReturnRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderReturnRequest
        fields = [
            "id",
            "reason",
            "description",
            "status",
            "requested_at",
            "updated_at",
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_name",
            "variant_name",
            "sku",
            "price",
            "quantity",
            "line_total",
            "status",
            "cancellation_reason",
            "cancelled_at",
            "image",
        ]

    def get_image(self, obj):
        if obj.variant:
            primary_img = obj.variant.images.filter(is_primary=True).first() or obj.variant.images.first()
            if primary_img and primary_img.image:
                request = self.context.get("request")
                if request:
                    return request.build_absolute_uri(primary_img.image.url)
                return primary_img.image.url
        return None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    return_requests = OrderReturnRequestSerializer(many=True, read_only=True)
    can_cancel = serializers.SerializerMethodField()
    can_return = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "shipping_name",
            "shipping_phone",
            "shipping_address_line1",
            "shipping_address_line2",
            "shipping_landmark",
            "shipping_city",
            "shipping_state",
            "shipping_postal_code",
            "shipping_country",
            "shipping_address_type",
            "payment_method",
            "payment_status",
            "order_status",
            "subtotal",
            "discount_amount",
            "shipping_fee",
            "total_amount",
            "cancellation_reason",
            "cancelled_at",
            "can_cancel",
            "can_return",
            "items",
            "return_requests",
            "created_at",
        ]

    def get_can_cancel(self, obj):
        non_cancellable = [
            Order.OrderStatus.DELIVERED,
            Order.OrderStatus.RETURNED,
            Order.OrderStatus.CANCELLED,
            Order.OrderStatus.RETURN_REQUESTED,
        ]
        return obj.order_status not in non_cancellable

    def get_can_return(self, obj):
        if obj.order_status != Order.OrderStatus.DELIVERED:
            return False
        # Cannot return if a request was already submitted
        return not obj.return_requests.exists()
