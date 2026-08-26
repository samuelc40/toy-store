import api from '../../api/axios';

/**
 * Fetch profile data.
 * @returns {Promise<object>} response data
 */
export const getProfile = async () => {
    const response = await api.get('/auth/users/me/');
    return response.data;
};

/**
 * Update profile data (handles multipart/form-data for image uploads).
 * @param {FormData} formData
 * @returns {Promise<object>} response data
 */
export const updateProfile = async (formData) => {
    const response = await api.patch('/auth/users/me/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Change user password.
 * @param {object} data
 * @returns {Promise<object>} response data
 */
export const changePassword = async (data) => {
    const response = await api.patch('/auth/change-password/', data);
    return response.data;
};

/**
 * Fetch customer wallet balance and transactions.
 */
export const getWallet = async () => {
    const response = await api.get('/customers/wallet/');
    return response.data;
};

/**
 * Fetch paginated wallet transactions.
 */
export const getWalletTransactions = async (page = 1) => {
    const response = await api.get('/customers/wallet/transactions/', { params: { page } });
    return response.data;
};

