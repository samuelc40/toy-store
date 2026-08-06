from django.urls import path
from apps.orders.customers.views import (
    CheckoutAPIView,
    PlaceOrderAPIView,
    OrderListAPIView,
    OrderDetailAPIView,
    CancelOrderAPIView,
    CancelOrderItemAPIView,
    ReturnOrderAPIView,
    DownloadInvoiceAPIView,
)

urlpatterns = [
    # Checkout Endpoints
    path("checkout/", CheckoutAPIView.as_view(), name="customer_checkout"),
    path("checkout/place-order/", PlaceOrderAPIView.as_view(), name="customer_place_order"),
    path("checkout/orders/<uuid:order_id>/", OrderDetailAPIView.as_view(), name="customer_order_checkout_detail"),

    # Order Management Endpoints
    path("orders/", OrderListAPIView.as_view(), name="customer_order_list"),
    path("orders/<uuid:order_id>/", OrderDetailAPIView.as_view(), name="customer_order_detail"),
    path("orders/<uuid:order_id>/cancel/", CancelOrderAPIView.as_view(), name="customer_cancel_order"),
    path("orders/items/<uuid:item_id>/cancel/", CancelOrderItemAPIView.as_view(), name="customer_cancel_order_item"),
    path("orders/<uuid:order_id>/return/", ReturnOrderAPIView.as_view(), name="customer_return_order"),
    path("orders/<uuid:order_id>/invoice/", DownloadInvoiceAPIView.as_view(), name="customer_download_invoice"),
]
