from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta

from apps.products.models import Category, Product, ProductVariant
from apps.offers.models import ProductOffer, CategoryOffer, DiscountType
from apps.offers.services import PricingService
from apps.offers.admins.services import OfferService


class OfferPrecedenceTestCase(TestCase):

    def setUp(self):
        self.category = Category.objects.create(
            name="Action Toys",
            description="Remote controlled & action toys",
            is_active=True,
        )
        self.product = Product.objects.create(
            category=self.category,
            name="Turbo Racing Car",
            description="High speed RC car",
            brand="HotWheels",
            is_active=True,
            blocked=False,
        )
        self.variant = ProductVariant.objects.create(
            product=self.product,
            variant_name="Red Flash",
            sku="TURBO-RED-001",
            price=Decimal("1000.00"),
            stock_quantity=10,
            is_active=True,
            blocked=False,
        )
        self.now = timezone.now()
        self.start_date = self.now - timedelta(days=1)
        self.end_date = self.now + timedelta(days=7)

    def test_both_product_and_category_offers_can_be_created(self):
        # Create Category Offer (20% off)
        cat_offer = OfferService.create_category_offer(
            category_id=self.category.id,
            discount_type=DiscountType.PERCENTAGE,
            discount_value=Decimal("20.00"),
            start_date=self.start_date,
            end_date=self.end_date,
        )
        self.assertIsNotNone(cat_offer)

        # Create Product Offer (30% off) for the same product
        prod_offer = OfferService.create_product_offer(
            product_id=self.product.id,
            discount_type=DiscountType.PERCENTAGE,
            discount_value=Decimal("30.00"),
            start_date=self.start_date,
            end_date=self.end_date,
        )
        self.assertIsNotNone(prod_offer)

        # Ensure both exist concurrently in database
        self.assertEqual(CategoryOffer.objects.filter(category=self.category).count(), 1)
        self.assertEqual(ProductOffer.objects.filter(product=self.product).count(), 1)

    def test_highest_discount_applied_when_product_offer_is_higher(self):
        # Category offer: 15% off (150 discount)
        OfferService.create_category_offer(
            category_id=self.category.id,
            discount_type=DiscountType.PERCENTAGE,
            discount_value=Decimal("15.00"),
            start_date=self.start_date,
            end_date=self.end_date,
        )
        # Product offer: 30% off (300 discount)
        OfferService.create_product_offer(
            product_id=self.product.id,
            discount_type=DiscountType.PERCENTAGE,
            discount_value=Decimal("30.00"),
            start_date=self.start_date,
            end_date=self.end_date,
        )

        best_offer = PricingService.get_best_offer_for_product(self.product, base_price=Decimal("1000.00"))
        self.assertIsNotNone(best_offer)
        self.assertEqual(best_offer["offer_type"], "PRODUCT")
        self.assertEqual(best_offer["discount_amount"], Decimal("300.00"))

        price_info = PricingService.calculate_variant_price(self.variant)
        self.assertTrue(price_info["has_offer"])
        self.assertEqual(price_info["offer_price"], Decimal("700.00"))
        self.assertEqual(price_info["discount_percentage"], 30)

    def test_highest_discount_applied_when_category_offer_is_higher(self):
        # Category offer: 40% off (400 discount)
        OfferService.create_category_offer(
            category_id=self.category.id,
            discount_type=DiscountType.PERCENTAGE,
            discount_value=Decimal("40.00"),
            start_date=self.start_date,
            end_date=self.end_date,
        )
        # Product offer: 25% off (250 discount)
        OfferService.create_product_offer(
            product_id=self.product.id,
            discount_type=DiscountType.PERCENTAGE,
            discount_value=Decimal("25.00"),
            start_date=self.start_date,
            end_date=self.end_date,
        )

        best_offer = PricingService.get_best_offer_for_product(self.product, base_price=Decimal("1000.00"))
        self.assertIsNotNone(best_offer)
        self.assertEqual(best_offer["offer_type"], "CATEGORY")
        self.assertEqual(best_offer["discount_amount"], Decimal("400.00"))

        price_info = PricingService.calculate_variant_price(self.variant)
        self.assertTrue(price_info["has_offer"])
        self.assertEqual(price_info["offer_price"], Decimal("600.00"))
        self.assertEqual(price_info["discount_percentage"], 40)

