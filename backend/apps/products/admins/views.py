from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.accounts.admins.views import IsAdminUser
from django.shortcuts import get_object_or_404
from django.db import transaction

from ..models import Category, ProductImage, ProductVariant
from .serializers import *
from .services import *

class AdminCategoryListCreateAPIView(APIView):
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

        data = AdminCategoryService.list_categories(
            page=page,
            page_size=page_size,
            search=search,
            sort=sort
        )
        serializer = CategorySerializer(
            data["results"],
            many=True,
            context={
                "request": request
            }
        )

        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "count": data["count"],
                "page": data["page"],
                "page_size": data["page_size"],
                "total_pages": data["total_pages"],
                "next": data["next"],
                "previous": data["previous"]

            }}, status=status.HTTP_200_OK)

    def post(self, request):

        serializer = CategorySerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        name = serializer.validated_data.get("name")
        description = serializer.validated_data.get("description", "")
        image = serializer.validated_data.get("image")

        category = AdminCategoryService.create_category(
            name=name,
            description=description,
            image=image
        )
        out_serializer = CategorySerializer(category, context={"request": request})

        return Response({
            "success": True,
            "message": "Category created successfully.",
            "data": out_serializer.data
        }, status=status.HTTP_201_CREATED)
    


class AdminCategoryDetailAPIView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, uuid):
        try:
            category = Category.objects.get(id=uuid, is_active=True)
        except (Category.DoesNotExist, ValueError):
            return Response({
                "success": False,
                "message": "Category not found."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = CategorySerializer(instance=category, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)

        name = serializer.validated_data.get("name")
        description = serializer.validated_data.get("description")
        image = serializer.validated_data.get("image")

        category = AdminCategoryService.update_category(
            category_uuid=uuid,
            name=name,
            description=description,
            image=image
        )
        out_serializer = CategorySerializer(category, context={"request": request})

        return Response({
            "success": True,
            "message": "Category updated successfully.",
            "data": out_serializer.data
        }, status=status.HTTP_200_OK)

    def delete(self, request, uuid):
        AdminCategoryService.delete_category(category_uuid=uuid)
        return Response({
            "success": True,
            "message": "Category deleted successfully."
        }, status=status.HTTP_200_OK)


class ProductListCreateAPIView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        search = request.query_params.get("search", "")
        page = request.query_params.get("page", 1)
        page_size = request.query_params.get("page_size", 10)
        result = ProductService.list_products(search=search, page=page, page_size=page_size,)

        serializer = ProductSerializer(
            result["results"],
            many=True,
            context={"request": request}
        )


        return Response({

            "success": True,
            "message": "Products fetched successfully.",
            "data": {

                "results": serializer.data,
                "count": result["count"],
                "page": result["page"],
                "page_size": result["page_size"],
                "total_pages": result["total_pages"],
            }

        })

    def post(self, request):

        serializer = ProductSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        product = ProductService.create(
            serializer.validated_data
        )


        return Response({

            "success": True,
            "message": "Product created successfully.",
            "data": ProductSerializer(
                product
            ).data

        }, status=status.HTTP_201_CREATED)
    

class ProductDetailAPIView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request, product_id):

        product = ProductService.get_product(
            product_id
        )

        serializer = ProductSerializer(product)

        return Response({

            "success": True,
            "message": "Product fetched successfully.",
            "data": serializer.data

        })

    def patch(self, request, product_id):

        product = ProductService.get_product(
            product_id
        )
        serializer = ProductSerializer(

            product,
            data=request.data,
            partial=True)

        serializer.is_valid(
            raise_exception=True
        )

        product = ProductService.update(
            product,
            serializer.validated_data
        )

        return Response({

            "success": True,
            "message": "Product updated successfully.",
            "data": ProductSerializer(product).data

        })

    def delete(self, request, product_id):

        product = ProductService.get_product(
            product_id
        )
        ProductService.soft_delete(product)
        return Response({
            "success": True,
            "message": "Product deleted successfully."
        }, status=status.HTTP_200_OK)
    

class ProductBlockAPIView(APIView):

    permission_classes = [IsAdminUser]

    def patch(self, request, product_id):

        product = ProductService.get_product(
            product_id
        )

        ProductService.toggle_block(product)

        return Response({

            "success": True,

            "message": (
                "Product blocked successfully."
                if product.blocked
                else
                "Product unblocked successfully."
            ),

            "data": {
                "id": str(product.id),
                "blocked": product.blocked
            }

        })
    

class ProductVariantListCreateAPIView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request, product_id):

        product = VariantService.get_product(product_id)

        variants = VariantService.list_variants(product)

        serializer = ProductVariantSerializer(
            variants,
            many=True
        )

        return Response({

            "success": True,

            "message": "Variants fetched successfully.",

            "data": serializer.data

        })

    def post(self, request, product_id):

        product = VariantService.get_product(product_id)

        serializer = ProductVariantSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        variant = VariantService.create_variant(

            product,

            serializer.validated_data

        )

        return Response({

            "success": True,

            "message": "Variant created successfully.",

            "data": ProductVariantSerializer(
                variant
            ).data

        }, status=status.HTTP_201_CREATED)
    

