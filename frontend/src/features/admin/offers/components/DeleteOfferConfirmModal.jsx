import React from "react";
import { AlertTriangle, X } from "lucide-react";

export default function DeleteOfferConfirmModal({ isOpen, onClose, onConfirm, offerTitle = "", isDeleting = false }) {
    if (!isOpen) return null;

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal-container" style={{ maxWidth: "440px" }}>
                <div className="admin-modal-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#ef4444" }}>
                        <AlertTriangle size={24} />
                        <h2 className="admin-modal-title" style={{ color: "#ef4444" }}>Delete Offer</h2>
                    </div>
                    <button type="button" className="admin-modal-close-btn" onClick={onClose} disabled={isDeleting}>
                        <X size={20} />
                    </button>
                </div>

                <div className="admin-modal-body" style={{ paddingTop: "12px" }}>
                    <p style={{ fontSize: "14.5px", color: "var(--text-primary, #0f172a)", lineHeight: 1.5, margin: 0 }}>
                        Are you sure you want to delete <strong>{offerTitle}</strong>? This action cannot be undone.
                    </p>

                    <div className="admin-modal-footer" style={{ marginTop: "24px", paddingTop: "16px" }}>
                        <button type="button" className="btn-admin-cancel" onClick={onClose} disabled={isDeleting}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn-admin-danger"
                            onClick={onConfirm}
                            disabled={isDeleting}
                            style={{
                                background: "#ef4444",
                                color: "#ffffff",
                                padding: "9px 20px",
                                borderRadius: "10px",
                                fontWeight: 700,
                                border: "none",
                                cursor: "pointer",
                                opacity: isDeleting ? 0.7 : 1,
                            }}
                        >
                            {isDeleting ? "Deleting..." : "Delete Offer"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
