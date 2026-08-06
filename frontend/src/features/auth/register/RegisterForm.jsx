import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { User, Mail, Lock, Phone } from "lucide-react";
import "./RegisterForm.css";

const signUpSchema = yup.object({
    first_name: yup
        .string()
        .required("First name is required"),

    last_name: yup
        .string()
        .required("Last name is required"),

    email: yup
        .string()
        .email("Please enter a valid email")
        .required("Email is required"),

    phone: yup
        .string()
        .matches(/^\d{10}$/, "Phone number must contain exactly 10 digits")
        .required("Phone number is required"),

    password: yup
        .string()
        .required("Password is required")
        .min(8, "Password must contain at least 8 characters")
        .matches(/[A-Z]/, "Password must contain an uppercase letter")
        .matches(/[a-z]/, "Password must contain a lowercase letter")
        .matches(/\d/, "Password must contain a number")
        .matches(
            /[!@#$%^&*(),.?":{}|<>]/,
            "Password must contain a special character"
        ),

    confirm_password: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords do not match")
        .required("Confirm password is required"),
});

function RegisterForm({ onSubmit, isLoading = false }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm({
        resolver: yupResolver(signUpSchema),
        mode: "onTouched",
    });

    const handleFormSubmit = async (data) => {
        try {
            await onSubmit(data, setError);
        } catch (error) {
            console.error("Register form submission error:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="auth-form">
            <div className="form-row-grid">
                <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <div className={`input-icon-wrapper ${errors.first_name ? "input-error" : ""}`}>
                        <User className="input-field-icon" size={18} />
                        <input
                            type="text"
                            id="first_name"
                            placeholder="John"
                            {...register("first_name")}
                        />
                    </div>
                    {errors.first_name && (
                        <span className="error-text">{errors.first_name.message}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <div className={`input-icon-wrapper ${errors.last_name ? "input-error" : ""}`}>
                        <User className="input-field-icon" size={18} />
                        <input
                            type="text"
                            id="last_name"
                            placeholder="Doe"
                            {...register("last_name")}
                        />
                    </div>
                    {errors.last_name && (
                        <span className="error-text">{errors.last_name.message}</span>
                    )}
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className={`input-icon-wrapper ${errors.phone ? "input-error" : ""}`}>
                    <Phone className="input-field-icon" size={18} />
                    <input
                        type="text"
                        id="phone"
                        placeholder="9876543210"
                        {...register("phone")}
                    />
                </div>
                {errors.phone && (
                    <span className="error-text">{errors.phone.message}</span>
                )}
            </div>

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
                        type="password"
                        id="password"
                        placeholder="••••••••"
                        {...register("password")}
                    />
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
                        type="password"
                        id="confirm_password"
                        placeholder="••••••••"
                        {...register("confirm_password")}
                    />
                </div>
                {errors.confirm_password && (
                    <span className="error-text">{errors.confirm_password.message}</span>
                )}
            </div>

            <button type="submit" className="submit-btn-3d" disabled={isLoading}>
                {isLoading ? "Please wait..." : "Sign Up"}
            </button>
        </form>
    );
}

export default RegisterForm;
