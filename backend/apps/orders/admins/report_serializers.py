from rest_framework import serializers


class SalesReportQuerySerializer(serializers.Serializer):
    date_range = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    start_date = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    end_date = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    group_by = serializers.ChoiceField(
        choices=["day", "week", "month", "year"],
        default="day",
        required=False,
    )


class DashboardQuerySerializer(serializers.Serializer):
    date_range = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    year = serializers.IntegerField(required=False, min_value=2000, max_value=2100, allow_null=True)
    month = serializers.IntegerField(required=False, min_value=1, max_value=12, allow_null=True)
    start_date = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    end_date = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    group_by = serializers.ChoiceField(
        choices=["day", "week", "month", "year"],
        required=False,
        allow_null=True,
    )


class TopPerformersQuerySerializer(serializers.Serializer):
    date_range = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    start_date = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    end_date = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    limit = serializers.IntegerField(default=10, min_value=1, max_value=100, required=False)


class PeriodSerializer(serializers.Serializer):
    start_date = serializers.CharField()
    end_date = serializers.CharField()
    group_by = serializers.CharField(required=False)
    date_range = serializers.CharField(required=False)


class SalesSummarySerializer(serializers.Serializer):
    order_count = serializers.IntegerField()
    units_sold = serializers.IntegerField()
    gross_sales = serializers.DecimalField(max_digits=12, decimal_places=2)
    offer_discount = serializers.DecimalField(max_digits=12, decimal_places=2)
    coupon_discount = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_discount = serializers.DecimalField(max_digits=12, decimal_places=2)
    shipping = serializers.DecimalField(max_digits=12, decimal_places=2)
    tax = serializers.DecimalField(max_digits=12, decimal_places=2)
    cancelled_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    returned_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    refunded_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    net_sales = serializers.DecimalField(max_digits=12, decimal_places=2)


class SalesBreakdownItemSerializer(serializers.Serializer):
    date = serializers.CharField()
    order_count = serializers.IntegerField()
    units_sold = serializers.IntegerField()
    gross_sales = serializers.DecimalField(max_digits=12, decimal_places=2)
    offer_discount = serializers.DecimalField(max_digits=12, decimal_places=2)
    coupon_discount = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_discount = serializers.DecimalField(max_digits=12, decimal_places=2)
    shipping = serializers.DecimalField(max_digits=12, decimal_places=2)
    cancelled_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    returned_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    net_sales = serializers.DecimalField(max_digits=12, decimal_places=2)


class SalesReportResponseSerializer(serializers.Serializer):
    period = PeriodSerializer()
    summary = SalesSummarySerializer()
    breakdown = serializers.ListField(child=SalesBreakdownItemSerializer())


class TopProductSerializer(serializers.Serializer):
    rank = serializers.IntegerField()
    product_id = serializers.CharField(allow_null=True)
    product_name = serializers.CharField()
    units_sold = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)


class TopCategorySerializer(serializers.Serializer):
    rank = serializers.IntegerField()
    category_id = serializers.CharField(allow_null=True)
    category_name = serializers.CharField()
    units_sold = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)


class TopBrandSerializer(serializers.Serializer):
    rank = serializers.IntegerField()
    brand_name = serializers.CharField()
    units_sold = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)


class TopPerformersResponseSerializer(serializers.Serializer):
    period = PeriodSerializer()
    top_products = serializers.ListField(child=TopProductSerializer())
    top_categories = serializers.ListField(child=TopCategorySerializer())
    top_brands = serializers.ListField(child=TopBrandSerializer())


class SalesChartSerializer(serializers.Serializer):
    period = serializers.CharField()
    labels = serializers.ListField(child=serializers.CharField())
    sales = serializers.ListField(child=serializers.CharField())
    orders = serializers.ListField(child=serializers.IntegerField())


class DashboardAnalyticsResponseSerializer(serializers.Serializer):
    period = PeriodSerializer()
    summary = SalesSummarySerializer()
    sales_chart = SalesChartSerializer()
    top_products = serializers.ListField(child=TopProductSerializer())
    top_categories = serializers.ListField(child=TopCategorySerializer())
    top_brands = serializers.ListField(child=TopBrandSerializer())
