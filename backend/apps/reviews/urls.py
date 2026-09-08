from django.urls import path

from .views import (
    ReviewDetailAPIView,
    VariantReviewAPIView,
    VariantReviewEligibilityAPIView,
)

urlpatterns = [
    path(
        "variants/<str:variant_id>/reviews/",
        VariantReviewAPIView.as_view(),
        name="variant-reviews",
    ),
    path(
        "variants/<str:variant_id>/reviews/eligibility/",
        VariantReviewEligibilityAPIView.as_view(),
        name="variant-review-eligibility",
    ),
    path(
        "<uuid:review_id>/",
        ReviewDetailAPIView.as_view(),
        name="review-detail",
    ),
]