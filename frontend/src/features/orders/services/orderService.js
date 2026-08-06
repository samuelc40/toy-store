import api from "../../../api/axios";

/**
 * Fetch customer orders listing with optional debounced search, status filter, and pagination.
 * @param {object} params { search, status, page, page_size }
 * @returns {Promise<object>} response data
 */
export const getOrders = async (params = {}) => {
    const response = await api.get("/customers/orders/", { params });
    return response.data;
};

/**
 * Fetch single order details by order ID.
 * @param {string} orderId
 * @returns {Promise<object>} response data
 */
export const getOrderDetails = async (orderId) => {
    const response = await api.get(`/customers/orders/${orderId}/`);
    return response.data;
};

/**
 * Cancel an entire order.
 * @param {string} orderId
 * @param {string} reason
 * @returns {Promise<object>} response data
 */
export const cancelOrder = async (orderId, reason = "") => {
    const response = await api.post(`/customers/orders/${orderId}/cancel/`, { reason });
    return response.data;
};

/**
 * Cancel an individual order item.
 * @param {string} itemId
 * @param {string} reason
 * @returns {Promise<object>} response data
 */
export const cancelOrderItem = async (itemId, reason = "") => {
    const response = await api.post(`/customers/orders/items/${itemId}/cancel/`, { reason });
    return response.data;
};

/**
 * Submit a return request for a delivered order.
 * @param {string} orderId
 * @param {object} payload { reason, description }
 * @returns {Promise<object>} response data
 */
export const requestReturn = async (orderId, payload) => {
    const response = await api.post(`/customers/orders/${orderId}/return/`, payload);
    return response.data;
};

/**
 * Download on-demand PDF invoice.
 * Safely validates response content type to prevent corrupt PDF downloads.
 * @param {string} orderId
 * @param {string} orderNumber
 */
export const downloadInvoice = async (orderId, orderNumber = "invoice") => {
    try {
        const response = await api.get(`/customers/orders/${orderId}/invoice/`, {
            responseType: "blob",
        });

        const contentType = response.headers["content-type"] || "application/pdf";

        // If backend returned a JSON error disguised as a blob
        if (contentType.includes("application/json")) {
            const text = await response.data.text();
            const errorJson = JSON.parse(text);
            throw new Error(errorJson.message || errorJson.detail || "Failed to download invoice.");
        }

        const isPdf = contentType.includes("pdf");
        const fileExt = isPdf ? "pdf" : "txt";

        const blob = new Blob([response.data], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Invoice_${orderNumber}.${fileExt}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        throw err;
    }
};
