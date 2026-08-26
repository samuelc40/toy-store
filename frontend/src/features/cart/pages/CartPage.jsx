import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Minus, Trash2, ShieldCheck, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';

import {
    fetchCartAsync,
    updateCartItemAsync,
    removeCartItemAsync,
    clearCartAsync,
    selectCartItems,
    selectCartSummary,
    selectCartLoading,
    selectCartError,
} from '../redux/cartSlice';
import cartService from '../services/cartService';
import { initCartWidget } from '../components/FloatingCartWidget';
import ConfirmModal from '../components/ConfirmModal';
import ConfirmContactModal from '../components/ConfirmContactModal';
import { selectUser } from '../../auth/authSlice';

import '../styles/Cart.css';

/**
 * Helper to determine if a cart item is blocked or unavailable
 */
export const isItemBlocked = (item) => {
    if (!item) return true;
    if (item.is_blocked || item.is_available === false) return true;
    const v = item.variant;
    if (!v) return true;
    if (v.is_blocked || v.is_available === false || v.blocked === true || v.is_active === false) return true;
    if (v.product && (v.product.blocked === true || v.product.is_active === false)) return true;
    return false;
};

export function CartPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const items = useSelector(selectCartItems);
    const summary = useSelector(selectCartSummary);
    const loading = useSelector(selectCartLoading);
    const error = useSelector(selectCartError);

    const user = useSelector(selectUser);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    // Modal state for deletions/clear
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    const showConfirm = (title, message, onConfirmAction) => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                onConfirmAction();
                closeConfirm();
            }
        });
    };

    const closeConfirm = () => {
        setConfirmModal({
            isOpen: false,
            title: '',
            message: '',
            onConfirm: null
        });
    };

    // Initialize floating widget and fetch cart details
    useEffect(() => {
        initCartWidget();
        dispatch(fetchCartAsync());
    }, [dispatch]);

    // Handle any thunk errors
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const subtotal = summary?.cart_total || 0;
    const mrpTotal = summary?.mrp_total || subtotal;
    const savings = summary?.savings || 0;
    const totalItemsCount = summary?.total_items || 0;

    // const shippingCost = summary?.shipping_fee !== undefined ? summary.shipping_fee : (subtotal >= 999 || subtotal === 0 ? 0 : 1);


    const shippingThreshold = summary?.shipping_threshold || 999;
    const shippingCost = summary?.shipping_fee !== undefined ? summary.shipping_fee : (subtotal >= shippingThreshold || subtotal === 0 ? 0 : 1);
    const estimatedTotal = summary?.grand_total !== undefined ? summary.grand_total : (subtotal + shippingCost);

    const formatPrice = (val) => {
        const num = Number(val);
        if (isNaN(num)) return val;
        return `Rs. ${num.toLocaleString('en-IN')}`;
    };

    const handleIncrement = (item) => {
        if (isItemBlocked(item)) {
            toast.error("This item is unavailable!");
            return;
        }
        const stock = item.variant?.stock_quantity || 0;
        if (item.quantity >= stock) {
            toast.warning(`Cannot add more. Only ${stock} items left in stock.`);
            return;
        }
        dispatch(updateCartItemAsync({ itemId: item.id, action: 'increment' }));
    };

    const handleDecrement = (item) => {
        if (isItemBlocked(item)) {
            toast.error("This item is unavailable.");
            return;
        }
        if (item.quantity <= 1) {
            handleRemoveItem(item.id, item.variant?.variant_name);
            return;
        }
        dispatch(updateCartItemAsync({ itemId: item.id, action: 'decrement' }));
    };

    const handleRemoveItem = (itemId, variantName) => {
        showConfirm(
            'Remove Item',
            `Are you sure you want to remove ${variantName || 'this item'} from your cart?`,
            () => {
                dispatch(removeCartItemAsync(itemId))
                    .unwrap()
                    .then(() => toast.success('Item removed from cart.'));
            }
        );
    };

    const handleClearCart = () => {
        showConfirm(
            'Clear Cart',
            'Are you sure you want to clear your entire cart?',
            () => {
                dispatch(clearCartAsync())
                    .unwrap()
                    .then(() => toast.success('Cart cleared.'));
            }
        );
    };

    // Blocked items validation logic
    const hasBlockedItems = summary?.has_blocked_items || items.some(isItemBlocked);
    const hasOutofStockItems = items.some(
        (item) => !item.variant?.is_in_stock || item.quantity > item.variant?.stock_quantity
    );
    const isCheckoutDisabled = items.length === 0 || hasOutofStockItems || hasBlockedItems;

    const handleCheckout = async () => {
        if (isCheckoutDisabled) {
            if (hasBlockedItems) {
                toast.error("Your cart contains unavailable or blocked items. Please remove them to proceed.");
            } else {
                toast.error("Cannot proceed to checkout. Please resolve out-of-stock items.");
            }
            return;
        }
        try {
            await cartService.validateCheckout();
            setIsContactModalOpen(true);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Your cart contains unavailable items.";
            toast.error(errorMsg);
            dispatch(fetchCartAsync());
        }
    };

    const handleConfirmContactSuccess = () => {
        setIsContactModalOpen(false);
        navigate("/checkout/");
    };

    if (loading && items.length === 0) {
        return <CartPageSkeleton />;
    }

    if (items.length === 0) {
        return (
            <div className="cart-page-outer-container">
                <div className="cart-empty-state-outer-wrapper">
                    <span className="cart-empty-visual-illustration" role="img" aria-label="empty cart">🧸</span>
                    <h2 className="cart-empty-headline">Your Shopping Cart is Empty</h2>
                    <p className="cart-empty-subdescription">
                        Looks like you haven't added anything to your cart yet. Browse our top categories or new arrivals to find the perfect toy!
                    </p>
                    <Link to="/products" className="btn-cart-continue-shopping">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page-outer-container">
            <h1 className="cart-page-title-heading">Shopping Cart</h1>

            <div className="cart-page-split-layout">
                {/* Left Column: Items workspace */}
                <div className="cart-items-list-workspace">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14.5px', color: 'var(--text-muted)' }}>
                            {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in your cart
                        </span>
                        <button
                            type="button"
                            onClick={handleClearCart}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '13.5px',
                                textDecoration: 'underline',
                            }}
                        >
                            Clear All
                        </button>
                    </div>

                    {items.map((item) => {
                        const isBlocked = isItemBlocked(item);
                        const stock = item.variant?.stock_quantity || 0;
                        const isOutOfStock = !item.variant?.is_in_stock || stock === 0;
                        const isStockExceeded = item.quantity > stock;

                        return (
                            <div key={item.id} className={`cart-item-card-wrapper ${isBlocked ? 'is-item-blocked' : ''}`}>
                                <div className="cart-item-content-body">
                                    {/* Thumbnail */}
                                    <div className="cart-item-thumbnail-box">
                                        <img src={item.variant?.image || ''} alt={item.variant?.variant_name} />
                                    </div>

                                    {/* Meta Details & Pricing */}
                                    <div className="cart-item-details-stack">
                                        <Link to={`/products/${item.variant?.product_id || ''}`} className="cart-item-title-name">
                                            {item.variant?.product_name || 'Product'}
                                        </Link>
                                        <span className="cart-item-variant-label">
                                            Edition: {item.variant?.variant_name}
                                        </span>

                                        {/* Availability / Blocked Warnings */}
                                        {isBlocked ? (
                                            <span style={{ color: 'red' }} className="cart-item-stock-warning-label blocked-item">
                                                <AlertTriangle size={13} /> Unavailable!
                                            </span>
                                        ) : isOutOfStock ? (
                                            <span className="cart-item-stock-warning-label out-of-stock">
                                                Out of Stock
                                            </span>
                                        ) : stock <= 5 ? (
                                            <span className="cart-item-stock-warning-label low-stock">
                                                Only {stock} left - order soon!
                                            </span>
                                        ) : null}

                                        {!isBlocked && isStockExceeded && !isOutOfStock && (
                                            <span className="cart-item-stock-warning-label out-of-stock">
                                                Quantity exceeds available stock ({stock})
                                            </span>
                                        )}

                                        {/* Pricing */}
                                        <div className="cart-item-pricing-column">
                                            <span className="cart-item-current-price">
                                                {formatPrice(item.variant?.sale_price || item.variant?.price)}
                                            </span>
                                            {item.variant?.sale_price && (
                                                <>
                                                    <span className="cart-item-original-price-strike">
                                                        {formatPrice(item.variant?.price)}
                                                    </span>
                                                    <span className="discount-badge-green" style={{ fontSize: '11px', padding: '2px 6px' }}>
                                                        Save {item.variant?.price ? Math.round(((item.variant.price - item.variant.sale_price) / item.variant.price) * 100) : 0}%
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Action Footer (Quantity + Subtotal) */}
                                <div className="cart-item-action-footer">
                                    <div className="cart-item-quantity-controls-block">
                                        <button
                                            type="button"
                                            onClick={() => handleDecrement(item)}
                                            disabled={isBlocked}
                                            className="btn-qty-operation"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="cart-item-qty-value-display">{item.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleIncrement(item)}
                                            disabled={isBlocked || item.quantity >= stock}
                                            className="btn-qty-operation"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    <div className="cart-item-subtotal-label">
                                        <span className="cart-item-subtotal-lbl-prefix">Total: </span>
                                        <span className="cart-item-subtotal-amount">{formatPrice(item.line_total)}</span>
                                    </div>
                                </div>

                                {/* Quick Remove */}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(item.id, item.variant?.variant_name)}
                                    className="btn-cart-remove-item"
                                    aria-label="Remove item from cart"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    })}

                    {/* Continue shopping footer link */}
                    <div style={{ marginTop: '16px' }}>
                        <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: '600', textDecoration: 'none', fontSize: '14.5px' }}>
                            <ArrowLeft size={16} />
                            <span>Continue Shopping</span>
                        </Link>
                    </div>
                </div>

                {/* Right Column: Checkout Summary Dashboard */}
                <div className="cart-order-summary-card">
                    <h3 className="summary-card-title">Order Summary</h3>

                    <div className="summary-details-rows-stack">
                        <div className="summary-detail-row-lbl">
                            <span>Subtotal</span>
                            <span className="summary-detail-row-val">{formatPrice(subtotal)}</span>
                        </div>
                        {savings > 0 && (
                            <div className="summary-detail-row-lbl savings-row">
                                <span>Discount Savings</span>
                                <span className="summary-detail-row-val">-{formatPrice(savings)}</span>
                            </div>
                        )}
                        <div className="summary-detail-row-lbl">
                            <span>Shipping</span>
                            <span className="summary-detail-row-val">
                                {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                            </span>
                        </div>
                        {shippingCost > 0 && (
                            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '-8px' }}>
                                Add {formatPrice(shippingThreshold - subtotal)} more for FREE shipping!
                            </span>
                        )}
                    </div>

                    <div className="summary-estimated-total-row">
                        <span>Total</span>
                        <span>{formatPrice(estimatedTotal)}</span>
                    </div>

                    {/* Warning alert if blocked items are in cart */}
                    {hasBlockedItems && (
                        <div className="cart-checkout-warning-box">
                            <AlertTriangle size={15} className="warning-box-icon" style={{ color: 'red' }} />
                            <span> Unavailable items in cart. Please remove them before checkout.</span>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleCheckout}
                        disabled={isCheckoutDisabled}
                        className={`btn-checkout-action-trigger ${isCheckoutDisabled ? 'btn-checkout-disabled' : ''}`}
                        style={{ color: "white" }}
                    >
                        <span>Proceed to Checkout</span>
                        <ArrowRight size={16} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px', justifyContent: 'center', marginTop: '8px' }}>
                        <ShieldCheck size={14} />
                        <span>Secure SSL Checkout &amp; Returns</span>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={closeConfirm}
            />

            <ConfirmContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                initialPhone={user?.phone || ""}
                onConfirmSuccess={handleConfirmContactSuccess}
            />
        </div>
    );
}

// Skeleton loading layout
function CartPageSkeleton() {
    return (
        <div className="cart-page-outer-container details-page-skeleton-loader">
            <div className="skeleton-box-el" style={{ width: '250px', height: '36px', marginBottom: '32px' }} />
            <div className="cart-page-split-layout">
                <div className="cart-items-list-workspace">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="skeleton-box-el" style={{ width: '100%', height: '140px', borderRadius: '16px', marginBottom: '16px' }} />
                    ))}
                </div>
                <div className="skeleton-box-el" style={{ width: '100%', height: '320px', borderRadius: '20px' }} />
            </div>
        </div>
    );
}

export default CartPage;
