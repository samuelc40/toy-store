import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, Loader2 } from "lucide-react";

export function DeleteCouponModal({ isOpen, onClose, onConfirm, coupon = null, isLoading = false }) {
    if (!isOpen || !coupon) return null;

    return createPortal(
        <div className="modal-backdrop">
            <div className="orders-modal-card" style={{ maxWidth: "420px" }}>
                <div className="modal-header">
                    <div className="modal-title-group warning" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <AlertTriangle size={20} color="#ef4444" />
                        <h3>Deactivate Coupon</h3>
                    </div>
                    <button type="button" className="close-modal-btn" onClick={onClose} disabled={isLoading}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body-layout" style={{ padding: "20px" }}>
                    <p style={{ fontSize: "14px", color: "var(--text-primary)", margin: "0 0 16px 0" }}>
                        Are you sure you want to deactivate coupon <strong style={{ color: "var(--accent-color)" }}>{coupon.code}</strong>?
                    </p>
                    <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: 0 }}>
                        This will soft-delete the coupon and prevent customers from using it at checkout.
                    </p>

                    <div className="modal-actions-row" style={{ marginTop: "20px" }}>
                        <button type="button" className="modal-cancel-btn" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="modal-submit-btn"
                            style={{ background: "#ef4444" }}
                            onClick={() => onConfirm(coupon.id)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="btn-loading-content">
                                    <Loader2 size={16} className="spinner-icon" />
                                    Deactivating...
                                </span>
                            ) : (
                                "Deactivate Coupon"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default DeleteCouponModal;
