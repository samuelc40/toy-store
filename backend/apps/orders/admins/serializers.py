from rest_framework import serializers
from apps.orders.models import Order, OrderItem, OrderReturnRequest, OrderCancellationRequest


class AdminUserSummarySerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    email = serializers.EmailField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    phone = serializers.CharField(read_only=True, allow_null=True)


class AdminOrderItemSerializer(serializers.ModelSerializer):
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


class AdminOrderCancellationRequestSerializer(serializers.ModelSerializer):
    order_number = serializers.SerializerMethodField()
    customer = serializers.SerializerMethodField()
    order_details = serializers.SerializerMethodField()
    item_details = serializers.SerializerMethodField()
    is_item_cancellation = serializers.SerializerMethodField()
    refund_amount_val = serializers.SerializerMethodField()

    class Meta:
        model = OrderCancellationRequest
        fields = [
            "id",
            "reason",
            "description",
            "admin_remark",
            "status",
            "refund_amount",
            "refund_amount_val",
            "reviewed_at",
            "created_at",
            "updated_at",
            "order_number",
            "customer",
            "order_details",
            "item_details",
            "is_item_cancellation",
        ]

    def get_order_number(self, obj):
        return obj.order.order_number if obj.order else ""

    def get_customer(self, obj):
        u = obj.user or (obj.order.user if obj.order else None)
        if u:
            return {
                "id": str(u.id),
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "phone": getattr(u, "phone", "") or getattr(obj.order, "shipping_phone", "") if obj.order else "",
            }
        return None

    def get_is_item_cancellation(self, obj):
        return obj.order_item_id is not None

    def get_item_details(self, obj):
        if not obj.order_item:
            return None
        return AdminOrderItemSerializer(obj.order_item, context=self.context).data

    def get_order_details(self, obj):
        if not obj.order:
            return None
        return {
            "id": str(obj.order.id),
            "order_number": obj.order.order_number,
            "order_status": obj.order.order_status,
            "payment_status": obj.order.payment_status,
            "payment_method": obj.order.payment_method,
            "subtotal": str(obj.order.subtotal),
            "discount_amount": str(obj.order.discount_amount),
            "coupon_discount": str(getattr(obj.order, "coupon_discount", 0)),
            "shipping_fee": str(obj.order.shipping_fee),
            "total_amount": str(obj.order.total_amount),
            "created_at": obj.order.created_at,
            "items": AdminOrderItemSerializer(obj.order.items.all(), many=True, context=self.context).data,
        }

    def get_refund_amount_val(self, obj):
        amt = obj.refund_amount if obj.refund_amount is not None else (obj.order.total_amount if obj.order else 0)
        return str(amt)


class AdminUserSummarySerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    email = serializers.EmailField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    phone = serializers.CharField(read_only=True, allow_null=True)


class AdminOrderItemSerializer(serializers.ModelSerializer):
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


class AdminOrderReturnRequestSerializer(serializers.ModelSerializer):
    order_number = serializers.SerializerMethodField()
    customer = serializers.SerializerMethodField()
    order_details = serializers.SerializerMethodField()
    item_details = serializers.SerializerMethodField()
    is_item_return = serializers.SerializerMethodField()
    refund_amount_val = serializers.SerializerMethodField()

    class Meta:
        model = OrderReturnRequest
        fields = [
            "id",
            "reason",
            "description",
            "admin_remark",
            "status",
            "refund_amount",
            "refund_amount_val",
            "refunded_at",
            "requested_at",
            "updated_at",
            "order_number",
            "customer",
            "order_details",
            "item_details",
            "is_item_return",
        ]

    def get_order_number(self, obj):
        return obj.order.order_number if obj.order else ""

    def get_customer(self, obj):
        u = obj.user or (obj.order.user if obj.order else None)
        if u:
            return {
                "id": str(u.id),
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "phone": getattr(u, "phone", "") or getattr(obj.order, "shipping_phone", "") if obj.order else "",
            }
        return None

    def get_is_item_return(self, obj):
        return obj.order_item_id is not None

    def get_item_details(self, obj):
        if not obj.order_item:
            return None
        return AdminOrderItemSerializer(obj.order_item, context=self.context).data

    def get_order_details(self, obj):
        if not obj.order:
            return None
        return {
            "id": str(obj.order.id),
            "order_number": obj.order.order_number,
            "order_status": obj.order.order_status,
            "payment_status": obj.order.payment_status,
            "payment_method": obj.order.payment_method,
            "subtotal": str(obj.order.subtotal),
            "discount_amount": str(obj.order.discount_amount),
            "coupon_discount": str(getattr(obj.order, "coupon_discount", 0)),
            "shipping_fee": str(obj.order.shipping_fee),
            "total_amount": str(obj.order.total_amount),
            "created_at": obj.order.created_at,
            "items": AdminOrderItemSerializer(obj.order.items.all(), many=True, context=self.context).data,
        }

    def get_refund_amount_val(self, obj):
        amt = obj.refund_amount if obj.refund_amount is not None else (obj.order.total_amount if obj.order else 0)
        return str(amt)


class AdminOrderSerializer(serializers.ModelSerializer):
    customer = serializers.SerializerMethodField()
    items = AdminOrderItemSerializer(many=True, read_only=True)
    return_requests = AdminOrderReturnRequestSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        exclude = ["user", "address"]

    def get_customer(self, obj):
        if obj.user:
            return {
                "id": str(obj.user.id),
                "email": obj.user.email,
                "first_name": obj.user.first_name,
                "last_name": obj.user.last_name,
                "phone": obj.user.phone or obj.shipping_phone or "",
            }
        return None

    def get_items_count(self, obj):
        return sum(item.quantity for item in obj.items.all())


class AdminUpdateOrderStatusSerializer(serializers.Serializer):
    order_status = serializers.ChoiceField(choices=Order.OrderStatus.choices, required=True)


class AdminProcessReturnSerializer(serializers.Serializer):
    admin_remark = serializers.CharField(required=False, allow_blank=True, default="")
