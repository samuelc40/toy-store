import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, X, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import { store } from '../../../app/store';
import { selectIsAuthenticated } from '../../auth/authSlice';

import {
    fetchCartAsync,
    selectCartItems,
    selectCartSummary,
    removeCartItemAsync
} from '../redux/cartSlice';

import '../styles/Cart.css';
import ConfirmModal from './ConfirmModal';

export function FloatingCartWidget() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isAuthenticated = useSelector(selectIsAuthenticated);
    const items = useSelector(selectCartItems);
    const summary = useSelector(selectCartSummary);

    const [drawerOpen, setDrawerOpen] = useState(false);

    // Modal state for quick delete
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

    // Fetch cart on mount if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCartAsync());
        }
    }, [isAuthenticated, dispatch]);

    // Do not show the floating widget if user is not logged in
    if (!isAuthenticated) return null;

    const totalItemsCount = summary?.total_items || 0;
    const cartTotal = summary?.cart_total || 0;

    const formatPrice = (val) => {
        const num = Number(val);
        if (isNaN(num)) return val;
        return `Rs. ${num.toLocaleString('en-IN')}`;
    };

    const isItemBlocked = (item) => {
        if (!item) return true;
        if (item.is_blocked || item.is_available === false) return true;
        const v = item.variant;
        if (!v) return true;
        if (v.is_blocked || v.is_available === false || v.blocked === true || v.is_active === false) return true;
        if (v.product && (v.product.blocked === true || v.product.is_active === false)) return true;
        return false;
    };

    const hasBlockedItems = summary?.has_blocked_items || items.some(isItemBlocked);

    const handleRemoveItem = (itemId, variantName) => {
        showConfirm(
            'Remove Item',
            `Remove ${variantName || 'this item'} from your cart?`,
            () => {
                dispatch(removeCartItemAsync(itemId));
            }
        );
    };

    const handleCheckout = () => {
        setDrawerOpen(false);
        navigate('/cart');
    };

    return (
        <>
            {/* Floating FAB Bubble */}
            <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="floating-cart-fab"
                aria-label="Toggle shopping cart drawer"
            >
                <ShoppingBag size={24} />
                {totalItemsCount > 0 && (
                    <span className="floating-cart-badge">{totalItemsCount}</span>
                )}
            </button>

            {/* Slide-over Side Drawer Overlay */}
            <div
                className={`cart-drawer-overlay ${drawerOpen ? 'drawer-open' : ''}`}
                onClick={() => setDrawerOpen(false)}
            >
                <div
                    className="cart-drawer-container"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Drawer Header */}
                    <div className="cart-drawer-header">
                        <h3 className="cart-drawer-title">Shopping Cart ({totalItemsCount})</h3>
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(false)}
                            className="btn-close-drawer"
                            aria-label="Close drawer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Drawer Body */}
                    <div className="cart-drawer-body">
                        {items.length === 0 ? (
                            <div className="drawer-empty-state-box">
                                <span className="drawer-empty-icon" role="img" aria-label="shopping cart">🛒</span>
                                <span className="drawer-empty-text">Your cart is currently empty.</span>
                                <Link
                                    to="/products"
                                    onClick={() => setDrawerOpen(false)}
                                    className="btn-drawer-view-cart"
                                    style={{ textDecoration: 'none' }}
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        ) : (
                            items.map((item) => {
                                const blocked = isItemBlocked(item);
                                return (
                                    <div key={item.id} className={`cart-drawer-item-row ${blocked ? 'is-item-blocked' : ''}`}>
                                        <div className="drawer-item-thumb">
                                            <img
                                                src={item.variant?.image || ''}
                                                alt={item.variant?.variant_name}
                                            />
                                        </div>
                                        <div className="drawer-item-details">
                                            <span className="drawer-item-name">
                                                {item.variant?.product_name || 'Product'}
                                            </span>
                                            <span className="drawer-item-variant">
                                                Edition: {item.variant?.variant_name}
                                            </span>

                                            {blocked ? (
                                                <span className="cart-item-stock-warning-label blocked-item" style={{ fontSize: '10.5px', marginTop: '4px' }}>
                                                    <AlertTriangle size={11} /> Unavailable
                                                </span>
                                            ) : (
                                                <div className="drawer-item-price-qty">
                                                    <span className="drawer-qty-lbl">Qty: {item.quantity}</span>
                                                    <span className="drawer-item-price">
                                                        {formatPrice(item.variant?.sale_price || item.variant?.price)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(item.id, item.variant?.variant_name)}
                                            className="btn-drawer-remove-item"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Drawer Footer */}
                    {items.length > 0 && (
                        <div className="cart-drawer-footer">
                            <div className="drawer-subtotal-row">
                                <span>Subtotal</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>

                            {hasBlockedItems && (
                                <div className="cart-checkout-warning-box" style={{ margin: '8px 0' }}>
                                    <AlertTriangle size={13} />
                                    <span style={{ fontSize: '11.5px' }}>Remove unavailable items to checkout</span>
                                </div>
                            )}

                            <Link
                                to="/cart"
                                onClick={() => setDrawerOpen(false)}
                                className="btn-drawer-view-cart"
                                style={{ textDecoration: 'none' }}
                            >
                                View Cart Page
                            </Link>
                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={hasBlockedItems}
                                className={`btn-drawer-checkout ${hasBlockedItems ? 'btn-checkout-disabled' : ''}`}
                            >
                                <span>Proceed to Checkout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={closeConfirm}
            />
        </>
    );
}

// Self-mounting global widget helper
let widgetMounted = false;
export const initCartWidget = () => {
    if (widgetMounted || typeof document === 'undefined') return;
    const container = document.createElement('div');
    container.id = 'floating-cart-widget-container';
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(
        <Provider store={store}>
            <FloatingCartWidget />
        </Provider>
    );
    widgetMounted = true;
};

export default FloatingCartWidget;
