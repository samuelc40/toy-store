from rest_framework import serializers
from apps.coupons.models import Coupon


class ApplyCouponSerializer(serializers.Serializer):
    code = serializers.CharField(required=True, max_length=50)

    def validate_code(self, value):
        clean_code = str(value).strip().upper()
        if not clean_code:
            raise serializers.ValidationError("Coupon code cannot be empty.")
        return clean_code


class CustomerCouponSerializer(serializers.ModelSerializer):
    is_eligible = serializers.BooleanField(default=True, read_only=True)

    class Meta:
        model = Coupon
        fields = [
            "id",
            "code",
            "description",
            "discount_type",
            "discount_value",
            "minimum_order_amount",
            "maximum_discount_amount",
            "start_date",
            "end_date",
            "is_eligible",
        ]
