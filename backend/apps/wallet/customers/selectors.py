from django.db.models import Prefetch

from apps.wallet.models import Wallet, WalletTransaction


class WalletSelector:

    @staticmethod
    def get_wallet(user):
        return (Wallet.objects.select_related("user").filter(user=user).first())

    @staticmethod
    def get_wallet_with_transactions(user):
        return (
            Wallet.objects
            .select_related("user")
            .prefetch_related(
                Prefetch(
                    "transactions",
                    queryset=WalletTransaction.objects.order_by("-created_at")
                )
            )
            .filter(user=user).first())

    @staticmethod
    def get_transaction(transaction_id):
        return (
            WalletTransaction.objects
            .select_related(
                "wallet",
                "wallet__user",
                "order"
            )
            .filter(id=transaction_id)
            .first()
        )