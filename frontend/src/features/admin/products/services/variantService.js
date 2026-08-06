import api from '../../../../api/axios';

/**
 * Service to handle all product variant-related admin API requests.
 */
export const fetchVariants = async (productId) => {
    const response = await api.get(`/admin/products/${productId}/variants/`);
    return response.data;
};

export const createVariant = async (productId, variantData) => {
    const response = await api.post(`/admin/products/${productId}/variants/`, variantData);
    return response.data;
};

export const fetchVariantById = async (variantId) => {
    const response = await api.get(`/admin/products/variants/${variantId}/`);
    return response.data;
};

export const updateVariant = async (variantId, variantData) => {
    const response = await api.patch(`/admin/products/variants/${variantId}/`, variantData);
    return response.data;
};

export const deleteVariant = async (variantId) => {
    const response = await api.delete(`/admin/products/variants/${variantId}/`);
    return response.data;
};

export const toggleBlockVariant = async (variantId) => {
    const response = await api.patch(`/admin/products/variants/${variantId}/block/`);
    return response.data;
};

const variantService = {
    fetchVariants,
    createVariant,
    fetchVariantById,
    updateVariant,
    deleteVariant,
    toggleBlockVariant,
};

export default variantService;
