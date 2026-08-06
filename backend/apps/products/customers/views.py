from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .pagination import ProductPagination
from .serializers import *
from .services import CustomerProductService, CustomerCategoryService
from .selectors import CustomerProductSelector


class ProductListAPIView(APIView):
    permission_classes = [AllowAny]
    pagination_class = ProductPagination

    def get(self, request):

        queryset = CustomerProductService.get_products()
        queryset = CustomerProductService.apply_search(
            queryset,
            request.GET.get("search")
        )

        queryset = CustomerProductService.filter_category(
            queryset,
            request.GET.get("category")
        )

        queryset = CustomerProductService.filter_brand(
            queryset,
            request.GET.get("brand")
        )

        queryset = CustomerProductService.filter_price(
            queryset,
            request.GET.get("min_price"),
            request.GET.get("max_price"),
        )

        queryset = CustomerProductService.apply_sort(
            queryset,
            request.GET.get(
                "sort",
                "newest"
            )
        )

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(
            queryset,
            request
        )

        print('Mobile image devtunnel debugging...')
        print(request.build_absolute_uri("/"))
        print(request.get_host())

        serializer = CustomerProductSerializer(
            page,
            many=True,
            context={
                "request": request
            }
        )

        return paginator.get_paginated_response(
            serializer.data
        )


class CategoryListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = CustomerCategoryService.get_categories()
        serializer = CustomerCategorySerializer(
            queryset,
            many=True,
            context={"request": request}
        )
        return Response({
            "success": True,
            "count": len(serializer.data),
            "results": serializer.data
        }, status=status.HTTP_200_OK)
    
    
class CustomerProductsByCategoryAPIView(APIView):

    permission_classes = [AllowAny]
    def get(self, request, category_id):

        queryset = CustomerCategoryService.get_products_by_category(
            category_id
        )

        serializer = CustomerProductByCategorySerializer(
            queryset,
            many=True,
            context={
                "request": request
            }
        )
        
        return Response({
            "success": True,
            "count": queryset.count(),
            "results": serializer.data
        })


class ProductDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, product_id):
        product = CustomerProductSelector.get_product_details(product_id)
        if not product:
            return Response(
                {"success": False, "message": "Product not found or unavailable."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CustomerProductDetailSerializer(
            product,
            context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)