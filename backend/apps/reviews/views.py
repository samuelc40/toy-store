from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.reviews.pagination import ReviewPagination
from apps.reviews.selectors import ReviewSelector

from .serializers import (
    ReviewCreateSerializer,
    ReviewEligibilitySerializer,
    ReviewSerializer,
    ReviewUpdateSerializer,
)
from .services import ReviewService


class VariantReviewAPIView(APIView):

    pagination_class = ReviewPagination

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request, variant_id):
        variant = ReviewSelector.get_variant_by_id(variant_id)
        if not variant:
            return Response(
                {
                    "success": False,
                    "message": "Product variant not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        statistics = ReviewService.get_variant_review_statistics(variant)
        reviews = ReviewSelector.get_variant_reviews(variant, only_visible=True)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(reviews, request)
        review_serializer = ReviewSerializer(page, many=True)

        return paginator.get_paginated_response(
            {
                "statistics": statistics,
                "reviews": review_serializer.data,
            }
        )

    def post(self, request, variant_id):
        serializer = ReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        review = ReviewService.create_review(
            user=request.user,
            variant_id=variant_id,
            rating=serializer.validated_data["rating"],
            comment=serializer.validated_data.get("comment", ""),
        )

        return Response(
            {
                "success": True,
                "message": "Review submitted successfully.",
                "data": ReviewSerializer(review).data,
            },
            status=status.HTTP_201_CREATED,
        )


class VariantReviewEligibilityAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, variant_id):
        variant = ReviewSelector.get_variant_by_id(variant_id)
        if not variant:
            return Response(
                {
                    "success": False,
                    "message": "Product variant not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        eligibility = ReviewService.get_review_eligibility(
            user=request.user,
            variant=variant,
        )
        serializer = ReviewEligibilitySerializer(eligibility)

        return Response(
            {
                "success": True,
                "message": "Review eligibility fetched successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class ReviewDetailAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, review_id):
        serializer = ReviewUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        review = ReviewService.update_review(
            user=request.user,
            review_id=review_id,
            rating=serializer.validated_data.get("rating"),
            comment=serializer.validated_data.get("comment"),
        )

        return Response(
            {
                "success": True,
                "message": "Review updated successfully.",
                "data": ReviewSerializer(review).data,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, review_id):
        result = ReviewService.delete_review(
            user=request.user,
            review_id=review_id,
        )

        return Response(
            {
                "success": True,
                "message": result["message"],
            },
            status=status.HTTP_200_OK,
        )