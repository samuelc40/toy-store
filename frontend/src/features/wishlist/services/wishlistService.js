import api from '../../../api/axios';

/**
 * Service handling customer Wishlist API calls.
 */
export const getWishlist = async () => {
    const response = await api.get('/customers/wishlist/');
    return response.data;
};

export const addToWishlist = async (productId) => {
    const response = await api.post('/customers/wishlist/', { product_id: productId });
    return response.data;
};

export const removeFromWishlist = async (productId) => {
    const response = await api.delete(`/customers/wishlist/${productId}/`);
    return response.data;
};

const wishlistService = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
};

export default wishlistService;
