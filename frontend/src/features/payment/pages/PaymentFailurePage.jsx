import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { XCircle, RefreshCw, ShoppingCart, ArrowLeft } from "lucide-react";
import "../styles/Payment.css";

export function PaymentFailurePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};

    const reason = state.reason || state.error || "The payment transaction was cancelled or declined by your bank.";
    const addressId = state.address_id || state.addressId || null;

    return (
        <div className="payment-result-container">
            <div className="payment-result-card">
                <div className="payment-icon-wrapper failure">
                    <XCircle size={48} />
                </div>

                <h1 className="payment-title">Payment Failed</h1>
                <p className="payment-subtitle">
                    We could not process your payment. Don't worry, no funds were deducted from your account.
                </p>

                <div className="payment-details-box" style={{ borderColor: "rgba(239, 68, 68, 0.2)", background: "rgba(239, 68, 68, 0.04)" }}>
                    <div className="payment-detail-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
                        <span style={{ fontWeight: 600, color: "#ef4444" }}>Failure Reason</span>
                        <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text-color)" }}>
                            {reason}
                        </p>
                    </div>
                </div>

                <div className="payment-actions-row">
                    <button onClick={() => navigate("/checkout")} className="btn-primary-action">
                        <RefreshCw size={18} />
                        Retry Payment
                    </button>
                    <Link to="/checkout" className="btn-secondary-action">
                        <ArrowLeft size={18} />
                        Back To Checkout
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PaymentFailurePage;
