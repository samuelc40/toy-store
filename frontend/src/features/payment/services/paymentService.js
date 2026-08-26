import api from "../../../api/axios";

export const createPaymentOrder = async (addressId) => {
    const response = await api.post("/customers/payments/create-order/", { address_id: addressId });
    return response.data;
};

export const verifyPayment = async (payload) => {
    const response = await api.post("/customers/payments/verify/", payload);
    return response.data;
};

export const retryPayment = async (addressId) => {
    const response = await api.post("/customers/payments/retry/", { address_id: addressId });
    return response.data;
};

export const getPaymentDetails = async (paymentId) => {
    const response = await api.get(`/customers/payments/${paymentId}/`);
    return response.data;
};

export const loadRazorpaySDK = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};
