from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from apps.orders.models import Order, OrderItem, OrderReturnRequest, OrderCancellationRequest
from apps.orders.workflow import OrderWorkflow
from apps.products.models import ProductVariant
from apps.wallet.models import WalletTransaction
from apps.wallet.customers.services import WalletService


class AdminOrderService:

    @classmethod
    @transaction.atomic
    def update_order_status(cls, order_id, new_status, admin_user=None):
        
        try:
            order = Order.objects.select_for_update().get(id=order_id)
        except Order.DoesNotExist:
            raise ValidationError({"order_id": "Order not found."})

        current_status = order.order_status
        target_status = str(new_status).upper().strip()

        if current_status == target_status:
            raise ValidationError({
                "order_status": f"Order is already in '{order.get_order_status_display()}' status."
            })

        if not OrderWorkflow.is_valid_transition(current_status, target_status):
            valid_next = OrderWorkflow.get_valid_next_statuses(current_status)
            if not valid_next:
                raise ValidationError({
                    "order_status": f"Order in '{order.get_order_status_display()}' status is terminal and cannot be modified."
                })
            
            allowed_labels = ", ".join(f"'{s}'" for s in valid_next)
            raise ValidationError({
                "order_status": f"Cannot transition order from '{order.get_order_status_display()}' to '{target_status}'. Allowed next statuses: {allowed_labels}."
            })

        order.order_status = target_status

        if target_status == Order.OrderStatus.DELIVERED:
            order.payment_status = Order.PaymentStatus.PAID

        order.save(update_fields=["order_status", "payment_status", "updated_at"])

        OrderWorkflow.on_status_changed(order, current_status, target_status)

        return order


class AdminReturnRequestService:

    @classmethod
    @transaction.atomic
    def approve_return(cls, return_id, admin_remark=""):
        try:
            return_req = (
                OrderReturnRequest.objects.select_for_update(of=("self",))
                .select_related("order", "user", "order_item")
                .get(id=return_id)
            )
        except OrderReturnRequest.DoesNotExist:
            raise ValidationError({"return_id": "Return request not found."})

        if return_req.status != OrderReturnRequest.ReturnStatus.PENDING:
            raise ValidationError({"status": f"Return request is already '{return_req.get_status_display()}' and cannot be processed again."})

        order = return_req.order
        user = return_req.user
        item = return_req.order_item

        if item:
            from apps.orders.customers.services import CustomerOrderService
            refund_amount = return_req.refund_amount or CustomerOrderService.calculate_item_refund(item)
            if refund_amount <= 0:
                refund_amount = item.line_total
        else:
            refund_amount = return_req.refund_amount or order.total_amount

        if refund_amount <= 0:
            raise ValidationError({"refund_amount": "Refund amount must be greater than zero."})

        # 1. Restore Product Stock for returned items
        if item:
            if item.variant_id:
                variant = ProductVariant.objects.select_for_update().filter(id=item.variant_id).first()
                if variant:
                    variant.stock_quantity += item.quantity
                    variant.save(update_fields=["stock_quantity", "updated_at"])
        else:
            items = list(OrderItem.objects.filter(order=order))
            variant_ids = [i.variant_id for i in items if i.variant_id]
            if variant_ids:
                variants_map = {
                    v.id: v for v in ProductVariant.objects.filter(id__in=variant_ids).select_for_update()
                }
                for i in items:
                    if i.variant_id and i.variant_id in variants_map:
                        v = variants_map[i.variant_id]
                        v.stock_quantity += i.quantity
                        v.save(update_fields=["stock_quantity", "updated_at"])

        # 2. Refund to User Wallet via WalletService.refund()
        item_desc = f" for '{item.product_name}'" if item else ""
        WalletService.refund(
            user=user,
            order=order,
            amount=refund_amount,
            reason=WalletTransaction.TransactionReason.RETURN_REFUND,
            description=f"Refund for Return Request #{str(return_req.id)[:8].upper()}{item_desc}" + (f": {admin_remark}" if admin_remark else ""),
        )

        # 3. Update Return Request & Item Status
        return_req.status = OrderReturnRequest.ReturnStatus.APPROVED
        return_req.refund_amount = refund_amount
        return_req.refunded_at = timezone.now()
        return_req.admin_remark = admin_remark
        return_req.save()

        if item:
            item.status = OrderItem.ItemStatus.RETURNED
            item.save(update_fields=["status"])

        # 4. Check if all items in order are returned/cancelled
        all_items = list(order.items.all())
        all_returned_or_cancelled = all(
            i.status in [OrderItem.ItemStatus.RETURNED, OrderItem.ItemStatus.CANCELLED] for i in all_items
        )
        if all_returned_or_cancelled or not item:
            order.order_status = Order.OrderStatus.RETURNED
            order.save(update_fields=["order_status", "updated_at"])

        return return_req

    @classmethod
    @transaction.atomic
    def reject_return(cls, return_id, admin_remark=""):
        try:
            return_req = (
                OrderReturnRequest.objects.select_for_update(of=("self",))
                .select_related("order", "order_item")
                .get(id=return_id)
            )
        except OrderReturnRequest.DoesNotExist:
            raise ValidationError({"return_id": "Return request not found."})

        if return_req.status != OrderReturnRequest.ReturnStatus.PENDING:
            raise ValidationError({"status": f"Return request is already '{return_req.get_status_display()}'."})

        return_req.status = OrderReturnRequest.ReturnStatus.REJECTED
        return_req.admin_remark = admin_remark
        return_req.save()

        if return_req.order_item:
            return_req.order_item.status = OrderItem.ItemStatus.ACTIVE
            return_req.order_item.save(update_fields=["status"])
        elif return_req.order and return_req.order.order_status == Order.OrderStatus.RETURN_REQUESTED:
            return_req.order.order_status = Order.OrderStatus.DELIVERED
            return_req.order.save(update_fields=["order_status", "updated_at"])


