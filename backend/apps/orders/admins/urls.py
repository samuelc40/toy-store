from django.urls import path
from apps.orders.admins.views import (
    AdminOrderListAPIView,
    AdminOrderDetailAPIView,
    AdminUpdateOrderStatusAPIView,
    AdminReturnRequestListAPIView,
    AdminReturnRequestDetailAPIView,
    AdminApproveReturnAPIView,
    AdminRejectReturnAPIView,
    AdminCancellationRequestListAPIView,
    AdminCancellationRequestDetailAPIView,
    AdminApproveCancellationAPIView,
    AdminRejectCancellationAPIView,
)
from apps.orders.admins.report_views import (
    AdminSalesReportAPIView,
    AdminExportSalesReportPDFAPIView,
    AdminExportSalesReportExcelAPIView,
    AdminDashboardAnalyticsAPIView,
    AdminTopPerformersAPIView,
)

urlpatterns = [
    path("reports/sales/", AdminSalesReportAPIView.as_view(), name="admin_sales_report"),
    path("reports/sales/export/pdf/", AdminExportSalesReportPDFAPIView.as_view(), name="admin_sales_report_export_pdf"),
    path("reports/sales/export/excel/", AdminExportSalesReportExcelAPIView.as_view(), name="admin_sales_report_export_excel"),
    path("reports/dashboard/", AdminDashboardAnalyticsAPIView.as_view(), name="admin_dashboard_analytics"),
    path("reports/top-performers/", AdminTopPerformersAPIView.as_view(), name="admin_top_performers"),
    path("", AdminOrderListAPIView.as_view(), name="admin_order_list"),
    path("returns/", AdminReturnRequestListAPIView.as_view(), name="admin_return_list"),
    path("returns/<uuid:return_id>/", AdminReturnRequestDetailAPIView.as_view(), name="admin_return_detail"),
    path("returns/<uuid:return_id>/approve/", AdminApproveReturnAPIView.as_view(), name="admin_approve_return"),
    path("returns/<uuid:return_id>/reject/", AdminRejectReturnAPIView.as_view(), name="admin_reject_return"),
    path("cancellations/", AdminCancellationRequestListAPIView.as_view(), name="admin_cancellation_list"),
    path("cancellations/<uuid:cancellation_id>/", AdminCancellationRequestDetailAPIView.as_view(), name="admin_cancellation_detail"),
    path("cancellations/<uuid:cancellation_id>/approve/", AdminApproveCancellationAPIView.as_view(), name="admin_approve_cancellation"),
    path("cancellations/<uuid:cancellation_id>/reject/", AdminRejectCancellationAPIView.as_view(), name="admin_reject_cancellation"),
    path("<uuid:order_id>/", AdminOrderDetailAPIView.as_view(), name="admin_order_detail"),
    path("<uuid:order_id>/status/", AdminUpdateOrderStatusAPIView.as_view(), name="admin_update_order_status"),
]
