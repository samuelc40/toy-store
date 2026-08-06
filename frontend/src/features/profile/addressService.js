import api from "../../api/axios";

/**
 * Fetch all addresses for the logged-in user.
 * @returns {Promise<object>} response data
 */
export const getAddresses = async () => {
    const response = await api.get("/auth/addresses/");
    return response.data;
};

/**
 * Create a new address.
 * @param {object} data
 * @returns {Promise<object>} response data
 */
export const createAddress = async (data) => {
    const response = await api.post("/auth/addresses/", data);
    return response.data;
};

/**
 * Update an existing address.
 * @param {string} id Address UUID
 * @param {object} data
 * @returns {Promise<object>} response data
 */
export const updateAddress = async (id, data) => {
    const response = await api.put(`/auth/addresses/${id}/`, data);
    return response.data;
};

/**
 * Delete an address.
 * @param {string} id Address UUID
 * @returns {Promise<object>} response data
 */
export const deleteAddress = async (id) => {
    const response = await api.delete(`/auth/addresses/${id}/`);
    return response.data;
};

/**
 * Set an address as the default address.
 * @param {string} id Address UUID
 * @returns {Promise<object>} response data
 */
export const setDefaultAddress = async (id) => {
    const response = await api.patch(`/auth/addresses/${id}/default/`);
    return response.data;
};
