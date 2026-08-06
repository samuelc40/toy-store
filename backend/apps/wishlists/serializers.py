from rest_framework import serializers

from .models import WishlistItem
from apps.products.customers.serializers import CustomerProductSerializer


class WishlistItemSerializer(serializers.ModelSerializer):

    product = CustomerProductSerializer(
        read_only=True
    )

    class Meta:
        model = WishlistItem
        fields = [
            "id",
            "product",
            "created_at",
        ]