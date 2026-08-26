import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { PhoneCall, X, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

import { updateProfile } from "../../profile/profileService";
import { setUser } from "../../auth/authSlice";
import "../styles/Cart.css";

export function ConfirmContactModal({
    isOpen,
    onClose,
    initialPhone = "",
    onConfirmSuccess,
}) {
    const dispatch = useDispatch();
    const inputRef = useRef(null);

    const [phone, setPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const basePhone = (initialPhone || "").trim();

    useEffect(() => {
        if (isOpen) {
            setPhone(basePhone);
            setErrorMsg("");
            setIsSubmitting(false);
            // Autofocus input when modal opens

            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 100);
        }
    }, [isOpen, basePhone]);

    // Keyboard accessibility: Escape key closes modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isOpen && e.key === "Escape" && !isSubmitting) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isSubmitting, onClose]);

    if (!isOpen) return null;

    const isPhoneChanged = phone.trim() !== basePhone;
    const cleanPhone = phone.trim();
    const isValidDigits = /^\d{10}$/.test(cleanPhone);

    const handleInputChange = (e) => {
        // Digits only validation
        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
        setPhone(val);
        if (errorMsg) setErrorMsg("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validation
        if (!cleanPhone) {
            setErrorMsg("Phone number is required.");
            return;
        }

        if (!isValidDigits) {
            setErrorMsg("Phone number must contain exactly 10 digits.");
            return;
        }

        // 2. If phone is unchanged, proceed to checkout without unnecessary API call
        if (!isPhoneChanged) {
            if (onConfirmSuccess) onConfirmSuccess();
            return;
        }

        // 3. Save edited/new phone via existing updateProfile API
        setIsSubmitting(true);
        setErrorMsg("");

        try {
            const formData = new FormData();
            formData.append("phone", cleanPhone);

            const response = await updateProfile(formData);
            if (response.success && response.data) {
                dispatch(setUser(response.data));
                toast.success("Contact number updated successfully.");
                if (onConfirmSuccess) onConfirmSuccess();
            } else {
                setErrorMsg("Failed to update contact number.");
            }
        } catch (err) {
            console.error("Profile phone update error:", err);
            const data = err.response?.data;
            const msg =
                data?.message ||
                (Array.isArray(data?.phone) ? data.phone[0] : data?.phone) ||
                "Failed to update contact number.";
            setErrorMsg(msg);
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Button label text logic
    const submitBtnText = isSubmitting
        ? "Saving..."
        : isPhoneChanged || !basePhone
            ? "Save & Continue"
            : "Continue to Checkout";

    return (
        <div
            className="confirm-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
        >
            <div className="confirm-modal-box contact-confirmation-modal-box">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="confirm-modal-close-btn"
                    aria-label="Close contact confirmation modal"
                >
                    <X size={18} />
                </button>

                {/* Header Content */}
                <div className="confirm-modal-content">
                    <div className="confirm-modal-icon-wrapper contact-icon-wrapper">
                        <PhoneCall size={24} className="confirm-modal-icon" />
                    </div>
                    <div className="confirm-modal-text-group">
                        <h4 id="contact-modal-title" className="confirm-modal-title">
                            Confirm Contact Number
                        </h4>
                        <p className="confirm-modal-message">
                            We'll use this number for delivery updates and courier communication.
                        </p>
                    </div>
                </div>

                {/* Form Input Body */}
                <form onSubmit={handleSubmit} className="contact-modal-form">
                    <div className="contact-form-group">
                        <label htmlFor="contact_phone_input" className="contact-form-label">
                            Contact Phone Number <span className="required-star">*</span>
                        </label>
                        <div className="contact-input-wrapper">
                            <span className="country-code-prefix">+91</span>
                            <input
                                ref={inputRef}
                                id="contact_phone_input"
                                type="tel"
                                maxLength={10}
                                value={phone}
                                onChange={handleInputChange}
                                placeholder="Enter 10-digit mobile number"
                                className={`contact-phone-input ${errorMsg ? "input-has-error" : ""}`}
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                        {errorMsg && <p className="contact-input-error-msg">{errorMsg}</p>}
                    </div>

                    {/* Action Buttons */}
                    <div className="confirm-modal-actions-row">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="btn-confirm-modal-cancel"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !isValidDigits}
                            className="btn-confirm-modal-confirm btn-contact-submit"
                        >
                            {isSubmitting ? (
                                <span className="btn-loading-content">
                                    <svg className="spinner-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.2 }}></circle>
                                        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4526" stroke="currentColor" strokeWidth="4"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                submitBtnText
                            )}
                        </button>
                    </div>
                </form>

                <div className="contact-modal-trust-footer">
                    <ShieldCheck size={14} />
                    <span>Your phone number is safe and never shared.</span>
                </div>
            </div>
        </div>
    );
}

export default ConfirmContactModal;
