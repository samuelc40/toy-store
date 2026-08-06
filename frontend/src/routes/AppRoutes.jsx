import { Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import HomePage from "../features/home/HomePage";
import AdminLayout from "../layouts/AdminLayout";
import LoginPage from "../features/auth/login/LoginPage";
import RegisterPage from "../features/auth/register/RegisterPage";
import VerifyEmailPage from "../features/auth/register/VerifyEmailPage";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import AdminRoute from "./AdminRoute";

import ForgotPasswordPage from "../features/auth/forgot/ForgotPasswordPage";
import VerifyResetOTPPage from "../features/auth/forgot/VerifyResetOTPPage";
import ResetPasswordPage from "../features/auth/forgot/ResetPasswordPage";
import ProfilePage from "../features/profile/ProfilePage";
import ChangeEmailPage from "../features/auth/email/ChangeEmailPage";
import VerifyEmailChangePage from "../features/auth/email/VerifyEmailChangePage";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ProductManagementPage from "../features/admin/products/pages/ProductManagementPage";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminOrdersPage from "../features/admin/orders/pages/AdminOrdersPage";
import AdminOrderDetailsPage from "../features/admin/orders/pages/AdminOrderDetailsPage";
import AdminInventoryPage from "../features/admin/inventory/pages/AdminInventoryPage";
import AdminUsers from "../pages/admin/AdminUsers";
import ProductListingPage from "../features/products/pages/ProductListingPage";
import ProductDetailsPage from "../features/products/pages/ProductDetailsPage";
import CartPage from "../features/cart/pages/CartPage";
import CategoriesPage from "../features/products/components/CategoriesPage";
import WishlistPage from "../features/wishlist/pages/WishlistPage";
import CheckoutPage from "../features/checkout/pages/CheckoutPage";
import OrderSuccessPage from "../features/checkout/pages/OrderSuccessPage";
import OrdersPage from "../features/orders/pages/OrdersPage";
import OrderDetailsPage from "../features/orders/pages/OrderDetailsPage";

function AppRoutes() {
    return (
        <Routes>
            {/* Public Layout */}
            <Route element={<UserLayout />}>
                {/* 1. Public Routes (accessible to everyone) */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductListingPage />} />
                <Route path="/products/:id" element={<ProductDetailsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/about" element={<div style={{ padding: '80px 40px' }}><h1>About Us</h1></div>} />
                <Route path="/contact" element={<div style={{ padding: '80px 40px' }}><h1>Contact Us</h1></div>} />

                {/* 2. Guest-Only Routes (ONLY accessible when NOT authenticated) */}
                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/resend-otp" element={<div style={{ padding: '80px 40px' }}><h1>Resend OTP</h1></div>} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/verify-reset-otp" element={<VerifyResetOTPPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Route>

                {/* 3. Protected Routes (require authentication, redirects to /login) */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
                    <Route path="/address" element={<div style={{ padding: '80px 40px' }}><h1>Address Management</h1></div>} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-success" element={<OrderSuccessPage />} />
                    <Route path="/change-password" element={<div style={{ padding: '80px 40px' }}><h1>Change Password</h1></div>} />
                    <Route path="/change-email" element={<ChangeEmailPage />} />
                    <Route path="/verify-email-change" element={<VerifyEmailChangePage />} />
                </Route>
            </Route>

            {/* 4. Admin-Only Routes (requires authentication and admin status) */}
            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="products" element={<ProductManagementPage />} />
                    <Route path="inventory" element={<AdminInventoryPage />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="orders/:orderId" element={<AdminOrderDetailsPage />} />
                    <Route path="users" element={<AdminUsers />} />
                </Route>
            </Route>


            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;