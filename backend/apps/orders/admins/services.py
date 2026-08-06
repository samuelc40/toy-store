from django.db import transaction
from rest_framework.exceptions import ValidationError
from apps.orders.models import Order


class AdminOrderService:

    # All valid statuses that admin can assign to an order
    VALID_STATUSES = [
        Order.OrderStatus.PENDING,
        Order.OrderStatus.CONFIRMED,
        Order.OrderStatus.PACKED,
        Order.OrderStatus.SHIPPED,
        "OUT_FOR_DELIVERY",
        Order.OrderStatus.DELIVERED,
        Order.OrderStatus.CANCELLED,
        Order.OrderStatus.RETURN_REQUESTED,
        Order.OrderStatus.RETURNED,
    ]

    @classmethod
    @transaction.atomic
    def update_order_status(cls, order_id, new_status, admin_user=None):
        """
        Allows admin to update order status to any valid choice.
        Does NOT modify stock (stock is managed at checkout & customer cancellation).
        """
        try:
            order = Order.objects.select_for_update().get(id=order_id)
        except Order.DoesNotExist:
            raise ValidationError({"order_id": "Order not found."})

        current_status = order.order_status
        target_status = str(new_status).upper().strip()

        if target_status not in cls.VALID_STATUSES:
            valid_labels = ", ".join(f"'{s}'" for s in cls.VALID_STATUSES)
            raise ValidationError({
                "order_status": f"Invalid status '{target_status}'. Allowed options: {valid_labels}."
            })

        if current_status == target_status:
            raise ValidationError({
                "order_status": f"Order is already in '{order.get_order_status_display() if hasattr(order, 'get_order_status_display') else current_status}' status."
            })

        # Enforce business logic status transition rules
        if current_status == Order.OrderStatus.CANCELLED:
            raise ValidationError({
                "order_status": "Cancelled orders cannot be transitioned to another status."
            })

        if current_status == Order.OrderStatus.DELIVERED and target_status in [
            Order.OrderStatus.PENDING,
            Order.OrderStatus.CONFIRMED,
            Order.OrderStatus.PACKED,
            Order.OrderStatus.SHIPPED,
            "OUT_FOR_DELIVERY",
            Order.OrderStatus.CANCELLED,
        ]:
            raise ValidationError({
                "order_status": f"Delivered orders cannot be transitioned back to '{target_status}'."
            })

        order.order_status = target_status

        # If status is set to DELIVERED, mark COD orders as PAID automatically
        if target_status == Order.OrderStatus.DELIVERED:
            order.payment_status = Order.PaymentStatus.PAID

        order.save(update_fields=["order_status", "payment_status", "updated_at"])
        return order
