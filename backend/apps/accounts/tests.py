from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class ChangePasswordAPITests(APITestCase):

    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            email="testuser@example.com",
            first_name="Test",
            last_name="User",
            password="OldPassword123!",
            is_verified=True
        )
        self.url = reverse("change-password")

        # Generate tokens
        self.refresh = RefreshToken.for_user(self.user)
        self.access_token = str(self.refresh.access_token)

    def authenticate_client(self):
        self.client.cookies['access_token'] = self.access_token
        self.client.cookies['refresh_token'] = str(self.refresh)

    def test_change_password_unauthorized(self):
        # Request without authenticating
        data = {
            "current_password": "OldPassword123!",
            "new_password": "NewPassword123!",
            "confirm_password": "NewPassword123!"
        }
        response = self.client.patch(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_change_password_success(self):
        self.authenticate_client()
        data = {
            "current_password": "OldPassword123!",
            "new_password": "NewPassword123!",
            "confirm_password": "NewPassword123!"
        }
        response = self.client.patch(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["message"], "Password changed successfully.")

        # Check cookies were deleted
        access_cookie = response.cookies.get("access_token")
        refresh_cookie = response.cookies.get("refresh_token")
        
        # When deleted, Django sets the cookie value to empty string and max-age=0
        self.assertEqual(access_cookie.value, "")
        self.assertEqual(access_cookie["max-age"], 0)
        self.assertEqual(refresh_cookie.value, "")
        self.assertEqual(refresh_cookie["max-age"], 0)

        # Check that user password was updated and we can log in with new password
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewPassword123!"))
        self.assertFalse(self.user.check_password("OldPassword123!"))

    def test_change_password_incorrect_current_password(self):
        self.authenticate_client()
        data = {
            "current_password": "WrongPassword123!",
            "new_password": "NewPassword123!",
            "confirm_password": "NewPassword123!"
        }
        response = self.client.patch(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("current_password", response.data)

    def test_change_password_same_as_current(self):
        self.authenticate_client()
        data = {
            "current_password": "OldPassword123!",
            "new_password": "OldPassword123!",
            "confirm_password": "OldPassword123!"
        }
        response = self.client.patch(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("new_password", response.data)

    def test_change_password_mismatched_confirm(self):
        self.authenticate_client()
        data = {
            "current_password": "OldPassword123!",
            "new_password": "NewPassword123!",
            "confirm_password": "MismatchedPassword123!"
        }
        response = self.client.patch(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("confirm_password", response.data)

    def test_change_password_weak_new_password(self):
        self.authenticate_client()
        weak_passwords = [
            "short",          # Too short
            "NoSpecialNum",    # Missing special char and number
            "nospecial123",    # Missing uppercase and special char
            "NOSPECIAL123",    # Missing lowercase and special char
            "NoUppercase!",    # Missing number
            "NoNumber!a",      # Missing number
        ]
        for pwd in weak_passwords:
            data = {
                "current_password": "OldPassword123!",
                "new_password": pwd,
                "confirm_password": pwd
            }
            response = self.client.patch(self.url, data, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, f"Failed for password: {pwd}")
            self.assertIn("new_password", response.data)
