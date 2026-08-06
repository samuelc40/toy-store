import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
    MapPin,
    Plus,
    Pencil,
    CheckCircle2,
    ShoppingBag,
    ShieldCheck,
    Truck,
    CreditCard,
    ArrowRight,
    AlertTriangle,
    Home,
    Building2,
    HelpCircle,
} from "lucide-react";
import { toast } from "react-toastify";

import {
    fetchCheckoutDataAsync,
    placeOrderAsync,
    setSelectedAddressId,
    selectCheckoutData,
    selectSelectedAddressId,
    selectPlacingOrder,
    selectCheckoutLoading,
    selectCheckoutError,
} from "../redux/checkoutSlice";
import { selectUser } from "../../auth/authSlice";
import { fetchCartAsync } from "../../cart/redux/cartSlice";
import AddressForm from "../../profile/AddressForm";
import { createAddress, updateAddress } from "../../profile/addressService";
import "../styles/Checkout.css";

export function CheckoutPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector(selectUser);
    const checkoutData = useSelector(selectCheckoutData);
    const selectedAddressId = useSelector(selectSelectedAddressId);
    const placingOrder = useSelector(selectPlacingOrder);
    const loading = useSelector(selectCheckoutLoading);
    const error = useSelector(selectCheckoutError);

    // Address Modal state for reusing AddressForm
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [savingAddress, setSavingAddress] = useState(false);

    useEffect(() => {
        dispatch(fetchCheckoutDataAsync());
        dispatch(fetchCartAsync());
    }, [dispatch]);

    const cartSummaryFromRedux = useSelector((state) => state.cart.summary);
    const cartItemsFromRedux = useSelector((state) => state.cart.items);

    const fetchedAddresses = checkoutData?.addresses || [];
    const addresses = (fetchedAddresses.length > 0) ? fetchedAddresses : (user?.addresses || []);
    const cart = checkoutData?.cart || null;
    const cartItems = (cart?.items && cart.items.length > 0) ? cart.items : (cartItemsFromRedux || []);
    const isCartEmpty = !cartItems || cartItems.length === 0;

    // Auto-select default address if available and not set
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const def = addresses.find((a) => a.is_default) || addresses[0];
            if (def?.id) {
                dispatch(setSelectedAddressId(def.id));
            }
        }
    }, [addresses, selectedAddressId, dispatch]);

    // Dynamically calculate summary totals from cart items as fallback
    const computedSubtotal = cartItems.reduce((acc, item) => {
        if (item.line_total) return acc + Number(item.line_total);
        const v = item.variant || {};
        const p = v.sale_price ? Number(v.sale_price) : Number(v.price || 0);
        return acc + (p * Number(item.quantity || 1));
    }, 0);

    const computedSavings = cartItems.reduce((acc, item) => {
        if (item.discount) return acc + Number(item.discount);
        const v = item.variant || {};
        if (v.sale_price && v.price) {
            return acc + ((Number(v.price) - Number(v.sale_price)) * Number(item.quantity || 1));
        }
        return acc;
    }, 0);

    const totalItemsCount = (cart?.total_items && cart.total_items > 0)
        ? cart.total_items
        : cartItems.reduce((acc, item) => acc + Number(item.quantity || 1), 0);

    const subtotal = (cart?.cart_total && Number(cart.cart_total) > 0)
        ? Number(cart.cart_total)
        : (computedSubtotal || Number(cartSummaryFromRedux?.cart_total || 0));

    const savings = (cart?.savings && Number(cart.savings) > 0)
        ? Number(cart.savings)
        : (computedSavings || Number(cartSummaryFromRedux?.savings || 0));

    // Address Icon Helper
    const getAddressIcon = (type) => {
        switch (type?.toUpperCase()) {
            case "HOME":
                return <Home size={16} />;
            case "OFFICE":
                return <Building2 size={16} />;
            default:
                return <HelpCircle size={16} />;
        }
    };

    // Open Add Address Modal
    const handleOpenAddAddress = () => {
        setEditingAddress(null);
        setIsAddressModalOpen(true);
    };

    // Open Edit Address Modal
    const handleOpenEditAddress = (addr, e) => {
        e.stopPropagation();
        setEditingAddress(addr);
        setIsAddressModalOpen(true);
    };

    // Save Address handler (reuses existing addressService)
    const handleAddressSubmit = async (formData) => {
        setSavingAddress(true);
        try {
            if (editingAddress) {
                await updateAddress(editingAddress.id, formData);
                toast.success("Address updated successfully!");
            } else {
                const newAddr = await createAddress(formData);
                toast.success("New address added successfully!");
                if (newAddr?.id) {
                    dispatch(setSelectedAddressId(newAddr.id));
                }
            }
            setIsAddressModalOpen(false);
            dispatch(fetchCheckoutDataAsync());
        } catch (err) {
            const msg = typeof err?.response?.data === "string"
                ? err.response.data
                : "Failed to save address.";
            toast.error(msg);
        } finally {
            setSavingAddress(false);
        }
    };

    // Place Order handler
    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.error("Please select a delivery address to place your order.");
            return;
        }

        if (isCartEmpty) {
            toast.error("Your cart is empty.");
            return;
        }

        try {
            const res = await dispatch(
                placeOrderAsync({
                    address_id: selectedAddressId,
                    payment_method: "COD",
                })
            ).unwrap();

            // Refresh cart state to clear header cart count
            dispatch(fetchCartAsync());
            toast.success("Order placed successfully!");

            // Redirect to Order Success page with order response
            navigate("/order-success", { state: { order: res.order || res } });
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to place order.");
        }
    };

    if (loading && !checkoutData) {
        return <CheckoutSkeleton />;
    }

    return (
        <div className="checkout-page-outer-container">
            {/* Header Title Section */}
            <div className="checkout-header-banner">
                <div className="checkout-title-group">
                    <div className="checkout-title-icon-badge">
                        <Truck size={24} />
                    </div>
                    <div>
                        <h1 className="checkout-page-heading">Checkout</h1>
                        <p className="checkout-page-subheading">
                            Review your items, select shipping address, and confirm payment.
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="checkout-error-banner">
                    <AlertTriangle size={18} />
                    <span>{typeof error === "string" ? error : "An error occurred during checkout."}</span>
                </div>
            )}

            {isCartEmpty ? (
                /* Empty Cart Notice */
                <div className="checkout-empty-cart-card">
                    <ShoppingBag size={56} className="empty-cart-icon" />
                    <h2>Your Cart is Empty</h2>
                    <p>Add some exciting toys to your cart before proceeding to checkout.</p>
                    <Link to="/products" className="btn-explore-toys-link">
                        <span>Explore Toys Catalog</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
            ) : (
                /* Checkout Content Grid */
                <div className="checkout-content-grid">
                    {/* Left Column: Address & Payment */}
                    <div className="checkout-main-column">
                        {/* Section 1: Shipping Address Selection */}
                        <div className="checkout-section-card">
                            <div className="checkout-section-header">
                                <div className="section-title-wrapper">
                                    <MapPin size={20} className="section-title-icon" />
                                    <h2>1. Select Shipping Address</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleOpenAddAddress}
                                    className="btn-add-new-address-pill"
                                >
                                    <Plus size={15} />
                                    <span>Add Address</span>
                                </button>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="no-address-warning-box">
                                    <AlertTriangle size={24} className="warning-icon" />
                                    <div>
                                        <h4>No saved addresses found.</h4>
                                        <p>Please add a delivery address to complete your order.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleOpenAddAddress}
                                        className="btn-add-first-address"
                                    >
                                        <Plus size={15} />
                                        <span>Add New Address</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="checkout-address-cards-list">
                                    {addresses.map((addr) => {
                                        const isSelected = selectedAddressId === addr.id;
                                        return (
                                            <div
                                                key={addr.id}
                                                className={`checkout-address-card ${isSelected ? "selected" : ""}`}
                                                onClick={() => dispatch(setSelectedAddressId(addr.id))}
                                            >
                                                <div className="address-card-top-row">
                                                    <label className="address-radio-label">
                                                        <input
                                                            type="radio"
                                                            name="checkout_address"
                                                            checked={isSelected}
                                                            onChange={() => dispatch(setSelectedAddressId(addr.id))}
                                                        />
                                                        <span className="custom-radio-circle"></span>
                                                        <span className="address-type-tag">
                                                            {getAddressIcon(addr.address_type)}
                                                            {addr.address_type}
                                                        </span>
                                                    </label>

                                                    <div className="address-card-badges-actions">
                                                        {addr.is_default && (
                                                            <span className="default-address-pill">DEFAULT</span>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleOpenEditAddress(addr, e)}
                                                            className="btn-edit-address-icon"
                                                            title="Edit Address"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="address-card-details">
                                                    <p className="address-recipient-name">
                                                        {user?.first_name} {user?.last_name} ({user?.phone || "No phone"})
                                                    </p>
                                                    <p className="address-street">
                                                        {addr.address_line1}
                                                        {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                                                    </p>
                                                    {addr.landmark && (
                                                        <p className="address-landmark">Landmark: {addr.landmark}</p>
                                                    )}
                                                    <p className="address-location">
                                                        {addr.city}, {addr.state} - {addr.postal_code}, {addr.country}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Section 2: Payment Method */}
                        <div className="checkout-section-card">
                            <div className="checkout-section-header">
                                <div className="section-title-wrapper">
                                    <CreditCard size={20} className="section-title-icon" />
                                    <h2>2. Payment Method</h2>
                                </div>
                            </div>

                            <div className="payment-options-list">
                                <div className="payment-option-card selected">
                                    <label className="payment-radio-label">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="COD"
                                            checked={true}
                                            readOnly
                                        />
                                        <span className="custom-radio-circle"></span>
                                        <div className="payment-option-info">
                                            <span className="payment-title">💵 Cash On Delivery (COD)</span>
                                            <span className="payment-subtext">
                                                Pay with cash when your package arrives at your doorstep.
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary & Place Order */}
                    <div className="checkout-sidebar-column">
                        <div className="order-summary-sidebar-card">
                            <h3 className="summary-card-title">Order Summary ({totalItemsCount} items)</h3>

                            {/* Cart Items List */}
                            <div className="summary-items-scroll-list">
                                {cartItems.map((item) => {
                                    const variant = item.variant || {};
                                    const itemPrice = item.line_total
                                        ? Number(item.line_total)
                                        : (variant.sale_price ? Number(variant.sale_price) : Number(variant.price || 0)) * (item.quantity || 1);
                                    return (
                                        <div key={item.id || item.variant?.id} className="summary-item-row">
                                            <div className="summary-item-img-box">
                                                {variant.image ? (
                                                    <img src={variant.image} alt={variant.product_name} />
                                                ) : (
                                                    <div className="summary-img-placeholder">Toy</div>
                                                )}
                                            </div>
                                            <div className="summary-item-info">
                                                <h4 className="summary-product-name">{variant.product_name}</h4>
                                                <p className="summary-variant-name">{variant.variant_name}</p>
                                                {variant.sku && <span className="summary-sku">SKU: {variant.sku}</span>}
                                                <div className="summary-qty-price-row">
                                                    <span className="summary-qty">Qty: {item.quantity}</span>
                                                    <span className="summary-price">
                                                        Rs. {itemPrice.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <hr className="summary-divider" />

                            {/* Pricing Totals */}
                            <div className="summary-totals-block">
                                <div className="total-row">
                                    <span>Subtotal</span>
                                    <span>Rs. {subtotal.toFixed(2)}</span>
                                </div>

                                {savings > 0 && (
                                    <div className="total-row discount-row">
                                        <span>Discount Savings</span>
                                        <span>-Rs. {savings.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="total-row">
                                    <span>Coupon Discount</span>
                                    <span className="free-tag">Rs. 0.00</span>
                                </div>

                                <div className="total-row">
                                    <span>Shipping</span>
                                    <span className="free-tag">FREE</span>
                                </div>

                                <hr className="summary-divider-inner" />

                                <div className="total-row grand-total-row">
                                    <span>Total Payable</span>
                                    <span className="grand-total-val">
                                        Rs. {subtotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Place Order CTA Button */}
                            <button
                                type="button"
                                onClick={handlePlaceOrder}
                                disabled={placingOrder || !selectedAddressId || isCartEmpty}
                                className="btn-place-order-submit"
                            >
                                {placingOrder ? (
                                    <span className="btn-loading-content">
                                        <svg className="spinner-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.2 }}></circle>
                                            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4526" stroke="currentColor" strokeWidth="4"></path>
                                        </svg>
                                        Placing Order...
                                    </span>
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        <span className="btn-place-order-text">Place Order (COD)</span>
                                    </>
                                )}
                            </button>

                            <div className="security-guarantee-badge">
                                <ShieldCheck size={16} />
                                <span>100% Safe &amp; Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reusable AddressForm Modal (Consumes existing AddressForm) */}
            <AddressForm
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                onSubmit={handleAddressSubmit}
                address={editingAddress}
                isLoading={savingAddress}
            />
        </div>
    );
}

function CheckoutSkeleton() {
    return (
        <div className="checkout-page-outer-container">
            <div className="checkout-header-banner">
                <div className="skeleton-shimmer" style={{ width: '220px', height: '36px', borderRadius: '12px' }} />
            </div>
            <div className="checkout-content-grid">
                <div className="checkout-main-column">
                    <div className="checkout-section-card">
                        <div className="skeleton-shimmer" style={{ width: '100%', height: '180px', borderRadius: '16px' }} />
                    </div>
                </div>
                <div className="checkout-sidebar-column">
                    <div className="order-summary-sidebar-card">
                        <div className="skeleton-shimmer" style={{ width: '100%', height: '320px', borderRadius: '16px' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;
