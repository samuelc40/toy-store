import React from "react";
import { X, Package, Layers, Tag, DollarSign, Calendar, Boxes, Pencil, ExternalLink, AlertCircle, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export function InventoryDetailsModal({ isOpen, onClose, item, onEditStock, onNavigateToProduct }) {
    if (!isOpen || !item) return null;

    const isBlocked = item.blocked || item.product_blocked;
    const isInactive = !item.is_active || !item.product_is_active;

    const renderStockBadge = (status, qty) => {
        switch (status) {
            case "OUT_OF_STOCK":
                return (
                    <span className="stock-badge badge-out-of-stock">
                        <XCircle size={14} style={{ marginRight: 4 }} />
                        OUT OF STOCK ({qty})
                    </span>
                );
            case "LOW_STOCK":
                return (
                    <span className="stock-badge badge-low-stock">
                        <AlertTriangle size={14} style={{ marginRight: 4 }} />
                        LOW STOCK ({qty})
                    </span>
                );
            default:
                return (
                    <span className="stock-badge badge-in-stock">
                        <CheckCircle2 size={14} style={{ marginRight: 4 }} />
                        IN STOCK ({qty})
                    </span>
                );
        }
    };

    return (
        <div className="inventory-modal-backdrop" onClick={onClose}>
            <div className="inventory-modal-card details-modal-card" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-title-group">
                        <div className="modal-title-icon-badge">
                            <Boxes size={20} />
                        </div>
                        <div>
                            <h3>Inventory Item Details</h3>
                            <p className="modal-subtitle">Comprehensive stock and product variant breakdown</p>
                        </div>
                    </div>
                    <button type="button" className="modal-close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body-details">
                    {/* Top Hero Section with Thumbnail & Core Identifiers */}
                    <div className="details-hero-box">
                        <div className="details-thumb-container">
                            {item.image ? (
                                <img src={item.image} alt={item.product_name} />
                            ) : (
                                <div className="thumb-placeholder-large">
                                    <Package size={32} />
                                </div>
                            )}
                        </div>

                        <div className="details-hero-meta">
                            <h2 className="details-product-title">{item.product_name}</h2>
                            <p className="details-variant-subtitle">Variant: {item.variant_name}</p>
                            <div className="details-badges-row">
                                {renderStockBadge(item.stock_status, item.stock_quantity)}

                                {isBlocked ? (
                                    <span className="status-pill status-blocked">BLOCKED</span>
                                ) : isInactive ? (
                                    <span className="status-pill status-inactive">INACTIVE</span>
                                ) : (
                                    <span className="status-pill status-active">ACTIVE</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="details-grid-section">
                        <div className="detail-field-card">
                            <span className="field-label">
                                <Tag size={14} /> SKU Code
                            </span>
                            <code className="sku-code">{item.sku}</code>
                        </div>

                        <div className="detail-field-card">
                            <span className="field-label">
                                <Package size={14} /> Category
                            </span>
                            <span className="field-value">{item.category_name || "Uncategorized"}</span>
                        </div>

                        <div className="detail-field-card">
                            <span className="field-label">
                                <Layers size={14} /> Brand
                            </span>
                            <span className="field-value">{item.brand || "Generics"}</span>
                        </div>

                        <div className="detail-field-card">
                            <span className="field-label">
                                <DollarSign size={14} /> Pricing
                            </span>
                            <div className="price-cell-box">
                                {item.sale_price ? (
                                    <>
                                        <span className="sale-price-val">
                                            Rs. {Number(item.sale_price).toFixed(2)} (Sale)
                                        </span>
                                        <span className="original-price-val">
                                            Rs. {Number(item.price).toFixed(2)} (Original)
                                        </span>
                                    </>
                                ) : (
                                    <span className="regular-price-val">
                                        Rs. {Number(item.price || 0).toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="detail-field-card">
                            <span className="field-label">
                                <Calendar size={14} /> Last Updated
                            </span>
                            <span className="field-value">
                                {item.updated_at
                                    ? new Date(item.updated_at).toLocaleString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                      })
                                    : "N/A"}
                            </span>
                        </div>

                        <div className="detail-field-card">
                            <span className="field-label">
                                <Calendar size={14} /> Created At
                            </span>
                            <span className="field-value">
                                {item.created_at
                                    ? new Date(item.created_at).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                      })
                                    : "N/A"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="modal-actions-row" style={{ padding: "16px 24px", background: "var(--bg-color, #f8fafc)", borderTop: "1px solid var(--border-color, #e2e8f0)" }}>
                    <button
                        type="button"
                        className="btn-modal-cancel"
                        onClick={onClose}
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        className="btn-modal-edit-stock"
                        onClick={() => {
                            onClose();
                            onEditStock(item);
                        }}
                    >
                        <Pencil size={15} />
                        <span>Update Stock</span>
                    </button>

                    <button
                        type="button"
                        className="btn-modal-catalog-jump"
                        onClick={() => {
                            onClose();
                            onNavigateToProduct(item);
                        }}
                    >
                        <ExternalLink size={15} />
                        <span>View in Catalog</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InventoryDetailsModal;
