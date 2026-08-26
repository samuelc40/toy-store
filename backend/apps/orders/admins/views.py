from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.accounts.admins.views import IsAdminUser

from apps.orders.admins.selectors import AdminOrderSelector, AdminReturnRequestSelector, AdminCancellationRequestSelector
from apps.orders.admins.services import AdminOrderService, AdminReturnRequestService, AdminCancellationRequestService
from apps.orders.customers.pagination import OrderPagination
from apps.orders.admins.serializers import (
    AdminOrderSerializer,
    AdminUpdateOrderStatusSerializer,
    AdminOrderReturnRequestSerializer,
    AdminOrderCancellationRequestSerializer,
    AdminProcessReturnSerializer,
)


class AdminCancellationRequestListAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        search = request.query_params.get("search", None)
        status_filter = request.query_params.get("status", None)

        queryset = AdminCancellationRequestSelector.get_cancellation_requests(
            search=search,
            status=status_filter,
        )

        paginator = OrderPagination()
        page_queryset = paginator.paginate_queryset(queryset, request)
        serializer = AdminOrderCancellationRequestSerializer(page_queryset, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)


class AdminCancellationRequestDetailAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, cancellation_id):
        canc_req = AdminCancellationRequestSelector.get_cancellation_request_by_id(cancellation_id)
        if not canc_req:
            return Response({
                "success": False,
                "message": "Cancellation request not found.",
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminOrderCancellationRequestSerializer(canc_req, context={"request": request})
        return Response({
            "success": True,
            "data": serializer.data,
        }, status=status.HTTP_200_OK)


class AdminApproveCancellationAPIView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, cancellation_id):
        serializer = AdminProcessReturnSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        admin_remark = serializer.validated_data.get("admin_remark", "")
        canc_req = AdminCancellationRequestService.approve_cancellation(
            cancellation_id=cancellation_id,
            admin_remark=admin_remark,
            admin_user=request.user,
        )

        return Response({
            "success": True,
            "message": "Cancellation request approved. Item/Order cancelled, stock restored, and refund processed.",
            "data": AdminOrderCancellationRequestSerializer(canc_req, context={"request": request}).data,
        }, status=status.HTTP_200_OK)


class AdminRejectCancellationAPIView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, cancellation_id):
        serializer = AdminProcessReturnSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        admin_remark = serializer.validated_data.get("admin_remark", "")
        canc_req = AdminCancellationRequestService.reject_cancellation(
            cancellation_id=cancellation_id,
            admin_remark=admin_remark,
            admin_user=request.user,
        )

        return Response({
            "success": True,
            "message": "Cancellation request rejected.",
            "data": AdminOrderCancellationRequestSerializer(canc_req, context={"request": request}).data,
        }, status=status.HTTP_200_OK)


class AdminOrderListAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        search = request.query_params.get("search", None)
        sort = request.query_params.get("sort", "newest")
        order_status = request.query_params.get("order_status", None)
        payment_method = request.query_params.get("payment_method", None)
        payment_status = request.query_params.get("payment_status", None)
        date_range = request.query_params.get("date_range", None)
        start_date = request.query_params.get("start_date", None)
        end_date = request.query_params.get("end_date", None)

        queryset = AdminOrderSelector.get_orders(
            search=search,
            sort=sort,
            order_status=order_status,
            payment_method=payment_method,
            payment_status=payment_status,
            date_range=date_range,
            start_date=start_date,
            end_date=end_date,
        )

        paginator = OrderPagination()
        page_queryset = paginator.paginate_queryset(queryset, request)
        serializer = AdminOrderSerializer(page_queryset, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)


class AdminOrderDetailAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, order_id):
        order = AdminOrderSelector.get_order_by_id(order_id)
        if not order:
            return Response({
                "success": False,
                "message": "Order not found.",
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminOrderSerializer(order, context={"request": request})
        return Response({
            "success": True,
            "data": serializer.data,
        }, status=status.HTTP_200_OK)


class AdminUpdateOrderStatusAPIView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, order_id):
        serializer = AdminUpdateOrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data["order_status"]
        order = AdminOrderService.update_order_status(
            order_id=order_id,
            new_status=new_status,
            admin_user=request.user,
        )

        return Response({
            "success": True,
            "message": f"Order status updated to '{order.get_order_status_display()}'.",
            "data": AdminOrderSerializer(order, context={"request": request}).data,
        }, status=status.HTTP_200_OK)


class AdminReturnRequestListAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        search = request.query_params.get("search", None)
        status_filter = request.query_params.get("status", None)

        queryset = AdminReturnRequestSelector.get_return_requests(
            search=search,
            status=status_filter,
        )

        paginator = OrderPagination()
        page_queryset = paginator.paginate_queryset(queryset, request)
        serializer = AdminOrderReturnRequestSerializer(page_queryset, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)


class AdminReturnRequestDetailAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, return_id):
        return_req = AdminReturnRequestSelector.get_return_request_by_id(return_id)
        if not return_req:
            return Response({
                "success": False,
                "message": "Return request not found.",
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminOrderReturnRequestSerializer(return_req, context={"request": request})
        return Response({
            "success": True,
            "data": serializer.data,
        }, status=status.HTTP_200_OK)


class AdminApproveReturnAPIView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, return_id):
        serializer = AdminProcessReturnSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        admin_remark = serializer.validated_data.get("admin_remark", "")
        return_req = AdminReturnRequestService.approve_return(
            return_id=return_id,
            admin_remark=admin_remark,
        )

        return Response({
            "success": True,
            "message": "Return request approved successfully. Stock restored and refund credited to user wallet.",
            "data": AdminOrderReturnRequestSerializer(return_req, context={"request": request}).data,
        }, status=status.HTTP_200_OK)


class AdminRejectReturnAPIView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, return_id):
        serializer = AdminProcessReturnSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        admin_remark = serializer.validated_data.get("admin_remark", "")
        return_req = AdminReturnRequestService.reject_return(
            return_id=return_id,
            admin_remark=admin_remark,
        )

        return Response({
            "success": True,
            "message": "Return request rejected.",
            "data": AdminOrderReturnRequestSerializer(return_req, context={"request": request}).data,
        }, status=status.HTTP_200_OK)
