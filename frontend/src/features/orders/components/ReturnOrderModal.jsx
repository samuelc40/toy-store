import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, RotateCcw, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

export function ReturnOrderModal({
    isOpen,
    onClose,
    onConfirm,
    orderNumber = "",
    isLoading = false,
}) {
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");

    const reasonsList = [
        "Damaged Product",
        "Wrong Item Received",
        "Missing Parts or Accessories",
        "Quality Issue / Defective",
        "Item Defective / Not Working",
        "Other",
    ];

    useEffect(() => {
        if (isOpen) {
            setReason("");
            setDescription("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason) {
            toast.error("Please select a mandatory return reason.");
            return;
        }
        onConfirm({ reason, description });
    };

    return createPortal(
        <div className="modal-backdrop">
            <div className="orders-modal-card" role="dialog" aria-modal="true" aria-labelledby="return-modal-title">
                <div className="modal-header">
                    <div className="modal-title-group info">
                        <RotateCcw size={20} />
                        <h3 id="return-modal-title">Request Return (Order #{orderNumber})</h3>
                    </div>
                    <button type="button" className="close-modal-btn" onClick={onClose} disabled={isLoading} aria-label="Close return modal">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body-layout">
                    <p className="modal-description-text">
                        Return requests can be submitted for delivered orders. Please select the primary reason for your return.
                    </p>

                    <div className="form-group">
                        <label htmlFor="return_reason">Reason for Return <span className="required-star">*</span></label>
                        <select
                            id="return_reason"
                            className="modal-select"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        >
                            <option value="">-- Select Return Reason --</option>
                            {reasonsList.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    {reason && (
                        <div className="form-group">
                            <label htmlFor="return_description">
                                Additional Details {reason === "Other" && <span className="required-star">*</span>}
                            </label>
                            <textarea
                                id="return_description"
                                rows={3}
                                placeholder="Describe the issue or reason in detail..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={500}
                                required={reason === "Other"}
                            />
                        </div>
                    )}

                    <div className="modal-actions-row">
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
                            disabled={isLoading || !reason}
                        >
                            {isLoading ? (
                                <span className="btn-loading-content">
                                    <svg className="spinner-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.2 }}></circle>
                                        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4526" stroke="currentColor" strokeWidth="4"></path>
                                    </svg>
                                    Submitting...
                                </span>
                            ) : "Submit Return Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

export default ReturnOrderModal;
