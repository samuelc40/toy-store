import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowLeft,
    FileText,
    XCircle,
    RotateCcw,
    MapPin,
    CreditCard,
    ShoppingBag,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    ShieldAlert,
} from "lucide-react";
import { toast } from "react-toastify";

import {
    fetchOrderDetailAsync,
    cancelOrderAsync,
    cancelOrderItemAsync,
    requestReturnAsync,
    selectActiveOrder,
    selectOrderDetailLoading,
    selectOrdersActionLoading,
    selectOrdersError,
    clearActiveOrder,
} from "../redux/ordersSlice";
import { downloadInvoice } from "../services/orderService";
import OrderTimeline from "../components/OrderTimeline";
import CancelOrderModal from "../components/CancelOrderModal";
import ReturnOrderModal from "../components/ReturnOrderModal";
import "../styles/Orders.css";

export function OrderDetailsPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const order = useSelector(selectActiveOrder);
    const loading = useSelector(selectOrderDetailLoading);
    const actionLoading = useSelector(selectOrdersActionLoading);
    const error = useSelector(selectOrdersError);

    // Modal States
    const [isCancelOrderModalOpen, setIsCancelOrderModalOpen] = useState(false);
    const [cancellingItem, setCancellingItem] = useState(null);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

    useEffect(() => {
        if (orderId) {
            dispatch(fetchOrderDetailAsync(orderId));
        }
        return () => {
            dispatch(clearActiveOrder());
        };
    }, [dispatch, orderId]);

    // Download PDF Invoice
    const handleDownloadInvoice = async () => {
        if (!order) return;
        try {
            toast.info("Preparing PDF invoice download...");
            await downloadInvoice(order.id, order.order_number);
            toast.success("Invoice downloaded successfully!");
        } catch (err) {
            toast.error("Failed to download invoice.");
        }
    };

    // Cancel Entire Order
    const handleConfirmCancelOrder = async (reason) => {
        try {
            await dispatch(cancelOrderAsync({ orderId: order.id, reason })).unwrap();
            toast.success(`Order #${order.order_number} cancelled successfully.`);
            setIsCancelOrderModalOpen(false);
            dispatch(fetchOrderDetailAsync(order.id));
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to cancel order.");
        }
    };

    // Cancel Individual Order Item
    const handleConfirmCancelItem = async (reason) => {
        if (!cancellingItem) return;
        try {
            await dispatch(cancelOrderItemAsync({ itemId: cancellingItem.id, reason })).unwrap();
            toast.success(`Item "${cancellingItem.product_name}" cancelled successfully.`);
            setCancellingItem(null);
            dispatch(fetchOrderDetailAsync(order.id));
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to cancel item.");
        }
    };

    // Request Return
    const handleConfirmReturn = async ({ reason, description }) => {
        try {
            const res = await dispatch(
                requestReturnAsync({ orderId: order.id, reason, description })
            ).unwrap();
            toast.success(res.message || "Return request submitted successfully.");
            setIsReturnModalOpen(false);
            dispatch(fetchOrderDetailAsync(order.id));
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to submit return request.");
        }
    };

    if (loading && !order) {
        return <OrderDetailsSkeleton />;
    }

    if (error || !order) {
        return (
            <div className="orders-page-outer-container">
                <div className="orders-empty-state-card">
                    <ShieldAlert size={56} className="empty-package-icon" />
                    <h2>Order Not Found</h2>
                    <p>{typeof error === "string" ? error : "The requested order could not be loaded."}</p>
                    <button type="button" onClick={() => navigate("/orders")} className="btn-explore-toys-orders">
                        <ArrowLeft size={16} />
                        <span>Back to My Orders</span>
                    </button>
                </div>
            </div>
        );
    }

    const items = order.items || [];
    const returnRequests = order.return_requests || [];

    return (
        <div className="orders-page-outer-container">
            {/* Top Back & Header Bar */}
            <div className="order-details-top-bar">
                <button type="button" onClick={() => navigate("/orders")} className="btn-back-to-orders" aria-label="Navigate back to my orders list">
                    <ArrowLeft size={16} />
                    <span>Back to Orders</span>
                </button>

                <div className="details-header-actions-row">
                    <button
                        type="button"
                        onClick={handleDownloadInvoice}
                        className="btn-details-action invoice-btn"
                        title="Download PDF Invoice"
                        aria-label={`Download invoice for order #${order.order_number}`}
                    >
                        <FileText size={16} />
                        <span>Download Invoice</span>
                    </button>

                    {order.can_cancel && (
                        <button
                            type="button"
                            onClick={() => setIsCancelOrderModalOpen(true)}
                            className="btn-details-action cancel-btn"
                            title="Cancel Order"
                            aria-label={`Cancel entire order #${order.order_number}`}
                        >
                            <XCircle size={16} />
                            <span>Cancel Order</span>
                        </button>
                    )}

                    {order.can_return && (
                        <button
                            type="button"
                            onClick={() => setIsReturnModalOpen(true)}
                            className="btn-details-action return-btn"
                            title="Request Return"
                            aria-label={`Request return for order #${order.order_number}`}
                        >
                            <RotateCcw size={16} />
                            <span>Return Order</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Order Identity Card */}
            <div className="order-details-identity-card">
                <div className="identity-title-group">
                    <h1 className="details-order-number">Order #{order.order_number}</h1>
                    <span className="details-order-date">
                        <Calendar size={14} />
                        Placed on {new Date(order.created_at).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </div>
                <div className="identity-status-group">
                    <span className="details-status-badge">{order.order_status.replace("_", " ")}</span>
                </div>
            </div>

            {/* Order Progress Timeline */}
            <div className="order-details-section-card">
                <h3 className="section-card-title">Order Status Tracker</h3>
                <OrderTimeline status={order.order_status} />
                {order.cancellation_reason && (
                    <div className="cancellation-reason-notice">
                        <strong>Reason:</strong> {order.cancellation_reason}
                    </div>
                )}
            </div>

            {/* Return Request Alert (if any) */}
            {returnRequests.length > 0 && (
                <div className="return-request-alert-card">
                    <div className="return-alert-header">
                        <RotateCcw size={18} />
                        <h4>Return Request ({returnRequests[0].status})</h4>
                    </div>
                    <p><strong>Reason:</strong> {returnRequests[0].reason}</p>
                    {returnRequests[0].description && <p><strong>Details:</strong> {returnRequests[0].description}</p>}
                    <span className="return-date-tag">Requested on {new Date(returnRequests[0].requested_at).toLocaleDateString()}</span>
                </div>
            )}

            {/* Content 2-Column Layout: Items Breakdown & Delivery/Payment */}
            <div className="order-details-grid-layout">
                {/* Left Column: Ordered Items List */}
                <div className="details-items-column">
                    <div className="order-details-section-card">
                        <h3 className="section-card-title">Ordered Items ({items.length})</h3>

                        <div className="details-items-table-wrapper">
                            {items.map((item) => {
                                const isItemCancelled = item.status === "CANCELLED";
                                return (
                                    <div key={item.id} className={`details-item-row ${isItemCancelled ? "item-cancelled" : ""}`}>
                                        <div className="item-img-box">
                                            {item.image ? (
                                                <img src={item.image} alt={item.product_name} loading="lazy" />
                                            ) : (
                                                <div className="item-img-placeholder">
                                                    <ShoppingBag size={18} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="item-details-box">
                                            <h4 className="item-name">{item.product_name}</h4>
                                            <p className="item-variant">{item.variant_name}</p>
                                            {item.sku && <span className="item-sku">SKU: {item.sku}</span>}
                                            {isItemCancelled && (
                                                <div className="item-cancelled-badge">
                                                    <XCircle size={12} />
                                                    <span>Cancelled ({item.cancellation_reason || "Item cancelled"})</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="item-price-qty-box">
                                            <span className="item-unit-price">Rs. {Number(item.price || 0).toFixed(2)} x {item.quantity}</span>
                                            <span className="item-total-price">Rs. {Number(item.line_total || 0).toFixed(2)}</span>

                                            {/* Item-level Cancel Button */}
                                            {!isItemCancelled && order.can_cancel && items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setCancellingItem(item)}
                                                    className="btn-cancel-single-item"
                                                    title="Cancel this item"
                                                >
                                                    Cancel Item
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Shipping & Payment Summary */}
                <div className="details-summary-column">
                    {/* Shipping Address */}
                    <div className="order-details-section-card">
                        <div className="card-subtitle-row">
                            <MapPin size={18} />
                            <h3>Shipping Address</h3>
                        </div>
                        <div className="address-snapshot-box">
                            <p className="recipient-name">{order.shipping_name}</p>
                            <p className="address-line">
                                {order.shipping_address_line1}
                                {order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ""}
                            </p>
                            {order.shipping_landmark && (
                                <p className="address-landmark">Landmark: {order.shipping_landmark}</p>
                            )}
                            <p className="address-city-state">
                                {order.shipping_city}, {order.shipping_state} - {order.shipping_postal_code}, {order.shipping_country}
                            </p>
                            {order.shipping_phone && (
                                <p className="address-phone">Phone: {order.shipping_phone}</p>
                            )}
                        </div>
                    </div>

                    {/* Payment & Totals Breakdown */}
                    <div className="order-details-section-card">
                        <div className="card-subtitle-row">
                            <CreditCard size={18} />
                            <h3>Payment Summary</h3>
                        </div>

                        <div className="payment-meta-badge-row">
                            <span className="meta-pill">Method: {order.payment_method || "COD"}</span>
                            <span className="meta-pill">Status: {order.payment_status || "Pending"}</span>
                        </div>

                        <hr className="details-divider" />

                        <div className="details-totals-block">
                            <div className="total-row">
                                <span>Subtotal</span>
                                <span>Rs. {Number(order.subtotal || 0).toFixed(2)}</span>
                            </div>
                            {Number(order.discount_amount || 0) > 0 && (
                                <div className="total-row discount-row">
                                    <span>Discount Savings</span>
                                    <span>-Rs. {Number(order.discount_amount || 0).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="total-row">
                                <span>Shipping Fee</span>
                                <span className="free-tag">
                                    {Number(order.shipping_fee || 0) === 0 ? "FREE" : `$${Number(order.shipping_fee).toFixed(2)}`}
                                </span>
                            </div>
                            <hr className="details-divider-inner" />
                            <div className="total-row grand-total-row">
                                <span>Grand Total</span>
                                <span className="grand-total-val">Rs. {Number(order.total_amount || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Entire Order Modal */}
            <CancelOrderModal
                isOpen={isCancelOrderModalOpen}
                onClose={() => setIsCancelOrderModalOpen(false)}
                onConfirm={handleConfirmCancelOrder}
                title={`Cancel Entire Order #${order.order_number}`}
                isLoading={actionLoading}
            />

            {/* Cancel Single Item Modal */}
            <CancelOrderModal
                isOpen={!!cancellingItem}
                onClose={() => setCancellingItem(null)}
                onConfirm={handleConfirmCancelItem}
                title="Cancel Item"
                item={cancellingItem}
                isLoading={actionLoading}
            />

            {/* Request Return Modal */}
            <ReturnOrderModal
                isOpen={isReturnModalOpen}
                onClose={() => setIsReturnModalOpen(false)}
                onConfirm={handleConfirmReturn}
                orderNumber={order.order_number}
                isLoading={actionLoading}
            />
        </div>
    );
}

function OrderDetailsSkeleton() {
    return (
        <div className="orders-page-outer-container">
            <div className="skeleton-shimmer" style={{ width: "160px", height: "32px", borderRadius: "8px", marginBottom: "20px" }} />
            <div className="skeleton-shimmer" style={{ width: "100%", height: "120px", borderRadius: "18px", marginBottom: "24px" }} />
            <div className="skeleton-shimmer" style={{ width: "100%", height: "300px", borderRadius: "18px" }} />
        </div>
    );
}

export default OrderDetailsPage;
