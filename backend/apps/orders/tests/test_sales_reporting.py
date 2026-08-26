from decimal import Decimal
from datetime import date, timedelta
from django.test import TestCase, override_settings
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.products.models import Category, Product, ProductVariant
from apps.orders.models import Order, OrderItem, OrderReturnRequest, OrderCancellationRequest
from apps.coupons.models import Coupon
from apps.orders.admins.report_selectors import SalesReportSelector, IST_TZ
from apps.orders.admins.report_services import SalesReportService

User = get_user_model()


class SalesReportingTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

        # Admin user
        self.admin_user = User.objects.create_superuser(
            email="admin_report@toy.com",
            password="AdminPassword123!",
            first_name="Admin",
            last_name="User",
        )

        # Customer user
        self.customer = User.objects.create_user(
            email="customer_report@toy.com",
            password="CustomerPassword123!",
            first_name="Customer",
            last_name="One",
        )

        # Category & Products
        self.category_action = Category.objects.create(name="Action Figures")
        self.category_puzzles = Category.objects.create(name="Puzzles & Games")

        self.product_hero = Product.objects.create(
            name="Superhero Action Figure",
            category=self.category_action,
            brand="Marvelous Toys",
        )
        self.variant_hero = ProductVariant.objects.create(
            product=self.product_hero,
            variant_name="Red Edition",
            sku="HERO-RED-001",
            price=Decimal("1000.00"),
            stock_quantity=50,
        )

        self.product_puzzle = Product.objects.create(
            name="Wooden 3D Puzzle",
            category=self.category_puzzles,
            brand="Brainiac Kids",
        )
        self.variant_puzzle = ProductVariant.objects.create(
            product=self.product_puzzle,
            variant_name="Standard",
            sku="PUZZLE-WOOD-001",
            price=Decimal("500.00"),
            stock_quantity=30,
        )

        # Coupon
        self.coupon = Coupon.objects.create(
            code="SAVE100",
            discount_type=Coupon.DiscountType.FIXED,
            discount_value=Decimal("100.00"),
            minimum_order_amount=Decimal("500.00"),
            start_date=timezone.now() - timedelta(days=10),
            end_date=timezone.now() + timedelta(days=10),
        )

    # 1. Empty date range (no orders exist)
    def test_empty_date_range(self):
        summary = SalesReportSelector.get_sales_summary()
        self.assertEqual(summary["order_count"], 0)
        self.assertEqual(summary["net_sales"], Decimal("0.00"))
        self.assertEqual(summary["units_sold"], 0)

    # 2. Single-day & valid order test
    def test_single_day_report_valid_order(self):
        order = Order.objects.create(
            order_number="ORD-TEST-001",
            user=self.customer,
            shipping_name="John Doe",
            shipping_address_line1="123 Street",
            shipping_city="City",
            shipping_state="State",
            shipping_postal_code="123456",
            payment_method=Order.PaymentMethod.RAZORPAY,
            payment_status=Order.PaymentStatus.PAID,
            order_status=Order.OrderStatus.CONFIRMED,
            subtotal=Decimal("1000.00"),
            coupon_discount=Decimal("0.00"),
            shipping_fee=Decimal("0.00"),
            total_amount=Decimal("1000.00"),
        )
        OrderItem.objects.create(
            order=order,
            product=self.product_hero,
            variant=self.variant_hero,
            product_name=self.product_hero.name,
            variant_name=self.variant_hero.variant_name,
            price=Decimal("1000.00"),
            original_price=Decimal("1200.00"),
            offer_discount=Decimal("200.00"),
            quantity=1,
            line_total=Decimal("1000.00"),
            status=OrderItem.ItemStatus.ACTIVE,
        )

        today_str = timezone.now().astimezone(IST_TZ).strftime("%Y-%m-%d")
        report = SalesReportService.generate_sales_report(start_date=today_str, end_date=today_str)

        self.assertEqual(report["summary"]["order_count"], 1)
        self.assertEqual(report["summary"]["gross_sales"], Decimal("1200.00"))
        self.assertEqual(report["summary"]["offer_discount"], Decimal("200.00"))
        self.assertEqual(report["summary"]["net_sales"], Decimal("1000.00"))

    # 3. Multi-day report
    def test_multi_day_report(self):
        now = timezone.now()
        start = (now - timedelta(days=2)).astimezone(IST_TZ).strftime("%Y-%m-%d")
        end = now.astimezone(IST_TZ).strftime("%Y-%m-%d")

        report = SalesReportService.generate_sales_report(start_date=start, end_date=end, group_by="day")
        self.assertIn("breakdown", report)
        self.assertIsInstance(report["breakdown"], list)

    # 4 & 5. Monthly and Yearly aggregation
    def test_monthly_and_yearly_grouping(self):
        today_str = timezone.now().astimezone(IST_TZ).strftime("%Y-%m-%d")
        monthly_report = SalesReportService.generate_sales_report(start_date=today_str, end_date=today_str, group_by="month")
        yearly_report = SalesReportService.generate_sales_report(start_date=today_str, end_date=today_str, group_by="year")

        self.assertEqual(monthly_report["period"]["group_by"], "month")
        self.assertEqual(yearly_report["period"]["group_by"], "year")

    # 6 & 16. COD valid order test
    def test_cod_valid_order(self):
        order = Order.objects.create(
            order_number="ORD-COD-001",
            user=self.customer,
            shipping_name="Jane Doe",
            shipping_address_line1="123 Street",
            shipping_city="City",
            shipping_state="State",
            shipping_postal_code="123456",
            payment_method=Order.PaymentMethod.COD,
            payment_status=Order.PaymentStatus.PENDING,
            order_status=Order.OrderStatus.CONFIRMED,
            subtotal=Decimal("500.00"),
            coupon_discount=Decimal("0.00"),
            shipping_fee=Decimal("1.00"),
            total_amount=Decimal("501.00"),
        )
        OrderItem.objects.create(
            order=order,
            product=self.product_puzzle,
            variant=self.variant_puzzle,
            product_name=self.product_puzzle.name,
            variant_name=self.variant_puzzle.variant_name,
            price=Decimal("500.00"),
            original_price=Decimal("500.00"),
            quantity=1,
            line_total=Decimal("500.00"),
            status=OrderItem.ItemStatus.ACTIVE,
        )

        today_str = timezone.now().astimezone(IST_TZ).strftime("%Y-%m-%d")
        report = SalesReportService.generate_sales_report(start_date=today_str, end_date=today_str)
        self.assertEqual(report["summary"]["order_count"], 1)
        self.assertEqual(report["summary"]["net_sales"], Decimal("501.00"))

    # 7. Fully cancelled order test
    def test_cancelled_order_excluded_from_sales(self):
        order = Order.objects.create(
            order_number="ORD-CANC-001",
            user=self.customer,
            shipping_name="John Doe",
            shipping_address_line1="123 Street",
            shipping_city="City",
            shipping_state="State",
            shipping_postal_code="123456",
            payment_method=Order.PaymentMethod.RAZORPAY,
            payment_status=Order.PaymentStatus.PAID,
            order_status=Order.OrderStatus.CANCELLED,
            subtotal=Decimal("0.00"),
            coupon_discount=Decimal("0.00"),
            shipping_fee=Decimal("0.00"),
            total_amount=Decimal("0.00"),
        )
        OrderItem.objects.create(
            order=order,
            product=self.product_hero,
            variant=self.variant_hero,
            product_name=self.product_hero.name,
            variant_name=self.variant_hero.variant_name,
            price=Decimal("1000.00"),
            original_price=Decimal("1000.00"),
            quantity=1,
            line_total=Decimal("1000.00"),
            status=OrderItem.ItemStatus.CANCELLED,
        )

        today_str = timezone.now().astimezone(IST_TZ).strftime("%Y-%m-%d")
        report = SalesReportService.generate_sales_report(start_date=today_str, end_date=today_str)
        self.assertEqual(report["summary"]["order_count"], 0)
        self.assertEqual(report["summary"]["net_sales"], Decimal("0.00"))

    # 8. Partially cancelled order test
    def test_partially_cancelled_order(self):
        order = Order.objects.create(
            order_number="ORD-PART-CANC-001",
            user=self.customer,
            shipping_name="John Doe",
            shipping_address_line1="123 Street",
            shipping_city="City",
            shipping_state="State",
            shipping_postal_code="123456",
            payment_method=Order.PaymentMethod.RAZORPAY,
            payment_status=Order.PaymentStatus.PAID,
            order_status=Order.OrderStatus.CONFIRMED,
            subtotal=Decimal("500.00"),
            coupon_discount=Decimal("0.00"),
            shipping_fee=Decimal("1.00"),
            total_amount=Decimal("501.00"),
        )
        item1 = OrderItem.objects.create(
            order=order,
            product=self.product_hero,
            variant=self.variant_hero,
            product_name=self.product_hero.name,
            variant_name=self.variant_hero.variant_name,
            price=Decimal("1000.00"),
            original_price=Decimal("1000.00"),
            quantity=1,
            line_total=Decimal("1000.00"),
            status=OrderItem.ItemStatus.CANCELLED,
        )
        item2 = OrderItem.objects.create(
            order=order,
            product=self.product_puzzle,
            variant=self.variant_puzzle,
            product_name=self.product_puzzle.name,
            variant_name=self.variant_puzzle.variant_name,
            price=Decimal("500.00"),
            original_price=Decimal("500.00"),
            quantity=1,
            line_total=Decimal("500.00"),
            status=OrderItem.ItemStatus.ACTIVE,
        )

        OrderCancellationRequest.objects.create(
            order=order,
            order_item=item1,
            user=self.customer,
            reason="Changed mind",
            refund_amount=Decimal("1000.00"),
            status=OrderCancellationRequest.CancellationStatus.APPROVED,
        )

        today_str = timezone.now().astimezone(IST_TZ).strftime("%Y-%m-%d")
        report = SalesReportService.generate_sales_report(start_date=today_str, end_date=today_str)
        self.assertEqual(report["summary"]["order_count"], 1)
        self.assertEqual(report["summary"]["units_sold"], 1)
        self.assertEqual(report["summary"]["net_sales"], Decimal("501.00"))

    # 9 & 10. Returned & partially returned order test
    def test_returned_order(self):
        order = Order.objects.create(
            order_number="ORD-RET-001",
            user=self.customer,
            shipping_name="John Doe",
            shipping_address_line1="123 Street",
            shipping_city="City",
            shipping_state="State",
            shipping_postal_code="123456",
            payment_method=Order.PaymentMethod.RAZORPAY,
            payment_status=Order.PaymentStatus.PAID,
            order_status=Order.OrderStatus.DELIVERED,
            subtotal=Decimal("1000.00"),
            coupon_discount=Decimal("0.00"),
            shipping_fee=Decimal("0.00"),
            total_amount=Decimal("1000.00"),
        )
        item = OrderItem.objects.create(
            order=order,
            product=self.product_hero,
            variant=self.variant_hero,
            product_name=self.product_hero.name,
            variant_name=self.variant_hero.variant_name,
            price=Decimal("1000.00"),
            original_price=Decimal("1000.00"),
            quantity=1,
            line_total=Decimal("1000.00"),
            status=OrderItem.ItemStatus.RETURNED,
        )

        OrderReturnRequest.objects.create(
            order=order,
            order_item=item,
            user=self.customer,
            reason="Defective",
            refund_amount=Decimal("1000.00"),
            status=OrderReturnRequest.ReturnStatus.APPROVED,
        )

        today_str = timezone.now().astimezone(IST_TZ).strftime("%Y-%m-%d")
        report = SalesReportService.generate_sales_report(start_date=today_str, end_date=today_str)
        self.assertEqual(report["summary"]["returned_amount"], Decimal("1000.00"))
        self.assertEqual(report["summary"]["net_sales"], Decimal("0.00"))

    # 11 & 12 & 13. Coupon and offer discount calculations
    def test_coupon_and_offer_discounts(self):
        order = Order.objects.create(
            order_number="ORD-DISC-001",
            user=self.customer,
            shipping_name="John Doe",
            shipping_address_line1="123 Street",
            shipping_city="City",
            shipping_state="State",
            shipping_postal_code="123456",
            payment_method=Order.PaymentMethod.WALLET,
            payment_status=Order.PaymentStatus.PAID,
            order_status=Order.OrderStatus.CONFIRMED,
            subtotal=Decimal("900.00"),
            coupon=self.coupon,
            coupon_code=self.coupon.code,
            coupon_discount=Decimal("100.00"),
            shipping_fee=Decimal("0.00"),
            total_amount=Decimal("800.00"),
        )
        OrderItem.objects.create(
            order=order,
            product=self.product_hero,
            variant=self.variant_hero,
            product_name=self.product_hero.name,
            variant_name=self.variant_hero.variant_name,
            price=Decimal("900.00"),
            original_price=Decimal("1000.00"),
            offer_discount=Decimal("100.00"),
            quantity=1,
            line_total=Decimal("900.00"),
            status=OrderItem.ItemStatus.ACTIVE,
        )

        today_str = timezone.now().astimezone(IST_TZ).strftime("%Y-%m-%d")
        report = SalesReportService.generate_sales_report(start_date=today_str, end_date=today_str)
        self.assertEqual(report["summary"]["gross_sales"], Decimal("1000.00"))
        self.assertEqual(report["summary"]["offer_discount"], Decimal("100.00"))
        self.assertEqual(report["summary"]["coupon_discount"], Decimal("100.00"))
        self.assertEqual(report["summary"]["total_discount"], Decimal("200.00"))
        self.assertEqual(report["summary"]["net_sales"], Decimal("800.00"))

    # 18. Decimal calculations precision
    def test_decimal_precision(self):
        summary = SalesReportSelector.get_sales_summary()
        for key in ["gross_sales", "offer_discount", "coupon_discount", "total_discount", "shipping", "tax", "cancelled_amount", "returned_amount", "refunded_amount", "net_sales"]:
            self.assertIsInstance(summary[key], Decimal)

    # 19. Invalid date range validation
    def test_invalid_date_range(self):
        with self.assertRaises(Exception):
            SalesReportSelector.parse_and_validate_dates(start_date="2026-08-10", end_date="2026-08-01")

    # 20. Unauthorized access control via API
    def test_unauthorized_api_access(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.get("/api/v1/admin/orders/reports/sales/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # 21, 22, 23. Top 10 products, categories, and brands
    def test_top_performers(self):
        order = Order.objects.create(
            order_number="ORD-TOP-001",
            user=self.customer,
            shipping_name="John Doe",
            shipping_address_line1="123 Street",
            shipping_city="City",
            shipping_state="State",
            shipping_postal_code="123456",
            payment_method=Order.PaymentMethod.RAZORPAY,
            payment_status=Order.PaymentStatus.PAID,
            order_status=Order.OrderStatus.CONFIRMED,
            subtotal=Decimal("2000.00"),
            coupon_discount=Decimal("0.00"),
            shipping_fee=Decimal("0.00"),
            total_amount=Decimal("2000.00"),
        )
        OrderItem.objects.create(
            order=order,
            product=self.product_hero,
            variant=self.variant_hero,
            product_name=self.product_hero.name,
            variant_name=self.variant_hero.variant_name,
            price=Decimal("1000.00"),
            original_price=Decimal("1000.00"),
            quantity=2,
            line_total=Decimal("2000.00"),
            status=OrderItem.ItemStatus.ACTIVE,
        )

        today_str = timezone.now().astimezone(IST_TZ).strftime("%Y-%m-%d")
        performers = SalesReportService.get_top_performers(start_date=today_str, end_date=today_str, limit=5)

        self.assertIn("top_products", performers)
        self.assertIn("top_categories", performers)
        self.assertIn("top_brands", performers)

        self.assertEqual(len(performers["top_products"]), 1)
        self.assertEqual(performers["top_products"][0]["product_name"], "Superhero Action Figure")
        self.assertEqual(performers["top_products"][0]["units_sold"], 2)
        self.assertEqual(performers["top_categories"][0]["category_name"], "Action Figures")
        self.assertEqual(performers["top_brands"][0]["brand_name"], "Marvelous Toys")

    # Authorized admin API endpoint test
    def test_authorized_admin_api_access(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get("/api/v1/admin/orders/reports/sales/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

    # 27. PDF export test (Authorized admin)
    def test_pdf_export_authorized(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get("/api/v1/admin/orders/reports/sales/export/pdf/?date_range=this_month")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/pdf")
        self.assertTrue("attachment;" in response["Content-Disposition"])
        self.assertTrue(response["Content-Disposition"].endswith('.pdf"'))
        self.assertTrue(len(response.content) > 0)

    # 28. Excel export test (Authorized admin)
    def test_excel_export_authorized(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get("/api/v1/admin/orders/reports/sales/export/excel/?date_range=this_month")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        self.assertTrue("attachment;" in response["Content-Disposition"])
        self.assertTrue(response["Content-Disposition"].endswith('.xlsx"'))
        self.assertTrue(len(response.content) > 0)

    # Security test: Customer access denied to exports
    def test_export_customer_denied(self):
        self.client.force_authenticate(user=self.customer)
        pdf_res = self.client.get("/api/v1/admin/orders/reports/sales/export/pdf/")
        excel_res = self.client.get("/api/v1/admin/orders/reports/sales/export/excel/")
        self.assertEqual(pdf_res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(excel_res.status_code, status.HTTP_403_FORBIDDEN)

    # 30. Dashboard Analytics API test (Authorized admin)
    def test_dashboard_analytics_api_authorized(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get("/api/v1/admin/orders/reports/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        data = response.data["data"]
        self.assertIn("summary", data)
        self.assertIn("sales_chart", data)
        self.assertIn("top_products", data)
        self.assertIn("top_categories", data)
        self.assertIn("top_brands", data)

    # 31. Dashboard Analytics Year filter test
    def test_dashboard_analytics_year_filter(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get("/api/v1/admin/orders/reports/dashboard/?year=2026")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        chart = response.data["data"]["sales_chart"]
        self.assertEqual(chart["period"], "month")
        self.assertEqual(len(chart["labels"]), 12)
        self.assertEqual(len(chart["sales"]), 12)

    # 32. Dashboard Analytics Month filter test
    def test_dashboard_analytics_month_filter(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get("/api/v1/admin/orders/reports/dashboard/?year=2026&month=8")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        chart = response.data["data"]["sales_chart"]
        self.assertEqual(chart["period"], "day")
        self.assertEqual(len(chart["labels"]), 31)

    # 33. Dashboard Analytics Customer denied test
    def test_dashboard_analytics_customer_denied(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.get("/api/v1/admin/orders/reports/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
