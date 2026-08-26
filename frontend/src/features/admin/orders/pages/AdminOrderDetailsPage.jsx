import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    ArrowLeft,
    RefreshCw,
    User,
    MapPin,
    CreditCard,
    Package,
    AlertCircle,
    Calendar,
    Phone,
    Mail,
    FileText,
} from "lucide-react";

import {
    fetchAdminOrderDetailAsync,
    updateAdminOrderStatusAsync,
    selectAdminActiveOrder,
    selectAdminOrderDetailLoading,
    selectAdminOrdersUpdateLoading,
    clearActiveOrder,
} from "../redux/adminOrdersSlice";

import AdminOrderStatusModal from "../components/AdminOrderStatusModal";
import "../styles/AdminOrders.css";

export function AdminOrderDetailsPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const order = useSelector(selectAdminActiveOrder);
    const loading = useSelector(selectAdminOrderDetailLoading);
    const updateLoading = useSelector(selectAdminOrdersUpdateLoading);

    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    useEffect(() => {
        if (orderId) {
            dispatch(fetchAdminOrderDetailAsync(orderId));
        }
        return () => {
            dispatch(clearActiveOrder());
        };
    }, [dispatch, orderId]);

    const handleStatusConfirm = async (newStatus) => {
        if (!order) return;
        try {
            await dispatch(
                updateAdminOrderStatusAsync({
                    orderId: order.id,
                    orderStatus: newStatus,
                })
            ).unwrap();
            toast.success(`Order #${order.order_number} status updated to '${newStatus.replace("_", " ")}'!`);
            setIsStatusModalOpen(false);
            dispatch(fetchAdminOrderDetailAsync(order.id));
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to update status.");
        }
    };

    if (loading) {
        return (
            <div className="admin-order-detail-page">
                <div className="table-loading-skeleton" style={{ padding: "40px" }}>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="admin-order-detail-page">
                <button type="button" className="back-link-btn" onClick={() => navigate("/admin/orders")}>
                    <ArrowLeft size={16} /> Back to Orders
                </button>
                <div className="empty-state-card">
                    <AlertCircle size={48} className="empty-icon" />
                    <h3>Order Not Found</h3>
                    <p>The requested order could not be located or has been deleted.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-order-detail-page">
            {/* Top Bar */}
            <div className="detail-top-nav">
                <button type="button" className="back-link-btn" onClick={() => navigate("/admin/orders")}>
                    <ArrowLeft size={16} /> Back to Admin Orders
                </button>
            </div>

            {/* Header Title Bar */}
            <div className="admin-orders-header">
                <div>
                    <h2>Order #{order.order_number}</h2>
                    <p>Placed on {new Date(order.created_at).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}</p>
                </div>
                <button
                    type="button"
                    className="btn-table-action update"
                    onClick={() => setIsStatusModalOpen(true)}
                    style={{ padding: "10px 18px", fontSize: "14px" }}
                >
                    <RefreshCw size={16} /> Update Status
                </button>
            </div>

            {/* Grid Layout */}
            <div className="admin-detail-grid">
                {/* Left Column: Order Items & Pricing Breakdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Items Card */}
                    <div className="detail-card">
                        <h3 className="detail-card-title">Order Items ({order.items?.length || 0})</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            {order.items?.map((item) => (
                                <div
                                    key={item.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: "16px",
                                        padding: "12px",
                                        borderRadius: "10px",
                                        background: "var(--input-bg, #f8fafc)",
                                        border: "1px solid var(--border-color, #e2e8f0)",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.product_name}
                                                style={{ width: "52px", height: "52px", objectFit: "cover", borderRadius: "8px" }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: "52px",
                                                    height: "52px",
                                                    borderRadius: "8px",
                                                    background: "var(--border-color)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Package size={24} style={{ opacity: 0.5 }} />
                                            </div>
                                        )}
                                        <div>
                                            <strong style={{ display: "block", color: "var(--text-primary)" }}>{item.product_name}</strong>
                                            <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                                                Variant: {item.variant_name} {item.sku ? `(SKU: ${item.sku})` : ""}
                                            </span>
                                            {item.status === "CANCELLED" && (
                                                <span style={{ display: "block", color: "#ef4444", fontSize: "11.5px", fontWeight: 700 }}>
                                                    Cancelled: {item.cancellation_reason || "Customer cancelled"}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>
                                            ₹{parseFloat(item.line_total || 0).toFixed(2)}
                                        </div>
                                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                            ₹{parseFloat(item.price || 0).toFixed(2)} &times; {item.quantity}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary & Pricing Card */}
                    <div className="detail-card">
                        <h3 className="detail-card-title">Order Payment Summary</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                                <strong>₹{parseFloat(order.subtotal || 0).toFixed(2)}</strong>
                            </div>
                            {parseFloat(order.discount_amount || 0) > 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                                    <span>Product Savings</span>
                                    <strong>-₹{parseFloat(order.discount_amount).toFixed(2)}</strong>
                                </div>
                            )}
                            {order.coupon_code && (
                                <div style={{ display: "flex", justifyContent: "space-between", color: "#10b981", fontWeight: 700 }}>
                                    <span>Coupon ({order.coupon_code})</span>
                                    <strong>-₹{parseFloat(order.coupon_discount !== undefined && order.coupon_discount !== null ? order.coupon_discount : order.discount_amount || 0).toFixed(2)}</strong>
                                </div>
                            )}
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-secondary)" }}>Shipping Fee</span>
                                <strong style={{ color: order.shipping_fee === 0 ? "#10b981" : "inherit" }}>
                                    {order.shipping_fee === 0 ? "FREE" : `₹${parseFloat(order.shipping_fee).toFixed(2)}`}
                                </strong>
                            </div>
                            <hr style={{ borderColor: "var(--border-color)", margin: "8px 0" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 800 }}>
                                <span>Grand Total</span>
                                <span style={{ color: "var(--accent-color)" }}>₹{parseFloat(order.total_amount || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation / Return Banner if present */}
                    {order.cancellation_reason && (
                        <div className="detail-card" style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
                            <h4 style={{ margin: 0, color: "#991b1b" }}>Cancellation Details</h4>
                            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#7f1d1d" }}>
                                Reason: <strong>{order.cancellation_reason}</strong>
                                {order.cancelled_at && ` (Cancelled on ${new Date(order.cancelled_at).toLocaleString()})`}
                            </p>
                        </div>
                    )}

                    {order.return_requests?.length > 0 && (
                        <div className="detail-card" style={{ background: "#fffbe6", borderColor: "#ffe58f" }}>
                            <h4 style={{ margin: 0, color: "#d48806" }}>Return Request Submitted</h4>
                            {order.return_requests.map((rr) => (
                                <div key={rr.id} style={{ fontSize: "13px", color: "#8c6000", marginTop: "6px" }}>
                                    <span>Reason: <strong>{rr.reason}</strong></span>
                                    {rr.description && <p style={{ margin: "2px 0" }}>{rr.description}</p>}
                                    <span style={{ fontSize: "11.5px" }}>Status: <strong>{rr.status}</strong></span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Customer Info & Shipping Address Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Customer Profile Card */}
                    <div className="detail-card">
                        <h3 className="detail-card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <User size={18} /> Customer Details
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13.5px" }}>
                            <div>
                                <strong style={{ color: "var(--text-primary)" }}>{order.shipping_name || "Guest Customer"}</strong>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                                <Mail size={14} />
                                <span>{order.customer?.email || "No email"}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                                <Phone size={14} />
                                <span>{order.shipping_phone || order.customer?.phone || "No phone provided"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address Card */}
                    <div className="detail-card">
                        <h3 className="detail-card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <MapPin size={18} /> Delivery Address
                        </h3>
                        <div style={{ fontSize: "13.5px", color: "var(--text-primary)", lineHeight: "1.5" }}>
                            <strong>{order.shipping_name}</strong>
                            <br />
                            {order.shipping_address_line1}
                            {order.shipping_address_line2 && <><br />{order.shipping_address_line2}</>}
                            {order.shipping_landmark && <><br />Landmark: {order.shipping_landmark}</>}
                            <br />
                            {order.shipping_city}, {order.shipping_state} - {order.shipping_postal_code}
                            <br />
                            {order.shipping_country}
                        </div>
                    </div>

                    {/* Payment Info Card */}
                    <div className="detail-card">
                        <h3 className="detail-card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <CreditCard size={18} /> Payment & Status
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13.5px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Payment Method</span>
                                <strong>{order.payment_method}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Payment Status</span>
                                <strong style={{ color: order.payment_status === "PAID" ? "#10b981" : "#f59e0b" }}>
                                    {order.payment_status}
                                </strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>Order Status</span>
                                <strong style={{ color: "var(--accent-color)" }}>{order.order_status?.replace(/_/g, " ")}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Update Modal */}
            <AdminOrderStatusModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={handleStatusConfirm}
                order={order}
                isLoading={updateLoading}
            />
        </div>
    );
}

export default AdminOrderDetailsPage;
