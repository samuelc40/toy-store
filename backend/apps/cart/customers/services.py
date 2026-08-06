from django.core.exceptions import ValidationError
from django.db import transaction
from apps.cart.models import Cart, CartItem
from apps.products.models import ProductVariant


class CustomerCartService:

    @staticmethod
    def get_or_create_cart(user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    @classmethod
    def validate_checkout_eligibility(cls, user):
        cart = cls.get_or_create_cart(user)
        items = cart.items.select_related("variant", "variant__product").all()
        
        if not items.exists():
            raise ValidationError("Your cart is empty.")

        blocked_items = []
        for item in items:
            v = item.variant
            if not v or getattr(v, "blocked", False) or not getattr(v, "is_active", True):
                name = v.variant_name if v else "Unavailable item"
                blocked_items.append(name)
                continue
            
            p = getattr(v, "product", None)
            if p and (getattr(p, "blocked", False) or not getattr(p, "is_active", True)):
                name = p.name if p else "Unavailable product"
                blocked_items.append(name)

        if blocked_items:
            names = ", ".join(list(set(blocked_items)))
            raise ValidationError(
                f"Your cart contains unavailable or blocked items ({names}). Please remove them to proceed to checkout."
            )
        return True

    @classmethod
    @transaction.atomic
    def add_item_to_cart(cls, user, variant_id, quantity):
        if quantity <= 0:
            raise ValidationError("Quantity must be at least 1.")
        
        # 1. Fetch variant and validate status
        try:
            variant = ProductVariant.objects.select_related("product").get(id=variant_id)
        except ProductVariant.DoesNotExist:
            raise ValidationError("This variant does not exist.")

        if not variant.is_active or variant.blocked:
            raise ValidationError("This variant is currently unavailable.")
        
        if not variant.product.is_active or variant.product.blocked:
            raise ValidationError("This product is currently unavailable.")

        if variant.stock_quantity <= 0:
            raise ValidationError("This variant is out of stock.")

        cart = cls.get_or_create_cart(user)
        
        # 2. Check if item already exists in cart
        try:
            item = CartItem.objects.get(cart=cart, variant=variant)
            new_quantity = item.quantity + quantity
        except CartItem.DoesNotExist:
            item = None
            new_quantity = quantity

        # 3. Validate stock constraints and max quantity limit (10)
        if new_quantity > 10:
            raise ValidationError("Maximum quantity of 10 reached for this item.")
        
        if new_quantity > variant.stock_quantity:
            raise ValidationError(f"Only {variant.stock_quantity} items are available in stock.")

        if item:
            item.quantity = new_quantity
            item.save()
        else:
            item = CartItem.objects.create(cart=cart, variant=variant, quantity=new_quantity)

        # 4. Remove corresponding product from user's wishlist if present
        try:
            from apps.wishlists.models import WishlistItem
            WishlistItem.objects.filter(user=user, product=variant.product).delete()
        except Exception:
            pass

        return item

    @classmethod
    def update_cart_item(cls, user, item_id, quantity=None, action=None):
        try:
            item = CartItem.objects.select_related("cart", "variant", "variant__product").get(
                id=item_id, cart__user=user
            )
        except CartItem.DoesNotExist:
            raise ValidationError("Item not found in cart.")

        # Validate variant availability
        variant = item.variant
        if not variant or variant.blocked or not variant.is_active or not variant.product or variant.product.blocked or not variant.product.is_active:
            raise ValidationError("This item is no longer available. Please remove it from your cart.")

        # Determine new quantity
        if action == "increment":
            new_quantity = item.quantity + 1
        elif action == "decrement":
            new_quantity = item.quantity - 1
        elif quantity is not None:
            new_quantity = int(quantity)
        else:
            raise ValidationError("Provide either quantity or action (increment/decrement).")

        # Automatically delete if quantity becomes <= 0
        if new_quantity <= 0:
            item.delete()
            return None

        # Validate limits
        if new_quantity > 10:
            raise ValidationError("Maximum quantity of 10 reached for this item.")
        
        if new_quantity > variant.stock_quantity:
            raise ValidationError(f"Only {variant.stock_quantity} items are available in stock.")

        item.quantity = new_quantity
        item.save()
        return item

    @staticmethod
    def remove_cart_item(user, item_id):
        try:
            item = CartItem.objects.filter(id=item_id, cart__user=user)
            if not item.exists():
                raise ValidationError("Item not found in cart.")
            item.delete()
        except Exception:
            raise ValidationError("Failed to remove item from cart.")

    @classmethod
    def clear_cart(cls, user):
        cart = cls.get_or_create_cart(user)
        cart.items.all().delete()
