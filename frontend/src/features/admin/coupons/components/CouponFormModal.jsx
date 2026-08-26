import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Ticket, Loader2 } from "lucide-react";

export function CouponFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData = null,
    isLoading = false,
}) {
    const [formData, setFormData] = useState({
        code: "",
        description: "",
        discount_type: "PERCENTAGE",
        discount_value: "",
        minimum_order_amount: "0.00",
        maximum_discount_amount: "",
        usage_limit: 0,
        per_user_limit: 1,
        start_date: "",
        end_date: "",
        is_active: true,
    });

    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        setFieldErrors({});
        if (isOpen && initialData) {
            setFormData({
                code: initialData.code || "",
                description: initialData.description || "",
                discount_type: initialData.discount_type || "PERCENTAGE",
                discount_value: initialData.discount_value || "",
                minimum_order_amount: initialData.minimum_order_amount || "0.00",
                maximum_discount_amount: initialData.maximum_discount_amount || "",
                usage_limit: initialData.usage_limit || 0,
                per_user_limit: initialData.per_user_limit || 1,
                start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().slice(0, 16) : "",
                end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().slice(0, 16) : "",
                is_active: initialData.is_active !== undefined ? initialData.is_active : true,
            });
        } else if (isOpen) {
            const now = new Date();
            const defaultStart = now.toISOString().slice(0, 16);
            const defaultEnd = new Date(now.setDate(now.getDate() + 30)).toISOString().slice(0, 16);
            setFormData({
                code: "",
                description: "",
                discount_type: "PERCENTAGE",
                discount_value: "",
                minimum_order_amount: "0.00",
                maximum_discount_amount: "",
                usage_limit: 0,
                per_user_limit: 1,
                start_date: defaultStart,
                end_date: defaultEnd,
                is_active: true,
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const renderFieldError = (fieldName) => {
        const error = fieldErrors[fieldName];
        if (!error) return null;
        return (
            <span className="form-field-error">
                {Array.isArray(error) ? error.join(" ") : error}
            </span>
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        // Client-side quick checks
        const errors = {};
        const cleanCode = formData.code.trim();
        if (cleanCode.length < 3) {
            errors.code = "Coupon code must contain at least 3 characters.";
        } else if (cleanCode.length > 30) {
            errors.code = "Coupon code cannot exceed 30 characters.";
        } else if (/\s/.test(cleanCode)) {
            errors.code = "Coupon code cannot contain spaces.";
        } else if (!/^[A-Z0-9_]+$/.test(cleanCode)) {
            errors.code = "Coupon code may only contain uppercase letters, numbers, and underscores.";
        }

        const discVal = parseFloat(formData.discount_value);
        if (isNaN(discVal) || discVal <= 0) {
            errors.discount_value = "Discount value must be greater than zero.";
        } else if (formData.discount_type === "PERCENTAGE" && discVal > 100) {
            errors.discount_value = "Percentage discount cannot exceed 100%.";
        }

        if (formData.start_date && formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
            errors.end_date = "End date must be later than start date.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        const payload = {
            ...formData,
            code: cleanCode,
            discount_value: formData.discount_value !== "" ? parseFloat(formData.discount_value) : null,
            minimum_order_amount: formData.minimum_order_amount !== "" ? parseFloat(formData.minimum_order_amount) : "0.00",
            maximum_discount_amount: (formData.discount_type === "PERCENTAGE" && formData.maximum_discount_amount !== "" && formData.maximum_discount_amount !== null)
                ? parseFloat(formData.maximum_discount_amount)
                : null,
            usage_limit: formData.usage_limit !== "" ? parseInt(formData.usage_limit, 10) : 0,
            per_user_limit: formData.per_user_limit !== "" ? parseInt(formData.per_user_limit, 10) : 1,
        };

        const backendErrors = await onSubmit(payload);
        if (backendErrors && typeof backendErrors === "object") {
            setFieldErrors(backendErrors);
        }
    };

    const generalError = fieldErrors.non_field_errors || fieldErrors.detail;

    return createPortal(
        <div className="modal-backdrop">
            <div className="orders-modal-card" style={{ maxWidth: "580px" }}>
                <div className="modal-header">
                    <div className="modal-title-group info">
                        <Ticket size={20} />
                        <h3>{initialData ? "Edit Coupon" : "Create New Coupon"}</h3>
                    </div>
                    <button type="button" className="close-modal-btn" onClick={onClose} disabled={isLoading}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body-layout" style={{ padding: "20px" }}>
                    {generalError && (
                        <div className="modal-error-banner">
                            {Array.isArray(generalError) ? generalError.join(" ") : generalError}
                        </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                        <div className="form-group">
                            <label>Coupon Code *</label>
                            <input
                                type="text"
                                name="code"
                                className={`modal-select ${fieldErrors.code ? "input-error" : ""}`}
                                value={formData.code}
                                onChange={(e) => {
                                    setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }));
                                    if (fieldErrors.code) setFieldErrors((prev) => ({ ...prev, code: null }));
                                }}
                                placeholder="SUMMER20"
                                required
                            />
                            {renderFieldError("code")}
                        </div>

                        <div className="form-group">
                            <label>Discount Type *</label>
                            <select
                                name="discount_type"
                                className={`modal-select ${fieldErrors.discount_type ? "input-error" : ""}`}
                                value={formData.discount_type}
                                onChange={handleChange}
                                required
                            >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED">Fixed Amount (Rs.)</option>
                            </select>
                            {renderFieldError("discount_type")}
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "12px" }}>
                        <div className="form-group">
                            <label>Discount Value *</label>
                            <input
                                type="number"
                                step="0.01"
                                name="discount_value"
                                className={`modal-select ${fieldErrors.discount_value ? "input-error" : ""}`}
                                value={formData.discount_value}
                                onChange={handleChange}
                                placeholder={formData.discount_type === "PERCENTAGE" ? "20" : "150.00"}
                                required
                            />
                            {renderFieldError("discount_value")}
                        </div>

                        <div className="form-group">
                            <label>Minimum Order Amount (Rs.)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="minimum_order_amount"
                                className={`modal-select ${fieldErrors.minimum_order_amount ? "input-error" : ""}`}
                                value={formData.minimum_order_amount}
                                onChange={handleChange}
                                placeholder="0.00"
                            />
                            {renderFieldError("minimum_order_amount")}
                        </div>
                    </div>

                    {formData.discount_type === "PERCENTAGE" && (
                        <div className="form-group" style={{ marginTop: "12px" }}>
                            <label>Maximum Discount Cap (Rs.) (Optional)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="maximum_discount_amount"
                                className={`modal-select ${fieldErrors.maximum_discount_amount ? "input-error" : ""}`}
                                value={formData.maximum_discount_amount}
                                onChange={handleChange}
                                placeholder="500.00"
                            />
                            {renderFieldError("maximum_discount_amount")}
                        </div>
                    )}

                    <div className="form-group" style={{ marginTop: "12px" }}>
                        <label>Description</label>
                        <input
                            type="text"
                            name="description"
                            className={`modal-select ${fieldErrors.description ? "input-error" : ""}`}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Get 20% off on all orders above Rs. 999"
                        />
                        {renderFieldError("description")}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "12px" }}>
                        <div className="form-group">
                            <label>Total Usage Limit (0 = Unlimited)</label>
                            <input
                                type="number"
                                name="usage_limit"
                                className={`modal-select ${fieldErrors.usage_limit ? "input-error" : ""}`}
                                value={formData.usage_limit}
                                onChange={handleChange}
                            />
                            {renderFieldError("usage_limit")}
                        </div>

                        <div className="form-group">
                            <label>Per User Limit</label>
                            <input
                                type="number"
                                name="per_user_limit"
                                className={`modal-select ${fieldErrors.per_user_limit ? "input-error" : ""}`}
                                value={formData.per_user_limit}
                                onChange={handleChange}
                            />
                            {renderFieldError("per_user_limit")}
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "12px" }}>
                        <div className="form-group">
                            <label>Start Date *</label>
                            <input
                                type="datetime-local"
                                name="start_date"
                                className={`modal-select ${fieldErrors.start_date ? "input-error" : ""}`}
                                value={formData.start_date}
                                onChange={handleChange}
                                required
                            />
                            {renderFieldError("start_date")}
                        </div>

                        <div className="form-group">
                            <label>End Date *</label>
                            <input
                                type="datetime-local"
                                name="end_date"
                                className={`modal-select ${fieldErrors.end_date ? "input-error" : ""}`}
                                value={formData.end_date}
                                onChange={handleChange}
                                required
                            />
                            {renderFieldError("end_date")}
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "16px" }}>
                        <input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            style={{ width: "18px", height: "18px", accentColor: "var(--accent-color)" }}
                        />
                        <label htmlFor="is_active" style={{ fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                            Active Coupon
                        </label>
                    </div>

                    <div className="modal-actions-row" style={{ marginTop: "20px" }}>
                        <button type="button" className="modal-cancel-btn" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </button>
                        <button type="submit" className="modal-submit-btn" disabled={isLoading}>
                            {isLoading ? (
                                <span className="btn-loading-content">
                                    <Loader2 size={16} className="spinner-icon" />
                                    Saving...
                                </span>
                            ) : initialData ? (
                                "Update Coupon"
                            ) : (
                                "Create Coupon"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

export default CouponFormModal;
