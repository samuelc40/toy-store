import React, { useState, useEffect } from "react";
import { X, Layers, Save, PackageCheck } from "lucide-react";

export function UpdateStockModal({ isOpen, onClose, onSubmit, variant, isLoading }) {
    const [stockQuantity, setStockQuantity] = useState(0);
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (variant) {
            setStockQuantity(variant.stock_quantity ?? 0);
            setReason("");
            setError("");
        }
    }, [variant]);

    if (!isOpen || !variant) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const num = Number(stockQuantity);
        if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
            setError("Stock quantity must be a non-negative integer.");
            return;
        }
        setError("");
        onSubmit({
            variantId: variant.id,
            stock_quantity: num,
            reason: reason.trim(),
        });
    };

    return (
        <div className="inventory-modal-backdrop" onClick={onClose}>
            <div className="inventory-modal-card" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-title-group">
                        <div className="modal-title-icon-badge">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h3>Update Stock Quantity</h3>
                            <p className="modal-subtitle">
                                Modify inventory level for {variant.product_name}
                            </p>
                        </div>
                    </div>
                    <button type="button" className="modal-close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="modal-body-form">
                    {/* Item Metadata */}
                    <div className="variant-summary-info-box">
                        <div className="info-item">
                            <span className="info-label">Variant Name</span>
                            <span className="info-val">{variant.variant_name}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">SKU</span>
                            <span className="info-val">{variant.sku}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Current Stock</span>
                            <span className="info-val current-stock-highlight">
                                {variant.stock_quantity} units
                            </span>
                        </div>
                    </div>

                    {/* Stock Input */}
                    <div className="form-group">
                        <label htmlFor="new_stock_qty">New Stock Quantity *</label>
                        <input
                            type="number"
                            id="new_stock_qty"
                            min="0"
                            step="1"
                            value={stockQuantity}
                            onChange={(e) => setStockQuantity(e.target.value)}
                            placeholder="Enter new stock count..."
                            required
                        />
                        {error && <span className="error-text">{error}</span>}
                    </div>

                    {/* Reason Input */}
                    <div className="form-group">
                        <label htmlFor="stock_update_reason">Adjustment Reason (Optional)</label>
                        <input
                            type="text"
                            id="stock_update_reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Restock shipment, Damaged item, Inventory audit..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="modal-actions-row">
                        <button
                            type="button"
                            className="btn-modal-cancel"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-modal-save"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="btn-loading-content">
                                    <svg className="spinner-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.2 }}></circle>
                                        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4526" stroke="currentColor" strokeWidth="4"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                <>
                                    <PackageCheck size={16} />
                                    <span>Save Stock</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateStockModal;
