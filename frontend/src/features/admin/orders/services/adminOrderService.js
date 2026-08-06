import api from "../../../../api/axios";

/**
 * Fetch admin orders list with multi-field filtering, whitelisted sorting, debounced search, and pagination.
 * @param {object} params
 * @returns {Promise<object>}
 */
export const getAdminOrders = async (params = {}) => {
    const response = await api.get("/admin/orders/", { params });
    return response.data;
};

/**
 * Fetch single order details for admin.
 * @param {string} orderId
 * @returns {Promise<object>}
 */
export const getAdminOrderDetails = async (orderId) => {
    const response = await api.get(`/admin/orders/${orderId}/`);
    return response.data;
};

/**
 * Update order status with state machine transition validation.
 * @param {string} orderId
 * @param {string} orderStatus
 * @returns {Promise<object>}
 */
export const updateAdminOrderStatus = async (orderId, orderStatus) => {
    const response = await api.patch(`/admin/orders/${orderId}/status/`, {
        order_status: orderStatus,
    });
    return response.data;
};
