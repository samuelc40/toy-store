from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework import status

from apps.offers.admins.selectors import AdminOfferSelector
from apps.offers.admins.services import OfferService
from apps.offers.admins.serializers import (
    AdminProductOfferSerializer,
    AdminCreateUpdateProductOfferSerializer,
    AdminCategoryOfferSerializer,
    AdminCreateUpdateCategoryOfferSerializer,
    AdminReferralOfferConfigSerializer,
)


class OfferPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            "success": True,
            "count": self.page.paginator.count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "current_page": self.page.number,
            "total_pages": self.page.paginator.num_pages,
            "results": data,
        })


class AdminProductOfferListCreateAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        search = request.query_params.get("search", None)
        status_filter = request.query_params.get("status", None)
        queryset = AdminOfferSelector.get_product_offers(search=search, status_filter=status_filter)
        paginator = OfferPagination()
        page_qs = paginator.paginate_queryset(queryset, request)
        serializer = AdminProductOfferSerializer(page_qs, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = AdminCreateUpdateProductOfferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        offer = OfferService.create_product_offer(**serializer.validated_data)
        return Response({
            "success": True,
            "message": "Product offer created successfully!",
            "data": AdminProductOfferSerializer(offer).data,
        }, status=status.HTTP_201_CREATED)


class AdminProductOfferDetailAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, offer_id):
        offer = AdminOfferSelector.get_product_offer_by_id(offer_id)
        if not offer:
            return Response({"success": False, "message": "Product offer not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"success": True, "data": AdminProductOfferSerializer(offer).data})

    def put(self, request, offer_id):
        serializer = AdminCreateUpdateProductOfferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        offer = OfferService.update_product_offer(offer_id=offer_id, **serializer.validated_data)
        return Response({"success": True, "message": "Product offer updated successfully!", "data": AdminProductOfferSerializer(offer).data})

    def patch(self, request, offer_id):
        is_active = request.data.get("is_active")
        if is_active is True:
            offer = OfferService.activate_offer("product", offer_id)
        elif is_active is False:
            offer = OfferService.deactivate_offer("product", offer_id)
        else:
            return Response({"success": False, "message": "Invalid toggle request."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"success": True, "message": "Offer status updated!", "data": AdminProductOfferSerializer(offer).data})

    def delete(self, request, offer_id):
        OfferService.delete_product_offer(offer_id)
        return Response({"success": True, "message": "Product offer deleted successfully!"}, status=status.HTTP_200_OK)


class AdminCategoryOfferListCreateAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        search = request.query_params.get("search", None)
        status_filter = request.query_params.get("status", None)
        queryset = AdminOfferSelector.get_category_offers(search=search, status_filter=status_filter)
        paginator = OfferPagination()
        page_qs = paginator.paginate_queryset(queryset, request)
        serializer = AdminCategoryOfferSerializer(page_qs, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = AdminCreateUpdateCategoryOfferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        offer = OfferService.create_category_offer(**serializer.validated_data)
        return Response({
            "success": True,
            "message": "Category offer created successfully!",
            "data": AdminCategoryOfferSerializer(offer).data,
        }, status=status.HTTP_201_CREATED)


class AdminCategoryOfferDetailAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, offer_id):
        offer = AdminOfferSelector.get_category_offer_by_id(offer_id)
        if not offer:
            return Response({"success": False, "message": "Category offer not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"success": True, "data": AdminCategoryOfferSerializer(offer).data})

    def put(self, request, offer_id):
        serializer = AdminCreateUpdateCategoryOfferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        offer = OfferService.update_category_offer(offer_id=offer_id, **serializer.validated_data)
        return Response({"success": True, "message": "Category offer updated successfully!", "data": AdminCategoryOfferSerializer(offer).data})

    def patch(self, request, offer_id):
        is_active = request.data.get("is_active")
        if is_active is True:
            offer = OfferService.activate_offer("category", offer_id)
        elif is_active is False:
            offer = OfferService.deactivate_offer("category", offer_id)
        else:
            return Response({"success": False, "message": "Invalid toggle request."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"success": True, "message": "Offer status updated!", "data": AdminCategoryOfferSerializer(offer).data})

    def delete(self, request, offer_id):
        OfferService.delete_category_offer(offer_id)
        return Response({"success": True, "message": "Category offer deleted successfully!"}, status=status.HTTP_200_OK)


class AdminReferralOfferConfigAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        config = OfferService.get_referral_config()
        serializer = AdminReferralOfferConfigSerializer(config)
        return Response({"success": True, "data": serializer.data})

    def put(self, request):
        serializer = AdminReferralOfferConfigSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        config = OfferService.update_referral_config(**serializer.validated_data)
        return Response({
            "success": True,
            "message": "Referral offer settings updated successfully!",
            "data": AdminReferralOfferConfigSerializer(config).data,
        })

