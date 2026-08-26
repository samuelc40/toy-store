from apps.payments.models import Payment


class CustomerPaymentSelector:

    @staticmethod
    def get_payment_by_id(user, payment_id):
        if not user or not user.is_authenticated or not payment_id:
            return None
        return Payment.objects.filter(user=user, id=payment_id).select_related("order").first()

    @staticmethod
    def get_payment_by_gateway_order_id(gateway_order_id):
        if not gateway_order_id:
            return None
        return Payment.objects.filter(gateway_order_id=gateway_order_id).select_related("order", "user").first()

    @staticmethod
    def get_payment_by_gateway_payment_id(gateway_payment_id):
        if not gateway_payment_id:
            return None
        return Payment.objects.filter(gateway_payment_id=gateway_payment_id).select_related("order", "user").first()

    @staticmethod
    def get_user_payments(user):
        if not user or not user.is_authenticated:
            return Payment.objects.none()
        return Payment.objects.filter(user=user).select_related("order").order_by("-created_at")