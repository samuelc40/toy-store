from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.admins.views import IsAdminUser
from apps.reviews.pagination import ReviewPagination
from apps.reviews.selectors import ReviewSelector
from apps.reviews.serializers import AdminReviewSerializer
from apps.reviews.services import ReviewService


class AdminReviewListAPIView(APIView):

    permission_classes = [IsAdminUser]
    pagination_class = ReviewPagination

    def get(self, request):
        search = request.query_params.get("search")
        rating = request.query_params.get("rating")
        is_visible = request.query_params.get("is_visible")

        reviews = ReviewSelector.get_all_reviews_for_admin(
            search=search,
            rating=rating,
            is_visible=is_visible,
        )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(reviews, request)
        serializer = AdminReviewSerializer(page, many=True)

        return paginator.get_paginated_response(serializer.data)


class AdminReviewDetailAPIView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request, review_id):
        review = ReviewSelector.get_review_by_id(review_id)
        if not review:
            return Response(
                {"success": False, "message": "Review not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AdminReviewSerializer(review)
        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request, review_id):
        is_visible = request.data.get("is_visible")
        if is_visible is None:
            return Response(
                {"success": False, "message": "Field 'is_visible' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        review = ReviewService.toggle_review_visibility(
            review_id=review_id,
            is_visible=is_visible,
        )

        return Response(
            {
                "success": True,
                "message": f"Review visibility updated to {review.is_visible}.",
                "data": AdminReviewSerializer(review).data,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, review_id):
        result = ReviewService.admin_delete_review(review_id=review_id)
        return Response(
            {
                "success": True,
                "message": result["message"],
            },
            status=status.HTTP_200_OK,
        )
