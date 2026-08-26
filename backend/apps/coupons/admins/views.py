from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CouponSerializer
from .services import CouponAdminService
from .selectors import CouponSelector


class CouponListCreateAPIView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):
        search = request.query_params.get(
            "search",
            ""
        )

        sort = request.query_params.get(
            "sort",
            "newest"
        )

        page = request.query_params.get(
            "page",
            "1"
        )

        page_size = request.query_params.get(
            "page_size",
            "10"
        )

        try:

            page = int(page)
            page_size = int(page_size)

        except ValueError:

            page = 1
            page_size = 10

        data = CouponAdminService.list_coupons(
            search=search,
            sort=sort,
            page=page,
            page_size=page_size
        )

        serializer = CouponSerializer(
            data["results"],
            many=True
        )

        return Response({

            "success": True,
            "message": "Coupons fetched successfully.",
            "data": {
                "results": serializer.data,
                "count": data["count"],
                "page": data["page"],
                "page_size": data["page_size"],
                "total_pages": data["total_pages"],
                "next": data["next"],
                "previous": data["previous"]
            }

        })

    def post(self, request):

        serializer = CouponSerializer(
            data=request.data
        )
        serializer.is_valid(
            raise_exception=True
        )

        coupon = CouponAdminService.create_coupon(
            serializer.validated_data
        )

        return Response({
            "success": True,
            "message": "Coupon created successfully.",
            "data": CouponSerializer(
                coupon
            ).data
        },

        status=status.HTTP_201_CREATED)


class CouponDetailAPIView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request, coupon_id):
        coupon = CouponSelector.get_coupon(
            coupon_id
        )
        if not coupon:
            return Response({
                "success": False,
                "message": "Coupon not found."
            },

            status=status.HTTP_404_NOT_FOUND)

        serializer = CouponSerializer(
            coupon
        )

        return Response({
            "success": True,
            "data": serializer.data
        })


    def patch(self, request, coupon_id):

        coupon = CouponSelector.get_coupon(
            coupon_id
        )

        if not coupon:
            return Response({
                "success": False,
                "message": "Coupon not found."
            },

            status=status.HTTP_404_NOT_FOUND)

        serializer = CouponSerializer(
            coupon,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        coupon = CouponAdminService.update_coupon(
            coupon_id,
            serializer.validated_data
        )

        return Response({
            "success": True,
            "message": "Coupon updated successfully.",
            "data": CouponSerializer(
                coupon
            ).data
        })


    def delete(self, request, coupon_id):

        CouponAdminService.delete_coupon(
            coupon_id
        )

        return Response({
            "success": True,
            "message": "Coupon deleted successfully."
        })