import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, RefreshCw } from "lucide-react";

export function AdminOrderStatusModal({
    isOpen,
    onClose,
    onConfirm,
    order = null,
    isLoading = false,
}) {
    const [selectedStatus, setSelectedStatus] = useState("");

    const currentStatus = order?.order_status || "PENDING";

    const ALL_STATUS_OPTIONS = [
        { key: "PENDING", label: "Pending" },
        { key: "CONFIRMED", label: "Confirmed" },
        { key: "PACKED", label: "Packed" },
        { key: "SHIPPED", label: "Shipped" },
        { key: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
        { key: "DELIVERED", label: "Delivered" },
        { key: "CANCELLED", label: "Cancelled" },
        { key: "RETURN_REQUESTED", label: "Return Requested" },
        { key: "RETURNED", label: "Returned" },
    ];

    // Filter out current status so admin can choose any new status
    const availableOptions = ALL_STATUS_OPTIONS.filter(
        (opt) => opt.key !== currentStatus
    );

    useEffect(() => {
        if (isOpen && availableOptions.length > 0) {
            setSelectedStatus(availableOptions[0].key);
        } else {
            setSelectedStatus("");
        }
    }, [isOpen, order]);

    if (!isOpen || !order) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedStatus) {
            onConfirm(selectedStatus);
        }
    };

    return createPortal(
        <div className="modal-backdrop">
            <div className="orders-modal-card">
                <div className="modal-header">
                    <div className="modal-title-group info">
                        <RefreshCw size={20} />
                        <h3>Update Order #{order.order_number} Status</h3>
                    </div>
                    <button type="button" className="close-modal-btn" onClick={onClose} disabled={isLoading}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body-layout">
                    <div className="current-status-box">
                        <span>Current Order Status:</span>
                        <strong className="status-highlight">{currentStatus.replace("_", " ")}</strong>
                    </div>

                    <div className="form-group">
                        <label htmlFor="target_status">Select New Order Status</label>
                        <select
                            id="target_status"
                            className="modal-select"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            required
                        >
                            {availableOptions.map((opt) => (
                                <option key={opt.key} value={opt.key}>
                                    {opt.label} ({opt.key})
                                </option>
                            ))}
                        </select>
                    </div>

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
                            disabled={isLoading || !selectedStatus}
                        >
                            {isLoading ? (
                                <span className="btn-loading-content">
                                    <svg className="spinner-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.2 }}></circle>
                                        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4526" stroke="currentColor" strokeWidth="4"></path>
                                    </svg>
                                    Updating Status...
                                </span>
                            ) : "Update Status"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

export default AdminOrderStatusModal;
