from django.db.models import Prefetch, Q
from django.utils import timezone
from datetime import timedelta, datetime
from apps.orders.models import Order, OrderItem, OrderReturnRequest, OrderCancellationRequest


class AdminCancellationRequestSelector:

    @classmethod
    def get_cancellation_requests(cls, search=None, status=None):
        queryset = OrderCancellationRequest.objects.select_related("order", "user", "order_item")

        if search and str(search).strip():
            q_str = str(search).strip()
            queryset = queryset.filter(
                Q(order__order_number__icontains=q_str) |
                Q(user__email__icontains=q_str) |
                Q(user__first_name__icontains=q_str) |
                Q(user__last_name__icontains=q_str) |
                Q(reason__icontains=q_str) |
                Q(id__icontains=q_str)
            ).distinct()

        if status and str(status).upper() != "ALL":
            queryset = queryset.filter(status=str(status).upper())

        items_prefetch = Prefetch(
            "order__items",
            queryset=OrderItem.objects.select_related("product", "variant")
        )

        return queryset.prefetch_related(items_prefetch).order_by("-created_at")

    @classmethod
    def get_cancellation_request_by_id(cls, cancellation_id):
        try:
            items_prefetch = Prefetch(
                "order__items",
                queryset=OrderItem.objects.select_related("product", "variant")
            )
            return (
                OrderCancellationRequest.objects.select_related("order", "user", "order_item")
                .prefetch_related(items_prefetch)
                .filter(id=cancellation_id)
                .first()
            )
        except Exception:
            return None


class AdminOrderSelector:

    SORT_MAPPING = {
        "newest": "-created_at",
        "oldest": "created_at",
        "highest_total": "-total_amount",
        "lowest_total": "total_amount",
        "name_asc": "shipping_name",
        "name_desc": "-shipping_name",
    }

    @classmethod
    def get_orders(
        cls,
        search=None,
        sort="newest",
        order_status=None,
        payment_method=None,
        payment_status=None,
        date_range=None,
        start_date=None,
        end_date=None,
    ):
        """
        Query order listing for admin with whitelisted sorting, search, and multi-field filtering.
        """
        queryset = Order.objects.select_related("user", "address")

        # 1. Search Query
        if search and str(search).strip():
            query_str = str(search).strip()
            queryset = queryset.filter(
                Q(order_number__icontains=query_str) |
                Q(shipping_name__icontains=query_str) |
                Q(user__email__icontains=query_str) |
                Q(user__first_name__icontains=query_str) |
                Q(user__last_name__icontains=query_str) |
                Q(shipping_phone__icontains=query_str) |
                Q(items__product_name__icontains=query_str) |
                Q(items__variant_name__icontains=query_str)
            ).distinct()

        # 2. Order Status Filter
        if order_status and str(order_status).upper() != "ALL":
            queryset = queryset.filter(order_status=str(order_status).upper())

        # 3. Payment Method Filter
        if payment_method and str(payment_method).upper() != "ALL":
            queryset = queryset.filter(payment_method=str(payment_method).upper())

        # 4. Payment Status Filter
        if payment_status and str(payment_status).upper() != "ALL":
            queryset = queryset.filter(payment_status=str(payment_status).upper())

        # 5. Date Range Filter
        now = timezone.now()
        if date_range:
            range_key = str(date_range).lower()
            if range_key == "today":
                queryset = queryset.filter(created_at__date=now.date())
            elif range_key == "this_week":
                start_of_week = now.date() - timedelta(days=now.weekday())
                queryset = queryset.filter(created_at__date__gte=start_of_week)
            elif range_key == "this_month":
                start_of_month = now.date().replace(day=1)
                queryset = queryset.filter(created_at__date__gte=start_of_month)
            elif range_key == "custom":
                if start_date:
                    try:
                        parsed_start = datetime.strptime(start_date, "%Y-%m-%d").date()
                        queryset = queryset.filter(created_at__date__gte=parsed_start)
                    except ValueError:
                        pass
                if end_date:
                    try:
                        parsed_end = datetime.strptime(end_date, "%Y-%m-%d").date()
                        queryset = queryset.filter(created_at__date__lte=parsed_end)
                    except ValueError:
                        pass

        # 6. Whitelisted Sorting
        sort_field = cls.SORT_MAPPING.get(str(sort).lower(), "-created_at")
        queryset = queryset.order_by(sort_field)

        items_prefetch = Prefetch(
            "items",
            queryset=OrderItem.objects.select_related("product", "variant")
        )
        returns_prefetch = Prefetch(
            "return_requests",
            queryset=OrderReturnRequest.objects.order_by("-requested_at")
        )

        return queryset.prefetch_related(items_prefetch, returns_prefetch)

    @classmethod
    def get_order_by_id(cls, order_id):
        """
        Retrieve single order by ID for admin with all pre-fetched relations.
        """
        try:
            items_prefetch = Prefetch(
                "items",
                queryset=OrderItem.objects.select_related("product", "variant")
            )
            returns_prefetch = Prefetch(
                "return_requests",
                queryset=OrderReturnRequest.objects.order_by("-requested_at")
            )

            return (
                Order.objects.select_related("user", "address")
                .prefetch_related(items_prefetch, returns_prefetch)
                .filter(id=order_id)
                .first()
            )
        except Exception:
            return None


class AdminReturnRequestSelector:

    @classmethod
    def get_return_requests(cls, search=None, status=None):
        queryset = OrderReturnRequest.objects.select_related("order", "user")

        if search and str(search).strip():
            q_str = str(search).strip()
            queryset = queryset.filter(
                Q(order__order_number__icontains=q_str) |
                Q(user__email__icontains=q_str) |
                Q(user__first_name__icontains=q_str) |
                Q(user__last_name__icontains=q_str) |
                Q(reason__icontains=q_str) |
                Q(id__icontains=q_str)
            ).distinct()

        if status and str(status).upper() != "ALL":
            queryset = queryset.filter(status=str(status).upper())

        items_prefetch = Prefetch(
            "order__items",
            queryset=OrderItem.objects.select_related("product", "variant")
        )

        return queryset.prefetch_related(items_prefetch).order_by("-requested_at")

    @classmethod
    def get_return_request_by_id(cls, return_id):
        try:
            items_prefetch = Prefetch(
                "order__items",
                queryset=OrderItem.objects.select_related("product", "variant")
            )
            return (
                OrderReturnRequest.objects.select_related("order", "user")
                .prefetch_related(items_prefetch)
                .filter(id=return_id)
                .first()
            )
        except Exception:
            return None
