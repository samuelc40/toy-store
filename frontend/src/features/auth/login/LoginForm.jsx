import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";
import { useState } from "react";

const signInSchema = yup.object({
    email: yup
        .string()
        .email("Please enter a valid email")
        .required("Email is required"),

    password: yup
        .string()
        .required("Password is required"),
});

function LoginForm({ onSubmit, isLoading = false }) {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: yupResolver(signInSchema),
        mode: "onTouched",
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleFormSubmit = async (data) => {
        try {
            await onSubmit(data, setError);
        } catch (error) {
            console.error("Login form submission error:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="auth-form">
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
                <label htmlFor="password">Password</label>
                <div className={`input-icon-wrapper ${errors.password ? "input-error" : ""}`}>
                    <Lock className="input-field-icon" size={18} />
                    <input
                        type={showPassword ? "text" : "password"}
                        // type="password"
                        id="password"
                        placeholder="••••••••"
                        {...register("password")}
                    />
                    <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                {errors.password && (
                    <span className="error-text">{errors.password.message}</span>
                )}
            </div>

            <div className="form-options" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px', marginBottom: '16px' }}>
                <button
                    type="button"
                    className="switch-auth-link"
                    style={{ fontSize: '13px', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    onClick={() => navigate('/forgot-password')}
                >
                    Forgot Password?
                </button>
            </div>

            <button type="submit" className="submit-btn-3d" disabled={isLoading}>
                {isLoading ? "Please wait..." : "Sign In"}
            </button>
        </form>
    );
}

export default LoginForm;