class AdminCancellationRequestService:

    @classmethod
    @transaction.atomic
    def approve_cancellation(cls, cancellation_id, admin_remark="", admin_user=None):
        try:
            canc_req = (
                OrderCancellationRequest.objects.select_for_update(of=("self",))
                .select_related("order", "user", "order_item")
                .get(id=cancellation_id)
            )
        except OrderCancellationRequest.DoesNotExist:
            raise ValidationError({"cancellation_id": "Cancellation request not found."})

        if canc_req.status != OrderCancellationRequest.CancellationStatus.PENDING:
            raise ValidationError({"status": f"Cancellation request is already '{canc_req.get_status_display()}' and cannot be processed again."})

        order = canc_req.order
        user = canc_req.user
        item = canc_req.order_item

        non_cancellable = [
            Order.OrderStatus.DELIVERED,
            Order.OrderStatus.RETURNED,
            Order.OrderStatus.OUT_FOR_DELIVERY,
            Order.OrderStatus.SHIPPED,
            Order.OrderStatus.CANCELLED,
            Order.OrderStatus.RETURN_REQUESTED,
        ]
        if order.order_status in non_cancellable:
            raise ValidationError(f"Cannot approve cancellation because order status is '{order.get_order_status_display()}'.")

        from apps.orders.customers.services import CustomerOrderService
        if item:
            if item.status != OrderItem.ItemStatus.ACTIVE:
                raise ValidationError(f"Cannot cancel item with status '{item.get_status_display()}'.")
            CustomerOrderService.cancel_order_item(
                user=user,
                item_id=item.id,
                reason=f"Approved Cancellation Request #{str(canc_req.id)[:8].upper()}: {canc_req.reason}",
            )
        else:
            CustomerOrderService.cancel_order(
                user=user,
                order_id=order.id,
                reason=f"Approved Cancellation Request #{str(canc_req.id)[:8].upper()}: {canc_req.reason}",
            )

        canc_req.status = OrderCancellationRequest.CancellationStatus.APPROVED
        canc_req.admin_remark = admin_remark
        canc_req.reviewed_at = timezone.now()
        if admin_user and admin_user.is_authenticated:
            canc_req.reviewed_by = admin_user
        canc_req.save()

        return canc_req

    @classmethod
    @transaction.atomic
    def reject_cancellation(cls, cancellation_id, admin_remark="", admin_user=None):
        try:
            canc_req = (
                OrderCancellationRequest.objects.select_for_update(of=("self",))
                .select_related("order", "user", "order_item")
                .get(id=cancellation_id)
            )
        except OrderCancellationRequest.DoesNotExist:
            raise ValidationError({"cancellation_id": "Cancellation request not found."})

        if canc_req.status != OrderCancellationRequest.CancellationStatus.PENDING:
            raise ValidationError({"status": f"Cancellation request is already '{canc_req.get_status_display()}'."})

        canc_req.status = OrderCancellationRequest.CancellationStatus.REJECTED
        canc_req.admin_remark = admin_remark
        canc_req.reviewed_at = timezone.now()
        if admin_user and admin_user.is_authenticated:
            canc_req.reviewed_by = admin_user
        canc_req.save()

        return canc_req
