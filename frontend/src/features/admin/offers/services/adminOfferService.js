import api from "../../../../api/axios";

// Product Offers API
export const getProductOffers = async (params = {}) => {
    const response = await api.get("/admin/offers/products/", { params });
    return response.data;
};

export const createProductOffer = async (payload) => {
    const response = await api.post("/admin/offers/products/", payload);
    return response.data;
};

export const updateProductOffer = async (offerId, payload) => {
    const response = await api.put(`/admin/offers/products/${offerId}/`, payload);
    return response.data;
};

export const toggleProductOfferStatus = async (offerId, isActive) => {
    const response = await api.patch(`/admin/offers/products/${offerId}/`, { is_active: isActive });
    return response.data;
};

export const deleteProductOffer = async (offerId) => {
    const response = await api.delete(`/admin/offers/products/${offerId}/`);
    return response.data;
};


// Category Offers API
export const getCategoryOffers = async (params = {}) => {
    const response = await api.get("/admin/offers/categories/", { params });
    return response.data;
};

export const createCategoryOffer = async (payload) => {
    const response = await api.post("/admin/offers/categories/", payload);
    return response.data;
};

export const updateCategoryOffer = async (offerId, payload) => {
    const response = await api.put(`/admin/offers/categories/${offerId}/`, payload);
    return response.data;
};

export const toggleCategoryOfferStatus = async (offerId, isActive) => {
    const response = await api.patch(`/admin/offers/categories/${offerId}/`, { is_active: isActive });
    return response.data;
};

export const deleteCategoryOffer = async (offerId) => {
    const response = await api.delete(`/admin/offers/categories/${offerId}/`);
    return response.data;
};


// Referral Offer Configuration API
export const getReferralConfig = async () => {
    const response = await api.get("/admin/offers/referral-config/");
    return response.data;
};

export const updateReferralConfig = async (payload) => {
    const response = await api.put("/admin/offers/referral-config/", payload);
    return response.data;
};

