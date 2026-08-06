import api from "../../../api/axios";

/**
 * Fetch checkout summary data (addresses, default selected address, cart summary).
 * @returns {Promise<object>} response data
 */
export const getCheckoutSummary = async () => {
    const response = await api.get("/customers/checkout/");
    return response.data;
};

/**
 * Submit order placement (address_id, payment_method="COD").
 * @param {object} payload { address_id, payment_method }
 * @returns {Promise<object>} response data
 */
export const placeOrder = async (payload) => {
    const response = await api.post("/customers/checkout/place-order/", payload);
    return response.data;
};

/**
 * Fetch placed order details by order ID.
 * @param {string} orderId
 * @returns {Promise<object>} response data
 */
export const getOrderDetails = async (orderId) => {
    const response = await api.get(`/customers/checkout/orders/${orderId}/`);
    return response.data;
};
