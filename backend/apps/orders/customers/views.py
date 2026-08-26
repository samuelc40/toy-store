from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.orders.customers.selectors import CustomerOrderSelector
from apps.orders.customers.services import CustomerCheckoutService, CustomerOrderService
from apps.orders.customers.pagination import OrderPagination
from apps.orders.customers.serializers import (
    CheckoutResponseSerializer,
    PlaceOrderRequestSerializer,
    OrderSerializer,
    CancelOrderSerializer,
    ReturnOrderRequestSerializer,
    OrderReturnRequestSerializer,
)


class CheckoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        checkout_context = CustomerOrderSelector.get_checkout_data(request.user)
        serializer = CheckoutResponseSerializer(checkout_context, context={"request": request})
        return Response({
            "success": True,
            "data": serializer.data,
        }, status=status.HTTP_200_OK)


class PlaceOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PlaceOrderRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        address_id = serializer.validated_data["address_id"]
        payment_method = serializer.validated_data.get("payment_method", "COD")

        order = CustomerCheckoutService.place_order(
            user=request.user,
            address_id=address_id,
            payment_method=payment_method,
        )

        return Response({
            "success": True,
            "message": "Order placed successfully!",
            "order_id": str(order.id),
            "order_number": order.order_number,
            "order": OrderSerializer(order, context={"request": request}).data,
        }, status=status.HTTP_201_CREATED)


class OrderListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        
        search = request.query_params.get("search", None)
        status_filter = request.query_params.get("status", None)

        queryset = CustomerOrderSelector.get_orders_for_user(
            user=request.user,
            search=search,
            status_filter=status_filter,
        )

        paginator = OrderPagination()
        page_queryset = paginator.paginate_queryset(queryset, request)
        serializer = OrderSerializer(page_queryset, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)


class OrderDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        order = CustomerOrderSelector.get_order_by_id(request.user, order_id)
        if not order:
            return Response({
                "success": False,
                "message": "Order not found or unauthorized.",
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderSerializer(order, context={"request": request})
        return Response({
            "success": True,
            "data": serializer.data,
        }, status=status.HTTP_200_OK)


class CancelOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        serializer = CancelOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reason = serializer.validated_data.get("reason", "Cancelled by customer")
        cancellation_req = CustomerOrderService.request_order_cancellation(
            user=request.user,
            order_id=order_id,
            reason=reason,
        )

        return Response({
            "success": True,
            "message": "Cancellation request submitted successfully. Our team will review it shortly.",
            "data": OrderCancellationRequestSerializer(cancellation_req).data,
        }, status=status.HTTP_201_CREATED)


class CancelOrderItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, item_id):
        serializer = CancelOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reason = serializer.validated_data.get("reason", "Cancelled by customer")
        cancellation_req = CustomerOrderService.request_item_cancellation(
            user=request.user,
            item_id=item_id,
            reason=reason,
        )

        return Response({
            "success": True,
            "message": "Item cancellation request submitted successfully. Our team will review it shortly.",
            "data": OrderCancellationRequestSerializer(cancellation_req).data,
        }, status=status.HTTP_201_CREATED)


class RequestOrderCancellationAPIView(CancelOrderAPIView):
    pass


class RequestOrderItemCancellationAPIView(CancelOrderItemAPIView):
    pass


class ReturnOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        
        serializer = ReturnOrderRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reason = serializer.validated_data["reason"]
        description = serializer.validated_data.get("description", "")

        return_req = CustomerOrderService.request_return(
            user=request.user,
            order_id=order_id,
            reason=reason,
            description=description,
        )

        return Response({
            "success": True,
            "message": "Return request submitted successfully. Our support team will process it shortly.",
            "data": OrderReturnRequestSerializer(return_req).data,
        }, status=status.HTTP_201_CREATED)


class ReturnOrderItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, item_id):
        serializer = ReturnOrderRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reason = serializer.validated_data["reason"]
        description = serializer.validated_data.get("description", "")

        return_req = CustomerOrderService.request_item_return(
            user=request.user,
            item_id=item_id,
            reason=reason,
            description=description,
        )

        return Response({
            "success": True,
            "message": "Item return request submitted successfully.",
            "data": OrderReturnRequestSerializer(return_req).data,
        }, status=status.HTTP_201_CREATED)


class DownloadInvoiceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        
        return CustomerOrderService.generate_invoice_pdf(request.user, order_id)
