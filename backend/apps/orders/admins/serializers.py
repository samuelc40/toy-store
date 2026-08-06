from rest_framework import serializers
from apps.orders.models import Order, OrderItem, OrderReturnRequest


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
        if obj.variant:
            primary_img = obj.variant.images.filter(is_primary=True).first() or obj.variant.images.first()
            if primary_img and primary_img.image:
                request = self.context.get("request")
                if request:
                    return request.build_absolute_uri(primary_img.image.url)
                return primary_img.image.url
        return None


class AdminOrderReturnRequestSerializer(serializers.ModelSerializer):
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


class AdminOrderSerializer(serializers.ModelSerializer):
    customer = serializers.SerializerMethodField()
    items = AdminOrderItemSerializer(many=True, read_only=True)
    return_requests = AdminOrderReturnRequestSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "customer",
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
            "items_count",
            "items",
            "return_requests",
            "created_at",
            "updated_at",
        ]

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
    order_status = serializers.CharField(required=True)
