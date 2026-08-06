import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { toast } from "react-toastify";
import { forgotPassword } from "../services/authService";
import heroImage from "../../../assets/hero.png";
import "../login/LoginPage.css";
import "../login/LoginForm.css";

const forgotPasswordSchema = yup.object({
    email: yup
        .string()
        .email("Please enter a valid email")
        .required("Email is required"),
});

function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: yupResolver(forgotPasswordSchema),
        mode: "onTouched",
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setServerError("");

        try {
            const response = await forgotPassword(data.email);
            toast.success(response.message || "OTP sent successfully.");
            navigate("/verify-reset-otp", { state: { email: data.email } });
        } catch (err) {
            console.error("Forgot password error:", err);
            const response = err.response?.data;

            if (response && typeof response === "object") {
                Object.keys(response).forEach((key) => {
                    const errorVal = response[key];
                    const errorMessage = Array.isArray(errorVal) ? errorVal[0] : errorVal;
                    if (key === "email") {
                        setError("email", { type: "server", message: errorMessage });
                    }
                });
            }

            const getFieldMsg = (val) => Array.isArray(val) ? val[0] : val;
            const message = response?.message || response?.detail || getFieldMsg(response?.email) || "Something went wrong.";
            setServerError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="login-main-content">
            <div className="bg-glow yellow-glow" />
            <div className="bg-glow purple-glow" />

            <div className="hero-decor-container">
                <img src={heroImage} className="hero-decor-image" alt="Toy stack decoration" />
            </div>

            <div className="auth-card">
                <div className="tilted-badge">PASSWORD RECOVERY</div>

                <div className="auth-card-header">
                    <h1 className="auth-title">Forgot Password</h1>
                    <p className="auth-subtitle">
                        Enter your email address and we'll send you an OTP to reset your password.
                    </p>
                </div>

                {serverError && (
                    <div className="auth-error-banner" role="alert">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className={`input-icon-wrapper ${errors.email ? "input-error" : ""}`}>
                            <Mail className="input-field-icon" size={18} />
                            <input
                                type="email"
                                id="email"
                                placeholder="collector@toyvault.com"
                                {...register("email")}
                            />
                        </div>
                        {errors.email && (
                            <span className="error-text">{errors.email.message}</span>
                        )}
                    </div>

                    <button type="submit" className="submit-btn-3d" disabled={isLoading}>
                        {isLoading ? "Sending OTP..." : "Send OTP"}
                    </button>
                </form>

                <div className="auth-switch-prompt" style={{ marginTop: "24px" }}>
                    Remember your password?{" "}
                    <button
                        type="button"
                        className="switch-auth-link"
                        onClick={() => navigate("/login")}
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </main>
    );
}

export default ForgotPasswordPage;
