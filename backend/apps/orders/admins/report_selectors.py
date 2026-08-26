import zoneinfo
from datetime import datetime, time
from decimal import Decimal
from django.db.models import (
    Sum, Count, Case, When, F, Q, DecimalField, Value, CharField
)
from django.db.models.functions import Coalesce, TruncDate, TruncWeek, TruncMonth, TruncYear
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.orders.models import Order, OrderItem, OrderReturnRequest, OrderCancellationRequest

IST_TZ = zoneinfo.ZoneInfo("Asia/Kolkata")


class SalesReportSelector:

    @classmethod
    def parse_and_validate_dates(cls, start_date=None, end_date=None, date_range=None):
        
        now = timezone.now().astimezone(IST_TZ)
        today = now.date()

        if date_range:
            range_key = str(date_range).lower().strip()
            if range_key == "today":
                parsed_start = today
                parsed_end = today
            elif range_key == "this_week" or range_key == "weekly":
                parsed_start = today - timezone.timedelta(days=today.weekday())
                parsed_end = today
            elif range_key == "this_month" or range_key == "monthly":
                parsed_start = today.replace(day=1)
                parsed_end = today
            elif range_key == "this_year" or range_key == "yearly":
                parsed_start = today.replace(month=1, day=1)
                parsed_end = today
            elif range_key == "custom":
                parsed_start = cls._parse_date_str(start_date, "start_date")
                parsed_end = cls._parse_date_str(end_date, "end_date")
            else:
                raise ValidationError({"date_range": f"Invalid date range preset '{date_range}'."})
        else:
            if start_date or end_date:
                parsed_start = cls._parse_date_str(start_date, "start_date") if start_date else today.replace(day=1)
                parsed_end = cls._parse_date_str(end_date, "end_date") if end_date else today
            else:
                # Default to current month
                parsed_start = today.replace(day=1)
                parsed_end = today

        if parsed_start > parsed_end:
            raise ValidationError({"start_date": "start date cannot be after end date."})

        if (parsed_end - parsed_start).days > 366:
            raise ValidationError({"date_range": "Requested date range exceeds maximum allowed limit of 366 days."})

        start_dt = timezone.make_aware(datetime.combine(parsed_start, time.min), IST_TZ)
        end_dt = timezone.make_aware(datetime.combine(parsed_end, time.max), IST_TZ)

        return start_dt, end_dt, parsed_start, parsed_end

    @classmethod
    def _parse_date_str(cls, date_str, field_name):
        if isinstance(date_str, datetime):
            return date_str.date()
        if hasattr(date_str, "year") and hasattr(date_str, "month") and hasattr(date_str, "day"):
            return date_str
        try:
            return datetime.strptime(str(date_str).strip(), "%Y-%m-%d").date()
        except (ValueError, TypeError):
            raise ValidationError({field_name: f"Invalid date format '{date_str}'. Expected YYYY-MM-DD."})

    @classmethod
    def get_valid_sales_orders_query(cls, start_dt=None, end_dt=None):
       
        valid_sale_condition = (
            (
                Q(payment_method__in=[Order.PaymentMethod.RAZORPAY, Order.PaymentMethod.WALLET])
                & Q(payment_status=Order.PaymentStatus.PAID)
                & ~Q(order_status=Order.OrderStatus.CANCELLED)
            )
            | (
                Q(payment_method=Order.PaymentMethod.COD)
                & Q(order_status__in=[
                    Order.OrderStatus.CONFIRMED,
                    Order.OrderStatus.PACKED,
                    Order.OrderStatus.SHIPPED,
                    Order.OrderStatus.OUT_FOR_DELIVERY,
                    Order.OrderStatus.DELIVERED,
                    Order.OrderStatus.RETURN_REQUESTED,
                    Order.OrderStatus.RETURNED,
                ])
                & ~Q(payment_status=Order.PaymentStatus.FAILED)
            )
        )

        queryset = Order.objects.filter(valid_sale_condition)
        if start_dt and end_dt:
            queryset = queryset.filter(created_at__range=(start_dt, end_dt))

        return queryset

    @classmethod
    def get_sales_summary(cls, start_dt=None, end_dt=None):
        
        orders_qs = cls.get_valid_sales_orders_query(start_dt, end_dt)

        order_agg = orders_qs.aggregate(
            order_count=Count("id"),
            shipping=Coalesce(Sum("shipping_fee"), Decimal("0.00")),
            coupon_discount=Coalesce(Sum("coupon_discount"), Decimal("0.00")),
        )

        items_qs = OrderItem.objects.filter(order__in=orders_qs)
        item_agg = items_qs.aggregate(
            gross_sales=Coalesce(
                Sum(F("original_price") * F("quantity"), output_field=DecimalField()),
                Decimal("0.00"),
            ),
            offer_discount=Coalesce(
                Sum((F("original_price") - F("price")) * F("quantity"), output_field=DecimalField()),
                Decimal("0.00"),
            ),
            units_sold=Coalesce(
                Sum(
                    Case(
                        When(
                            status__in=[
                                OrderItem.ItemStatus.ACTIVE,
                                OrderItem.ItemStatus.RETURN_REQUESTED,
                            ],
                            then=F("quantity"),
                        ),
                        default=Value(0),
                    )
                ),
                0,
            ),
        )

        # 3. Returns and Cancellations calculation for valid orders
        returned_agg = OrderReturnRequest.objects.filter(
            order__in=orders_qs,
            status__in=[OrderReturnRequest.ReturnStatus.APPROVED, OrderReturnRequest.ReturnStatus.COMPLETED],
        ).aggregate(
            returned_amount=Coalesce(Sum("refund_amount"), Decimal("0.00"))
        )

        cancelled_agg = OrderCancellationRequest.objects.filter(
            order__in=orders_qs,
            status=OrderCancellationRequest.CancellationStatus.APPROVED,
        ).aggregate(
            cancelled_amount=Coalesce(Sum("refund_amount"), Decimal("0.00"))
        )

        gross_sales = item_agg["gross_sales"].quantize(Decimal("0.01"))
        offer_discount = item_agg["offer_discount"].quantize(Decimal("0.01"))
        coupon_discount = order_agg["coupon_discount"].quantize(Decimal("0.01"))
        total_discount = (offer_discount + coupon_discount).quantize(Decimal("0.01"))
        shipping = order_agg["shipping"].quantize(Decimal("0.01"))
        tax = Decimal("0.00")
        cancelled_amount = cancelled_agg["cancelled_amount"].quantize(Decimal("0.01"))
        returned_amount = returned_agg["returned_amount"].quantize(Decimal("0.01"))
        refunded_amount = (cancelled_amount + returned_amount).quantize(Decimal("0.01"))

        product_subtotal = max(Decimal("0.00"), gross_sales - offer_discount)
        net_sales = max(
            Decimal("0.00"),
            product_subtotal - coupon_discount + shipping - refunded_amount,
        ).quantize(Decimal("0.01"))

        return {
            "order_count": order_agg["order_count"],
            "units_sold": item_agg["units_sold"],
            "gross_sales": gross_sales,
            "offer_discount": offer_discount,
            "coupon_discount": coupon_discount,
            "total_discount": total_discount,
            "shipping": shipping,
            "tax": tax,
            "cancelled_amount": cancelled_amount,
            "returned_amount": returned_amount,
            "refunded_amount": refunded_amount,
            "net_sales": net_sales,
        }

    @classmethod
    def get_sales_breakdown(cls, start_dt, end_dt, group_by="day"):
        
        trunc_map = {
            "day": TruncDate("created_at", tzinfo=IST_TZ),
            "week": TruncWeek("created_at", tzinfo=IST_TZ),
            "month": TruncMonth("created_at", tzinfo=IST_TZ),
            "year": TruncYear("created_at", tzinfo=IST_TZ),
        }

        trunc_func = trunc_map.get(str(group_by).lower(), trunc_map["day"])
        orders_qs = cls.get_valid_sales_orders_query(start_dt, end_dt)

        grouped = (
            orders_qs.annotate(period=trunc_func)
            .values("period")
            .annotate(
                order_count=Count("id"),
                shipping=Coalesce(Sum("shipping_fee"), Decimal("0.00")),
                coupon_discount=Coalesce(Sum("coupon_discount"), Decimal("0.00")),
            )
            .order_by("period")
        )

        breakdown = []
        for item in grouped:
            p_val = item["period"]
            date_str = p_val.strftime("%Y-%m-%d") if hasattr(p_val, "strftime") else str(p_val)

            period_orders = orders_qs.filter(created_at__date=p_val) if hasattr(p_val, "year") else orders_qs
            items_qs = OrderItem.objects.filter(order__in=period_orders)

            item_agg = items_qs.aggregate(
                gross_sales=Coalesce(
                    Sum(F("original_price") * F("quantity"), output_field=DecimalField()),
                    Decimal("0.00"),
                ),
                offer_discount=Coalesce(
                    Sum((F("original_price") - F("price")) * F("quantity"), output_field=DecimalField()),
                    Decimal("0.00"),
                ),
                units_sold=Coalesce(
                    Sum(
                        Case(
                            When(
                                status__in=[
                                    OrderItem.ItemStatus.ACTIVE,
                                    OrderItem.ItemStatus.RETURN_REQUESTED,
                                ],
                                then=F("quantity"),
                            ),
                            default=Value(0),
                        )
                    ),
                    0,
                ),
            )

            g_sales = item_agg["gross_sales"].quantize(Decimal("0.01"))
            o_disc = item_agg["offer_discount"].quantize(Decimal("0.01"))
            c_disc = item["coupon_discount"].quantize(Decimal("0.01"))
            t_disc = (o_disc + c_disc).quantize(Decimal("0.01"))
            ship = item["shipping"].quantize(Decimal("0.01"))
            subtotal = max(Decimal("0.00"), g_sales - o_disc)

            ret_amt = OrderReturnRequest.objects.filter(
                order__in=period_orders,
                status__in=[OrderReturnRequest.ReturnStatus.APPROVED, OrderReturnRequest.ReturnStatus.COMPLETED],
            ).aggregate(t=Coalesce(Sum("refund_amount"), Decimal("0.00")))["t"].quantize(Decimal("0.01"))

            canc_amt = OrderCancellationRequest.objects.filter(
                order__in=period_orders,
                status=OrderCancellationRequest.CancellationStatus.APPROVED,
            ).aggregate(t=Coalesce(Sum("refund_amount"), Decimal("0.00")))["t"].quantize(Decimal("0.01"))

            n_sales = max(Decimal("0.00"), subtotal - c_disc + ship - (ret_amt + canc_amt)).quantize(Decimal("0.01"))

            breakdown.append({
                "date": date_str,
                "order_count": item["order_count"],
                "units_sold": item_agg["units_sold"],
                "gross_sales": g_sales,
                "offer_discount": o_disc,
                "coupon_discount": c_disc,
                "total_discount": t_disc,
                "shipping": ship,
                "cancelled_amount": canc_amt,
                "returned_amount": ret_amt,
                "net_sales": n_sales,
            })

        return breakdown

    @classmethod
    def get_sales_chart_data(cls, start_dt, end_dt, group_by="day", parsed_start=None, parsed_end=None):
        
        breakdown_list = cls.get_sales_breakdown(start_dt, end_dt, group_by=group_by)
        breakdown_map = {item["date"]: item for item in breakdown_list}

        labels = []
        sales_list = []
        orders_list = []

        p_start = parsed_start if parsed_start else start_dt.date()
        p_end = parsed_end if parsed_end else end_dt.date()

        if group_by == "month":
            curr = p_start.replace(day=1)
            end_month = p_end.replace(day=1)
            while curr <= end_month:
                month_key = f"{curr.strftime('%Y-%m')}-01"
                month_label = curr.strftime("%b %Y")
                row = breakdown_map.get(month_key) or breakdown_map.get(curr.strftime("%Y-%m"))

                labels.append(month_label)
                if row:
                    sales_list.append(str(row["net_sales"]))
                    orders_list.append(row["order_count"])
                else:
                    sales_list.append("0.00")
                    orders_list.append(0)

                if curr.month == 12:
                    curr = curr.replace(year=curr.year + 1, month=1)
                else:
                    curr = curr.replace(month=curr.month + 1)

        elif group_by == "year":
            curr_year = p_start.year
            end_year = p_end.year
            while curr_year <= end_year:
                year_key = f"{curr_year}-01-01"
                row = breakdown_map.get(year_key) or breakdown_map.get(str(curr_year))

                labels.append(str(curr_year))
                if row:
                    sales_list.append(str(row["net_sales"]))
                    orders_list.append(row["order_count"])
                else:
                    sales_list.append("0.00")
                    orders_list.append(0)
                curr_year += 1

        else:
            curr = p_start
            while curr <= p_end:
                date_key = curr.strftime("%Y-%m-%d")
                day_label = curr.strftime("%d %b")
                row = breakdown_map.get(date_key)

                labels.append(day_label)
                if row:
                    sales_list.append(str(row["net_sales"]))
                    orders_list.append(row["order_count"])
                else:
                    sales_list.append("0.00")
                    orders_list.append(0)

                curr += timezone.timedelta(days=1)

        return {
            "period": group_by,
            "labels": labels,
            "sales": sales_list,
            "orders": orders_list,
        }

    @classmethod
    def get_top_products(cls, start_dt=None, end_dt=None, limit=10):
       
        valid_orders = cls.get_valid_sales_orders_query(start_dt, end_dt)

        top_items = (
            OrderItem.objects.filter(
                order__in=valid_orders,
                status__in=[OrderItem.ItemStatus.ACTIVE, OrderItem.ItemStatus.RETURN_REQUESTED],
            )
            .values("product_id", "product_name")
            .annotate(
                units_sold=Sum("quantity"),
                revenue=Sum("line_total"),
            )
            .order_by("-units_sold", "-revenue")[:limit]
        )

        results = []
        for idx, row in enumerate(top_items, start=1):
            results.append({
                "rank": idx,
                "product_id": str(row["product_id"]) if row["product_id"] else None,
                "product_name": row["product_name"] or "Unknown Product",
                "units_sold": row["units_sold"] or 0,
                "revenue": (row["revenue"] or Decimal("0.00")).quantize(Decimal("0.01")),
            })
        return results

    @classmethod
    def get_top_categories(cls, start_dt=None, end_dt=None, limit=10):
       
        valid_orders = cls.get_valid_sales_orders_query(start_dt, end_dt)

        top_cats = (
            OrderItem.objects.filter(
                order__in=valid_orders,
                status__in=[OrderItem.ItemStatus.ACTIVE, OrderItem.ItemStatus.RETURN_REQUESTED],
            )
            .values(
                category_id=F("product__category__id"),
                category_name=F("product__category__name"),
            )
            .annotate(
                units_sold=Sum("quantity"),
                revenue=Sum("line_total"),
            )
            .order_by("-units_sold", "-revenue")[:limit]
        )

        results = []
        for idx, row in enumerate(top_cats, start=1):
            results.append({
                "rank": idx,
                "category_id": str(row["category_id"]) if row["category_id"] else None,
                "category_name": row["category_name"] or "Uncategorized",
                "units_sold": row["units_sold"] or 0,
                "revenue": (row["revenue"] or Decimal("0.00")).quantize(Decimal("0.01")),
            })
        return results

    @classmethod
    def get_top_brands(cls, start_dt=None, end_dt=None, limit=10):
       
        valid_orders = cls.get_valid_sales_orders_query(start_dt, end_dt)

        top_brands = (
            OrderItem.objects.filter(
                order__in=valid_orders,
                status__in=[OrderItem.ItemStatus.ACTIVE, OrderItem.ItemStatus.RETURN_REQUESTED],
            )
            .values(brand=F("product__brand"))
            .annotate(
                units_sold=Sum("quantity"),
                revenue=Sum("line_total"),
            )
            .order_by("-units_sold", "-revenue")[:limit]
        )

        results = []
        for idx, row in enumerate(top_brands, start=1):
            brand_name = row["brand"].strip() if (row["brand"] and str(row["brand"]).strip()) else "Generic / Unbranded"
            results.append({
                "rank": idx,
                "brand_name": brand_name,
                "units_sold": row["units_sold"] or 0,
                "revenue": (row["revenue"] or Decimal("0.00")).quantize(Decimal("0.01")),
            })
        return results
