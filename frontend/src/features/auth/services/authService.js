import api from '../../../api/axios';

// ---------------------------------------------------------------------------
// Auth Service — all token management is handled by HttpOnly cookies.
// These functions only deal with the response body (user data / errors).
// ---------------------------------------------------------------------------

/**
 * Login — backend sets access_token + refresh_token HttpOnly cookies.
 * @returns {object} user data from response body
 */
export const login = async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
};

/**
 * Register — backend sets access_token + refresh_token HttpOnly cookies.
 * @returns {object} user data from response body
 */
export const register = async (data) => {
    const response = await api.post('/auth/register/', data);
    return response.data;
};

/**
 * Verify Email — submits the OTP code to verify the user's email.
 * @returns {object} response body
 */
export const verifyEmail = async (data) => {
    const response = await api.post('/auth/verify-email/', data);
    return response.data;
};

/**
 * Resend OTP — requests a new OTP to be sent to the user's email.
 * @returns {object} response body
 */
export const resendOTP = async (email) => {
    const response = await api.post('/auth/resend-otp/', { email });
    return response.data;
};

/**
 * Logout — backend clears the HttpOnly cookies via Set-Cookie headers.
 */
export const logout = async () => {
    await api.post('/auth/logout/');
};

/**
 * Get current authenticated user — used on app startup and in PrivateRoute.
 * Relies on the access_token HttpOnly cookie being present.
 * Throws a 401 if the user is not authenticated (cookie missing or expired).
 * @returns {object} user data
 */
export const getMe = async () => {
    const response = await api.get('/auth/users/me/');
    return response.data;
};

export const googleLogin = async (token) => {
    const response = await api.post("/auth/google/", {
        token,
    });

    return response.data;
};

/**
 * Forgot Password — requests an OTP for password reset.
 */
export const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password/', { email });
    return response.data;
};

/**
 * Verify Reset OTP — verifies the OTP for password reset.
 */
export const verifyResetOTP = async (email, otp) => {
    const response = await api.post('/auth/verify-reset-otp/', { email, otp });
    return response.data;
};

/**
 * Reset Password — resets the password.
 */
export const resetPassword = async (data) => {
    const response = await api.post('/auth/reset-password/', data);
    return response.data;
};

/**
 * Request Email Change — requests an OTP to change email.
 */
export const changeEmail = async (new_email) => {
    const response = await api.post('/auth/change-email/', { new_email });
    return response.data;
};

/**
 * Verify Email Change — submits the OTP code to complete email change.
 */
export const verifyEmailChange = async (new_email, otp) => {
    const response = await api.post('/auth/verify-email-change/', { new_email, otp });
    return response.data;
};