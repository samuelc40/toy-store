import api from '../../../api/axios';

/**
 * Service to handle customer facing product catalog API requests.
 */
export const fetchProductsList = async (params) => {
    // Send all filter, sorting, search and paging parameters to the backend
    const response = await api.get('/customers/products/', { params });
    return response.data;
};

export const fetchProductCategories = async () => {
    const response = await api.get('/customers/categories/');
    return response.data;
};

const productListingService = {
    fetchProductsList,
    fetchProductCategories,
};

export default productListingService;
