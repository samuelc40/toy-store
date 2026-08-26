from decimal import Decimal

from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.wallet.models import Wallet, WalletTransaction
from .selectors import WalletSelector


class WalletService:

    @staticmethod
    @transaction.atomic
    def get_or_create_wallet(user):

        wallet = Wallet.objects.select_for_update().filter(
            user=user
        ).first()

        if wallet:
            return wallet

        return Wallet.objects.create(
            user=user
        )


    @staticmethod
    def has_sufficient_balance( wallet, amount):
        return wallet.balance >= amount

    @staticmethod
    @transaction.atomic
    def credit( *, user, amount, reason, order=None, description="", reference_id=None,):

        amount = Decimal(amount)

        if amount <= 0:
            raise ValidationError({"amount": "Amount must be greater than zero."})

        wallet = WalletService.get_or_create_wallet(user)
        wallet.balance += amount
        wallet.save(update_fields=["balance", "updated_at"])

        if reference_id and reference_id not in description:
            description = f"{description} (Ref: {reference_id})".strip()

        WalletTransaction.objects.create(
            wallet=wallet,
            order=order,
            transaction_type=WalletTransaction.TransactionType.CREDIT,
            transaction_reason=reason,
            amount=amount,
            balance_after=wallet.balance,
            description=description,
        )

        return wallet


    @staticmethod
    @transaction.atomic
    def debit(*, user, amount, reason, order=None, description="", reference_id=None,):

        amount = Decimal(amount)

        if amount <= 0:
            raise ValidationError({"amount": "Amount must be greater than zero."})

        wallet = WalletService.get_or_create_wallet(user)

        if wallet.balance < amount:

            raise ValidationError(
                {
                    "wallet":
                    "Insufficient wallet balance."
                }
            )

        wallet.balance -= amount

        wallet.save(update_fields=["balance", "updated_at"])

        if reference_id and reference_id not in description:
            description = f"{description} (Ref: {reference_id})".strip()

        WalletTransaction.objects.create(
            wallet=wallet,
            order=order,
            transaction_type=WalletTransaction.TransactionType.DEBIT,
            transaction_reason=reason,
            amount=amount,
            balance_after=wallet.balance,
            description=description,
        )

        return wallet


    @staticmethod
    def refund(*, user, order, amount, reason, description="",):

        return WalletService.credit(
            user=user,
            amount=amount,
            order=order,
            reason=reason,
            description=description,
            reference_id=order.order_number,
        )