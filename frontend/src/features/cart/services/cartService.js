import api from '../../../api/axios';

/**
 * Service to handle customer cart operations.
 */
export const getCart = async () => {
    const response = await api.get('/customers/cart/');
    return response.data;
};

export const addToCart = async (variantId, quantity) => {
    const response = await api.post('/customers/cart/', {
        variant_id: variantId,
        quantity: quantity
    });
    return response.data;
};

export const updateCartItem = async (itemId, quantity, action) => {
    const response = await api.patch(`/customers/cart/${itemId}/`, {
        quantity: quantity,
        action: action
    });
    return response.data;
};

export const removeCartItem = async (itemId) => {
    const response = await api.delete(`/customers/cart/${itemId}/`);
    return response.data;
};

export const clearCart = async () => {
    const response = await api.delete('/customers/cart/clear/');
    return response.data;
};

export const validateCheckout = async () => {
    const response = await api.post('/customers/cart/validate-checkout/');
    return response.data;
};

const cartService = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    validateCheckout
};

export default cartService;
