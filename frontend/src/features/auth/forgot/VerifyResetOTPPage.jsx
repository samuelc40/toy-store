import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Key } from "lucide-react";
import { toast } from "react-toastify";
import { verifyResetOTP, forgotPassword } from "../services/authService";
import heroImage from "../../../assets/hero.png";
import "../login/LoginPage.css";
import "../login/LoginForm.css";

const verifyResetOTPSchema = yup.object({
    email: yup
        .string()
        .email("Please enter a valid email")
        .required("Email is required"),
    otp: yup
        .string()
        .matches(/^\d{6}$/, "OTP must contain exactly 6 digits")
        .required("Verification code is required"),
});

function VerifyResetOTPPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [otpTimer, setOtpTimer] = useState(300); // 5 minutes countdown
    const [serverError, setServerError] = useState("");

    const initialEmail = location.state?.email || "";

    // Route guard: Redirect to /forgot-password if email is missing in state
    useEffect(() => {
        if (!initialEmail) {
            navigate("/forgot-password", { replace: true });
        }
    }, [initialEmail, navigate]);

    // Cooldown timer for resending OTP
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    // OTP Expiry countdown timer
    useEffect(() => {
        if (otpTimer > 0) {
            const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [otpTimer]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: yupResolver(verifyResetOTPSchema),
        defaultValues: {
            email: initialEmail,
            otp: "",
        },
        mode: "onTouched",
    });

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setServerError("");

        try {
            const response = await verifyResetOTP(data.email, data.otp);
            const resetToken = response.data?.reset_token;

            if (!resetToken) {
                throw new Error("Reset token not received.");
            }

            toast.success("OTP verified.");
            navigate("/reset-password", { state: { reset_token: resetToken, email: data.email } });
        } catch (err) {
            console.error("OTP verification error:", err);
            const response = err.response?.data;

            if (response && typeof response === "object") {
                Object.keys(response).forEach((key) => {
                    const errorVal = response[key];
                    const errorMessage = Array.isArray(errorVal) ? errorVal[0] : errorVal;
                    if (key === "email") {
                        setError("email", { type: "server", message: errorMessage });
                    } else if (key === "otp") {
                        setError("otp", { type: "server", message: errorMessage });
                    }
                });
            }

            const getFieldMsg = (val) => Array.isArray(val) ? val[0] : val;
            const message =
                response?.message ||
                response?.detail ||
                getFieldMsg(response?.otp) ||
                getFieldMsg(response?.email) ||
                "Failed to verify code. Please try again.";

            setServerError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!initialEmail) return;

        setIsLoading(true);
        setServerError("");

        try {
            const response = await forgotPassword(initialEmail);
            toast.success(response.message || "Verification code resent successfully!");
            setCooldown(60); // 60 seconds cooldown
            setOtpTimer(300); // Reset OTP expiry to 5 minutes
        } catch (err) {
            console.error("Resend error:", err);
            const response = err.response?.data;
            const getFieldMsg = (val) => Array.isArray(val) ? val[0] : val;
            const message = response?.message || response?.detail || getFieldMsg(response?.email) || "Failed to resend OTP.";
            setServerError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!initialEmail) return null;

    return (
        <main className="login-main-content">
            <div className="bg-glow yellow-glow" />
            <div className="bg-glow purple-glow" />

            <div className="hero-decor-container">
                <img src={heroImage} className="hero-decor-image" alt="Toy stack decoration" />
            </div>

            <div className="auth-card">
                <div className="tilted-badge">SECURE ACCESS</div>

                <div className="auth-card-header">
                    <h1 className="auth-title">Verify Reset OTP</h1>
                    <p className="auth-subtitle">
                        Please enter the 6-digit OTP sent to your email to verify reset request.
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
                        <div className="input-icon-wrapper input-disabled" style={{ opacity: 0.7, backgroundColor: '#f9f9fb' }}>
                            <Mail className="input-field-icon" size={18} />
                            <input
                                type="email"
                                id="email"
                                disabled
                                {...register("email")}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="otp">Verification Code</label>
                        <div className={`input-icon-wrapper ${errors.otp ? "input-error" : ""}`}>
                            <Key className="input-field-icon" size={18} />
                            <input
                                type="text"
                                id="otp"
                                placeholder="123456"
                                maxLength={6}
                                {...register("otp")}
                            />
                        </div>
                        {otpTimer > 0 ? (
                            <span className="otp-expiry-text" style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginTop: '6px' }}>
                                OTP expires in: <strong style={{ color: '#8c52ff' }}>{formatTime(otpTimer)}</strong>
                            </span>
                        ) : (
                            <span className="otp-expiry-text" style={{ fontSize: '13px', color: '#ef4444', display: 'block', marginTop: '6px' }}>
                                OTP has expired. Please request a new code.
                            </span>
                        )}
                        {errors.otp && (
                            <span className="error-text">{errors.otp.message}</span>
                        )}
                    </div>

                    <button type="submit" className="submit-btn-3d" disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>

                <div className="auth-switch-prompt" style={{ marginTop: "24px" }}>
                    Didn't receive the code?{" "}
                    <button
                        type="button"
                        className="switch-auth-link"
                        disabled={isLoading || cooldown > 0}
                        onClick={handleResend}
                    >
                        {cooldown > 0 ? `Resend Code in ${cooldown}s` : "Resend OTP"}
                    </button>
                </div>
            </div>
        </main>
    );
}

export default VerifyResetOTPPage;
