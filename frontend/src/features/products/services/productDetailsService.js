import api from '../../../api/axios';

/**
 * Service to handle customer facing product details API requests.
 */
export const fetchProductDetails = async (productId) => {
    const response = await api.get(`/customers/products/${productId}/`);
    return response.data;
};

const productDetailsService = {
    fetchProductDetails,
};

export default productDetailsService;
