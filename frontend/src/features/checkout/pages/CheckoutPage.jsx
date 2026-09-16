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
  Wallet,
} from "lucide-react";
import { toast } from "react-toastify";
import CouponSection from "../components/CouponSection";
import { getWallet } from "../../profile/profileService";

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
import {
  createPaymentOrderAsync,
  verifyPaymentAsync,
} from "../../payment/redux/paymentSlice";
import { loadRazorpaySDK } from "../../payment/services/paymentService";
import { selectUser } from "../../auth/authSlice";
import { fetchCartAsync } from "../../cart/redux/cartSlice";
import AddressForm from "../../profile/AddressForm";
import { createAddress, updateAddress } from "../../profile/addressService";
import ConfirmContactModal from "../../cart/components/ConfirmContactModal";
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

  // Modal & Payment states
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    dispatch(fetchCheckoutDataAsync());
    dispatch(fetchCartAsync());
    const fetchWallet = async () => {
      try {
        const res = await getWallet();
        if (res?.success && res?.data?.balance) {
          setWalletBalance(Number(res.data.balance));
        }
      } catch (err) {
        console.error("Error loading wallet balance for checkout:", err);
      }
    };
    fetchWallet();
  }, [dispatch]);

  const cartSummaryFromRedux = useSelector((state) => state.cart.summary);
  const cartItemsFromRedux = useSelector((state) => state.cart.items);

  const fetchedAddresses = checkoutData?.addresses || [];
  const addresses =
    fetchedAddresses.length > 0 ? fetchedAddresses : user?.addresses || [];
  const cart = checkoutData?.cart || null;
  const cartItems =
    cart?.items && cart.items.length > 0
      ? cart.items
      : cartItemsFromRedux || [];
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
    return acc + p * Number(item.quantity || 1);
  }, 0);

  const computedSavings = cartItems.reduce((acc, item) => {
    if (item.discount) return acc + Number(item.discount);
    const v = item.variant || {};
    if (v.sale_price && v.price) {
      return (
        acc +
        (Number(v.price) - Number(v.sale_price)) * Number(item.quantity || 1)
      );
    }
    return acc;
  }, 0);

  const totalItemsCount =
    cart?.total_items && cart.total_items > 0
      ? cart.total_items
      : cartItems.reduce((acc, item) => acc + Number(item.quantity || 1), 0);

  const subtotal =
    cart?.cart_total && Number(cart.cart_total) > 0
      ? Number(cart.cart_total)
      : computedSubtotal || Number(cartSummaryFromRedux?.cart_total || 0);

  const savings =
    cart?.savings && Number(cart.savings) > 0
      ? Number(cart.savings)
      : computedSavings || Number(cartSummaryFromRedux?.savings || 0);

  const mrpTotal = Number(
    cart?.mrp_total || cartSummaryFromRedux?.mrp_total || subtotal + savings,
  );

  const appliedCoupon = cart?.applied_coupon || null;
  const couponDiscount =
    cart?.coupon_discount !== undefined ? Number(cart.coupon_discount) : 0;
  const shippingFeeFromBackend =
    cart?.shipping_fee !== undefined ? Number(cart.shipping_fee) : null;
  const grandTotalFromBackend =
    cart?.grand_total !== undefined ? Number(cart.grand_total) : null;

  // Shipping fee logic: Free at or above Rs. 999, otherwise Rs. 99
  const shippingThreshold = 999;
  const shippingCost =
    shippingFeeFromBackend !== null
      ? shippingFeeFromBackend
      : subtotal >= shippingThreshold || subtotal === 0
        ? 0
        : 1; // 99 I will edit this later
  const grandTotal =
    grandTotalFromBackend !== null
      ? grandTotalFromBackend
      : Math.max(0, subtotal - couponDiscount + shippingCost);

  // Address Icon Helper
  const getAddressIcon = (type) => {
    switch (type?.toUpperCase()) {
      case "HOME":
        return <Home size={16} />;
      case "WORK":
      case "OFFICE":
        return <Building2 size={16} />;
      default:
        return <MapPin size={16} />;
    }
  };

  // Address submit handler
  const handleAddressSubmit = async (formData) => {
    setSavingAddress(true);
    try {
      if (editingAddress?.id) {
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
      const msg =
        typeof err?.response?.data === "string"
          ? err.response.data
          : "Failed to save address.";
      toast.error(msg);
    } finally {
      setSavingAddress(false);
    }
  };

  // Place Order / Online Payment handler
  const handlePlaceOrder = async () => {
    if (!user?.phone || !user.phone.trim()) {
      toast.info(
        "Please confirm your contact phone number before placing an order.",
      );
      setIsContactModalOpen(true);
      return;
    }

    if (!selectedAddressId) {
      toast.error("Please select a delivery address to place your order.");
      return;
    }

    if (isCartEmpty) {
      toast.error("Your cart is empty.");
      return;
    }

    if (paymentMethod === "COD" || paymentMethod === "WALLET") {
      try {
        const res = await dispatch(
          placeOrderAsync({
            address_id: selectedAddressId,
            payment_method: paymentMethod,
          }),
        ).unwrap();

        dispatch(fetchCartAsync());
        toast.success(
          paymentMethod === "WALLET"
            ? "Order paid using Wallet & placed successfully!"
            : "Order placed successfully!",
        );
        navigate("/order-success", { state: { order: res.order || res } });
      } catch (err) {
        toast.error(typeof err === "string" ? err : "Failed to place order.");
      }
    } else if (paymentMethod === "RAZORPAY") {
      setIsProcessingPayment(true);
      try {
        const sdkLoaded = await loadRazorpaySDK();
        if (!sdkLoaded) {
          toast.error(
            "Razorpay SDK failed to load. Please check your internet connection.",
          );
          setIsProcessingPayment(false);
          return;
        }

        const rzpData = await dispatch(
          createPaymentOrderAsync(selectedAddressId),
        ).unwrap();

        const options = {
          key: rzpData.key,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: "Toy Store",
          description: "Online Order Payment",
          order_id: rzpData.razorpay_order_id,
          handler: async function (response) {
            try {
              const verifyRes = await dispatch(
                verifyPaymentAsync({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  address_id: selectedAddressId,
                }),
              ).unwrap();

              dispatch(fetchCartAsync());
              toast.success("Payment verified! Order placed successfully.");
              navigate("/payment-success", {
                state: {
                  order_number: verifyRes.order_number,
                  order_id: verifyRes.order_id,
                  payment_id: response.razorpay_payment_id,
                  amount: (rzpData.amount / 100).toFixed(2),
                },
              });
            } catch (err) {
              navigate("/payment-failure", {
                state: {
                  reason:
                    typeof err === "string"
                      ? err
                      : "Payment signature verification failed.",
                  address_id: selectedAddressId,
                },
              });
            } finally {
              setIsProcessingPayment(false);
            }
          },
          prefill: {
            name:
              `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
              user?.email ||
              "",
            email: user?.email || "",
            contact: user?.phone || "",
          },
          theme: {
            color: "#4f46e5",
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
              toast.info("Payment session was cancelled.");
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          setIsProcessingPayment(false);
          navigate("/payment-failure", {
            state: {
              reason:
                response.error?.description ||
                "Payment was declined by bank or gateway.",
              address_id: selectedAddressId,
            },
          });
        });
        rzp.open();
      } catch (err) {
        setIsProcessingPayment(false);
        toast.error(
          typeof err === "string" ? err : "Failed to initiate payment gateway.",
        );
      }
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
          <span>
            {typeof error === "string"
              ? error
              : "An error occurred during checkout."}
          </span>
        </div>
      )}

      {isCartEmpty ? (
        /* Empty Cart Notice */
        <div className="checkout-empty-cart-card">
          <ShoppingBag size={56} className="empty-cart-icon" />
          <h2>Your Cart is Empty</h2>
          <p>
            Add some exciting toys to your cart before proceeding to checkout.
          </p>
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
                  <div className="section-title-icon-badge">
                    <MapPin size={20} className="section-title-icon" />
                  </div>
                  <h2>1. Select Shipping Address</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddress(null);
                    setIsAddressModalOpen(true);
                  }}
                  className="btn-add-new-address-pill"
                >
                  <Plus size={16} />
                  <span>Add New</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="no-address-warning-box">
                  <div>
                    <h4>No Shipping Address Found</h4>
                    <p>Please add a delivery address to complete your order.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddress(null);
                      setIsAddressModalOpen(true);
                    }}
                    className="btn-add-first-address"
                  >
                    <Plus size={16} />
                    <span>Add Address</span>
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
                              name="address_id"
                              value={addr.id}
                              checked={isSelected}
                              onChange={() =>
                                dispatch(setSelectedAddressId(addr.id))
                              }
                            />
                            <span className="custom-radio-circle"></span>
                            <div className="address-type-tag">
                              {getAddressIcon(addr.address_type)}
                              <span>{addr.address_type || "HOME"}</span>
                            </div>
                          </label>

                          <div className="address-card-badges-actions">
                            {addr.is_default && (
                              <span className="default-address-pill">
                                DEFAULT
                              </span>
                            )}
                            <button
                              type="button"
                              className="btn-edit-address-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAddress(addr);
                                setIsAddressModalOpen(true);
                              }}
                              title="Edit Address"
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="address-card-details">
                          <p className="address-recipient-name">
                            {user?.first_name} {user?.last_name} (
                            {user?.phone || "No phone"})
                          </p>
                          <p className="address-street">
                            {addr.address_line1}
                            {addr.address_line2
                              ? `, ${addr.address_line2}`
                              : ""}
                          </p>
                          {addr.landmark && (
                            <p className="address-landmark">
                              Landmark: {addr.landmark}
                            </p>
                          )}
                          <p className="address-location">
                            {addr.city}, {addr.state} - {addr.postal_code},{" "}
                            {addr.country}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: Payment Method Selection */}
            <div className="checkout-section-card">
              <div className="checkout-section-header">
                <div className="section-title-wrapper">
                  <div className="section-title-icon-badge">
                    <CreditCard size={20} className="section-title-icon" />
                  </div>
                  <h2>2. Select Payment Method</h2>
                </div>
              </div>

              <div className="payment-options-list">
                {/* Option 1: Wallet Payment */}
                <div
                  className={`payment-option-card ${paymentMethod === "WALLET" ? "selected" : ""} ${walletBalance < grandTotal ? "disabled-wallet-option" : ""}`}
                  onClick={() => {
                    if (walletBalance >= grandTotal) {
                      setPaymentMethod("WALLET");
                    } else {
                      toast.warning(
                        `Insufficient wallet balance (Available: Rs. ${walletBalance.toFixed(2)}). Please choose another payment method.`,
                      );
                    }
                  }}
                >
                  <label className="payment-radio-label">
                    <input
                      type="radio"
                      name="payment_method"
                      value="WALLET"
                      checked={paymentMethod === "WALLET"}
                      disabled={walletBalance < grandTotal}
                      onChange={() => {
                        if (walletBalance >= grandTotal)
                          setPaymentMethod("WALLET");
                      }}
                    />
                    <span className="custom-radio-circle"></span>
                    <div className="payment-option-info">
                      <div className="payment-title-row">
                        <span className="payment-title">
                          👛 Pay with Store Wallet
                        </span>
                        <span
                          className={`wallet-balance-pill ${walletBalance >= grandTotal ? "sufficient" : "insufficient"}`}
                        >
                          Balance: Rs. {walletBalance.toFixed(2)}
                        </span>
                      </div>
                      <span className="payment-subtext">
                        {walletBalance >= grandTotal
                          ? "Instantly pay using your available store wallet balance."
                          : `Insufficient balance (Rs. ${(grandTotal - walletBalance).toFixed(2)} short for this checkout).`}
                      </span>
                    </div>
                  </label>
                </div>

                {/* Option 2: Cash On Delivery */}
                <div
                  className={`payment-option-card ${paymentMethod === "COD" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("COD")}
                >
                  <label className="payment-radio-label">
                    <input
                      type="radio"
                      name="payment_method"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                    />
                    <span className="custom-radio-circle"></span>
                    <div className="payment-option-info">
                      <span className="payment-title">
                        💵 Cash On Delivery (COD)
                      </span>
                      <span className="payment-subtext">
                        Pay with cash when your package arrives at your
                        doorstep.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Option 3: Online Payment */}
                <div
                  className={`payment-option-card ${paymentMethod === "RAZORPAY" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("RAZORPAY")}
                >
                  <label className="payment-radio-label">
                    <input
                      type="radio"
                      name="payment_method"
                      value="RAZORPAY"
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={() => setPaymentMethod("RAZORPAY")}
                    />
                    <span className="custom-radio-circle"></span>
                    <div className="payment-option-info">
                      <span className="payment-title razorpay-title-container">
                        <svg
                          version="1.1"
                          id="Layer_1"
                          xmlns="http://www.w3.org/2000/svg"
                          xmlnsXlink="http://www.w3.org/1999/xlink"
                          x="0px"
                          y="0px"
                          viewBox="0 0 122.88 26.53"
                          style={{ enableBackground: "new 0 0 122.88 26.53" }}
                          xmlSpace="preserve"
                          className="razorpay-logo-svg"
                        >
                          <g>
                            <polygon
                              className="st1"
                              points="11.19,9.03 7.94,21.47 0,21.47 1.61,15.35 11.19,9.03"
                            />
                            <path
                              className="st1"
                              d="M28.09,5.08C29.95,5.09,31.26,5.5,32,6.33s0.92,2.01,0.51,3.56c-0.27,1.06-0.82,2.03-1.59,2.8 c-0.8,0.8-1.78,1.38-2.87,1.68c0.83,0.19,1.34,0.78,1.5,1.79l0.03,0.22l0.6,5.09h-3.7l-0.62-5.48c-0.01-0.18-0.06-0.36-0.15-0.52 c-0.09-0.16-0.22-0.29-0.37-0.39c-0.31-0.16-0.65-0.24-1-0.25h-0.21h-2.28l-1.74,6.63h-3.46l4.3-16.38H28.09L28.09,5.08z M122.88,9.37l-4.4,6.34l-5.19,7.52l-0.04,0.04l-1.16,1.68l-0.04,0.06L112,25.09l-1,1.44h-3.44l4.02-5.67l-1.82-11.09h3.57 l0.9,7.23l4.36-6.19l0.06-0.09l0.07-0.1l0.07-0.09l0.54-1.15H122.88L122.88,9.37z M92.4,10.25c0.66,0.56,1.09,1.33,1.24,2.19 c0.18,1.07,0.1,2.18-0.21,3.22c-0.29,1.15-0.78,2.23-1.46,3.19c-0.62,0.88-1.42,1.61-2.35,2.13c-0.88,0.48-1.85,0.73-2.85,0.73 c-0.71,0.03-1.41-0.15-2.02-0.51c-0.47-0.28-0.83-0.71-1.03-1.22l-0.06-0.2l-1.77,6.75h-3.43l3.51-13.4l0.02-0.06l0.01-0.06 l0.86-3.25h3.35l-0.57,1.88l-0.01,0.08c0.49-0.7,1.15-1.27,1.91-1.64c0.76-0.4,1.6-0.6,2.45-0.6C90.84,9.43,91.7,9.71,92.4,10.25 L92.4,10.25z M88.26,12.11c-0.4-0.01-0.8,0.07-1.18,0.22c-0.37,0.15-0.71,0.38-1,0.66c-0.68,0.7-1.15,1.59-1.36,2.54 c-0.3,1.11-0.28,1.95,0.02,2.53c0.3,0.58,0.87,0.88,1.72,0.88c0.81,0.02,1.59-0.29,2.18-0.86c0.66-0.69,1.12-1.55,1.33-2.49 c0.29-1.09,0.27-1.96-0.03-2.57S89.08,12.11,88.26,12.11L88.26,12.11z M103.66,9.99c0.46,0.29,0.82,0.72,1.02,1.23l0.07,0.19 l0.44-1.66h3.36l-3.08,11.7h-3.37l0.45-1.73c-0.51,0.61-1.15,1.09-1.87,1.42c-0.7,0.32-1.45,0.49-2.21,0.49 c-0.88,0.04-1.76-0.21-2.48-0.74c-0.66-0.52-1.1-1.28-1.24-2.11c-0.18-1.06-0.12-2.14,0.19-3.17c0.3-1.15,0.8-2.24,1.49-3.21 c0.63-0.89,1.44-1.64,2.38-2.18c0.86-0.5,1.84-0.77,2.83-0.77C102.36,9.43,103.06,9.61,103.66,9.99L103.66,9.99z M101.92,12.14 c-0.41,0-0.82,0.08-1.19,0.24c-0.38,0.16-0.72,0.39-1.01,0.68c-0.67,0.71-1.15,1.59-1.36,2.55c-0.28,1.08-0.28,1.9,0.04,2.49 c0.31,0.59,0.89,0.87,1.75,0.87c0.4,0.01,0.8-0.07,1.18-0.22s0.71-0.38,1-0.66c0.59-0.63,1.02-1.38,1.26-2.22l0.08-0.31 c0.3-1.11,0.29-1.96-0.03-2.53C103.33,12.44,102.76,12.14,101.92,12.14L101.92,12.14z M81.13,9.63l0.22,0.09l-0.86,3.19 c-0.49-0.26-1.03-0.39-1.57-0.39c-0.82-0.03-1.62,0.24-2.27,0.75c-0.56,0.48-0.97,1.12-1.18,1.82l-0.07,0.27l-1.6,6.11h-3.42 l3.1-11.7h3.37l-0.44,1.72c0.42-0.58,0.96-1.05,1.57-1.4c0.68-0.39,1.44-0.59,2.22-0.59C80.51,9.48,80.83,9.52,81.13,9.63 L81.13,9.63z M68.5,10.19c0.76,0.48,1.31,1.24,1.52,2.12c0.25,1.06,0.21,2.18-0.11,3.22c-0.3,1.18-0.83,2.28-1.58,3.22 c-0.71,0.91-1.61,1.63-2.64,2.12c-1.05,0.49-2.19,0.74-3.35,0.73c-1.22,0-2.22-0.24-3-0.73c-0.77-0.48-1.32-1.24-1.54-2.12 c-0.24-1.06-0.2-2.18,0.11-3.22c0.3-1.17,0.83-2.27,1.58-3.22c0.71-0.9,1.62-1.63,2.66-2.12c1.06-0.49,2.22-0.75,3.39-0.73 C66.57,9.41,67.6,9.67,68.5,10.19L68.5,10.19z M64.84,12.1c-0.81-0.01-1.59,0.3-2.18,0.86c-0.61,0.58-1.07,1.43-1.36,2.57 c-0.6,2.29-0.02,3.43,1.74,3.43c0.8,0.02,1.57-0.29,2.15-0.85c0.6-0.57,1.04-1.43,1.34-2.58c0.3-1.13,0.31-1.98,0.01-2.57 C66.25,12.37,65.68,12.1,64.84,12.1L64.84,12.1z M57.89,9.76l-0.6,2.32l-7.55,6.67h6.06l-0.72,2.73H45.05l0.63-2.41l7.43-6.57 h-5.65l0.72-2.73H57.89L57.89,9.76z M40.96,9.99c0.46,0.29,0.82,0.72,1.02,1.23l0.07,0.19l0.44-1.66h3.37l-3.07,11.7h-3.37 l0.45-1.73c-0.51,0.6-1.14,1.08-1.85,1.41s-1.48,0.5-2.27,0.5c-0.88,0.04-1.74-0.22-2.45-0.74c-0.66-0.52-1.1-1.28-1.24-2.11 c-0.18-1.06-0.12-2.14,0.19-3.17c0.29-1.15,0.8-2.24,1.49-3.21c0.63-0.89,1.44-1.64,2.37-2.18c0.86-0.5,1.84-0.76,2.83-0.76 C39.66,9.44,40.36,9.62,40.96,9.99L40.96,9.99z M39.23,12.14c-0.41,0-0.81,0.08-1.19,0.24c-0.38,0.16-0.72,0.39-1.01,0.68 c-0.68,0.71-1.15,1.59-1.36,2.55c-0.28,1.08-0.27,1.9,0.04,2.49c0.31,0.59,0.89,0.87,1.75,0.87c0.4,0.01,0.8-0.07,1.18-0.22 c0.37-0.15,0.72-0.38,1-0.66c0.59-0.62,1.03-1.38,1.26-2.22l0.08-0.31c0.29-1.11,0.26-1.94-0.03-2.53 C40.64,12.44,40.06,12.14,39.23,12.14L39.23,12.14z M26.85,7.81h-3.21l-1.13,4.28h3.21c1.01,0,1.81-0.17,2.35-0.52 c0.57-0.37,0.98-0.95,1.13-1.63c0.2-0.72,0.11-1.27-0.27-1.62C28.55,7.99,27.86,7.81,26.85,7.81L26.85,7.81z"
                            />
                            <polygon
                              className="st0"
                              points="18.4,0 12.76,21.47 8.89,21.47 12.7,6.93 6.86,10.78 7.9,6.95 18.4,0"
                            />
                          </g>
                        </svg>
                        (Online payment)
                      </span>
                      <span className="payment-subtext">
                        Fast &amp; secure instant payment via GPay, PhonePe,
                        Paytm, Cards, or NetBanking.
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
              <h3 className="summary-card-title">Order Summary</h3>

              {/* Cart Items Preview List */}
              <div className="summary-items-scroll-list">
                {cartItems.map((item) => {
                  const variant = item.variant || {};
                  const product = variant.product || {};
                  const pName =
                    item.product_name || product.name || "Toy Product";
                  const vName = item.variant_name || variant.variant_name || "";
                  const itemPrice = variant.sale_price
                    ? Number(variant.sale_price)
                    : Number(item.price || variant.price || 0);
                  const itemTotal = item.line_total
                    ? Number(item.line_total)
                    : itemPrice * Number(item.quantity || 1);
                  const imgUrl =
                    variant.image ||
                    variant.primary_image ||
                    variant.images?.[0]?.image ||
                    product.primary_image ||
                    item.image ||
                    null;

                  return (
                    <div key={item.id} className="summary-item-row">
                      <div className="summary-item-img-box">
                        {imgUrl ? (
                          <img src={imgUrl} alt={pName} />
                        ) : (
                          <span className="summary-img-placeholder">Toy</span>
                        )}
                      </div>
                      <div className="summary-item-info">
                        <p className="summary-product-name">{pName}</p>
                        {vName && (
                          <p className="summary-variant-name">
                            Variant: {vName}
                          </p>
                        )}
                        <div className="summary-qty-price-row">
                          <span className="summary-qty">
                            Qty: {item.quantity}
                          </span>
                          <span className="summary-price">
                            Rs. {itemTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <hr className="summary-divider" />

              {/* Coupon Discount Component */}
              <CouponSection
                appliedCoupon={appliedCoupon}
                couponDiscount={couponDiscount}
                onCouponUpdated={() => {
                  dispatch(fetchCartAsync());
                  dispatch(fetchCheckoutDataAsync());
                }}
              />

              <hr className="summary-divider-inner" />

              {/* Totals Breakdown */}
              <div className="summary-totals-block">
                {mrpTotal > subtotal && (
                  <div className="total-row">
                    <span>Total MRP</span>
                    <span
                      style={{
                        textDecoration: "line-through",
                        color: "var(--text-muted)",
                      }}
                    >
                      Rs. {mrpTotal.toFixed(2)}
                    </span>
                  </div>
                )}

                {savings > 0 && (
                  <div className="total-row discount-row">
                    <span>Offer Savings</span>
                    <span
                      style={{
                        color: "var(--success, #10B981)",
                        fontWeight: "600",
                      }}
                    >
                      -Rs. {savings.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="total-row">
                  <span>Subtotal ({totalItemsCount} items)</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="total-row discount-row">
                    <span>
                      Coupon Discount ({appliedCoupon?.code || "Applied"})
                    </span>
                    <span
                      style={{
                        color: "var(--success, #10B981)",
                        fontWeight: "600",
                      }}
                    >
                      -Rs. {couponDiscount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="total-row">
                  <span>Shipping Fee</span>
                  <span className={shippingCost === 0 ? "free-tag" : ""}>
                    {shippingCost === 0
                      ? "FREE"
                      : `Rs. ${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                {paymentMethod === "WALLET" && (
                  <div className="total-row discount-row">
                    <span>Wallet Payment</span>
                    <span style={{ color: "var(--accent)", fontWeight: "600" }}>
                      -Rs.{" "}
                      {(subtotal - couponDiscount + shippingCost).toFixed(2)}
                    </span>
                  </div>
                )}

                <hr className="summary-divider-inner" />

                <div className="total-row grand-total-row">
                  <span>
                    {paymentMethod === "WALLET"
                      ? "Payable via Wallet"
                      : "Total Payable"}
                  </span>
                  <span className="grand-total-val">
                    Rs.{" "}
                    {paymentMethod === "WALLET"
                      ? "0.00"
                      : grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={
                  placingOrder ||
                  isProcessingPayment ||
                  !selectedAddressId ||
                  isCartEmpty
                }
                className="btn-place-order-submit"
              >
                {placingOrder || isProcessingPayment ? (
                  <span className="btn-loading-content">
                    <svg
                      className="spinner-icon"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        style={{ opacity: 0.2 }}
                      ></circle>
                      <path
                        d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4526"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></path>
                    </svg>
                    {paymentMethod === "RAZORPAY"
                      ? "Opening Payment Gateway..."
                      : "Placing Order..."}
                  </span>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span className="btn-place-order-text">
                      {paymentMethod === "RAZORPAY"
                        ? "Proceed to Pay Online"
                        : "Place Order (COD)"}
                    </span>
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

      {/* Reusable AddressForm Modal */}
      <AddressForm
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSubmit={handleAddressSubmit}
        address={editingAddress}
        isLoading={savingAddress}
      />

      {/* Contact Number Confirmation Modal */}
      <ConfirmContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        initialPhone={user?.phone || ""}
        onConfirmSuccess={() => {
          setIsContactModalOpen(false);
          toast.success("Contact number confirmed!");
        }}
      />
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="checkout-page-outer-container">
      <div className="checkout-header-banner">
        <div
          className="skeleton-shimmer"
          style={{ width: "220px", height: "36px", borderRadius: "12px" }}
        />
      </div>
      <div className="checkout-content-grid">
        <div className="checkout-main-column">
          <div className="checkout-section-card">
            <div
              className="skeleton-shimmer"
              style={{ width: "100%", height: "180px", borderRadius: "16px" }}
            />
          </div>
        </div>
        <div className="checkout-sidebar-column">
          <div className="order-summary-sidebar-card">
            <div
              className="skeleton-shimmer"
              style={{ width: "100%", height: "320px", borderRadius: "16px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
