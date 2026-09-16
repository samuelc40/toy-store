from decimal import Decimal

from django.db import IntegrityError, transaction
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from .models import ProductReview
from .selectors import ReviewSelector


class ReviewService:

    @classmethod
    def create_review(
        cls,
        user,
        variant_id,
        rating,
        comment="",
    ):
        if not user or not getattr(user, "is_authenticated", False):
            raise PermissionDenied("Authentication required to submit a review.")

        variant = ReviewSelector.get_variant_by_id(variant_id)
        if not variant:
            raise NotFound("Product variant not found.")

        try:
            rating_int = int(rating)
        except (ValueError, TypeError):
            raise ValidationError({"rating": "Rating must be an integer."})

        if rating_int < 1 or rating_int > 5:
            raise ValidationError(
                {"rating": "Rating must be an integer between 1 and 5."}
            )

        comment_str = str(comment).strip() if comment else ""
        if comment and not comment_str:
            raise ValidationError(
                {"comment": "Comment cannot consist of only whitespace."}
            )

        if len(comment_str) > 2000:
            raise ValidationError(
                {"comment": "Comment maximum length is 2000 characters."}
            )

        order_item = ReviewSelector.get_eligible_order_item(
            user=user,
            variant=variant,
        )

        if not order_item:
            raise ValidationError(
                "You can review this variant only after purchasing and receiving it."
            )

        existing_review = ReviewSelector.get_existing_review(
            user=user,
            variant=variant,
        )

        if existing_review:
            raise ValidationError("You have already reviewed this variant.")

        try:
            with transaction.atomic():
                return ProductReview.objects.create(
                    user=user,
                    variant=variant,
                    order_item=order_item,
                    rating=rating_int,
                    comment=comment_str,
                )
        except IntegrityError:
            raise ValidationError("You have already reviewed this variant.")

    @classmethod
    def update_review(
        cls,
        user,
        review_id,
        rating=None,
        comment=None,
    ):
        if not user or not getattr(user, "is_authenticated", False):
            raise PermissionDenied("Authentication required to update a review.")

        review = ReviewSelector.get_review_by_id(review_id)
        if not review:
            raise NotFound("Review not found.")

        if review.user_id != user.id:
            raise PermissionDenied("You are not authorized to modify this review.")

        update_fields = ["updated_at"]

        if rating is not None:
            try:
                rating_int = int(rating)
            except (ValueError, TypeError):
                raise ValidationError({"rating": "Rating must be an integer."})

            if rating_int < 1 or rating_int > 5:
                raise ValidationError(
                    {"rating": "Rating must be an integer between 1 and 5."}
                )

            review.rating = rating_int
            update_fields.append("rating")

        if comment is not None:
            comment_str = str(comment).strip()
            if len(comment_str) > 2000:
                raise ValidationError(
                    {"comment": "Comment maximum length is 2000 characters."}
                )

            review.comment = comment_str
            update_fields.append("comment")

        with transaction.atomic():
            review.save(update_fields=update_fields)

        return review

    @classmethod
    def delete_review(
        cls,
        user,
        review_id,
    ):
        if not user or not getattr(user, "is_authenticated", False):
            raise PermissionDenied("Authentication required to delete a review.")

        review = ReviewSelector.get_review_by_id(review_id)
        if not review:
            raise NotFound("Review not found.")

        if review.user_id != user.id:
            raise PermissionDenied("You are not authorized to delete this review.")

        with transaction.atomic():
            review.delete()

        return {"success": True, "message": "Review deleted successfully."}

    @classmethod
    def get_variant_review_statistics(cls, variant):
        if isinstance(variant, str):
            variant_obj = ReviewSelector.get_variant_by_id(variant)
        else:
            variant_obj = variant

        stats = ReviewSelector.get_variant_rating_statistics(variant_obj)

        return {
            "average_rating": stats["average_rating"] or Decimal("0.00"),
            "total_reviews": stats["total_reviews"],
            "rating_distribution": {
                "5": stats["rating_5"],
                "4": stats["rating_4"],
                "3": stats["rating_3"],
                "2": stats["rating_2"],
                "1": stats["rating_1"],
            },
            "rating_breakdown": {
                "5": stats["rating_5"],
                "4": stats["rating_4"],
                "3": stats["rating_3"],
                "2": stats["rating_2"],
                "1": stats["rating_1"],
            },
        }

    @classmethod
    def get_review_eligibility(cls, user, variant):
        if isinstance(variant, str):
            variant_obj = ReviewSelector.get_variant_by_id(variant)
        else:
            variant_obj = variant

        return ReviewSelector.get_review_eligibility(user, variant_obj)

    @classmethod
    def toggle_review_visibility(cls, review_id, is_visible):
        review = ReviewSelector.get_review_by_id(review_id)
        if not review:
            raise NotFound("Review not found.")

        review.is_visible = bool(is_visible)
        with transaction.atomic():
            review.save(update_fields=["is_visible", "updated_at"])

        return review

    @classmethod
    def admin_delete_review(cls, review_id):
        review = ReviewSelector.get_review_by_id(review_id)
        if not review:
            raise NotFound("Review not found.")

        with transaction.atomic():
            review.delete()

        return {"success": True, "message": "Review permanently removed by admin."}
