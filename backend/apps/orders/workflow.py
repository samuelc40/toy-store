from typing import List, Dict
from apps.orders.models import Order


class OrderWorkflow:
    """
    Centralized Order Status State Machine.
    Single source of truth for every status transition in the system.
    """

    TRANSITIONS: Dict[str, List[str]] = {
        Order.OrderStatus.PENDING: [
            Order.OrderStatus.CONFIRMED,
            Order.OrderStatus.CANCELLED,
        ],
        Order.OrderStatus.CONFIRMED: [
            Order.OrderStatus.PACKED,
            Order.OrderStatus.CANCELLED,
        ],
        Order.OrderStatus.PACKED: [
            Order.OrderStatus.SHIPPED,
            Order.OrderStatus.CANCELLED,
        ],
        Order.OrderStatus.SHIPPED: [
            Order.OrderStatus.OUT_FOR_DELIVERY,
            Order.OrderStatus.CANCELLED,
        ],
        Order.OrderStatus.OUT_FOR_DELIVERY: [
            Order.OrderStatus.DELIVERED,
        ],
        Order.OrderStatus.DELIVERED: [
            Order.OrderStatus.RETURN_REQUESTED,
        ],
        Order.OrderStatus.RETURN_REQUESTED: [
            Order.OrderStatus.RETURNED,
        ],
        Order.OrderStatus.CANCELLED: [],
        Order.OrderStatus.RETURNED: [],
    }

    @classmethod
    def get_valid_next_statuses(cls, current_status: str) -> List[str]:
        """
        Returns a list of valid next status codes for the given current status.
        """
        if not current_status:
            return []
        current_status_upper = str(current_status).strip().upper()
        return cls.TRANSITIONS.get(current_status_upper, [])

    @classmethod
    def is_valid_transition(cls, current_status: str, target_status: str) -> bool:
        """
        Validates if transition from current_status to target_status is allowed.
        """
        if not current_status or not target_status:
            return False
        target_status_upper = str(target_status).strip().upper()
        allowed = cls.get_valid_next_statuses(current_status)
        return target_status_upper in allowed

    @classmethod
    def on_status_changed(cls, order: Order, old_status: str, new_status: str):
        """
        Event hook architecture for status-based side effects.
        Automatically updates payment status to PAID when order status becomes DELIVERED.
        """
        if new_status == Order.OrderStatus.DELIVERED:
            if order.payment_status != Order.PaymentStatus.PAID:
                order.payment_status = Order.PaymentStatus.PAID
                order.save(update_fields=["payment_status", "updated_at"])
