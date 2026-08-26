import uuid
from django.db import models
from django.conf import settings
from apps.orders.models import Order


class Wallet(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wallet")
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "wallets"

    def __str__(self):
        return self.user.email



class WalletTransaction(models.Model):

    class TransactionType(models.TextChoices):

        CREDIT = "CREDIT", "Credit"
        DEBIT = "DEBIT", "Debit"


    class TransactionReason(models.TextChoices):

        ORDER_CANCELLED = (
            "ORDER_CANCELLED",
            "Order Cancelled"
        )

        RETURN_REFUND = (
            "RETURN_REFUND",
            "Return Refund"
        )

        WALLET_PAYMENT = (
            "WALLET_PAYMENT",
            "Wallet Payment"
        )

        ADMIN_ADJUSTMENT = (
            "ADMIN_ADJUSTMENT",
            "Admin Adjustment"
        )

        CASHBACK = (
            "CASHBACK",
            "Cashback"
        )

        REFERRAL = (
            "REFERRAL",
            "Referral"
        )


    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name="wallet_transactions")
    transaction_type = models.CharField(max_length=20, choices=TransactionType.choices)
    transaction_reason = models.CharField(max_length=30, choices=TransactionReason.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    balance_after = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "wallet_transactions"
        ordering = [
            "-created_at"
        ]

    def __str__(self):
        return (
            f"{self.wallet.user.email}"
            f" - "
            f"{self.transaction_type}"
            f" ₹{self.amount}"
        )