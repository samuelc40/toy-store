import uuid
from django.db import models
from django.conf import settings
from apps.accounts.models import Address
from apps.products.models import Product, ProductVariant


class Order(models.Model):

    class OrderStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        PACKED = "PACKED", "Packed"
        SHIPPED = "SHIPPED", "Shipped"
        OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY", "Out For Delivery"
        DELIVERED = "DELIVERED", "Delivered"
        CANCELLED = "CANCELLED", "Cancelled"
        RETURN_REQUESTED = "RETURN_REQUESTED", "Return Requested"
        RETURNED = "RETURNED", "Returned"

    class PaymentMethod(models.TextChoices):
        COD = "COD", "Cash On Delivery"
        RAZORPAY = "RAZORPAY", "Razorpay"
        WALLET = "WALLET", "Wallet"

    class PaymentStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PAID = "PAID", "Paid"
        FAILED = "FAILED", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=50, unique=True, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")

    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders")
    shipping_name = models.CharField(max_length=255)
    shipping_phone = models.CharField(max_length=15, blank=True)
    shipping_address_line1 = models.CharField(max_length=255)
    shipping_address_line2 = models.CharField(max_length=255, blank=True)
    shipping_landmark = models.CharField(max_length=255, blank=True)
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100)
    shipping_postal_code = models.CharField(max_length=20)
    shipping_country = models.CharField(max_length=100, default="India")
    shipping_address_type = models.CharField(max_length=10, default="HOME")

    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.COD)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    order_status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    coupon = models.ForeignKey("coupons.Coupon", on_delete=models.SET_NULL, null=True, blank=True, related_name="orders")
    coupon_code = models.CharField(max_length=50, blank=True)
    coupon_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    cancellation_reason = models.CharField(max_length=500, blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["created_at"], name="idx_orders_created_at"),
            models.Index(fields=["order_status", "created_at"], name="idx_orders_status_date"),
            models.Index(fields=["payment_status", "created_at"], name="idx_orders_paystatus_date"),
            models.Index(fields=["payment_method", "created_at"], name="idx_orders_paymethod_date"),
        ]

    def __str__(self):
        return f"Order {self.order_number} ({self.user.email})"


class OrderItem(models.Model):

    class ItemStatus(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        CANCELLED = "CANCELLED", "Cancelled"
        RETURN_REQUESTED = "RETURN_REQUESTED", "Return Requested"
        RETURNED = "RETURNED", "Returned"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name="order_items")
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True, related_name="order_items")

    product_name = models.CharField(max_length=255)
    variant_name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    offer_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    offer_type = models.CharField(max_length=50, blank=True, null=True)
    offer_name = models.CharField(max_length=255, blank=True, null=True)
    quantity = models.PositiveIntegerField(default=1)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(max_length=20, choices=ItemStatus.choices, default=ItemStatus.ACTIVE)
    cancellation_reason = models.CharField(max_length=500, blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "order_items"
        indexes = [
            models.Index(fields=["order", "status"], name="idx_items_order_status"),
            models.Index(fields=["product", "status"], name="idx_items_product_status"),
        ]

    def __str__(self):
        return f"{self.quantity} x {self.product_name} ({self.variant_name})"


class OrderReturnRequest(models.Model):

    class ReturnStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        COMPLETED = "COMPLETED", "Completed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="return_requests")
    order_item = models.ForeignKey(OrderItem, on_delete=models.SET_NULL, null=True, blank=True, related_name="return_requests")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="order_returns")
    reason = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    admin_remark = models.TextField(blank=True, null=True)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=ReturnStatus.choices, default=ReturnStatus.PENDING)
    refunded_at = models.DateTimeField(blank=True, null=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "order_return_requests"
        ordering = ["-requested_at"]
        indexes = [
            models.Index(fields=["status", "refunded_at"], name="idx_returns_status_date"),
            models.Index(fields=["status", "requested_at"], name="idx_returns_status_reqdate"),
        ]

    def __str__(self):
        return f"Return Request for {self.order.order_number} ({self.reason})"


class OrderCancellationRequest(models.Model):

    class CancellationStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="cancellation_requests")
    order_item = models.ForeignKey(OrderItem, on_delete=models.SET_NULL, null=True, blank=True, related_name="cancellation_requests")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="order_cancellations")
    reason = models.CharField(max_length=500)
    description = models.TextField(blank=True, null=True)
    admin_remark = models.TextField(blank=True, null=True)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=CancellationStatus.choices, default=CancellationStatus.PENDING)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_cancellations")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "order_cancellation_requests"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"], name="idx_cancels_status_date"),
        ]

    def __str__(self):
        target = f"Item {self.order_item_id}" if self.order_item_id else f"Order {self.order.order_number}"
        return f"Cancellation Request for {target} ({self.status})"
