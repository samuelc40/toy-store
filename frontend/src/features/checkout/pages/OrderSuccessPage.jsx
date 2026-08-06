import React, { useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    CheckCircle2,
    ShoppingBag,
    Truck,
    PackageCheck,
    ArrowRight,
    MapPin,
    Calendar,
    Sparkles,
} from "lucide-react";
import { selectCurrentOrder } from "../redux/checkoutSlice";
import "../styles/Checkout.css";

export function OrderSuccessPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const stateOrder = location.state?.order;
    const reduxOrder = useSelector(selectCurrentOrder);

    const order = stateOrder || reduxOrder;

    useEffect(() => {
        // If accessed directly without order data, redirect to products
        if (!order) {
            const timer = setTimeout(() => {
                navigate("/products");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [order, navigate]);

    const orderNumber = order?.order_number || "ORD-SUCCESS";
    const totalAmount = order?.total_amount ? Number(order.total_amount).toFixed(2) : "0.00";
    const items = order?.items || [];

    return (
        <div className="order-success-outer-container">
            <div className="order-success-card">
                {/* Top Celebration Badge */}
                <div className="success-icon-badge">
                    <CheckCircle2 size={54} className="check-icon" />
                </div>

                <div className="success-header-group">
                    <div className="success-badge-tag">
                        <Sparkles size={14} />
                        <span>Order Confirmed</span>
                    </div>
                    <h1 className="success-title">Thank You for Your Order!</h1>
                    <p className="success-subtitle">
                        Your order has been placed successfully and is now being processed by our team.
                    </p>
                </div>

                {/* Order Details Highlight Box */}
                <div className="order-details-highlight-box">
                    <div className="highlight-item">
                        <span className="highlight-label">Order Number</span>
                        <span className="highlight-value order-num">{orderNumber}</span>
                    </div>
                    <div className="highlight-divider" />
                    <div className="highlight-item">
                        <span className="highlight-label">Payment Method</span>
                        <span className="highlight-value">Cash On Delivery</span>
                    </div>
                    <div className="highlight-divider" />
                    <div className="highlight-item">
                        <span className="highlight-label">Total Amount</span>
                        <span className="highlight-value price-val">Rs. {totalAmount}</span>
                    </div>
                </div>

                {/* Delivery Timeline Banner */}
                <div className="delivery-estimate-banner">
                    <Truck size={22} className="delivery-icon" />
                    <div className="delivery-info">
                        <h4>Estimated Delivery Timeline</h4>
                        <p>Expected arrival within 3 – 5 Business Days.</p>
                    </div>
                </div>

                {/* Address & Items Summary */}
                {order && (
                    <div className="order-summary-grid-box">
                        {/* Shipping Address Snapshot */}
                        <div className="summary-sub-card">
                            <div className="sub-card-title">
                                <MapPin size={16} />
                                <h3>Delivery Address</h3>
                            </div>
                            <p className="address-name">{order.shipping_name}</p>
                            <p className="address-line">
                                {order.shipping_address_line1}
                                {order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ""}
                            </p>
                            <p className="address-city">
                                {order.shipping_city}, {order.shipping_state} - {order.shipping_postal_code}
                            </p>
                            {order.shipping_phone && <p className="address-phone">Phone: {order.shipping_phone}</p>}
                        </div>

                        {/* Ordered Items Summary List */}
                        {items.length > 0 && (
                            <div className="summary-sub-card">
                                <div className="sub-card-title">
                                    <PackageCheck size={16} />
                                    <h3>Items Ordered ({items.length})</h3>
                                </div>
                                <div className="success-items-list">
                                    {items.map((item, i) => (
                                        <div key={i} className="success-item-row">
                                            <div className="item-title-qty">
                                                <span className="item-name">{item.product_name}</span>
                                                <span className="item-variant">({item.variant_name})</span>
                                                <span className="item-qty">x{item.quantity}</span>
                                            </div>
                                            <span className="item-total">Rs. {Number(item.line_total || 0).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="success-actions-row">
                    <Link to="/products" className="btn-success-explore">
                        <ShoppingBag size={16} />
                        <span>Continue Shopping</span>
                    </Link>
                    <Link to="/orders" className="btn-success-orders">
                        <span>View All Orders</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default OrderSuccessPage;
