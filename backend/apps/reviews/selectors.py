from decimal import Decimal
from django.db.models import Avg, Count, Q

from apps.orders.models import Order, OrderItem
from apps.products.models import ProductVariant

from .models import ProductReview


class ReviewSelector:

    @staticmethod
    def get_variant_by_id(variant_id):
        if not variant_id:
            return None
        try:
            return (
                ProductVariant.objects
                .select_related("product")
                .filter(id=variant_id)
                .first()
            )
        except Exception:
            return None

    @staticmethod
    def get_eligible_order_item(user, variant):
        if not user or not getattr(user, "is_authenticated", False) or not variant:
            return None

        if not isinstance(variant, ProductVariant):
            variant_obj = ReviewSelector.get_variant_by_id(variant)
        else:
            variant_obj = variant

        if not variant_obj:
            return None

        return (
            OrderItem.objects
            .select_related("order", "variant", "product")
            .filter(
                order__user=user,
                order__order_status=Order.OrderStatus.DELIVERED,
                variant=variant_obj,
                status=OrderItem.ItemStatus.ACTIVE,
            )
            .first()
        )

    @staticmethod
    def get_existing_review(user, variant):
        if not user or not getattr(user, "is_authenticated", False) or not variant:
            return None

        if not isinstance(variant, ProductVariant):
            variant_obj = ReviewSelector.get_variant_by_id(variant)
        else:
            variant_obj = variant

        if not variant_obj:
            return None

        return (
            ProductReview.objects
            .filter(
                user=user,
                variant=variant_obj,
            )
            .first()
        )

    @staticmethod
    def get_review_by_id(review_id, user=None):
        if not review_id:
            return None

        qs = (
            ProductReview.objects
            .select_related("user", "variant", "variant__product", "order_item")
            .filter(id=review_id)
        )

        if user is not None and getattr(user, "is_authenticated", False):
            qs = qs.filter(user=user)

        return qs.first()

    @staticmethod
    def get_variant_reviews(variant, only_visible=True):
        if not variant:
            return ProductReview.objects.none()

        if not isinstance(variant, ProductVariant):
            variant_obj = ReviewSelector.get_variant_by_id(variant)
        else:
            variant_obj = variant

        if not variant_obj:
            return ProductReview.objects.none()

        qs = ProductReview.objects.filter(variant=variant_obj)
        if only_visible:
            qs = qs.filter(is_visible=True)

        return (
            qs.select_related("user")
            .order_by("-created_at")
        )

    @staticmethod
    def get_variant_rating_statistics(variant, only_visible=True):
        if not variant:
            return {
                "average_rating": Decimal("0.00"),
                "total_reviews": 0,
                "rating_5": 0,
                "rating_4": 0,
                "rating_3": 0,
                "rating_2": 0,
                "rating_1": 0,
            }

        if not isinstance(variant, ProductVariant):
            variant_obj = ReviewSelector.get_variant_by_id(variant)
        else:
            variant_obj = variant

        if not variant_obj:
            return {
                "average_rating": Decimal("0.00"),
                "total_reviews": 0,
                "rating_5": 0,
                "rating_4": 0,
                "rating_3": 0,
                "rating_2": 0,
                "rating_1": 0,
            }

        qs = ProductReview.objects.filter(variant=variant_obj)
        if only_visible:
            qs = qs.filter(is_visible=True)

        stats = qs.aggregate(
            average_rating=Avg("rating"),
            total_reviews=Count("id"),
            rating_5=Count("id", filter=Q(rating=5)),
            rating_4=Count("id", filter=Q(rating=4)),
            rating_3=Count("id", filter=Q(rating=3)),
            rating_2=Count("id", filter=Q(rating=2)),
            rating_1=Count("id", filter=Q(rating=1)),
        )

        avg = stats["average_rating"]
        if avg is not None:
            avg_decimal = round(Decimal(str(avg)), 2)
        else:
            avg_decimal = Decimal("0.00")

        return {
            "average_rating": avg_decimal,
            "total_reviews": stats["total_reviews"] or 0,
            "rating_5": stats["rating_5"] or 0,
            "rating_4": stats["rating_4"] or 0,
            "rating_3": stats["rating_3"] or 0,
            "rating_2": stats["rating_2"] or 0,
            "rating_1": stats["rating_1"] or 0,
        }

    @staticmethod
    def get_review_eligibility(user, variant):
        eligible_order_item = ReviewSelector.get_eligible_order_item(
            user=user,
            variant=variant,
        )

        existing_review = ReviewSelector.get_existing_review(
            user=user,
            variant=variant,
        )

        return {
            "can_review": (
                eligible_order_item is not None
                and existing_review is None
            ),
            "has_reviewed": existing_review is not None,
            "already_reviewed": existing_review is not None,
            "has_eligible_purchase": (
                eligible_order_item is not None
            ),
            "existing_review_id": str(existing_review.id) if existing_review else None,
            "existing_review": existing_review,
        }

    @staticmethod
    def get_all_reviews_for_admin(search=None, rating=None, is_visible=None):
        qs = ProductReview.objects.select_related(
            "user", "variant", "variant__product", "order_item"
        ).all()

        if search:
            s = str(search).strip()
            qs = qs.filter(
                Q(comment__icontains=s) |
                Q(user__first_name__icontains=s) |
                Q(user__last_name__icontains=s) |
                Q(user__email__icontains=s) |
                Q(variant__product__name__icontains=s) |
                Q(variant__variant_name__icontains=s)
            )

        if rating is not None:
            try:
                qs = qs.filter(rating=int(rating))
            except (ValueError, TypeError):
                pass

        if is_visible is not None:
            if isinstance(is_visible, bool):
                qs = qs.filter(is_visible=is_visible)
            elif str(is_visible).lower() in ["true", "1"]:
                qs = qs.filter(is_visible=True)
            elif str(is_visible).lower() in ["false", "0"]:
                qs = qs.filter(is_visible=False)

        return qs.order_by("-created_at")