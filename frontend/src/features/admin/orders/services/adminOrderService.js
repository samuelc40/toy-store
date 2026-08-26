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

/**
 * Fetch return requests list for admin.
 */
export const getAdminReturnRequests = async (params = {}) => {
    const response = await api.get("/admin/orders/returns/", { params });
    return response.data;
};

/**
 * Fetch single return request detail.
 */
export const getAdminReturnDetail = async (returnId) => {
    const response = await api.get(`/admin/orders/returns/${returnId}/`);
    return response.data;
};

/**
 * Approve return request.
 */
export const approveReturnRequest = async (returnId, data = {}) => {
    const response = await api.post(`/admin/orders/returns/${returnId}/approve/`, data);
    return response.data;
};

/**
 * Reject return request.
 */
export const rejectReturnRequest = async (returnId, data = {}) => {
    const response = await api.post(`/admin/orders/returns/${returnId}/reject/`, data);
    return response.data;
};

/**
 * Fetch cancellation requests list for admin.
 */
export const getAdminCancellationRequests = async (params = {}) => {
    const response = await api.get("/admin/orders/cancellations/", { params });
    return response.data;
};

/**
 * Fetch single cancellation request detail.
 */
export const getAdminCancellationDetail = async (cancellationId) => {
    const response = await api.get(`/admin/orders/cancellations/${cancellationId}/`);
    return response.data;
};

/**
 * Approve cancellation request.
 */
export const approveCancellationRequest = async (cancellationId, data = {}) => {
    const response = await api.post(`/admin/orders/cancellations/${cancellationId}/approve/`, data);
    return response.data;
};

/**
 * Reject cancellation request.
 */
export const rejectCancellationRequest = async (cancellationId, data = {}) => {
    const response = await api.post(`/admin/orders/cancellations/${cancellationId}/reject/`, data);
    return response.data;
};
