import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import RegisterForm from './RegisterForm';
import GoogleLoginButton from '../login/GoogleLoginButton';
import GuestLoginButton from '../login/GuestLoginButton';
import heroImage from '../../../assets/hero.png';
import { register, googleLogin } from '../services/authService';


import {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    clearError,
    selectAuthLoading,
    selectAuthError,
} from '../authSlice';
import { toast } from 'react-toastify';
import './RegisterPage.css';

function RegisterPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isLoading = useSelector(selectAuthLoading);
    const authError = useSelector(selectAuthError);

    React.useEffect(() => {
        dispatch(clearError());
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleSubmit = async (formData, setError) => {
        dispatch(loginStart());

        try {
            console.log("Signup Data:", formData);

            const responseData = await register({
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                confirm_password: formData.confirm_password,
            });

            toast.success(responseData.message || "Registration successful! Please verify your email.");
            dispatch(logout()); // reset loading & auth states

            navigate("/verify-email", {
                state: {
                    email: formData.email,
                },
                replace: true,
            });

        } catch (err) {
            console.error("Auth signup error:", err);

            const response = err.response?.data;

            // Map field-specific validation errors from backend directly to form fields
            if (response && typeof response === 'object' && setError) {
                Object.keys(response).forEach((key) => {
                    const errorVal = response[key];
                    const errorMessage = Array.isArray(errorVal) ? errorVal[0] : errorVal;
                    if (['first_name', 'last_name', 'email', 'phone', 'password', 'confirm_password'].includes(key)) {
                        setError(key, {
                            type: 'server',
                            message: errorMessage,
                        });
                    }
                });
            }

            const getFieldMsg = (val) => Array.isArray(val) ? val[0] : val;

            const message =
                response?.message ||
                response?.detail ||
                getFieldMsg(response?.email) ||
                getFieldMsg(response?.phone) ||
                getFieldMsg(response?.password) ||
                getFieldMsg(response?.confirm_password) ||
                "Something went wrong.";

            dispatch(loginFailure(message));
            toast.error(message);
        }
    };


    const handleGoogleLogin = async (credentialResponse) => {
        dispatch(loginStart());

        try {
            const response = await googleLogin(
                credentialResponse.credential
            );

            const userObj = response.user;
            dispatch(
                loginSuccess({
                    user: userObj,
                })
            );

            toast.success("Google login successful!");
            const isAdmin = userObj?.is_superuser || userObj?.email === 'samueladmin@gmail.com' || userObj?.email?.includes('admin');
            if (isAdmin) {
                navigate("/admin/dashboard", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        } catch (error) {
            dispatch(
                loginFailure(
                    error.response?.data?.google ||
                    "Google login failed."
                )
            );
            toast.error("Google login failed!")
        }
    };

    const handleGoogleError = () => {
        dispatch(
            loginFailure("Google Sign-In was cancelled.")
        );
    };

    const handleGuestLogin = () => {
        console.log('Guest login clicked');
        alert('Continuing as guest...');
    };

    return (
        <main className="login-main-content">
            {/* Glow Effects */}
            <div className="bg-glow yellow-glow" />
            <div className="bg-glow purple-glow" />

            {/* Background Toy Image */}
            <div className="hero-decor-container">
                <img src={heroImage} className="hero-decor-image" alt="Toy stack decoration" />
            </div>

            {/* Signup Card */}
            <div className="auth-card">
                {/* Tilted Badge */}
                <div className="tilted-badge">JOIN THE CLUB!</div>

                {/* Mode Toggle Switch */}
                <div className="auth-mode-toggle">
                    <button
                        className="toggle-option toggle-active"
                        onClick={() => navigate('/register')}
                        type="button"
                    >
                        Sign Up
                    </button>
                    <button
                        className="toggle-option"
                        onClick={() => navigate('/login')}
                        type="button"
                    >
                        Login
                    </button>
                </div>

                <div className="auth-card-header">
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">
                        Unlock exclusive collectibles and early access.
                    </p>
                </div>

                {/* API error banner */}
                {authError && (
                    <div className="auth-error-banner" role="alert">
                        {authError}
                    </div>
                )}

                <RegisterForm
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                />

                <div className="auth-switch-prompt" style={{ marginTop: '16px' }}>
                    Already have an account?{' '}
                    <button
                        type="button"
                        className="switch-auth-link"
                        onClick={() => navigate('/login')}
                    >
                        Sign In
                    </button>
                </div>

                <div className="divider-container">
                    <span className="divider-line" />
                    <span className="divider-text">OR</span>
                    <span className="divider-line" />
                </div>

                <div className="social-login-buttons">
                    <GoogleLoginButton
                        onSuccess={handleGoogleLogin}
                        onError={handleGoogleError}
                    />
                    <GuestLoginButton onClick={handleGuestLogin} />
                </div>
            </div>
        </main>
    );
}

export default RegisterPage;
