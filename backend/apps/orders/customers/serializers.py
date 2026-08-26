from rest_framework import serializers
from apps.accounts.serializers import AddressSerializer
from apps.cart.customers.serializers import CustomerCartSummarySerializer
from apps.orders.models import Order, OrderItem, OrderReturnRequest, OrderCancellationRequest


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
    order_item_id = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    variant_name = serializers.SerializerMethodField()

    class Meta:
        model = OrderReturnRequest
        fields = [
            "id",
            "order_item_id",
            "product_name",
            "variant_name",
            "reason",
            "description",
            "admin_remark",
            "refund_amount",
            "status",
            "requested_at",
            "updated_at",
        ]

    def get_order_item_id(self, obj):
        return str(obj.order_item_id) if obj.order_item_id else None

    def get_product_name(self, obj):
        if obj.order_item:
            return obj.order_item.product_name
        return None

    def get_variant_name(self, obj):
        if obj.order_item:
            return obj.order_item.variant_name
        return None


class OrderCancellationRequestSerializer(serializers.ModelSerializer):
    order_item_id = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    variant_name = serializers.SerializerMethodField()

    class Meta:
        model = OrderCancellationRequest
        fields = [
            "id",
            "order_item_id",
            "product_name",
            "variant_name",
            "reason",
            "description",
            "admin_remark",
            "refund_amount",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_order_item_id(self, obj):
        return str(obj.order_item_id) if obj.order_item_id else None

    def get_product_name(self, obj):
        if obj.order_item:
            return obj.order_item.product_name
        return None

    def get_variant_name(self, obj):
        if obj.order_item:
            return obj.order_item.variant_name
        return None


class OrderItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    can_return = serializers.SerializerMethodField()
    return_request = serializers.SerializerMethodField()
    can_cancel = serializers.SerializerMethodField()
    cancellation_request = serializers.SerializerMethodField()
    estimated_refund = serializers.SerializerMethodField()

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
            "can_return",
            "return_request",
            "can_cancel",
            "cancellation_request",
            "estimated_refund",
        ]

    def get_image(self, obj):
        try:
            if obj.variant:
                primary_img = obj.variant.images.filter(is_primary=True).first() or obj.variant.images.first()
                if primary_img and primary_img.image:
                    request = self.context.get("request")
                    if request:
                        return request.build_absolute_uri(primary_img.image.url)
                    return primary_img.image.url
        except Exception:
            pass
        return None

    def get_can_return(self, obj):
        if not obj.order or obj.order.order_status != Order.OrderStatus.DELIVERED:
            return False
        if obj.status != OrderItem.ItemStatus.ACTIVE:
            return False
        # Check if active return request exists
        has_active_return = OrderReturnRequest.objects.filter(
            order_item=obj,
            status__in=[
                OrderReturnRequest.ReturnStatus.PENDING,
                OrderReturnRequest.ReturnStatus.APPROVED,
                OrderReturnRequest.ReturnStatus.COMPLETED,
            ],
        ).exists()
        return not has_active_return

    def get_return_request(self, obj):
        req = OrderReturnRequest.objects.filter(order_item=obj).order_by("-requested_at").first()
        if not req:
            return None
        return OrderReturnRequestSerializer(req, context=self.context).data

    def get_can_cancel(self, obj):
        if not obj.order:
            return False
        non_cancellable = [
            Order.OrderStatus.DELIVERED,
            Order.OrderStatus.RETURNED,
            Order.OrderStatus.OUT_FOR_DELIVERY,
            Order.OrderStatus.SHIPPED,
            Order.OrderStatus.CANCELLED,
            Order.OrderStatus.RETURN_REQUESTED,
        ]
        if obj.order.order_status in non_cancellable:
            return False
        if obj.status != OrderItem.ItemStatus.ACTIVE:
            return False
        has_pending_cancel = OrderCancellationRequest.objects.filter(
            order_item=obj,
            status=OrderCancellationRequest.CancellationStatus.PENDING,
        ).exists()
        return not has_pending_cancel

    def get_cancellation_request(self, obj):
        req = OrderCancellationRequest.objects.filter(order_item=obj).order_by("-created_at").first()
        if not req:
            return None
        return OrderCancellationRequestSerializer(req, context=self.context).data

    def get_estimated_refund(self, obj):
        from apps.orders.customers.services import CustomerOrderService
        return str(CustomerOrderService.calculate_item_refund(obj))


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    return_requests = OrderReturnRequestSerializer(many=True, read_only=True)
    cancellation_requests = OrderCancellationRequestSerializer(many=True, read_only=True)
    can_cancel = serializers.SerializerMethodField()
    can_return = serializers.SerializerMethodField()

    class Meta:
        model = Order
        exclude = [
            "user",
            "address",
            "coupon",
            "updated_at",
        ]
        # fields = [
        #     "id",
        #     "order_number",
        #     "shipping_name",
        #     "shipping_phone",
        #     "shipping_address_line1",
        #     "shipping_address_line2",
        #     "shipping_landmark",
        #     "shipping_city",
        #     "shipping_state",
        #     "shipping_postal_code",
        #     "shipping_country",
        #     "shipping_address_type",
        #     "payment_method",
        #     "payment_status",
        #     "order_status",
        #     "subtotal",
        #     "coupon_code",
        #     "coupon_discount",
        #     "discount_amount",
        #     "shipping_fee",
        #     "total_amount",
        #     "cancellation_reason",
        #     "cancelled_at",
        #     "can_cancel",
        #     "can_return",
        #     "items",
        #     "return_requests",
        #     "created_at",
        # ]

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
        try:
            return len(obj.return_requests.all()) == 0
        except Exception:
            return True
