import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { X, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { changePassword } from "./profileService";
import { logout as localLogout } from "../auth/authSlice";

const changePasswordSchema = yup.object({
    current_password: yup
        .string()
        .required("Current password is required"),

    new_password: yup
        .string()
        .required("New password is required")
        .min(8, "Password must contain at least 8 characters")
        .matches(/[A-Z]/, "Password must contain an uppercase letter")
        .matches(/[a-z]/, "Password must contain a lowercase letter")
        .matches(/\d/, "Password must contain a number")
        .matches(
            /[!@#$%^&*(),.?":{}|<>]/,
            "Password must contain a special character"
        )
        .notOneOf([yup.ref("current_password")], "New password must not be the same as current password"),

    confirm_password: yup
        .string()
        .oneOf([yup.ref("new_password")], "Passwords do not match")
        .required("Confirm password is required"),
});

function ChangePasswordModal({ isOpen, onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(changePasswordSchema),
        defaultValues: {
            current_password: "",
            new_password: "",
            confirm_password: "",
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });
            setShowCurrent(false);
            setShowNew(false);
            setShowConfirm(false);
        }
    }, [isOpen, reset]);

    if (!isOpen) return null;

    const onSubmitForm = async (data) => {
        setIsLoading(true);
        try {
            await changePassword({
                current_password: data.current_password,
                new_password: data.new_password,
                confirm_password: data.confirm_password,
            });

            toast.success("Password changed successfully. Please sign in again.");
            onClose();
            dispatch(localLogout());
            navigate("/login");
        } catch (err) {
            console.error("Change password error:", err);
            const response = err.response?.data;
            if (response && typeof response === "object") {
                Object.keys(response).forEach((key) => {
                    if (["current_password", "new_password", "confirm_password"].includes(key)) {
                        const errorMsg = Array.isArray(response[key]) ? response[key][0] : response[key];
                        setError(key, {
                            type: "server",
                            message: errorMsg,
                        });
                    }
                });
            } else {
                toast.error(response?.message || "Failed to change password. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        <div className="modal-backdrop">
            <div className="address-modal-card">
                <div className="modal-header">
                    <h3 className="modal-title">Change Password</h3>
                    <button type="button" className="close-modal-btn" onClick={onClose} disabled={isLoading}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmitForm)} className="address-form-layout">
                    <div className="form-group">
                        <label htmlFor="current_password">Current Password</label>
                        <div className={`input-icon-wrapper ${errors.current_password ? "input-error" : ""}`}>
                            <Lock className="input-icon" size={18} />
                            <input
                                type={showCurrent ? "text" : "password"}
                                id="current_password"
                                placeholder="••••••••"
                                {...register("current_password")}
                                style={{ paddingRight: "44px" }}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowCurrent(!showCurrent)}
                                aria-label={showCurrent ? "Hide current password" : "Show current password"}
                            >
                                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.current_password && (
                            <span className="error-text-small" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <AlertCircle size={12} />
                                {errors.current_password.message}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="new_password">New Password</label>
                        <div className={`input-icon-wrapper ${errors.new_password ? "input-error" : ""}`}>
                            <Lock className="input-icon" size={18} />
                            <input
                                type={showNew ? "text" : "password"}
                                id="new_password"
                                placeholder="••••••••"
                                {...register("new_password")}
                                style={{ paddingRight: "44px" }}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowNew(!showNew)}
                                aria-label={showNew ? "Hide new password" : "Show new password"}
                            >
                                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.new_password && (
                            <span className="error-text-small" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <AlertCircle size={12} />
                                {errors.new_password.message}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm_password">Confirm Password</label>
                        <div className={`input-icon-wrapper ${errors.confirm_password ? "input-error" : ""}`}>
                            <Lock className="input-icon" size={18} />
                            <input
                                type={showConfirm ? "text" : "password"}
                                id="confirm_password"
                                placeholder="••••••••"
                                {...register("confirm_password")}
                                style={{ paddingRight: "44px" }}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowConfirm(!showConfirm)}
                                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                            >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.confirm_password && (
                            <span className="error-text-small" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <AlertCircle size={12} />
                                {errors.confirm_password.message}
                            </span>
                        )}
                    </div>

                    <div className="modal-actions-row" style={{ marginTop: "12px" }}>
                        <button
                            type="button"
                            className="modal-cancel-btn"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="modal-submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="btn-loading-content">
                                    <svg className="spinner-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 31.4" style={{ opacity: 0.2 }}></circle>
                                        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4526" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                                    </svg>
                                    Changing...
                                </span>
                            ) : "Change Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

export default ChangePasswordModal;
