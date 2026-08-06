from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .serializers import AdminLoginSerializer, AdminUserSerializer
from .services import AdminLoginService, AdminUserService


class IsAdminUser(IsAuthenticated):

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return bool(request.user.is_staff or request.user.is_superuser)


class AdminLoginAPIView(APIView):

    permission_classes = []

    def post(self, request):

        serializer = AdminLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = AdminLoginService.login(
            serializer.validated_data["email"],
            serializer.validated_data["password"]
        )
        user = result["user"]

        response = Response(
            {
                "success": True,
                "message": "Admin login successful.",
                "data": {
                    "access": result["access"],
                    "refresh": result["refresh"],
                    "user": {
                        "id": str(user.id),
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "email": user.email,
                    }
                }
            },
            status=status.HTTP_200_OK
        )

        response.set_cookie(
            key="access_token",
            value=result["access"],
            httponly=True,
            secure=False,
            samesite="Lax",
        )
        response.set_cookie(
            key="refresh_token",
            value=result["refresh"],
            httponly=True,
            secure=False,
            samesite="Lax",
        )

        return response


class AdminUserListAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        search = request.query_params.get("search", "")
        page = request.query_params.get("page", "1")
        page_size = request.query_params.get("page_size", "10")

        try:
            page = int(page)
            page_size = int(page_size)
        except ValueError:
            page = 1
            page_size = 10

        data = AdminUserService.list_users(page=page, page_size=page_size, search=search)
        serializer = AdminUserSerializer(data["results"], many=True, context={"request": request})

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
            }
        }, status=status.HTTP_200_OK)


class AdminBlockUserAPIView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, uuid):
        try:
            updated_user = AdminUserService.toggle_block(user_uuid=uuid, request_user=request.user)
            serializer = AdminUserSerializer(updated_user, context={"request": request})
            return Response({
                "success": True,
                "message": f"User {'blocked' if updated_user.blocked else 'unblocked'} successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            from rest_framework.exceptions import ValidationError
            if isinstance(e, ValidationError):
                raise e
            return Response({
                "success": False,
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class AdminUserDeleteAPIView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, uuid):
        try:
            AdminUserService.delete_user(user_uuid=uuid, request_user=request.user)
            return Response({
                "success": True,
                "message": "User deleted successfully."
            }, status=status.HTTP_200_OK)
        except Exception as e:
            from rest_framework.exceptions import ValidationError
            if isinstance(e, ValidationError):
                raise e
            return Response({
                "success": False,
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)