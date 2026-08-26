import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, ShoppingBag, FileText, ArrowRight } from "lucide-react";
import "../styles/Payment.css";

export function PaymentSuccessPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};

    const orderNumber = state.order_number || state.orderNumber || "ORD-SUCCESS";
    const orderId = state.order_id || state.orderId || "";
    const paymentId = state.payment_id || state.paymentId || "N/A";
    const amount = state.amount ? Number(state.amount).toFixed(2) : null;

    return (
        <div className="payment-result-container">
            <div className="payment-result-card">
                <div className="payment-icon-wrapper success">
                    <CheckCircle2 size={48} />
                </div>

                <h1 className="payment-title">Payment Successful!</h1>
                <p className="payment-subtitle">
                    Thank you for your purchase. Your order has been placed and is being processed.
                </p>

                <div className="payment-details-box">
                    <div className="payment-detail-row">
                        <span>Order Number</span>
                        <strong>{orderNumber}</strong>
                    </div>
                    <div className="payment-detail-row">
                        <span>Payment ID</span>
                        <strong>{paymentId}</strong>
                    </div>
                    <div className="payment-detail-row">
                        <span>Payment Status</span>
                        <strong style={{ color: "#10b981" }}>PAID</strong>
                    </div>
                    {amount && (
                        <div className="payment-detail-row">
                            <span>Amount Paid</span>
                            <strong className="amount-text">Rs. {amount}</strong>
                        </div>
                    )}
                </div>

                <div className="payment-actions-row">
                    {orderId && (
                        <Link to={`/orders/${orderId}`} className="btn-primary-action">
                            <FileText size={18} />
                            View Order Details
                        </Link>
                    )}
                    <Link to="/products" className="btn-secondary-action">
                        <ShoppingBag size={18} />
                        Continue Shopping
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PaymentSuccessPage;