class ProductVariantDetailAPIView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request, variant_id):

        variant = VariantService.get_variant(
            variant_id
        )

        serializer = ProductVariantSerializer(
            variant
        )

        return Response({

            "success": True,

            "message": "Variant fetched successfully.",

            "data": serializer.data

        })

    def patch(self, request, variant_id):

        variant = VariantService.get_variant(
            variant_id
        )

        serializer = ProductVariantSerializer(

            variant,

            data=request.data,

            partial=True

        )

        serializer.is_valid(
            raise_exception=True
        )

        variant = VariantService.update_variant(

            variant,

            serializer.validated_data

        )

        return Response({

            "success": True,

            "message": "Variant updated successfully.",

            "data": ProductVariantSerializer(
                variant
            ).data

        })

    def delete(self, request, variant_id):

        variant = VariantService.get_variant(
            variant_id
        )

        VariantService.soft_delete(
            variant
        )

        return Response({

            "success": True,

            "message": "Variant deleted successfully."

        })
    

class ProductVariantBlockAPIView(APIView):

    permission_classes = [IsAdminUser]

    def patch(self, request, variant_id):

        variant = VariantService.get_variant(
            variant_id
        )

        variant = VariantService.toggle_block(
                variant
            )

        return Response({

            "success": True,
            "message": (
                "Variant blocked successfully."

                if variant.blocked

                else

                "Variant unblocked successfully."

            ),

            "data": {

                "id": str(variant.id),

                "blocked": variant.blocked

            }

        })
    

class ProductImageUploadAPIView(APIView):

    permission_classes = [
        IsAdminUser
    ]

    def get(self, request, variant_id):
        variant = get_object_or_404(
            ProductVariant,
            id=variant_id,
            is_active=True
        )
        images = variant.images.all().order_by('display_order')
        serializer = ProductImageSerializer(images, many=True)
        return Response({
            "success": True,
            "message": "Images fetched successfully.",
            "data": serializer.data
        })

    def post(
        self,
        request,
        variant_id
    ):

        images = request.FILES.getlist(
            "images"
        )

        alt_text = request.data.get(
            "alt_text",
            ""
        )

        print(request.FILES)
        print(request.FILES.getlist("images"))
        print(len(request.FILES.getlist("images")))

        uploaded_images = ImageService.upload_images(

            variant_id=variant_id,

            images=images,

            alt_text=alt_text

        )

        serializer = ProductImageSerializer(

            uploaded_images,

            many=True

        )

        return Response({

            "success": True,

            "message": "Images uploaded successfully.",

            "data": serializer.data

        }, status=status.HTTP_201_CREATED)

    def delete(self, request, variant_id):
        image_id = request.query_params.get("image_id")
        if not image_id:
            return Response({
                "success": False,
                "message": "image_id parameter is required."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        ImageService.delete_image(variant_id=variant_id, image_id=image_id)
        
        return Response({
            "success": True,
            "message": "Image deleted successfully."
        }, status=status.HTTP_200_OK)

    def patch(self, request, variant_id):
        image_id = request.data.get("image_id")
        if not image_id:
            return Response({
                "success": False,
                "message": "image_id body parameter is required."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            ProductImage.objects.filter(variant_id=variant_id).update(is_primary=False)
            image = get_object_or_404(ProductImage, id=image_id, variant_id=variant_id)
            image.is_primary = True
        return Response({
            "success": True,
            "message": "Primary image set successfully."
        }, status=status.HTTP_200_OK)


class AdminInventoryListAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        search = request.query_params.get("search", "")
        sort = request.query_params.get("sort", "newest")
        category = request.query_params.get("category", "")
        brand = request.query_params.get("brand", "")
        stock_status = request.query_params.get("stock_status", "")
        status_filter = request.query_params.get("status", "")
        page = request.query_params.get("page", 1)
        page_size = request.query_params.get("page_size", 10)

        try:
            page = int(page)
            page_size = int(page_size)
        except ValueError:
            page = 1
            page_size = 10

        data = AdminInventoryService.get_inventory_items(
            page=page,
            page_size=page_size,
            search=search,
            sort=sort,
            category=category,
            brand=brand,
            stock_status=stock_status,
            status_filter=status_filter,
        )

        serializer = AdminInventoryItemSerializer(
            data["results"],
            many=True,
            context={"request": request}
        )

        return Response({
            "success": True,
            "data": {
                "results": serializer.data,
                "count": data["count"],
                "page": data["page"],
                "page_size": data["page_size"],
                "total_pages": data["total_pages"],
                "next": data["next"],
                "previous": data["previous"],
            }
        }, status=status.HTTP_200_OK)


class AdminInventorySummaryAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        summary = AdminInventoryService.get_summary_stats()
        return Response({
            "success": True,
            "data": summary,
        }, status=status.HTTP_200_OK)


class AdminUpdateStockAPIView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, variant_id):
        serializer = UpdateStockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        stock_quantity = serializer.validated_data["stock_quantity"]
        reason = serializer.validated_data.get("reason", "")

        variant = AdminInventoryService.update_stock(
            variant_id=variant_id,
            new_quantity=stock_quantity,
            reason=reason,
        )

        out_serializer = AdminInventoryItemSerializer(variant, context={"request": request})

        return Response({
            "success": True,
            "message": f"Stock updated to {variant.stock_quantity} for variant '{variant.variant_name}'.",
            "data": out_serializer.data,
        }, status=status.HTTP_200_OK)