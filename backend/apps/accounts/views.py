# from django.shortcuts import render
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .serializers import *
from .services import *

class RegisterAPIView(APIView):

    permission_classes = []

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        RegisterService.register(serializer.validated_data)

        return Response(
            
            {
                "success": True,
                "message": "Registration successful. Please verify your email."
            },
            status=status.HTTP_201_CREATED
        )


class VerifyEmailAPIView(APIView):

    permission_classes = []

    def post(self, request):

        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        VerifyEmailService.verify(
            serializer.validated_data["email"],
            serializer.validated_data["otp_code"]
        )

        return Response(
            {
                "success": True,
                "message": "Email verified successfully."
            },
            status=status.HTTP_200_OK
        )


class ResendOTPAPIView(APIView):

    permission_classes = []

    def post(self, request):

        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ResendOTPService.resend(
            serializer.validated_data["email"]
        )

        return Response(
            {
                "success": True,
                "message": "OTP sent successfully."
            },
            status=status.HTTP_200_OK
        )
    

class LoginAPIView(APIView):

    permission_classes = []

    def post(self, request):

        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = LoginService.login(
            serializer.validated_data["email"],
            serializer.validated_data["password"]
        )

        user = result["user"]

        response = Response(
            {
                "success": True,
                "message": "Login successful.",
                "data": {
                    "access": result["access"],
                    "refresh": result["refresh"],
                    "user": {
                        "id": str(user.id),
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "email": user.email,
                        "phone": user.phone,
                    }
                }
            },
            status=status.HTTP_200_OK
        )

        # Set cookies on response
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
    

class LogoutAPIView(APIView):

    permission_classes = []

    def post(self, request):

        data = request.data.copy() if hasattr(request.data, "copy") else {}
        if not data.get("refresh"):
            data["refresh"] = request.COOKIES.get("refresh_token")

        serializer = LogoutSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        LogoutService.logout(
            serializer.validated_data["refresh"]
        )

        response = Response(
            {
                "success": True,
                "message": "Logged out successfully."
            },
            status=status.HTTP_200_OK
        )

        # Clear cookies on response
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

        return response
    

class ForgotPasswordAPIView(APIView):

    permission_classes = []

    def post(self, request):

        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ForgotPasswordService.send_otp(
            serializer.validated_data["email"]
        )

        return Response(
            {
                "success": True,
                "message": "OTP has been sent to your email."
            },
            status=status.HTTP_200_OK
        )
    

class VerifyResetOTPAPIView(APIView):

    permission_classes = []

    def post(self, request):

        serializer = VerifyResetOTPSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        token = VerifyResetOTPService.verify(
            serializer.validated_data["email"],
            serializer.validated_data["otp"]
        )

        return Response(
            {
                "success": True,
                "message": "OTP verified successfully.",
                "data": {
                    "reset_token": token
                }
            }
        )
    

class ResetPasswordAPIView(APIView):

    permission_classes = []

    def post(self, request):

        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ResetPasswordService.reset(
            reset_token=serializer.validated_data["reset_token"],
            password=serializer.validated_data["password"],
        )

        return Response(
            {
                "success": True,
                "message": "Password reset successfully."
            },
            status=status.HTTP_200_OK
        )


class ChangePasswordAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request):

        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ChangePasswordService.change_password(
            user=request.user,
            current_password=serializer.validated_data["current_password"],
            new_password=serializer.validated_data["new_password"],
        )

        response = Response(
            {
                "success": True,
                "message": "Password changed successfully."
            },
            status=status.HTTP_200_OK
        )

        # Invalidate JWT cookies
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

        # Invalidate refresh token on backend (best effort)
        refresh_token = request.COOKIES.get("refresh_token") or request.data.get("refresh")
        if refresh_token:
            try:
                from rest_framework_simplejwt.tokens import RefreshToken
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass

        return response
    

class ChangeEmailAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = ChangeEmailSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        ChangeEmailService.send_otp(
            user=request.user,
            new_email=serializer.validated_data["new_email"]
        )

        return Response(
            {
                "success": True,
                "message": "OTP has been sent to your new email."
            },
            status=status.HTTP_200_OK
        )
    

class VerifyEmailChangeAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = VerifyEmailChangeSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        VerifyEmailChangeService.verify(
            user=request.user,
            new_email=serializer.validated_data["new_email"],
            otp=serializer.validated_data["otp"]
        )

        return Response(
            {
                "success": True,
                "message": "Email updated successfully."
            },
            status=status.HTTP_200_OK
        )
    


class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # Extract refresh token from cookies as fallback
        refresh_token = request.data.get("refresh") or request.COOKIES.get("refresh_token")
        
        if not refresh_token:
            return Response(
                {"detail": "Refresh token not found in cookies or body."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        data = request.data.copy() if hasattr(request.data, "copy") else {}
        data["refresh"] = refresh_token
        
        serializer = self.get_serializer(data=data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
            
        res_data = serializer.validated_data
        
        response = Response(
            {
                "success": True,
                "message": "Token refreshed successfully.",
                "data": res_data
            },
            status=status.HTTP_200_OK
        )
        
        # Set access token cookie
        response.set_cookie(
            key="access_token",
            value=res_data["access"],
            httponly=True,
            secure=False,
            samesite="Lax",
        )
        
        # Set refresh token cookie if rotated
        if "refresh" in res_data:
            response.set_cookie(
                key="refresh_token",
                value=res_data["refresh"],
                httponly=True,
                secure=False,
                samesite="Lax",
            )
            
        return response
    

class GoogleLoginAPIView(APIView):

    permission_classes = []

    def post(self, request):

        serializer = GoogleLoginSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        result = GoogleLoginService.login(
            serializer.validated_data["token"]
        )

        response = Response(
            {
                "success": True,
                "message": "Login Successful",
                "user": ProfileSerializer(
                    result["user"]
                ).data,
            }
        )

        response.set_cookie(
            key="access_token",
            value=result["access"],
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=60 * 60,
        )

        response.set_cookie(
            key="refresh_token",
            value=result["refresh"],
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=60 * 60 * 24 * 7,
        )

        return response


class ProfileAPIView(APIView):

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):

        user = ProfileService.get_profile(
            request.user
        )

        serializer = ProfileSerializer(user)

        return Response(
            {
                "success": True,
                "message": "Profile fetched successfully.",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

    def patch(self, request):
        serializer = UpdateProfileSerializer(
            data=request.data,
            context={"request": request},
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        user = UpdateProfileService.update_profile(
            request.user,
            serializer.validated_data
        )
        out_serializer = ProfileSerializer(user)
        return Response(
            {
                "success": True,
                "message": "Profile updated successfully.",
                "data": out_serializer.data
            },
            status=status.HTTP_200_OK
        )


class AddressListCreateAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        addresses = AddressService.list_addresses(request.user)
        serializer = AddressSerializer(addresses, many=True)
        return Response(
            {
                "success": True,
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

    def post(self, request):
        serializer = AddressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        address = AddressService.create_address(request.user, serializer.validated_data)
        out_serializer = AddressSerializer(address)
        return Response(
            {
                "success": True,
                "message": "Address added successfully.",
                "data": out_serializer.data
            },
            status=status.HTTP_201_CREATED
        )


class AddressDetailAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request, uuid):
        serializer = AddressSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        address = AddressService.update_address(request.user, uuid, serializer.validated_data)
        out_serializer = AddressSerializer(address)
        return Response(
            {
                "success": True,
                "message": "Address updated successfully.",
                "data": out_serializer.data
            },
            status=status.HTTP_200_OK
        )

    def delete(self, request, uuid):
        AddressService.delete_address(request.user, uuid)
        return Response(
            {
                "success": True,
                "message": "Address deleted successfully."
            },
            status=status.HTTP_200_OK
        )


class DefaultAddressAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, uuid):
        address = AddressService.set_default_address(request.user, uuid)
        out_serializer = AddressSerializer(address)
        return Response(
            {
                "success": True,
                "message": "Address updated successfully.",
                "data": out_serializer.data
            },
            status=status.HTTP_200_OK
        )
