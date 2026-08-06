from django.db.models import Prefetch, Q
from apps.accounts.models import Address
from apps.cart.customers.selectors import CustomerCartSelector
from apps.orders.models import Order, OrderItem, OrderReturnRequest


class CustomerOrderSelector:

    @staticmethod
    def get_user_addresses(user):
        return Address.objects.filter(user=user).order_by("-is_default", "-created_at")

    @staticmethod
    def get_checkout_data(user):
        addresses = CustomerOrderSelector.get_user_addresses(user)
        default_address = addresses.filter(is_default=True).first() or addresses.first()
        cart = CustomerCartSelector.get_cart_for_user(user)

        return {
            "addresses": addresses,
            "selected_address_id": str(default_address.id) if default_address else None,
            "cart": cart,
        }

    @staticmethod
    def get_order_by_id(user, order_id):
        """
        Retrieve a single order by ID for the authenticated user with pre-fetched items & return requests.
        Enforces customer ownership security.
        """
        try:
            items_prefetch = Prefetch(
                "items",
                queryset=OrderItem.objects.select_related("product", "variant")
            )
            returns_prefetch = Prefetch(
                "return_requests",
                queryset=OrderReturnRequest.objects.order_by("-requested_at")
            )

            return (
                Order.objects.filter(user=user, id=order_id)
                .prefetch_related(items_prefetch, returns_prefetch)
                .first()
            )
        except Exception:
            return None

    @staticmethod
    def get_orders_for_user(user, search=None, status_filter=None):
        """
        Retrieve order listing for the authenticated user with optional debounced search & status filtering.
        """
        queryset = Order.objects.filter(user=user)

        if status_filter and status_filter.upper() != "ALL":
            queryset = queryset.filter(order_status=status_filter.upper())

        if search:
            search_clean = search.strip()
            queryset = queryset.filter(
                Q(order_number__icontains=search_clean) |
                Q(items__product_name__icontains=search_clean) |
                Q(items__variant_name__icontains=search_clean)
            ).distinct()

        items_prefetch = Prefetch(
            "items",
            queryset=OrderItem.objects.select_related("product", "variant")
        )
        returns_prefetch = Prefetch(
            "return_requests",
            queryset=OrderReturnRequest.objects.order_by("-requested_at")
        )

        return queryset.prefetch_related(items_prefetch, returns_prefetch).order_by("-created_at")
