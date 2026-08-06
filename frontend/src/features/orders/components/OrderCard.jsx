import React from "react";
import { Link } from "react-router-dom";
import { Eye, FileText, XCircle, Calendar, CreditCard, ShoppingBag, ArrowRight } from "lucide-react";
import { downloadInvoice } from "../services/orderService";
import { toast } from "react-toastify";

export function OrderCard({ order, onCancelClick }) {
    const items = order.items || [];
    const firstItem = items[0] || {};
    const totalItems = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const getStatusPillClass = (status) => {
        switch (status?.toUpperCase()) {
            case "DELIVERED":
                return "status-delivered";
            case "SHIPPED":
                return "status-shipped";
            case "OUT_FOR_DELIVERY":
                return "status-out-for-delivery";
            case "PACKED":
                return "status-packed";
            case "CONFIRMED":
                return "status-confirmed";
            case "CANCELLED":
                return "status-cancelled";
            case "RETURN_REQUESTED":
            case "RETURNED":
                return "status-returned";
            default:
                return "status-pending";
        }
    };

    const handleDownloadInvoice = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            toast.info("Preparing PDF invoice download...");
            await downloadInvoice(order.id, order.order_number);
            toast.success("Invoice downloaded successfully!");
        } catch (err) {
            toast.error("Failed to download invoice.");
        }
    };

    return (
        <div className="customer-order-card">
            {/* Card Top Header */}
            <div className="order-card-header">
                <div className="order-card-header-top">
                    <span className="order-number-lbl">#{order.order_number}</span>
                    <span className={`order-status-pill ${getStatusPillClass(order.order_status)}`}>
                        {order.order_status.replace("_", " ")}
                    </span>
                </div>
                <div className="order-card-header-sub">
                    <span className="order-date-lbl">
                        <Calendar size={13} />
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </span>
                </div>
            </div>

            {/* Card Body Info */}
            <div className="order-card-body">
                <div className="order-card-item-preview">
                    <div className="order-card-thumbnail-box">
                        {firstItem.image ? (
                            <img src={firstItem.image} alt={firstItem.product_name} loading="lazy" />
                        ) : (
                            <div className="thumbnail-placeholder">
                                <ShoppingBag size={20} />
                            </div>
                        )}
                    </div>

                    <div className="order-card-info-group">
                        <h3 className="first-product-name">{firstItem.product_name || "Order Item"}</h3>
                        <p className="order-items-count-text">
                            {firstItem.variant_name && <span>Edition: {firstItem.variant_name} • </span>}
                            {totalItems} {totalItems === 1 ? "item" : "items"} total
                        </p>
                        <div className="order-payment-meta-row">
                            <span className="payment-method-text">
                                <CreditCard size={13} />
                                {order.payment_method || "COD"} ({order.payment_status || "Pending"})
                            </span>
                        </div>
                    </div>
                </div>

                <div className="order-card-price-group">
                    <span className="price-label">Total Amount</span>
                    <span className="price-value">Rs. {Number(order.total_amount || 0).toFixed(2)}</span>
                </div>
            </div>

            {/* Card Footer Action Buttons */}
            <div className="order-card-footer">
                <div className="card-footer-left">
                    <button
                        type="button"
                        onClick={handleDownloadInvoice}
                        className="btn-order-action-link invoice-link"
                        title="Download PDF Invoice"
                        aria-label={`Download invoice for order #${order.order_number}`}
                    >
                        <FileText size={14} />
                        <span>Invoice</span>
                    </button>

                    {order.can_cancel && (
                        <button
                            type="button"
                            onClick={() => onCancelClick(order)}
                            className="btn-order-action-link cancel-link"
                            title="Cancel Order"
                            aria-label={`Cancel order #${order.order_number}`}
                        >
                            <XCircle size={14} />
                            <span>Cancel</span>
                        </button>
                    )}
                </div>

                <Link
                    to={`/orders/${order.id}`}
                    className="btn-order-view-details"
                    aria-label={`View details for order #${order.order_number}`}
                >
                    <span className="btn-order-view-details-text">View Details</span>
                    <ArrowRight size={15} />
                </Link>
            </div>
        </div>
    );
}

export default OrderCard;
