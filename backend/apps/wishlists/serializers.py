from rest_framework import serializers

from apps.products.customers.serializers import CustomerProductSerializer

from .models import WishlistItem


class WishlistItemSerializer(serializers.ModelSerializer):

    product = CustomerProductSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = [
            "id",
            "product",
            "created_at",
        ]
