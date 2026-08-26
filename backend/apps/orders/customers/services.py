import uuid
import io
from django.db import transaction
from django.utils import timezone
from django.http import HttpResponse
from rest_framework.exceptions import ValidationError, PermissionDenied

from apps.accounts.models import Address
from apps.cart.customers.services import CustomerCartService
from apps.cart.models import CartItem
from apps.orders.models import Order, OrderItem, OrderReturnRequest, OrderCancellationRequest
from apps.products.models import ProductVariant
from apps.wallet.customers.services import WalletService
from apps.wallet.models import WalletTransaction

from decimal import Decimal
from apps.coupons.customers.services import CustomerCouponService
from apps.offers.services import PricingService

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


class CustomerCheckoutService:

    @classmethod
    @transaction.atomic
    def place_order(cls, user, address_id, payment_method="COD"):

        contact_phone = str(user.phone).strip() if user.phone else ""
        if not contact_phone or not contact_phone.isdigit() or len(contact_phone) != 10:
            raise ValidationError({"phone": "A valid 10-digit contact phone number is required before placing an order."})

        allowed_methods = [Order.PaymentMethod.COD, Order.PaymentMethod.RAZORPAY, Order.PaymentMethod.WALLET]
        if payment_method not in allowed_methods:
            raise ValidationError({"payment_method": f"Unsupported payment method '{payment_method}'."})

        if not address_id:
            raise ValidationError({"address_id": "Please select a delivery address."})

        try:
            address = Address.objects.get(id=address_id, user=user)
        except Address.DoesNotExist:
            raise ValidationError({"address_id": "Selected delivery address was not found."})

        CustomerCartService.validate_checkout_eligibility(user)

        cart = CustomerCartService.get_or_create_cart(user)
        cart_items = list(
            CartItem.objects.select_related("variant", "variant__product")
            .filter(cart=cart)
        )

        if not cart_items:
            raise ValidationError({"cart": "Your cart is empty."})

        CartItem.objects.filter(cart=cart).select_for_update()
        variant_ids = [item.variant_id for item in cart_items if item.variant_id]
        if variant_ids:
            ProductVariant.objects.filter(id__in=variant_ids).select_for_update()

        subtotal = Decimal("0.00")
        discount_amount = Decimal("0.00")
        order_items_payload = []

        for item in cart_items:
            variant = item.variant
            if not variant:
                raise ValidationError({"cart": "An item in your cart no longer exists."})

            if not variant.is_active or variant.blocked:
                raise ValidationError({"cart": f"Variant '{variant.variant_name}' is unavailable."})

            product = getattr(variant, "product", None)
            if not product or not product.is_active or product.blocked:
                raise ValidationError({"cart": f"Product '{variant.product.name if product else 'Item'}' is unavailable."})

            if item.quantity > variant.stock_quantity:
                raise ValidationError({
                    "stock": f"Insufficient stock for '{variant.product.name} ({variant.variant_name})'. Only {variant.stock_quantity} left."
                })

            item_price_calc = PricingService.calculate_variant_price(variant)
            unit_price = item_price_calc["offer_price"]
            orig_price = item_price_calc["original_price"]
            item_disc = item_price_calc["discount_amount"]
            line_total = round(unit_price * item.quantity, 2)

            subtotal += line_total
            discount_amount += (item_disc * item.quantity)

            order_items_payload.append({
                "product": product,
                "variant": variant,
                "product_name": product.name,
                "variant_name": variant.variant_name,
                "sku": variant.sku or "",
                "price": unit_price,
                "original_price": orig_price,
                "offer_discount": item_disc,
                "offer_type": item_price_calc["offer_type"],
                "offer_name": item_price_calc["offer_name"],
                "quantity": item.quantity,
                "line_total": line_total,
            })

        applied_coupon = cart.coupon
        coupon_code = applied_coupon.code if (applied_coupon and applied_coupon.is_active) else None

        checkout_calc = PricingService.calculate_checkout_total(
            user=user,
            cart=cart,
            coupon_code=coupon_code,
            use_wallet=(payment_method == Order.PaymentMethod.WALLET)
        )

        subtotal_dec = checkout_calc["subtotal"]
        coupon_discount = checkout_calc["coupon_discount"]
        discount_amount_dec = checkout_calc["offer_discount"]
        shipping_fee = checkout_calc["shipping_fee"]
        total_amount = checkout_calc["final_payable"] if payment_method != Order.PaymentMethod.WALLET else checkout_calc["total_with_shipping"]

        date_str = timezone.now().strftime("%Y%m%d")
        unique_suffix = uuid.uuid4().hex[:6].upper()
        order_number = f"ORD-{date_str}-{unique_suffix}"

        shipping_name = f"{user.first_name} {user.last_name}".strip() or user.email
        shipping_phone = user.phone or ""

        if payment_method == Order.PaymentMethod.WALLET:
            WalletService.debit(
                user=user,
                amount=checkout_calc["total_with_shipping"],
                reason=WalletTransaction.TransactionReason.WALLET_PAYMENT,
                description=f"Payment for Order #{order_number}",
            )
            initial_payment_status = Order.PaymentStatus.PAID
            initial_order_status = Order.OrderStatus.CONFIRMED
        elif payment_method == Order.PaymentMethod.RAZORPAY:
            initial_payment_status = Order.PaymentStatus.PAID
            initial_order_status = Order.OrderStatus.CONFIRMED
        else:
            initial_payment_status = Order.PaymentStatus.PENDING
            initial_order_status = Order.OrderStatus.PENDING

        order = Order.objects.create(
            order_number=order_number,
            user=user,
            address=address,
            shipping_name=shipping_name,
            shipping_phone=shipping_phone,
            shipping_address_line1=address.address_line1,
            shipping_address_line2=address.address_line2 or "",
            shipping_landmark=address.landmark or "",
            shipping_city=address.city,
            shipping_state=address.state,
            shipping_postal_code=address.postal_code,
            shipping_country=address.country,
            shipping_address_type=address.address_type,
            payment_method=payment_method,
            payment_status=initial_payment_status,
            order_status=initial_order_status,
            subtotal=subtotal_dec,
            coupon=applied_coupon if coupon_discount > 0 else None,
            coupon_code=applied_coupon.code if (applied_coupon and coupon_discount > 0) else "",
            coupon_discount=coupon_discount,
            discount_amount=discount_amount_dec,
            shipping_fee=shipping_fee,
            total_amount=checkout_calc["total_with_shipping"],
        )

        if applied_coupon and coupon_discount > 0:
            from apps.coupons.models import CouponUsage
            CouponUsage.objects.create(
                coupon=applied_coupon,
                user=user,
                order=order,
            )
            applied_coupon.used_count += 1
            applied_coupon.save(update_fields=["used_count", "updated_at"])
            cart.coupon = None
            cart.save(update_fields=["coupon", "updated_at"])

        for payload in order_items_payload:
            OrderItem.objects.create(
                order=order,
                product=payload["product"],
                variant=payload["variant"],
                product_name=payload["product_name"],
                variant_name=payload["variant_name"],
                sku=payload["sku"],
                price=payload["price"],
                original_price=payload["original_price"],
                offer_discount=payload["offer_discount"],
                offer_type=payload["offer_type"],
                offer_name=payload["offer_name"],
                quantity=payload["quantity"],
                line_total=payload["line_total"],
                status=OrderItem.ItemStatus.ACTIVE,
            )

            variant = payload["variant"]
            variant.stock_quantity -= payload["quantity"]
            variant.save(update_fields=["stock_quantity", "updated_at"])

        # Trigger Referral Reward if applicable (first successful order)
        try:
            PricingService.process_referral_reward(user=user, order=order)
        except Exception as ref_err:
            print(f"Referral reward processing note: {ref_err}", flush=True)

        CustomerCartService.clear_cart(user)

        return order


