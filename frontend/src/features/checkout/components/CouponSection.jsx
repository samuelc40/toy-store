import React, { useState } from "react";
import { Ticket, Tag, ChevronDown, ChevronUp, CheckCircle, X, Loader2 } from "lucide-react";
import { applyCoupon, removeCoupon, fetchAvailableCoupons } from "../../coupons/services/couponService";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";
import "./CouponSection.css";

export function CouponSection({ appliedCoupon, couponDiscount = 0, onCouponUpdated }) {
    const [isExpanded, setIsExpanded] = useState(Boolean(appliedCoupon));
    const [couponCodeInput, setCouponCodeInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [availableModalOpen, setAvailableModalOpen] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [fetchingAvailable, setFetchingAvailable] = useState(false);

    const handleApply = async (codeToApply) => {
        const code = codeToApply || couponCodeInput;
        if (!code || !code.trim()) {
            toast.error("Please enter a valid coupon code.");
            return;
        }

        try {
            setLoading(true);
            const data = await applyCoupon(code.trim());
            toast.success(data.message || "Coupon applied successfully!");
            setCouponCodeInput("");
            if (availableModalOpen) setAvailableModalOpen(false);
            if (onCouponUpdated) onCouponUpdated(data.data);
        } catch (err) {
            const msg = err.response?.data?.coupon || err.response?.data?.message || "Failed to apply coupon.";
            toast.error(typeof msg === "object" ? Object.values(msg).flat().join(" ") : msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        try {
            setLoading(true);
            const data = await removeCoupon();
            toast.info(data.message || "Coupon removed.");
            if (onCouponUpdated) onCouponUpdated(data.data);
        } catch (err) {
            toast.error("Failed to remove coupon.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAvailableModal = async () => {
        setAvailableModalOpen(true);
        try {
            setFetchingAvailable(true);
            const data = await fetchAvailableCoupons();
            setAvailableCoupons(data.data || []);
        } catch (err) {
            toast.error("Failed to fetch available coupons.");
        } finally {
            setFetchingAvailable(false);
        }
    };

    return (
        <div className="coupon-section-card">
            {appliedCoupon ? (
                <div className="coupon-applied-box">
                    <div className="coupon-applied-meta">
                        <CheckCircle size={20} className="text-success" />
                        <div>
                            <span className="coupon-applied-code">{appliedCoupon.code}</span>
                            <div className="coupon-applied-saving">
                                Saved Rs. {Number(couponDiscount || 0).toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={loading}
                        className="btn-remove-coupon"
                        aria-label="Remove coupon code"
                    >
                        {loading ? <Loader2 size={14} className="spinner-icon" /> : <X size={14} />}
                        <span>Remove</span>
                    </button>
                </div>
            ) : (
                <>
                    <button
                        type="button"
                        className="coupon-toggle-btn"
                        onClick={() => setIsExpanded(!isExpanded)}
                        aria-expanded={isExpanded}
                    >
                        <div className="coupon-toggle-left">
                            <Ticket size={18} className="coupon-toggle-icon" />
                            <span>Have a Coupon Code?</span>
                        </div>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {isExpanded && (
                        <div className="coupon-expand-body">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleApply();
                                }}
                                className="coupon-input-group"
                            >
                                <div className="coupon-input-wrapper">
                                    <input
                                        type="text"
                                        className="coupon-text-input"
                                        placeholder="ENTER CODE"
                                        value={couponCodeInput}
                                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                                        disabled={loading}
                                        aria-label="Coupon code input"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn-apply-coupon"
                                    disabled={loading || !couponCodeInput.trim()}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="spinner-icon" />
                                            <span>Applying...</span>
                                        </>
                                    ) : (
                                        "Apply"
                                    )}
                                </button>
                            </form>

                            <button
                                type="button"
                                className="btn-view-available"
                                onClick={handleOpenAvailableModal}
                            >
                                <Tag size={14} />
                                <span>View Available Coupons</span>
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Available Coupons Modal */}
            {availableModalOpen &&
                createPortal(
                    <div className="modal-backdrop">
                        <div className="orders-modal-card" style={{ maxWidth: "480px" }}>
                            <div className="modal-header">
                                <div className="modal-title-group info">
                                    <Tag size={20} />
                                    <h3>Available Coupons</h3>
                                </div>
                                <button
                                    type="button"
                                    className="close-modal-btn"
                                    onClick={() => setAvailableModalOpen(false)}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="modal-body-layout" style={{ padding: "16px 20px" }}>
                                {fetchingAvailable ? (
                                    <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-secondary)" }}>
                                        <Loader2 size={24} className="spinner-icon" style={{ marginBottom: "8px" }} />
                                        <p style={{ margin: 0, fontSize: "13.5px" }}>Checking valid coupons for your cart...</p>
                                    </div>
                                ) : availableCoupons.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-secondary)" }}>
                                        <Ticket size={32} style={{ opacity: 0.4, marginBottom: "8px" }} />
                                        <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>No coupons available for your current order.</p>
                                    </div>
                                ) : (
                                    <div className="available-coupons-list">
                                        {availableCoupons.map((c) => (
                                            <div key={c.id} className="coupon-card-item">
                                                <div>
                                                    <span className="coupon-card-badge">{c.code}</span>
                                                    <p className="coupon-card-desc">{c.description || "Special Discount"}</p>
                                                    <div className="coupon-card-meta">
                                                        {Number(c.minimum_order_amount) > 0 && (
                                                            <span>Min Order: Rs. {Number(c.minimum_order_amount).toFixed(2)} • </span>
                                                        )}
                                                        <span>Expires: {new Date(c.end_date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn-apply-coupon"
                                                    style={{ height: "36px", fontSize: "12.5px", padding: "0 14px" }}
                                                    onClick={() => handleApply(c.code)}
                                                    disabled={loading}
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}

export default CouponSection;
