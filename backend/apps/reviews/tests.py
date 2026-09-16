import uuid
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.orders.models import Order, OrderItem
from apps.products.models import Category, Product, ProductVariant
from apps.reviews.models import ProductReview
from apps.reviews.selectors import ReviewSelector
from apps.reviews.services import ReviewService

User = get_user_model()


class ProductReviewTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        unique_str = uuid.uuid4().hex[:6]

        self.customer = User.objects.create_user(
            email=f"review_cust_{unique_str}@test.com",
            password="Password123!",
            first_name="Reviewer",
            last_name="User",
        )
        self.other_customer = User.objects.create_user(
            email=f"other_cust_{unique_str}@test.com",
            password="Password123!",
            first_name="Other",
            last_name="User",
        )
        self.admin = User.objects.create_superuser(
            email=f"review_admin_{unique_str}@test.com",
            password="Password123!",
            first_name="Admin",
            last_name="User",
        )

        self.category = Category.objects.create(name=f"Review Toys {unique_str}")
        self.product = Product.objects.create(
            category=self.category,
            name=f"Robot Toy {unique_str}",
            description="Fun robot toy",
        )
        self.variant = ProductVariant.objects.create(
            product=self.product,
            variant_name="Blue Robot",
            sku=f"SKU-{unique_str}",
            price=Decimal("1000.00"),
            sale_price=Decimal("800.00"),
            stock_quantity=50,
        )

        # Delivered order for self.customer
        self.delivered_order = Order.objects.create(
            user=self.customer,
            order_number=f"ORD-{unique_str}",
            order_status=Order.OrderStatus.DELIVERED,
            subtotal=Decimal("800.00"),
            total_amount=Decimal("800.00"),
            shipping_name="Reviewer User",
            shipping_phone="9876543210",
            shipping_address_line1="123 Test St",
            shipping_city="Test City",
            shipping_state="Test State",
            shipping_postal_code="123456",
        )
        self.delivered_item = OrderItem.objects.create(
            order=self.delivered_order,
            product=self.product,
            variant=self.variant,
            product_name="Robot Toy",
            variant_name="Blue Robot",
            sku=f"SKU-{unique_str}",
            price=Decimal("800.00"),
            line_total=Decimal("800.00"),
            quantity=1,
            status=OrderItem.ItemStatus.ACTIVE,
        )

    def test_eligible_customer_creates_review(self):
        self.client.force_authenticate(user=self.customer)
        url = f"/api/v1/customers/reviews/variants/{self.variant.id}/reviews/"
        response = self.client.post(
            url, {"rating": 5, "comment": "Amazing robot toy!"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["rating"], 5)
        self.assertEqual(response.data["data"]["comment"], "Amazing robot toy!")

    def test_unpurchased_variant_review_rejected(self):
        self.client.force_authenticate(user=self.other_customer)
        url = f"/api/v1/customers/reviews/variants/{self.variant.id}/reviews/"
        response = self.client.post(
            url, {"rating": 4, "comment": "I don't own this"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancelled_or_returned_item_review_rejected(self):
        self.delivered_item.status = OrderItem.ItemStatus.CANCELLED
        self.delivered_item.save()

        self.client.force_authenticate(user=self.customer)
        url = f"/api/v1/customers/reviews/variants/{self.variant.id}/reviews/"
        response = self.client.post(
            url, {"rating": 5, "comment": "Cancelled item"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_review_rejected(self):
        ReviewService.create_review(
            user=self.customer,
            variant_id=self.variant.id,
            rating=5,
            comment="First review",
        )

        self.client.force_authenticate(user=self.customer)
        url = f"/api/v1/customers/reviews/variants/{self.variant.id}/reviews/"
        response = self.client.post(
            url, {"rating": 4, "comment": "Second review attempt"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_customer_update_own_review(self):
        review = ReviewService.create_review(
            user=self.customer,
            variant_id=self.variant.id,
            rating=4,
            comment="Initial review",
        )

        self.client.force_authenticate(user=self.customer)
        url = f"/api/v1/customers/reviews/{review.id}/"
        response = self.client.patch(
            url, {"rating": 5, "comment": "Updated review text"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["rating"], 5)
        self.assertEqual(response.data["data"]["comment"], "Updated review text")

    def test_customer_cannot_update_other_user_review(self):
        review = ReviewService.create_review(
            user=self.customer,
            variant_id=self.variant.id,
            rating=5,
            comment="Customer review",
        )

        self.client.force_authenticate(user=self.other_customer)
        url = f"/api/v1/customers/reviews/{review.id}/"
        response = self.client.patch(
            url, {"rating": 1, "comment": "Hacked review"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_customer_delete_own_review(self):
        review = ReviewService.create_review(
            user=self.customer,
            variant_id=self.variant.id,
            rating=5,
            comment="Delete me",
        )

        self.client.force_authenticate(user=self.customer)
        url = f"/api/v1/customers/reviews/{review.id}/"
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(ProductReview.objects.filter(id=review.id).exists())

    def test_admin_toggle_visibility_hides_from_public(self):
        review = ReviewService.create_review(
            user=self.customer,
            variant_id=self.variant.id,
            rating=5,
            comment="Awesome item",
        )

        # Admin toggles is_visible=False
        self.client.force_authenticate(user=self.admin)
        admin_url = f"/api/v1/admin/reviews/{review.id}/"
        patch_res = self.client.patch(admin_url, {"is_visible": False}, format="json")
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)

        # Public list & statistics should exclude hidden review
        self.client.force_authenticate(user=None)
        public_url = f"/api/v1/customers/reviews/variants/{self.variant.id}/reviews/"
        get_res = self.client.get(public_url)
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertEqual(get_res.data["results"]["statistics"]["total_reviews"], 0)
        self.assertEqual(len(get_res.data["results"]["reviews"]), 0)

        # Admin list still displays all reviews
        self.client.force_authenticate(user=self.admin)
        admin_list_url = "/api/v1/admin/reviews/"
        admin_res = self.client.get(admin_list_url)
        self.assertEqual(admin_res.status_code, status.HTTP_200_OK)
        self.assertEqual(admin_res.data["count"], 1)

    def test_non_admin_blocked_from_admin_review_endpoints(self):
        self.client.force_authenticate(user=self.customer)
        admin_list_url = "/api/v1/admin/reviews/"
        response = self.client.get(admin_list_url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_product_list_rating_integration(self):
        # Create a visible review
        ReviewService.create_review(
            user=self.customer,
            variant_id=self.variant.id,
            rating=4,
            comment="Good quality",
        )

        response = self.client.get("/api/v1/customers/products/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data.get("results", [])
        prod_data = next((p for p in results if p["id"] == str(self.product.id)), None)
        self.assertIsNotNone(prod_data)
        self.assertEqual(prod_data["average_rating"], 4.0)
        self.assertEqual(prod_data["total_reviews"], 1)

    def test_product_detail_rating_integration(self):
        ReviewService.create_review(
            user=self.customer,
            variant_id=self.variant.id,
            rating=5,
            comment="Awesome toy",
        )

        response = self.client.get(f"/api/v1/customers/products/{self.product.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertEqual(data["average_rating"], 5.0)
        self.assertEqual(data["total_reviews"], 1)
        self.assertEqual(data["reviews_summary"]["rating_breakdown"]["5"], 1)

    def test_hidden_review_excluded_from_product_ratings(self):
        review = ReviewService.create_review(
            user=self.customer,
            variant_id=self.variant.id,
            rating=5,
            comment="Will be hidden",
        )

        # Admin hides review
        ReviewService.toggle_review_visibility(review_id=review.id, is_visible=False)

        response = self.client.get(f"/api/v1/customers/products/{self.product.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["average_rating"], 0.0)
        self.assertEqual(response.data["total_reviews"], 0)

    def test_model_db_unique_constraint(self):
        # First review created directly via model
        ProductReview.objects.create(
            user=self.customer,
            variant=self.variant,
            order_item=self.delivered_item,
            rating=5,
            comment="Direct model review",
        )
        from django.db import IntegrityError

        with self.assertRaises(IntegrityError):
            ProductReview.objects.create(
                user=self.customer,
                variant=self.variant,
                order_item=self.delivered_item,
                rating=4,
                comment="Duplicate direct model review",
            )

    def test_mass_assignment_protection(self):
        self.client.force_authenticate(user=self.customer)
        url = f"/api/v1/customers/reviews/variants/{self.variant.id}/reviews/"
        payload = {
            "user_id": str(self.other_customer.id),
            "variant_id": str(uuid.uuid4()),
            "order_item_id": str(uuid.uuid4()),
            "rating": 5,
            "comment": "Attempting mass assignment",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Review must belong to self.customer and self.variant
        created_review = ProductReview.objects.get(id=response.data["data"]["id"])
        self.assertEqual(created_review.user, self.customer)
        self.assertEqual(created_review.variant, self.variant)
        self.assertEqual(created_review.order_item, self.delivered_item)

    def test_anonymous_permissions(self):
        url_list = f"/api/v1/customers/reviews/variants/{self.variant.id}/reviews/"
        url_eligibility = (
            f"/api/v1/customers/reviews/variants/{self.variant.id}/reviews/eligibility/"
        )

        # Anonymous GET list allowed
        response = self.client.get(url_list)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Anonymous POST list rejected
        response = self.client.post(
            url_list, {"rating": 5, "comment": "Anon"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Anonymous GET eligibility rejected
        response = self.client.get(url_eligibility)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_rating_statistics_math_and_moderation_toggle(self):
        # Create users & orders for 5 ratings
        ratings = [5, 4, 3, 2, 1]
        created_reviews = []
        for r in ratings:
            u = User.objects.create_user(
                email=f"user_{r}_{uuid.uuid4().hex[:4]}@test.com",
                password="Password123!",
            )
            o = Order.objects.create(
                user=u,
                order_number=f"ORD-{uuid.uuid4().hex[:8]}",
                order_status=Order.OrderStatus.DELIVERED,
                subtotal=Decimal("10.00"),
                total_amount=Decimal("10.00"),
                shipping_name="U",
                shipping_phone="123",
                shipping_address_line1="123",
                shipping_city="C",
                shipping_state="S",
                shipping_postal_code="123",
            )
            oi = OrderItem.objects.create(
                order=o,
                product=self.product,
                variant=self.variant,
                product_name="P",
                variant_name="V",
                price=Decimal("10.00"),
                line_total=Decimal("10.00"),
                quantity=1,
                status=OrderItem.ItemStatus.ACTIVE,
            )
            rev = ReviewService.create_review(
                user=u, variant_id=self.variant.id, rating=r, comment=f"Rating {r}"
            )
            created_reviews.append(rev)

        stats = ReviewSelector.get_variant_rating_statistics(self.variant)
        self.assertEqual(stats["total_reviews"], 5)
        self.assertEqual(float(stats["average_rating"]), 3.0)

        # Hide 1-star review
        one_star_rev = next(r for r in created_reviews if r.rating == 1)
        ReviewService.toggle_review_visibility(
            review_id=one_star_rev.id, is_visible=False
        )

        stats_after_hide = ReviewSelector.get_variant_rating_statistics(self.variant)
        self.assertEqual(stats_after_hide["total_reviews"], 4)
        self.assertEqual(float(stats_after_hide["average_rating"]), 3.5)
        self.assertEqual(stats_after_hide["rating_1"], 0)

        # Show 1-star review again
        ReviewService.toggle_review_visibility(
            review_id=one_star_rev.id, is_visible=True
        )
        stats_restored = ReviewSelector.get_variant_rating_statistics(self.variant)
        self.assertEqual(stats_restored["total_reviews"], 5)
        self.assertEqual(float(stats_restored["average_rating"]), 3.0)

    def test_variant_isolation(self):
        variant2 = ProductVariant.objects.create(
            product=self.product,
            variant_name="Red Robot",
            sku=f"SKU-RED-{uuid.uuid4().hex[:4]}",
            price=Decimal("1200.00"),
            stock_quantity=10,
        )
        order2 = Order.objects.create(
            user=self.customer,
            order_number=f"ORD-{uuid.uuid4().hex[:8]}",
            order_status=Order.OrderStatus.DELIVERED,
            subtotal=Decimal("12.00"),
            total_amount=Decimal("12.00"),
            shipping_name="U",
            shipping_phone="123",
            shipping_address_line1="123",
            shipping_city="C",
            shipping_state="S",
            shipping_postal_code="123",
        )
        OrderItem.objects.create(
            order=order2,
            product=self.product,
            variant=variant2,
            product_name="P",
            variant_name="V2",
            price=Decimal("12.00"),
            line_total=Decimal("12.00"),
            quantity=1,
            status=OrderItem.ItemStatus.ACTIVE,
        )

        # Customer reviews variant 1
        ReviewService.create_review(
            user=self.customer,
            variant_id=self.variant.id,
            rating=5,
            comment="Variant 1 review",
        )

        # Variant 2 list should be empty
        v2_reviews = ReviewSelector.get_variant_reviews(variant2.id)
        self.assertEqual(v2_reviews.count(), 0)

        # Variant 1 list contains 1 review
        v1_reviews = ReviewSelector.get_variant_reviews(self.variant.id)
        self.assertEqual(v1_reviews.count(), 1)
