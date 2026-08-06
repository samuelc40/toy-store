import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, AlertCircle, XCircle } from "lucide-react";

export function CancelOrderModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Cancel Order",
    item = null,
    isLoading = false,
}) {
    const [reason, setReason] = useState("");

    useEffect(() => {
        if (isOpen) {
            setReason("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(reason);
    };

    return createPortal(
        <div className="modal-backdrop">
            <div className="orders-modal-card" role="dialog" aria-modal="true" aria-labelledby="cancel-modal-title">
                <div className="modal-header">
                    <div className="modal-title-group danger">
                        <XCircle size={20} />
                        <h3 id="cancel-modal-title">{title}</h3>
                    </div>
                    <button type="button" className="close-modal-btn" onClick={onClose} disabled={isLoading} aria-label="Close cancel order modal">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body-layout">
                    <p className="modal-description-text">
                        {item ? (
                            <>Are you sure you want to cancel <strong>"{item.product_name} ({item.variant_name})"</strong>? Stock will be restored.</>
                        ) : (
                            <>Are you sure you want to cancel this entire order? Restored items will return to inventory.</>
                        )}
                    </p>

                    <div className="form-group">
                        <label htmlFor="cancel_reason">Reason for Cancellation (Optional)</label>
                        <textarea
                            id="cancel_reason"
                            rows={3}
                            placeholder="Tell us why you are cancelling (optional)..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            maxLength={500}
                        />
                    </div>

                    <div className="modal-actions-row">
                        <button
                            type="button"
                            className="modal-cancel-btn"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Keep Order
                        </button>
                        <button
                            type="submit"
                            className="modal-danger-submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="btn-loading-content">
                                    <svg className="spinner-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.2 }}></circle>
                                        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4526" stroke="currentColor" strokeWidth="4"></path>
                                    </svg>
                                    Cancelling...
                                </span>
                            ) : "Confirm Cancellation"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

export default CancelOrderModal;
