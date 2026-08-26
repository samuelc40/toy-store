from rest_framework import serializers
from apps.wallet.models import Wallet, WalletTransaction


class CustomerWalletTransactionSerializer(serializers.ModelSerializer):
    order_number = serializers.SerializerMethodField()
    transaction_reason_display = serializers.CharField(source="get_transaction_reason_display", read_only=True)
    transaction_type_display = serializers.CharField(source="get_transaction_type_display", read_only=True)

    class Meta:
        model = WalletTransaction
        fields = [
            "id",
            "transaction_type",
            "transaction_type_display",
            "transaction_reason",
            "transaction_reason_display",
            "amount",
            "balance_after",
            "description",
            "created_at",
            "order_number",
        ]

    def get_order_number(self, obj):
        return obj.order.order_number if obj.order else ""


class CustomerWalletSerializer(serializers.ModelSerializer):
    transactions = CustomerWalletTransactionSerializer(many=True, read_only=True)

    class Meta:
        model = Wallet
        fields = [
            "id",
            "balance",
            "updated_at",
            "transactions",
        ]
