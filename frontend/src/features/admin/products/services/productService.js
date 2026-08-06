import api from '../../../../api/axios';

/**
 * Service to handle all product-related admin API requests.
 */
export const fetchProducts = async ({ page = 1, page_size = 10, search = '' }) => {
    const response = await api.get('/admin/products/', {
        params: {
            page,
            page_size,
            search,
        },
    });
    return response.data;
};

export const createProduct = async (productData) => {
    const response = await api.post('/admin/products/', productData);
    return response.data;
};

export const fetchProductById = async (id) => {
    const response = await api.get(`/admin/products/${id}/`);
    return response.data;
};

export const updateProduct = async (id, productData) => {
    const response = await api.patch(`/admin/products/${id}/`, productData);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/admin/products/${id}/`);
    return response.data;
};

export const toggleBlockProduct = async (id) => {
    const response = await api.patch(`/admin/products/${id}/block/`);
    return response.data;
};

export const fetchCategoriesForDropdown = async () => {
    // Fetch categories with large limit to display in select dropdown
    const response = await api.get('/admin/products/categories/', {
        params: {
            page: 1,
            page_size: 100,
        },
    });
    return response.data;
};

const productService = {
    fetchProducts,
    createProduct,
    fetchProductById,
    updateProduct,
    deleteProduct,
    toggleBlockProduct,
    fetchCategoriesForDropdown,
};

export default productService;
