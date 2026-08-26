import React, { useState, useEffect } from "react";
import { X, Calendar, Percent, Tag, Package, AlertCircle } from "lucide-react";
import api from "../../../../api/axios";

export default function ProductOfferFormModal({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) {
    const [products, setProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    const [productId, setProductId] = useState("");
    const [discountType, setDiscountType] = useState("PERCENTAGE");
    const [discountValue, setDiscountValue] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
            if (initialData) {
                setProductId(initialData.product?.id || initialData.product_id || "");
                setDiscountType(initialData.discount_type || "PERCENTAGE");
                setDiscountValue(initialData.discount_value || "");
                setStartDate(initialData.start_date ? new Date(initialData.start_date).toISOString().slice(0, 16) : "");
                setEndDate(initialData.end_date ? new Date(initialData.end_date).toISOString().slice(0, 16) : "");
                setIsActive(initialData.is_active !== undefined ? initialData.is_active : true);
            } else {
                setProductId("");
                setDiscountType("PERCENTAGE");
                setDiscountValue("");
                setStartDate("");
                setEndDate("");
                setIsActive(true);
            }
            setErrors({});
        }
    }, [isOpen, initialData]);

    const fetchProducts = async () => {
        try {
            setIsLoadingProducts(true);
            const response = await api.get("/admin/products/", { params: { page_size: 100 } });
            const resData = response.data;
            let prodList = [];
            if (Array.isArray(resData)) {
                prodList = resData;
            } else if (Array.isArray(resData?.data?.results)) {
                prodList = resData.data.results;
            } else if (Array.isArray(resData?.results)) {
                prodList = resData.results;
            } else if (Array.isArray(resData?.data)) {
                prodList = resData.data;
            }
            setProducts(prodList);
        } catch (err) {
            console.error("Failed to fetch products for offer form:", err);
            setProducts([]);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const validateForm = () => {
        const errs = {};
        if (!productId) errs.productId = "Please select a product.";
        if (!discountValue || Number(discountValue) <= 0) errs.discountValue = "Discount value must be greater than zero.";
        if (discountType === "PERCENTAGE" && Number(discountValue) > 100) {
            errs.discountValue = "Percentage discount cannot exceed 100%.";
        }
        if (!startDate) errs.startDate = "Start date is required.";
        if (!endDate) errs.endDate = "End date is required.";
        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            errs.endDate = "End date must be after start date.";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        onSubmit({
            product_id: productId,
            discount_type: discountType,
            discount_value: Number(discountValue),
            start_date: new Date(startDate).toISOString(),
            end_date: new Date(endDate).toISOString(),
            is_active: isActive,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-container" style={{ maxWidth: "560px" }}>
                <div className="admin-modal-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Tag className="modal-header-icon" size={22} />
                        <h2 className="admin-modal-title">
                            {initialData ? "Edit Product Offer" : "Create New Product Offer"}
                        </h2>
                    </div>
                    <button type="button" className="admin-modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="admin-modal-body">
                    {/* Select Product */}
                    <div className="admin-form-group">
                        <label className="admin-form-label">
                            <Package size={15} /> Select Product *
                        </label>
                        <select
                            className={`admin-form-input ${errors.productId ? "is-invalid" : ""}`}
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            disabled={isLoadingProducts || isSubmitting}
                        >
                            <option value="">-- Choose a Product --</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.brand || "Brand"}) - {p.category_name || p.category?.name || "Category"}
                                </option>
                            ))}
                        </select>
                        {errors.productId && <span className="admin-form-error">{errors.productId}</span>}
                    </div>

                    {/* Discount Type & Value */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                <Percent size={15} /> Discount Type *
                            </label>
                            <select
                                className="admin-form-input"
                                value={discountType}
                                onChange={(e) => setDiscountType(e.target.value)}
                                disabled={isSubmitting}
                            >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FLAT">Flat Amount (Rs.)</option>
                            </select>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Discount Value ({discountType === "PERCENTAGE" ? "%" : "Rs."}) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                className={`admin-form-input ${errors.discountValue ? "is-invalid" : ""}`}
                                placeholder={discountType === "PERCENTAGE" ? "e.g. 15" : "e.g. 100"}
                                value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                disabled={isSubmitting}
                            />
                            {errors.discountValue && <span className="admin-form-error">{errors.discountValue}</span>}
                        </div>
                    </div>

                    {/* Start & End Dates */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                <Calendar size={15} /> Start Date &amp; Time *
                            </label>
                            <input
                                type="datetime-local"
                                className={`admin-form-input ${errors.startDate ? "is-invalid" : ""}`}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={isSubmitting}
                            />
                            {errors.startDate && <span className="admin-form-error">{errors.startDate}</span>}
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                <Calendar size={15} /> End Date &amp; Time *
                            </label>
                            <input
                                type="datetime-local"
                                className={`admin-form-input ${errors.endDate ? "is-invalid" : ""}`}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                disabled={isSubmitting}
                            />
                            {errors.endDate && <span className="admin-form-error">{errors.endDate}</span>}
                        </div>
                    </div>

                    {/* Active Checkbox */}
                    <div className="admin-form-group" style={{ flexDirection: "row", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                        <input
                            type="checkbox"
                            id="product-offer-active"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            disabled={isSubmitting}
                            style={{ width: "18px", height: "18px", accentColor: "var(--accent, #4f46e5)" }}
                        />
                        <label htmlFor="product-offer-active" style={{ cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
                            Activate offer immediately
                        </label>
                    </div>

                    <div className="admin-modal-footer">
                        <button type="button" className="btn-admin-cancel" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-admin-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : initialData ? "Update Offer" : "Create Offer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
