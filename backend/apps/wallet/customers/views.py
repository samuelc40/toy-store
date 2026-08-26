from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.wallet.models import WalletTransaction
from apps.wallet.customers.selectors import WalletSelector
from apps.wallet.customers.services import WalletService
from apps.wallet.customers.serializers import CustomerWalletSerializer, CustomerWalletTransactionSerializer
from apps.wallet.customers.pagination import WalletTransactionPagination


class CustomerWalletDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wallet = WalletSelector.get_wallet_with_transactions(request.user)
        if not wallet:
            wallet = WalletService.get_or_create_wallet(request.user)
            wallet = WalletSelector.get_wallet_with_transactions(request.user) or wallet

        serializer = CustomerWalletSerializer(wallet, context={"request": request})
        return Response({
            "success": True,
            "data": serializer.data,
        }, status=status.HTTP_200_OK)


class CustomerWalletTransactionsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wallet = WalletSelector.get_wallet(request.user)
        if not wallet:
            wallet = WalletService.get_or_create_wallet(request.user)

        queryset = WalletTransaction.objects.filter(wallet=wallet).order_by("-created_at")
        paginator = WalletTransactionPagination()
        page_queryset = paginator.paginate_queryset(queryset, request)
        serializer = CustomerWalletTransactionSerializer(page_queryset, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)
