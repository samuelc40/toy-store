import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../authSlice";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { changeEmail } from "../services/authService";
import heroImage from "../../../assets/hero.png";
import "../login/LoginPage.css";
import "../login/LoginForm.css";

const changeEmailSchema = yup.object({
    new_email: yup
        .string()
        .email("Please enter a valid email")
        .required("New email is required"),
});

function ChangeEmailPage() {
    const navigate = useNavigate();
    const currentUser = useSelector(selectUser);
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: yupResolver(changeEmailSchema),
        mode: "onTouched",
    });

    const onSubmit = async (data) => {
        if (data.new_email.toLowerCase() === currentUser?.email?.toLowerCase()) {
            setError("new_email", {
                type: "manual",
                message: "New email must be different from current email.",
            });
            return;
        }

        setIsLoading(true);
        setServerError("");

        try {
            const response = await changeEmail(data.new_email);
            toast.success(response.message || "Verification code sent to your new email.");
            navigate("/verify-email-change", { state: { new_email: data.new_email } });
        } catch (err) {
            console.error("Change email error:", err);
            const response = err.response?.data;

            if (response && typeof response === "object") {
                Object.keys(response).forEach((key) => {
                    const errorVal = response[key];
                    const errorMessage = Array.isArray(errorVal) ? errorVal[0] : errorVal;
                    if (key === "new_email") {
                        setError("new_email", { type: "server", message: errorMessage });
                    }
                });
            }

            const getFieldMsg = (val) => Array.isArray(val) ? val[0] : val;
            const message = response?.message || response?.detail || getFieldMsg(response?.new_email) || "Something went wrong.";
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
                <div className="tilted-badge">SECURITY SETUP</div>

                <div className="auth-card-header">
                    <button 
                        type="button" 
                        className="back-arrow-btn"
                        onClick={() => navigate("/profile")}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#7b7888",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "13px",
                            fontWeight: 700,
                            padding: 0,
                            marginBottom: "16px"
                        }}
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Profile</span>
                    </button>
                    <h1 className="auth-title">Change Email</h1>
                    <p className="auth-subtitle">
                        Enter your new email address. We will send you an OTP to verify and activate it.
                    </p>
                </div>

                {serverError && (
                    <div className="auth-error-banner" role="alert">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="current_email">Current Email</label>
                        <div className="input-icon-wrapper input-disabled" style={{ opacity: 0.7, backgroundColor: 'var(--bg-input)' }}>
                            <Mail className="input-field-icon" size={18} />
                            <input
                                type="email"
                                id="current_email"
                                disabled
                                value={currentUser?.email || ""}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="new_email">New Email Address</label>
                        <div className={`input-icon-wrapper ${errors.new_email ? "input-error" : ""}`}>
                            <Mail className="input-field-icon" size={18} />
                            <input
                                type="email"
                                id="new_email"
                                placeholder="newcollector@toyvault.com"
                                {...register("new_email")}
                            />
                        </div>
                        {errors.new_email && (
                            <span className="error-text">{errors.new_email.message}</span>
                        )}
                    </div>

                    <button type="submit" className="submit-btn-3d" disabled={isLoading}>
                        {isLoading ? "Sending OTP..." : "Send Verification OTP"}
                    </button>
                </form>
            </div>
        </main>
    );
}

export default ChangeEmailPage;
