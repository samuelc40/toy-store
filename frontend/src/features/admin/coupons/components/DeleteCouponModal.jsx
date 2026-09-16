import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, Loader2 } from "lucide-react";

export function DeleteCouponModal({
  isOpen,
  onClose,
  onConfirm,
  coupon = null,
  isLoading = false,
}) {
  if (!isOpen || !coupon) return null;

  return createPortal(
    <div className="coupon-modal-backdrop">
      <div className="coupon-modal-card" style={{ maxWidth: "440px" }}>
        <div className="coupon-modal-header">
          <div className="coupon-modal-title">
            <AlertTriangle size={20} color="#ef4444" />
            <h3>Deactivate Coupon</h3>
          </div>
          <button
            type="button"
            className="coupon-modal-close-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="coupon-modal-body">
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-primary)",
              margin: "0 0 12px 0",
              lineHeight: "1.45",
            }}
          >
            Are you sure you want to deactivate coupon{" "}
            <strong style={{ color: "var(--accent-color, #6366f1)" }}>
              {coupon.code}
            </strong>
            ?
          </p>
          <p
            style={{
              fontSize: "12.5px",
              color: "var(--text-secondary)",
              margin: 0,
              lineHeight: "1.4",
            }}
          >
            This will soft-delete the coupon and prevent customers from using it
            at checkout.
          </p>

          <div className="coupon-modal-actions">
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-modal-submit"
              style={{ background: "#ef4444" }}
              onClick={() => onConfirm(coupon.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <span
                  className="btn-loading-content"
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
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
    document.body,
  );
}

export default DeleteCouponModal;
