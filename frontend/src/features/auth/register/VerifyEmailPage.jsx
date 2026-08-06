import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Key } from "lucide-react";
import { toast } from "react-toastify";
import { verifyEmail, resendOTP } from "../services/authService";
import heroImage from "../../../assets/hero.png";
import "../login/LoginPage.css";
import "../login/LoginForm.css";

const verifyEmailSchema = yup.object({
    email: yup
        .string()
        .email("Please enter a valid email")
        .required("Email is required"),

    otp_code: yup
        .string()
        .matches(/^\d{6}$/, "OTP must contain exactly 6 digits")
        .required("Verification code is required"),
});

function VerifyEmailPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [otpTimer, setOtpTimer] = useState(300); // 5 minutes countdown
    const [serverError, setServerError] = useState("");

    const initialEmail = location.state?.email || "";

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        watch,
    } = useForm({
        resolver: yupResolver(verifyEmailSchema),
        defaultValues: {
            email: initialEmail,
            otp_code: "",
        },
        mode: "onTouched",
    });

    const emailValue = watch("email");

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

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setServerError("");

        try {
            const response = await verifyEmail({
                email: data.email,
                otp_code: data.otp_code,
            });

            toast.success(response.message || "Email verified successfully!");
            navigate("/login", { replace: true });
        } catch (err) {
            console.error("Verification error:", err);
            const response = err.response?.data;

            if (response && typeof response === "object") {
                // Map API validation errors (e.g. otp, email, otp_code)
                Object.keys(response).forEach((key) => {
                    const errorVal = response[key];
                    const errorMessage = Array.isArray(errorVal) ? errorVal[0] : errorVal;
                    
                    if (key === "email") {
                        setError("email", { type: "server", message: errorMessage });
                    } else if (key === "otp" || key === "otp_code") {
                        setError("otp_code", { type: "server", message: errorMessage });
                    }
                });
            }

            const getFieldMsg = (val) => Array.isArray(val) ? val[0] : val;

            const message =
                response?.message ||
                response?.detail ||
                getFieldMsg(response?.otp) ||
                getFieldMsg(response?.otp_code) ||
                getFieldMsg(response?.email) ||
                "Failed to verify code. Please try again.";

            setServerError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!emailValue) {
            toast.error("Please enter your email to resend OTP");
            return;
        }

        setIsLoading(true);
        setServerError("");

        try {
            const response = await resendOTP(emailValue);
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
                    <h1 className="auth-title">Verify Email</h1>
                    <p className="auth-subtitle">
                        Please enter your email and the 6-digit OTP sent to your inbox.
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

                    <div className="form-group">
                        <label htmlFor="otp_code">Verification Code</label>
                        <div className={`input-icon-wrapper ${errors.otp_code ? "input-error" : ""}`}>
                            <Key className="input-field-icon" size={18} />
                            <input
                                type="text"
                                id="otp_code"
                                placeholder="123456"
                                maxLength={6}
                                {...register("otp_code")}
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
                        {errors.otp_code && (
                            <span className="error-text">{errors.otp_code.message}</span>
                        )}
                    </div>

                    <button type="submit" className="submit-btn-3d" disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Verify Email"}
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

                {/* <div className="auth-switch-prompt" style={{ marginTop: "12px" }}>
                    Already verified?{" "}
                    <button
                        type="button"
                        className="switch-auth-link"
                        onClick={() => navigate("/login")}
                    >
                        Back to Sign In
                    </button>
                </div> */}
            </div>
        </main>
    );
}

export default VerifyEmailPage;
