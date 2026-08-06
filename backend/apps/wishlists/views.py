from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .selectors import WishlistSelector
from .serializers import WishlistItemSerializer
from .services import WishlistService


class WishlistAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = WishlistSelector.get_user_wishlist(request.user)
        serializer = WishlistItemSerializer(queryset, many=True, context={"request": request})

        return Response({
            "success": True,
            "results": serializer.data
        })


    def post(self, request):
        product_id = request.data.get("product_id")
        if not product_id:
            return Response(
                {
                    "success": False,
                    "message": "Product ID is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        item, created = WishlistService.add_product(request.user, product_id)

        return Response(
            {
                "success": True,
                "message": (
                    "Product added to wishlist."
                    if created
                    else "Product is already in wishlist."
                ),
                "data": WishlistItemSerializer(
                    item,
                    context={"request": request}
                ).data
            },
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            )
        )


class WishlistDeleteAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        removed = WishlistService.remove_product(request.user, product_id)
        if not removed:
            return Response(
                {
                    "success": False,
                    "message": "Product is not in your wishlist."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            "success": True,
            "message": "Product removed from wishlist."
        })