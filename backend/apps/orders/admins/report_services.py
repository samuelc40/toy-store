import calendar
from decimal import Decimal
from apps.orders.admins.report_selectors import SalesReportSelector


class SalesReportService:
    
    @classmethod
    def generate_sales_report(cls, start_date=None, end_date=None, date_range=None, group_by="day"):
        
        start_dt, end_dt, p_start, p_end = SalesReportSelector.parse_and_validate_dates(
            start_date=start_date,
            end_date=end_date,
            date_range=date_range,
        )

        summary = SalesReportSelector.get_sales_summary(start_dt, end_dt)
        breakdown = SalesReportSelector.get_sales_breakdown(start_dt, end_dt, group_by=group_by)

        return {
            "period": {
                "start_date": p_start.strftime("%Y-%m-%d"),
                "end_date": p_end.strftime("%Y-%m-%d"),
                "group_by": group_by,
                "date_range": date_range or "custom",
            },
            "summary": summary,
            "breakdown": breakdown,
        }

    @classmethod
    def get_dashboard_analytics(cls, date_range=None, start_date=None, end_date=None, year=None, month=None, group_by=None):
        
        calc_start = start_date
        calc_end = end_date
        calc_range = date_range

        if year and month:
            num_days = calendar.monthrange(int(year), int(month))[1]
            calc_start = f"{int(year):04d}-{int(month):02d}-01"
            calc_end = f"{int(year):04d}-{int(month):02d}-{num_days:02d}"
            calc_range = "custom"
            if not group_by:
                group_by = "day"
        elif year:
            calc_start = f"{int(year):04d}-01-01"
            calc_end = f"{int(year):04d}-12-31"
            calc_range = "custom"
            if not group_by:
                group_by = "month"

        start_dt, end_dt, p_start, p_end = SalesReportSelector.parse_and_validate_dates(
            start_date=calc_start,
            end_date=calc_end,
            date_range=calc_range or (None if calc_start else "this_month"),
        )

        if not group_by:
            days_diff = (p_end - p_start).days
            if days_diff > 90:
                group_by = "month"
            else:
                group_by = "day"

        summary = SalesReportSelector.get_sales_summary(start_dt, end_dt)
        sales_chart = SalesReportSelector.get_sales_chart_data(
            start_dt=start_dt,
            end_dt=end_dt,
            group_by=group_by,
            parsed_start=p_start,
            parsed_end=p_end,
        )

        top_products = SalesReportSelector.get_top_products(start_dt, end_dt, limit=10)
        top_categories = SalesReportSelector.get_top_categories(start_dt, end_dt, limit=10)
        top_brands = SalesReportSelector.get_top_brands(start_dt, end_dt, limit=10)

        return {
            "period": {
                "start_date": p_start.strftime("%Y-%m-%d"),
                "end_date": p_end.strftime("%Y-%m-%d"),
                "group_by": group_by,
                "date_range": calc_range or "this_month",
            },
            "summary": summary,
            "sales_chart": sales_chart,
            "top_products": top_products,
            "top_categories": top_categories,
            "top_brands": top_brands,
        }

    @classmethod
    def get_top_performers(cls, start_date=None, end_date=None, date_range=None, limit=10):
        
        start_dt, end_dt, p_start, p_end = SalesReportSelector.parse_and_validate_dates(
            start_date=start_date,
            end_date=end_date,
            date_range=date_range,
        )

        return {
            "period": {
                "start_date": p_start.strftime("%Y-%m-%d"),
                "end_date": p_end.strftime("%Y-%m-%d"),
            },
            "top_products": SalesReportSelector.get_top_products(start_dt, end_dt, limit=limit),
            "top_categories": SalesReportSelector.get_top_categories(start_dt, end_dt, limit=limit),
            "top_brands": SalesReportSelector.get_top_brands(start_dt, end_dt, limit=limit),
        }
