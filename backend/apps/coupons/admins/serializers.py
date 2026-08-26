import re
from django.utils import timezone
from rest_framework import serializers
from apps.coupons.models import Coupon


class CouponSerializer(serializers.ModelSerializer):

    is_expired = serializers.SerializerMethodField()
    remaining_usage = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Coupon
        fields = "__all__"
        read_only_fields = (
            "id",
            "used_count",
            "created_at",
            "updated_at",
        )

        def get_field_names(self, declared_fields, info):
            fields = super().get_field_names(declared_fields, info)
            return fields + [
                "is_expired",
                "remaining_usage",
                "status",
            ]

    def get_is_expired(self, obj):
        return timezone.now() > obj.end_date

    def get_remaining_usage(self, obj):

        if obj.usage_limit is None:
            return None

        return max(
            obj.usage_limit - obj.used_count,
            0
        )

    def get_status(self, obj):

        now = timezone.now()

        if not obj.is_active:
            return "DISABLED"

        if now < obj.start_date:
            return "UPCOMING"

        if now > obj.end_date:
            return "EXPIRED"

        if (
            obj.usage_limit is not None and
            obj.used_count >= obj.usage_limit
        ):
            return "FULLY_USED"

        return "ACTIVE"

    def validate_code(self, value):

        value = value.strip().upper()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Coupon code must contain at least 3 characters."
            )

        if len(value) > 30:
            raise serializers.ValidationError(
                "Coupon code cannot exceed 30 characters."
            )

        if " " in value:
            raise serializers.ValidationError(
                "Coupon code cannot contain spaces."
            )


        if not re.match(r"^[A-Z0-9_]+$", value):
            raise serializers.ValidationError(
                "Coupon code may only contain letters, numbers and underscores."
            )

        return value

    def validate_discount_value(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Discount value must be greater than zero."
            )

        return value

    def validate_minimum_order_amount(self, value):

        if value < 0:
            raise serializers.ValidationError(
                "Minimum order amount cannot be negative."
            )

        return value

    def validate_maximum_discount_amount(self, value):

        if value is not None and value <= 0:
            raise serializers.ValidationError(
                "Maximum discount amount must be greater than zero."
            )

        return value

    def validate_usage_limit(self, value):

        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Usage limit cannot be negative."
            )

        return value

    def validate_per_user_limit(self, value):

        if value < 1:
            raise serializers.ValidationError(
                "Per user limit must be at least 1."
            )

        return value

    def validate(self, attrs):

        discount_type = attrs.get(
            "discount_type",
            getattr(
                self.instance,
                "discount_type",
                None
            )
        )

        discount_value = attrs.get(
            "discount_value",
            getattr(
                self.instance,
                "discount_value",
                None
            )
        )

        maximum_discount_amount = attrs.get(
            "maximum_discount_amount",
            getattr(
                self.instance,
                "maximum_discount_amount",
                None
            )
        )

        start_date = attrs.get(
            "start_date",
            getattr(
                self.instance,
                "start_date",
                None
            )
        )

        end_date = attrs.get(
            "end_date",
            getattr(
                self.instance,
                "end_date",
                None
            )
        )

        if discount_type == Coupon.DiscountType.PERCENTAGE:
            if discount_value is not None:
                if discount_value > 100:
                    raise serializers.ValidationError({
                        "discount_value": "Percentage discount cannot exceed 100."
                    })
                if discount_value <= 0:
                    raise serializers.ValidationError({
                        "discount_value": "Percentage discount must be greater than zero."
                    })

        if (
            discount_type == Coupon.DiscountType.FIXED
        ):

            attrs["maximum_discount_amount"] = None

        if (
            start_date
            and end_date
            and end_date <= start_date
        ):

            raise serializers.ValidationError({
                "end_date":
                "End date must be later than start date."
            })

        return attrs