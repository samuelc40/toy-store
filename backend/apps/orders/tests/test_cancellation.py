import uuid
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.orders.admins.services import AdminCancellationRequestService
from apps.orders.customers.services import CustomerOrderService
from apps.orders.models import Order, OrderCancellationRequest, OrderItem
from apps.products.models import Category, Product, ProductVariant

User = get_user_model()


class OrderCancellationTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        unique_str = uuid.uuid4().hex[:6]

        self.customer = User.objects.create_user(
            email=f"cancel_customer_{unique_str}@toy.com",
            password="CustomerPassword123!",
            first_name="Cancel",
            last_name="Test",
            phone=f"99{unique_str[:8]}",
        )
        self.admin = User.objects.create_superuser(
            email=f"cancel_admin_{unique_str}@toy.com",
            password="AdminPassword123!",
            first_name="Admin",
            last_name="User",
        )

        self.category = Category.objects.create(name=f"Toys_{unique_str}")
        self.product = Product.objects.create(
            name="Action Hero", category=self.category
        )
        self.variant1 = ProductVariant.objects.create(
            product=self.product,
            variant_name="Red",
            sku=f"SKU-R-{unique_str}",
            price=Decimal("100.00"),
            stock_quantity=10,
        )
        self.variant2 = ProductVariant.objects.create(
            product=self.product,
            variant_name="Blue",
            sku=f"SKU-B-{unique_str}",
            price=Decimal("200.00"),
            stock_quantity=10,
        )

        self.order = Order.objects.create(
            order_number=f"ORD-CANC-{unique_str}",
            user=self.customer,
            shipping_name="Cancel Test",
            shipping_phone="9988776655",
            shipping_address_line1="123 Street",
            shipping_city="City",
            shipping_state="State",
            shipping_postal_code="123456",
            payment_method=Order.PaymentMethod.COD,
            payment_status=Order.PaymentStatus.PENDING,
            order_status=Order.OrderStatus.CONFIRMED,
            subtotal=Decimal("300.00"),
            shipping_fee=Decimal("1.00"),
            total_amount=Decimal("301.00"),
        )

        self.item1 = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            variant=self.variant1,
            product_name=self.product.name,
            variant_name=self.variant1.variant_name,
            price=Decimal("100.00"),
            original_price=Decimal("100.00"),
            quantity=1,
            line_total=Decimal("100.00"),
            status=OrderItem.ItemStatus.ACTIVE,
        )

        self.item2 = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            variant=self.variant2,
            product_name=self.product.name,
            variant_name=self.variant2.variant_name,
            price=Decimal("200.00"),
            original_price=Decimal("200.00"),
            quantity=1,
            line_total=Decimal("200.00"),
            status=OrderItem.ItemStatus.ACTIVE,
        )

    def test_single_item_cancellation_request_with_empty_reason(self):
        self.client.force_authenticate(user=self.customer)
        url = f"/api/v1/customers/orders/items/{self.item1.id}/cancel-request/"
        response = self.client.post(url, {"reason": ""}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["reason"], "Cancelled by customer")

        canc_req = OrderCancellationRequest.objects.get(id=response.data["data"]["id"])
        self.assertEqual(
            canc_req.status, OrderCancellationRequest.CancellationStatus.PENDING
        )

    def test_admin_approve_single_item_cancellation(self):
        req = CustomerOrderService.request_item_cancellation(
            user=self.customer,
            item_id=self.item1.id,
            reason="",
        )
        approved = AdminCancellationRequestService.approve_cancellation(
            cancellation_id=req.id,
            admin_remark="Approved",
            admin_user=self.admin,
        )
        self.assertEqual(
            approved.status, OrderCancellationRequest.CancellationStatus.APPROVED
        )

        self.item1.refresh_from_db()
        self.assertEqual(self.item1.status, OrderItem.ItemStatus.CANCELLED)
        self.variant1.refresh_from_db()
        self.assertEqual(self.variant1.stock_quantity, 11)

        self.order.refresh_from_db()
        self.assertEqual(self.order.subtotal, Decimal("200.00"))

    def test_direct_single_item_cancellation(self):
        CustomerOrderService.cancel_order_item(
            user=self.customer,
            item_id=self.item2.id,
            reason="",
        )
        self.item2.refresh_from_db()
        self.assertEqual(self.item2.status, OrderItem.ItemStatus.CANCELLED)
        self.variant2.refresh_from_db()
        self.assertEqual(self.variant2.stock_quantity, 11)

    def test_calculate_item_refund_with_coupon(self):
        self.order.coupon_discount = Decimal("30.00")
        self.order.save()

        # item1 line_total = 100.00, item2 line_total = 200.00, total_items_subtotal = 300.00
        # item1 coupon share = (100 / 300) * 30 = 10.00 -> net refund = 90.00
        refund1 = CustomerOrderService.calculate_item_refund(self.item1)
        self.assertEqual(refund1, Decimal("90.00"))

        # item2 coupon share = (200 / 300) * 30 = 20.00 -> net refund = 180.00
        refund2 = CustomerOrderService.calculate_item_refund(self.item2)
        self.assertEqual(refund2, Decimal("180.00"))
