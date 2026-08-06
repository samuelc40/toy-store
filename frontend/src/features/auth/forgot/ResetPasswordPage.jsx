import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { resetPassword } from "../services/authService";
import heroImage from "../../../assets/hero.png";
import "../login/LoginPage.css";
import "../login/LoginForm.css";

const resetPasswordSchema = yup.object({
    password: yup
        .string()
        .required("Password is required")
        .min(8, "Password must contain at least 8 characters.")
        .matches(/[A-Z]/, "Password must contain an uppercase letter.")
        .matches(/[a-z]/, "Password must contain a lowercase letter.")
        .matches(/\d/, "Password must contain a number.")
        .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain a special character."),
    confirm_password: yup
        .string()
        .required("Confirm password is required")
        .oneOf([yup.ref("password"), null], "Passwords do not match."),
});

function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const resetToken = location.state?.reset_token || "";

    // Route guard: Redirect to /forgot-password if resetToken is missing in state
    useEffect(() => {
        if (!resetToken) {
            navigate("/forgot-password", { replace: true });
        }
    }, [resetToken, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: yupResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirm_password: "",
        },
        mode: "onTouched",
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setServerError("");

        try {
            await resetPassword({
                reset_token: resetToken,
                password: data.password,
                confirm_password: data.confirm_password,
            });

            toast.success("Password updated successfully.");
            navigate("/login", { replace: true });
        } catch (err) {
            console.error("Reset password error:", err);
            const response = err.response?.data;

            if (response && typeof response === "object") {
                Object.keys(response).forEach((key) => {
                    const errorVal = response[key];
                    const errorMessage = Array.isArray(errorVal) ? errorVal[0] : errorVal;
                    if (key === "password") {
                        setError("password", { type: "server", message: errorMessage });
                    } else if (key === "confirm_password") {
                        setError("confirm_password", { type: "server", message: errorMessage });
                    } else if (key === "reset_token") {
                        setServerError(errorMessage);
                    }
                });
            }

            const getFieldMsg = (val) => Array.isArray(val) ? val[0] : val;
            const message = response?.message || response?.detail || getFieldMsg(response?.non_field_errors) || "Failed to reset password.";
            setServerError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!resetToken) return null;

    return (
        <main className="login-main-content">
            <div className="bg-glow yellow-glow" />
            <div className="bg-glow purple-glow" />

            <div className="hero-decor-container">
                <img src={heroImage} className="hero-decor-image" alt="Toy stack decoration" />
            </div>

            <div className="auth-card">
                <div className="tilted-badge">NEW CREDENTIALS</div>

                <div className="auth-card-header">
                    <h1 className="auth-title">Reset Password</h1>
                    <p className="auth-subtitle">
                        Please enter your new password. It must meet the required strength criteria.
                    </p>
                </div>

                {serverError && (
                    <div className="auth-error-banner" role="alert">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <div className={`input-icon-wrapper ${errors.password ? "input-error" : ""}`}>
                            <Lock className="input-field-icon" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="••••••••"
                                {...register("password")}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#7b7888',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <span className="error-text">{errors.password.message}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm_password">Confirm Password</label>
                        <div className={`input-icon-wrapper ${errors.confirm_password ? "input-error" : ""}`}>
                            <Lock className="input-field-icon" size={18} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirm_password"
                                placeholder="••••••••"
                                {...register("confirm_password")}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#7b7888',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                }}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.confirm_password && (
                            <span className="error-text">{errors.confirm_password.message}</span>
                        )}
                    </div>

                    <button type="submit" className="submit-btn-3d" disabled={isLoading}>
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </main>
    );
}

export default ResetPasswordPage;