class CustomerOrderService:

    @classmethod
    @transaction.atomic
    def request_order_cancellation(cls, user, order_id, reason, description=None):
        if not reason or not str(reason).strip():
            raise ValidationError({"reason": "Cancellation reason is mandatory."})

        try:
            order = Order.objects.select_for_update(of=("self",)).get(id=order_id, user=user)
        except Order.DoesNotExist:
            raise ValidationError("Order not found or unauthorized.")

        non_cancellable = [
            Order.OrderStatus.DELIVERED,
            Order.OrderStatus.RETURNED,
            Order.OrderStatus.OUT_FOR_DELIVERY,
            Order.OrderStatus.SHIPPED,
            Order.OrderStatus.CANCELLED,
            Order.OrderStatus.RETURN_REQUESTED,
        ]
        if order.order_status in non_cancellable:
            raise ValidationError(f"Order cannot be cancelled because its status is '{order.get_order_status_display()}'.")

        if OrderCancellationRequest.objects.filter(
            order=order,
            order_item__isnull=True,
            status=OrderCancellationRequest.CancellationStatus.PENDING,
        ).exists():
            raise ValidationError("A cancellation request is already pending for this order.")

        refund_amount = order.total_amount if order.payment_method != Order.PaymentMethod.COD else Decimal("0.00")

        cancellation_req = OrderCancellationRequest.objects.create(
            order=order,
            user=user,
            reason=reason.strip(),
            description=description.strip() if description else "",
            refund_amount=refund_amount,
            status=OrderCancellationRequest.CancellationStatus.PENDING,
        )

        return cancellation_req

    @classmethod
    @transaction.atomic
    def request_item_cancellation(cls, user, item_id, reason, description=None):
        if not reason or not str(reason).strip():
            raise ValidationError({"reason": "Cancellation reason is mandatory."})

        try:
            item = OrderItem.objects.select_for_update(of=("self",)).select_related("order").get(id=item_id, order__user=user)
        except OrderItem.DoesNotExist:
            raise ValidationError("Order item not found or unauthorized.")

        order = item.order
        non_cancellable = [
            Order.OrderStatus.DELIVERED,
            Order.OrderStatus.RETURNED,
            Order.OrderStatus.OUT_FOR_DELIVERY,
            Order.OrderStatus.SHIPPED,
            Order.OrderStatus.CANCELLED,
            Order.OrderStatus.RETURN_REQUESTED,
        ]
        if order.order_status in non_cancellable:
            raise ValidationError(f"Item cannot be cancelled because order status is '{order.get_order_status_display()}'.")

        if item.status != OrderItem.ItemStatus.ACTIVE:
            if item.status == OrderItem.ItemStatus.CANCELLED:
                raise ValidationError("This item has already been cancelled.")
            else:
                raise ValidationError(f"Cannot cancel item with status '{item.get_status_display()}'.")

        if OrderCancellationRequest.objects.filter(
            order_item=item,
            status=OrderCancellationRequest.CancellationStatus.PENDING,
        ).exists():
            raise ValidationError("A cancellation request is already pending for this item.")

        refund_amount = cls.calculate_item_refund(item) if order.payment_method != Order.PaymentMethod.COD else Decimal("0.00")

        cancellation_req = OrderCancellationRequest.objects.create(
            order=order,
            order_item=item,
            user=user,
            reason=reason.strip(),
            description=description.strip() if description else "",
            refund_amount=refund_amount,
            status=OrderCancellationRequest.CancellationStatus.PENDING,
        )

        return cancellation_req

    @classmethod
    @transaction.atomic
    def cancel_order(cls, user, order_id, reason=None):
       
        try:
            order = Order.objects.select_for_update().get(id=order_id, user=user)
        except Order.DoesNotExist:
            raise ValidationError("Order not found or unauthorized.")

        non_cancellable = [
            Order.OrderStatus.DELIVERED,
            Order.OrderStatus.RETURNED,
            Order.OrderStatus.OUT_FOR_DELIVERY,
            Order.OrderStatus.SHIPPED,
            Order.OrderStatus.CANCELLED,
            Order.OrderStatus.RETURN_REQUESTED,
        ]
        if order.order_status in non_cancellable:
            raise ValidationError(f"Order cannot be cancelled because its status is '{order.get_order_status_display()}'.")

        now = timezone.now()
        clean_reason = reason.strip() if reason else "Cancelled by customer"

        active_items = list(order.items.select_related("variant").filter(status=OrderItem.ItemStatus.ACTIVE))
        variant_ids = [item.variant_id for item in active_items if item.variant_id]
        if variant_ids:
            ProductVariant.objects.filter(id__in=variant_ids).select_for_update()

        for item in active_items:
            if item.variant:
                item.variant.stock_quantity += item.quantity
                item.variant.save(update_fields=["stock_quantity", "updated_at"])

            item.status = OrderItem.ItemStatus.CANCELLED
            item.cancellation_reason = clean_reason
            item.cancelled_at = now
            item.save(update_fields=["status", "cancellation_reason", "cancelled_at"])

        refund_amount = order.total_amount

        order.order_status = Order.OrderStatus.CANCELLED
        order.cancellation_reason = clean_reason
        order.cancelled_at = now
        order.subtotal = 0
        order.total_amount = 0
        order.save(update_fields=["order_status", "cancellation_reason", "cancelled_at", "subtotal", "total_amount", "updated_at"])

        if order.payment_method != Order.PaymentMethod.COD and refund_amount > 0:
            WalletService.refund(
                user=order.user,
                order=order,
                amount=refund_amount,
                reason=WalletTransaction.TransactionReason.ORDER_CANCELLED,
                description=f"Refund for cancelled order {order.order_number}"
            )

        return order

    

    @classmethod
    @transaction.atomic
    def cancel_order_item(cls, user, item_id, reason=None):

        try:
            item = (
                OrderItem.objects.select_related("order", "variant")
                .get(id=item_id, order__user=user)
            )
        except OrderItem.DoesNotExist:
            raise ValidationError("Order item not found or unauthorized.")

        OrderItem.objects.filter(id=item.id).select_for_update()

        if item.variant_id:
            ProductVariant.objects.filter(
                id=item.variant_id
            ).select_for_update()

        order = item.order

        non_cancellable = [
            Order.OrderStatus.DELIVERED,
            Order.OrderStatus.RETURNED,
            Order.OrderStatus.CANCELLED,
            Order.OrderStatus.RETURN_REQUESTED,
        ]

        if order.order_status in non_cancellable:
            raise ValidationError(f"Item cannot be cancelled because order status is '{order.get_order_status_display()}'.")

        if item.status == OrderItem.ItemStatus.CANCELLED:
            raise ValidationError("This item has already been cancelled.")

        now = timezone.now()
        clean_reason = reason.strip() if reason else "Cancelled by customer"

        refund_amount = item.line_total

        if item.variant:
            item.variant.stock_quantity += item.quantity
            item.variant.save(update_fields=["stock_quantity", "updated_at",])

        item.status = OrderItem.ItemStatus.CANCELLED
        item.cancellation_reason = clean_reason
        item.cancelled_at = now
        item.save(update_fields=["status", "cancellation_reason", "cancelled_at",])

        active_items = order.items.filter(
            status=OrderItem.ItemStatus.ACTIVE
        )

        if active_items.exists():

            order.subtotal = sum(
                i.line_total for i in active_items
            )

            SHIPPING_THRESHOLD = 999
            SHIPPING_COST = 1

            order.shipping_fee = (0 if (order.subtotal >= SHIPPING_THRESHOLD or order.subtotal == 0) else SHIPPING_COST)

            order.total_amount = (
                order.subtotal +
                order.shipping_fee
            )

            order.save(update_fields=["subtotal", "shipping_fee", "total_amount", "updated_at",])

        else:

            order.order_status = Order.OrderStatus.CANCELLED
            order.cancellation_reason = "All order items cancelled"
            order.cancelled_at = now
            order.save(update_fields=["order_status", "cancellation_reason", "cancelled_at", "updated_at",])


        if (order.payment_method != Order.PaymentMethod.COD and refund_amount > 0):

            WalletService.refund(
                user=order.user,
                order=order,
                amount=refund_amount,
                reason=WalletTransaction.TransactionReason.ORDER_CANCELLED,
                description=f"Refund for cancelled item '{item.product_name}' in order {order.order_number}",
            )

        return order

    @classmethod
    def calculate_item_refund(cls, item: OrderItem) -> Decimal:
        order = item.order
        if not order or order.subtotal <= 0:
            return Decimal("0.00")

        item_coupon_share = Decimal("0.00")
        if order.coupon_discount > 0 and order.subtotal > 0:
            item_coupon_share = (item.line_total / order.subtotal) * order.coupon_discount

        net_refund = max(Decimal("0.00"), item.line_total - item_coupon_share)
        return net_refund.quantize(Decimal("0.01"))

    @classmethod
    @transaction.atomic
    def request_item_return(cls, user, item_id, reason, description=None):
        if not reason or not str(reason).strip():
            raise ValidationError({"reason": "Return reason is mandatory."})

        try:
            item = OrderItem.objects.select_for_update().select_related("order").get(id=item_id, order__user=user)
        except OrderItem.DoesNotExist:
            raise ValidationError("Order item not found or unauthorized.")

        order = item.order
        if order.order_status != Order.OrderStatus.DELIVERED:
            raise ValidationError("Return requests can only be submitted for delivered items.")

        if item.status != OrderItem.ItemStatus.ACTIVE:
            if item.status == OrderItem.ItemStatus.CANCELLED:
                raise ValidationError("Cannot return a cancelled item.")
            elif item.status == OrderItem.ItemStatus.RETURN_REQUESTED:
                raise ValidationError("A return request has already been submitted for this item.")
            elif item.status == OrderItem.ItemStatus.RETURNED:
                raise ValidationError("This item has already been returned.")

        if OrderReturnRequest.objects.filter(
            order_item=item,
            status__in=[
                OrderReturnRequest.ReturnStatus.PENDING,
                OrderReturnRequest.ReturnStatus.APPROVED,
                OrderReturnRequest.ReturnStatus.COMPLETED,
            ],
        ).exists():
            raise ValidationError("A return request is already active for this item.")

        refund_amount = cls.calculate_item_refund(item)

        return_req = OrderReturnRequest.objects.create(
            order=order,
            order_item=item,
            user=user,
            reason=reason.strip(),
            description=description.strip() if description else "",
            refund_amount=refund_amount,
            status=OrderReturnRequest.ReturnStatus.PENDING,
        )

        item.status = OrderItem.ItemStatus.RETURN_REQUESTED
        item.save(update_fields=["status"])

        return return_req

    @classmethod
    @transaction.atomic
    def request_return(cls, user, order_id, reason, description=None):
        
        if not reason or not str(reason).strip():
            raise ValidationError({"reason": "Return reason is mandatory."})

        try:
            order = Order.objects.select_for_update().get(id=order_id, user=user)
        except Order.DoesNotExist:
            raise ValidationError("Order not found or unauthorized.")

        if order.order_status != Order.OrderStatus.DELIVERED:
            raise ValidationError("Return requests can only be submitted for delivered orders.")

        if OrderReturnRequest.objects.filter(order=order, order_item__isnull=True).exists():
            raise ValidationError("A return request has already been submitted for this order.")

        return_req = OrderReturnRequest.objects.create(
            order=order,
            user=user,
            reason=reason.strip(),
            description=description.strip() if description else "",
            status=OrderReturnRequest.ReturnStatus.PENDING,
        )

        order.order_status = Order.OrderStatus.RETURN_REQUESTED
        order.save(update_fields=["order_status", "updated_at"])

        return return_req

    @classmethod
    def generate_invoice_pdf(cls, user, order_id):
        
        try:
            order = Order.objects.prefetch_related("items").get(id=order_id, user=user)
        except Order.DoesNotExist:
            raise PermissionDenied("Order not found or unauthorized access.")

        try:
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(
                buffer,
                pagesize=letter,
                rightMargin=36,
                leftMargin=36,
                topMargin=36,
                bottomMargin=36
            )
            styles = getSampleStyleSheet()

            brand_title = ParagraphStyle(
                'BrandTitle',
                parent=styles['Heading1'],
                fontName='Helvetica-Bold',
                fontSize=22,
                leading=26,
                textColor=colors.HexColor('#4f46e5'),
                spaceAfter=2
            )
            brand_sub = ParagraphStyle(
                'BrandSub',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=9.5,
                leading=13,
                textColor=colors.HexColor('#64748b')
            )
            invoice_title = ParagraphStyle(
                'InvoiceTitle',
                parent=styles['Heading1'],
                fontName='Helvetica-Bold',
                fontSize=26,
                leading=30,
                alignment=2,
                textColor=colors.HexColor('#0f172a'),
                spaceAfter=4
            )
            invoice_meta_right = ParagraphStyle(
                'InvoiceMetaRight',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=9.5,
                leading=14,
                alignment=2,
                textColor=colors.HexColor('#475569')
            )

            section_head = ParagraphStyle(
                'SectionHead',
                parent=styles['Normal'],
                fontName='Helvetica-Bold',
                fontSize=11,
                leading=15,
                textColor=colors.HexColor('#4f46e5'),
                spaceAfter=6
            )
            card_text = ParagraphStyle(
                'CardText',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=9.5,
                leading=14,
                textColor=colors.HexColor('#1e293b')
            )

            th_style = ParagraphStyle(
                'THStyle',
                parent=styles['Normal'],
                fontName='Helvetica-Bold',
                fontSize=9.5,
                leading=13,
                textColor=colors.HexColor('#334155')
            )
            tb_style = ParagraphStyle(
                'TBStyle',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=9,
                leading=13,
                textColor=colors.HexColor('#0f172a')
            )
            tb_muted = ParagraphStyle(
                'TBMuted',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=8.5,
                leading=12,
                textColor=colors.HexColor('#64748b')
            )

            total_lbl = ParagraphStyle(
                'TotalLbl',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=10,
                leading=14,
                alignment=2,
                textColor=colors.HexColor('#475569')
            )
            total_val = ParagraphStyle(
                'TotalVal',
                parent=styles['Normal'],
                fontName='Helvetica-Bold',
                fontSize=10,
                leading=14,
                alignment=2,
                textColor=colors.HexColor('#0f172a')
            )
            grand_total_lbl = ParagraphStyle(
                'GrandTotalLbl',
                parent=styles['Normal'],
                fontName='Helvetica-Bold',
                fontSize=12,
                leading=16,
                alignment=2,
                textColor=colors.HexColor('#4f46e5')
            )
            grand_total_val = ParagraphStyle(
                'GrandTotalVal',
                parent=styles['Normal'],
                fontName='Helvetica-Bold',
                fontSize=16,
                leading=20,
                alignment=2,
                textColor=colors.HexColor('#4f46e5')
            )

            elements = []

            # Clean ASCII sanitized text
            clean_num = order.order_number.encode('ascii', 'ignore').decode('ascii')
            clean_name = order.shipping_name.encode('ascii', 'ignore').decode('ascii') or "Customer"
            clean_addr1 = (order.shipping_address_line1 or "").encode('ascii', 'ignore').decode('ascii')
            clean_city = (order.shipping_city or "").encode('ascii', 'ignore').decode('ascii')
            clean_state = (order.shipping_state or "").encode('ascii', 'ignore').decode('ascii')

            # 1. Header Banner Table
            left_header = [
                Paragraph("TOY STORE", brand_title),
                Paragraph("Premium Collectibles & Toys Store", ParagraphStyle('Tagline', parent=brand_sub, fontName='Helvetica-Bold', textColor=colors.HexColor('#475569'))),
                Paragraph("123 Playtime Lane, Brick City, CA 90210<br/>Support: support@toystore.com | www.toystore.com", brand_sub),
            ]
            right_header = [
                Paragraph("INVOICE", invoice_title),
                Paragraph(f"<b>Invoice #:</b> INV-{clean_num}<br/><b>Order #:</b> {clean_num}<br/><b>Date:</b> {order.created_at.strftime('%B %d, %Y')}", invoice_meta_right),
            ]
            t_header = Table([[left_header, right_header]], colWidths=[310, 230])
            t_header.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
            ]))
            elements.append(t_header)
            elements.append(Spacer(1, 14))

            # Indigo Gradient Divider Line
            elements.append(HRFlowable(width="100%", thickness=2.5, color=colors.HexColor('#4f46e5'), spaceBefore=0, spaceAfter=16))

            # 2. Shipping & Order Info Cards
            addr_lines = [f"<b>{clean_name}</b>", clean_addr1]
            if order.shipping_address_line2:
                addr_lines.append(order.shipping_address_line2.encode('ascii', 'ignore').decode('ascii'))
            addr_lines.append(f"{clean_city}, {clean_state} - {order.shipping_postal_code}, {order.shipping_country}")
            if order.shipping_phone:
                addr_lines.append(f"Phone: {order.shipping_phone}")

            bill_to_content = [
                Paragraph("SHIPPING & BILLED TO", section_head),
                Paragraph("<br/>".join(addr_lines), card_text),
            ]

            order_info_content = [
                Paragraph("ORDER INFORMATION", section_head),
                Paragraph(f"<b>Payment Method:</b> {order.get_payment_method_display()}", card_text),
                Paragraph(f"<b>Payment Status:</b> <font color='#10b981'><b>{order.get_payment_status_display()}</b></font>", card_text),
                Paragraph(f"<b>Order Status:</b> {order.get_order_status_display()}", card_text),
                Paragraph(f"<b>Shipping Amount:</b> Rs. {order.shipping_fee:.2f}" if order.shipping_fee != 0 else "<b>Shipping Type:</b> Express Delivery (FREE)", card_text),
                # Paragraph(f"<b>Shipping Type:</b> Express Delivery", card_text),
                
            ]

            t_cards = Table([[bill_to_content, order_info_content]], colWidths=[260, 260])
            t_cards.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BACKGROUND', (0,0), (0,0), colors.HexColor('#f8fafc')),
                ('BACKGROUND', (1,0), (1,0), colors.HexColor('#f8fafc')),
                ('BOX', (0,0), (0,0), 0.5, colors.HexColor('#e2e8f0')),
                ('BOX', (1,0), (1,0), 0.5, colors.HexColor('#e2e8f0')),
                ('TOPPADDING', (0,0), (-1,-1), 12),
                ('BOTTOMPADDING', (0,0), (-1,-1), 12),
                ('LEFTPADDING', (0,0), (-1,-1), 14),
                ('RIGHTPADDING', (0,0), (-1,-1), 14),
            ]))
            elements.append(t_cards)
            elements.append(Spacer(1, 20))

            # 3. Products Table
            table_data = [[
                Paragraph("PRODUCT DETAILS", th_style),
                Paragraph("VARIANT / EDITION", th_style),
                Paragraph("UNIT PRICE", ParagraphStyle('RHead', parent=th_style, alignment=2)),
                Paragraph("QTY", ParagraphStyle('CHead', parent=th_style, alignment=1)),
                Paragraph("LINE TOTAL", ParagraphStyle('RHead2', parent=th_style, alignment=2)),
            ]]

            items_list = list(order.items.all())
            for idx, item in enumerate(items_list):
                p_name = item.product_name.encode('ascii', 'ignore').decode('ascii') or "Product"
                v_name = item.variant_name.encode('ascii', 'ignore').decode('ascii') or "Default"
                sku_str = f"SKU: {item.sku}" if item.sku else ""
                is_item_cancelled = item.status == OrderItem.ItemStatus.CANCELLED or order.order_status == Order.OrderStatus.CANCELLED

                prod_cell = [
                    Paragraph(f"<b>{p_name}</b>" + (" <font color='#ef4444'><b>[CANCELLED]</b></font>" if is_item_cancelled else ""), tb_style),
                ]
                if sku_str:
                    prod_cell.append(Paragraph(sku_str, tb_muted))
                if is_item_cancelled and item.cancellation_reason:
                    c_reason = item.cancellation_reason.encode('ascii', 'ignore').decode('ascii')
                    prod_cell.append(Paragraph(f"<font color='#ef4444'>Reason: {c_reason}</font>", tb_muted))

                price_str = f"<s>Rs. {item.price:.2f}</s>" if is_item_cancelled else f"Rs. {item.price:.2f}"
                line_total_str = f"<font color='#ef4444'><b>CANCELLED</b></font>" if is_item_cancelled else f"<b>Rs. {item.line_total:.2f}</b>"

                table_data.append([
                    prod_cell,
                    Paragraph(v_name + (" <font color='#ef4444'>(Cancelled)</font>" if is_item_cancelled else ""), tb_muted),
                    Paragraph(price_str, ParagraphStyle('RCell', parent=tb_style, alignment=2)),
                    Paragraph(str(item.quantity), ParagraphStyle('CCell', parent=tb_style, alignment=1)),
                    Paragraph(line_total_str, ParagraphStyle('RCellBold', parent=tb_style, alignment=2)),
                ])

            t_items = Table(table_data, colWidths=[200, 130, 70, 45, 95])
            
            t_style_cmds = [
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#eef2ff')),
                ('BOTTOMPADDING', (0,0), (-1,0), 8),
                ('TOPPADDING', (0,0), (-1,0), 8),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('BOTTOMPADDING', (0,1), (-1,-1), 8),
                ('TOPPADDING', (0,1), (-1,-1), 8),
                ('LEFTPADDING', (0,0), (-1,-1), 10),
                ('RIGHTPADDING', (0,0), (-1,-1), 10),
                ('LINEBELOW', (0,0), (-1,0), 1.5, colors.HexColor('#6366f1')),
            ]

            for i in range(1, len(items_list) + 1):
                bg_color = colors.HexColor('#ffffff') if i % 2 != 0 else colors.HexColor('#fafafa')
                t_style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg_color))
                t_style_cmds.append(('LINEBELOW', (0, i), (-1, i), 0.5, colors.HexColor('#f1f5f9')))

            t_items.setStyle(TableStyle(t_style_cmds))
            elements.append(t_items)
            elements.append(Spacer(1, 16))

            # 4. Pricing Breakdown & Grand Total Card
            totals_data = [
                [Paragraph("Subtotal:", total_lbl), Paragraph(f"Rs. {order.subtotal:.2f}", total_val)],
            ]
            if order.discount_amount > 0:
                totals_data.append([
                    Paragraph("Discount Savings:", total_lbl),
                    Paragraph(f"-Rs. {order.discount_amount:.2f}", ParagraphStyle('DiscVal', parent=total_val, textColor=colors.HexColor('#10b981'))),
                ])

            shipping_display = (
                Paragraph("FREE", ParagraphStyle('FreeVal', parent=total_val, textColor=colors.HexColor('#10b981')))
                if order.shipping_fee == 0
                else Paragraph(f"Rs. {order.shipping_fee:.2f}", total_val)
            )
            totals_data.append([
                Paragraph("Shipping Fee:", total_lbl),
                shipping_display,
            ])
            totals_data.append([
                Paragraph("<b>GRAND TOTAL:</b>", grand_total_lbl),
                Paragraph(f"<b>Rs. {order.total_amount:.2f}</b>", grand_total_val),
            ])

            t_totals = Table(totals_data, colWidths=[140, 110])
            t_totals.setStyle(TableStyle([
                ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 5),
                ('TOPPADDING', (0,0), (-1,-1), 5),
                ('LINEABOVE', (0, -1), (-1, -1), 1.5, colors.HexColor('#4f46e5')),
                ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#eef2ff')),
                ('BOTTOMPADDING', (0, -1), (-1, -1), 8),
                ('TOPPADDING', (0, -1), (-1, -1), 8),
            ]))

            t_wrapper = Table([[Paragraph("", card_text), t_totals]], colWidths=[290, 250])
            t_wrapper.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('ALIGN', (1,0), (1,0), 'RIGHT'),
            ]))
            elements.append(t_wrapper)
            elements.append(Spacer(1, 24))

            # 5. Footer Banner
            elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceBefore=0, spaceAfter=14))
            elements.append(Paragraph("<b>Thank you for shopping with Toy Store! 🎁</b>", ParagraphStyle('FootTitle', parent=styles['Normal'], alignment=1, fontName='Helvetica-Bold', fontSize=10.5, textColor=colors.HexColor('#0f172a'))))
            elements.append(Paragraph("For support or returns, visit <u>www.toystore.com</u> or contact <u>support@toystore.com</u>", ParagraphStyle('FootSub', parent=styles['Normal'], alignment=1, fontSize=8.5, leading=12, textColor=colors.HexColor('#64748b'))))

            doc.build(elements)
            pdf_data = buffer.getvalue()
            buffer.close()

            response = HttpResponse(pdf_data, content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename="Invoice_{order.order_number}.pdf"'
            return response

        except Exception:
            # 2. Dynamic Byte-Calculated ASCII PDF 1.4 Stream Fallback
            pdf = io.BytesIO()
            pdf.write(b"%PDF-1.4\n")
            
            offsets = []
            
            def write_obj(num, content):
                offsets.append(pdf.tell())
                pdf.write(f"{num} 0 obj\n".encode("ascii"))
                pdf.write(content)
                pdf.write(b"\nendobj\n")

            write_obj(1, b"<< /Type /Catalog /Pages 2 0 R >>")
            write_obj(2, b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
            write_obj(3, b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>")
            write_obj(4, b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
            
            def clean_str(val):
                return str(val or "").encode('ascii', 'ignore').decode('ascii')

            lines = [
                "TOY STORE COLLECTIBLES - INVOICE",
                "========================================================",
                f"Invoice No     : INV-{clean_str(order.order_number)}",
                f"Order Number   : {clean_str(order.order_number)}",
                f"Order Date     : {order.created_at.strftime('%B %d, %Y %H:%M')}",
                f"Customer Name  : {clean_str(order.shipping_name)}",
                f"Contact Phone  : {clean_str(order.shipping_phone) or 'N/A'}",
                f"Shipping Addr  : {clean_str(order.shipping_address_line1)}, {clean_str(order.shipping_city)}",
                f"Payment Method : {clean_str(order.get_payment_method_display())}",
                f"Payment Status : {clean_str(order.get_payment_status_display())}",
                f"Order Status   : {clean_str(order.get_order_status_display())}",
                "--------------------------------------------------------",
                "ORDERED ITEMS:",
            ]
            for item in order.items.all():
                pname = clean_str(item.product_name)
                vname = clean_str(item.variant_name)
                is_item_cancelled = item.status == OrderItem.ItemStatus.CANCELLED or order.order_status == Order.OrderStatus.CANCELLED
                status_tag = " [CANCELLED]" if is_item_cancelled else ""
                lines.append(f" - {pname} ({vname}){status_tag}")
                if is_item_cancelled:
                    c_reason = clean_str(item.cancellation_reason or "Cancelled")
                    lines.append(f"   Qty: {item.quantity}  |  Price: Rs. {item.price:.2f}  |  STATUS: CANCELLED ({c_reason})")
                else:
                    lines.append(f"   Qty: {item.quantity}  |  Price: Rs. {item.price:.2f}  |  Line Total: Rs. {item.line_total:.2f}")

            lines.extend([
                "--------------------------------------------------------",
                f"Subtotal       : Rs. {order.subtotal:.2f}",
                f"Shipping Fee   : Rs. {order.shipping_fee:.2f}",
                f"Grand Total    : Rs. {order.total_amount:.2f}",
                "========================================================",
                "Thank you for shopping with Toy Store!",
            ])

            stream_lines = ["BT", "/F1 11 Tf", "14 TL", "36 750 Td"]
            for line in lines:
                safe_line = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
                stream_lines.append(f"({safe_line}) '")
            stream_lines.append("ET")
            
            stream_content = "\n".join(stream_lines).encode("ascii", "ignore")
            
            write_obj(5, f"<< /Length {len(stream_content)} >>\nstream\n".encode("ascii") + stream_content + b"\nendstream")

            start_xref = pdf.tell()
            pdf.write(f"xref\n0 {len(offsets) + 1}\n".encode("ascii"))
            pdf.write(b"0000000000 65535 f \n")
            for off in offsets:
                pdf.write(f"{off:010d} 00000 n \n".encode("ascii"))
            
            pdf.write(f"trailer\n<< /Size {len(offsets) + 1} /Root 1 0 R >>\n".encode("ascii"))
            pdf.write(f"startxref\n{start_xref}\n%%EOF\n".encode("ascii"))

            pdf_data = pdf.getvalue()
            pdf.close()

            response = HttpResponse(pdf_data, content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename="Invoice_{order.order_number}.pdf"'
            return response
