import api from '../../../../api/axios';

/**
 * Service to handle variant image operations.
 */
export const fetchVariantImages = async (variantId) => {
    const response = await api.get(`/admin/products/variants/${variantId}/images/`);
    return response.data;
};

export const uploadVariantImages = async (variantId, formData, onUploadProgress) => {
    const response = await api.post(`/admin/products/variants/${variantId}/images/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
    });
    return response.data;
};

export const deleteVariantImage = async (variantId, imageId) => {
    const response = await api.delete(`/admin/products/variants/${variantId}/images/?image_id=${imageId}`);
    return response.data;
};

export const setVariantPrimaryImage = async (variantId, imageId) => {
    const response = await api.patch(`/admin/products/variants/${variantId}/images/`, { image_id: imageId });
    return response.data;
};

const imageService = {
    fetchVariantImages,
    uploadVariantImages,
    deleteVariantImage,
    setVariantPrimaryImage,
};

export default imageService;
