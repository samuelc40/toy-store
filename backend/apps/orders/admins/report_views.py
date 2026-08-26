from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.accounts.admins.views import IsAdminUser

from apps.orders.admins.report_services import SalesReportService
from apps.orders.admins.export_services import (
    SalesReportPDFGenerator,
    SalesReportExcelGenerator,
)
from apps.orders.admins.report_serializers import (
    SalesReportQuerySerializer,
    DashboardQuerySerializer,
    TopPerformersQuerySerializer,
    SalesReportResponseSerializer,
    TopPerformersResponseSerializer,
    DashboardAnalyticsResponseSerializer,
)


class AdminSalesReportAPIView(APIView):
   
    permission_classes = [IsAdminUser]

    def get(self, request):
        query_serializer = SalesReportQuerySerializer(data=request.query_params)
        query_serializer.is_valid(raise_exception=True)
        query = query_serializer.validated_data

        data = SalesReportService.generate_sales_report(
            start_date=query.get("start_date"),
            end_date=query.get("end_date"),
            date_range=query.get("date_range"),
            group_by=query.get("group_by", "day"),
        )

        response_serializer = SalesReportResponseSerializer(data)
        return Response({
            "success": True,
            "data": response_serializer.data,
        }, status=status.HTTP_200_OK)


class AdminExportSalesReportPDFAPIView(APIView):
    
    permission_classes = [IsAdminUser]

    def get(self, request):
        query_serializer = SalesReportQuerySerializer(data=request.query_params)
        query_serializer.is_valid(raise_exception=True)
        query = query_serializer.validated_data

        data = SalesReportService.generate_sales_report(
            start_date=query.get("start_date"),
            end_date=query.get("end_date"),
            date_range=query.get("date_range"),
            group_by=query.get("group_by", "day"),
        )

        pdf_buffer = SalesReportPDFGenerator.generate(data)
        period = data.get("period", {})
        start = period.get("start_date", "start")
        end = period.get("end_date", "end")
        filename = f"sales-report-{start}-to-{end}.pdf"

        response = HttpResponse(pdf_buffer.getvalue(), content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        response["Access-Control-Expose-Headers"] = "Content-Disposition"
        return response


class AdminExportSalesReportExcelAPIView(APIView):
    
    permission_classes = [IsAdminUser]

    def get(self, request):
        query_serializer = SalesReportQuerySerializer(data=request.query_params)
        query_serializer.is_valid(raise_exception=True)
        query = query_serializer.validated_data

        data = SalesReportService.generate_sales_report(
            start_date=query.get("start_date"),
            end_date=query.get("end_date"),
            date_range=query.get("date_range"),
            group_by=query.get("group_by", "day"),
        )

        excel_buffer = SalesReportExcelGenerator.generate(data)
        period = data.get("period", {})
        start = period.get("start_date", "start")
        end = period.get("end_date", "end")
        filename = f"sales-report-{start}-to-{end}.xlsx"

        response = HttpResponse(
            excel_buffer.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        response["Access-Control-Expose-Headers"] = "Content-Disposition"
        return response


class AdminDashboardAnalyticsAPIView(APIView):
    
    permission_classes = [IsAdminUser]

    def get(self, request):
        query_serializer = DashboardQuerySerializer(data=request.query_params)
        query_serializer.is_valid(raise_exception=True)
        query = query_serializer.validated_data

        data = SalesReportService.get_dashboard_analytics(
            date_range=query.get("date_range"),
            start_date=query.get("start_date"),
            end_date=query.get("end_date"),
            year=query.get("year"),
            month=query.get("month"),
            group_by=query.get("group_by"),
        )
        response_serializer = DashboardAnalyticsResponseSerializer(data)
        return Response({
            "success": True,
            "data": response_serializer.data,
        }, status=status.HTTP_200_OK)


class AdminTopPerformersAPIView(APIView):
    
    permission_classes = [IsAdminUser]

    def get(self, request):
        query_serializer = TopPerformersQuerySerializer(data=request.query_params)
        query_serializer.is_valid(raise_exception=True)
        query = query_serializer.validated_data

        data = SalesReportService.get_top_performers(
            start_date=query.get("start_date"),
            end_date=query.get("end_date"),
            date_range=query.get("date_range"),
            limit=query.get("limit", 10),
        )

        serializer = TopPerformersResponseSerializer(data)
        return Response({
            "success": True,
            "data": serializer.data,
        }, status=status.HTTP_200_OK)
