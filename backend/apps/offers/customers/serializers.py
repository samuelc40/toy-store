from rest_framework import serializers
from apps.offers.models import ProductOffer, CategoryOffer, ReferralOffer
from apps.products.customers.serializers import CustomerProductSerializer


class CustomerProductOfferSerializer(serializers.ModelSerializer):
    product = CustomerProductSerializer(read_only=True)

    class Meta:
        model = ProductOffer
        fields = [
            "id",
            "product",
            "discount_type",
            "discount_value",
            "start_date",
            "end_date",
            "is_active",
        ]


class CustomerCategoryOfferSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_id = serializers.CharField(source="category.id", read_only=True)
    category_image = serializers.SerializerMethodField()

    class Meta:
        model = CategoryOffer
        fields = [
            "id",
            "category_id",
            "category_name",
            "category_image",
            "discount_type",
            "discount_value",
            "start_date",
            "end_date",
            "is_active",
        ]

    def get_category_image(self, obj):
        if not obj.category or not obj.category.image:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.category.image.url)
        return obj.category.image.url


class CustomerReferralOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralOffer
        fields = [
            "id",
            "referrer_bonus",
            "new_user_bonus",
            "minimum_order_amount",
            "expiry",
            "is_active",
        ]
