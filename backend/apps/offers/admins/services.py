from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.products.models import Product, Category, ProductVariant
from apps.offers.models import ProductOffer, CategoryOffer, ReferralOffer, DiscountType
from apps.offers.admins.selectors import AdminOfferSelector


class OfferService:

    # --------------------------------------------------------------------------
    # PRODUCT OFFERS BUSINESS LOGIC
    # --------------------------------------------------------------------------
    @classmethod
    def validate_product_offer(cls, product, discount_type, discount_value, start_date, end_date, offer_id=None):
        discount_value = Decimal(str(discount_value))
        if discount_value <= Decimal("0.00"):
            raise ValidationError({"discount_value": "Discount value must be greater than zero."})

        if discount_type == DiscountType.PERCENTAGE:
            if discount_value > Decimal("100.00"):
                raise ValidationError({"discount_value": "Percentage discount cannot exceed 100%."})
        elif discount_type == DiscountType.FLAT:
            # Check minimum price among active product variants
            variants = ProductVariant.objects.filter(product=product, is_active=True)
            if variants.exists():
                min_price = min(v.sale_price if v.sale_price else v.price for v in variants)
                if discount_value >= min_price:
                    raise ValidationError({
                        "discount_value": f"Flat discount (Rs. {discount_value}) must be less than product minimum variant price (Rs. {min_price})."
                    })

        if start_date >= end_date:
            raise ValidationError({"end_date": "End date must be strictly after start date."})

        if not product.is_active or product.blocked:
            raise ValidationError({"product": f"Cannot create offer for inactive or blocked product '{product.name}'."})

        # Check overlapping active offers for the same product
        query = ProductOffer.objects.filter(
            product=product,
            is_active=True,
            start_date__lt=end_date,
            end_date__gt=start_date,
        )
        if offer_id:
            query = query.exclude(id=offer_id)

        if query.exists():
            raise ValidationError({
                "product": f"An active offer already exists for product '{product.name}' in the selected date range."
            })

    @classmethod
    @transaction.atomic
    def create_product_offer(cls, product_id, discount_type, discount_value, start_date, end_date, is_active=True):
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            raise ValidationError({"product_id": "Selected product does not exist."})

        cls.validate_product_offer(product, discount_type, discount_value, start_date, end_date)

        offer = ProductOffer.objects.create(
            product=product,
            discount_type=discount_type,
            discount_value=discount_value,
            start_date=start_date,
            end_date=end_date,
            is_active=is_active,
        )
        return offer

    @classmethod
    @transaction.atomic
    def update_product_offer(cls, offer_id, **data):
        offer = AdminOfferSelector.get_product_offer_by_id(offer_id)
        if not offer:
            raise ValidationError({"offer_id": "Product offer not found."})

        product = data.get("product", offer.product)
        discount_type = data.get("discount_type", offer.discount_type)
        discount_value = data.get("discount_value", offer.discount_value)
        start_date = data.get("start_date", offer.start_date)
        end_date = data.get("end_date", offer.end_date)
        is_active = data.get("is_active", offer.is_active)

        if is_active:
            cls.validate_product_offer(product, discount_type, discount_value, start_date, end_date, offer_id=offer.id)

        offer.product = product
        offer.discount_type = discount_type
        offer.discount_value = discount_value
        offer.start_date = start_date
        offer.end_date = end_date
        offer.is_active = is_active
        offer.save()
        return offer

    @classmethod
    @transaction.atomic
    def delete_product_offer(cls, offer_id):
        offer = AdminOfferSelector.get_product_offer_by_id(offer_id)
        if not offer:
            raise ValidationError({"offer_id": "Product offer not found."})
        offer.delete()
        return True

    # --------------------------------------------------------------------------
    # CATEGORY OFFERS BUSINESS LOGIC
    # --------------------------------------------------------------------------
    @classmethod
    def validate_category_offer(cls, category, discount_type, discount_value, start_date, end_date, offer_id=None):
        discount_value = Decimal(str(discount_value))
        if discount_value <= Decimal("0.00"):
            raise ValidationError({"discount_value": "Discount value must be greater than zero."})

        if discount_type == DiscountType.PERCENTAGE:
            if discount_value > Decimal("100.00"):
                raise ValidationError({"discount_value": "Percentage discount cannot exceed 100%."})

        if start_date >= end_date:
            raise ValidationError({"end_date": "End date must be strictly after start date."})

        if not category.is_active:
            raise ValidationError({"category": f"Cannot create offer for inactive category '{category.name}'."})

        # Check overlapping active offers for the same category
        query = CategoryOffer.objects.filter(
            category=category,
            is_active=True,
            start_date__lt=end_date,
            end_date__gt=start_date,
        )
        if offer_id:
            query = query.exclude(id=offer_id)

        if query.exists():
            raise ValidationError({
                "category": f"An active offer already exists for category '{category.name}' in the selected date range."
            })

    @classmethod
    @transaction.atomic
    def create_category_offer(cls, category_id, discount_type, discount_value, start_date, end_date, is_active=True):
        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            raise ValidationError({"category_id": "Selected category does not exist."})

        cls.validate_category_offer(category, discount_type, discount_value, start_date, end_date)

        offer = CategoryOffer.objects.create(
            category=category,
            discount_type=discount_type,
            discount_value=discount_value,
            start_date=start_date,
            end_date=end_date,
            is_active=is_active,
        )
        return offer

    @classmethod
    @transaction.atomic
    def update_category_offer(cls, offer_id, **data):
        offer = AdminOfferSelector.get_category_offer_by_id(offer_id)
        if not offer:
            raise ValidationError({"offer_id": "Category offer not found."})

        category = data.get("category", offer.category)
        discount_type = data.get("discount_type", offer.discount_type)
        discount_value = data.get("discount_value", offer.discount_value)
        start_date = data.get("start_date", offer.start_date)
        end_date = data.get("end_date", offer.end_date)
        is_active = data.get("is_active", offer.is_active)

        if is_active:
            cls.validate_category_offer(category, discount_type, discount_value, start_date, end_date, offer_id=offer.id)

        offer.category = category
        offer.discount_type = discount_type
        offer.discount_value = discount_value
        offer.start_date = start_date
        offer.end_date = end_date
        offer.is_active = is_active
        offer.save()
        return offer

    @classmethod
    @transaction.atomic
    def delete_category_offer(cls, offer_id):
        offer = AdminOfferSelector.get_category_offer_by_id(offer_id)
        if not offer:
            raise ValidationError({"offer_id": "Category offer not found."})
        offer.delete()
        return True

    # --------------------------------------------------------------------------
    # REFERRAL OFFER CONFIGURATION LOGIC
    # --------------------------------------------------------------------------
    @classmethod
    def get_referral_config(cls):
        return AdminOfferSelector.get_referral_config()

    @classmethod
    @transaction.atomic
    def update_referral_config(cls, **data):
        config = AdminOfferSelector.get_referral_config()

        referrer_bonus = data.get("referrer_bonus", config.referrer_bonus)
        new_user_bonus = data.get("new_user_bonus", config.new_user_bonus)
        minimum_order_amount = data.get("minimum_order_amount", config.minimum_order_amount)
        is_active = data.get("is_active", config.is_active)

        if Decimal(str(referrer_bonus)) < Decimal("0.00"):
            raise ValidationError({"referrer_bonus": "Referrer bonus cannot be negative."})
        if Decimal(str(new_user_bonus)) < Decimal("0.00"):
            raise ValidationError({"new_user_bonus": "New user bonus cannot be negative."})
        if Decimal(str(minimum_order_amount)) < Decimal("0.00"):
            raise ValidationError({"minimum_order_amount": "Minimum order amount cannot be negative."})

        config.referrer_bonus = referrer_bonus
        config.new_user_bonus = new_user_bonus
        config.minimum_order_amount = minimum_order_amount
        config.is_active = is_active
        config.save()
        return config

    # --------------------------------------------------------------------------
    # STATUS LIFECYCLE MANAGEMENT
    # --------------------------------------------------------------------------
    @classmethod
    @transaction.atomic
    def activate_offer(cls, offer_type, offer_id):
        if offer_type == "product":
            offer = AdminOfferSelector.get_product_offer_by_id(offer_id)
            if offer:
                cls.validate_product_offer(offer.product, offer.discount_type, offer.discount_value, offer.start_date, offer.end_date, offer_id=offer.id)
                offer.is_active = True
                offer.save(update_fields=["is_active", "updated_at"])
                return offer
        elif offer_type == "category":
            offer = AdminOfferSelector.get_category_offer_by_id(offer_id)
            if offer:
                cls.validate_category_offer(offer.category, offer.discount_type, offer.discount_value, offer.start_date, offer.end_date, offer_id=offer.id)
                offer.is_active = True
                offer.save(update_fields=["is_active", "updated_at"])
                return offer

        raise ValidationError({"offer_id": "Offer not found or invalid offer type."})

    @classmethod
    @transaction.atomic
    def deactivate_offer(cls, offer_type, offer_id):
        if offer_type == "product":
            offer = AdminOfferSelector.get_product_offer_by_id(offer_id)
            if offer:
                offer.is_active = False
                offer.save(update_fields=["is_active", "updated_at"])
                return offer
        elif offer_type == "category":
            offer = AdminOfferSelector.get_category_offer_by_id(offer_id)
            if offer:
                offer.is_active = False
                offer.save(update_fields=["is_active", "updated_at"])
                return offer

        raise ValidationError({"offer_id": "Offer not found or invalid offer type."})

