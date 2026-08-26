import json
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.payments.models import Payment
from apps.payments.utils import verify_webhook_signature
from apps.orders.models import Order


class RazorpayWebhookAPIView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        signature = request.headers.get("X-Razorpay-Signature", "")
        body_bytes = request.body

        if not verify_webhook_signature(body_bytes, signature):
            return Response({"detail": "Invalid webhook signature."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payload = json.loads(body_bytes.decode("utf-8"))
        except Exception:
            return Response({"detail": "Invalid JSON payload."}, status=status.HTTP_400_BAD_REQUEST)

        event = payload.get("event")
        event_payload = payload.get("payload", {}).get("payment", {}).get("entity", {})

        rzp_order_id = event_payload.get("order_id")
        rzp_payment_id = event_payload.get("id")

        payment = Payment.objects.filter(
            gateway_order_id=rzp_order_id
        ).select_related("order").first()

        if not payment and rzp_payment_id:
            payment = Payment.objects.filter(
                gateway_payment_id=rzp_payment_id
            ).select_related("order").first()

        if event == "payment.captured":
            if payment:
                payment.status = Payment.Status.SUCCESS
                payment.gateway_payment_id = rzp_payment_id or payment.gateway_payment_id
                payment.paid_at = payment.paid_at or timezone.now()
                payment.gateway_response = event_payload
                payment.save()

                if payment.order:
                    payment.order.payment_status = Order.PaymentStatus.PAID
                    payment.order.save(update_fields=["payment_status", "updated_at"])

        elif event == "payment.failed":
            if payment:
                error_desc = event_payload.get("error_description") or "Payment failed."
                payment.status = Payment.Status.FAILED
                payment.failure_reason = error_desc
                payment.gateway_response = event_payload
                payment.save()

                if payment.order:
                    payment.order.payment_status = Order.PaymentStatus.FAILED
                    payment.order.save(update_fields=["payment_status", "updated_at"])

        elif event == "refund.created":
            if payment:
                payment.status = Payment.Status.REFUNDED
                payment.gateway_response = event_payload
                payment.save()

        return Response({"status": "ok"}, status=status.HTTP_200_OK)
