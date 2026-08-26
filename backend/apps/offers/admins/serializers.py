from rest_framework import serializers
from django.utils import timezone
from apps.products.models import Product, Category
from apps.offers.models import ProductOffer, CategoryOffer, ReferralOffer, DiscountType


class AdminProductSummarySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = ["id", "name", "brand", "category_name", "is_active", "blocked"]


class AdminCategorySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "is_active"]


class AdminProductOfferSerializer(serializers.ModelSerializer):
    product = AdminProductSummarySerializer(read_only=True)
    status = serializers.SerializerMethodField()
    discount_type_display = serializers.CharField(source="get_discount_type_display", read_only=True)

    class Meta:
        model = ProductOffer
        fields = [
            "id",
            "product",
            "discount_type",
            "discount_type_display",
            "discount_value",
            "start_date",
            "end_date",
            "is_active",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_status(self, obj):
        now = timezone.now()
        if not obj.is_active:
            return "INACTIVE"
        if obj.end_date < now:
            return "EXPIRED"
        if obj.start_date > now:
            return "UPCOMING"
        return "ACTIVE"


class AdminCreateUpdateProductOfferSerializer(serializers.ModelSerializer):
    product_id = serializers.UUIDField(required=True)
    discount_type = serializers.ChoiceField(choices=DiscountType.choices)
    discount_value = serializers.DecimalField(max_digits=10, decimal_places=2)
    start_date = serializers.DateTimeField(required=True)
    end_date = serializers.DateTimeField(required=True)
    is_active = serializers.BooleanField(default=True)

    class Meta:
        model = ProductOffer
        fields = [
            "product_id",
            "discount_type",
            "discount_value",
            "start_date",
            "end_date",
            "is_active",
        ]


class AdminCategoryOfferSerializer(serializers.ModelSerializer):
    category = AdminCategorySummarySerializer(read_only=True)
    status = serializers.SerializerMethodField()
    discount_type_display = serializers.CharField(source="get_discount_type_display", read_only=True)

    class Meta:
        model = CategoryOffer
        fields = [
            "id",
            "category",
            "discount_type",
            "discount_type_display",
            "discount_value",
            "start_date",
            "end_date",
            "is_active",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_status(self, obj):
        now = timezone.now()
        if not obj.is_active:
            return "INACTIVE"
        if obj.end_date < now:
            return "EXPIRED"
        if obj.start_date > now:
            return "UPCOMING"
        return "ACTIVE"


class AdminCreateUpdateCategoryOfferSerializer(serializers.ModelSerializer):
    category_id = serializers.UUIDField(required=True)
    discount_type = serializers.ChoiceField(choices=DiscountType.choices)
    discount_value = serializers.DecimalField(max_digits=10, decimal_places=2)
    start_date = serializers.DateTimeField(required=True)
    end_date = serializers.DateTimeField(required=True)
    is_active = serializers.BooleanField(default=True)

    class Meta:
        model = CategoryOffer
        fields = [
            "category_id",
            "discount_type",
            "discount_value",
            "start_date",
            "end_date",
            "is_active",
        ]


class AdminReferralOfferConfigSerializer(serializers.ModelSerializer):
    referrer_bonus = serializers.DecimalField(max_digits=10, decimal_places=2)
    new_user_bonus = serializers.DecimalField(max_digits=10, decimal_places=2)
    minimum_order_amount = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = serializers.BooleanField(default=True)

    class Meta:
        model = ReferralOffer
        fields = [
            "id",
            "referrer_bonus",
            "new_user_bonus",
            "minimum_order_amount",
            "is_active",
            "updated_at",
        ]

